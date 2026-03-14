import cron from "node-cron";
import { pool } from "../config/database.js";

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
};

const ORDER_PENDING_TIMEOUT_MINUTES = toPositiveInt(
  process.env.ORDER_PENDING_TIMEOUT_MINUTES,
  20,
);
const BOOKING_PENDING_TIMEOUT_MINUTES = toPositiveInt(
  process.env.BOOKING_PENDING_TIMEOUT_MINUTES,
  30,
);
const BOOKING_START_GRACE_MINUTES = toPositiveInt(
  process.env.BOOKING_START_GRACE_MINUTES,
  15,
);
const CRON_SCHEDULE = process.env.PENDING_RECONCILE_CRON || "*/5 * * * *";
const CRON_TIMEZONE = process.env.CRON_TIMEZONE || "Asia/Kolkata";
const RECONCILER_ENABLED =
  String(process.env.ENABLE_PENDING_RECONCILE ?? "true").toLowerCase() !==
  "false";

export const reconcilePendingRecords = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [staleOrdersUpdate] = await connection.query(
      `UPDATE ORDERS
       SET status = 'CANCELLED',
           payment_status = 'FAILED',
           updated_at = NOW()
       WHERE status = 'PAYMENT_PENDING'
         AND payment_status = 'PENDING'
         AND created_at <= (NOW() - INTERVAL ? MINUTE)`,
      [ORDER_PENDING_TIMEOUT_MINUTES],
    );

    const [staleBookingsUpdate] = await connection.query(
      `UPDATE TABLE_BOOKINGS tb
       INNER JOIN TABLE_BOOKING_PAYMENTS tbp ON tbp.booking_id = tb.id
       SET tb.status = 'CANCELLED',
           tb.updated_at = NOW(),
           tbp.payment_status = 'FAILED',
           tbp.updated_at = NOW()
       WHERE tb.status = 'PENDING'
         AND tbp.payment_status = 'PENDING'
         AND tb.created_at <= (NOW() - INTERVAL ? MINUTE)`,
      [BOOKING_PENDING_TIMEOUT_MINUTES],
    );

    const [pastStartBookingsUpdate] = await connection.query(
      `UPDATE TABLE_BOOKINGS tb
       LEFT JOIN TABLE_BOOKING_PAYMENTS tbp
         ON tbp.booking_id = tb.id
        AND tbp.payment_status = 'PENDING'
       SET tb.status = 'CANCELLED',
           tb.updated_at = NOW(),
           tbp.payment_status = CASE
             WHEN tbp.id IS NOT NULL THEN 'FAILED'
             ELSE tbp.payment_status
           END,
           tbp.updated_at = CASE
             WHEN tbp.id IS NOT NULL THEN NOW()
             ELSE tbp.updated_at
           END
       WHERE tb.status = 'PENDING'
         AND TIMESTAMP(tb.booking_date, tb.start_time) <= (NOW() - INTERVAL ? MINUTE)`,
      [BOOKING_START_GRACE_MINUTES],
    );

    await connection.commit();

    const staleOrders = staleOrdersUpdate.affectedRows || 0;
    const staleBookings = staleBookingsUpdate.affectedRows || 0;
    const pastStartBookings = pastStartBookingsUpdate.affectedRows || 0;

    if (staleOrders > 0 || staleBookings > 0 || pastStartBookings > 0) {
      console.log(
        `[pending-reconciler] updated orders=${staleOrders}, staleBookings=${staleBookings}, pastStartBookings=${pastStartBookings}`,
      );
    }
  } catch (error) {
    await connection.rollback();
    console.error("[pending-reconciler] failed:", error);
  } finally {
    connection.release();
  }
};

export const startPendingStateReconciler = () => {
  if (!RECONCILER_ENABLED) {
    console.log("[pending-reconciler] disabled");
    return null;
  }

  const schedule = cron.validate(CRON_SCHEDULE) ? CRON_SCHEDULE : "*/5 * * * *";

  if (schedule !== CRON_SCHEDULE) {
    console.warn(
      `[pending-reconciler] invalid schedule "${CRON_SCHEDULE}", falling back to "${schedule}"`,
    );
  }

  const task = cron.schedule(
    schedule,
    async () => {
      await reconcilePendingRecords();
    },
    { timezone: CRON_TIMEZONE },
  );

  task.start();
  void reconcilePendingRecords();

  console.log(
    `[pending-reconciler] started: schedule="${schedule}", timezone="${CRON_TIMEZONE}"`,
  );

  return task;
};
