import { Router } from 'express';
import authRoutes from './auth.routes';
// Assuming you have other route files, you'd import them here too:
// import userRoutes from './users.routes';
// import listingsRoutes from './listings.routes';

const router = Router();

router.use('/auth', authRoutes);
// router.use('/users', userRoutes); // Example for other routes
// router.use('/listings', listingsRoutes); // Example for other routes

export default router;
