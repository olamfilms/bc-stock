import { Resend } from 'resend'
import type { QuoteFormData, Media } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'quotes@bcstock.ca'
const TO_EMAIL = process.env.RESEND_TO_EMAIL || 'video@olamfilms.com'

function formatMediaList(mediaItems: Media[]): string {
  return mediaItems
    .map((item) => {
      const thumbLine =
        item.vimeo_thumbnail || item.cloudinary_url
          ? `<img src="${item.vimeo_thumbnail || item.cloudinary_url}" alt="${item.title}" style="width:120px;height:68px;object-fit:cover;border-radius:4px;margin-right:12px;" />`
          : ''
      const typeLabel = item.type === 'video' ? '🎬 Video' : '📷 Photo'
      const duration =
        item.duration
          ? ` · ${Math.floor(item.duration / 60)}:${String(item.duration % 60).padStart(2, '0')}`
          : ''
      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #30363d;vertical-align:middle;">
            ${thumbLine}
          </td>
          <td style="padding:8px;border-bottom:1px solid #30363d;vertical-align:middle;">
            <strong style="color:#e6edf3;">${item.title}</strong><br/>
            <span style="color:#8b949e;font-size:13px;">${typeLabel}${duration}</span>
          </td>
        </tr>`
    })
    .join('')
}

function buildAdminEmailHtml(data: QuoteFormData, mediaItems: Media[]): string {
  const usageList = (data.usage || []).join(', ') || 'Not specified'
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="background:#0d1117;color:#e6edf3;font-family:Arial,sans-serif;max-width:700px;margin:0 auto;padding:24px;">
  <div style="border:1px solid #30363d;border-radius:8px;overflow:hidden;">
    <div style="background:#3d7a5c;padding:24px 32px;">
      <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:2px;">BC STOCK</h1>
      <p style="margin:4px 0 0;color:#c3e8d6;font-size:14px;">New Quote Request</p>
    </div>
    <div style="padding:32px;background:#161b22;">
      <h2 style="color:#5aab80;margin-top:0;">Contact Details</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;color:#8b949e;width:160px;">Email</td>
          <td style="padding:6px 0;color:#e6edf3;">${data.email}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#8b949e;">Organization</td>
          <td style="padding:6px 0;color:#e6edf3;">${data.organization || 'Not provided'}</td>
        </tr>
      </table>

      <h2 style="color:#5aab80;margin-top:24px;">License Details</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;color:#8b949e;width:160px;">Format Requested</td>
          <td style="padding:6px 0;color:#e6edf3;">${data.format || 'Not specified'}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#8b949e;">Usage</td>
          <td style="padding:6px 0;color:#e6edf3;">${usageList}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#8b949e;">Runtime / Duration</td>
          <td style="padding:6px 0;color:#e6edf3;">${data.runtime || 'Not specified'}</td>
        </tr>
      </table>

      <h2 style="color:#5aab80;margin-top:24px;">Project Description</h2>
      <p style="background:#0d1117;padding:16px;border-radius:6px;border-left:3px solid #3d7a5c;color:#e6edf3;line-height:1.6;">
        ${data.description || 'No description provided.'}
      </p>

      <h2 style="color:#5aab80;margin-top:24px;">Requested Media (${mediaItems.length} item${mediaItems.length !== 1 ? 's' : ''})</h2>
      <table style="width:100%;border-collapse:collapse;">
        ${formatMediaList(mediaItems)}
      </table>

      <p style="margin-top:32px;color:#8b949e;font-size:12px;border-top:1px solid #30363d;padding-top:16px;">
        Submitted via BC Stock · bcstock.ca
      </p>
    </div>
  </div>
</body>
</html>`
}

function buildConfirmationEmailHtml(data: QuoteFormData, mediaItems: Media[]): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="background:#0d1117;color:#e6edf3;font-family:Arial,sans-serif;max-width:700px;margin:0 auto;padding:24px;">
  <div style="border:1px solid #30363d;border-radius:8px;overflow:hidden;">
    <div style="background:#3d7a5c;padding:24px 32px;">
      <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:2px;">BC STOCK</h1>
      <p style="margin:4px 0 0;color:#c3e8d6;font-size:14px;">Quote Request Received</p>
    </div>
    <div style="padding:32px;background:#161b22;">
      <p style="color:#e6edf3;line-height:1.6;">
        Hi there,<br/><br/>
        Thank you for your interest in BC Stock footage and photography. We've received your quote request for <strong>${mediaItems.length} item${mediaItems.length !== 1 ? 's' : ''}</strong> and will be in touch shortly.
      </p>

      <p style="color:#8b949e;line-height:1.6;">
        We typically respond within 1–2 business days. If your project has an urgent deadline, please reply to this email and let us know.
      </p>

      <h2 style="color:#5aab80;margin-top:24px;">Your Requested Items</h2>
      <table style="width:100%;border-collapse:collapse;">
        ${formatMediaList(mediaItems)}
      </table>

      <p style="margin-top:32px;color:#8b949e;font-size:12px;border-top:1px solid #30363d;padding-top:16px;">
        BC Stock · Olamfilms · video@olamfilms.com<br/>
        British Columbia Stock Footage &amp; Photography
      </p>
    </div>
  </div>
</body>
</html>`
}

export async function sendQuoteEmail(
  data: QuoteFormData,
  mediaItems: Media[]
): Promise<void> {
  // Send notification to admin
  await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    subject: `New Quote Request from ${data.organization || data.email} — ${mediaItems.length} item${mediaItems.length !== 1 ? 's' : ''}`,
    html: buildAdminEmailHtml(data, mediaItems),
  })

  // Send confirmation to submitter
  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject: 'Your BC Stock Quote Request — We\'ll be in touch',
    html: buildConfirmationEmailHtml(data, mediaItems),
  })
}
