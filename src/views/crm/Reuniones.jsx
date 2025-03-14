
import { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";



export default function Reuniones() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState([]);


  // Obtener productos de la API

  useEffect(() => {
    const fetchProducts = async () => {
      try {
       const token = localStorage.getItem("token");
        const res = await clienteAxios.get("/api/siigo/global/inventario", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(res.data.results || []);
        console.log(res.data.results);
      } catch (error) {
        console.error(error);
      }
    }
 fetchProducts();
  }, []);

   // 2. Filtrar cuando cambie searchTerm o products
   useEffect(() => {
    // Si no hay término de búsqueda, no mostramos nada
    if (!searchTerm) {
      setFiltered([]);
      return;
    }


    // Convertimos a minúsculas para coincidencia parcial
    const term = searchTerm.toLowerCase();
    const filteredProducts = products.filter((p) => {
      // Chequeamos code, name, description
      const code = p.code ? p.code.toLowerCase() : "";
      const name = p.name ? p.name.toLowerCase() : "";
      const desc = p.description ? p.description.toLowerCase() : "";
      return code.includes(term) || name.includes(term) || desc.includes(term);
    });

    setFiltered(filteredProducts);
  }, [searchTerm, products]);
  
    return (


      <div style={{ padding: "1rem" }}>
      <h1>Buscador de Productos (Siigo)</h1>

      <input
        type="text"
        placeholder="Buscar por código, nombre o descripción..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: "300px", padding: "0.5rem" }}
      />

      {/* 3. Mostrar resultados solo si searchTerm no está vacío */}
      {!searchTerm ? (
        <p>Escribe algo para buscar...</p>
      ) : filtered.length === 0 ? (
        <p>No hay resultados para "{searchTerm}"</p>
      ) : (
        /* 4. Grid de 2 columnas */
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
              style={{ border: "1px solid #ccc", padding: "0.5rem" }}
            >
              <strong>{prod.name}</strong> <br />
              Código: {prod.code} <br />
              Cantidad disponible: {prod.available_quantity} <br />
              {prod.warehouses && prod.warehouses.length > 0 && (
                <ul>
                  {prod.warehouses.map((wh) => (
                    <li key={wh.id}>
                      {wh.name}: {wh.quantity}
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
