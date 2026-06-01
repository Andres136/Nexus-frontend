const STORAGE_KEY = "kiosko_device_sessions";

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

export async function getKioskoFingerprint() {
  const nonceKey = "kiosko_device_nonce";
  let nonce = localStorage.getItem(nonceKey);

  if (!nonce) {
    nonce = crypto.randomUUID();
    localStorage.setItem(nonceKey, nonce);
  }

  const source = [
    navigator.userAgent,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen.width,
    screen.height,
    screen.colorDepth,
    nonce,
  ].join("|");

  return sha256(source);
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
