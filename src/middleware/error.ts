// File: src/middleware/error.ts
//Normalizes errors(Zod validation > 400, Multer file errors> 400, unknown> 500)
//Register after all routes

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';


export class AppError extends Error {
    status: number;
    constructor(message: string, status = 400) {
    super(message);
    this.status = status;
}
}


export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof ZodError) {
        return res.status(400).json({ error: err.issues.map(i => i.message).join(', ') });
    }
    if (err instanceof AppError) {
        return res.status(err.status).json({ error: err.message });
    }
    // Multer errors or generic
    if (err?.message?.startsWith('Only JPEG') || err?.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: err.message || 'File too large' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
}