import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Razorpay from "razorpay";
import dayjs from "dayjs";
import multer from "multer";
import path from "path";

export const sendVerificationEmail = async (
  userId,
  name,
  email,
  mailOptions
) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASSKEY
      }
    });

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};

export const razorpayHelper = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const getTablePrice = (bookingDate, startTime, endTime) => {
  const start = dayjs(`${bookingDate}T${startTime}`);
  const end = dayjs(`${bookingDate}T${endTime}`);

  if (!start.isValid() || !end.isValid()) return 0;

  const durationInHours = end.diff(start, "hour", true);
  const roundedHours = Math.ceil(durationInHours);

  return Math.max(roundedHours, 1) * 100;
};

// Use memory storage to keep file in memory
const storage = multer.memoryStorage();

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

// Set up multer upload
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Business hours validation
export const validateBusinessHours = (startTime, endTime) => {
  const OPENING_HOUR = "09:00";
  const CLOSING_HOUR = "22:00";
  const MIN_BOOKING_DURATION = 1; // hours
  const MAX_BOOKING_DURATION = 4; // hours

  if (startTime < OPENING_HOUR || endTime > CLOSING_HOUR) {
    return {
      isValid: false,
      message: `Booking must be within business hours (${OPENING_HOUR} - ${CLOSING_HOUR})`
    };
  }

  // Calculate duration in hours
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  const durationHours = (end - start) / (1000 * 60 * 60);

  if (durationHours < MIN_BOOKING_DURATION) {
    return {
      isValid: false,
      message: `Minimum booking duration is ${MIN_BOOKING_DURATION} hour(s)`
    };
  }

  if (durationHours > MAX_BOOKING_DURATION) {
    return {
      isValid: false,
      message: `Maximum booking duration is ${MAX_BOOKING_DURATION} hours`
    };
  }

  return { isValid: true };
};
