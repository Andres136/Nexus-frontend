import { useApiSiigo } from "../../hooks/useApiSiigo";

export default function Productos() {
  const { data, isLoading, isError } = useApiSiigo({
    tipo: "setas",  // o "global"
    search: "bolsas",
    page: 1,
  });

  if (isLoading) return <p>Cargando...</p>;
  if (isError) return <p>Error al cargar productos</p>;

  return (
    <div>
      <h2>Productos</h2>
      <ul>
        {data?.items?.map((prod) => (
          <li key={prod.id}>{prod.name}</li>
        ))}
      </ul>
    </div>
  );
}
