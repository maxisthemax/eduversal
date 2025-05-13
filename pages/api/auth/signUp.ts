import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

//*helpers
import {
  validateRequiredFields,
  handleAllowedMethods,
  emailRegex,
  passwordRegex,
} from "@/helpers/apiHelpers";

//*lib
import prisma from "@/lib/prisma";

//*utils
import { sendEmail } from "@/utils/email";

export default async function signUp(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Use handleAllowedMethods for method validation
  if (handleAllowedMethods(req, res, ["POST"])) return;

  // Extract and validate request body
  const {
    first_name,
    last_name,
    email,
    password,
    country_code,
    phone_no,
    address_1,
    address_2,
    postcode,
    state,
    city,
  } = req.body;

  // Validate required fields
  if (
    !validateRequiredFields(req, res, [
      "first_name",
      "last_name",
      "email",
      "password",
      "country_code",
      "phone_no",
      "address_1",
      "postcode",
      "state",
      "city",
    ])
  ) {
    return;
  }

  // Validate email format
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Invalid email format",
      type: "INVALID_EMAIL_FORMAT",
    });
  }

  // Validate password strength
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long, contain a number, an alphabet, and an uppercase letter",
      type: "WEAK_PASSWORD",
    });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
        type: "USER_ALREADY_EXISTS",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token and expiry
    const verification_token = uuidv4();
    const verification_token_expiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    // Create new user in the database
    const newUser = await prisma.user.create({
      data: {
        first_name,
        last_name,
        email,
        password: hashedPassword,
        country_code,
        phone_no,
        address_1,
        address_2,
        postcode,
        state,
        city,
      },
    });

    // Create verification entry in the database
    await prisma.verification.create({
      data: {
        token: verification_token,
        token_expiry: verification_token_expiry,
        user_id: newUser.id,
        type: "EMAIL_VERIFICATION",
      },
    });

    // Generate verification link
    const verificationLink = `${
      process.env.NEXT_PUBLIC_URL
    }/verifyemail?token=${verification_token}&email=${encodeURIComponent(
      email
    )}`;

    // Validate environment variables
    if (!process.env.NEXT_EMAIL_FROM || !process.env.NEXT_EMAIL_PASS) {
      throw new Error("Email environment variables are not set");
    }

    // Send verification email
    await sendEmail({
      from: process.env.NEXT_EMAIL_FROM,
      to: email,
      subject: "Email Verification",
      html: `<p>Please verify your email by clicking the following link:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
    });

    // Respond with success message and user data
    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        country_code: newUser.country_code,
        phone_no: newUser.phone_no,
        address_1: newUser.address_1,
        address_2: newUser.address_2,
        postcode: newUser.postcode,
        state: newUser.state,
        city: newUser.city,
      },
      type: "USER_REGISTERED_SUCCESSFULLY",
    });
  } catch (error) {
    if (error.code === "EAUTH")
      res.status(500).json({
        message: error.response,
        error,
        type: "REGISTRATION_FAILED",
      });
    else
      res.status(500).json({
        message: "Registration failed",
        error,
        type: "REGISTRATION_FAILED",
      });
  }
}
