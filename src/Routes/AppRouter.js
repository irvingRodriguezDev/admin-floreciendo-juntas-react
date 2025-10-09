import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Switch } from "react-router-dom";
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
						height: "177%",
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
		<Router>
			<Switch>
				{/* Rutas públicas */}
				<PublicRouter
					exact
					path="/login"
					component={Login}
					isAuthenticated={autenticado}
				/>

				{/* Rutas privadas */}
				<PrivateRouter
					path="/app"
					component={Layout}
					isAuthenticated={autenticado}
				/>

				{/* Fallback: error 404 */}
				<PrivateRouter
					path="*"
					component={Error}
					isAuthenticated={autenticado}
				/>
			</Switch>
		</Router>
	);
}
