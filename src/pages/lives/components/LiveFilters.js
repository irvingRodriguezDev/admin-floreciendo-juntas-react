import React from "react";
import {
    Box,
    Paper,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    IconButton,
    Typography,
    Button,
} from "@mui/material";
import {
    Close as CloseIcon,
    FilterAlt as FilterAltIcon,
    ClearAll as ClearAllIcon,
} from "@mui/icons-material";
import { filters } from "./constants";

const LiveFilters = ({
    filterItems,
    showFilters,
    handleChange,
    handleReset,
    deleteFilter,
}) => {
    if (!showFilters && filterItems.length === 0) return null;

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 3,
                background:
                    "linear-gradient(135deg, rgba(255, 245, 250, 0.95), rgba(255, 255, 255, 0.98))",
                border: "1px solid rgba(255, 182, 217, 0.35)",
                boxShadow: "0 4px 18px rgba(255, 182, 217, 0.12)",
            }}
        >
            {/* Encabezado */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2.5,
                }}
            >
                <FilterAltIcon
                    sx={{
                        color: "#FF69B4",
                        fontSize: 24,
                    }}
                />

                <Typography
                    variant="h6"
                    sx={{
                        color: "#FF69B4",
                        fontWeight: 700,
                    }}
                >
                    Filtros Activos
                </Typography>
            </Box>

            {/* Filtros activos */}
            {filterItems.map((item) => (
                <Box
                    key={item.id}
                    sx={{
                        backgroundColor: "#fff",
                        borderRadius: 3,
                        p: 2,
                        mb: 2,
                        boxShadow: "0 2px 8px rgba(255, 182, 217, 0.15)",
                        border: "1px solid rgba(255, 214, 234, 0.5)",
                    }}
                >
                    <Grid container alignItems="center" spacing={2}>
                        {/* Campo */}
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl size="small" fullWidth>
                                <InputLabel>Campo</InputLabel>

                                <Select
                                    label="Campo"
                                    name="selectedField"
                                    value={item.fields.selectedField}
                                    onChange={handleChange(item.id)}
                                    sx={{
                                        borderRadius: 2,

                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "#FFD6EA",
                                        },

                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "#FF9FC5",
                                        },

                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "#FF69B4",
                                        },
                                    }}
                                >
                                    {filters.map((f) => (
                                        <MenuItem key={f.title} value={f.title}>
                                            {f.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Valor del filtro */}
                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                label="Contiene"
                                name="filterValue"
                                size="small"
                                fullWidth
                                value={item.fields.filterValue}
                                onChange={handleChange(item.id)}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 2,

                                        "& fieldset": {
                                            borderColor: "#FFD6EA",
                                        },

                                        "&:hover fieldset": {
                                            borderColor: "#FF9FC5",
                                        },

                                        "&.Mui-focused fieldset": {
                                            borderColor: "#FF69B4",
                                        },
                                    },
                                }}
                            />
                        </Grid>

                        {/* Eliminar filtro */}
                        <Grid item xs={12} sm={12} md={2}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: {
                                        xs: "flex-start",
                                        md: "center",
                                    },
                                }}
                            >
                                <IconButton
                                    onClick={() => deleteFilter(item.id)}
                                    aria-label="Eliminar filtro"
                                    sx={{
                                        color: "#FF6B9D",
                                        backgroundColor: "#FFF0F5",

                                        "&:hover": {
                                            backgroundColor: "#FFE1EE",
                                            color: "#FF4F8B",
                                        },
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            ))}

            {/* Acciones */}
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    mt: 2,
                    flexWrap: "wrap",
                }}
            >
                <Button
                    variant="contained"
                    sx={{
                        background:
                            "linear-gradient(135deg, #FF6B9D 0%, #C969E0 100%)",
                        color: "#fff",
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 3,
                        boxShadow: "0 4px 12px rgba(255, 107, 157, 0.3)",

                        "&:hover": {
                            background:
                                "linear-gradient(135deg, #FF5A8C 0%, #B85ACF 100%)",
                            boxShadow: "0 6px 16px rgba(255, 107, 157, 0.4)",
                        },
                    }}
                >
                    Aplicar
                </Button>

                <Button
                    variant="outlined"
                    startIcon={<ClearAllIcon />}
                    onClick={handleReset}
                    sx={{
                        borderColor: "#FF6B9D",
                        color: "#FF6B9D",
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 3,

                        "&:hover": {
                            borderColor: "#FF5A8C",
                            backgroundColor: "#FFF5FA",
                        },
                    }}
                >
                    Limpiar Todo
                </Button>
            </Box>
        </Paper>
    );
};

export default LiveFilters;
