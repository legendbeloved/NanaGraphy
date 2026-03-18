import { Resend } from 'resend';

let resendInstance: Resend | null = null;

function getResend() {
  if (!resendInstance) {
    const apiKey = process.env.VITE_RESEND_API_KEY;
    if (!apiKey || apiKey === 're_123456789') {
      console.warn('Resend API key is missing or using placeholder. Email sending will be disabled.');
      return null;
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export async function sendBookingNotification(bookingData: any) {
  try {
    const resend = getResend();
    if (!resend) {
      return { success: false, error: 'Resend not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: 'NanaGraphy <onboarding@resend.dev>',
      to: ['legendbeloved@gmail.com'], // Defaulting to user email for now
      subject: `New Booking Inquiry: ${bookingData.serviceType}`,
      html: `
        <h1>New Booking Inquiry</h1>
        <p><strong>Client:</strong> ${bookingData.clientName}</p>
        <p><strong>Email:</strong> ${bookingData.clientEmail}</p>
        <p><strong>Service:</strong> ${bookingData.serviceType}</p>
        <p><strong>Date Preference:</strong> ${bookingData.datePreference}</p>
        <p><strong>Message:</strong></p>
        <p>${bookingData.message}</p>
      `,
    });

    if (error) {
      console.error('Resend Error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
