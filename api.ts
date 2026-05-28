import express from "express";
import { Resend } from "resend";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY);

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
    }

    // 1. Send notification email to Nana
    await resend.emails.send({
      from: "NanaGraphy System <system@nanagraphy.com>",
      to: "nanaysha28@gmail.com", // Nana's email
      subject: `New Booking Inquiry: ${bookingData.clientName}${bookingData.isAnonymous ? ' (Anonymous Gift)' : ''}`,
      html: `
        <h1>New Inquiry Received</h1>
        <p><strong>Client:</strong> ${bookingData.clientName} (Email: ${bookingData.clientEmail})</p>
        <p><strong>Service:</strong> ${bookingData.serviceType}</p>
        <p><strong>Preferred Dates:</strong> ${bookingData.datePreference && bookingData.datePreference.length > 0 ? bookingData.datePreference.map((d: string) => new Date(d).toLocaleDateString()).join(", ") : 'None'}</p>
        <p><strong>Vision:</strong> ${bookingData.message}</p>
        <p><strong>Gift Details:</strong> ${extraNotes || 'None'}</p>
        ${bookingData.isAnonymous ? '<p><strong>Note:</strong> The client requested to remain anonymous to the recipient.</p>' : ''}
      `,
    });

    // 2. Send Email Notification to Gift Recipient (if applicable)
    if (bookingData.isGift && bookingData.giftRecipientEmail && bookingId) {
      try {
        const appUrl = process.env.APP_URL || 'https://nana-graphy.vercel.app';
        const redeemUrl = `${appUrl}/redeem/${bookingId}`;
        
        const gifterName = bookingData.isAnonymous ? 'someone special' : bookingData.clientName;
        
        await resend.emails.send({
          from: "NanaGraphy Gifts <gifts@nanagraphy.com>",
          to: bookingData.giftRecipientEmail,
          subject: `You've been gifted an Aventa session! 🎉`,
          html: `
            <h1>Hi ${bookingData.giftRecipientName || 'there'}! 🎉</h1>
            <p>You've been gifted an Aventa photography session by ${gifterName}!</p>
            <p><strong>Message:</strong> "${bookingData.giftMessage || 'Enjoy your gift!'}"</p>
            <p>Please click the link below to claim your gift and select your preferred dates:</p>
            <a href="${redeemUrl}" style="display:inline-block;padding:12px 24px;background-color:#0f172a;color:#fff;text-decoration:none;border-radius:999px;margin-top:16px;">Claim Your Gift</a>
          `,
        });
      } catch (emailErr) {
        console.error("Recipient email notification error:", emailErr);
      }
    }

    res.status(200).json({ success: true, bookingId });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ error: "Failed to send emails" });
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
