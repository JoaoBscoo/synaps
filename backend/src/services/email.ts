import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface InviteEmailParams {
  to: string;
  tenantName: string;
  inviterName: string;
  role: string;
  inviteUrl: string;
}

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Proprietário',
  EDITOR: 'Editor',
  VIEWER: 'Visualizador',
  CLIENT: 'Cliente',
};

export async function sendInviteEmail(params: InviteEmailParams): Promise<void> {
  const { to, tenantName, inviterName, role, inviteUrl } = params;
  const roleLabel = ROLE_LABELS[role] || role;

  if (!process.env.SENDGRID_API_KEY) {
    console.log(`[EMAIL MOCK] Convite para ${to}: ${inviteUrl}`);
    return;
  }

  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@synaps.app.br',
    subject: `${inviterName} convidou você para ${tenantName} no Synaps`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', sans-serif; background: #07090f; color: #e2e8f0; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: #0f1520; border-radius: 12px; overflow: hidden; border: 1px solid rgba(99,179,237,0.12); }
            .header { background: linear-gradient(135deg, #63b3ed20, #9f7aea20); padding: 40px; text-align: center; }
            .logo { font-size: 28px; font-weight: 700; color: #63b3ed; letter-spacing: -0.5px; }
            .body { padding: 40px; }
            .btn { display: inline-block; background: linear-gradient(135deg, #63b3ed, #9f7aea); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin-top: 24px; }
            .role-badge { display: inline-block; background: rgba(99,179,237,0.15); color: #63b3ed; padding: 4px 12px; border-radius: 20px; font-size: 14px; }
            .footer { padding: 24px 40px; border-top: 1px solid rgba(99,179,237,0.12); font-size: 12px; color: #4a5568; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">⬡ Synaps</div>
              <p style="color: #a0aec0; margin: 8px 0 0;">Gestão de Projetos Inteligente</p>
            </div>
            <div class="body">
              <h2 style="color: #e2e8f0; margin-top: 0;">Você foi convidado!</h2>
              <p><strong style="color: #63b3ed">${inviterName}</strong> convidou você para colaborar no workspace <strong style="color: #e2e8f0">${tenantName}</strong>.</p>
              <p>Sua função será: <span class="role-badge">${roleLabel}</span></p>
              <p>Clique no botão abaixo para aceitar o convite e começar a usar o Synaps:</p>
              <a href="${inviteUrl}" class="btn">Aceitar Convite</a>
              <p style="color: #4a5568; font-size: 13px; margin-top: 32px;">Este convite expira em 7 dias. Se você não esperava este convite, ignore este email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Synaps · synaps.app.br</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await sgMail.send(msg);
}
