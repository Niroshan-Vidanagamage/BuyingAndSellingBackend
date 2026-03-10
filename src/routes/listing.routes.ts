// routes/listings.routes.ts
//GET /listings > seatch and fileter (public)
//GET /listing/:id > listning detail (public)
//POST /listing > create (auth+ uploadPhotos)
//PATCH /listings/:id > update(auth+ uploadPhotos)
//DELETE /listings/:id > soft delete (auth)

import { Router } from 'express';
import Stripe from 'stripe';
import { createListing, getListing, listListings, updateListing, deleteListing } from '../controllers/listings.controller';
import { auth } from '../middleware/auth';
import { uploadPhotos } from '../middleware/upload';
import Listing from '../models/Listing'; // Make sure this path is correct for your Listing model

const r = Router();

// --- Stripe Initialization ---
// Ensure STRIPE_SECRET_KEY and FRONTEND_URL are in your backend's .env file
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

r.get('/', listListings);
r.get('/:id', getListing);
r.post('/', auth, uploadPhotos, createListing);
r.patch('/:id', auth, uploadPhotos, updateListing);
r.delete('/:id', auth, deleteListing);

/**
 * @route   POST /api/v1/listings/:id/create-checkout-session
 * @desc    Create a Stripe checkout session for a listing
 * @access  Private (requires auth)
 */
r.post('/:id/create-checkout-session', auth, async (req, res, next) => {
  try {
    if (!process.env.FRONTEND_URL) {
      throw new Error('FATAL: FRONTEND_URL environment variable is not set.');
    }

    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (!listing.price || listing.price <= 0) {
      return res.status(400).json({ error: 'Listing does not have a valid price.' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'lkr', // Or your desired currency e.g., 'usd'
            product_data: {
              name: listing.title,
            },
            unit_amount: Math.round(listing.price * 100), // Price in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/listing/${id}`,
      metadata: {
        listingId: listing._id.toString(),
        buyerId: (req as any).user.id, // Assumes auth middleware adds user to req
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    next(error); // Pass errors to your central error handler
  }
});

export default r;