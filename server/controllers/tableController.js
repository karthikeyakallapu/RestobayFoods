import { pool } from "../config/database.js";
import { razorpayHelper, getTablePrice } from "../utils/helpers.js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(customParseFormat);

const normalizeStatus = (value) => String(value || "").trim().toUpperCase();

const validateBookingWindow = ({ bookingDate, startTime, endTime }) => {
  if (!bookingDate || !startTime || !endTime) {
    return {
      isValid: false,
      message: "Missing required parameters: bookingDate, startTime, endTime",
    };
  }

  const bookingDay = dayjs(bookingDate, "YYYY-MM-DD", true);
  if (!bookingDay.isValid()) {
    return {
      isValid: false,
      message: "Invalid bookingDate format. Use YYYY-MM-DD",
    };
  }

  const startDateTime = dayjs(
    `${bookingDay.format("YYYY-MM-DD")} ${startTime}`,
    "YYYY-MM-DD HH:mm",
    true,
  );
  const endDateTime = dayjs(
    `${bookingDay.format("YYYY-MM-DD")} ${endTime}`,
    "YYYY-MM-DD HH:mm",
    true,
  );

  if (!startDateTime.isValid() || !endDateTime.isValid()) {
    return {
      isValid: false,
      message: "Invalid time format. Use HH:mm",
    };
  }

  if (!endDateTime.isAfter(startDateTime)) {
    return {
      isValid: false,
      message: "End time must be after start time",
    };
  }

  if (startDateTime.isBefore(dayjs())) {
    return {
      isValid: false,
      message: "Start time must be later than the current time",
    };
  }

  return {
    isValid: true,
    formattedDate: bookingDay.format("YYYY-MM-DD"),
    normalizedStartTime: startDateTime.format("HH:mm"),
    normalizedEndTime: endDateTime.format("HH:mm"),
  };
};

class TableController {
  async checkTableAvailability(req, res) {
    try {
      const { bookingDate, startTime, endTime, partySize } = req.body;
      const partySizeNumber = Number.parseInt(partySize, 10);

      if (!Number.isInteger(partySizeNumber) || partySizeNumber <= 0) {
        return res.status(400).json({
          type: "error",
          message: "partySize must be a positive integer",
        });
      }

      const validation = validateBookingWindow({ bookingDate, startTime, endTime });
      if (!validation.isValid) {
        return res.status(400).json({
          type: "error",
          message: validation.message,
        });
      }

      const query = `
        SELECT t.id, t.table_number, t.capacity, t.location
        FROM TABLES t
        WHERE UPPER(t.status) = 'ACTIVE'
          AND t.capacity >= ?
          AND NOT EXISTS (
            SELECT 1
            FROM TABLE_BOOKINGS b
            WHERE b.table_id = t.id
              AND b.booking_date = ?
              AND b.status IN ('PENDING', 'CONFIRMED')
              AND b.start_time < ?
              AND b.end_time > ?
          )
        ORDER BY t.capacity ASC
      `;

      const [tables] = await pool.execute(query, [
        partySizeNumber,
        validation.formattedDate,
        validation.normalizedEndTime,
        validation.normalizedStartTime,
      ]);

      return res.status(200).json({
        type: "success",
        tables,
        message:
          tables.length > 0
            ? "Tables found"
            : "No table available for selected time slot",
      });
    } catch (error) {
      console.error("Error checking table availability:", error);
      return res.status(500).json({
        type: "error",
        message: "Internal server error",
      });
    }
  }

  async makeTableOrder(req, res) {
    const connection = await pool.getConnection();

    const rollbackAndSend = async (statusCode, body) => {
      await connection.rollback();
      return res.status(statusCode).json(body);
    };

    try {
      await connection.beginTransaction();

      const userId = req.userId;
      const { tableId, bookingDate, startTime, endTime, partySize } = req.body;
      const partySizeNumber = Number.parseInt(partySize, 10);

      if (!tableId) {
        return rollbackAndSend(400, {
          type: "error",
          message: "tableId is required",
        });
      }

      if (!Number.isInteger(partySizeNumber) || partySizeNumber <= 0) {
        return rollbackAndSend(400, {
          type: "error",
          message: "partySize must be a positive integer",
        });
      }

      const validation = validateBookingWindow({ bookingDate, startTime, endTime });
      if (!validation.isValid) {
        return rollbackAndSend(400, {
          type: "error",
          message: validation.message,
        });
      }

      const amount = getTablePrice(
        validation.formattedDate,
        validation.normalizedStartTime,
        validation.normalizedEndTime,
      );

      const [tableCheck] = await connection.query(
        `SELECT id, table_number, capacity, status
         FROM TABLES
         WHERE id = ?
         FOR UPDATE`,
        [tableId],
      );

      if (!tableCheck.length) {
        return rollbackAndSend(404, {
          type: "error",
          message: "Table not found",
        });
      }

      if (normalizeStatus(tableCheck[0].status) !== "ACTIVE") {
        return rollbackAndSend(400, {
          type: "error",
          message: "Selected table is not available for booking",
        });
      }

      if (partySizeNumber > Number(tableCheck[0].capacity)) {
        return rollbackAndSend(400, {
          type: "error",
          message: `This table can only accommodate ${tableCheck[0].capacity} people`,
        });
      }

      const [existingBookings] = await connection.query(
        `SELECT id
         FROM TABLE_BOOKINGS
         WHERE table_id = ?
           AND booking_date = ?
           AND status IN ('PENDING', 'CONFIRMED')
           AND start_time < ?
           AND end_time > ?
         FOR UPDATE`,
        [
          tableId,
          validation.formattedDate,
          validation.normalizedEndTime,
          validation.normalizedStartTime,
        ],
      );

      if (existingBookings.length > 0) {
        return rollbackAndSend(409, {
          success: false,
          message: "The table is not available for the selected time slot",
        });
      }

      const [existingBooking] = await connection.query(
        `SELECT b.id, p.transaction_id, p.amount
         FROM TABLE_BOOKINGS b
         JOIN TABLE_BOOKING_PAYMENTS p ON b.id = p.booking_id
         WHERE b.user_id = ?
           AND b.table_id = ?
           AND b.booking_date = ?
           AND b.start_time = ?
           AND b.end_time = ?
           AND b.status = 'PENDING'
           AND p.payment_status = 'PENDING'
         ORDER BY b.created_at DESC
         LIMIT 1
         FOR UPDATE`,
        [
          userId,
          tableId,
          validation.formattedDate,
          validation.normalizedStartTime,
          validation.normalizedEndTime,
        ],
      );

      if (existingBooking.length) {
        const {
          id: bookingId,
          transaction_id,
          amount: existingAmount,
        } = existingBooking[0];

        if (Number(amount) !== Number(existingAmount)) {
          await connection.query(
            `UPDATE TABLE_BOOKING_PAYMENTS
             SET amount = ?, updated_at = NOW()
             WHERE booking_id = ?
               AND payment_status = 'PENDING'`,
            [amount, bookingId],
          );
        }

        await connection.commit();

        return res.status(200).json({
          type: "success",
          bookingId,
          orderId: transaction_id,
          amount: Number(amount) * 100,
          currency: "INR",
          message: "Existing pending booking payment",
        });
      }

      const [bookingResult] = await connection.query(
        `INSERT INTO TABLE_BOOKINGS (
          table_id,
          booking_date,
          start_time,
          end_time,
          number_of_people,
          user_id,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
        [
          tableId,
          validation.formattedDate,
          validation.normalizedStartTime,
          validation.normalizedEndTime,
          partySizeNumber,
          userId,
        ],
      );

      const bookingId = bookingResult.insertId;

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

      const [bookings] = await connection.query(
        `SELECT
           tb.id,
           tb.table_id,
           t.table_number,
           tb.booking_date,
           tb.start_time,
           tb.end_time,
           tb.number_of_people,
           tb.status,
           tb.created_at,
           tb.updated_at,
           tbp.amount,
           tbp.transaction_id,
           tbp.payment_status,
           tbp.updated_at AS payment_updated_at
         FROM TABLE_BOOKINGS tb
         INNER JOIN TABLES t ON tb.table_id = t.id
         LEFT JOIN TABLE_BOOKING_PAYMENTS tbp ON tb.id = tbp.booking_id
         WHERE tb.user_id = ?
         ORDER BY tb.updated_at DESC, tb.start_time ASC`,
        [userId],
      );

      if (!bookings || bookings.length === 0) {
        return res.status(200).json({
          type: "success",
          message: "No bookings found for this user",
          bookings: [],
        });
      }

      const formattedBookings = bookings.map((booking) => ({
        id: booking.id,
        table_id: booking.table_id,
        table_number: booking.table_number,
        booking_date: booking.booking_date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        number_of_people: booking.number_of_people,
        status: booking.status,
        amount: booking.amount,
        transaction_id: booking.transaction_id,
        payment_status: booking.payment_status,
        created_at: booking.created_at,
        updated_at: booking.updated_at,
        payment_updated_at: booking.payment_updated_at,
      }));

      return res.status(200).json({
        type: "success",
        message: "Bookings retrieved successfully",
        bookings: formattedBookings,
      });
    } catch (error) {
      console.error("Error in getTableBookings:", error);
      return res.status(500).json({
        type: "error",
        message: "Failed to retrieve table bookings",
        error: error.message,
      });
    } finally {
      connection.release();
    }
  }
}

const tableController = new TableController();
export default tableController;
