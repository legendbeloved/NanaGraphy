import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from "resend";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY);

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;
const twilioFrom = process.env.TWILIO_WHATSAPP_NUMBER;
const twilioAdmin = process.env.TWILIO_ADMIN_WHATSAPP_NUMBER;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/bookings", async (req, res) => {
    const bookingData = req.body;

    try {
      // 0. Save booking to Supabase database
      let extraNotes = bookingData.isGift 
        ? `GIFT for: ${bookingData.giftRecipientName} (Phone: ${bookingData.giftRecipientPhone}). Message: ${bookingData.giftMessage}` 
        : "";

      if (bookingData.datePreference && bookingData.datePreference.length > 1) {
        extraNotes += ` | Additional preferred dates: ${bookingData.datePreference.map((d: string) => new Date(d).toLocaleDateString()).join(", ")}`;
      }

      const preferredDate = bookingData.datePreference && bookingData.datePreference.length > 0 
        ? new Date(bookingData.datePreference[0]).toISOString().split('T')[0] 
        : null;

      const { data: dbData, error: dbError } = await supabase.from('bookings').insert({
        client_name: bookingData.clientName,
        email: 'no-email-provided@m.com',
        phone: bookingData.clientPhone,
        service_type: bookingData.serviceType,
        preferred_date: preferredDate,
        vision_description: bookingData.message,
        additional_notes: extraNotes.trim(),
        status: 'pending'
      }).select('id').single();

      if (dbError) {
        console.error("Database insert error:", dbError);
      }
      
      const bookingId = dbData?.id;

      // 1. Send notification email to Nana
      await resend.emails.send({
        from: "NanaGraphy System <system@nanagraphy.com>",
        to: "nanaysha28@gmail.com", // Nana's email
        subject: `New Booking Inquiry: ${bookingData.clientName}${bookingData.isAnonymous ? ' (Anonymous Gift)' : ''}`,
        html: `
          <h1>New Inquiry Received</h1>
          <p><strong>Client:</strong> ${bookingData.clientName} (Phone: ${bookingData.clientPhone})</p>
          <p><strong>Service:</strong> ${bookingData.serviceType}</p>
          <p><strong>Preferred Dates:</strong> ${bookingData.datePreference && bookingData.datePreference.length > 0 ? bookingData.datePreference.map((d: string) => new Date(d).toLocaleDateString()).join(", ") : 'None'}</p>
          <p><strong>Vision:</strong> ${bookingData.message}</p>
          <p><strong>Gift Details:</strong> ${extraNotes || 'None'}</p>
          ${bookingData.isAnonymous ? '<p><strong>Note:</strong> The client requested to remain anonymous to the recipient.</p>' : ''}
        `,
      });

      // 2. Send WhatsApp Notification to Admin
      if (twilioClient && twilioFrom && twilioAdmin) {
        try {
          await twilioClient.messages.create({
            body: `New Aventa Inquiry from ${bookingData.clientName}!\nService: ${bookingData.serviceType}\nPhone: ${bookingData.clientPhone}\nGift: ${bookingData.isGift ? 'Yes' : 'No'}${bookingData.isAnonymous ? ' (Anonymous)' : ''}`,
            from: twilioFrom,
            to: twilioAdmin
          });
        } catch (twErr) {
          console.error("Twilio admin notification error:", twErr);
        }
      }

      // 3. Send WhatsApp Notification to Gift Recipient (if applicable)
      if (bookingData.isGift && bookingData.giftRecipientPhone && twilioClient && twilioFrom && bookingId) {
        try {
          // Format phone number to ensure it has '+' if needed. Twilio requires E.164.
          // For simplicity, we assume the frontend sends a valid format or user entered +...
          let recipientPhone = bookingData.giftRecipientPhone.trim();
          if (!recipientPhone.startsWith('+')) recipientPhone = '+' + recipientPhone;
          
          // Ensure it's prefixed with 'whatsapp:'
          if (!recipientPhone.startsWith('whatsapp:')) recipientPhone = 'whatsapp:' + recipientPhone;

          const appUrl = process.env.APP_URL || 'http://localhost:5173';
          const redeemUrl = `${appUrl}/redeem/${bookingId}`;
          
          const gifterName = bookingData.isAnonymous ? 'someone special' : bookingData.clientName;
          await twilioClient.messages.create({
            body: `Hi ${bookingData.giftRecipientName || 'there'}! 🎉\n\nYou've been gifted an Aventa photography session by ${gifterName}!\n\nMessage: "${bookingData.giftMessage || 'Enjoy your gift!'}"\n\nPlease click the link below to claim your gift and select your preferred dates:\n${redeemUrl}`,
            from: twilioFrom,
            to: recipientPhone
          });
        } catch (twErr) {
          console.error("Twilio recipient notification error:", twErr);
        }
      }

      res.status(200).json({ success: true, bookingId });
    } catch (error) {
      console.error("Email error:", error);
      res.status(500).json({ error: "Failed to send emails" });
    }
  });

  app.post("/api/subscribe", async (req, res) => {
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
