import React from 'react';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import GradeIcon from '@mui/icons-material/Grade';

const getStats = ({ total = 0, pending = 0, reviewed = 0 } = {}) => [
    { value: total, label: 'Total', color: '#fff' },
    { value: pending, label: 'Pendientes', color: '#ffb74d' },
    { value: reviewed, label: 'Calificadas', color: '#81c784' },
];

const TaskHeader = ({ stats }) => (
    <Box
        sx={{
            background: 'linear-gradient(135deg, #FF5C93 0%, #FF69B4 100%)',
            color: '#fff',
            p: { xs: 2.5, sm: 3 },
            display: 'flex',
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2.5,
        }}
    >
        <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', width: 48, height: 48 }}>
                <GradeIcon />
            </Avatar>
            <Box>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                    Evaluación de tareas
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Gestiona y califica las tareas enviadas
                </Typography>
            </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', md: 'auto' } }}>
            {getStats(stats).map(({ value, label, color }) => (
                <Box
                    key={label}
                    sx={{
                        flex: 1,
                        minWidth: { md: 100 },
                        textAlign: 'center',
                        px: { xs: 1, sm: 2 },
                        py: { xs: 1, sm: 1.5 },
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(4px)',
                    }}
                >
                    <Typography fontWeight={700} sx={{ color, fontSize: { xs: '1.3rem', sm: '1.75rem' }, lineHeight: 1.1 }}>
                        {value}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.95, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                        {label}
                    </Typography>
                </Box>
            ))}
        </Stack>
    </Box>
);

export default TaskHeader;