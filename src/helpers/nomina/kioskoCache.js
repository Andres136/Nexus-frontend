const BOOTSTRAP_PREFIX = "kiosko_bootstrap_cache:";
const DESCRIPTOR_PREFIX = "kiosko_face_descriptors:";
const CACHE_VERSION = 1;
const BOOTSTRAP_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function bootstrapKey(uuid) {
  return `${BOOTSTRAP_PREFIX}${uuid}`;
}

function descriptorsKey(uuid) {
  return `${DESCRIPTOR_PREFIX}${uuid}`;
}

export function saveKioskoBootstrapCache(uuid, bootstrap) {
  if (!uuid || !bootstrap?.device) return false;

  return writeJson(bootstrapKey(uuid), {
    version: CACHE_VERSION,
    cachedAt: new Date().toISOString(),
    data: bootstrap,
  });
}

export function getKioskoBootstrapCache(uuid) {
  if (!uuid) return null;

  const cached = readJson(bootstrapKey(uuid));
  if (!cached || cached.version !== CACHE_VERSION || !cached.data?.device) return null;

  const cachedAt = new Date(cached.cachedAt).getTime();
  if (!cachedAt || Date.now() - cachedAt > BOOTSTRAP_MAX_AGE_MS) {
    localStorage.removeItem(bootstrapKey(uuid));
    return null;
  }

  return cached.data;
}

export function saveFaceDescriptorCache(uuid, descriptorsByPhoto) {
  if (!uuid || !descriptorsByPhoto) return false;

  return writeJson(descriptorsKey(uuid), {
    version: CACHE_VERSION,
    cachedAt: new Date().toISOString(),
    descriptorsByPhoto,
  });
}

export function getFaceDescriptorCache(uuid) {
  if (!uuid) return {};

  const cached = readJson(descriptorsKey(uuid));
  if (!cached || cached.version !== CACHE_VERSION || !cached.descriptorsByPhoto) return {};

  return cached.descriptorsByPhoto;
}
