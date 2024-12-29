import { SessionOptions } from "iron-session";

export interface SessionData {
  id: string;
  name: string;
  email: string;
  role: "SUPERADMIN" | "ADMIN" | "USER";
  isLoggedIn: boolean;
  rateLimit?: number;
  rateLimitLastAt?: Date;
}

export const defaultSession: SessionData = {
  id: "",
  name: "",
  email: "",
  role: "USER",
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD as string,
  cookieName: "eduversal_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
