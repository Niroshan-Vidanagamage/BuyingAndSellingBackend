import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IImage extends Document {
  url: string;
  kind: 'thumb' | 'original';
}

export interface IListing extends Document {
  title: string;
  description: string;
  price: number;
  category: 'HOUSES_LANDS' | 'ELECTRONICS' | 'FURNITURE_HOUSEWARE' | 'SPORTS_EQUIPMENT' | 'VEHICLES';
  condition: 'new' | 'used';
  locationCity?: string;
  images: IImage[];
  seller: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema: Schema = new Schema({
  url: { type: String, required: true },
  kind: { type: String, enum: ['thumb', 'original'], required: true },
});

const ListingSchema: Schema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true },
  category: { type: String, required: true, enum: ['HOUSES_LANDS', 'ELECTRONICS', 'FURNITURE_HOUSEWARE', 'SPORTS_EQUIPMENT', 'VEHICLES'] },
  condition: { type: String, required: true, enum: ['new', 'used'] },
  locationCity: { type: String, trim: true },
  images: [ImageSchema],
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true, // This adds createdAt and updatedAt fields automatically
});

const Listing = mongoose.model<IListing>('Listing', ListingSchema);

export default Listing;