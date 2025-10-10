# Server-side guidance for handling RLS when updating profile fields

This project uses Supabase storage to store files (passport photos, id proofs). When clients upload to storage directly, updating the `profiles` table from the client may fail due to Row Level Security (RLS) policies. That is expected and recommended for security.

Two recommended approaches to fix this in a secure way:

1) Use a server-side endpoint (Supabase Edge Function or your own server) that uses the service_role key to perform the `profiles` update after verifying the request.

2) Adjust RLS policies to allow authenticated users to update only their own profile rows (recommended) and ensure the client has the correct JWT claims.

Below are examples and guidelines for both approaches.

---

## 1) Supabase Edge Function (recommended for simplicity)

Create an Edge Function that accepts the authenticated user's bearer token (or you can pass user id if you validate it yourself) and the new field to update.

Important: Never expose your `service_role` key to the browser. Keep it server-side.

Example (Node / Deno style pseudocode):

- Authenticate the incoming request (validate user's JWT using Supabase helpers)
- Verify the user's identity and authorization
- Use the `service_role` key to call Supabase and update the `profiles` table for that user

Example (pseudo):

```
// edge function pseudocode
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

export default async (req) => {
  const { user_id, field, value } = await req.json()
  // validate inputs, ensure field is allowed (passport_photo_url or id_proof_url)
  if (!['passport_photo_url','id_proof_url'].includes(field)) return Response.json({ error: 'invalid field' }, { status: 400 })

  const { data, error } = await supabase
    .from('profiles')
    .update({ [field]: value })
    .eq('id', user_id)

  if (error) return Response.json({ error }, { status: 500 })
  return Response.json({ data })
}
```

Call this function after successful upload to storage. The function will succeed even when RLS prevents client direct updates (because the service role bypasses RLS).

---

## 2) Example RLS policy to allow users to update their own profile

If you'd rather keep updates client-side, ensure your RLS policy allows the authenticated user to update only their row.

Example SQL (run in Supabase SQL editor):

```sql
-- allow authenticated users to update their own profile
create policy "Allow update own profile" on public.profiles
for update
using ( auth.uid() = id )
with check ( auth.uid() = id );
```

This policy presumes that `id` is the user's UUID matching `auth.uid()`.

---

## 3) Frontend recommendations (what we changed in the UI)

- We implemented optimistic UI updates after file upload so the user sees their image immediately even if the DB update fails due to RLS.
- When DB update fails, we record a "pending upload" with the storage path/publicUrl so the user or admin can retry the DB update via a secure server-side function.
- Provide a server-side function to perform the final DB update (Edge Function using service_role) and call it from a secure environment (or via an API route that you host).

---

If you want, I can scaffold a minimal Edge Function (TypeScript) in this repo and show how to call it from the frontend safely (client receives only success/failure). Ask and I'll implement it.
