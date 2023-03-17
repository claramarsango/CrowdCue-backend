import { RequestHandler } from 'express';
import {
  SESSION_COVER_BUCKET_NAME,
  supabase,
} from '../../database/supabase-client.js';
import { CustomHttpError } from '../../errors/custom-http-error.js';
import { Session, SessionModel } from './session-model.js';

export type SessionRequest = Pick<Session, 'title' | 'coverImageURL'>;

export const createSessionController: RequestHandler<
  unknown,
  Session,
  SessionRequest,
  unknown,
  { id: string }
> = async (req, res, next) => {
  const user = res.locals.id;
  const { title } = req.body;

  try {
    if (!title) {
      throw new CustomHttpError(400, 'Your session must have a title');
    }

    let newSession = {
      title,
      coverImageURL: '',
      url: '',
      currentSong: '',
      queuedSongs: [],
      admin: user,
      participants: [],
    };

    const fileBuffer = req.file?.buffer;

    if (fileBuffer === undefined) {
      const { data } = supabase.storage
        .from(SESSION_COVER_BUCKET_NAME)
        .getPublicUrl('default-session-img.png');

      newSession = {
        ...newSession,
        coverImageURL: data.publicUrl,
      };
    } else {
      const fileName = `${user}-${Date.now()}.webp`;

      const { error } = await supabase.storage
        .from(SESSION_COVER_BUCKET_NAME)
        .upload(fileName, fileBuffer, {
          upsert: true,
        });

      if (error === null) {
        const { data } = supabase.storage
          .from(SESSION_COVER_BUCKET_NAME)
          .getPublicUrl(fileName);

        newSession = {
          ...newSession,
          coverImageURL: data.publicUrl,
        };
      }
    }

    const session = await SessionModel.create(newSession);

    return res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};
