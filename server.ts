import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/bookings", async (req, res) => {
    const bookingData = req.body;

    try {
      // 1. Send confirmation email to client
      await resend.emails.send({
        from: "NanaGraphy <bookings@nanagraphy.com>",
        to: bookingData.email,
        subject: "We've received your inquiry! - NanaGraphy",
        html: `
          <h1>Hello ${bookingData.fullName.split(' ')[0]},</h1>
          <p>Thank you for reaching out to NanaGraphy. We've received your inquiry for a <strong>${bookingData.serviceType}</strong> session.</p>
          <p>Nana will review your vision and get back to you within 48 hours.</p>
          <hr />
          <p><strong>Summary:</strong></p>
          <ul>
            <li>Date: ${bookingData.preferredDate}</li>
            <li>Time: ${bookingData.preferredTime}</li>
            <li>Location: ${bookingData.location}</li>
          </ul>
          <p>Best regards,<br />The NanaGraphy Team</p>
        `,
      });

      // 2. Send notification email to Nana
      await resend.emails.send({
        from: "NanaGraphy System <system@nanagraphy.com>",
        to: "legendbeloved@gmail.com", // Nana's email
        subject: `New Booking Inquiry: ${bookingData.fullName}`,
        html: `
          <h1>New Inquiry Received</h1>
          <p><strong>Client:</strong> ${bookingData.fullName} (${bookingData.email})</p>
          <p><strong>Service:</strong> ${bookingData.serviceType}</p>
          <p><strong>Date:</strong> ${bookingData.preferredDate}</p>
          <p><strong>Vision:</strong> ${bookingData.vision}</p>
          <p><strong>Budget:</strong> ${bookingData.budget}</p>
          <p><strong>Styles:</strong> ${bookingData.styles.join(", ")}</p>
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
