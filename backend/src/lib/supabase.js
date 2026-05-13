import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import ws from 'ws'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.warn('[Supabase] Warning: Missing SUPABASE_URL or SUPABASE_KEY. File uploads to Supabase will be disabled.');
}

export const supabase = (supabaseUrl && supabaseKey) 
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: false
        },
        realtime: {
            transport: ws
        }
      }) 
    : null

export const uploadToSupabase = async (buffer, filename, bucket = 'pedagogical-content', contentType = 'application/octet-stream') => {
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(`uploads/${filename}`, buffer, {
            contentType,
            upsert: true
        });

    if (error) {
        console.error('[Supabase Upload Error]', error);
        throw error;
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(`uploads/${filename}`);

    return publicUrl;
}
