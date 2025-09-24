// routes/listings.routes.ts
//GET /listings > seatch and fileter (public)
//GET /listing/:id > listning detail (public)
//POST /listing > create (auth+ uploadPhotos)
//PATCH /listings/:id > update(auth+ uploadPhotos)
//DELETE /listings/:id > soft delete (auth)

import { Router } from 'express';
import { createListing, getListing, listListings, updateListing, deleteListing } from '../controllers/listings.controller';
import { auth } from '../middleware/auth';
import { uploadPhotos } from '../middleware/upload';
const r = Router();


r.get('/', listListings);
r.get('/:id', getListing);
r.post('/', auth, uploadPhotos, createListing);
r.patch('/:id', auth, uploadPhotos, updateListing);
r.delete('/:id', auth, deleteListing);
export default r;