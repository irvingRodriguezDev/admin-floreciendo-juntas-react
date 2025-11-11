import React from 'react';
import { Route, Redirect } from "react-router-dom";
import PropTypes from 'prop-types';

export const PrivateRouter = ({
    isAuthenticated,
    component: Component,
    allowedRoles = [],
    ...rest
}) => {
    const roleId = localStorage.getItem('roleId'); // string o null

    // Guardar la última ruta visitada
    if (rest.location?.pathname) {
        localStorage.setItem('lastPath', rest.location.pathname);
    }

    return (
        <Route
            {...rest}
            render={(props) => {
                if (!isAuthenticated) return <Redirect to="/login" />;

                if (!roleId) return null; // Esperamos a que roleId exista

                if (allowedRoles.length > 0 && !allowedRoles.includes(roleId)) {
                    // Rol no permitido → redirigir a su ruta por rol
                    if (roleId === "1") return <Redirect to="/dashboard" />;
                    if (roleId === "5") return <Redirect to="/scanner" />;
                    return null;
                }

                return <Component {...props} />;
            }}
        />
    );
};

PrivateRouter.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    component: PropTypes.func.isRequired,
    allowedRoles: PropTypes.array
};
