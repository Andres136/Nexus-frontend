import { useState } from "react";
import {
  Coins,
  Percent,
  ShieldCheck,
  Upload,
} from "lucide-react";

export function useConfiguracionNominaTabs() {
  const [activeConfigTab, setActiveConfigTab] = useState("laboral");

  const configTabs = [
    { id: "laboral", label: "Parámetros laborales", icon: Coins },
    { id: "porcentajes", label: "Porcentajes", icon: Percent },
    { id: "contable", label: "PUC contable", icon: ShieldCheck },
    { id: "documentos", label: "Documentos", icon: Upload },
  ];

  return {
    activeConfigTab,
    setActiveConfigTab,
    configTabs,
  };
}
