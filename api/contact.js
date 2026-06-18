// Vercel Serverless Function — POST /api/contact
// ---------------------------------------------------------------------------
// Forwards the contact form to Web3Forms (https://web3forms.com).
// Web3Forms delivers the submission to the email address tied to the access key.
//
// TO GO LIVE:
//   1. Sign up at https://web3forms.com and create an access key for info@trarq.com.
//   2. In Vercel → Project → Settings → Environment Variables, add:
//        WEB3FORMS_ACCESS_KEY   = your Web3Forms access key  (required)
//        WEB3FORMS_FROM_NAME    = "Torres Rodriguez Web"     (optional)
//   3. Redeploy.
// ---------------------------------------------------------------------------

const FROM_NAME = process.env.WEB3FORMS_FROM_NAME || 'Torres Rodriguez Web';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  const apiKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'El envío de mensajes aún no está configurado.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }
  body = body || {};

  const name    = (body.name    || '').trim();
  const email   = (body.email   || '').trim();
  const phone   = (body.phone   || '').trim();
  const project = (body.project || '').trim();
  const message = (body.message || '').trim();

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Correo no válido.' });
  }

  const subject = `Nueva consulta — ${name}${project ? ' · ' + project : ''}`;

  try {
    const resp = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: apiKey,
        from_name:  FROM_NAME,
        subject:    subject,
        replyto:    email,
        name,
        email,
        phone:      phone   || '—',
        project:    project || '—',
        message
      })
    });

    const data = await resp.json();
    if (!data.success) {
      console.error('Web3Forms error:', data);
      return res.status(502).json({ error: 'No se pudo enviar el mensaje.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact handler error:', err);
    return res.status(500).json({ error: 'Error inesperado al enviar el mensaje.' });
  }
}
