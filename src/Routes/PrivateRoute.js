import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import AuthContext from "../context/AuthContext/AuthContext";

export const PrivateRouter = ({
    isAuthenticated,
    component: Component,
    allowedRoles = [],
    ...rest
}) => {

    const { usuario } = useContext(AuthContext);
    const roleId = usuario?.roleId; // número

    return (
        <Route
            {...rest}
            render={(props) => {
                const path = props.location.pathname;

                if (!isAuthenticated) {
                    return <Redirect to="/login" />;
                }

                if (!roleId) {
                    return null; // todavía cargando el usuario
                }

                if (roleId === 1) {
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

                if (roleId === 3) {
                    if (!path.startsWith("/task")) return <Redirect to="/task" />;
                    return <Component {...props} />;
                }

                if (roleId === 5) {
                    if (!path.startsWith("/scanner")) return <Redirect to="/scanner" />;
                    return <Component {...props} />;
                }

                if (roleId === 6) {
                    if (!path.startsWith("/lives/live_playlist")) {
                        return <Redirect to="/lives/live_playlist" />;
                    }
                    return <Component {...props} />;
                }

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