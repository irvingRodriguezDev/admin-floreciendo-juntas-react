import React from 'react';
import {
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
    IconButton,
    Fade,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { filters } from './OrderConstans';

const OrderFilters = ({
    classes,
    filterItems,
    showFilters,
    onChange,
    onDelete,
    onReset,
}) => {
    if (filterItems.length === 0) return null;

    return (
        <Fade in={showFilters || filterItems.length > 0}>
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
                                        onChange={onChange(item.id)}
                                        sx={{
                                            borderRadius: 2,
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#FFD6EA',
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

                            <Grid item xs={12} sm={6} md={6}>
                                <TextField
                                    label="Contiene"
                                    name="filterValue"
                                    size="small"
                                    fullWidth
                                    value={item.fields.filterValue}
                                    onChange={onChange(item.id)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '& fieldset': {
                                                borderColor: '#FFD6EA',
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={12} md={2}>
                                <IconButton
                                    onClick={() => onDelete(item.id)}
                                    sx={{
                                        color: '#FF6B9D',
                                        backgroundColor: '#FFF0F5',
                                        '&:hover': {
                                            backgroundColor: '#FFE1EE',
                                        },
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Box>
                ))}

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
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
                        onClick={onReset}
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
                </Stack>
            </Paper>
        </Fade>
    );
};

export default OrderFilters;