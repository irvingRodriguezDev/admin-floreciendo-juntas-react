import React, { useState, useEffect } from "react";
import { Grid, Box, Typography, Paper, Button } from "@mui/material";
import Swal from "sweetalert2";
import { QrScanner } from "@yudiel/react-qr-scanner";
import MethodGet, { MethodDelete, MethodPost, MethodPut } from "../../../src/config/Service";

const ScannerComponent = () => {
    const [scanned, setScanned] = useState(false);
    const [hasCamera, setHasCamera] = useState(null); // null = aún no se ha comprobado

    // 🔍 Comprobamos si hay cámaras disponibles antes de montar QrScanner
    useEffect(() => {
        const checkCamera = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const anyCamera = devices.some((d) => d.kind === "videoinput");
                if (!anyCamera) {
                    setHasCamera(false);
                    await Swal.fire({
                        title: "Sin cámara detectada",
                        text: "No tiene cámara para escanear el QR." ,
                        icon: "warning",
                        confirmButtonText: "Aceptar",
                    });
                } else {
                    setHasCamera(true);
                }
            } catch (err) {
                console.error("Error al verificar cámaras:", err);
                setHasCamera(false);
                await Swal.fire({
                    title: "Error al acceder a la cámara",
                    text: "No se pudo verificar si el dispositivo tiene cámara.",
                    icon: "error",
                    confirmButtonText: "Aceptar",
                });
            }
        };
        checkCamera();
    }, []);

    const handleScan = async (code) => {
        if (!code || scanned) return;
        setScanned(true);
        try {
            await MethodPost("/tickets/validate", { code });
            await Swal.fire({
                title: "¡Boleto validado!",
                text: "El código se envió correctamente",
                icon: "success",
                confirmButtonText: "Escanear otro",
            });
        } catch (error) {
            let message = error.response?.data?.message || "Error al validar el boleto";
            await Swal.fire({
                title: "Error",
                text: message,
                icon: "error",
                confirmButtonText: "Intentar otro",
            });
        }
        setScanned(false);
    };

    const handleError = () => {
        Swal.fire({
            title: "Error al acceder a la cámara",
            text: "No se pudo abrir la cámara. Revisa los permisos o el dispositivo.",
            icon: "error",
            confirmButtonText: "Cerrar",
        });
    };

    // ⏳ Mientras se comprueba si hay cámara
    if (hasCamera === null) {
        return (
            <Box sx={{ textAlign: "center", mt: 5 }}>
                <Typography variant="body1">Verificando cámara...</Typography>
            </Box>
        );
    }

    // ❌ Si no hay cámara, solo mostramos aviso
    if (hasCamera === false) {
        return (
            <Box sx={{ textAlign: "center", mt: 5 }}>
                <Typography variant="h6" color="error">
                    No tiene cámara disponible para escanear.
                </Typography>
            </Box>
        );
    }

    // ✅ Solo se monta QrScanner si hay cámara
    return (
        <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={6}>
                <Paper
                    elevation={3}
                    sx={{
                        p: 1,
                        borderRadius: 4,
                        textAlign: "center",
                        background: "linear-gradient(135deg, rgba(240,244,248,0.9), rgba(255,255,255,0.95))",
                        border: "1px solid rgba(200,200,200,0.3)",
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Escáner de QR
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <QrScanner
                            onDecode={handleScan}
                            onError={handleError}
                            constraints={{ facingMode: "environment" }}
                            style={{ width: "100%", borderRadius: "8px" }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Apunta la cámara al código QR
                        </Typography>
                        {scanned && (
                            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                                Procesando código...
                            </Typography>
                        )}
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default ScannerComponent;
