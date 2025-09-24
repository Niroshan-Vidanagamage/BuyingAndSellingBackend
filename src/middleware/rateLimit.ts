// File: src/middleware/rateLimit.ts
//Two redy made limiters> authLimiter for /auth/*
//>uploadLimiter for heavy routes (if you wire it)
import rateLimit from 'express-rate-limit';


export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});


export const uploadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
});