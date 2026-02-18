import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  googleId?: string;
  email: string;
  name?: string;
  picture?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    googleId: { type: String, index: true, unique: true, sparse: true },
    email: { type: String, required: true, index: true, unique: true },
    name: String,
    picture: String,
    lastLoginAt: Date,
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
