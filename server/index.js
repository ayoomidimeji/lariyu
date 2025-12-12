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
import helmet from 'helmet';

// Middleware

// 1. Security Headers
app.use(helmet());

// 2. Stricter CORS
const allowedOrigins = ['http://localhost:5173', 'https://lariyu.vercel.app'];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        // OR checks if the origin is in the allowed list
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true // Allow cookies/headers if needed
}));

// 3. Body Size Limits (prevent DoS)
app.use(express.json({ limit: '10kb' }));

// Rate Limiting
import rateLimit from 'express-rate-limit';

// Global Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again later.'
});

// Apply global limiter to all requests
app.use(limiter);

// Specific Limiter for Signup to prevent abuse
const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 signup requests per hour
    message: 'Too many accounts created from this IP, please try again after an hour.'
});

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

app.post('/api/signup', signupLimiter, async (req, res) => {
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
