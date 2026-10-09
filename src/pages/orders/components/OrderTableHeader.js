import React from 'react';
import { Avatar, Box, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { tabTitles, tabSubtitles } from './OrderConstans';

const PINK = '#FF69B4';

const OrderTableHeader = ({ activeTab, searchTerm, onSearchChange, onSearchClear }) => (
    <Box
        sx={{
            background: 'linear-gradient(135deg, #FF5C93 0%, #FF69B4 100%)',
            p: { xs: 2.5, sm: 3 },
            color: '#fff',
            display: 'flex',
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
        }}
    >
        <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', width: 48, height: 48 }}>
                <ReceiptLongIcon />
            </Avatar>
            <Box>
                <Typography variant="h6" fontWeight={700}>
                    {tabTitles[activeTab]}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {tabSubtitles[activeTab]}
                </Typography>
            </Box>
        </Stack>

        <TextField
            placeholder="Buscar por orden, cliente o estado..."
            value={searchTerm}
            onChange={onSearchChange}
            size="small"
            sx={{
                minWidth: { md: 320 },
                maxWidth: { md: 400 },
                bgcolor: '#fff',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& fieldset': { borderColor: '#FFD6EA' },
                    '&:hover fieldset, &.Mui-focused fieldset': { borderColor: PINK },
                },
            }}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon sx={{ color: PINK }} />
                    </InputAdornment>
                ),
                endAdornment: searchTerm && (
                    <InputAdornment position="end">
                        <IconButton size="small" onClick={onSearchClear} sx={{ color: PINK }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    </Box>
);

export default OrderTableHeader;