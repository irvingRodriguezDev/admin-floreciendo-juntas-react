import React, { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
} from "@mui/material";
import Swal from "sweetalert2";
import "sweetalert2/src/sweetalert2.scss";
import MethodGet, { MethodPost, MethodPut } from "../../config/Service";

const CourseVideoAdd = () => {
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [videoDuration, setVideoDuration] = useState(null);
    const [videoInfo, setVideoInfo] = useState({ name: "", type: "" });

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("video/")) {
            Swal.fire({
                icon: "error",
                title: "Archivo no válido",
                text: "Por favor selecciona un archivo de video.",
            });
            return;
        }

        setVideoFile(file);
        setVideoInfo({ name: file.name, type: file.type });

        const videoURL = URL.createObjectURL(file);
        setVideoPreview(videoURL);

        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = videoURL;
        video.onloadedmetadata = () => {
            setVideoDuration(video.duration.toFixed(2));
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!videoFile) {
            Swal.fire({
                icon: "warning",
                title: "No hay video",
                text: "Por favor selecciona un video antes de guardar.",
            });
            return;
        }

        // Primera petición: subir el archivo
        const formData = new FormData();
        formData.append("video", videoFile);

        try {
            Swal.fire({
                title: "Subiendo video...",
                text: "Por favor espera un momento",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            // Subir el video primero
            const uploadResponse = await MethodPost("/api/upload-video", formData);

            if (uploadResponse.status === 200) {
                const { video_url } = uploadResponse.data; // por ejemplo, el backend retorna la URL

                // Enviar los metadatos del video
                const metadata = {
                    video_name: videoFile.name,
                    video_type: videoFile.type,
                    video_duration: videoDuration,
                    video_url, // opcional, si la API lo necesita
                };

                const metaResponse = await MethodPost("/api/video-metadata", metadata);

                if (metaResponse.status === 200) {
                    Swal.fire({
                        icon: "success",
                        title: "Video subido correctamente",
                        html: `
            <p><strong>Nombre:</strong> ${videoFile.name}</p>
            <p><strong>Tipo:</strong> ${videoFile.type}</p>
            <p><strong>Duración:</strong> ${videoDuration} segundos</p>
          `,
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error al guardar metadatos",
                        text: "El video se subió pero no se pudieron guardar los datos adicionales.",
                    });
                }
            }
        } catch (error) {
            console.error("Error al subir video o metadatos:", error);
            Swal.fire({
                icon: "error",
                title: "Error al subir el video",
                text: "Ocurrió un error, por favor intenta de nuevo.",
            });
        }
    };


    return (
        <Box sx={{ p: 3 }}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                        Subir video del curso
                    </Typography>

                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Button variant="contained" component="label" fullWidth>
                                    Seleccionar video
                                    <input
                                        type="file"
                                        hidden
                                        accept="video/*"
                                        onChange={handleVideoChange}
                                    />
                                </Button>
                            </Grid>

                            {videoPreview && (
                                <>
                                    <Grid item xs={12}>
                                        <Box
                                            sx={{
                                                width: "100%",
                                                display: "flex",
                                                justifyContent: "center",
                                                mt: 2,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: "100%",
                                                    maxWidth: 750, // 👈 tamaño reducido del video
                                                    borderRadius: 2,
                                                    overflow: "hidden",
                                                    backgroundColor: "#000",
                                                    aspectRatio: "16/9",
                                                }}
                                            >
                                                <video
                                                    src={videoPreview}
                                                    controls
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                        borderRadius: "10px",
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography
                                            variant="body1"
                                            color="text.secondary"
                                            sx={{ textAlign: "center", mt: 1 }}
                                        >
                                            <strong>Nombre:</strong> {videoInfo.name || "—"}
                                            <br />
                                            <strong>Tipo:</strong> {videoInfo.type || "—"}
                                            <br />
                                            {videoDuration && (
                                                <>
                                                    <strong>Duración:</strong> {videoDuration} segundos
                                                </>
                                            )}
                                        </Typography>
                                    </Grid>
                                </>
                            )}

                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    sx={{ mt: 2 }}
                                >
                                    Guardar video
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default CourseVideoAdd;
