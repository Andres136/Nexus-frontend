const STORAGE_KEY = "kiosko_device_sessions";
const FINGERPRINT_KEY = "kiosko_device_fingerprint";
const NONCE_KEY = "kiosko_device_nonce";

function getSessionStore() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function setSessionStore(value) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function stableFingerprintSource(nonce) {
  return `kiosko:${nonce}`;
}

function legacyFingerprintSource(nonce) {
  return [
    navigator.userAgent,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen.width,
    screen.height,
    screen.colorDepth,
    nonce,
  ].join("|");
}

export async function getKioskoFingerprint() {
  const storedFingerprint = localStorage.getItem(FINGERPRINT_KEY);
  if (storedFingerprint) return storedFingerprint;

  let nonce = localStorage.getItem(NONCE_KEY);

  if (!nonce) {
    nonce = crypto.randomUUID();
    localStorage.setItem(NONCE_KEY, nonce);
  }

  const fingerprint = await sha256(stableFingerprintSource(nonce));
  localStorage.setItem(FINGERPRINT_KEY, fingerprint);

  return fingerprint;
}

export async function getKioskoFingerprintCandidates() {
  const storedFingerprint = localStorage.getItem(FINGERPRINT_KEY);
  if (storedFingerprint) return [storedFingerprint];

  let nonce = localStorage.getItem(NONCE_KEY);

  if (!nonce) {
    nonce = crypto.randomUUID();
    localStorage.setItem(NONCE_KEY, nonce);
  }

  const stableFingerprint = await sha256(stableFingerprintSource(nonce));
  const legacyFingerprint = await sha256(legacyFingerprintSource(nonce));
  localStorage.setItem(FINGERPRINT_KEY, stableFingerprint);

  return [...new Set([stableFingerprint, legacyFingerprint])];
}

export function shouldClearKioskoSession(message = "") {
  const normalized = String(message).toLowerCase();

  return [
    "sesión del kiosko no es válida",
    "kiosko no ha sido activado",
    "activado en otro dispositivo",
    "kiosko fue revocado",
    "dispositivo fue revocado",
    "link temporal ya fue usado en otro dispositivo",
    "link de acceso temporal no es válido",
  ].some((pattern) => normalized.includes(pattern));
}

export function saveKioskoSession(uuid, sessionToken) {
  const sessions = getSessionStore();
  sessions[uuid] = sessionToken;
  setSessionStore(sessions);
}

export function getKioskoSession(uuid) {
  return getSessionStore()[uuid] || null;
}

export function removeKioskoSession(uuid) {
  const sessions = getSessionStore();
  delete sessions[uuid];
  setSessionStore(sessions);
}

// ─── Guest session (acceso temporal sin fingerprint) ──────────────────────────
const GUEST_STORAGE_KEY = "kiosko_guest_sessions";

function getGuestStore() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function setGuestStore(value) {
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(value));
}

export function saveKioskoGuestSession(uuid, guestToken, expiresAt) {
  const store = getGuestStore();
  store[uuid] = { token: guestToken, expiresAt };
  setGuestStore(store);
}

export function getKioskoGuestSession(uuid) {
  const entry = getGuestStore()[uuid];
  if (!entry) return null;
  if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
    removeKioskoGuestSession(uuid);
    return null;
  }
  return entry.token;
}

export function removeKioskoGuestSession(uuid) {
  const store = getGuestStore();
  delete store[uuid];
  setGuestStore(store);
}

export function isGuestSession(uuid) {
  return !!getKioskoGuestSession(uuid);
}
