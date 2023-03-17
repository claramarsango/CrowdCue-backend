import mongoose, { Schema } from 'mongoose';
import { Song } from '../songs/song-model.js';
import { User } from '../users/user-model.js';

export interface Session {
  title: string;
  coverImageURL: string; // Supabase
  url: string;
  currentSong: Song;
  queuedSongs: Song[];
  admin: User;
  participants: User[];
}

const sessionSchema = new Schema<Session>({
  title: String,
  coverImageURL: String,
  url: String,
  currentSong: String,
  queuedSongs: [],
  admin: String,
  participants: [],
});

export const sessionModel = mongoose.model<Session>(
  'Session',
  sessionSchema,
  'sessions',
);

/* - image: Supabase url
- url: string (/:sessionId)
- current song: {}
- queued songs: Object[]
- admin: user ID
- participants: User[] */
