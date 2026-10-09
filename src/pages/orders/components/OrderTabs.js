import React from 'react';
import { Box, Chip, CircularProgress, Stack, Tab, Tabs } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LockIcon from '@mui/icons-material/Lock';
import SendIcon from '@mui/icons-material/Send';

const PINK = '#FF69B4';

const TABS = [
    { label: 'Activas', countKey: 'activas', icon: <AssignmentIcon /> },
    { label: 'Liquidadas', countKey: 'liquidadas', icon: <LocalShippingIcon /> },
    { label: 'Envios Pagados', countKey: 'enviosPagados', icon: <LockIcon /> },
    { label: 'Enviados', countKey: 'enviadas', icon: <SendIcon /> },
];

const OrderTabs = ({ activeTab, onChange, loadingTabs = {}, counts = {} }) => (
    <Box sx={{ bgcolor: '#FFF5FA', borderBottom: '1px solid #FFE6F0', px: { xs: 1, sm: 3 }, pt: { xs: 1, sm: 2 } }}>
        <Tabs
            value={activeTab}
            onChange={onChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
                '& .MuiTabs-indicator': { bgcolor: PINK, height: 3, borderRadius: '3px 3px 0 0' },
                '& .MuiTab-root': {
                    minHeight: 48,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    color: '#666',
                    gap: 0.5,
                    '&.Mui-selected': { color: PINK },
                },
            }}
        >
            {TABS.map(({ label, countKey, icon }, i) => {
                const selected = activeTab === i;
                return (
                    <Tab
                        key={label}
                        disabled={!!loadingTabs[i]}
                        icon={React.cloneElement(icon, { sx: { fontSize: 20 } })}
                        iconPosition="start"
                        label={
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <span>{label}</span>
                                {loadingTabs[i] ? (
                                    <CircularProgress size={14} sx={{ color: PINK }} />
                                ) : (
                                    <Chip
                                        size="small"
                                        label={counts[countKey] || 0}
                                        sx={{
                                            height: 20,
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            color: selected ? '#fff' : '#757575',
                                            bgcolor: selected ? PINK : '#FFE6F0',
                                        }}
                                    />
                                )}
                            </Stack>
                        }
                    />
                );
            })}
        </Tabs>
    </Box>
);

export default OrderTabs;