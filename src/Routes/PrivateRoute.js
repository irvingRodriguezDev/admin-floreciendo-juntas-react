import React from "react";
import { Route, Redirect } from "react-router-dom";
import PropTypes from "prop-types";
import Swal from "sweetalert2";

export const PrivateRouter = ({
    isAuthenticated,
    component: Component,
    allowedRoles = [],
    ...rest
}) => {
    const roleId = localStorage.getItem("roleId"); // string o null

    return (
        <Route
            {...rest}
            render={(props) => {
                const path = props.location.pathname;

                // 1️⃣ Usuario no autenticado → login
                if (!isAuthenticated) return <Redirect to="/login" />;

                if (!roleId) return null;

                // 2️⃣ Reglas de rutas por rol (solo accesibles)
                const rutasPermitidasPorRol = {
                    "4": ["/task"],       // Tareas
                    "5": ["/scanner"],    // Scanner
                };

                // 3️⃣ Exclusión para role 1: NO puede Scanner ni Task
                const rutasExcluidasRole1 = ["/scanner", "/task"];
                if (parseInt(roleId) === 1 && rutasExcluidasRole1.includes(path)) {
                    Swal.fire({
                        icon: "error",
                        title: "Acceso denegado",
                        text: "No tienes permiso para esta sección",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                    return <Redirect to="/" />; // dashboard
                }

                // 4️⃣ Roles 4 y 5: solo pueden sus rutas
                const permitidas = rutasPermitidasPorRol[roleId];
                if (permitidas && !permitidas.includes(path)) {
                    Swal.fire({
                        icon: "error",
                        title: "Acceso denegado",
                        text: "No tienes permiso para esta sección",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                    return <Redirect to={permitidas[0]} />;
                }

                // 5️⃣ AllowedRoles opcional
                if (allowedRoles.length > 0 && !allowedRoles.includes(roleId)) {
                    Swal.fire({
                        icon: "error",
                        title: "Acceso denegado",
                        text: "No tienes permiso para esta sección",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                    return <Redirect to="/" />;
                }

                // 6️⃣ Todo OK → renderiza componente
                return <Component {...props} />;
            }}
        />
    );
};

PrivateRouter.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    component: PropTypes.func.isRequired,
    allowedRoles: PropTypes.array,
};
