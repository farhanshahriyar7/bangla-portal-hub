import { supabase } from './client';

export interface ProfileResolved {
  passport_photo_url?: string | null;
  id_proof_url?: string | null;
  full_name?: string | null;
}

/**
 * Fetches the profile row for a user and attempts to resolve storage paths
 * to either signed URLs or public URLs when possible.
 *
 * Returns an object with the same fields as the `profiles` row but with
 * `passport_photo_url` and `id_proof_url` set to usable URLs when possible.
 */
export async function fetchUserProfile(userId: string): Promise<ProfileResolved | null> {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('passport_photo_url, id_proof_url, full_name')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const resolved: ProfileResolved = { ...(data as ProfileResolved) };

    // Resolve passport photo
    if (data?.passport_photo_url) {
      const raw = data.passport_photo_url;
      if (/^https?:\/\//i.test(raw)) {
        resolved.passport_photo_url = raw;
      } else {
        const path = raw.replace(/^\/+/, '');
        try {
          const { data: signedData, error: signErr } = await supabase.storage
            .from('passport-photos')
            .createSignedUrl(path, 3600);
          if (!signErr && signedData?.signedUrl) {
            resolved.passport_photo_url = signedData.signedUrl;
          } else {
            const { data: publicData } = supabase.storage.from('passport-photos').getPublicUrl(path);
            resolved.passport_photo_url = publicData?.publicUrl || raw;
          }
        } catch (e) {
          resolved.passport_photo_url = raw;
        }
      }
    }

    // Resolve id proof
    if (data?.id_proof_url) {
      const raw = data.id_proof_url;
      if (/^https?:\/\//i.test(raw)) {
        resolved.id_proof_url = raw;
      } else {
        const path = raw.replace(/^\/+/, '');
        try {
          const { data: signedData, error: signErr } = await supabase.storage
            .from('id-proofs')
            .createSignedUrl(path, 3600);
          if (!signErr && signedData?.signedUrl) {
            resolved.id_proof_url = signedData.signedUrl;
          } else {
            const { data: publicData } = supabase.storage.from('id-proofs').getPublicUrl(path);
            resolved.id_proof_url = publicData?.publicUrl || raw;
          }
        } catch (e) {
          resolved.id_proof_url = raw;
        }
      }
    }

    return resolved;
  } catch (err) {
    console.error('fetchUserProfile error', err);
    return null;
  }
}
