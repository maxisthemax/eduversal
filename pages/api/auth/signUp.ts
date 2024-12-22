import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

//*lib
import prisma from "@/lib/prisma";
import { validateRequiredFields } from "@/helpers/apiHelpers";

type SignUpRequest = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  country_code: string;
  phone_no: string;
  address_1: string;
  address_2: string;
  postcode: string;
  state: string;
  city: string;
};

export default async function signUpHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests are allowed" });
  }
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
  }: SignUpRequest = req.body;

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

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verification_token = uuidv4();
    const verification_token_expiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

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
        verification_token,
        verification_token_expiry,
      },
    });
    res.status(201).json({
      message: "User registered successfully",
      user: { ...newUser },
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error });
  }
}
