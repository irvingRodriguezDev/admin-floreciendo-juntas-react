import React from "react";
import { Redirect, Route } from "react-router-dom";
import PropTypes from "prop-types";

export const PublicRouter = ({
  isAuthenticated,
  component: Component,
  ...rest
}) => {
  const roleId = localStorage.getItem("roleId"); // string o null

  const getRedirectPath = () => {
    if (roleId === "1") return "/dashboard";
    if (roleId === "5") return "/scanner";
    return null; // todavía no tenemos roleId
  };

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!isAuthenticated) return <Component {...props} />;

        const redirectPath = getRedirectPath();
        if (redirectPath) return <Redirect to={redirectPath} />;

        // ⚠️ Esperamos a que roleId exista
        return null;
      }}
    />
  );
};

PublicRouter.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  component: PropTypes.func.isRequired,
};
