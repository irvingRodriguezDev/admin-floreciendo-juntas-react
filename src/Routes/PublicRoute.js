import React, { useContext } from "react";
import { Redirect, Route } from "react-router-dom";
import PropTypes from "prop-types";
import AuthContext from "../context/AuthContext/AuthContext";

export const PublicRouter = ({
  isAuthenticated,
  component: Component,
  ...rest
}) => {
  const { usuario } = useContext(AuthContext);
  const roleId = usuario?.roleId ?? usuario?.user?.roleId;

  const getRedirectPath = () => {
    if (roleId === 1) return "/dashboard";
    if (roleId === 5) return "/scanner";
    if (roleId === 3) return "/task";
    if (roleId === 6) return "/lives/live_playlist";
    return null;
  };

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!isAuthenticated) return <Component {...props} />;

        const redirectPath = getRedirectPath();
        if (redirectPath) return <Redirect to={redirectPath} />;

        return <Component {...props} />;
      }}
    />
  );
};

PublicRouter.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  component: PropTypes.func.isRequired,
};