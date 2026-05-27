// Vercel Serverless Function — POST /api/contact
// ---------------------------------------------------------------------------
// Sends a templated email to info@trarq.com when the contact form is submitted.
// Uses the Resend REST API via native fetch, so there are NO npm dependencies.
//
// TO GO LIVE (define later):
//   1. Create a Resend account (https://resend.com) and verify a sending domain
//      (e.g. trarq.com) so you can send from a fixed address like
//      "Torres Rodriguez <no-reply@trarq.com>".
//   2. In Vercel → Project → Settings → Environment Variables, add:
//        RESEND_API_KEY   = your Resend API key
//        CONTACT_TO       = info@trarq.com           (optional, defaults below)
//        CONTACT_FROM     = "Web Torres Rodriguez <no-reply@trarq.com>"  (optional)
//   3. Redeploy. The form posts JSON to this endpoint via assets/js/main.js.
//
// Any other provider (SendGrid, Postmark, SMTP/Nodemailer) can replace the
// fetch() call below — the request/response contract stays the same.
// ---------------------------------------------------------------------------

const TO_EMAIL = process.env.CONTACT_TO || 'info@trarq.com';
const FROM_EMAIL = process.env.CONTACT_FROM || 'Torres Rodriguez <no-reply@trarq.com>';

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  // Vercel parses JSON bodies automatically; fall back to manual parse just in case.
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }
  body = body || {};

  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const phone = (body.phone || '').trim();
  const project = (body.project || '').trim();
  const message = (body.message || '').trim();

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Correo no válido.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Not configured yet — surface a clear error so the form shows a fallback.
    return res.status(500).json({ error: 'El envío de correo aún no está configurado.' });
  }

  const subject = `Nueva consulta — ${name}${project ? ' · ' + project : ''}`;
  const html = `
    <div style="font-family:Georgia,serif;color:#2A2118;line-height:1.6;">
      <h2 style="font-weight:400;margin:0 0 16px;">Nueva consulta desde trarq.com</h2>
      <p style="margin:0 0 6px;"><strong>Nombre:</strong> ${escapeHtml(name)}</p>
      <p style="margin:0 0 6px;"><strong>Correo:</strong> ${escapeHtml(email)}</p>
      <p style="margin:0 0 6px;"><strong>Teléfono:</strong> ${escapeHtml(phone) || '—'}</p>
      <p style="margin:0 0 6px;"><strong>Tipo de proyecto:</strong> ${escapeHtml(project) || '—'}</p>
      <p style="margin:16px 0 6px;"><strong>Mensaje:</strong></p>
      <p style="margin:0;white-space:pre-wrap;">${escapeHtml(message)}</p>
    </div>`;
  const text =
    `Nueva consulta desde trarq.com\n\n` +
    `Nombre: ${name}\nCorreo: ${email}\nTeléfono: ${phone || '—'}\n` +
    `Tipo de proyecto: ${project || '—'}\n\nMensaje:\n${message}\n`;

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: email,
        subject: subject,
        html: html,
        text: text
      })
    });

    if (!resp.ok) {
      const detail = await resp.text();
      console.error('Resend error:', resp.status, detail);
      return res.status(502).json({ error: 'No se pudo enviar el mensaje.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact handler error:', err);
    return res.status(500).json({ error: 'Error inesperado al enviar el mensaje.' });
  }
}
