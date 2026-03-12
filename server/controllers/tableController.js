import { pool } from "../config/database.js";
import { razorpayHelper, getTablePrice } from "../utils/helpers.js";
import dayjs from "dayjs";
class TableController {
  async checkTableAvailability(req, res) {
    try {
      const { bookingDate, startTime, endTime, partySize } = req.body;
      const now = dayjs();

      if (!bookingDate || !partySize || !startTime || !endTime) {
        return res.status(400).json({
          type: "error",
          message:
            "Missing required parameters: date, partySize, startTime, endTime",
        });
      }

      const bookingDay = dayjs(bookingDate);
      if (bookingDay.isBefore(now, "day")) {
        return res.status(400).json({
          type: "error",
          message: "Cannot book a table for a past date",
        });
      }

      const start = dayjs(startTime, "HH:mm");
      const end = dayjs(endTime, "HH:mm");
      if (start.isAfter(end)) {
        return res.status(400).json({
          type: "error",
          message: "Start time must be before end time",
        });
      }

      // If booking is for today, check that start time is not in the past
      if (bookingDay.isSame(now, "day")) {
        const startDateTime = dayjs(
          `${now.format("YYYY-MM-DD")} ${startTime}`,
          "YYYY-MM-DD HH:mm",
        );
        if (startDateTime.isBefore(now)) {
          return res.status(400).json({
            type: "error",
            message: "Start time must be later than the current time",
          });
        }
      }

      const query = `
      SELECT t.id, t.table_number, t.capacity, t.location
      FROM TABLES t
      WHERE t.status = 'active'
      AND t.capacity >= ?
      AND NOT EXISTS (
          SELECT 1
          FROM TABLE_BOOKINGS b
          WHERE b.table_id = t.id
          AND b.booking_date = ?
          AND b.status IN ('PENDING','CONFIRMED')
          AND b.start_time < ?
          AND b.end_time > ?
      )
      ORDER BY t.capacity ASC
      `;

      const [tables] = await pool.execute(query, [
        parseInt(partySize),
        bookingDate,
        endTime,
        startTime,
      ]);

      return res.status(200).json({
        type: "success",
        tables,
      });
    } catch (error) {
      console.error("Error checking table availability:", error);
      res.status(500).json({
        type: "error",
        message: "Internal server error",
      });
    }
  }

  async makeTableOrder(req, res) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const userId = req.userId;

      const { tableId, bookingDate, startTime, endTime, partySize } = req.body;

      const formattedDate = dayjs(bookingDate).format("YYYY-MM-DD");

      // check for past date
      if (dayjs(formattedDate).isBefore(dayjs(), "day")) {
        return res.status(400).json({
          type: "error",
          message: "Cannot book a table for a past date",
        });
      }

      const amount = getTablePrice(formattedDate, startTime, endTime);

      // Check if the table exists and is active
      const [tableCheck] = await connection.query(
        `SELECT id,table_number, capacity, status FROM TABLES WHERE id = ?`,
        [tableId],
      );

      if (!tableCheck.length) {
        return res.status(404).json({
          type: "error",
          message: "Table not found",
        });
      }

      if (tableCheck[0].status !== "ACTIVE") {
        return res.status(400).json({
          type: "error",
          message: "Selected table is not available for booking",
        });
      }

      // Check if the number of people doesn't exceed the table capacity
      if (partySize > tableCheck[0].capacity) {
        return res.status(400).json({
          type: "error",
          message: `This table can only accommodate ${
            tableCheck[0].capacity
          } people`,
        });
      }

      // Check if the table is available for the requested time slot
      const query = `
      SELECT t.id, t.table_number, t.capacity, t.location
      FROM TABLES t
      WHERE t.status = 'ACTIVE'
      AND t.capacity >= ?
      AND   EXISTS (
          SELECT 1
          FROM TABLE_BOOKINGS b
          WHERE b.table_id = t.id
          AND b.booking_date = ?
          AND b.status IN ('PENDING','CONFIRMED')
          AND b.start_time < ?
          AND b.end_time > ?
      )
      ORDER BY t.capacity ASC
      `;

      const [existingBookings] = await pool.execute(query, [
        parseInt(partySize),
        formattedDate,
        endTime,
        startTime,
      ]);

      console.log(existingBookings);

      if (existingBookings.length) {
        return res.status(409).json({
          success: false,
          message: "The table is not available for the selected time slot",
        });
      }

      // Check for existing pending booking with payment
      const [existingBooking] = await connection.query(
        `SELECT b.id, p.transaction_id, p.amount
         FROM TABLE_BOOKINGS b
         JOIN TABLE_BOOKING_PAYMENTS p ON b.id = p.booking_id
         WHERE b.user_id = ?
         AND b.table_id = ?
         AND b.booking_date = ?
         AND b.start_time = ?
         AND b.end_time = ?
         AND p.payment_status = 'PENDING'
         ORDER BY b.created_at DESC
         LIMIT 1;`,
        [userId, tableId, formattedDate, startTime, endTime],
      );

      if (existingBooking.length) {
        const {
          id: bookingId,
          transaction_id,
          amount: existingAmount,
        } = existingBooking[0];

        // If amount has changed, update the payment amount
        if (Number(amount) !== Number(existingAmount)) {
          await connection.query(
            `UPDATE TABLE_BOOKING_PAYMENTS SET amount = ?, updated_at = NOW()
             WHERE booking_id = ? AND payment_status = 'PENDING';`,
            [amount, bookingId],
          );
        }

        await connection.commit();

        return res.status(200).json({
          type: "success",
          bookingId: bookingId,
          orderId: transaction_id,
          amount: Number(amount) * 100,
          currency: "INR",
          message: "Existing pending booking payment",
        });
      }

      // Create new booking
      const [bookingResult] = await connection.query(
        `INSERT INTO TABLE_BOOKINGS (
                table_id,
                booking_date,
                start_time,
                end_time,
                number_of_people,
                user_id,
                status
              ) VALUES (?, ?, ?, ?, ?, ?,'PENDING')`,
        [tableId, formattedDate, startTime, endTime, partySize, userId],
      );

      const bookingId = bookingResult.insertId;

      // Create Razorpay order for the table booking
      const razorpayOrder = await razorpayHelper.orders.create({
        amount: Math.round(Number(amount) * 100),
        currency: "INR",
        receipt: `table_booking_rcpt_${bookingId}_${Date.now()}`,
      });

      await connection.query(
        `INSERT INTO TABLE_BOOKING_PAYMENTS (
          booking_id,
          user_id,
          amount,
          transaction_id,
          payment_status
        ) VALUES (?, ?, ?, ?, 'PENDING')`,
        [bookingId, userId, amount, razorpayOrder.id],
      );

      await connection.commit();

      return res.status(201).json({
        type: "success",
        message: "Table booking initiated",
        bookingId,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        artifact: "TABLE",
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error booking table:", error);
      return res.status(500).json({
        type: "error",
        message: "Failed to book table",
        error:
          process.env.NODE_ENV === "production" ? undefined : error.message,
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
          tb.booking_date, 
          tb.start_time, 
          tb.end_time, 
          tb.number_of_people, 
          tb.status, 
          tb.updated_at,
          tbp.amount,         
          tbp.transaction_id,
          tbp.payment_status,
          tbp.updated_at
        FROM 
          TABLE_BOOKINGS tb
        LEFT JOIN 
          TABLE_BOOKING_PAYMENTS tbp ON tb.id = tbp.booking_id
        WHERE 
          tb.user_id = ?
        ORDER BY 
          tb.updated_at DESC, tb.start_time ASC
      `,
        [userId],
      );

      if (!bookings.length) {
        return res.status(404).json({
          type: "error",
          message: "No bookings found for this user",
        });
      }

      return res.status(200).json({
        type: "success",
        bookings: bookings[0],
      });
    } catch (error) {
      console.error("Error in getTableBookings:", error);
      return res.status(500).json({
        type: "error",
        message: "Failed to retrieve table bookings",
        error: error.message,
      });
    }
  }
}

const tableController = new TableController();
export default tableController;
