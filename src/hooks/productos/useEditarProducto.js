import { useEffect, useState } from "react";
import { productsApi } from "../../services/api";

export function useEditarProducto(id) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [producto, setProducto] = useState(null);

  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    categoria_id: "",
  });

  // 🔹 Cargar producto
  useEffect(() => {
    if (!id) return;

    const fetchProducto = async () => {
      setLoading(true);
      setErrors({});
      try {
        const response = await productsApi.getById(id);
        const prod = response.data.data;

        setProducto(prod);
        setForm({
          name: prod.name ?? "",
          code: prod.code ?? "",
          description: prod.description ?? "",
          categoria_id: prod.categoria_id ?? "",
        });
      } catch (error) {
        console.error("Error al obtener producto:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
  }, [id]);

  // 🔹 Manejar cambios del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Guardar cambios
  const updateProducto = async () => {
    if (!id) return;

    setSaving(true);
    setErrors({});

    try {
      await productsApi.updateProducto(id, form);
      return true; // ✅ éxito
    } catch (error) {
      if (error?.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        return false;
      }

      console.error("Error al actualizar producto:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  };




  return {
    loading,
    saving,
    producto,
    form,
    errors,
    handleChange,
    updateProducto,
  };
}
