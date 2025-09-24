// File: src/routes/auth.routes.ts
//POST /auth/register > creates user
//POST /auth/login > exchange email/password for JWTs.
//etc.....
//Rate-limited to avoid brute force

import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimit';
import { login, refresh, register, logout } from '../controllers/auth.controller';


const r = Router();
r.post('/register', authLimiter, register);
r.post('/login', authLimiter, login);
r.post('/refresh', refresh);
r.post('/logout', logout);
export default r;