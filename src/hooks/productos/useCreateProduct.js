import { useState } from "react";
import { productsApi } from "../../services/api";
import { showToast } from "../../helpers/utils/showToast";
import { toast } from "react-toastify";




export const useCreateProduct = () => {
    const[categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [obtenerCategorias, setObtenerCategorias] = useState(false);
    const [products, setProducts] = useState([]);   
    const[error, setError] = useState({});

    const fetchCategorias = async () => {
        try {
            setLoading(true);
            const res = await productsApi.getCategorias();
            setCategorias(res.data);
            setObtenerCategorias(true);
        } catch (error) {
           
            if (error.response && error.response.data.errors) {
                const fieldErrors = error.response.data.errors;
                setError((prev) => ({ ...prev, categorias: fieldErrors }));
            } else {
                setError((prev) => ({ ...prev, categorias: ["Error al cargar categorías"] }));
            }
        } finally {
            setLoading(false);
        }
    };

    
    //Crear categoria
    const createCategoria = async (data) => {
        try {
            setLoading(true);
            const res = await productsApi.createCategoria(data);
            //Actualizar categorias
            setCategorias((prev) => [...prev, res.data]);
            return res.data;
        } catch (error) {
           
            if (error.response && error.response.data.errors) {
                const fieldErrors = error.response.data.errors;
                setError((prev) => ({ ...prev, createCategoria: fieldErrors }));
            } else {
                setError((prev) => ({ ...prev, createCategoria: ["Error al crear categoría"] }));
            }
            throw error;
        } finally {
            setLoading(false);
        }
    };

    //Editar categoria
    const editCategoria = async (id, data) => {
        try {
            setLoading(true);
            const res = await productsApi.editCategoria(id, data);
            //Actualizar categorias
            setCategorias((prev) =>
                prev.map((cat) => (cat.id === id ? res.data : cat))
            );
            return res.data;
        } catch (error) {
           
            if (error.response && error.response.data.errors) {
                const fieldErrors = error.response.data.errors;
                setError((prev) => ({ ...prev, editCategoria: fieldErrors }));
            } else {
                setError((prev) => ({ ...prev, editCategoria: ["Error al editar categoría"] }));
            }
            throw error;
        } finally {
            setLoading(false);
        }
    };

    //Crear producto
    const createProduct = async (data) => {
        try {
            setLoading(true);
            const res = await productsApi.create(data);
            //Actualizar productos
     
            setProducts((prev) => [...prev, res.data]);
            return res.data;
        } catch (error) {
            if (error.response && error.response.data.errors) {
                const fieldErrors = error.response.data.errors;
                setError((prev) => ({ ...prev, createProduct: fieldErrors }));
            } else {
                setError((prev) => ({ ...prev, createProduct: ["Error al crear producto"] }));
            }
            throw error;
        } finally {
            setLoading(false);
        }
    }


    return {
        products,
        categorias,
        loading,
        obtenerCategorias,
        fetchCategorias,
        createProduct,
        createCategoria,
        editCategoria,
        errors: error,
        
    }
}