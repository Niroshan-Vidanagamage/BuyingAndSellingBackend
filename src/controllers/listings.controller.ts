// controllers/listings.controller.ts
//createListing > Reads from fiels and files (via Multer UploadPhotos)
//>  Stores listing documents in Mongo
//> for each image: Uploads original to s3, generates Sharp thimbnail (webP, max 800px), uploads thumb
//> saves image metadata {key, url, w,h, kind} on the listing
//getListing> 'returns one listing; also populates public seller contact (email,phone, city) for the detail page
//listListing> applies filters: category,minPrice, maxPrice, condition, dateRange,sort+ pagination
//> supports mine=true to fetch only the current user's listings (when authenticated)
//updateListing> only the owner (or admin) can change the fields.
//>can append new images, and remove given images (optionally via remove[]= <key>)
//deleteListing > soft delete by setting status: 'deleted'

import { Request, Response, NextFunction } from 'express';
import Listing from '../models/Listing';
import User from '../models/User'; // make sure this path matches your project
import sharp from 'sharp';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../config/s3';

const BUCKET = process.env.S3_BUCKET!;
const REGION = process.env.S3_REGION || 'us-east-1';

// Build a public URL for a given object key.
// Prefer PUBLIC_S3_URL (e.g., CDN). Otherwise fall back to endpoint or AWS domain.
const makeUrl = (key: string) => {
  const base = process.env.PUBLIC_S3_URL?.replace(/\/$/, '');
  if (base) return `${base}/${key}`;
  const endpoint = process.env.S3_ENDPOINT?.replace(/\/$/, '');
  if (endpoint) return `${endpoint}/${BUCKET}/${key}`; // path-style, works with MinIO
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`; // AWS default
};

// ------------------------ CREATE ------------------------
export const createListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.sub; // set by auth middleware
    const { title, description, category, price, condition, locationCity } = req.body;

    const doc = await Listing.create({
      title,
      description,
      category,
      price: Number(price),
      condition,
      locationCity,
      sellerId: userId,
      images: [],
    });

    const files = (req.files as Express.Multer.File[]) || [];
    for (const f of files) {
      // 1) upload original
      const keyOrig = `listings/${doc._id}/${Date.now()}-${f.originalname}`;
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: keyOrig,
          Body: f.buffer,
          ContentType: f.mimetype,
        })
      );

      // 2) make thumb (max 800px width, webp)
      const img = sharp(f.buffer).rotate();
      const meta = await img.metadata();
      const thumbBuffer = await img
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      const keyThumb = keyOrig.replace(/(\.[^.]+)?$/, '.webp');
      const thumbKey = `thumbs/${keyThumb}`;
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: thumbKey,
          Body: thumbBuffer,
          ContentType: 'image/webp',
        })
      );

      // Use makeUrl so images load directly from S3 (or CDN)
      doc.images.push({
        key: keyOrig,
        url: makeUrl(keyOrig),
        w: meta.width,
        h: meta.height,
        kind: 'orig',
      } as any);
      doc.images.push({
        key: thumbKey,
        url: makeUrl(thumbKey),
        w: 800,
        h: undefined,
        kind: 'thumb',
      } as any);
    }

    await doc.save();
    res.status(201).json({ id: doc._id });
  } catch (err) {
    next(err);
  }
};

// ------------------------ READ ONE ------------------------
export const getListing = async (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = await Listing.findById(id).lean();
  if (!doc || doc.status === 'deleted') {
    return res.status(404).json({ error: 'Not found' });
  }

  // Attach public seller contact for detail page
  const seller = await User.findById(doc.sellerId)
    .select('name email phone city')
    .lean()
    .catch(() => null);

  const item: any = {
    ...doc,
    seller: seller
      ? { name: seller.name, email: seller.email, phone: seller.phone, city: seller.city }
      : undefined,
  };

  return res.json(item); // or { item }
};

// ------------------------ LIST/SEARCH ------------------------
export const listListings = async (req: Request, res: Response) => {
  const {
    category,
    minPrice,
    maxPrice,
    condition,
    sort = 'newest',
    page = '1',
    limit = '20',
    dateRange,
    mine,
  } = req.query as any;

  const q: any = { status: 'active' };
  if (category) q.category = category;
  if (condition) q.condition = condition;
  if (minPrice || maxPrice)
    q.price = {
      ...(minPrice && { $gte: Number(minPrice) }),
      ...(maxPrice && { $lte: Number(maxPrice) }),
    };
  if (dateRange === '24h') q.createdAt = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
  if (dateRange === '7d') q.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
  if (dateRange === '30d') q.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
  if (mine === 'true' && req.user?.sub) q.sellerId = req.user?.sub;

  const sortMap: any = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Listing.find(q)
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Listing.countDocuments(q),
  ]);

  res.json({ items, page: Number(page), limit: Number(limit), total });
};

// ------------------------ UPDATE ------------------------
export const updateListing = async (req: Request, res: Response) => {
  const user = req.user;
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing || listing.status === 'deleted') {
    return res.status(404).json({ error: 'Not found' });
  }
  if (String(listing.sellerId) !== String(user?.sub) && user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { title, description, category, price, condition, locationCity, status } = req.body;

  if (title !== undefined) listing.title = title;
  if (description !== undefined) listing.description = description;
  if (category !== undefined) listing.category = category;
  if (price !== undefined) listing.price = Number(price);
  if (condition !== undefined) listing.condition = condition;
  if (locationCity !== undefined) listing.locationCity = locationCity;
  if (status !== undefined) listing.status = status; // owner can draft; admin might set deleted

  // Optional removals: remove[]=key1&remove[]=key2 (query or body)
  const toRemove = ([] as string[]).concat(req.query.remove || req.body.remove || []);
  for (const key of toRemove) {
    const idx = listing.images.findIndex((img: any) => img.key === key);
    if (idx >= 0) {
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
      listing.images.splice(idx, 1);
    }
  }

  // New uploads to append
  const files = (req.files as Express.Multer.File[]) || [];
  for (const f of files) {
    const keyOrig = `listings/${listing._id}/${Date.now()}-${f.originalname}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: keyOrig,
        Body: f.buffer,
        ContentType: f.mimetype,
      })
    );

    const img = sharp(f.buffer).rotate();
    const meta = await img.metadata();
    const thumbBuffer = await img
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const keyThumb = keyOrig.replace(/(\.[^.]+)?$/, '.webp');
    const thumbKey = `thumbs/${keyThumb}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: thumbKey,
        Body: thumbBuffer,
        ContentType: 'image/webp',
      })
    );

    listing.images.push({
      key: keyOrig,
      url: makeUrl(keyOrig),
      w: meta.width,
      h: meta.height,
      kind: 'orig',
    } as any);
    listing.images.push({
      key: thumbKey,
      url: makeUrl(thumbKey),
      w: 800,
      h: undefined,
      kind: 'thumb',
    } as any);
  }

  await listing.save();
  return res.json({ id: listing._id });
};

// ------------------------ DELETE (soft) ------------------------
export const deleteListing = async (req: Request, res: Response) => {
  const user = req.user;
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) return res.status(404).json({ error: 'Not found' });

  if (String(listing.sellerId) !== String(user?.sub) && user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  listing.status = 'deleted' as any;
  await listing.save();
  return res.json({ success: true });
};
