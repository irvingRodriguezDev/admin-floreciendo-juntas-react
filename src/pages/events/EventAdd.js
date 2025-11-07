import React, { useState, useContext, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    Paper,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import Swal from 'sweetalert2';
import { Event as EventIcon } from '@mui/icons-material';
import EventContext from '../../context/EventContext/EventContext';
import { getImageUrl } from '../../utils/image';

const EventAdd = ({ onCancel }) => {
    const history = useHistory();
    const { id } = useParams();
    const { crearEvento, actualizarEvento, obtenerEventoPorId, cargando } = useContext(EventContext) || {};

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isTablet = useMediaQuery(theme.breakpoints.down("md"));
    const getOptimalWidth = () => {
        if (isMobile) return 300;
        if (isTablet) return 400;
        return 350;
    };
    const optimalWidth = getOptimalWidth();
    const imageQuality = 85;

    const [eventoEditar, setEventoEditar] = useState(null);
    const [form, setForm] = useState({
        title: '',
        description: '',
        image: null,
        startDate: '',
        time: '',
        location: '',
        map: '',
        price: '',
        totalTickets: '',
    });
    const [preview, setPreview] = useState(null);
    const [localErrors, setLocalErrors] = useState({});
    const [localLoading, setLocalLoading] = useState(false);

    const isLoading = cargando !== undefined ? cargando : localLoading;
    const isEditing = !!eventoEditar;

    // 🔹 Configuración de React Quill
    const quillModules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ color: [] }, { background: [] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ align: [] }],
            ['link', 'clean'],
        ],
    };

    const quillFormats = [
        'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
        'color', 'background', 'list', 'bullet', 'align', 'link'
    ];

    const resetForm = () => {
        setForm({
            title: '',
            description: '',
            image: null,
            startDate: '',
            time: '',
            location: '',
            map: '',
            price: '',
            totalTickets: '',
        });
        setPreview(null);
        setLocalErrors({});
        setEventoEditar(null);
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
        return d.toISOString().split('T')[0];
    };

    useEffect(() => {
        const cargarEvento = async () => {
            if (!id) return resetForm();
            try {
                setLocalLoading(true);
                const evento = await obtenerEventoPorId(id);
                if (evento) setEventoEditar(evento);
            } catch (error) {
                console.error('Error al obtener evento:', error);
                Swal.fire('Error', 'No se pudo cargar el evento', 'error');
            } finally {
                setLocalLoading(false);
            }
        };
        cargarEvento();
    }, [id]);

    useEffect(() => {
        if (eventoEditar) {
            setForm({
                title: eventoEditar.title || '',
                description: eventoEditar.description || '',
                image: null,
                startDate: formatDateForInput(eventoEditar.startDate),
                time: eventoEditar.time || '',
                location: eventoEditar.location || '',
                map: eventoEditar.map || '',
                price: eventoEditar.price || '',
                totalTickets: eventoEditar.totalTickets || '',
            });

            setPreview(eventoEditar.image
                ? getImageUrl(eventoEditar.image, optimalWidth, imageQuality)
                : null
            );
        }
    }, [eventoEditar]);

    const timeRegex = /^(1[0-2]|0?[1-9]):[0-5][0-9]\s?(am|pm)\s?a\s?(1[0-2]|0?[1-9]):[0-5][0-9]\s?(am|pm)$/i;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        if (name === "time") {
            if (!timeRegex.test(value)) {
                setLocalErrors((prev) => ({ ...prev, time: 'Formato inválido. Usa el formato 8:00 am a 7:00 pm' }));
            } else {
                setLocalErrors((prev) => ({ ...prev, time: '' }));
            }
        }
    };

    const handleDescriptionChange = (content) => {
        setForm((prev) => ({ ...prev, description: content }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setForm((prev) => ({ ...prev, image: file }));
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const extractSrcFromEmbed = (map) => {
        if (!map) return "https://www.google.com/maps?q=20.6736,-103.344&z=13&output=embed";
        const srcMatch = map.match(/src="([^"]*)"/);
        if (srcMatch && srcMatch[1]) return srcMatch[1];
        if (map.startsWith('http')) return map;
        return "https://www.google.com/maps?q=20.6736,-103.344&z=13&output=embed";
    };

    const validateForm = () => {
        const errors = {};
        if (!form.title.trim()) errors.title = 'El título es obligatorio';
        if (!form.description.trim()) errors.description = 'La descripción es obligatoria';
        if (!form.image && !eventoEditar?.image) errors.image = 'La imagen del evento es obligatoria';
        if (!form.startDate) errors.startDate = 'La fecha del evento es obligatoria';
        if (!form.location.trim() && !form.map.trim()) errors.location = 'La ubicación o mapa embed es obligatorio';
        if (form.price && form.price < 0) errors.price = 'El precio no puede ser negativo';
        if (form.totalTickets && form.totalTickets < 1) errors.totalTickets = 'El número de tickets debe ser mayor a 0';
        setLocalErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const prepareDataForAPI = () => {
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('description', form.description);
        formData.append('startDate', form.startDate);
        formData.append('time', form.time);
        formData.append('location', form.location);
        formData.append('map', form.map);
        formData.append('price', form.price || 0);
        formData.append('totalTickets', form.totalTickets || 0);
        if (form.image) formData.append('image', form.image);
        return formData;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLocalLoading(true);

        try {
            const formData = prepareDataForAPI();

            if (isEditing && actualizarEvento) await actualizarEvento(eventoEditar.id, formData);
            else if (crearEvento) {
                await crearEvento(formData);
                resetForm();
            }

            Swal.fire({
                title: '¡Éxito!',
                text: isEditing ? 'Evento actualizado correctamente' : 'Evento creado correctamente',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });

            if (onCancel) onCancel();
            else history.push('/app/events/list');
        } catch (error) {
            console.error('Error al guardar evento:', error);
            Swal.fire('Error', 'Ocurrió un error al guardar el evento', 'error');
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', overflow: 'visible' }}>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <EventIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            {isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}
                        </Typography>
                    </Box>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={4}>
                            {/* Título */}
                            <Grid item xs={12}>
                                <TextField
                                    label="Título del Evento"
                                    name="title"
                                    fullWidth
                                    required
                                    value={form.title}
                                    onChange={handleChange}
                                    error={!!localErrors.title}
                                    helperText={localErrors.title}
                                />
                            </Grid>

                            {/* Descripción con ReactQuill */}
                            <Grid item xs={12}>
                                <Typography sx={{ mt: 2, mb: 1, fontWeight: 500 }}>Descripción del Evento</Typography>
                                {localErrors.description && <Typography color="error">{localErrors.description}</Typography>}
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, backgroundColor: '#fffefc' }}>
                                    <ReactQuill
                                        theme="snow"
                                        value={form.description}
                                        onChange={handleDescriptionChange}
                                        modules={quillModules}
                                        formats={quillFormats}
                                        style={{ minHeight: 250 }}
                                    />
                                </Paper>
                            </Grid>

                            {/* Resto del formulario igual */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Fecha del Evento"
                                    name="startDate"
                                    type="date"
                                    fullWidth
                                    required
                                    InputLabelProps={{ shrink: true }}
                                    value={form.startDate}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Hora del Evento"
                                    name="time"
                                    fullWidth
                                    value={form.time}
                                    onChange={handleChange}
                                    error={!!localErrors.time}
                                    helperText={localErrors.time || 'Ejemplo: 8:00 am a 7:00 pm'}
                                />
                            </Grid>

                            {/* Precio y tickets */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Precio"
                                    name="price"
                                    type="number"
                                    fullWidth
                                    value={form.price}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Total de Tickets"
                                    name="totalTickets"
                                    type="number"
                                    fullWidth
                                    value={form.totalTickets}
                                    onChange={handleChange}
                                />
                            </Grid>

                            {/* Ubicación y mapa */}
                            <Grid item xs={12}>
                                <TextField
                                    label="Dirección del evento"
                                    name="location"
                                    fullWidth
                                    value={form.location}
                                    onChange={handleChange}
                                />
                                <TextField
                                    label="Código iframe de Google Maps"
                                    name="map"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={form.map}
                                    onChange={handleChange}
                                    sx={{ mt: 2 }}
                                />
                                {form.map && (
                                    <Box sx={{ mt: 2, width: '100%', height: 300, borderRadius: 2, overflow: 'hidden' }}>
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            style={{ border: 0 }}
                                            src={extractSrcFromEmbed(form.map)}
                                            allowFullScreen
                                            title="Mapa del evento"
                                        />
                                    </Box>
                                )}
                            </Grid>

                            {/* Imagen */}
                            <Grid item xs={12}>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    fullWidth
                                    sx={{ borderStyle: 'dashed' }}
                                >
                                    {isEditing ? 'Cambiar Imagen del Evento' : 'Subir Imagen del Evento'}
                                    <input type="file" hidden accept="image/*" onChange={handleImageChange} required={!isEditing} />
                                </Button>
                                {preview && (
                                    <Box
                                        sx={{
                                            mt: 2,
                                            width: '100%',
                                            maxHeight: 400,
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            backgroundColor: '#f5f5f5',
                                        }}
                                    >
                                        <img
                                            src={preview}
                                            alt="Vista previa"
                                            style={{
                                                width: '100%',
                                                height: 'auto',
                                                objectFit: 'contain',
                                                maxHeight: 400,
                                            }}
                                        />
                                    </Box>
                                )}
                            </Grid>

                            {/* Botones */}
                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => onCancel ? onCancel() : history.push("/app/events/list")}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Guardando...' : isEditing ? 'Actualizar Evento' : 'Crear Evento'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default EventAdd;
