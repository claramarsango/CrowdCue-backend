import mongoose, { Schema } from 'mongoose';

export interface Song {
  title: string;
  songURL: string;
  artist: string;
}

const songSchema = new Schema<Song>({
  title: String,
  songURL: String,
  artist: String,
});

export const SongModel = mongoose.model<Song>('Song', songSchema, 'songs');
