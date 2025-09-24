// models/User.ts
//fields: name,email(unique),phone,psswordHash,city,role
//Timestamps auto-tracked
import { Schema, model } from 'mongoose';
const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    city: { type: String },
    role: { type: String, enum: ['user','admin'], default: 'user' }
}, { timestamps: true });

export default model('User', UserSchema);