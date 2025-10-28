import { useContext } from "react";
import { ProductContext } from "../context/ProductContext";

// Hook para consumir el contexto de productos
const useInventory = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useInventory debe usarse dentro de ProductProvider");
  }
  return context;
};

export default useInventory;
