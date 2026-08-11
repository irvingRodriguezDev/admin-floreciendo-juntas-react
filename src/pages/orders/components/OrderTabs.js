import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LockIcon from '@mui/icons-material/Lock';
import SendIcon from '@mui/icons-material/Send';

const OrderTabs = ({ activeTab, onChange, loadingTabs, counts }) => {
    return (
        <Box sx={{ bgcolor: '#FFF5FA', borderBottom: '1px solid #FFE6F0', px: 3, pt: 2 }}>
            <Tabs
                value={activeTab}
                onChange={onChange}
                sx={{
                    '& .MuiTab-root': {
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        color: '#666',
                        minHeight: 48,
                        opacity: loadingTabs[activeTab] ? 0.7 : 1,
                        '&.Mui-selected': {
                            color: '#FF69B4',
                        },
                    },
                    '& .MuiTabs-indicator': {
                        backgroundColor: '#FF69B4',
                        height: 3,
                    },
                }}
            >
                <Tab
                    icon={<AssignmentIcon sx={{ fontSize: 20 }} />}
                    iconPosition="start"
                    label={`Activas (${counts.activas || 0})`}
                    disabled={loadingTabs[0]}
                />
                <Tab
                    icon={<LocalShippingIcon sx={{ fontSize: 20 }} />}
                    iconPosition="start"
                    label={`Liquidadas (${counts.liquidadas || 0})`}
                    disabled={loadingTabs[1]}
                />
                <Tab
                    icon={<LockIcon sx={{ fontSize: 20 }} />}
                    iconPosition="start"
                    label={`Envios Pagados (${counts.enviosPagados || 0})`}
                    disabled={loadingTabs[2]}
                />
                <Tab
                    icon={<SendIcon sx={{ fontSize: 20 }} />}
                    iconPosition="start"
                    label={`Enviados (${counts.enviadas || 0})`}
                    disabled={loadingTabs[3]}
                />
            </Tabs>
        </Box>
    );
};

export default OrderTabs;