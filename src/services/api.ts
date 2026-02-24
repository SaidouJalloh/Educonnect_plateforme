import { supabase } from "@/integrations/supabase/client";

export interface ChatResponse {
  response: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function chatWithBotCloud(
  message: string,
  context?: { previousMessages: Array<{ role: string; content: string }>; topics: string[] }
): Promise<ApiResponse<ChatResponse>> {
  try {
    const { data, error } = await supabase.functions.invoke("edubot-chat", {
      body: { message, context },
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error: unknown) {
    console.error("EduBot error:", error);
    return {
      success: false,
      error: "Impossible de joindre EduBot. Veuillez réessayer.",
    };
  }
}

// Keep legacy types for compatibility
export interface Student {
  id?: number;
  name: string;
  email: string;
  niveau: string;
  filiere?: string;
  pays?: string;
  ville?: string;
  interets?: string[];
}

export interface Opportunity {
  id: number;
  titre: string;
  type: string;
  description: string;
  pays?: string;
  niveau?: string;
  date_limite?: string;
  lien?: string;
}

export interface FilterCriteria {
  type?: string;
  niveau?: string;
  pays?: string;
}

export default {};
