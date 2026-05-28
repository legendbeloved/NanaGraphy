import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);



export const apiRouter = express.Router();

apiRouter.post("/bookings", async (req, res) => {
  const bookingData = req.body;

  try {
    // 0. Save booking to Supabase database
    let extraNotes = bookingData.isGift 
      ? `GIFT for: ${bookingData.giftRecipientName} (Email: ${bookingData.giftRecipientEmail}). Message: ${bookingData.giftMessage}` 
      : "";

    if (bookingData.datePreference && bookingData.datePreference.length > 1) {
      extraNotes += ` | Additional preferred dates: ${bookingData.datePreference.map((d: string) => new Date(d).toLocaleDateString()).join(", ")}`;
    }

    const preferredDate = bookingData.datePreference && bookingData.datePreference.length > 0 
      ? new Date(bookingData.datePreference[0]).toISOString().split('T')[0] 
      : null;

    const bookingId = crypto.randomUUID();
    const { data: dbData, error: dbError } = await supabase.from('bookings').insert({
      id: bookingId,
      client_name: bookingData.clientName,
      email: bookingData.clientEmail || 'no-email-provided@m.com',
      phone: null,
      service_type: bookingData.serviceType,
      preferred_date: preferredDate,
      vision_description: bookingData.message,
      additional_notes: extraNotes.trim(),
      status: 'pending'
    });

    if (dbError) {
      console.error("Database insert error:", dbError);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json({ success: true, bookingId });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

apiRouter.post("/subscribe", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });
  try {
    const { error } = await supabase.from('newsletter_subscribers').insert({ email });
    if (error && error.code !== '23505') {
      console.error("Newsletter subscribe error:", error);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});
