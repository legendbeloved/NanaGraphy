import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from "resend";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY);

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

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

      const { error: dbError } = await supabase.from('bookings').insert({
        client_name: bookingData.clientName,
        email: 'no-email-provided@m.com',
        phone: bookingData.clientPhone,
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
        to: "legendbeloved@gmail.com", // Nana's email
        subject: `New Booking Inquiry: ${bookingData.clientName}`,
        html: `
          <h1>New Inquiry Received</h1>
          <p><strong>Client:</strong> ${bookingData.clientName} (Phone: ${bookingData.clientPhone})</p>
          <p><strong>Service:</strong> ${bookingData.serviceType}</p>
          <p><strong>Preferred Dates:</strong> ${bookingData.datePreference && bookingData.datePreference.length > 0 ? bookingData.datePreference.map((d: string) => new Date(d).toLocaleDateString()).join(", ") : 'None'}</p>
          <p><strong>Vision:</strong> ${bookingData.message}</p>
          <p><strong>Gift Details:</strong> ${extraNotes || 'None'}</p>
        `,
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Email error:", error);
      res.status(500).json({ error: "Failed to send emails" });
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
