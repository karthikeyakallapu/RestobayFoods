import { pool } from "../../config/database.js";
import { put, del } from "@vercel/blob";
import { getSuccessPaymentStatus } from "../../utils/paymentStatusResolver.js";

class AdminController {
  // Fetch all orders with user details with pagination, filtering, and search
  async getAllOrders(req, res) {
    try {
      // Get pagination parameters from query string
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status || "";
      const search = req.query.search || "";
      const sortBy = req.query.sortBy || "created_at";
      const sortDirection = req.query.sortDirection || "DESC";

      // Calculate offset
      const offset = (page - 1) * limit;

      // Build the WHERE clause
      let whereConditions = [];
      let queryParams = [];

      // Add status filter if provided
      if (status) {
        whereConditions.push("o.status = ?");
        queryParams.push(status);
      }

      // Add search filter if provided
      if (search) {
        whereConditions.push(
          "(u.name LIKE ? OR u.phone LIKE ? OR o.id LIKE ?)",
        );
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern);
      }

      // Combine WHERE conditions
      const whereClause =
        whereConditions.length > 0
          ? "WHERE " + whereConditions.join(" AND ")
          : "";

      // Validate sort column to prevent SQL injection
      const validSortColumns = [
        "id",
        "user_name",
        "total_amount",
        "status",
        "created_at",
      ];
      const sortColumn = validSortColumns.includes(sortBy)
        ? sortBy
        : "created_at";
      const sortDir = sortDirection.toUpperCase() === "ASC" ? "ASC" : "DESC";

      // Handle sorting for user_name (which comes from users table)
      let orderByClause;
      if (sortColumn === "user_name") {
        orderByClause = `ORDER BY u.name ${sortDir}`;
      } else {
        orderByClause = `ORDER BY o.${sortColumn} ${sortDir}`;
      }

      // Main query to get paginated orders
      const [rows] = await pool.query(
        `
      SELECT 
        o.id, 
        o.user_id, 
        o.total_amount, 
        o.status, 
        o.created_at, 
        o.updated_at,
        u.name as user_name, 
        u.phone as phone_number
      FROM ORDERS o
      JOIN USERS u ON o.user_id = u.id
      ${whereClause}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `,
        [...queryParams, limit, offset],
      );

      // Count query for total records (without pagination)
      const [countResult] = await pool.query(
        `
      SELECT COUNT(*) as total
      FROM ORDERS o
      JOIN USERS u ON o.user_id = u.id
      ${whereClause}
    `,
        queryParams,
      );

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get status counts for the stats chips (overall counts, not filtered)
      const [statusCounts] = await pool.query(`
      SELECT 
        SUM(CASE WHEN o.status = 'PAYMENT_PENDING' THEN 1 ELSE 0 END) as PAYMENT_PENDING,
        SUM(CASE WHEN o.status = 'CONFIRMED' THEN 1 ELSE 0 END) as CONFIRMED,
        SUM(CASE WHEN o.status = 'CANCELLED' THEN 1 ELSE 0 END) as CANCELLED,
        SUM(CASE WHEN o.status = 'FAILED' THEN 1 ELSE 0 END) as FAILED,
        COUNT(*) as total
      FROM ORDERS o
      JOIN USERS u ON o.user_id = u.id
    `);

      return res.status(200).json({
        success: true,
        orders: rows,
        pagination: {
          currentPage: page,
          totalPages,
          total,
          limit,
          from: offset + 1,
          to: Math.min(offset + limit, total),
          statusCounts: statusCounts[0] || {
            PAYMENT_PENDING: 0,
            CONFIRMED: 0,
            CANCELLED: 0,
            FAILED: 0,
            total: 0,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      return res.status(500).json({
        success: false,
        type: "error",
        message: "Internal Server Error",
      });
    }
  }

  // Fetch all table bookings with user details
  async getAllTableBookings(req, res) {
    try {
      // Get pagination parameters from query string
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status || "";
      const search = req.query.search || "";
      const sortBy = req.query.sortBy || "booking_date";
      const sortDirection = req.query.sortDirection || "DESC";

      // Calculate offset
      const offset = (page - 1) * limit;

      // Build the WHERE clause
      let whereConditions = [];
      let queryParams = [];

      // Add status filter if provided
      if (status) {
        whereConditions.push("tb.status = ?");
        queryParams.push(status);
      }

      // Add search filter if provided
      if (search) {
        whereConditions.push(
          "(u.name LIKE ? OR u.phone LIKE ? OR t.table_number LIKE ?)",
        );
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern);
      }

      // Combine WHERE conditions
      const whereClause =
        whereConditions.length > 0
          ? "WHERE " + whereConditions.join(" AND ")
          : "";

      // Validate sort column to prevent SQL injection
      const validSortColumns = [
        "table_number",
        "user_name",
        "booking_date",
        "start_time",
        "status",
      ];
      let sortColumn = validSortColumns.includes(sortBy)
        ? sortBy
        : "booking_date";
      const sortDir = sortDirection.toUpperCase() === "ASC" ? "ASC" : "DESC";

      // Handle sorting for different columns
      let orderByClause;
      switch (sortColumn) {
        case "table_number":
          orderByClause = `ORDER BY t.table_number ${sortDir}`;
          break;
        case "user_name":
          orderByClause = `ORDER BY u.name ${sortDir}`;
          break;
        case "start_time":
          orderByClause = `ORDER BY tb.start_time ${sortDir}`;
          break;
        case "status":
          orderByClause = `ORDER BY tb.status ${sortDir}`;
          break;
        default:
          orderByClause = `ORDER BY tb.booking_date ${sortDir}, tb.start_time ${sortDir}`;
      }

      // Main query to get paginated bookings
      const [rows] = await pool.query(
        `
      SELECT 
        tb.id,
        t.table_number, 
        tb.user_id, 
        tb.booking_date, 
        tb.start_time, 
        tb.end_time, 
        tb.status,
        tb.number_of_people,
        u.name as user_name, 
        u.phone as phone_number
      FROM TABLE_BOOKINGS tb
      JOIN USERS u ON tb.user_id = u.id
      JOIN TABLES t ON tb.table_id = t.id
      ${whereClause}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `,
        [...queryParams, limit, offset],
      );

      // Count query for total records (without pagination)
      const [countResult] = await pool.query(
        `
      SELECT COUNT(*) as total
      FROM TABLE_BOOKINGS tb
      JOIN USERS u ON tb.user_id = u.id
      JOIN TABLES t ON tb.table_id = t.id
      ${whereClause}
    `,
        queryParams,
      );

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get status counts for the stats chips
      const [statusCounts] = await pool.query(`
      SELECT 
        SUM(CASE WHEN tb.status = 'PENDING' THEN 1 ELSE 0 END) as PENDING,
        SUM(CASE WHEN tb.status = 'CONFIRMED' THEN 1 ELSE 0 END) as CONFIRMED,
        SUM(CASE WHEN tb.status = 'CANCELLED' THEN 1 ELSE 0 END) as CANCELLED,
        COUNT(*) as total
      FROM TABLE_BOOKINGS tb
    `);

      return res.status(200).json({
        success: true,
        bookings: rows,
        pagination: {
          currentPage: page,
          totalPages,
          total,
          limit,
          from: offset + 1,
          to: Math.min(offset + limit, total),
          statusCounts: statusCounts[0] || {
            PENDING: 0,
            CONFIRMED: 0,
            CANCELLED: 0,
            total: 0,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching table bookings:", error);
      return res.status(500).json({
        success: false,
        type: "error",
        message: "Internal Server Error",
      });
    }
  }
  // Get all users with pagination, filtering, and search
  getAllUsers = async (req, res) => {
    try {
      // Get pagination parameters from query string
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const role = req.query.role || "";
      const search = req.query.search || "";
      const sortBy = req.query.sortBy || "name";
      const sortDirection = req.query.sortDirection || "ASC";

      // Calculate offset
      const offset = (page - 1) * limit;

      // Build the WHERE clause
      let whereConditions = [];
      let queryParams = [];

      // Add role filter if provided
      if (role) {
        whereConditions.push("role = ?");
        queryParams.push(role);
      }

      // Add search filter if provided
      if (search) {
        whereConditions.push("(name LIKE ? OR email LIKE ? OR phone LIKE ?)");
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern);
      }

      // Combine WHERE conditions
      const whereClause =
        whereConditions.length > 0
          ? "WHERE " + whereConditions.join(" AND ")
          : "";

      // Validate sort column to prevent SQL injection
      const validSortColumns = [
        "name",
        "email",
        "phone",
        "role",
        "verified",
        "created_at",
      ];
      const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "name";
      const sortDir = sortDirection.toUpperCase() === "DESC" ? "DESC" : "ASC";

      // Main query to get paginated users
      const [rows] = await pool.query(
        `
      SELECT 
        id,
        name, 
        email, 
        phone,
        role,
        verified,
        created_at
      FROM USERS
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDir}
      LIMIT ? OFFSET ?
    `,
        [...queryParams, limit, offset],
      );

      // Count query for total records (without pagination)
      const [countResult] = await pool.query(
        `
      SELECT COUNT(*) as total
      FROM USERS
      ${whereClause}
    `,
        queryParams,
      );

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get role counts for stats
      const [roleCounts] = await pool.query(`
      SELECT 
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin,
        SUM(CASE WHEN role = 'customer' THEN 1 ELSE 0 END) as customer,
        COUNT(*) as total
      FROM USERS
    `);

      return res.status(200).json({
        success: true,
        users: rows,
        pagination: {
          currentPage: page,
          totalPages,
          total,
          limit,
          from: offset + 1,
          to: Math.min(offset + limit, total),
          roleCounts: roleCounts[0] || {
            admin: 0,
            customer: 0,
            total: 0,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({
        success: false,
        type: "error",
        message: "Internal Server Error",
      });
    }
  };

  // Handle menu actions: ENABLE, DISABLE, DELETE, ADD_ITEM, UPDATE_ITEM
  updateMenu = async (req, res) => {
    const { action, payload } = req.body;

    try {
      switch (action) {
        case "ENABLE":
          await pool.query(
            "UPDATE MENU SET available = 1 WHERE id = ?",
            payload.item_id,
          );
          return res
            .status(200)
            .json({ type: "success", message: "Item enabled successfully" });

        case "DISABLE":
          await pool.query(
            "UPDATE MENU SET available = 0 WHERE id = ?",
            payload.item_id,
          );
          return res
            .status(200)
            .json({ type: "success", message: "Item disabled successfully" });

        case "DELETE":
          try {
            await pool.query("DELETE FROM MENU WHERE id = ?", payload.item_id);
            // Also delete the image from Vercel Blob
            await del(`resto-menu/${payload.imageUrl}`);
            return res
              .status(200)
              .json({ message: "Item deleted successfully" });
          } catch (error) {
            console.log("Error deleting item:", error);
            return res.status(500).json({
              type: "error",
              message: "Failed to delete item",
            });
          }

        case "ADD_ITEM": {
          const { name, description, price, category, imageUrl } = payload;

          if (!name || !description || !price || !category) {
            return res.status(400).json({
              type: "error",
              message: "Please provide all required fields.",
            });
          }

          const [existingItem] = await pool.query(
            "SELECT * FROM MENU WHERE name = ?",
            [name],
          );

          if (existingItem.length > 0) {
            return res.status(400).json({
              type: "error",
              message: "Item already exists. Please choose a different name.",
            });
          }

          await pool.query(
            "INSERT INTO MENU (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)",
            [name, description, price, category, imageUrl],
          );

          return res.status(200).json({
            type: "success",
            message: "Item added successfully",
          });
        }

        case "UPDATE_ITEM": {
          if (!payload.id) {
            return res.status(400).json({
              type: "error",
              message: "Item ID is required for updates.",
            });
          }

          const updateFields = [];
          const queryValues = [];

          if (payload.name) {
            updateFields.push("name = ?");
            queryValues.push(payload.name);
          }
          if (payload.description) {
            updateFields.push("description = ?");
            queryValues.push(payload.description);
          }
          if (payload.price) {
            updateFields.push("price = ?");
            queryValues.push(payload.price);
          }
          if (payload.category) {
            updateFields.push("category = ?");
            queryValues.push(payload.category);
          }
          if (payload.imageUrl) {
            updateFields.push("image_url = ?");
            queryValues.push(payload.imageUrl);
          }

          if (updateFields.length === 0) {
            return res.status(400).json({
              type: "error",
              message: "No fields provided for update.",
            });
          }

          queryValues.push(payload.id);
          const queryString = `UPDATE MENU SET ${updateFields.join(
            ", ",
          )} WHERE id = ?`;

          await pool.query(queryString, queryValues);

          return res.status(200).json({
            type: "success",
            message: "Item updated successfully",
          });
        }

        default:
          return res.status(400).json({
            type: "error",
            message: "Invalid action.",
          });
      }
    } catch (error) {
      console.error("Error updating menu:", error);
      return res.status(500).json({
        type: "error",
        message: "Internal Server Error",
      });
    }
  };

  // Upload image handler
  uploadImage = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // req.file.buffer contains the file in memory
      const { buffer, originalname } = req.file;

      // Upload directly to Vercel Blob
      const { url } = await put(`resto-menu/${originalname}`, buffer, {
        access: "public",
        allowOverwrite: true,
      });

      res.json({ message: "Uploaded to Vercel Blob", imageUrl: originalname });
    } catch (error) {
      console.error("Error uploading image:", error);
      return res.status(500).json({
        error: "Image upload failed",
        message: error.message,
      });
    }
  };

  updateOrderStatus = async (req, res) => {
    const { orderId, newStatus, component } = req.body;
    const normalizedComponent = String(component || "").trim().toLowerCase();
    const normalizedStatus = String(newStatus || "").trim().toUpperCase();

    const orderAllowedStatuses = [
      "PAYMENT_PENDING",
      "CONFIRMED",
      "CANCELLED",
      "FAILED",
    ];
    const bookingAllowedStatuses = ["PENDING", "CONFIRMED", "CANCELLED"];

    const connection = await pool.getConnection();

    try {
      if (!orderId || !newStatus || !component) {
        return res.status(400).json({
          type: "error",
          message: "Please provide all required fields.",
        });
      }

      await connection.beginTransaction();

      switch (normalizedComponent) {
        case "order": {
          if (!orderAllowedStatuses.includes(normalizedStatus)) {
            await connection.rollback();
            return res.status(400).json({
              type: "error",
              message: "Invalid order status value",
            });
          }

          const [orderUpdateResult] = await connection.query(
            "UPDATE ORDERS SET status = ?, updated_at = NOW() WHERE id = ?",
            [normalizedStatus, orderId],
          );

          if (orderUpdateResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({
              type: "error",
              message: "Order not found",
            });
          }

          const paymentStatusMapping = {
            PAYMENT_PENDING: "PENDING",
            CONFIRMED: await getSuccessPaymentStatus("ORDERS"),
            CANCELLED: "FAILED",
            FAILED: "FAILED",
          };

          await connection.query(
            "UPDATE ORDERS SET payment_status = ? WHERE id = ?",
            [paymentStatusMapping[normalizedStatus], orderId],
          );

          await connection.commit();

          return res.status(200).json({
            type: "success",
            message: "Order status updated successfully",
          });
        }

        case "table_booking": {
          if (!bookingAllowedStatuses.includes(normalizedStatus)) {
            await connection.rollback();
            return res.status(400).json({
              type: "error",
              message: "Invalid table booking status value",
            });
          }

          const [bookingUpdateResult] = await connection.query(
            "UPDATE TABLE_BOOKINGS SET status = ?, updated_at = NOW() WHERE id = ?",
            [normalizedStatus, orderId],
          );

          if (bookingUpdateResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({
              type: "error",
              message: "Table booking not found",
            });
          }

          const bookingPaymentStatusMapping = {
            PENDING: "PENDING",
            CONFIRMED: await getSuccessPaymentStatus("TABLE_BOOKING_PAYMENTS"),
            CANCELLED: "FAILED",
          };

          await connection.query(
            "UPDATE TABLE_BOOKING_PAYMENTS SET payment_status = ?, updated_at = NOW() WHERE booking_id = ?",
            [bookingPaymentStatusMapping[normalizedStatus], orderId],
          );

          await connection.commit();

          return res.status(200).json({
            type: "success",
            message: "Table booking status updated successfully",
          });
        }

        default:
          await connection.rollback();
          return res.status(400).json({
            type: "error",
            message: "Invalid component type",
          });
      }
    } catch (error) {
      await connection.rollback();
      console.error("Error updating order status:", error);
      return res.status(500).json({
        type: "error",
        message: "Internal Server Error",
      });
    } finally {
      connection.release();
    }
  };
}

const adminController = new AdminController();

export default adminController;
