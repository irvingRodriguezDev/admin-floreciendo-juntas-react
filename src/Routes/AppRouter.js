import React, { useContext, useEffect } from "react";
// Se renombra a 'BrowserRouter' para mayor claridad.
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Grid, Box, CircularProgress } from "@mui/material";

// Context
import AuthContext from "../context/AuthContext/AuthContext";

// Rutas
import { PrivateRouter } from "./PrivateRoute";
import { PublicRouter } from "./PublicRoute";

// Páginas
import Login from "../pages/login/Login";
import Error from "../pages/error/Error";
import Layout from "../components/Layout/Layout";

export default function AppRouter() {
	const { autenticado, usuarioAutenticado, cargando } = useContext(AuthContext);

	useEffect(() => {
		usuarioAutenticado();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Spinner mientras se valida la sesión
	if (cargando) {
		return (
			<Grid item xs={12}>
				<Box
					sx={{
						width: "105%",
						height: "100vh", // Usar 100vh para ocupar toda la altura visible
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexDirection: "column",
						bgcolor: "background.default",
					}}
				>
					<CircularProgress size={60} thickness={5} color="primary" />
					<p style={{ marginTop: 20, fontSize: 18, color: "#555" }}>Cargando...</p>
				</Box>
			</Grid>
		);
	}

	return (
		// Se usa BrowserRouter directamente en lugar de Router
		<BrowserRouter>
			<Switch>
				{/* 1. Rutas públicas - EXACT MATCH for /login */}
				<PublicRouter
					exact
					path="/login"
					component={Login}
					isAuthenticated={autenticado}
				/>

				{/* 2. Rutas privadas principales - Layout es el contenedor de /dashboard, /profile, etc. */}
				<PrivateRouter
					path="/"
					component={Layout}
					isAuthenticated={autenticado}
				/>

				{/* 3. Fallback: error 404 - Usa Route simple, ya que no importa el estado de autenticación aquí, 
                    solo que ninguna ruta haya coincidido. Se coloca al final de Switch. */}
				<Route
					path="*"
					component={Error}
				/>
			</Switch>
		</BrowserRouter>
	);
}