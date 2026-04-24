import { useEffect } from "react";
import { productsApi } from "../api";
import { useProductsStore } from "../stores";

export const useProducts = () => {
  const { products, loading, error, setProducts, setLoading, setError } = useProductsStore();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await productsApi.getAll();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    if (products.length === 0) {
      fetchProducts();
    }
  }, []);

  const refetch = async () => {
    setLoading(true);
    try {
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (data: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("price", data.price);
      formData.append("imageUrl", data.image);
      formData.append("description", data.description);
      await productsApi.create(formData);
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, data: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("price", data.price);
      formData.append("imageUrl", data.image);
      formData.append("description", data.description);
      await productsApi.update(id, formData);
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setLoading(true);
    try {
      await productsApi.delete(id);
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch, createProduct, updateProduct, deleteProduct };
};
