import { useCallback, useEffect, useRef, useState } from "react";

// Reemplaza el <link rel="manifest"> por uno específico de este kiosko
// (start_url/scope apuntando a su propio código) para que, al instalarse,
// el ícono en el dispositivo siempre abra directo este kiosko.
function useManifestDeKiosko(code, nombre) {
  useEffect(() => {
    if (!code) return undefined;

    const manifest = {
      name: nombre ? `Kiosko - ${nombre}` : "Kiosko SIG-SETASPLAST",
      short_name: "Kiosko",
      display: "standalone",
      start_url: `/kiosko/${code}`,
      scope: `/kiosko/${code}`,
      background_color: "#0a0a0a",
      theme_color: "#0a0a0a",
      icons: [
        { src: "/SETAS.png", sizes: "500x500", type: "image/png", purpose: "any" },
      ],
    };

    const blob = new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" });
    const url = URL.createObjectURL(blob);

    let link = document.querySelector('link[rel="manifest"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.appendChild(link);
    }
    const previousHref = link.href;
    link.href = url;

    return () => {
      URL.revokeObjectURL(url);
      if (link) link.href = previousHref;
    };
  }, [code, nombre]);
}

function registrarServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  // Import dinámico: el módulo virtual solo existe cuando vite-plugin-pwa
  // está activo (build/dev); evita romper otros entornos si falta el plugin.
  import("virtual:pwa-register")
    .then(({ registerSW }) => registerSW({ immediate: true }))
    .catch(() => {
      // Sin service worker el kiosko sigue funcionando normal, solo sin caché.
    });
}

// Registra el SW y expone el estado/acción de instalación como app en el
// dispositivo. Se usa únicamente en las pantallas de kiosko.
export function useKioskoInstall(code, nombre) {
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);
  const deferredPrompt = useRef(null);

  useManifestDeKiosko(code, nombre);

  useEffect(() => {
    registrarServiceWorker();

    const onBeforeInstall = (e) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setCanInstall(true);
    };
    const onInstalled = () => {
      setCanInstall(false);
      setInstalled(true);
      deferredPrompt.current = null;
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    const prompt = deferredPrompt.current;
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice;
    deferredPrompt.current = null;
    setCanInstall(false);
  }, []);

  return { canInstall, installed, promptInstall };
}
