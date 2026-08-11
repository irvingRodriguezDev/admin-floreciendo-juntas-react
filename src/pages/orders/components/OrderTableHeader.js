import React from 'react';
import { Box, TextField, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { tabTitles, tabSubtitles } from './OrderConstans';

const OrderTableHeader = ({ activeTab, searchTerm, onSearchChange, onSearchClear }) => {
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
                    {tabTitles[activeTab]}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                    {tabSubtitles[activeTab]}
                </Typography>
            </Box>

            <TextField
                placeholder="Buscar por orden, cliente o estado..."
                value={searchTerm}
                onChange={onSearchChange}
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
                        <IconButton size="small" onClick={onSearchClear} sx={{ color: '#FF6B9D' }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    ),
                }}
            />
        </Box>
    );
};

export default OrderTableHeader;