import { pool } from "../config/database.js";
import jwt from "jsonwebtoken";

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [user] = await pool.query("SELECT * FROM USERS WHERE id =?", [
      decoded.id,
    ]);

    if (!user[0]) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    req.userId = req.user[0].id;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [user] = await pool.query("SELECT * FROM USERS WHERE id =?", [
      decoded.id,
    ]);

    if (!user[0]) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user[0].role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.user = user;
    req.userId = req.user[0].id;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

export { authenticateUser, authenticateAdmin };
