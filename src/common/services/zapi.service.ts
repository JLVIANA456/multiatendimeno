import { supabase } from "lib/supabase";

const DEFAULT_INSTANCE_ID = process.env.REACT_APP_ZAPI_INSTANCE;
const DEFAULT_TOKEN = process.env.REACT_APP_ZAPI_TOKEN;
const DEFAULT_CLIENT_TOKEN = process.env.REACT_APP_ZAPI_CLIENT_TOKEN;

/**
 * Service atualizado para ser dinâmico e usar a Edge Function do Supabase como Proxy.
 */
const callZapiHelper = async (payload: any, credentials?: { instance?: string; token?: string; clientToken?: string }) => {
    const instance = credentials?.instance || DEFAULT_INSTANCE_ID;
    const token = credentials?.token || DEFAULT_TOKEN;
    const clientToken = credentials?.clientToken || DEFAULT_CLIENT_TOKEN;

    if (!instance || !token) {
        console.error("ERRO: Chaves da Z-API não fornecidas!", { instance, token });
        throw new Error("Configuração da Z-API ausente.");
    }

    const { data, error } = await supabase.functions.invoke('zapi-helper', {
        body: {
            ...payload,
            instance,
            token,
            clientToken
        }
    });

    if (error) {
        console.error("Erro na Ponte Supabase:", error);
        throw error;
    }
    
    return data;
};

export interface ZapiStatus {
  connected: boolean;
  phone?: string;
  battery?: number;
  [key: string]: any;
}

export interface ZapiQRCode {
  value: string;
}

export const zapiService = {
  sendText: async (phone: string, message: string, creds?: any) => {
    return callZapiHelper({ action: 'send-text', phone, message }, creds);
  },

  sendDocument: async (phone: string, documentUrl: string, fileName: string, creds?: any) => {
    return callZapiHelper({ action: 'send-document', phone, mediaUrl: documentUrl, fileName }, creds);
  },

  sendImage: async (phone: string, imageUrl: string, creds?: any) => {
    return callZapiHelper({ action: 'send-image', phone, mediaUrl: imageUrl }, creds);
  },

  getStatus: async (creds?: any): Promise<ZapiStatus> => {
    return callZapiHelper({ action: 'status' }, creds);
  },

  getQRCode: async (creds?: any): Promise<ZapiQRCode> => {
    return callZapiHelper({ action: 'qr-code' }, creds);
  },

  getProfilePicture: async (phone: string, creds?: any): Promise<string | null> => {
    const data = await callZapiHelper({ action: 'profile-picture', phone }, creds);
    return data && data.length > 0 ? data[0].link : null;
  },

  getDisallowedContacts: async (type: 'lastSeen' | 'photo' | 'description' | 'groupAdd', creds?: any): Promise<string[]> => {
    const data = await callZapiHelper({ action: 'disallowed-contacts', privacyType: type }, creds);
    return data?.disallowedContacts || [];
  }
};
