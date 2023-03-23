import mongoose, { Schema } from 'mongoose';
import { Song } from '../songs/song-model.js';

export interface Session {
  title: string;
  coverImageURL: string;
  url: string;
  currentSong: Song | string;
  queuedSongs: Song[];
  admin: string;
  participants: string[];
}

const sessionSchema = new Schema<Session>({
  title: String,
  coverImageURL: String,
  url: String,
  currentSong: { type: Schema.Types.ObjectId, ref: 'Song' },
  queuedSongs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
  admin: String,
  participants: [],
});

export const SessionModel = mongoose.model<Session>(
  'Session',
  sessionSchema,
  'sessions',
);
