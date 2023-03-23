import mongoose, { Schema } from 'mongoose';

export interface User {
  email: string;
  password: string;
  username: string;
  imageURL: string;
  inSession: string;
}

const userSchema = new Schema<User>({
  email: String,
  password: String,
  username: String,
  imageURL: String,
  inSession: String,
});

export const UserModel = mongoose.model<User>('User', userSchema, 'users');
