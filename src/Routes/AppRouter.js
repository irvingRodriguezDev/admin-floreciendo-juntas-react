import React, { useContext, useEffect } from "react";
// REMOVER BrowserRouter de aquí - ya existe en App.js
import { Switch, Route } from "react-router-dom";
import { Grid, Box, CircularProgress, Typography } from "@mui/material";

// Context
import AuthContext from "../context/AuthContext/AuthContext";

// Rutas
import { PrivateRouter } from "./PrivateRoute";
import { PublicRouter } from "./PublicRoute";

// Páginas
import Login from "../pages/login/Login";
// import Error from "../pages/error/Error";
import Layout from "../components/Layout/Layout";

export default function AppRouter() {
	const { autenticado, usuarioAutenticado, cargando } = useContext(AuthContext);

	useEffect(() => {
		usuarioAutenticado();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (cargando) {
		return (
			<Grid item xs={12}>
				<Box
					sx={{
						width: "105%",
						height: "100vh",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexDirection: "column",
						bgcolor: "background.default",
					}}
				>
					<CircularProgress size={60} thickness={5} color="primary" />
					<Typography sx={{ mt: 2.5, fontSize: 18, color: "#555" }}>
						Cargando...
					</Typography>
				</Box>
			</Grid>
		);
	}

	return (
		// REMOVER BrowserRouter de aquí - ya está en App.js
		<Switch>
			{/* 1. Rutas públicas */}
			<PublicRouter
				exact
				path="/login"
				component={Login}
				isAuthenticated={autenticado}
			/>

			{/* 2. Rutas privadas principales */}
			<PrivateRouter
				path="/"
				component={Layout}
				isAuthenticated={autenticado}
			/>

			{/* 3. Fallback: error 404 */}
			{/* <Route
				path="*"
				component={Error}
			/> */}
		</Switch>
	);
}