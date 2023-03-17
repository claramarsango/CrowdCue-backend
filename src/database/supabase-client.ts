import { createClient } from '@supabase/supabase-js';

const bucketUrl = process.env.SUPABASE_BUCKET_URL ?? '';
const bucketApiKey = process.env.SUPABASE_API_KEY ?? '';

export const supabase = createClient(bucketUrl, bucketApiKey);

export const SESSION_COVER_BUCKET_NAME = 'sessions-cover-images';
