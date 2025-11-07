// context/UserContext/UserState.js
import React, { useReducer } from "react";
import Swal from "sweetalert2";
import UserContext from "./UserContext";
import UserReducer from "./UserReducer";
import MethodGet, { MethodPost, MethodPut, MethodDelete } from "../../config/Service";
import {
    GET_USERS,
    ADD_USER,
    UPDATE_USER,
    DELETE_USER,
    USER_ERROR,
} from "../../types";

const UserState = (props) => {
    const initialState = {
        users: [],
        loading: true,
        error: null,
    };

    const [state, dispatch] = useReducer(UserReducer, initialState);

    // 📦 Obtener todos los usuarios
    const getUsers = async () => {
        try {
            const res = await MethodGet("admin/users");

            dispatch({
                type: GET_USERS,
                payload: res.data.users, // ✅ accedemos al array real
            });
        } catch (error) {
            dispatch({
                type: USER_ERROR,
                payload: error.response?.data?.message || "Error al cargar usuarios",
            });
        }
    };

    // ➕ Crear usuario
    const addUser = async (data) => {
        try {
            const res = await MethodPost("auth/create-user", data);
            dispatch({
                type: ADD_USER,
                payload: res.data,
            });

            Swal.fire({
                title: "Usuario agregado",
                text: "El usuario se creó correctamente.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al crear el usuario",
                icon: "error",
            });
            dispatch({
                type: USER_ERROR,
                payload: error.response?.data?.message,
            });
        }
    };

    // ✏️ Actualizar usuario
    const updateUser = async (id, datos) => {
        try {
            const res = await MethodPut(`/users/${id}`, datos);
            dispatch({
                type: UPDATE_USER,
                payload: res.data.user, // ✅ asegúrate que el backend retorne { user: {...} }
            });

            Swal.fire({
                title: "Éxito",
                text: "Usuario actualizado correctamente",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "No se pudo actualizar el usuario",
                icon: "error",
            });
        }
    };

    // 🗑️ Eliminar usuario
    const deleteUser = async (id) => {
        try {
            await MethodDelete(`/users/${id}`);
            dispatch({
                type: DELETE_USER,
                payload: id,
            });
            Swal.fire({
                title: "Eliminado",
                text: "Usuario eliminado correctamente.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al eliminar el usuario",
                icon: "error",
            });
            dispatch({
                type: USER_ERROR,
                payload: error.response?.data?.message,
            });
        }
    };

    return (
        <UserContext.Provider
            value={{
                users: state.users,
                loading: state.loading,
                error: state.error,
                getUsers,
                addUser,
                updateUser,
                deleteUser,
            }}
        >
            {props.children}
        </UserContext.Provider>
    );
};

export default UserState;
