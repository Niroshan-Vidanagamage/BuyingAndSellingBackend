import { Request, Response } from 'express';
import Listing from '../models/listingModel';

// A helper type for authenticated requests
interface AuthRequest extends Request {
  user?: { _id: string }; // Assuming JWT middleware adds user to request
}

export const getListings = async (req: AuthRequest, res: Response) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      condition,
      sort = 'newest', // Default sort
      limit,
      mine,
    } = req.query;

    const filter: any = {};

    if (category) filter.category = category as string;
    if (condition) filter.condition = condition as string;
    if (mine === 'true' && req.user) {
      filter.seller = req.user._id;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let query = Listing.find(filter);

    // Sorting logic
    switch (sort) {
      case 'price_asc':
        query = query.sort({ price: 1 });
        break;
      case 'price_desc':
        query = query.sort({ price: -1 });
        break;
      case 'newest':
      default:
        query = query.sort({ createdAt: -1 });
        break;
    }

    // Limit for pagination or latest ads
    if (limit) {
      const limitNumber = parseInt(limit as string, 10);
      if (!isNaN(limitNumber)) {
        query = query.limit(limitNumber);
      }
    }

    const items = await query.populate('seller', 'phone email').exec();

    res.status(200).json({ items });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// You would add other controller functions here (create, getById, update, delete)