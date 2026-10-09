import React from 'react';
import {
    Box, Button, FormControl, Grid, InputLabel,
    MenuItem, Select, TextField, FormHelperText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import SchoolIcon from '@mui/icons-material/School';
import BookIcon from '@mui/icons-material/Book';

const TaskFilters = ({
    selectedCert,
    selectedModule,
    searchTerm,
    loadingCerts,
    loadingModules,
    certifications,
    filteredModules,
    certCounts,
    hasActiveFilters,
    isMobile,
    onCertChange,
    onModuleChange,
    onSearchChange,
    onClearSearch,
    onClearFilters
}) => (
    <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, bgcolor: '#fff' }}>
        <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="flex-start">
            <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small" disabled={loadingCerts}>
                    <InputLabel>Certificación</InputLabel>
                    <Select 
                        value={selectedCert} 
                        label="Certificación" 
                        onChange={onCertChange}
                        startAdornment={<SchoolIcon sx={{ color: '#757575', mr: 1, fontSize: 20 }} />}
                    >
                        <MenuItem value="all">Todas las Certificaciones</MenuItem>
                        {certifications.map(c => (
                            <MenuItem key={c.id} value={c.id}>
                                {c.name}
                            </MenuItem>
                        ))}
                    </Select>
                    {loadingCerts && <FormHelperText>Cargando certificaciones...</FormHelperText>}
                </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                    <InputLabel>Módulo</InputLabel>
                    <Select 
                        value={selectedModule} 
                        label="Módulo" 
                        onChange={onModuleChange}
                        disabled={filteredModules.length === 0 || loadingModules}
                        startAdornment={<BookIcon sx={{ color: '#757575', mr: 1, fontSize: 20 }} />}
                    >
                        <MenuItem value="all">
                            {loadingModules ? 'Cargando módulos...' : 'Todos los Módulos'}
                        </MenuItem>
                        {filteredModules.map(m => (
                            <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                        ))}
                    </Select>
                    {loadingModules && <FormHelperText>Cargando módulos...</FormHelperText>}
                </FormControl>
            </Grid>

            <Grid item xs={12} sm={12} md={hasActiveFilters ? 5 : 6}>
                <TextField 
                    fullWidth 
                    size="small"
                    placeholder="Buscar por usuario, email, módulo o ID..."
                    value={searchTerm} 
                    onChange={onSearchChange}
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ color: '#757575', mr: 1, fontSize: 20 }} />,
                        // endAdornment: searchTerm && (
                        //     <IconButton size="small" onClick={onClearSearch}>
                        //         <CloseIcon fontSize="small" sx={{ color: '#757575' }} />
                        //     </IconButton>
                        // ),
                    }} 
                />
            </Grid>

            {hasActiveFilters && (
                <Grid item xs={12} sm={12} md={1} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Button 
                        variant="text" 
                        size="small" 
                        onClick={onClearFilters} 
                        startIcon={<ClearAllIcon />} 
                        fullWidth
                        sx={{ color: '#FF5C93', whiteSpace: 'nowrap', height: 40 }}
                    >
                        {!isMobile && 'Limpiar'}
                    </Button>
                </Grid>
            )}
        </Grid>
    </Box>
);

export default TaskFilters;