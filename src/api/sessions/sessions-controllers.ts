import { RequestHandler } from 'express';
import {
  SESSION_COVER_BUCKET_NAME,
  supabase,
} from '../../database/supabase-client.js';
import { CustomHttpError } from '../../errors/custom-http-error.js';
import { UserModel } from '../users/user-model.js';
import { Session, SessionModel } from './session-model.js';

export type SessionRequest = Pick<Session, 'title' | 'coverImageURL'>;
export type SessionPreviewResponse = Omit<Session, 'currentSong'>[];
export type SessionCreation = Omit<Session, 'currentSong'>;

export const createSessionController: RequestHandler<
  unknown,
  { session: Session } | { msg: string },
  SessionRequest,
  unknown,
  { id: string }
> = async (req, res, next) => {
  const admin = res.locals.id;

  const { title } = req.body;

  try {
    const foundUser = await UserModel.findById(admin).exec();

    if (foundUser?.inSession !== '') {
      throw new CustomHttpError(400, 'You are already the admin of a session');
    }

    if (!title) {
      throw new CustomHttpError(400, 'Your session must have a title');
    }

    let newSession: SessionCreation = {
      title,
      coverImageURL: '',
      url: '',
      queuedSongs: [],
      admin,
      participants: [],
    };

    const fileBuffer = req.file?.buffer;

    if (fileBuffer === undefined) {
      const { data } = supabase.storage
        .from(SESSION_COVER_BUCKET_NAME)
        .getPublicUrl('default-session-img.webp');

      newSession = {
        ...newSession,
        coverImageURL: data.publicUrl,
      };
    } else {
      const fileName = `${admin}-${Date.now()}.webp`;

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

    await UserModel.updateOne(
      { _id: admin },
      { inSession: session._id },
    ).exec();

    return res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
};

export const getAllSessionsController: RequestHandler<
  unknown,
  { sessions: SessionPreviewResponse } | { msg: string }
> = async (_req, res, next) => {
  try {
    const foundSessions = await SessionModel.find({}).exec();
    res.json({ sessions: foundSessions });
  } catch (error) {
    next(error);
  }
};

export const getSessionByIdController: RequestHandler<
  { _id: string },
  { session: Session } | { msg: string },
  unknown,
  unknown,
  { id: string }
> = async (req, res, next) => {
  const { _id } = req.params;
  const admin = res.locals.id;

  try {
    const session = await SessionModel.findById(_id).exec();

    if (session === null) {
      throw new CustomHttpError(404, 'This session does not exist');
    }

    await UserModel.updateOne({ _id: admin }, { inSession: _id }).exec();

    res.json({ session });
  } catch (error) {
    next(error);
  }
};

export const deleteSessionByIdController: RequestHandler<
  { _id: string },
  { msg: string },
  unknown,
  unknown,
  { id: string }
> = async (req, res, next) => {
  const { _id } = req.params;
  const currentUser = res.locals.id;

  try {
    const session = await SessionModel.findById(_id).exec();

    if (session === null) {
      throw new CustomHttpError(404, 'This session does not exist');
    }

    if (session?.admin !== currentUser) {
      throw new CustomHttpError(401, 'You are not the admin of this session');
    }

    const file = session.coverImageURL.substring(
      session.coverImageURL.lastIndexOf('/') + 1,
    );

    if (!session.coverImageURL.includes('default-session-img')) {
      await supabase.storage.from(SESSION_COVER_BUCKET_NAME).remove([file]);
    }

    session.participants.forEach(async user => {
      await UserModel.updateOne({ _id: user }, { inSession: '' }).exec();
    });

    await SessionModel.deleteOne({ _id }).exec();

    await UserModel.updateOne({ _id: currentUser }, { inSession: '' });

    res.json({ msg: 'The session has been deleted' });
  } catch (error) {
    next(error);
  }
};

export const createParticipantController: RequestHandler<
  { _id: string },
  { msg: string; sessionId: string },
  unknown,
  unknown,
  { id: string }
> = async (req, res, next) => {
  const { _id } = req.params;
  const currentUser = res.locals.id;

  try {
    const foundUser = await UserModel.findById(currentUser).exec();

    if (
      foundUser?.inSession !== '' ||
      (foundUser?.inSession !== _id && foundUser?.inSession !== '')
    ) {
      throw new CustomHttpError(
        400,
        'You are already participating in a session',
      );
    }

    const sessionDbRes = await SessionModel.updateOne(
      { _id },
      { $push: { participants: currentUser } },
    ).exec();

    if (sessionDbRes.matchedCount === 0) {
      throw new CustomHttpError(404, 'This session does not exist');
    }

    await UserModel.updateOne({ _id: currentUser }, { inSession: _id }).exec();

    res.json({ msg: 'A new user has joined the session', sessionId: _id });
  } catch (error) {
    next(error);
  }
};

export const removeParticipantController: RequestHandler<
  { _id: string },
  { msg: string },
  unknown,
  unknown,
  { id: string }
> = async (req, res, next) => {
  const { _id } = req.params;
  const currentUser = res.locals.id;

  try {
    const sessionDbRes = await SessionModel.updateOne(
      { _id },
      { $pull: { participants: currentUser } },
    ).exec();

    if (sessionDbRes.matchedCount === 0) {
      throw new CustomHttpError(404, 'This session does not exist');
    }

    await UserModel.updateOne({ _id: currentUser }, { inSession: '' }).exec();

    res.json({ msg: 'You have left the session' });
  } catch (error) {
    next(error);
  }
};
