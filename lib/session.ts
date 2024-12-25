import { SessionOptions } from "iron-session";

export interface SessionData {
  id: string;
  name: string;
  email: string;
  isLoggedIn: boolean;
  rateLimit?: number;
  rateLimitLastAt?: Date;
}

export const defaultSession: SessionData = {
  id: "",
  name: "",
  email: "",
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD as string,
  cookieName: "myapp_secure_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
