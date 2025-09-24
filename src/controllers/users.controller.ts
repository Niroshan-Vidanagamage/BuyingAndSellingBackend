// File: src/controllers/users.controller.ts
//getMe returns safe profile fiels (no password hash)
//updateMe validates input and updates profile

import { Request, Response } from 'express';
import User from '../models/User';
import { UpdateMeSchema } from '../validation/auth.schema';
import { ok, badRequest } from '../utils/responses';


export async function getMe(req: Request, res: Response) {
    const userId = req.user?.sub;
    const user = await User.findById(userId).select('_id name email phone city role createdAt updatedAt').lean();
    return ok(res, user);
}


export async function updateMe(req: Request, res: Response) {
    const userId = req.user?.sub;
    const parsed = UpdateMeSchema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, parsed.error.issues.map(i=>i.message).join(', '));
    const { name, phone, city } = parsed.data;
    await User.updateOne({ _id: userId }, { $set: { name, phone, city } });
    const user = await User.findById(userId).select('_id name email phone city role createdAt updatedAt').lean();
    return ok(res, user);
}