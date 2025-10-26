import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${options.to}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};
