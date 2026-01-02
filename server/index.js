import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import slowDown from 'express-slow-down';
import RedisStore from 'rate-limit-redis';
import { createClient as createRedisClient } from 'redis';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from the root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 3000;

// ============================================
// REDIS CLIENT SETUP (for distributed rate limiting)
// ============================================
let redisClient = null;

// Helper function to create a new Redis store with unique prefix
const createRedisStore = (prefix) => {
    if (!redisClient || !redisClient.isOpen) {
        return null;
    }
    return new RedisStore({
        client: redisClient,
        prefix: `rl:${prefix}:`,
        sendCommand: (...args) => redisClient.sendCommand(args),
    });
};

const initializeRedis = async () => {
    if (process.env.REDIS_URL) {
        try {
            redisClient = createRedisClient({
                url: process.env.REDIS_URL,
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > 10) {
                            console.error('Redis: Too many reconnection attempts');
                            return new Error('Redis reconnection failed');
                        }
                        return Math.min(retries * 100, 3000);
                    }
                }
            });

            redisClient.on('error', (err) => console.error('Redis Client Error:', err));
            redisClient.on('connect', () => console.log('Redis: Connected'));
            redisClient.on('ready', () => console.log('Redis: Ready'));

            await redisClient.connect();

            console.log('✅ Redis store initialized for rate limiting');
        } catch (error) {
            console.warn('⚠️ Redis connection failed, using memory store:', error.message);
            redisClient = null;
        }
    } else {
        console.log('ℹ️ Using in-memory rate limiting (development mode)');
    }
};

// Initialize Redis
await initializeRedis();

// ============================================
// LOGGING UTILITY
// ============================================
const logger = {
    info: (message, meta = {}) => {
        console.log(JSON.stringify({ level: 'info', message, ...meta, timestamp: new Date().toISOString() }));
    },
    warn: (message, meta = {}) => {
        console.warn(JSON.stringify({ level: 'warn', message, ...meta, timestamp: new Date().toISOString() }));
    },
    error: (message, meta = {}) => {
        console.error(JSON.stringify({ level: 'error', message, ...meta, timestamp: new Date().toISOString() }));
    }
};

// ============================================
// DEVICE FINGERPRINTING
// ============================================
const generateFingerprint = (req) => {
    const components = [
        req.headers['user-agent'] || '',
        req.headers['accept-language'] || '',
        req.headers['accept-encoding'] || '',
        req.ip || '',
    ].join('|');
    
    return crypto.createHash('sha256').update(components).digest('hex').substring(0, 16);
};

// ============================================
// MIDDLEWARE SETUP
// ============================================

// 1. Security Headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// 2. Trust proxy (required for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// 3. Stricter CORS
const allowedOrigins = [
    'http://localhost:5173',
    'https://lariyu.vercel.app',
    ...(process.env.ADDITIONAL_ALLOWED_ORIGINS?.split(',') || [])
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            logger.warn('CORS rejection', { origin, ip: origin });
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-ID']
}));

// 4. Body Size Limits (prevent DoS)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============================================
// RATE LIMITING CONFIGURATION
// ============================================

const rateLimitHandler = (req, res) => {
    logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        userAgent: req.headers['user-agent'],
        limit: req.rateLimit?.limit,
        current: req.rateLimit?.current,
        remaining: req.rateLimit?.remaining,
    });
    
    // Ensure headers are set
    res.setHeader('Retry-After', Math.ceil((req.rateLimit?.resetTime?.getTime() - Date.now()) / 1000) || 60);
    
    res.status(429).json({
        error: 'Too many requests',
        message: 'Please try again later',
        retryAfter: req.rateLimit?.resetTime || new Date(Date.now() + 70000),
        limit: req.rateLimit?.limit,
        remaining: 0
    });
};

const skipStaticPaths = (req) => {
    const skipPaths = ['/health', '/metrics', '/favicon.ico'];
    return skipPaths.some(path => req.path.startsWith(path));
};

// Global Rate Limiter (adjusted for better UX)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // 20 req/min
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.',
    handler: rateLimitHandler,
    skip: skipStaticPaths,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    ...(redisClient && { store: createRedisStore('global') })
});

// Apply global limiter to all requests
app.use(limiter);

// Specific Limiter for Signup (IP based)
const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: 'Too many accounts created from this IP, please try again after an hour.',
    handler: rateLimitHandler,
    keyGenerator: (req, res) => `signup:ip:${ipKeyGenerator(req, res)}`,
    ...(redisClient && { store: createRedisStore('signup-ip') })
});

// Email-based Rate Limiter for Signup
const emailSignupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Reduced from 5 for better security
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: 'Too many signup attempts for this email, please try again after an hour.',
    handler: rateLimitHandler,
    keyGenerator: (req) => {
        if (!req.body.email) {
            throw new Error('Email is required');
        }
        return `signup:email:${req.body.email.toLowerCase().trim()}`;
    },
    ...(redisClient && { store: createRedisStore('signup-email') })
});

// Device-based Rate Limiter for Signup (using fingerprint)
const deviceSignupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: 'Too many signup attempts from this device, please try again after an hour.',
    handler: rateLimitHandler,
    keyGenerator: (req) => {
        const fingerprint = generateFingerprint(req);
        return `signup:device:${fingerprint}`;
    },
    ...(redisClient && { store: createRedisStore('signup-device') })
});

// API Key Rate Limiter (if you implement API keys later)
const apiKeyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased for API usage
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: 'API key rate limit exceeded.',
    handler: rateLimitHandler,
    keyGenerator: (req) => {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) {
            return `api:ip:${ipKeyGenerator(req, res)}`;
        }
        return `api:key:${apiKey}`;
    },
    ...(redisClient && { store: createRedisStore('api-key') })
});

// Exponential Backoff (Slowdown) for Signup
const signupSlowDown = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 2,
    delayMs: (hits) => Math.min(Math.pow(2, hits - 2) * 1000, 30000),
    ...(redisClient && { store: createRedisStore('signup-slowdown') })
});

// ============================================
// SUPABASE CLIENT SETUP
// ============================================
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    logger.error('CRITICAL: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1); // Exit in production
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// ============================================
// NODEMAILER SETUP
// ============================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
    if (error) {
        logger.error('Email transporter verification failed', { error: error.message });
    } else {
        logger.info('Email transporter is ready');
    }
});

// ============================================
// INPUT VALIDATION & SANITIZATION
// ============================================
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
};

// ============================================
// ROUTES
// ============================================

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        redis: redisClient?.isOpen ? 'connected' : 'disconnected'
    });
});

// Test endpoint to check rate limit headers
app.get('/api/test-rate-limit', (req, res) => {
    res.json({
        message: 'Rate limit test successful',
        rateLimit: {
            limit: req.rateLimit?.limit,
            current: req.rateLimit?.current,
            remaining: req.rateLimit?.remaining,
            resetTime: req.rateLimit?.resetTime
        },
        headers: {
            'RateLimit-Limit': res.getHeader('RateLimit-Limit'),
            'RateLimit-Remaining': res.getHeader('RateLimit-Remaining'),
            'RateLimit-Reset': res.getHeader('RateLimit-Reset')
        }
    });
});

// Signup endpoint with all protections
app.post('/api/signup', 
    signupSlowDown, 
    signupLimiter, 
    emailSignupLimiter, 
    deviceSignupLimiter, 
    async (req, res) => {
        const startTime = Date.now();
        
        try {
            // 1. Extract and sanitize inputs
            let { email, password, firstName, lastName } = req.body;
            
            email = sanitizeInput(email)?.toLowerCase();
            firstName = sanitizeInput(firstName);
            lastName = sanitizeInput(lastName);
            
            // 2. Validate required fields
            if (!email || !password) {
                return res.status(400).json({ 
                    error: 'Email and password are required' 
                });
            }
            
            // 3. Validate email format
            if (!validateEmail(email)) {
                return res.status(400).json({ 
                    error: 'Invalid email format' 
                });
            }
            
            // 4. Validate password strength
            if (password.length < 8) {
                return res.status(400).json({ 
                    error: 'Password must be at least 8 characters' 
                });
            }
            
            // 5. Validate name fields
            if (firstName && firstName.length > 50) {
                return res.status(400).json({ 
                    error: 'First name is too long' 
                });
            }
            
            if (lastName && lastName.length > 50) {
                return res.status(400).json({ 
                    error: 'Last name is too long' 
                });
            }
            
            // 6. Generate Signup Link using Admin API
            const { data, error } = await supabase.auth.admin.generateLink({
                type: 'signup',
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                    },
                    redirectTo: process.env.REDIRECT_URL || 'https://lariyu.vercel.app/email-confirmation',
                },
            });
            
            if (error) {
                logger.error('Supabase signup error', { 
                    error: error.message, 
                    email,
                    code: error.code 
                });
                
                // Handle specific errors
                if (error.message.includes('already registered')) {
                    return res.status(409).json({ 
                        error: 'Email already registered' 
                    });
                }
                
                throw error;
            }
            
            const { properties } = data;
            const confirmationLink = properties.action_link;
            
            // 7. Send Email with Nodemailer
            const mailOptions = {
                from: `"Lariyu Luxury Steps" <${process.env.GMAIL_USER}>`,
                to: email,
                subject: 'Welcome to Lariyu! Confirm your Email',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">Welcome to Lariyu Luxury Steps!</h1>
                        <p>Hi ${firstName || 'there'},</p>
                        <p>Thank you for signing up. Please verify your email address to continue.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${confirmationLink}" 
                               style="display: inline-block; padding: 14px 28px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                Verify Email Address
                            </a>
                        </div>
                        <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
                        <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px;">
                            ${confirmationLink}
                        </p>
                        <p style="color: #999; font-size: 12px; margin-top: 30px;">
                            <strong>Note:</strong> This link will expire in 5 minutes for security reasons.
                        </p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p style="color: #999; font-size: 11px;">
                            If you didn't create an account, please ignore this email.
                        </p>
                    </div>
                `,
            };
            
            await transporter.sendMail(mailOptions);
            
            const duration = Date.now() - startTime;
            logger.info('Signup successful', { 
                email, 
                duration,
                ip: req.ip 
            });
            
            res.json({ 
                message: 'Confirmation email sent successfully',
                email: email 
            });
            
        } catch (err) {
            const duration = Date.now() - startTime;
            logger.error('Signup error', { 
                error: err.message, 
                stack: err.stack,
                duration,
                ip: req.ip 
            });
            
            res.status(500).json({ 
                error: 'Error processing signup. Please try again later.' 
            });
        }
    }
);

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error', { 
        error: err.message, 
        stack: err.stack,
        path: req.path 
    });
    
    res.status(err.status || 500).json({ 
        error: 'Internal server error' 
    });
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received, starting graceful shutdown`);
    
    if (redisClient) {
        await redisClient.quit();
        logger.info('Redis connection closed');
    }
    
    process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============================================
// EXPORT & START SERVER
// ============================================

// Export the app for Vercel
export default app;

// Only listen if this file is run directly (not imported)
if (process.argv[1] === __filename) {
    app.listen(port, () => {
        logger.info(`Server running at http://localhost:${port}`, {
            environment: process.env.NODE_ENV || 'development',
            redis: redisClient?.isOpen ? 'enabled' : 'disabled'
        });
    });
}