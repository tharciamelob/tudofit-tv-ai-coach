import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SupportEmailRequest {
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, subject, message }: SupportEmailRequest = await req.json();

    // Send email to support team
    const supportEmailResponse = await resend.emails.send({
      from: "Suporte <onboarding@resend.dev>",
      to: ["suporte@fitai.com"], // Replace with your support email
      subject: `[Suporte] ${subject}`,
      html: `
        <h2>Nova solicitação de suporte</h2>
        <p><strong>Usuário:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Assunto:</strong> ${subject}</p>
        <h3>Mensagem:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Esta mensagem foi enviada através do sistema de suporte do FitAI.</small></p>
      `,
    });

    // Send confirmation email to user
    const confirmationEmailResponse = await resend.emails.send({
      from: "FitAI Suporte <onboarding@resend.dev>",
      to: [userEmail],
      subject: "Recebemos sua solicitação de suporte",
      html: `
        <h1>Olá, ${userName}!</h1>
        <p>Recebemos sua solicitação de suporte e nossa equipe entrará em contato em até <strong>24 horas</strong>.</p>
        
        <h3>Resumo da sua solicitação:</h3>
        <p><strong>Assunto:</strong> ${subject}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        
        <p>Obrigado por usar o FitAI!</p>
        <p>Atenciosamente,<br>Equipe FitAI</p>
      `,
    });

    console.log("Support email sent successfully:", supportEmailResponse);
    console.log("Confirmation email sent successfully:", confirmationEmailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      supportEmailId: supportEmailResponse.data?.id,
      confirmationEmailId: confirmationEmailResponse.data?.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-support-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);