// File: src/utils/responses.ts
//small helpers to standardize json responses (ok, created, badRequest, etc)
import { Response } from 'express';


export function ok<T>(res: Response, data: T, status = 200) {
    return res.status(status).json(data);
}


export function created<T>(res: Response, data: T) {
    return res.status(201).json(data);
}


export function badRequest(res: Response, message = 'Bad request') {
    return res.status(400).json({ error: message });
}


export function unauthorized(res: Response, message = 'Unauthorized') {
    return res.status(401).json({ error: message });
}


export function forbidden(res: Response, message = 'Forbidden') {
    return res.status(403).json({ error: message });
}


export function serverError(res: Response, message = 'Server error') {
    return res.status(500).json({ error: message });
}