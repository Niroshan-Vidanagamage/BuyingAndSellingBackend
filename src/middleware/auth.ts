// File: src/middleware/auth.ts
//reads Autharization: Bearer <token>, verifies with JWT_SECRET.
//Attaches req.user ={_id,email,role}. Routes that require auth rely on this
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';


export interface JwtPayload {
    sub: string;
    email: string;
    role?: 'user'|'admin';
}


export function auth(req: Request, res: Response, next: NextFunction) {
    try {
        const hdr = req.headers.authorization || '';
        const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : '';
        if (!token) return res.status(401).json({ error: 'Missing token' });
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}