import  { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { Search, Package, Hash, Warehouse } from "lucide-react"; // Iconos

export default function ApiSiigoGlobal() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState([]);

  // Obtener productos de la API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await clienteAxios.get("/api/siigo/global/inventario", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(res.data.results || []);
        console.log(res.data.results);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProducts();
  }, []);

  // Filtrar productos
  useEffect(() => {
    if (!searchTerm) {
      setFiltered([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filteredProducts = products.filter((p) => {
      const code = p.code ? p.code.toLowerCase() : "";
      const name = p.name ? p.name.toLowerCase() : "";
      const desc = p.description ? p.description.toLowerCase() : "";
      return code.includes(term) || name.includes(term) || desc.includes(term);
    });

    setFiltered(filteredProducts);
  }, [searchTerm, products]);

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      <h1  className="font-bold" style={{ textAlign: "center", marginBottom: "1rem" }}>
        📦 Buscador de Productos (Siigo) GLOBAL
      </h1>

      {/* Input de búsqueda con icono */}
      <div style={{ position: "relative", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Buscar por código, nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem",
            paddingLeft: "2.5rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        />
        <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
      </div>

      {/* Mostrar resultados */}
      {!searchTerm ? (
        <p style={{ textAlign: "center", color: "#777" }}>Escribe algo para buscar...</p>
      ) : filtered.length === 0 ? (
        <p style={{ textAlign: "center", color: "#777" }}>
          No hay resultados para <strong>"{searchTerm}"</strong>
        </p>
      ) : (
        /* Grid de productos */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr", // 2 columnas
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          {filtered.map((prod) => (
            <div
              key={prod.id || prod.code}
              style={{
                border: "1px solid #ddd",
                padding: "1rem",
                borderRadius: "12px",
                boxShadow: "2px 4px 8px rgba(0,0,0,0.1)",
                transition: "0.3s",
                background: "#fff",
              }}
            >
              <strong style={{ fontSize: "1.1rem" }}>{prod.name}</strong> <br />
              
              {/* Código del producto */}
              <div style={{ display: "flex", alignItems: "center", marginTop: "0.5rem", color: "#555" }}>
                <Hash size={18} style={{ marginRight: "8px" }} /> 
                Código: <span style={{ fontWeight: "bold", marginLeft: "4px" }}>{prod.code}</span>
              </div>

              {/* Cantidad disponible */}
              <div style={{ display: "flex", alignItems: "center", marginTop: "0.5rem", color: "#555" }}>
                <Package size={18} style={{ marginRight: "8px" }} />
                Cantidad disponible: <span style={{ fontWeight: "bold", marginLeft: "4px" }}>{prod.available_quantity}</span>
              </div>

              {/* Bodegas */}
              {prod.warehouses && prod.warehouses.length > 0 && (
                <ul style={{ marginTop: "0.5rem", paddingLeft: "20px", color: "#555" }}>
                  {prod.warehouses.map((wh) => (
                    <li key={wh.id} style={{ display: "flex", alignItems: "center" }}>
                      <Warehouse size={18} style={{ marginRight: "8px" }} />
                      {wh.name}: <strong style={{ marginLeft: "4px" }}>{wh.quantity}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
