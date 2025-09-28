import { pool } from "../config/database.js";
import { razorpayHelper, getTablePrice } from "../utils/helpers.js";
import dayjs from "dayjs";
import { validateBusinessHours } from "../utils/helpers.js";

class TableContoller {
  async checkTableAvailability(req, res) {
    try {
      const { bookingDate, startTime, endTime, partySize } = req.body;
      const now = dayjs();
      if (!bookingDate || !partySize || !startTime || !endTime) {
        return res.status(400).json({
          type: "error",
          message:
            "Missing required parameters: date, partySize, startTime, endTime"
        });
      }

      const bookingDay = dayjs(bookingDate);
      if (bookingDay.isBefore(now, "day")) {
        return res.status(400).json({
          type: "error",
          message: "Cannot book a table for a past date"
        });
      }

      const start = dayjs(startTime, "HH:mm");
      const end = dayjs(endTime, "HH:mm");
      if (start.isAfter(end)) {
        return res.status(400).json({
          type: "error",
          message: "Start time must be before end time"
        });
      }

      // If booking is for today, check that start time is not in the past
      if (bookingDay.isSame(now, "day")) {
        const startDateTime = dayjs(
          `${now.format("YYYY-MM-DD")} ${startTime}`,
          "YYYY-MM-DD HH:mm"
        );
        if (startDateTime.isBefore(now)) {
          return res.status(400).json({
            type: "error",
            message: "Start time must be later than the current time"
          });
        }
      }

      // Query to find available tables
      const query = `
        SELECT t.id, t.table_number, t.capacity, t.location
        FROM tables t
        WHERE t.status = 'active'
        AND t.capacity >= ?
        AND t.id NOT IN (
          SELECT b.table_id 
          FROM table_bookings b 
          WHERE b.booking_date = ?
          AND b.status = 'confirmed'
          AND (
            (b.start_time <= ? AND b.end_time > ?) OR
            (b.start_time < ? AND b.end_time >= ?) OR
            (b.start_time >= ? AND b.end_time <= ?) OR
            (b.start_time <= ? AND b.end_time >= ?)
          )
        )
        ORDER BY t.capacity ASC;
      `;

      const [tables] = await pool.execute(query, [
        parseInt(partySize),
        bookingDate,
        startTime,
        startTime, // Case 1
        endTime,
        endTime, // Case 2
        startTime,
        endTime, // Case 3
        startTime,
        endTime // Case 4
      ]);

      return res.status(200).json({
        type: "success",
        tables
      });
    } catch (error) {
      console.error("Error checking table availability:", error);
      res.status(500).json({
        type: "error",
        message: "Internal server error"
      });
    }
  }

  async makeTableOrder(req, res) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const userId = req.userId;
      const { tableId, bookingDate, startTime, endTime, partySize } = req.body;

      // Input validation
      if (!tableId || !bookingDate || !startTime || !endTime || !partySize) {
        return res.status(400).json({
          type: "error",
          message:
            "Missing required fields: tableId, bookingDate, startTime, endTime, partySize"
        });
      }

      // Validate data types
      if (!Number.isInteger(Number(tableId)) || Number(tableId) <= 0) {
        return res.status(400).json({
          type: "error",
          message: "Invalid table ID"
        });
      }

      if (!Number.isInteger(Number(partySize)) || Number(partySize) <= 0) {
        return res.status(400).json({
          type: "error",
          message: "Party size must be a positive integer"
        });
      }

      // Validate date format
      if (!dayjs(bookingDate).isValid()) {
        return res.status(400).json({
          type: "error",
          message: "Invalid booking date format"
        });
      }

      // Validate time format (HH:mm)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return res.status(400).json({
          type: "error",
          message: "Invalid time format. Use HH:mm format"
        });
      }

      // Validate that end time is after start time
      if (startTime >= endTime) {
        return res.status(400).json({
          type: "error",
          message: "End time must be after start time"
        });
      }

      // Format date and check for past date
      const formattedDate = dayjs(bookingDate).format("YYYY-MM-DD");

      if (dayjs(formattedDate).isBefore(dayjs(), "day")) {
        return res.status(400).json({
          type: "error",
          message: "Cannot book a table for a past date"
        });
      }

      // Check if table exists and is active
      const [tableCheck] = await connection.query(
        `SELECT id, table_number, capacity, status FROM tables WHERE id = ?`,
        [tableId]
      );

      if (!tableCheck.length) {
        return res.status(404).json({
          type: "error",
          message: "Table not found"
        });
      }

      if (tableCheck[0].status !== "active") {
        return res.status(400).json({
          type: "error",
          message: "Selected table is not available for booking"
        });
      }

      // Check if the number of people doesn't exceed the table capacity
      if (partySize > tableCheck[0].capacity) {
        return res.status(400).json({
          type: "error",
          message: `This table can only accommodate ${tableCheck[0].capacity} people`
        });
      }

      // Get table price
      const amount = getTablePrice(formattedDate, startTime, endTime);

      // Check table availability for the requested time slot
      const [existingBookings] = await connection.query(
        `SELECT id FROM table_bookings
       WHERE table_id = ?
       AND booking_date = ?
       AND status = 'CONFIRMED'
       AND NOT (end_time <= ? OR start_time >= ?)`,
        [tableId, formattedDate, startTime, endTime]
      );

      if (existingBookings.length) {
        return res.status(409).json({
          type: "error",
          message: "The table is not available for the selected time slot"
        });
      }

      // Check for existing pending booking with payment
      const [existingBooking] = await connection.query(
        `SELECT b.id, p.transaction_id, p.amount
       FROM table_bookings b
       JOIN table_booking_payments p ON b.id = p.booking_id
       WHERE b.user_id = ?
       AND b.table_id = ?
       AND b.booking_date = ?
       AND b.start_time = ?
       AND b.end_time = ?
       AND p.payment_status = 'PENDING'
       ORDER BY b.created_at DESC
       LIMIT 1`,
        [userId, tableId, formattedDate, startTime, endTime]
      );

      if (existingBooking.length) {
        const {
          id: bookingId,
          transaction_id,
          amount: existingAmount
        } = existingBooking[0];

        // If amount has changed, update the payment amount
        if (Number(amount) !== Number(existingAmount)) {
          await connection.query(
            `UPDATE table_booking_payments SET amount = ?, updated_at = NOW()
           WHERE booking_id = ? AND payment_status = 'PENDING'`,
            [amount, bookingId]
          );
        }

        await connection.commit();

        return res.status(200).json({
          type: "success",
          bookingId: bookingId,
          orderId: transaction_id,
          amount: Number(amount) * 100,
          currency: "INR",
          message: "Existing pending booking payment"
        });
      }

      // Create new booking
      const [bookingResult] = await connection.query(
        `INSERT INTO table_bookings (
        table_id,
        table_number,
        booking_date,
        start_time,
        end_time,
        number_of_people,
        user_id,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
        [
          tableId,
          tableCheck[0].table_number,
          formattedDate,
          startTime,
          endTime,
          partySize,
          userId
        ]
      );

      const bookingId = bookingResult.insertId;

      // Create Razorpay order for the table booking
      const razorpayOrder = await razorpayHelper.orders.create({
        amount: Math.round(Number(amount) * 100),
        currency: "INR",
        receipt: `table_booking_rcpt_${bookingId}_${Date.now()}`
      });

      // Create payment record
      await connection.query(
        `INSERT INTO table_booking_payments (
        booking_id,
        user_id,
        amount,
        currency,
        transaction_id,
        payment_status
      ) VALUES (?, ?, ?, ?, ?, 'PENDING')`,
        [bookingId, userId, amount, "INR", razorpayOrder.id]
      );

      await connection.commit();

      return res.status(201).json({
        type: "success",
        message: "Table booking initiated",
        bookingId,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        artifact: "TABLE"
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error booking table:", error);
      return res.status(500).json({
        type: "error",
        message: "Failed to book table",
        error: process.env.NODE_ENV === "production" ? undefined : error.message
      });
    } finally {
      connection.release();
    }
  }

  async getTableBookings(req, res) {
    const connection = await pool.getConnection();
    try {
      const userId = req.userId;
      const bookings = await connection.query(
        `
        SELECT 
          tb.id, 
          tb.table_id, 
          tb.table_number,
          tb.booking_date, 
          tb.start_time, 
          tb.end_time, 
          tb.number_of_people, 
          tb.status, 
          tb.updated_at,
          tbp.amount,
          tbp.currency,
          tbp.transaction_id,
          tbp.payment_status,
          tbp.payment_method,
          tbp.payment_date
        FROM 
          table_bookings tb
        LEFT JOIN 
          table_booking_payments tbp ON tb.id = tbp.booking_id
        WHERE 
          tb.user_id = ?
        ORDER BY 
          tb.updated_at DESC, tb.start_time ASC
      `,
        [userId]
      );

      if (!bookings.length) {
        return res.status(404).json({
          type: "error",
          message: "No bookings found for this user"
        });
      }

      return res.status(200).json({
        type: "success",
        bookings: bookings[0]
      });
    } catch (error) {
      console.error("Error in getTableBookings:", error);
      return res.status(500).json({
        type: "error",
        message: "Failed to retrieve table bookings",
        error: error.message
      });
    }
  }
}

const tableController = new TableContoller();
export default tableController;
