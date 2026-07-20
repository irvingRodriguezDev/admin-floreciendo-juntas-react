// src/components/Live/styles.js

import {
    makeStyles
}

from '@mui/styles';

export const useStyles=makeStyles(()=> ({
        filterContainer: {
            padding: 24,
            marginBottom: 24,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #FFEEF8 0%, #FFE0F0 100%)',
            border: '1px solid #FFD6EA',
            boxShadow: '0 4px 20px rgba(255, 105, 180, 0.12)',
        }

        ,
        filterHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
        }

        ,
        '@global': {
            '.swal2-container': {
                zIndex: '99999 !important',
            }

            ,
        }

        ,
    }));