import React, { useReducer } from "react";
import Swal from "sweetalert2";
import ProductContext from "./ProductContext";
import ProductReducer from "./ProductReducer";
import MethodGet, { MethodPost, MethodPut, MethodDelete } from "../../config/Service";
import {
    GET_PRODUCTS,
    ADD_PRODUCT,
    UPDATE_PRODUCT,
    DELETE_PRODUCT,
    PRODUCT_ERROR,
} from "../../types";
import imageHeaders from "../../config/imageHeader";

const ProductState = (props) => {
    const initialState = {
        products: [],
        loading: false,
        error: null,
        pagination: null, // Agregar paginación al estado
    };

    const [state, dispatch] = useReducer(ProductReducer, initialState);

    // Obtener productos con paginación
    const getProducts = async (page = 1, searchTerm = "") => {
        try {
            dispatch({ type: "SET_LOADING", payload: true });

            let url = `/products?page=${page}&limit=10`;
            if (searchTerm) {
                url += `&search=${encodeURIComponent(searchTerm)}`;
            }

            const res = await MethodGet(url);

            dispatch({
                type: GET_PRODUCTS,
                payload: {
                    products: Array.isArray(res.data.products) ? res.data.products : [],
                    pagination: {
                        page: res.data.page,
                        totalPages: res.data.totalPages,
                        total: res.data.total,
                        limit: res.data.limit
                    }
                },
            });
        } catch (error) {
            dispatch({
                type: PRODUCT_ERROR,
                payload: error.response?.data?.message || "Error al obtener productos",
            });
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    };

    // Crear un nuevo producto
    const addProduct = async (data) => {
        try {
            const res = await MethodPost("/products", data, imageHeaders);
            dispatch({
                type: ADD_PRODUCT,
                payload: res.data,
            });
            Swal.fire({
                title: "Producto agregado",
                text: "El producto se creó correctamente.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al crear el producto",
                icon: "error",
            });
            dispatch({
                type: PRODUCT_ERROR,
                payload: error.response?.data?.message,
            });
        }
    };

    // Actualizar producto
    const updateProduct = async (id, formData) => {
        try {
            const res = await MethodPut(`/products/${id}`, formData);

            dispatch({
                type: UPDATE_PRODUCT,
                payload: res.data,
            });

            Swal.fire({
                title: "Producto actualizado",
                text: "El producto se actualizó correctamente.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });

            return res.data;
        } catch (error) {
            dispatch({
                type: PRODUCT_ERROR,
                payload: error.response?.data?.message || "No se pudo actualizar el producto",
            });

            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "No se pudo actualizar el producto",
                icon: "error",
            });

            throw error;
        }
    };

    // Obtener producto por ID
    const obtenerProductPorId = async (id) => {
        try {
            const { data } = await MethodGet(`/products/${id}`);
            return data;
        } catch (error) {
            console.error("Error al obtener producto:", error);
            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "No se pudo cargar el producto",
                icon: "error",
            });
            throw error;
        }
    };

    // Eliminar producto
    const deleteProduct = async (id) => {
        try {
            await MethodDelete(`/products/${id}`);
            dispatch({
                type: DELETE_PRODUCT,
                payload: id,
            });
            return Promise.resolve();
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al eliminar el producto",
                icon: "error",
            });
            dispatch({
                type: PRODUCT_ERROR,
                payload: error.response?.data?.message,
            });
            return Promise.reject(error);
        }
    };

    return (
        <ProductContext.Provider
            value={{
                products: state.products,
                loading: state.loading,
                error: state.error,
                pagination: state.pagination, // Exportar paginación
                getProducts,
                addProduct,
                updateProduct,
                obtenerProductPorId,
                deleteProduct,
            }}
        >
            {props.children}
        </ProductContext.Provider>
    );
};

export default ProductState;