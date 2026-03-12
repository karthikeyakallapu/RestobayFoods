import { pool } from "../config/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/helpers.js";

class UserAuthController {
  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        type: "error",
        message: "Please provide email and password",
      });
    }

    const [users] = await pool.query("SELECT * FROM USERS WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(400).json({
        type: "error",
        message: "User not found. Please Register.",
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ type: "error", message: "Invalid Email or Password" });
    }

    if (user.verified !== 1) {
      return res.status(400).json({
        type: "error",
        message: "Email not verified. Please verify your email.",
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      type: "success",
      message: "Login Successful",
      accessToken: token,
    });
  }

  async register(req, res) {
    const { name, email, phone, password } = req.body;

    const [existingUsers] = await pool.query(
      "SELECT * FROM USERS WHERE email = ? OR phone = ?",
      [email, phone],
    );

    if (existingUsers.length > 0) {
      return res
        .status(400)
        .json({ type: "info", message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      "INSERT INTO USERS (name, email, phone, password) VALUES (?, ?, ?, ?)",
      [name, email, phone, hashedPassword],
    );

    // Generate Verification Token
    const token = jwt.sign(
      { id: result.insertId, email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    const verificationLink = `${
      process.env.FRONTEND_URL
    }/verify-email?token=${encodeURIComponent(token)}`;

    // Email Content
    const mailOptions = {
      from: process.env.MAILER_USER,
      to: email,
      subject: "Welcome to Restobay - Verify Your Email",
      html: `
            <p>Hello ${name},</p>
            <p>Please click the link below to verify your mail:</p>
            <a href="${verificationLink}">Verify Email</a>
            <p>This link will expire in 1 hour.</p>
          `,
    };

    const mailSuccess = await sendVerificationEmail(
      result.insertId,
      name,
      email,
      mailOptions,
    );

    if (!mailSuccess) {
      return res.status(500).json({
        type: "error",
        message: "Error sending verification email",
      });
    }

    res.status(201).json({
      type: "success",
      message: "User registered successfully. Please verify your email.",
      data: {
        id: result.insertId,
        name,
        email,
        phone,
      },
    });
  }

  async verifyEmail(req, res) {
    const { token } = req.body;

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      if (!userId) {
        return res.status(400).json({
          type: "error",
          message: "Invalid token",
        });
      }

      // Check if user exists
      const [users] = await pool.query("SELECT * FROM USERS WHERE id = ?", [
        userId,
      ]);

      if (users.length === 0) {
        return res.status(400).json({
          type: "error",
          message: "User not found",
        });
      }

      const user = users[0];
      const isVerified = user.verified || null;
      if (isVerified) {
        return res.status(200).json({
          type: "success",
          message: "Email already verified",
        });
      }

      // Update user as verified
      await pool.query("UPDATE USERS SET verified = 1 WHERE id = ?", [userId]);

      res.status(200).json({
        type: "success",
        message: "Email verified successfully! You can now log in.",
      });
    } catch (error) {
      res
        .status(400)
        .json({ type: "error", message: "Invalid or expired token." });
    }
  }

  async resendVerificationMail(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          type: "error",
          message: "Please provide email",
        });
      }
      const [users] = await pool.query("SELECT * FROM USERS WHERE email = ?", [
        email,
      ]);

      if (users.length === 0) {
        return res.status(400).json({
          type: "error",
          message: "User not found. Please Register.",
        });
      }
      const user = users[0];
      const { id, name } = user;
      const phone = user.phone || null;
      const isVerified = user.verified || null;

      if (isVerified) {
        return res.status(400).json({
          type: "success",
          message: "Email already verified",
        });
      }

      // Generate Verification Token
      const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      const verificationLink = `${
        process.env.FRONTEND_URL
      }/verify-email?token=${encodeURIComponent(token)}`;

      // Email Content
      const mailOptions = {
        from: process.env.MAILER_USER,
        to: email,
        subject: "Welcome to Restobay - Verify Your Email",
        html: `
              <p>Hello ${users[0].name},</p>
              <p>Please click the link below to verify your mail:</p>
              <a href="${verificationLink}">Verify Email</a>
              <p>This link will expire in 1 hour.</p>
            `,
      };

      const mailSuccess = await sendVerificationEmail(
        id,
        name,
        email,
        mailOptions,
      );

      if (!mailSuccess) {
        console.log("Verification email not successfull:", email);
        return res.status(500).json({
          type: "error",
          message: "Error sending verification email",
        });
      }

      res.status(201).json({
        type: "success",
        message: "Email resent successfully. Please check.",
      });
    } catch (error) {
      console.log("Error resending verification email:", error);
      return res.status(500).json({
        type: "error",
        message: "Error resending verification email",
      });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          type: "error",
          message: "Please provide email",
        });
      }

      const [users] = await pool.query("SELECT * FROM USERS WHERE email = ?", [
        email,
      ]);

      if (users.length === 0) {
        return res.status(400).json({
          type: "error",
          message: "User not found. Please Register.",
        });
      }

      // Generate JWT Token
      const token = jwt.sign(
        { id: users[0].id, email: users[0].email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );

      const resetPasswordLink = `${
        process.env.FRONTEND_URL
      }/reset-password?token=${encodeURIComponent(token)}`;

      // Email Content
      const mailOptions = {
        from: process.env.MAILER_USER,
        to: email,
        subject: "Restobay - Reset Password",
        html: `
              <p>Hello ${users[0].name},</p>
              <p>Please click the link below to reset your Password:</p>
              <a href="${resetPasswordLink}">Reset Password</a>
              <p>This link will expire in 1 hour.</p>
            `,
      };

      const mailSuccess = await sendVerificationEmail(
        users[0].id,
        users[0].name,
        email,
        mailOptions,
      );

      if (!mailSuccess) {
        return res.status(500).json({
          type: "error",
          message: "Error sending reset password email",
        });
      }

      res.status(200).json({
        type: "success",
        message:
          "Reset password email sent successfully. Please check your email.",
      });
    } catch (error) {
      console.log("Error in forgot password:", error);
      return res.status(500).json({
        type: "error",
        message: "Error sending reset password email",
      });
    }
  }

  async validateResetToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          type: "error",
          message: "Please provide token",
        });
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      if (!userId) {
        return res.status(400).json({
          type: "error",
          message: "Invalid token",
        });
      }

      // Check if user exists
      const [users] = await pool.query("SELECT * FROM USERS WHERE id = ?", [
        userId,
      ]);

      if (users.length === 0) {
        return res.status(400).json({
          type: "error",
          message: "User not found",
        });
      }

      res.status(200).json({
        type: "success",
        message: "Token is valid. You can reset your password.",
      });
    } catch (error) {
      console.log("Error in validate reset token:", error);
      return res.status(500).json({
        type: "error",
        message: "Error validating reset token",
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { newPassword, token } = req.body;

      if (!token) {
        return res.status(400).json({
          type: "error",
          message: "Please provide token",
        });
      }
      if (!newPassword) {
        return res.status(400).json({
          type: "error",
          message: "Please provide new password",
        });
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      if (!userId) {
        return res.status(400).json({
          type: "error",
          message: "Invalid token",
        });
      }

      // Check if user exists
      const [users] = await pool.query("SELECT * FROM USERS WHERE id = ?", [
        userId,
      ]);

      if (users.length === 0) {
        return res.status(400).json({
          type: "error",
          message: "User not found",
        });
      }
      const user = users[0];
      const isVerified = user.verified || null;

      if (!isVerified) {
        return res.status(400).json({
          type: "error",
          message: "Email not verified. Please verify your email.",
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update user password
      await pool.query("UPDATE USERS SET password = ? WHERE id = ?", [
        hashedPassword,
        userId,
      ]);

      res.status(200).json({
        type: "success",
        message: "Password reset successfully. You can now log in.",
      });
    } catch (error) {
      console.log("Error in reset password:", error);
      return res.status(500).json({
        type: "error",
        message: "Error resetting password",
      });
    }
  }
}

const userAuthController = new UserAuthController();

export default userAuthController;
