// src/pages/task/components/ImageGrid.js
import React, { useState, memo } from 'react';
import { Box, CardMedia, Grid, Paper } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';

const ImageGrid = memo(({ taskId, images, onOpen }) => {
    const [errors, setErrors] = useState({});

    return (
        <Grid container spacing={{ xs: 1, sm: 2 }}>
            {images.map((img, idx) => (
                <Grid item xs={4} key={`${taskId}-img-${idx}`}>
                    <Paper 
                        sx={{ 
                            cursor: 'pointer', 
                            borderRadius: 2, 
                            overflow: 'hidden', 
                            position: 'relative', 
                            paddingTop: '100%', 
                            '&:hover': { opacity: 0.8 } 
                        }} 
                        onClick={() => onOpen(img.url)}
                    >
                        {!errors[idx] ? (
                            <CardMedia 
                                component="img" 
                                image={img.url} 
                                alt={`Img ${idx + 1}`}
                                onError={() => setErrors(p => ({ ...p, [idx]: true }))}
                                sx={{ 
                                    position: 'absolute', 
                                    top: 0, 
                                    left: 0, 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover' 
                                }} 
                            />
                        ) : (
                            <Box sx={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0, 
                                width: '100%', 
                                height: '100%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                bgcolor: '#f5f5f5' 
                            }}>
                                <ImageIcon sx={{ color: '#bdbdbd' }} />
                            </Box>
                        )}
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
});

export default ImageGrid;