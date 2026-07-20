// src/components/Live/LiveHeader.js

import React from 'react';
import {
    Box,
    Typography,
    TextField,
    IconButton,
} from '@mui/material';
import {
    Search as SearchIcon,
    Close as CloseIcon,
} from '@mui/icons-material';

const LiveHeader = ({ searchTerm, dispatch }) => {
    const handleSearchChange = (e) => {
        dispatch({ searchTerm: e.target.value });
    };

    const handleClearSearch = () => {
        dispatch({ searchTerm: '' });
    };

    return (
        <Box
            sx={{
                background: 'linear-gradient(135deg, #FF5C93 0%, #FF69B4 100%)',
                p: 3,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 3,
                flexWrap: 'wrap',
            }}
        >
            <Box>
                <Typography variant="h6" fontWeight="700">
                    Gestión de Lives
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                    Administra tus transmisiones en vivo
                </Typography>
            </Box>

            <TextField
                placeholder="Buscar por título o estado..."
                value={searchTerm}
                onChange={handleSearchChange}
                variant="outlined"
                size="small"
                sx={{
                    minWidth: 300,
                    maxWidth: 400,
                    backgroundColor: '#fff',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '& fieldset': { borderColor: '#FFD6EA' },
                        '&:hover fieldset': { borderColor: '#FF69B4' },
                        '&.Mui-focused fieldset': { borderColor: '#FF69B4' },
                    },
                }}
                InputProps={{
                    startAdornment: <SearchIcon sx={{ color: '#FF69B4', mr: 1 }} />,
                    endAdornment: searchTerm && (
                        <IconButton
                            size="small"
                            onClick={handleClearSearch}
                            sx={{ color: '#FF6B9D' }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    ),
                }}
            />
        </Box>
    );
};

export default LiveHeader;