// src/components/Live/LiveFilters.js

import React from 'react';
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
} from '@mui/material';
import {
    Close as CloseIcon,
    FilterAlt as FilterAltIcon,
    ClearAll as ClearAllIcon,
} from '@mui/icons-material';
import { filters } from './constants';
import { useStyles } from '../styles'; // Ajusta la ruta según tu estructura

const LiveFilters = ({
    filterItems,
    showFilters,
    handleChange,
    handleReset,
    deleteFilter,
}) => {
    const classes = useStyles();

    if (!showFilters && filterItems.length === 0) return null;

    return (
        <Paper className={classes.filterContainer}>
            <Box className={classes.filterHeader}>
                <FilterAltIcon sx={{ color: '#FF69B4', fontSize: 24 }} />
                <Typography variant="h6" fontWeight="700" sx={{ color: '#FF69B4' }}>
                    Filtros Activos
                </Typography>
            </Box>

            {filterItems.map((item) => (
                <Box
                    key={item.id}
                    sx={{
                        backgroundColor: '#fff',
                        borderRadius: 3,
                        p: 2,
                        mb: 2,
                        boxShadow: '0 2px 8px rgba(255, 182, 217, 0.15)',
                    }}
                >
                    <Grid container alignItems="center" spacing={2}>
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
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#FFD6EA' },
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

                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                label="Contiene"
                                name="filterValue"
                                size="small"
                                fullWidth
                                value={item.fields.filterValue}
                                onChange={handleChange(item.id)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '& fieldset': { borderColor: '#FFD6EA' },
                                    },
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={12} md={2}>
                            <IconButton
                                onClick={() => deleteFilter(item.id)}
                                sx={{
                                    color: '#FF6B9D',
                                    backgroundColor: '#FFF0F5',
                                    '&:hover': { backgroundColor: '#FFE1EE' },
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Box>
            ))}

            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                <Button
                    variant="contained"
                    sx={{
                        background: 'linear-gradient(135deg, #FF6B9D 0%, #C969E0 100%)',
                        color: '#fff',
                        fontWeight: '600',
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(255, 107, 157, 0.3)',
                    }}
                >
                    Aplicar
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<ClearAllIcon />}
                    onClick={handleReset}
                    sx={{
                        borderColor: '#FF6B9D',
                        color: '#FF6B9D',
                        fontWeight: '600',
                        borderRadius: 2,
                        '&:hover': {
                            borderColor: '#FF5A8C',
                            backgroundColor: '#FFF5FA',
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