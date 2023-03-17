import mongoose, { Schema } from 'mongoose';

export interface Song {
  title: string;
  songURL: string; // Supabase
  artist: string;
  genre: string;
  duration: number;
}

const songSchema = new Schema<Song>({
  title: String,
  songURL: String,
  artist: String,
  genre: String,
  duration: Number,
});

export const SongModel = mongoose.model<Song>('Song', songSchema, 'songs');
