import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { action, phone, message, mediaUrl, fileName, instance, token, clientToken, privacyType } = await req.json()
    
    const baseUrl = `https://api.z-api.io/instances/${instance}/token/${token}`
    const headers = {
        'Content-Type': 'application/json',
        'Client-Token': clientToken || ''
    }

    let targetUrl = ""
    let method = "GET"
    let body = null

    if (action === 'status') {
        targetUrl = `${baseUrl}/status-instance`
    } 
    else if (action === 'qr-code') {
        targetUrl = `${baseUrl}/qr-code`
    }
    else if (action === 'profile-picture') {
        targetUrl = `${baseUrl}/profile-picture?phone=${phone}`
    }
    else if (action === 'disallowed-contacts') {
        // CORREÇÃO: Endpoint de privacidade
        targetUrl = `${baseUrl}/privacy/disallowed-contacts?type=${privacyType || 'photo'}`
    }
    else if (action === 'send-text') {
        targetUrl = `${baseUrl}/send-text`
        method = "POST"
        body = JSON.stringify({ phone, message })
    }
    else if (action === 'send-image') {
        targetUrl = `${baseUrl}/send-image`
        method = "POST"
        body = JSON.stringify({ phone, image: mediaUrl })
    }
    else if (action === 'send-document') {
        const extension = fileName?.split('.').pop() || 'pdf'
        targetUrl = `${baseUrl}/send-document/${extension}`
        method = "POST"
        body = JSON.stringify({ phone, document: mediaUrl, fileName: fileName || 'documento' })
    }

    const response = await fetch(targetUrl, {
        method,
        headers,
        body
    })

    const data = await response.json()
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
