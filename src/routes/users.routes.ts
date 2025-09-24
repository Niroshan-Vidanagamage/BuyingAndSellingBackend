// File: src/routes/users.routes.ts
//GET /me > current user profile (requres auth)
//PATCH /me > update name/phone/city (requires auth)

import { Router } from 'express';
import { auth } from '../middleware/auth';
import { getMe, updateMe } from '../controllers/users.controller';


const r = Router();
r.get('/me', auth, getMe);
r.patch('/me', auth, updateMe);
export default r;



