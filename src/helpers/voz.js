let vozLista = false;

function elegirVozFemenina() {
  const voces = speechSynthesis.getVoices();
  // Preferencia: voz femenina en español
  const preferidas = [
    "Paulina",
    "Mónica",
    "Monica",
    "Sabina",
    "Helena",
    "Laura",
    "Dalia",
    "Luciana",
    "Google español",
    "female",
    "mujer",
  ];
  for (const p of preferidas) {
    const v = voces.find(
      (voz) => voz.lang.startsWith("es") && voz.name.toLowerCase().includes(p.toLowerCase())
    );
    if (v) return v;
  }
  // Fallback: cualquier voz en español
  return voces.find((v) => v.lang.startsWith("es")) ?? null;
}

export function hablar(texto) {
  if (!window.speechSynthesis) return;

  const decir = () => {
    speechSynthesis.cancel();
    // Chrome deja el motor "pegado" si speak() se llama en el mismo tick que
    // cancel(): la utterance anterior no alcanza a limpiarse y la nueva queda
    // pendiente sin sonar. Un pequeño respiro evita el bloqueo.
    setTimeout(() => {
      const utt = new SpeechSynthesisUtterance(texto);
      utt.lang  = "es-CO";
      utt.rate  = 0.88;
      utt.pitch = 1.2;
      const voz = elegirVozFemenina();
      if (voz) utt.voice = voz;
      speechSynthesis.speak(utt);
    }, 80);
  };

  if (vozLista || speechSynthesis.getVoices().length > 0) {
    decir();
  } else {
    speechSynthesis.onvoiceschanged = () => { vozLista = true; decir(); };
  }
}
