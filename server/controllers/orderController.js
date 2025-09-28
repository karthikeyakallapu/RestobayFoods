import { pool } from "../config/database.js";
import { razorpayHelper } from "../utils/helpers.js";
import crypto from "crypto";


class OrderController {
  makeOrder = async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const userId = req.userId;

      // Lock user row to prevent concurrent order creation
      await connection.query(`SELECT id FROM users WHERE id = ? FOR UPDATE`, [
        userId
      ]);

      // Get the latest cart total & items
      const [cart] = await connection.query(
        `SELECT c.id as cart_id, SUM(ci.price * ci.quantity) AS total
        FROM carts c
        JOIN cart_items ci ON c.id = ci.cart_id
        WHERE c.user_id = ?
        GROUP BY c.id
        FOR UPDATE;`, // <-- row lock here
        [userId]
      );

      if (!cart.length) {
        await connection.rollback();
        return res.status(404).json({ message: "Cart not found or empty" });
      }

      const { cart_id, total } = cart[0];

      // Cancel existing pending payments
      const [existingPayment] = await connection.query(
        `SELECT op.id, op.order_id, op.transaction_id
       FROM order_payments op
       JOIN orders o ON op.order_id = o.id
       WHERE op.user_id = ? 
       AND op.payment_status = 'PENDING'
       AND o.status = 'OPEN'
       AND op.created_at > DATE_SUB(NOW(), INTERVAL 30 MINUTE)
       ORDER BY op.created_at DESC 
       LIMIT 1
       FOR UPDATE`,
        [userId]
      );

      // If existing pending payment found, cancel it
      if (existingPayment.length) {
        // Cancel in single transaction
        await connection.query(
          `UPDATE order_payments op
         JOIN orders o ON op.order_id = o.id
         SET op.payment_status = 'FAILED',
             op.updated_at = NOW(),
             o.status = 'CANCELLED',
             o.updated_at = NOW()
         WHERE op.id = ?`,
          [existingPayment[0].id]
        );
      }

      // Create order in database first
      const [orderResult] = await connection.query(
        `INSERT INTO orders (user_id, total_amount, status, created_at, updated_at) 
       VALUES (?, ?, 'OPEN', NOW(), NOW())`,
        [userId, total]
      );

      const orderId = orderResult.insertId;

      // Get cart items
      const [cartData] = await connection.query(
        `SELECT ci.item_id, ci.price, ci.quantity
       FROM cart_items ci
       WHERE ci.cart_id = ?`,
        [cart_id]
      );

      // Insert order items
      const orderItemsValues = cartData.map((item) => [
        orderId,
        item.item_id,
        item.price,
        item.quantity
      ]);

      await connection.query(
        `INSERT INTO order_items (order_id, item_id, price, quantity)
       VALUES ?`,
        [orderItemsValues]
      );

      // Create Razorpay order

      let razorpayOrder;
      try {
        razorpayOrder = await razorpayHelper.orders.create({
          amount: Math.round(total * 100),
          currency: "INR",
          receipt: `order_${orderId}`,
          notes: {
            order_id: orderId,
            user_id: userId
          }
        });
      } catch (razorpayError) {
        // Rollback if payment gateway fails
        await connection.rollback();
        console.error("Razorpay order creation failed:", razorpayError);
        return res.status(503).json({
          success: false,
          message: "Payment gateway temporarily unavailable"
        });
      }

      // Insert payment record
      await connection.query(
        `INSERT INTO order_payments (
          user_id,
          order_id,
          amount,
          currency,
          transaction_id,
          payment_status,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, 'PENDING', NOW(), NOW());`,
        [userId, orderId, total, "INR", razorpayOrder.id]
      );

      // Clear cart after successful order creation
      await connection.query(`DELETE FROM cart_items WHERE cart_id = ?`, [
        cart_id
      ]);

      // Commit transaction
      await connection.commit();

      // Log successful order creation
      console.log(`Order created successfully: ${orderId} for user: ${userId}`);

      return res.status(200).json({
        success: true,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error creating order:", error);

      // Distinguish between different error types
      if (error.code === "ER_LOCK_DEADLOCK") {
        return res.status(503).json({
          success: false,
          message: "System busy, please try again"
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to create order",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined
      });
    } finally {
      connection.release();
    }
  };

  // Helper method for table booking payment verification
  verifyTableBookingPayment = async (
    connection,
    userId,
    orderCreationId,
    razorpayPaymentId,
    res
  ) => {
    try {
      // Find and lock the table booking payment record
      const [paymentRecord] = await connection.query(
        `SELECT 
        bp.id, 
        bp.booking_id, 
        bp.amount, 
        bp.payment_status,
        tb.user_id,
        tb.status as booking_status
       FROM table_booking_payments bp
       JOIN table_bookings tb ON bp.booking_id = tb.id
       WHERE bp.transaction_id = ? AND tb.user_id = ?
       FOR UPDATE`,
        [orderCreationId, userId]
      );

      if (!paymentRecord.length) {
        await connection.rollback();
        return res.status(404).json({
          status: "error",
          message: "Table booking payment record not found"
        });
      }

      const {
        id: paymentId,
        booking_id: bookingId,
        payment_status,
        booking_status
      } = paymentRecord[0];

      // Check if already processed
      if (payment_status === "COMPLETED") {
        await connection.commit();
        return res.status(200).json({
          status: "success",
          message: "Table booking payment already verified",
          bookingId,
          duplicate: true
        });
      }

      // Update payment record
      await connection.query(
        `UPDATE table_booking_payments 
       SET 
         payment_status = 'COMPLETED',
         transaction_id = ?,
         payment_method = 'razorpay',
         payment_date = NOW(),
         updated_at = NOW()
       WHERE id = ?`,
        [razorpayPaymentId, paymentId]
      );

      // Update booking status
      await connection.query(
        `UPDATE table_bookings 
       SET 
         status = 'CONFIRMED',
         updated_at = NOW()
       WHERE id = ?`,
        [bookingId]
      );

      await connection.commit();

      return res.status(200).json({
        status: "success",
        message: "Table booking payment verified successfully",
        bookingId,
        paymentId: razorpayPaymentId,
        artifact: "TABLE"
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  };

  verifyPayment = async (req, res) => {
    const connection = await pool.getConnection();
    try {
      const userId = req.userId;
      await connection.beginTransaction();

      // Extract payment details from request body
      const {
        orderCreationId,
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
        artifact
      } = req.body;

      // Validate required fields
      if (!orderCreationId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({
          status: "error",
          message: "Missing required payment verification fields"
        });
      }

      // Verify Razorpay signature
      const text = orderCreationId + "|" + razorpayPaymentId;
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        console.log(`Payment verification failed for user ${userId}:`, {
          orderCreationId,
          razorpayPaymentId,
          providedSignature: razorpaySignature,
          expectedSignature: generatedSignature
        });

        await connection.rollback();
        return res.status(400).json({
          status: "error",
          message: "Payment verification failed - Invalid signature"
        });
      }

      if (artifact === "TABLE") {
        return await this.verifyTableBookingPayment(
          connection,
          userId,
          orderCreationId,
          razorpayPaymentId,
          res
        );
      }

      // lock and check the payment record
      const [paymentRecord] = await connection.query(
        `SELECT 
        op.id as payment_id,
        op.order_id,
        op.payment_status,
        op.amount,
        o.status as order_status,
        o.total_amount
        FROM order_payments op
        JOIN orders o ON op.order_id = o.id
        WHERE op.transaction_id = ? AND op.user_id = ?
        FOR UPDATE`,
        [orderCreationId, userId]
      );

      if (!paymentRecord.length) {
        await connection.rollback();
        return res.status(404).json({
          status: "error",
          message: "Payment record not found"
        });
      }

      const { payment_id, order_id, payment_status, amount, order_status } =
        paymentRecord[0];

      // Check if payment is already processed
      // Check for duplicate verification
      if (payment_status === "COMPLETED") {
        await connection.commit();
        return res.status(200).json({
          status: "success",
          message: "Payment already verified and completed",
          orderId: order_id,
          duplicate: true
        });
      }

      // Check if payment was already marked as failed
      if (payment_status === "FAILED" || order_status === "CANCELLED") {
        await connection.rollback();
        return res.status(400).json({
          status: "error",
          message: "Cannot verify payment for cancelled order"
        });
      }

      // Fetch payment details from Razorpay for additional verification
      let razorpayPaymentDetails;
      try {
        razorpayPaymentDetails = await razorpayHelper.payments.fetch(
          razorpayPaymentId
        );

        // Verify amount matches
        if (razorpayPaymentDetails.amount !== Math.round(amount * 100)) {
          console.log("Amount mismatch:", {
            expected: Math.round(amount * 100),
            received: razorpayPaymentDetails.amount
          });

          await connection.rollback();
          return res.status(400).json({
            status: "error",
            message: "Payment amount mismatch"
          });
        }

        // Verify payment status with Razorpay
        if (
          razorpayPaymentDetails.status !== "captured" &&
          razorpayPaymentDetails.status !== "authorized"
        ) {
          await connection.rollback();
          return res.status(400).json({
            status: "error",
            message: `Payment not successful. Status: ${razorpayPaymentDetails.status}`
          });
        }
      } catch (razorpayError) {
        console.log("Error fetching payment from Razorpay:", razorpayError);
        await connection.rollback();
        return res.status(503).json({
          status: "error",
          message: "Failed to verify payment with payment gateway"
        });
      }

      // Update payment record
      await connection.query(
        `UPDATE order_payments 
       SET 
         payment_status = 'COMPLETED',
         transaction_id = ?,
         payment_method = ?,
         payment_date = NOW(),
         updated_at = NOW(),
         verification_signature = ?
       WHERE id = ?`,
        [
          razorpayPaymentId,
          razorpayPaymentDetails?.method || "razorpay",
          razorpaySignature,
          payment_id
        ]
      );

      // Update order status
      await connection.query(
        `UPDATE orders 
         SET 
         status = 'INPROGRESS',
         updated_at = NOW()
         WHERE id = ?`,
        [order_id]
      );

      await connection.query(
        `UPDATE order_items   
         SET 
         status = 'INPROGRESS',
         updated_at = NOW()
         WHERE order_id = ?`,
        [order_id]
      );

      // After successful updates
      await connection.commit();

      return res.status(200).json({
        status: "success",
        message: "Payment verified successfully",
        orderId: order_id,
        paymentId: razorpayPaymentId,
        amount: amount
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error verifying payment:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to verify payment",
        error: process.env.NODE_ENV === "production" ? undefined : error.message
      });
    } finally {
      connection.release();
    }
  };

  // Retrieves order details by ID
  getOrders = async (req, res) => {
    try {
      const userId = req.userId;
      const { status, payment_status, limit = 50, offset = 0 } = req.query;

      // Build dynamic WHERE clause
      let whereConditions = ["o.user_id = ?", "o.deleted_at IS NULL"];
      let queryParams = [userId];

      if (status) {
        whereConditions.push("o.status = ?");
        queryParams.push(status);
      }

      if (payment_status) {
        whereConditions.push("op.payment_status = ?");
        queryParams.push(payment_status);
      }

      // Add pagination params
      queryParams.push(parseInt(limit), parseInt(offset));

      const [orders] = await pool.query(
        `SELECT 
         o.id,
         o.user_id,
         o.total_amount,
         o.status as order_status,
         o.created_at,
         o.updated_at,
         -- Payment information
         op.id as payment_id,
         op.transaction_id,
         op.payment_status,
         op.payment_method,
         op.payment_date,
         op.currency,
         -- Aggregated items
         JSON_ARRAYAGG(
           JSON_OBJECT(
             'id', oi.id,
             'item_id', oi.item_id,
             'name', m.name,
             'price', oi.price,
             'quantity', oi.quantity,
             'subtotal', oi.price * oi.quantity
           )
         ) AS items
       FROM orders o
       LEFT JOIN order_payments op ON o.id = op.order_id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN menu m ON oi.item_id = m.id
       WHERE ${whereConditions.join(" AND ")}
       GROUP BY o.id, op.id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
        queryParams
      );

      // Format the response for better structure
      const formattedOrders = orders.map((order) => ({
        id: order.id,
        userId: order.user_id,
        total_amount: order.total_amount,
        status: order.order_status,
        created_at: order.created_at,
        updated_at: order.updated_at,
        payment: order.payment_id
          ? {
              id: order.payment_id,
              transactionId: order.transaction_id,
              status: order.payment_status,
              method: order.payment_method,
              date: order.payment_date,
              currency: order.currency
            }
          : null,
        items: order.items || []
      }));

      // Get total count for pagination
      const [countResult] = await pool.query(
        `SELECT COUNT(DISTINCT o.id) as total
       FROM orders o
       LEFT JOIN order_payments op ON o.id = op.order_id
       WHERE ${whereConditions.join(" AND ")}`,
        queryParams.slice(0, -2) // Remove limit and offset params
      );

      return res.status(200).json({
        success: true,
        orders: formattedOrders,
        pagination: {
          total: countResult[0].total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore:
            parseInt(offset) + formattedOrders.length < countResult[0].total
        }
      });
    } catch (error) {
      console.error("Error retrieving orders:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve orders",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  };
}

const orderController = new OrderController();

export default orderController;
