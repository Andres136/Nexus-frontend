import { useState } from "react";
import { showToast } from "../../helpers/utils/showToast";
import { useSubirFirmaConfiguracionNomina } from "./useConfiguracionNomina";

export function useConfiguracionDocumentos() {
  const [firmaFile, setFirmaFile] = useState(null);

  const firmaMutation = useSubirFirmaConfiguracionNomina({
    onSuccess: () => setFirmaFile(null),
  });

  const guardarFirma = (event) => {
    event.preventDefault();

    if (!firmaFile) {
      showToast("error", "Selecciona una imagen de firma.");
      return;
    }

    firmaMutation.mutate(firmaFile);
  };

  return {
    firmaFile,
    setFirmaFile,
    firmaMutation,
    guardarFirma,
  };
}