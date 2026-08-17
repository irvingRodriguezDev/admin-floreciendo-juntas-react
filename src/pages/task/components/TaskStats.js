import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';

const TaskStats = ({ stats }) => (
    <Stack direction="row" spacing={{ xs: 1, sm: 2 }} sx={{ width: { xs: '100%', md: 'auto' } }}>
        {[
            { value: stats.total, label: 'Total', color: '#fff' },
            { value: stats.pending, label: 'Pendientes', color: '#ffb74d' },
            { value: stats.reviewed, label: 'Calificadas', color: '#81c784' },
        ].map((s, i) => (
            <Paper key={i} sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                bgcolor: 'rgba(255,255,255,0.1)', 
                borderRadius: 2, 
                flex: { xs: 1, md: 'none' }, 
                minWidth: { xs: 0, md: 100 }, 
                textAlign: 'center' 
            }}>
                <Typography variant="h4" fontWeight="700" sx={{ 
                    color: s.color, 
                    fontSize: { xs: '1.4rem', sm: '2.125rem' }, 
                    lineHeight: 1.1 
                }}>
                    {s.value}
                </Typography>
                <Typography variant="caption" sx={{ 
                    color: '#fff', 
                    fontSize: { xs: '0.62rem', sm: '0.75rem' }, 
                    display: 'block', 
                    mt: 0.3 
                }}>
                    {s.label}
                </Typography>
            </Paper>
        ))}
    </Stack>
);

export default TaskStats;