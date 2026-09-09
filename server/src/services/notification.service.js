'use strict';

const nodemailer = require('nodemailer');
const logger     = require('../utils/logger');
const { formatCurrency } = require('../utils/helpers');

const log = logger.child('Notification');
let _transport = null;

const _getTransport = () => {
  if (_transport) return _transport;
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) { log.warn('SMTP not configured — email alerts disabled'); return null; }
  _transport = nodemailer.createTransport({
    host:   SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT || '587', 10),
    secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
    auth: { user:SMTP_USER, pass:SMTP_PASS },
    tls: { rejectUnauthorized: process.env.NODE_ENV==='production' },
  });
  log.info('SMTP transporter ready');
  return _transport;
};

const Notification = require('../models/Notification');

const sendPriceDropAlert = async (alert, currentPrice) => {
  const user = alert.userId;
  const clientUrl  = process.env.CLIENT_URL || 'http://localhost:5173';
  const productUrl = `${clientUrl}/products/${alert.productId}`;
  const currency   = alert.currency || 'INR';
  const fmtCur  = formatCurrency(currentPrice, currency);
  const fmtTgt  = formatCurrency(alert.targetPrice, currency);

  // 1. Create In-App Notification
  try {
    if (user?._id || user?.id) {
      await Notification.create({
        userId: user._id || user.id,
        type: 'TARGET_REACHED',
        title: `Price Target Reached! Now ${fmtCur}`,
        message: `The product you tracked dropped to ${fmtCur} (Target: ${fmtTgt}).`,
        link: `/products/${alert.productId}`
      });
    }
  } catch (e) {
    log.warn(`In-app notification creation failed: ${e.message}`);
  }

  // 2. Send Email if SMTP available
  const t = _getTransport();
  if (!t || !user?.email) return { sent: true, inAppOnly: true };

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Price Drop Alert</title>
<style>body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0}
.w{max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden}
.h{background:#2563eb;padding:24px;text-align:center}.h h1{color:#fff;margin:0}
.b{padding:32px}.box{background:#f0fdf4;border:1px solid #86efac;border-radius:6px;padding:16px;margin:20px 0;text-align:center}
.price{font-size:32px;font-weight:bold;color:#16a34a}.tgt{font-size:14px;color:#6b7280}
.btn{display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:bold;margin:16px 0}
.ft{background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#9ca3af}</style></head>
<body><div class="w"><div class="h"><h1>Price Drop Alert!</h1></div>
<div class="b"><p>Hi ${user.name||'there'},</p>
<p>The product you are tracking has dropped to your target price.</p>
<div class="box"><div class="price">${fmtCur}</div><div class="tgt">Your target: ${fmtTgt}</div></div>
<p>Act fast — prices can change at any time.</p>
<a href="${productUrl}" class="btn">View &amp; Compare Prices</a>
<p style="font-size:12px;color:#6b7280;margin-top:24px">You received this because you set a price alert on PriceHunt. <a href="${clientUrl}/price-alerts">Manage alerts</a></p>
</div><div class="ft">&copy; ${new Date().getFullYear()} PriceHunt</div></div></body></html>`;

  try {
    const info = await t.sendMail({ from:`"PriceHunt Alerts" <${from}>`, to:user.email, subject:`Price Drop! Now ${fmtCur}`, html, text:`Hi ${user.name}, the price dropped to ${fmtCur} (target: ${fmtTgt}). View: ${productUrl}` });
    log.info(`Alert email sent to ${user.email}`, { messageId:info.messageId });
    return { sent:true, messageId:info.messageId };
  } catch (e) { log.error(`Email failed for ${user.email}: ${e.message}`); return { sent:false, error:e.message }; }
};

const sendWelcomeEmail = async (user) => {
  const t = _getTransport();
  if (!t || !user?.email) return { sent:false };
  const from      = process.env.SMTP_FROM || process.env.SMTP_USER;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  try {
    await t.sendMail({
      from:`"PriceHunt" <${from}>`, to:user.email, subject:'Welcome to PriceHunt',
      html:`<p>Hi ${user.name}, welcome to PriceHunt! <a href="${clientUrl}/search">Start comparing prices</a></p>`,
      text:`Hi ${user.name}, welcome to PriceHunt! Visit ${clientUrl}/search to start.`,
    });
    return { sent:true };
  } catch (e) { log.warn(`Welcome email failed: ${e.message}`); return { sent:false }; }
};

const verifySmtp = async () => {
  const t = _getTransport();
  if (!t) return { ok:false, reason:'SMTP not configured' };
  try { await t.verify(); return { ok:true }; }
  catch (e) { return { ok:false, reason:e.message }; }
};

module.exports = { sendPriceDropAlert, sendWelcomeEmail, verifySmtp };
