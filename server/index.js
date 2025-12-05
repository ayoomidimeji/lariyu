import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from the root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase Admin Client
// note: these should be in your .env file
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// CRITICAL: We need the SERVICE_ROLE_KEY to generate links, not the Anon key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('WARNING: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

app.post('/api/signup', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // 1. Generate Signup Link using Admin API
        const { data, error } = await supabase.auth.admin.generateLink({
            type: 'signup',
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                },
                redirectTo: 'https://lariyu.vercel.app/email-confirmation', // Adjust for production
            },
        });

        if (error) throw error;

        const { user, properties } = data;
        const confirmationLink = properties.action_link;
        console.log("Generated Link: ", confirmationLink);
        // const confirmationLink = properties.email_otp; // if you want OTP

        // 2. Send Email with Nodemailer
        const mailOptions = {
            from: `"Lariyu Luxury Steps" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Lariyu! Confirm your Email',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to Lariyu Luxury Steps!</h1>
          <p>Hi ${firstName},</p>
          <p>Thank you for signing up. Please verify your email address to continue.</p>
          <a href="${confirmationLink}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px;">Verify Email</a>
          <p>Or paste this link in your browser:</p>
          <p>${confirmationLink}</p>
          <p>This link will expire in 5 minutes.</p>
        </div>
      `,
        };

        await transporter.sendMail(mailOptions);

        console.log(`Confirmation email sent to ${email}`);
        res.json({ message: 'Confirmation email sent successfully' });

    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: err.message || 'Error processing signup' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
