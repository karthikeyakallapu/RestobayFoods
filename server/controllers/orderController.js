import { pool } from "../config/database.js";
import { razorpayHelper } from "../utils/helpers.js";
import { getSuccessPaymentStatus } from "../utils/paymentStatusResolver.js";
import crypto from "crypto";

class OrderController {
  async makeOrder(req, res) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const userId = req.userId;

      // Lock cart
      const [cartRows] = await connection.query(
        `SELECT id
       FROM CARTS
       WHERE user_id = ?
       FOR UPDATE`,
        [userId],
      );

      if (!cartRows.length) {
        await connection.rollback();
        return res.status(404).json({ message: "Cart not found" });
      }

      const cartId = cartRows[0].id;

      // Get cart items
      const [cartItems] = await connection.query(
        `SELECT item_id, price, quantity
       FROM CART_ITEMS
       WHERE cart_id = ?`,
        [cartId],
      );

      if (!cartItems.length) {
        await connection.rollback();
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Calculate total
      const total = cartItems.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0,
      );

      // Check existing pending order
      const [existingOrders] = await connection.query(
        `SELECT id, transaction_id, total_amount
       FROM ORDERS
       WHERE user_id = ?
       AND status = 'PAYMENT_PENDING'
       AND payment_status = 'PENDING'
       ORDER BY created_at DESC
       LIMIT 1`,
        [userId],
      );
      let orderId;

      if (existingOrders.length) {
        const existing = existingOrders[0];
        orderId = existing.id;

        // Update amount if changed
        if (Number(existing.total_amount) !== Number(total)) {
          await connection.query(
            `UPDATE ORDERS
           SET total_amount = ?, updated_at = NOW()
           WHERE id = ?`,
            [total, orderId],
          );
        }

        // Replace order items
        await connection.query(`DELETE FROM ORDER_ITEMS WHERE order_id = ?`, [
          orderId,
        ]);

        const orderItemsValues = cartItems.map((item) => [
          orderId,
          item.item_id,
          item.price,
          item.quantity,
        ]);

        await connection.query(
          `INSERT INTO ORDER_ITEMS (order_id, item_id, price, quantity)
         VALUES ?`,
          [orderItemsValues],
        );
      } else {
        // Create order
        const [orderResult] = await connection.query(
          `INSERT INTO ORDERS (
          user_id,
          total_amount,
          status,
          payment_status
        )
        VALUES (?, ?, 'PAYMENT_PENDING', 'PENDING')`,
          [userId, total],
        );

        orderId = orderResult.insertId;

        const orderItemsValues = cartItems.map((item) => [
          orderId,
          item.item_id,
          item.price,
          item.quantity,
        ]);

        await connection.query(
          `INSERT INTO ORDER_ITEMS (order_id, item_id, price, quantity)
         VALUES ?`,
          [orderItemsValues],
        );
      }

      await connection.commit();

      // Create Razorpay order AFTER transaction
      const razorpayOrder = await razorpayHelper.orders.create({
        amount: Math.round(total * 100),
        currency: "INR",
        receipt: `order_${orderId}_${Date.now()}`,
      });

      // Update transaction id
      await pool.query(
        `UPDATE ORDERS
       SET transaction_id = ?
       WHERE id = ?`,
        [razorpayOrder.id, orderId],
      );

      return res.status(200).json({
        success: true,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error creating order:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create order",
        error:
          process.env.NODE_ENV === "production" ? undefined : error.message,
      });
    } finally {
      connection.release();
    }
  }

  async verifyPayment(req, res) {
    const connection = await pool.getConnection();
    try {
      const userId = req.userId;
      await connection.beginTransaction();
      const {
        orderCreationId,
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
        artifact,
      } = req.body;

      // Verify signature
      const text = orderCreationId + "|" + razorpayPaymentId;
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        await connection.rollback();
        return res.status(400).json({
          status: "error",
          message: "Payment verification failed",
        });
      }

      if (artifact === "TABLE") {
        const bookingSuccessStatus = await getSuccessPaymentStatus(
          "TABLE_BOOKING_PAYMENTS",
        );

        // Find the table booking payment record
        const [paymentRecord] = await connection.query(
          `SELECT bp.id, bp.booking_id, bp.amount, bp.payment_status, tb.user_id 
           FROM TABLE_BOOKING_PAYMENTS bp
           JOIN TABLE_BOOKINGS tb ON bp.booking_id = tb.id
           WHERE bp.transaction_id = ? AND tb.user_id = ?`,
          [orderCreationId, userId],
        );

        if (!paymentRecord.length) {
          await connection.rollback();
          return res.status(404).json({
            status: "error",
            message: "Table booking payment record not found",
          });
        }

        const {
          id: paymentId,
          booking_id: bookingId,
          payment_status,
        } = paymentRecord[0];

        // Check if payment is already processed
        if (["SUCCESS", "COMPLETED"].includes(payment_status)) {
          await connection.rollback();
          return res.status(200).json({
            status: "success",
            message: "Payment already verified and completed",
            bookingId,
          });
        }

        // Update payment details
        await connection.query(
          `UPDATE TABLE_BOOKING_PAYMENTS 
           SET payment_status = ?, 
               updated_at = NOW() 
           WHERE id = ?`,
          [bookingSuccessStatus, paymentId],
        );

        await connection.query(
          `UPDATE TABLE_BOOKINGS 
           SET status = 'CONFIRMED', 
           updated_at = NOW() 
           WHERE id = ?`,
          [bookingId],
        );

        await connection.commit();

        return res.status(200).json({
          status: "success",
          message: "Table booking payment verified successfully",
          bookingId,
          paymentId: razorpayPaymentId,
          artifact: "TABLE",
        });
      }

      const orderSuccessStatus = await getSuccessPaymentStatus("ORDERS");

      // Update order status
      const [updateResult] = await connection.query(
        `UPDATE ORDERS 
         SET 
           status = 'CONFIRMED', 
           payment_status = ?,
           transaction_id = ?,
           updated_at = NOW()
         WHERE transaction_id = ?
           AND payment_status = 'PENDING'`,
        [orderSuccessStatus, razorpayPaymentId, razorpayOrderId],
      );

      // If no rows were updated, order may already be processed or not found
      if (updateResult.affectedRows === 0) {
        const [alreadyProcessed] = await connection.query(
          `SELECT id
           FROM ORDERS
           WHERE transaction_id IN (?, ?)
             AND status = 'CONFIRMED'
             AND payment_status = ?
           LIMIT 1`,
          [razorpayOrderId, razorpayPaymentId, orderSuccessStatus],
        );

        if (!alreadyProcessed.length) {
          await connection.rollback();
          return res.status(404).json({
            status: "error",
            message: "Order not found",
          });
        }

        await connection.commit();
        return res.status(200).json({
          status: "success",
          message: "Payment already verified successfully",
          orderId: alreadyProcessed[0].id,
        });
      }

      // Fetch the updated order ID
      const [orderRows] = await connection.query(
        "SELECT id FROM ORDERS WHERE transaction_id = ?",
        [razorpayPaymentId],
      );

      if (!orderRows.length) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: "Order not found after update",
        });
      }

      // Delete cart items after successful payment
      await connection.query(
        `DELETE FROM CART_ITEMS WHERE cart_id = (
          SELECT id FROM CARTS WHERE user_id = ?)`,
        [userId],
      );

      const orderId = orderRows[0].id;

      await connection.commit();

      return res.status(200).json({
        status: "success",
        message: "Payment verified successfully",
        orderId: orderId,
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error verifying payment:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to verify payment",
        error:
          process.env.NODE_ENV === "production" ? undefined : error.message,
      });
    } finally {
      connection.release();
    }
  }

  /**
   * Handle order cancellation
   */
  async cancelOrder(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { orderId } = req.params;
      const userId = req.userId;

      // Check if order exists and belongs to user
      const [orderCheck] = await connection.query(
        `SELECT status, payment_status FROM orders 
         WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
        [orderId, userId],
      );

      if (!orderCheck.length) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      const { status, payment_status } = orderCheck[0];

      // Check if order can be cancelled
      const cancellableStatuses = ["PENDING", "PAYMENT_PENDING", "PROCESSING"];

      if (!cancellableStatuses.includes(status)) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Cannot cancel an order with status: ${status}`,
        });
      }

      // Update order status
      await connection.query(
        `UPDATE orders SET status = 'CANCELLED', updated_at = NOW() WHERE id = ?`,
        [orderId],
      );

      // If payment was completed, initiate refund through Razorpay
      if (["COMPLETED", "SUCCESS"].includes(payment_status)) {
        // You would implement Razorpay refund logic here
        // For now, just update the status
        await connection.query(
          `UPDATE orders SET payment_status = 'REFUNDED' WHERE id = ?`,
          [orderId],
        );
      }

      await connection.commit();

      return res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error cancelling order:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to cancel order",
        error:
          process.env.NODE_ENV === "production" ? undefined : error.message,
      });
    } finally {
      connection.release();
    }
  }

  /**
   * Retrieves order details by ID
   */

  async getOrders(req, res) {
    try {
      const userId = req.userId;
      const [orders] = await pool.query(
        `SELECT 
           o.id, o.user_id, o.total_amount, o.status,
           o.payment_status,
           o.created_at, o.updated_at,
           JSON_ARRAYAGG(
             JSON_OBJECT(
               'id', oi.id,
               'item_id', oi.item_id,
               'name', m.name, -- Get item name from menu table
               'price', oi.price,
               'quantity', oi.quantity
             )
           ) AS items
         FROM ORDERS o
         LEFT JOIN ORDER_ITEMS oi ON o.id = oi.order_id
         LEFT JOIN MENU m ON oi.item_id = m.id -- Join menu table to get item name
         WHERE o.user_id = ?  
         GROUP BY o.id
         ORDER BY o.created_at DESC`,
        [userId],
      );

      return res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      console.error("Error retrieving orders:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve orders",
        error:
          process.env.NODE_ENV === "production" ? undefined : error.message,
      });
    }
  }

  async getOrderById(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.userId;

      const [orderResults] = await pool.query(
        `SELECT 
           o.id, o.user_id, o.total_amount, o.subtotal,
           o.tax_amount, o.discount_amount, o.status,
           o.payment_status, o.transaction_id,
           o.created_at, o.updated_at, o.payment_completed_at,
           JSON_ARRAYAGG(
             JSON_OBJECT(
               'id', oi.id,
               'product_id', oi.product_id,
               'price', oi.price,
               'quantity', oi.quantity
             )
           ) as items
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         WHERE o.id = ? AND o.user_id = ? AND o.deleted_at IS NULL
         GROUP BY o.id`,
        [orderId, userId],
      );

      if (!orderResults.length) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      return res.status(200).json({
        success: true,
        order: orderResults[0],
      });
    } catch (error) {
      console.error("Error retrieving order:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve order",
        error:
          process.env.NODE_ENV === "production" ? undefined : error.message,
      });
    }
  }
}

const orderController = new OrderController();

export default orderController;
