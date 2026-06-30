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

    const roleId = localStorage.getItem("roleId");

    return (
        <Route
            {...rest}
            render={(props) => {

                const path = props.location.pathname;

                // Si no hay sesión
                if (!isAuthenticated) {
                    return <Redirect to="/login" />;
                }

                // Mientras carga usuario no dejar pantalla blanca
                if (!roleId) {
                    return <Redirect to="/login" />;
                }


                // ADMIN ROL 1
                // Puede todo menos task
                if (roleId === "1") {

                    if (path.startsWith("/task")) {
                        Swal.fire({
                            icon: "error",
                            title: "Acceso denegado",
                            text: "No tienes permiso para esta sección",
                            timer: 2000,
                            showConfirmButton: false,
                        });

                        return <Redirect to="/dashboard" />;
                    }

                    return <Component {...props} />;
                }


                // ROL 3 - SOLO TASK
                if (roleId === "3") {

                    if (!path.startsWith("/task")) {
                        return <Redirect to="/task" />;
                    }

                    return <Component {...props} />;
                }


                // ROL 5 - SOLO SCANNER
                if (roleId === "5") {

                    if (!path.startsWith("/scanner")) {
                        return <Redirect to="/scanner" />;
                    }

                    return <Component {...props} />;
                }


                // ROL 6 - SOLO VER LIVES
                if (roleId === "6") {

                    if (!path.startsWith("/lives/live_playlist")) {

                        return <Redirect to="/lives/live_playlist" />;
                    }

                    return <Component {...props} />;
                }


                // Validación extra por allowedRoles
                if (
                    allowedRoles.length > 0 &&
                    !allowedRoles.includes(roleId)
                ) {

                    Swal.fire({
                        icon: "error",
                        title: "Acceso denegado",
                        text: "No tienes permiso para esta sección",
                        timer: 2000,
                        showConfirmButton: false,
                    });

                    return <Redirect to="/" />;
                }


                return <Component {...props} />;
            }}
        />
    );
};


PrivateRouter.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    component: PropTypes.elementType.isRequired,
    allowedRoles: PropTypes.array,
};