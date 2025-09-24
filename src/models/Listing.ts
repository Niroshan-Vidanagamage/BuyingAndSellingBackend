// models/Listing.ts
//Fields: title, description, category(your enums), proce, codtions, images, lacationCity, sellerId, Status
//indexes on category, price, createdAt for fast filtering

import { Schema, model, Types } from 'mongoose';
const ImageSchema = new Schema({
key: String,
url: String,
w: Number,
h: Number,
kind: { type: String, enum: ['orig','thumb'], default: 'orig' }
}, { _id: false });


const ListingSchema = new Schema({
title: { type: String, required: true },
description: { type: String, default: '' },
category: { type: String, enum: ['HOUSES_LANDS','ELECTRONICS','FURNITURE_HOUSEWARE','SPORTS_EQUIPMENT','VEHICLES'], required: true, index: true },
price: { type: Number, required: true, index: true },
condition: { type: String, enum: ['new','used'], required: true, index: true },
images: { type: [ImageSchema], default: [] },
locationCity: { type: String },
sellerId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
status: { type: String, enum: ['active','draft','deleted'], default: 'active', index: true }
}, { timestamps: true });


ListingSchema.index({ category: 1, price: 1, createdAt: -1 });
export default model('Listing', ListingSchema);