import { body } from "express-validator";

export function registerValidator() {
  return [
    body("fullName")
      .trim()
      .notEmpty()
      .withMessage("Full Name is required")
      .isLength({ min: 6 })
      .withMessage("User Name must contain at least 6 characters")
      .isLength({ max: 35 })
      .withMessage("Full Name must contain at less than 36 characters"),
    body("userName")
      .trim()
      .notEmpty()
      .withMessage("User Name is required")
      .isLength({ min: 6 })
      .withMessage("Full Name must contain at least 6 characters")
      .isLength({ max: 20 })
      .withMessage("User Name must contain less than 20 characters"),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Enter a valid email")
      .normalizeEmail(),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("Password must contain at least one symbol"),
  ];
}
