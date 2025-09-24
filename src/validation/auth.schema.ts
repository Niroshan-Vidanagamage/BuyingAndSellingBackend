// File: src/validation/auth.schema.ts
//Zod schemas for register, login, PATCH /me
//controllers safeParse the request and return 400s on valid input
import { z } from 'zod';


export const RegisterSchema = z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    phone: z.string().min(6).max(20),
    password: z.string().min(6).max(100),
});


export const LoginSchema = z.object({
email: z.string().email(),
password: z.string().min(6).max(100),
});


export const UpdateMeSchema = z.object({
    name: z.string().min(2).max(80),
    phone: z.string().min(6).max(20),
    city: z.string().max(120).optional().or(z.literal('')),
});


export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateMeInput = z.infer<typeof UpdateMeSchema>;