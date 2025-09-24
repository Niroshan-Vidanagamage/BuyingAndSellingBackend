// File: src/controllers/auth.controller.ts
//register validates body(Zod), checks duplicate email, hashes, password(bycriptjs), creates user, returns access+ refresh JWTs
//login verifies passwords and return tokens
//refresh verifies refresh token and returns a new access token
//logout is no-op (JWT is stateless)

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import env from '../config/env';
import { hashPassword, verifyPassword } from '../utils/passwords';
import { RegisterSchema, LoginSchema } from '../validation/auth.schema';
import { created, ok, badRequest, unauthorized } from '../utils/responses';

function signAccessToken(user: { _id: any; email: string; role?: string }) {
    return jwt.sign({ sub: String(user._id), email: user.email, role: user.role || 'user' }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES });
}


function signRefreshToken(user: { _id: any; email: string }) {
    return jwt.sign({ sub: String(user._id), email: user.email }, env.REFRESH_SECRET, { expiresIn: env.REFRESH_EXPIRES });
}


export async function register(req: Request, res: Response) {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, parsed.error.issues.map(i=>i.message).join(', '));
    const { name, email, phone, password } = parsed.data;


    const exists = await User.findOne({ email }).lean();
    if (exists) return badRequest(res, 'Email already in use');


    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, phone, passwordHash });


    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    return created(res, { accessToken, refreshToken });
}


export async function login(req: Request, res: Response) {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, parsed.error.issues.map(i=>i.message).join(', '));
    const { email, password } = parsed.data;


    const user = await User.findOne({ email });
    if (!user) return unauthorized(res, 'Invalid credentials');


    const okPwd = await verifyPassword(password, user.passwordHash);
    if (!okPwd) return unauthorized(res, 'Invalid credentials');


    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    return ok(res, { accessToken, refreshToken });
}


export async function refresh(req: Request, res: Response) {
    const { refreshToken } = req.body || {};
    if (!refreshToken) return badRequest(res, 'Missing refresh token');
    try {
        const decoded = jwt.verify(refreshToken, env.REFRESH_SECRET) as any;
        const user = await User.findById(decoded.sub).lean();
        if (!user) return unauthorized(res, 'User not found');
        const accessToken = signAccessToken(user as any);
        return ok(res, { accessToken });
    } catch {
        return unauthorized(res, 'Invalid refresh token');
    }
}


export async function logout(_req: Request, res: Response) {
    // Stateless JWT: client just discards tokens
    return ok(res, { success: true });
}