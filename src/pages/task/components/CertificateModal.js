import React from 'react';
import {
    Box, Button, Chip, Dialog, DialogActions, DialogContent,
    DialogTitle, IconButton, Paper, Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BookIcon from '@mui/icons-material/Book';
import DownloadIcon from '@mui/icons-material/Download';

const CertificateModal = ({
    open,
    onClose,
    selectedTask,
    isMobile,
    modalPaper
}) => (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile} PaperProps={modalPaper}>
        <DialogTitle sx={{ bgcolor: '#ff9800', textAlign: 'center', py: { xs: 3, sm: 4 } }}>
            <EmojiEventsIcon sx={{ fontSize: { xs: 60, sm: 80 }, mb: 2 }} />
            <Typography variant="h4" fontWeight="700" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                ¡Felicidades!
            </Typography>
            {isMobile && (
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <CloseIcon />
                </IconButton>
            )}
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2.5, sm: 4 }, textAlign: 'center', bgcolor: '#fff' }}>
            {selectedTask && (
                <>
                    <Typography variant="h5" fontWeight="600" gutterBottom>
                        {selectedTask.user.name}
                    </Typography>
                    <Chip 
                        icon={<BookIcon sx={{ color: '#fff' }} />} 
                        label={selectedTask.moduleName} 
                        sx={{ mb: 3, bgcolor: '#1976d2', color: '#fff' }} 
                    />
                    <Paper sx={{ p: { xs: 3, sm: 4 }, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ color: '#757575' }} gutterBottom>
                            Puntuación Obtenida
                        </Typography>
                        <Typography variant="h1" sx={{ color: '#2e7d32', fontSize: { xs: '3rem', sm: '6rem' } }} fontWeight="700">
                            {selectedTask.totalScore}
                            <Typography component="span" variant="h4" sx={{ color: '#757575' }}>
                                /{selectedTask.maxScore || 25}
                            </Typography>
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#757575' }}>
                            Promedio: {selectedTask.averageScore}/5.0
                        </Typography>
                    </Paper>
                </>
            )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, justifyContent: 'center', gap: 2, bgcolor: '#fff', flexDirection: isMobile ? 'column' : 'row' }}>
            <Button onClick={onClose} variant="outlined" fullWidth={isMobile} sx={{ borderColor: '#757575', color: '#757575' }}>
                Cerrar
            </Button>
            <Button 
                onClick={onClose} 
                variant="contained" 
                fullWidth={isMobile} 
                startIcon={<DownloadIcon />} 
                sx={{ bgcolor: '#ff9800', color: '#000', '&:hover': { bgcolor: '#f57c00' } }}
            >
                Descargar Certificado
            </Button>
        </DialogActions>
    </Dialog>
);

export default CertificateModal;