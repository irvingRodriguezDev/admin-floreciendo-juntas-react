import React from 'react';
import { Box, Typography } from '@mui/material';
import GradeIcon from '@mui/icons-material/Grade';

const TaskHeader = ({ stats }) => (
    <Box sx={{ 
        background: 'linear-gradient(135deg, #FF5C93 0%, #f73b7a 100%)', 
        p: { xs: 2.5, sm: 3, md: 4 }, 
        color: '#fff' 
    }}>
        <Box sx={{ 
            display: 'flex', 
            alignItems: { xs: 'flex-start', md: 'center' }, 
            justifyContent: 'space-between', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: { xs: 2.5, md: 3 } 
        }}>
            <Box>
                <Typography variant="h4" fontWeight="700" sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: { xs: 1, sm: 2 }, 
                    color: '#fff', 
                    fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2.125rem' } 
                }}>
                    <GradeIcon sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }} /> 
                    Evaluación de Tareas
                </Typography>
                <Typography variant="body1" sx={{ 
                    color: '#fff', 
                    opacity: 0.9, 
                    mt: 0.5, 
                    fontSize: { xs: '0.85rem', sm: '1rem' } 
                }}>
                    Gestiona y califica las tareas enviadas
                </Typography>
            </Box>
            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', md: 'auto' } }}>
                {[
                    { value: stats.total, label: 'Total', color: '#fff' },
                    { value: stats.pending, label: 'Pendientes', color: '#ffb74d' },
                    { value: stats.reviewed, label: 'Calificadas', color: '#81c784' },
                ].map((s, i) => (
                    <Box key={i} sx={{ 
                        p: { xs: 1, sm: 2 }, 
                        bgcolor: 'rgba(255,255,255,0.1)', 
                        borderRadius: 2, 
                        flex: 1, 
                        textAlign: 'center' 
                    }}>
                        <Typography variant="h4" fontWeight="700" sx={{ 
                            color: s.color, 
                            fontSize: { xs: '1.2rem', sm: '2.125rem' }, 
                            lineHeight: 1.1 
                        }}>
                            {s.value}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                            color: '#fff', 
                            fontSize: { xs: '0.6rem', sm: '0.75rem' }, 
                            display: 'block' 
                        }}>
                            {s.label}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    </Box>
);

export default TaskHeader;