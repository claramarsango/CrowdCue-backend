import mongoose, { Schema } from 'mongoose';
import { Session } from '../sessions/session-model';

export interface User {
  email: string;
  password: string;
  username: string;
  imageURL: string;
  session: Session;
}

const userSchema = new Schema<User>({
  email: String,
  password: String,
  username: String,
  imageURL: String,
  session: { type: Schema.Types.ObjectId, ref: 'Session' },
});

export const UserModel = mongoose.model<User>('User', userSchema, 'users');
