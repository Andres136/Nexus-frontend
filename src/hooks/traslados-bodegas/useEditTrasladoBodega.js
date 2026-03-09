import { useState, useEffect } from 'react';



import { useProducts } from '../useProducts';
import { useTrasladosBodega } from './useTrasladosBodegas';
import { useSedes } from '../useSedes';
import { productsApi } from '../../services/api';

export const useEditTrasladoBodega = (id) => {
  const { getTrasladoById, traslado, loading, actualizarTraslado } = useTrasladosBodega();
  
  // Estados del hook
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    bodega_origen_id: '',
    bodega_destino_id: '',
    observaciones: '',
    detalles: []
  });
  
  const { products, isLoading, isFetching, isEmpty } = useProducts({ search });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bodegaOrigen, setBodegaOrigen] = useState(null);
  const [bodegaDestino, setBodegaDestino] = useState(null);
  const { bodegas } = useSedes();
  const [stockInfo, setStockInfo] = useState(null);
  const [cantidad, setCantidad] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingStock, setLoadingStock] = useState(false);

  // Funciones de lógica
  const fetchDirectStock = async (productId) => {
    if (!bodegaOrigen?.value) {
      setStockInfo(null);
      return null;
    }

    try {
      setLoadingStock(true);
      const params = { bodega_id: bodegaOrigen.value };
      const res = await productsApi.getStock(productId, params);

      const detalleActual = formData.detalles.find(
        d => d.producto_id === productId
      );

      const stockAjustado = detalleActual
        ? res.data.stock.stock_total + detalleActual.cantidad
        : res.data.stock.stock_total;

      setStockInfo({ stock_total: stockAjustado });
      return stockAjustado;

    } catch (err) {
      console.error('Error al obtener stock:', err);
      setStockInfo(null);
      return null;
    } finally {
      setLoadingStock(false);
    }
  };

  const agregarProducto = () => {
    if (!selectedProduct || !cantidad || parseFloat(cantidad) <= 0) return;

    const existe = formData.detalles.find(
      d => d.producto_id === selectedProduct.value
    );

    if (existe) {
      setFormData(prev => ({
        ...prev,
        detalles: prev.detalles.map(d =>
          d.producto_id === selectedProduct.value
            ? { ...d, cantidad: d.cantidad + parseFloat(cantidad) }
            : d
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        detalles: [
          ...prev.detalles,
          {
            producto_id: selectedProduct.value,
            producto_nombre: selectedProduct.label,
            producto_code: selectedProduct.code,
            cantidad: parseFloat(cantidad),
            stock_disponible: stockInfo?.stock_total ?? 0
          }
        ]
      }));
    }

    // Reset
    setSelectedProduct(null);
    setCantidad('');
    setStockInfo(null);
    setShowAddProduct(false);
  };

  const eliminarProducto = (productoId) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.filter(d => d.producto_id !== productoId)
    }));
  };

  const actualizarCantidad = (productoId, nuevaCantidad) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.map(d =>
        d.producto_id === productoId
          ? { ...d, cantidad: parseFloat(nuevaCantidad) }
          : d
      )
    }));
  };

  const handleSubmit = async (navigate) => {
    if (saving) return;

    setSaving(true);
    try {
      await actualizarTraslado(id, formData);
      navigate(`/auth/obtener-traslados`);
    } catch (error) {
      console.error('Error al guardar:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setShowAddProduct(false);
    setSelectedProduct(null);
    setCantidad('');
    setStockInfo(null);
  };

  const updateFormField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Effects
  useEffect(() => {
    if (selectedProduct && bodegaOrigen) {
      fetchDirectStock(selectedProduct.value);
    } else {
      setStockInfo(null);
    }
  }, [bodegaOrigen, selectedProduct]);

  useEffect(() => {
    if (id) {
      getTrasladoById(id);
    }
  }, [id]);

  useEffect(() => {
    if (!traslado) return;

    setFormData({
      bodega_origen_id: traslado.bodega_origen_id,
      bodega_destino_id: traslado.bodega_destino_id,
      observaciones: traslado.observaciones || '',
      detalles: traslado.detalles.map(d => ({
        producto_code: d.producto.code,
        producto_id: d.producto_id,
        producto_nombre: d.producto.name,
        cantidad: parseFloat(d.cantidad),
        stock_disponible: null,
      })),
    });

    setBodegaOrigen({
      value: traslado.bodega_origen_id,
      label: traslado.bodega_origen.nombre,
    });

    setBodegaDestino({
      value: traslado.bodega_destino_id,
      label: traslado.bodega_destino.nombre,
    });
  }, [traslado]);

  // Computed values
  const bodegaOptions = bodegas?.map(bodega => ({
    value: bodega.id,
    label: bodega.nombre
  })) || [];

  const productOptions = products?.map(product => ({
    value: product.id,
    label: product.name,
    code: product.code
  })) || [];

  const canEdit = traslado?.estado === "PENDIENTE_BODEGA";
  const isFormValid = formData.detalles.length > 0 && 
                     formData.bodega_origen_id && 
                     formData.bodega_destino_id;

  // Return del hook
  return {
    // Estados
    formData,
    traslado,
    loading,
    saving,
    loadingStock,
    stockInfo,
    selectedProduct,
    bodegaOrigen,
    bodegaDestino,
    cantidad,
    showAddProduct,
    search,
    
    // Data
    products,
    isLoading: isLoading || isFetching,
    bodegaOptions,
    productOptions,
    
    // Computed
    canEdit,
    isFormValid,
    
    // Setters
    setSelectedProduct,
    setBodegaOrigen,
    setBodegaDestino,
    setCantidad,
    setShowAddProduct,
    setSearch,
    
    // Funciones
    agregarProducto,
    eliminarProducto,
    actualizarCantidad,
    handleSubmit,
    resetForm,
    updateFormField,
    fetchDirectStock
  };
};