export const FETCH_SIGNAL_TIMEOUT = 5000; // ms
export const HEADER_USER_AGENT = { "User-Agent": `COOKED-App/1.0 (${process.env.CONTACT_EMAIL})` };
export const REDIS_CACHE_TTL_7D = 7 * 24 * 60 * 60; // 7 jours (en s)
export const REDIS_CACHE_TTL_1D = 24 * 60 * 60; // 1 jour (en s)