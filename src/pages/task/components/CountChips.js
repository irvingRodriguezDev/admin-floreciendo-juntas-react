import React from 'react';
import { Box, Chip } from '@mui/material';

const CountChips = ({ cnt }) => cnt ? (
    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, ml: 1 }}>
        {cnt.pending > 0 && (
            <Chip 
                label={cnt.pending} 
                size="small" 
                sx={{ 
                    height: 18, 
                    fontSize: '0.6rem', 
                    bgcolor: '#ff9800', 
                    color: '#fff', 
                    '& .MuiChip-label': { px: 0.8 } 
                }} 
            />
        )}
        {cnt.reviewed > 0 && (
            <Chip 
                label={cnt.reviewed} 
                size="small" 
                sx={{ 
                    height: 18, 
                    fontSize: '0.6rem', 
                    bgcolor: '#4caf50', 
                    color: '#fff', 
                    '& .MuiChip-label': { px: 0.8 } 
                }} 
            />
        )}
    </Box>
) : null;

export default CountChips;