// src/components/Live/NoRowsOverlay.js

import React from 'react';
import { Box, Typography } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const NoRowsOverlay = () => (
    <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="200px"
        gap={2}
    >
        <SearchIcon sx={{ fontSize: 48, color: '#FFB3DC' }} />
        <Typography variant="body1" color="text.secondary">
            No se encontraron lives
        </Typography>
    </Box>
);

export default NoRowsOverlay;