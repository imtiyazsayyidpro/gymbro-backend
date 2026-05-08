type WelcomeMailParams = {
  name: string;
  logoSrc?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function WelcomeMail({ name, logoSrc = "https://gymbro.imtiyazsayyid.in/assets/logo.png" }: WelcomeMailParams) {
  const safeName = escapeHtml(name);
  const safeLogoSrc = escapeHtml(logoSrc);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
    <title>Welcome to Gymbro</title>
  </head>
  <body style="margin:0; padding:0; background:#0e0e0f; color:#f0f0ee; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%; min-height:100vh; background:#0e0e0f;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%; max-width:560px; overflow:hidden; border:1px solid rgba(255,255,255,0.07); border-radius:24px; background:#111112;">
            <tr>
              <td style="padding:42px 28px 34px; text-align:center; background-color:#0e0e0f; background-image:radial-gradient(circle, rgba(200,241,53,0.14) 1px, transparent 1px); background-size:24px 24px;">
                <img src="${safeLogoSrc}" width="72" height="72" alt="Gymbro logo" style="display:block; width:72px; height:72px; margin:0 auto 18px; border:1px solid rgba(200,241,53,0.22); border-radius:18px; background:rgba(200,241,53,0.08); object-fit:contain;" />
                <div style="margin:0; color:#c8f135; font-size:42px; font-weight:900; letter-spacing:0.16em; line-height:1;">
                  GYMBRO
                </div>
                <p style="margin:12px 0 0; color:rgba(240,240,238,0.45); font-size:13px; line-height:20px;">
                  Track your lifts. Own your progress.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:30px 28px 34px;">
                <p style="margin:0 0 8px; color:rgba(240,240,238,0.45); font-size:12px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase;">
                  Account ready
                </p>
                <h1 style="margin:0 0 12px; color:#f0f0ee; font-size:24px; line-height:32px; font-weight:800;">
                  Thanks for registering, ${safeName}
                </h1>
                <p style="margin:0 0 22px; color:rgba(240,240,238,0.58); font-size:15px; line-height:24px;">
                  Your Gymbro account is active. You can now track workouts, build routines, and follow your progress from session to session.
                </p>
                <div style="padding:16px 18px; border:1px solid rgba(200,241,53,0.18); border-radius:16px; background:rgba(200,241,53,0.08); color:#c8f135; font-size:14px; line-height:22px; font-weight:700;">
                  Start logging your next workout and keep your training history in one place.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
