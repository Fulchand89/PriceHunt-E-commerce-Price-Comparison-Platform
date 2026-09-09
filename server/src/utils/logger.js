'use strict';

const isDev = process.env.NODE_ENV !== 'production';
const LEVELS = { error:0, warn:1, info:2, debug:3 };
const cur    = LEVELS[process.env.LOG_LEVEL] ?? (isDev ? 3 : 2);

const SENSITIVE = ['password','secret','token','jwt','apikey','api_key','authorization'];
const sanitize  = (meta) => {
  if (!meta || typeof meta !== 'object') return meta;
  const out = { ...meta };
  SENSITIVE.forEach(k => { if (out[k] !== undefined) out[k] = '[REDACTED]'; });
  return out;
};

const fmt = (level, msg, meta) => {
  const ts  = new Date().toISOString();
  const sfx = meta ? ' ' + JSON.stringify(sanitize(meta)) : '';
  return isDev
    ? `[${level.toUpperCase()}] ${ts} ${msg}${sfx}`
    : JSON.stringify({ level, ts, message: msg, ...sanitize(meta) });
};

const log = (level, msg, meta) => {
  if (LEVELS[level] > cur) return;
  const line = fmt(level, msg, meta);
  level === 'error' ? process.stderr.write(line + '\n') : process.stdout.write(line + '\n');
};

const logger = {
  error: (m, x) => log('error', m, x),
  warn:  (m, x) => log('warn',  m, x),
  info:  (m, x) => log('info',  m, x),
  debug: (m, x) => log('debug', m, x),
  child: (label) => ({
    error: (m, x) => log('error', `[${label}] ${m}`, x),
    warn:  (m, x) => log('warn',  `[${label}] ${m}`, x),
    info:  (m, x) => log('info',  `[${label}] ${m}`, x),
    debug: (m, x) => log('debug', `[${label}] ${m}`, x),
  }),
};

module.exports = logger;
