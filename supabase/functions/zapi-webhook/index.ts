import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    
    // Captura o ID da instância que enviou o webhook
    const incomingInstanceId = payload.instanceId
    
    // Busca as credenciais dessa instância no banco de dados
    const { data: config } = await supabaseClient
      .from('whatsapp_config')
      .select('instance_id, instance_token, client_token')
      .eq('instance_id', incomingInstanceId)
      .single()

    // Fallback para variáveis de ambiente caso não encontre no banco
    const instance = config?.instance_id || Deno.env.get('REACT_APP_ZAPI_INSTANCE')
    const token = config?.instance_token || Deno.env.get('REACT_APP_ZAPI_TOKEN')
    const clientToken = config?.client_token || Deno.env.get('REACT_APP_ZAPI_CLIENT_TOKEN')

    let { phone, fromMe, messageId, type, text, image, document, momment, senderName, chatName } = payload
    if (fromMe) return new Response('ok', { headers: corsHeaders })

    let cleanPhone = phone.split('@')[0].replace(/\D/g, "")
    let conversaKey = phone.includes('@newsletter') ? null : (phone.includes('@g.us') ? `1-${phone}` : `1-${cleanPhone}@c.us`)
    if (!conversaKey) return new Response('ok', { headers: corsHeaders })

    // Busca foto de perfil na Z-API caso não tenhamos (Apenas 1 vez por contato)
    const { data: existingChat } = await supabaseClient.from('conversas').select('photo').eq('key', conversaKey).single()
    let profilePhoto = existingChat?.photo

    if (!profilePhoto && instance && token) {
        try {
            const photoRes = await fetch(`https://api.z-api.io/instances/${instance}/token/${token}/profile-picture?phone=${cleanPhone}`, {
                headers: { 'Client-Token': clientToken || '' }
            })
            const photoData = await photoRes.json()
            if (photoData && photoData.length > 0) profilePhoto = photoData[0].link
        } catch (e) {
            console.error("Erro ao buscar foto:", e)
        }
    }

    // Extração de Texto
    let body = payload.text?.message || payload.text || payload.caption || image?.caption || document?.caption || ""
    if (!body && type === 'text') body = text?.message || ""

    // Salvar Mensagem
    await supabaseClient.from('mensagens').insert({
      message_id: messageId,
      message: body,
      phone: cleanPhone,
      lid: conversaKey,
      from_me: false,
      messagetype: type === 'text' ? 'conversation' : type,
      media_url: image?.imageUrl || document?.documentUrl || null,
      filename: document?.fileName || null,
      created_at: new Date(momment).toISOString()
    })

    // ─── Lógica de Menu Automático (URA) ────────────────────────────────────
    const { data: currentChat } = await supabaseClient
      .from('conversas')
      .select('department, last_menu_at')
      .eq('key', conversaKey)
      .single()

    const menuText = `*JLVIANA Consultoria Contábil* \nSelecione uma das opções abaixo:\n\n1 - *Departamento Fiscal*\n2 - *Departamento Contábil*\n3 - *Departamento Pessoal*\n4 - *Departamento Qualidade*\n5 - *Departamento Legalização*\n6 - *BPO Financeiro*\n7 - *Departamento Financeiro*\n\nDigite apenas o *número* da opção desejada.`

    const deptMap: { [key: string]: string } = {
        "1": "Fiscal",
        "2": "Contábil",
        "3": "Pessoal",
        "4": "Qualidade",
        "5": "Legalização",
        "6": "BPO Financeiro",
        "7": "Financeiro"
    }

    let targetDepartment = currentChat?.department
    let shouldSendMenu = false

    // Se não tem departamento ou está "Geral", tentamos capturar a escolha
    if (!targetDepartment || targetDepartment === 'Geral' || targetDepartment === 'Aguardando') {
        if (deptMap[body.trim()]) {
            targetDepartment = deptMap[body.trim()]
            // Envia confirmação de redirecionamento
            try {
                await fetch(`https://api.z-api.io/instances/${instance}/token/${token}/send-text`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Client-Token': clientToken || '' },
                    body: JSON.stringify({ phone: cleanPhone, message: `✅ Você foi direcionado para o *Departamento ${targetDepartment}*. \nUm consultor especializado irá atendê-lo em breve!` })
                })
            } catch (e) { console.error("Erro ao enviar confirmação de setor:", e) }
        } else {
            // Se não digitou um número válido, enviamos o menu (se não enviamos nos últimos 10 minutos)
            const lastMenu = currentChat?.last_menu_at ? new Date(currentChat.last_menu_at).getTime() : 0
            const now = Date.now()
            if (now - lastMenu > 10 * 60 * 1000) { // 10 minutos cooldown
                shouldSendMenu = true
            }
        }
    }

    if (shouldSendMenu && instance && token) {
        try {
            await fetch(`https://api.z-api.io/instances/${instance}/token/${token}/send-text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Client-Token': clientToken || '' },
                body: JSON.stringify({ phone: cleanPhone, message: menuText })
            })
        } catch (e) { console.error("Erro ao enviar menu:", e) }
    }

    // Atualizar Inbox com a Foto e Departamento
    const { data: chatData } = await supabaseClient.from('conversas').select('notifications_count').eq('key', conversaKey).single()
    const newCount = (chatData?.notifications_count || 0) + 1

    await supabaseClient.from('conversas').upsert({
      key: conversaKey,
      name: senderName || chatName || cleanPhone,
      message: body,
      phone: cleanPhone,
      from_me: false,
      photo: profilePhoto,
      notifications_count: newCount,
      department: targetDepartment || 'Aguardando',
      last_menu_at: shouldSendMenu ? new Date().toISOString() : (currentChat?.last_menu_at || null),
      updated_at: new Date(momment).toISOString()
    }, { onConflict: 'key' })

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error("Webhook Error:", err)
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: corsHeaders })
  }
})
