import { z } from "zod";

export const TravelAgentRegisterSchema = z.object({
  name: z.string().min(3, {
    message: "Name should be at least 3 characters long",
  }),
  company: z.string().min(3, {
    message: "Company name should be at least 3 characters long",
  }),
  address: z.string().min(3, {
    message: "Address should be at least 3 characters long",
  }),
  phoneNumber: z.string(),
  country: z.string().min(3, {
    message: "Country should be at least 3 characters long",
  }),
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z.string().min(8, {
    message: "Password should be at least 8 characters long",
  }),
});
export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
});

export const PasswordResetSchema = z.object({
  password: z.string().min(8, {
    message: "Password should be at least 8 characters long",
  }),
});
export const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  mobile: z
    .string()
    .min(10, { message: "Please enter a valid mobile number." }),
});
