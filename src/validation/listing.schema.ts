// validation/listing.schema.ts
//zod schema for create/update listing(title length, category enum, price >= 0, etc)
import { z } from 'zod';
export const CreateListingSchema = z.object({
    title: z.string().min(3).max(120),
    description: z.string().max(4000).optional(),
    category: z.enum(['HOUSES_LANDS','ELECTRONICS','FURNITURE_HOUSEWARE','SPORTS_EQUIPMENT','VEHICLES']),
    price: z.number().min(0),
    condition: z.enum(['new','used']),
    locationCity: z.string().max(120).optional(),
});