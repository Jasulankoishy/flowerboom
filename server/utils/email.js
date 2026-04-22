import { Resend } from 'resend';

let resend = null;

const getResendClient = () => {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

export const sendVerificationCode = async (email, code) => {
  const client = getResendClient();

  if (!client) {
    throw new Error('Resend API key not configured');
  }

  const { data, error } = await client.emails.send({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Ваш код для входа — Flowerboom',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#080808;font-family:Inter,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#121212;border-radius:16px;padding:40px;border:1px solid #1a1a1a;">

                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <h1 style="margin:0;font-size:28px;font-weight:800;color:#f1f1f1;letter-spacing:-1px;">
                      Flower<span style="color:#d4af37;">Boom</span>
                    </h1>
                    <p style="margin:8px 0 0;font-size:11px;letter-spacing:3px;color:#666;text-transform:uppercase;">
                      Floral Design Studio
                    </p>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <p style="margin:0;font-size:16px;color:#999;">
                      Ваш код для входа
                    </p>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <div style="background:#080808;border:1px solid #d4af37;border-radius:12px;padding:24px 40px;display:inline-block;">
                      <span style="font-size:40px;font-weight:800;letter-spacing:8px;color:#d4af37;">
                        ${code}
                      </span>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <p style="margin:0;font-size:14px;color:#666;">
                      Код действует <strong style="color:#999;">10 минут</strong>
                    </p>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="border-top:1px solid #1a1a1a;padding-top:24px;">
                    <p style="margin:0;font-size:12px;color:#444;">
                      Если вы не запрашивали код — просто проигнорируйте это письмо
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  });

  if (error) {
    console.error('Resend error:', error);
    throw new Error('Не удалось отправить письмо');
  }

  return data;
};
