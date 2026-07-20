// src/components/Live/LiveStats.js

import React from 'react';
import { Box, Typography, Grid } from '@mui/material';

const LiveStats = ({ comments }) => {
    return (
        <Box sx={{ p: 1, bgcolor: '#fff', borderBottom: '1px solid #FFE6F0' }}>
            <Typography variant="subtitle2" fontWeight="700" color="#FF69B4" gutterBottom>
                📊 Estadísticas del Live
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                    <Box textAlign="center">
                        <Typography variant="h6" fontWeight="700" color="#ff66ad">
                            {comments.length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Comentarios
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default LiveStats;