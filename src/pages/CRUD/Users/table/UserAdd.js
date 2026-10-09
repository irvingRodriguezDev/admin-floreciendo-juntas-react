import React, { useContext, useState } from 'react';

import {
    Box,
    Grid,
    TextField,
    Typography,
    Button,
    MenuItem,
    Paper,
    Avatar,
    Stack,
    Divider,
    IconButton,
    Tooltip,
    CircularProgress,
} from '@mui/material';

import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    CloudUploadOutlined,
    SwapHorizOutlined,
    DeleteOutline as DeleteOutlineIcon,
    InfoOutlined,
    PersonOutlined,
    LockOutlined,
    ImageOutlined,
    AdminPanelSettingsOutlined,
} from '@mui/icons-material';

import { useHistory } from 'react-router-dom';

import Swal from 'sweetalert2';

import UserContext from '../../../../context/UserContext/UserContext';

// ─────────────────────────────────────────────────────────────────────────────
// PALETA
// ─────────────────────────────────────────────────────────────────────────────

const PINK = '#FF5C93';
const PINK_DARK = '#E94E88';
const PINK_SOFT = '#FFE6F0';
const PINK_BG = '#FFF5FA';
const PINK_BG_SOFT = '#FFF0F7';

const GRADIENT =
    'linear-gradient(135deg, #FF5C93 0%, #FF69B4 100%)';

const GRADIENT_HOVER =
    'linear-gradient(135deg, #E94E88 0%, #FF5C93 100%)';

const flexRow = {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
};

// ─────────────────────────────────────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────────────────────────────────────

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        bgcolor: '#fff',
        transition: 'all 0.25s ease',

        '& fieldset': {
            borderColor: PINK_SOFT,
        },

        '&:hover fieldset': {
            borderColor: PINK,
        },

        '&.Mui-focused fieldset': {
            borderColor: PINK,
            borderWidth: 2,
        },
    },

    '& .MuiInputLabel-root.Mui-focused': {
        color: PINK,
    },
};

const primaryBtnSx = {
    py: 1.4,
    px: 3,
    borderRadius: 2,
    fontWeight: 700,
    color: '#fff',
    background: GRADIENT,
    boxShadow: 'none',

    '&:hover': {
        background: GRADIENT_HOVER,
        boxShadow: 'none',
    },

    '&.Mui-disabled': {
        background: '#F5C6D0',
        color: '#fff',
    },
};

const outlineBtnSx = {
    py: 1.4,
    px: 3,
    borderRadius: 2,
    fontWeight: 600,
    color: PINK_DARK,
    border: `1px solid ${PINK}`,

    '&:hover': {
        bgcolor: PINK_BG_SOFT,
        borderColor: PINK_DARK,
    },
};

const smallOutBtnSx = {
    borderRadius: 2,
    color: PINK_DARK,
    borderColor: PINK,

    '&:hover': {
        bgcolor: PINK_BG_SOFT,
        borderColor: PINK_DARK,
    },
};

const smallErrBtnSx = {
    borderRadius: 2,
    borderColor: '#EF9A9A',
    color: '#C62828',

    '&:hover': {
        bgcolor: '#FFEBEE',
        borderColor: '#C62828',
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE HEADER
// ─────────────────────────────────────────────────────────────────────────────

const PageHeader = ({
    icon,
    title,
    subtitle,
    onBack,
}) => (
    <Box
        sx={{
            background: GRADIENT,
            color: '#fff',
            p: {
                xs: 2.5,
                sm: 3,
            },
            gap: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        }}
    >
        <Stack
            direction="row"
            alignItems="center"
            spacing={2}
        >
            {onBack && (
                <Tooltip title="Volver">
                    <IconButton
                        onClick={onBack}
                        sx={{
                            color: '#fff',
                            bgcolor: 'rgba(255,255,255,0.15)',

                            '&:hover': {
                                bgcolor:
                                    'rgba(255,255,255,0.25)',
                            },
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                </Tooltip>
            )}

            <Avatar
                sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    width: 48,
                    height: 48,
                }}
            >
                {icon}
            </Avatar>

            <Box>
                <Typography
                    variant="h6"
                    fontWeight={700}
                >
                    {title}
                </Typography>

                {subtitle && (
                    <Typography
                        variant="body2"
                        sx={{
                            opacity: 0.9,
                        }}
                    >
                        {subtitle}
                    </Typography>
                )}
            </Box>
        </Stack>
    </Box>
);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION
// ─────────────────────────────────────────────────────────────────────────────

const Section = ({
    icon,
    title,
    subtitle,
    children,
}) => (
    <Paper
        variant="outlined"
        sx={{
            p: {
                xs: 2,
                sm: 2.5,
            },
            borderRadius: 3,
            border: `1px solid ${PINK_SOFT}`,
            bgcolor: '#fff',
        }}
    >
        <Box
            sx={{
                ...flexRow,
                mb: subtitle ? 0.5 : 2,
            }}
        >
            <Avatar
                sx={{
                    bgcolor: PINK_BG_SOFT,
                    color: PINK,
                    width: 32,
                    height: 32,
                }}
            >
                {icon}
            </Avatar>

            <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{
                    color: PINK,
                }}
            >
                {title}
            </Typography>
        </Box>

        {subtitle && (
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                    display: 'block',
                    mb: 2,
                    ml: 6,
                }}
            >
                {subtitle}
            </Typography>
        )}

        {children}
    </Paper>
);

// ─────────────────────────────────────────────────────────────────────────────
// DROP ZONE
// ─────────────────────────────────────────────────────────────────────────────

const DropZone = ({
    id,
    icon,
    title,
    helper,
}) => (
    <Box
        onClick={() =>
            document.getElementById(id)?.click()
        }
        sx={{
            border: `2px dashed ${PINK}`,
            borderRadius: 3,
            p: {
                xs: 3,
                sm: 4,
            },
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: PINK_BG_SOFT,
            transition: 'all 0.25s ease',

            '&:hover': {
                bgcolor: PINK_BG,
                borderColor: PINK_DARK,
                transform: 'translateY(-2px)',
                boxShadow:
                    '0 8px 24px rgba(255,92,147,0.15)',
            },
        }}
    >
        <Avatar
            sx={{
                bgcolor: '#fff',
                color: PINK,
                width: 56,
                height: 56,
                mx: 'auto',
                mb: 1.5,
                border: `2px solid ${PINK_SOFT}`,
            }}
        >
            {React.cloneElement(icon, {
                sx: {
                    fontSize: 28,
                },
            })}
        </Avatar>

        <Typography
            fontWeight={700}
            gutterBottom
            sx={{
                color: PINK,
            }}
        >
            {title}
        </Typography>

        <Typography
            variant="caption"
            color="text.secondary"
            display="block"
        >
            {helper}
        </Typography>
    </Box>
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────────────────────────────────────

const UserAdd = ({ onCancel }) => {
    const { addUser } = useContext(UserContext);

    const history = useHistory();

    const [preview, setPreview] = useState(null);

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        roleId: '',
        profileImage: null,
    });

    // ─────────────────────────────────────────────────────────────────────────
    // CAMBIOS
    // ─────────────────────────────────────────────────────────────────────────

    const handleChange = (e) => {
        const {
            name,
            value,
        } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ─────────────────────────────────────────────────────────────────────────
    // IMAGEN
    // ─────────────────────────────────────────────────────────────────────────

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            Swal.fire({
                icon: 'error',
                title: 'Archivo inválido',
                text: 'Selecciona una imagen PNG, JPG o JPEG.',
            });

            e.target.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            Swal.fire({
                icon: 'error',
                title: 'Archivo muy grande',
                text: 'La imagen no puede superar los 5MB.',
            });

            e.target.value = '';
            return;
        }

        setForm((prev) => ({
            ...prev,
            profileImage: file,
        }));

        const reader = new FileReader();

        reader.onloadend = () => {
            setPreview(reader.result);
        };

        reader.readAsDataURL(file);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // ELIMINAR IMAGEN
    // ─────────────────────────────────────────────────────────────────────────

    const handleRemoveImage = () => {
        setForm((prev) => ({
            ...prev,
            profileImage: null,
        }));

        setPreview(null);

        const input =
            document.getElementById(
                'profile-image-input'
            );

        if (input) {
            input.value = '';
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // VALIDACIÓN
    // ─────────────────────────────────────────────────────────────────────────

    const validateForm = () => {
        if (!form.name.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Nombre requerido',
                text: 'Ingresa el nombre completo del usuario.',
            });

            return false;
        }

        if (!form.email.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Correo requerido',
                text: 'Ingresa el correo electrónico.',
            });

            return false;
        }

        if (!form.password.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Contraseña requerida',
                text: 'Ingresa una contraseña para el usuario.',
            });

            return false;
        }

        if (!form.roleId) {
            Swal.fire({
                icon: 'warning',
                title: 'Rol requerido',
                text: 'Selecciona el rol del usuario.',
            });

            return false;
        }

        return true;
    };

    // ─────────────────────────────────────────────────────────────────────────
    // SUBMIT
    // ─────────────────────────────────────────────────────────────────────────

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const formData = new FormData();

        formData.append(
            'name',
            form.name
        );

        formData.append(
            'email',
            form.email
        );

        formData.append(
            'phone',
            form.phone
        );

        formData.append(
            'password',
            form.password
        );

        formData.append(
            'roleId',
            form.roleId
        );

        if (form.profileImage) {
            formData.append(
                'profileImage',
                form.profileImage
            );
        }

        try {
            setLoading(true);

            await addUser(formData);

            Swal.fire({
                icon: 'success',
                title: '¡Usuario creado!',
                text: 'El usuario se creó correctamente.',
                timer: 1500,
                showConfirmButton: false,
            }).then(() => {
                setForm({
                    name: '',
                    email: '',
                    phone: '',
                    password: '',
                    roleId: '',
                    profileImage: null,
                });

                setPreview(null);

                if (onCancel) {
                    onCancel();
                } else {
                    history.push('/users/list');
                }
            });
        } catch (error) {
            console.error(
                'Error al crear usuario:',
                error
            );

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text:
                    error?.response?.data?.message ||
                    'No se pudo crear el usuario. Intenta nuevamente.',
            });
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <Box
            sx={{
                maxWidth: 1100,
                mx: 'auto',
                p: {
                    xs: 1.5,
                    sm: 2,
                    md: 3,
                },
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: `1px solid ${PINK_SOFT}`,
                    boxShadow:
                        '0 8px 24px rgba(255,92,147,0.08)',
                }}
            >
                {/* HEADER */}

                <PageHeader
                    icon={<PersonOutlined />}
                    title="Nuevo usuario"
                    subtitle="Completa los datos para crear un nuevo usuario"
                    onBack={() =>
                        onCancel
                            ? onCancel()
                            : history.goBack()
                    }
                />

                {/* CONTENIDO */}

                <Box
                    sx={{
                        p: {
                            xs: 2,
                            sm: 3,
                        },
                        bgcolor: PINK_BG,
                    }}
                >
                    <form
                        onSubmit={handleSubmit}
                        encType="multipart/form-data"
                    >
                        <Stack spacing={3}>

                            {/* INFORMACIÓN PERSONAL */}

                            <Section
                                icon={
                                    <InfoOutlined fontSize="small" />
                                }
                                title="Información personal"
                                subtitle="Ingresa los datos básicos del usuario"
                            >
                                <Grid
                                    container
                                    spacing={2}
                                >
                                    <Grid
                                        item
                                        xs={12}
                                        md={6}
                                    >
                                        <TextField
                                            label="Nombre completo *"
                                            name="name"
                                            fullWidth
                                            required
                                            value={
                                                form.name
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            sx={fieldSx}
                                            placeholder="Ej. Juan Pérez"
                                        />
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                        md={6}
                                    >
                                        <TextField
                                            label="Correo electrónico *"
                                            name="email"
                                            type="email"
                                            fullWidth
                                            required
                                            value={
                                                form.email
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            sx={fieldSx}
                                            placeholder="correo@ejemplo.com"
                                        />
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                        md={6}
                                    >
                                        <TextField
                                            label="Teléfono"
                                            name="phone"
                                            fullWidth
                                            value={
                                                form.phone
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            sx={fieldSx}
                                            placeholder="Ej. 555 123 4567"
                                        />
                                    </Grid>
                                </Grid>
                            </Section>

                            {/* ACCESO */}

                            <Section
                                icon={
                                    <LockOutlined fontSize="small" />
                                }
                                title="Datos de acceso"
                                subtitle="Configura la contraseña y el rol del usuario"
                            >
                                <Grid
                                    container
                                    spacing={2}
                                >
                                    <Grid
                                        item
                                        xs={12}
                                        md={6}
                                    >
                                        <TextField
                                            label="Contraseña *"
                                            name="password"
                                            type="password"
                                            fullWidth
                                            required
                                            value={
                                                form.password
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            sx={fieldSx}
                                            placeholder="Ingresa una contraseña"
                                        />
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                        md={6}
                                    >
                                        <TextField
                                            select
                                            label="Rol del usuario *"
                                            name="roleId"
                                            fullWidth
                                            required
                                            value={
                                                form.roleId
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            sx={fieldSx}
                                        >
                                            <MenuItem value="">
                                                Seleccionar rol
                                            </MenuItem>

                                            <MenuItem value={3}>
                                                Evaluador
                                            </MenuItem>

                                            <MenuItem value={5}>
                                                Escaneador
                                            </MenuItem>

                                            <MenuItem value={6}>
                                                Administrador de Lives
                                            </MenuItem>
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </Section>

                            {/* ROL */}

                            <Section
                                icon={
                                    <AdminPanelSettingsOutlined fontSize="small" />
                                }
                                title="Rol y permisos"
                                subtitle="El rol determina las funciones disponibles para el usuario"
                            >
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        border: `1px solid ${PINK_SOFT}`,
                                        bgcolor: PINK_BG_SOFT,
                                    }}
                                >
                                    <Stack
                                        direction="row"
                                        spacing={2}
                                        alignItems="center"
                                    >
                                        <Avatar
                                            sx={{
                                                bgcolor:
                                                    '#fff',
                                                color:
                                                    PINK,
                                                border: `1px solid ${PINK_SOFT}`,
                                            }}
                                        >
                                            <AdminPanelSettingsOutlined />
                                        </Avatar>

                                        <Box>
                                            <Typography
                                                fontWeight={700}
                                                sx={{
                                                    color:
                                                        PINK_DARK,
                                                }}
                                            >
                                                {form.roleId ===
                                                    3
                                                    ? 'Evaluador'
                                                    : form.roleId ===
                                                        5
                                                        ? 'Escaneador'
                                                        : form.roleId ===
                                                            6
                                                            ? 'Administrador de Lives'
                                                            : 'Sin rol seleccionado'}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Selecciona el rol
                                                correspondiente
                                                en el campo anterior.
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Section>

                            {/* IMAGEN */}

                            <Section
                                icon={
                                    <ImageOutlined fontSize="small" />
                                }
                                title="Imagen de perfil"
                                subtitle="PNG, JPG o JPEG · Máx. 5 MB"
                            >
                                {preview ? (
                                    <Stack
                                        spacing={2}
                                        alignItems="center"
                                    >
                                        <Box
                                            component="img"
                                            src={preview}
                                            alt="Vista previa del perfil"
                                            sx={{
                                                width: '100%',
                                                maxWidth: 350,
                                                height: 300,
                                                objectFit:
                                                    'contain',
                                                borderRadius: 3,
                                                border: `1px solid ${PINK_SOFT}`,
                                                bgcolor:
                                                    '#fff',
                                                p: 1,
                                            }}
                                        />

                                        <Stack
                                            direction={{
                                                xs: 'column',
                                                sm: 'row',
                                            }}
                                            spacing={1.5}
                                            flexWrap="wrap"
                                            justifyContent="center"
                                        >
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={
                                                    <SwapHorizOutlined />
                                                }
                                                onClick={() =>
                                                    document
                                                        .getElementById(
                                                            'profile-image-input'
                                                        )
                                                        ?.click()
                                                }
                                                sx={
                                                    smallOutBtnSx
                                                }
                                            >
                                                Cambiar imagen
                                            </Button>

                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                startIcon={
                                                    <DeleteOutlineIcon />
                                                }
                                                onClick={
                                                    handleRemoveImage
                                                }
                                                sx={
                                                    smallErrBtnSx
                                                }
                                            >
                                                Eliminar
                                            </Button>
                                        </Stack>
                                    </Stack>
                                ) : (
                                    <DropZone
                                        id="profile-image-input"
                                        icon={
                                            <CloudUploadOutlined />
                                        }
                                        title="Haz clic para subir la imagen"
                                        helper="PNG, JPG o JPEG · Máx. 5 MB"
                                    />
                                )}

                                <input
                                    id="profile-image-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={
                                        handleImageChange
                                    }
                                    sx={{
                                        display: 'none',
                                    }}
                                />
                            </Section>

                            <Divider
                                sx={{
                                    borderColor:
                                        PINK_SOFT,
                                }}
                            />

                            {/* BOTONES */}

                            <Stack
                                direction={{
                                    xs: 'column-reverse',
                                    sm: 'row',
                                }}
                                spacing={2}
                                justifyContent="flex-end"
                            >
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={() =>
                                        onCancel
                                            ? onCancel()
                                            : history.push(
                                                '/users/list'
                                            )
                                    }
                                    disabled={loading}
                                    sx={
                                        outlineBtnSx
                                    }
                                >
                                    Cancelar
                                </Button>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    startIcon={
                                        loading ? (
                                            <CircularProgress
                                                size={18}
                                                sx={{
                                                    color:
                                                        '#fff',
                                                }}
                                            />
                                        ) : (
                                            <SaveIcon />
                                        )
                                    }
                                    sx={{
                                        ...primaryBtnSx,
                                        minWidth: 220,
                                    }}
                                >
                                    {loading
                                        ? 'Guardando...'
                                        : 'Guardar usuario'}
                                </Button>
                            </Stack>
                        </Stack>
                    </form>
                </Box>
            </Paper>
        </Box>
    );
};

export default UserAdd;
