import express from 'express';
import { getListings } from '../controllers/listingController';
// Assuming you have authentication middleware
// import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// GET /api/listings
router.get('/', getListings);

export default router;