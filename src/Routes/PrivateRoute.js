import React from 'react';
import { Route, Redirect } from "react-router-dom";
import PropTypes from 'prop-types';

export const PrivateRouter = ({
    isAuthenticated,
    component: Component,
    ...rest
}) => {
    // Guardar la última ruta visitada
    if (rest.location?.pathname) {
        localStorage.setItem('lastPath', rest.location.pathname);
    }

    return (
        <Route
            {...rest}
            render={(props) =>
                isAuthenticated
                    ? <Component {...props} />
                    : <Redirect to="/login" />
            }
        />
    );
};

PrivateRouter.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    component: PropTypes.func.isRequired
};
