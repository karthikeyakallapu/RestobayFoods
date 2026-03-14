import { pool } from "../config/database.js";

const cache = new Map();

const parseEnumValues = (columnType = "") => {
  const values = [];
  const regex = /'([^']+)'/g;
  let match = regex.exec(columnType);

  while (match) {
    values.push(match[1]);
    match = regex.exec(columnType);
  }

  return values;
};

const resolveSuccessValue = (enumValues = []) => {
  if (enumValues.includes("SUCCESS")) return "SUCCESS";
  if (enumValues.includes("COMPLETED")) return "COMPLETED";
  return "SUCCESS";
};

export const getSuccessPaymentStatus = async (
  tableName,
  columnName = "payment_status",
) => {
  const cacheKey = `${tableName.toLowerCase()}.${columnName.toLowerCase()}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const [rows] = await pool.query(
      `SELECT COLUMN_TYPE
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND LOWER(TABLE_NAME) = LOWER(?)
         AND LOWER(COLUMN_NAME) = LOWER(?)
       LIMIT 1`,
      [tableName, columnName],
    );

    const enumValues = rows.length ? parseEnumValues(rows[0].COLUMN_TYPE) : [];
    const successValue = resolveSuccessValue(enumValues);

    cache.set(cacheKey, successValue);
    return successValue;
  } catch (error) {
    console.error(
      `[payment-status-resolver] falling back to SUCCESS for ${tableName}.${columnName}:`,
      error,
    );
    cache.set(cacheKey, "SUCCESS");
    return "SUCCESS";
  }
};
