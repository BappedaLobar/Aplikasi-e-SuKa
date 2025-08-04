/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const userSupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user: adminUser } } = await userSupabaseClient.auth.getUser()
    if (adminUser?.user_metadata?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Hanya admin yang dapat memperbarui pengguna.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    const { userIdToUpdate, fullName, role } = await req.json()
    if (!userIdToUpdate || !fullName || !role) {
      return new Response(JSON.stringify({ error: 'ID Pengguna, nama lengkap, dan level diperlukan.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    
    if (adminUser.id === userIdToUpdate && role !== 'admin') {
        const adminSupabaseClientForCheck = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        const { data: users, error: listErr } = await adminSupabaseClientForCheck.auth.admin.listUsers();
        if (listErr) throw listErr;

        const adminCount = users.users.filter(u => u.user_metadata.role === 'admin').length;
        if (adminCount <= 1) {
            return new Response(JSON.stringify({ error: 'Tidak dapat menghapus peran admin terakhir.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }
    }

    const adminSupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await adminSupabaseClient.auth.admin.updateUserById(
      userIdToUpdate,
      { user_metadata: { full_name: fullName, role: role } }
    )

    await adminSupabaseClient
      .from('profiles')
      .update({ full_name: fullName, role: role })
      .eq('id', userIdToUpdate)

    return new Response(JSON.stringify({ message: 'Pengguna berhasil diperbarui.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})