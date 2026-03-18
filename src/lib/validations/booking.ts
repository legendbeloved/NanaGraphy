import { z } from "zod";

export const bookingSchema = z.object({
  // Step 1
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  referral: z.enum(["Instagram", "Google", "Referral", "Other"]),

  // Step 2
  serviceType: z.enum(["Portraits", "Lifestyle Session", "Event Coverage", "Brand Shoot"]),
  preferredDate: z.string().min(1, "Please select a date"),
  preferredTime: z.enum(["Golden Hour Morning", "Midday", "Golden Hour Evening"]),
  location: z.string().min(2, "Location preference is required"),
  vision: z.string().min(10, "Please provide a brief description").max(200, "Description must be under 200 characters"),

  // Step 3
  budget: z.enum(["₦50k–₦100k", "₦100k–₦250k", "₦250k–₦500k", "₦500k+"]),
  styles: z.array(z.string()).min(1, "Please select at least one style"),
  additionalInfo: z.string().optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;
