import { CERT_COLORS, CRITERION_ICONS } from './Constans';

export const getCertColor = (i) => CERT_COLORS[i % CERT_COLORS.length];

export const getCriterionIcon = (title) => {
    const key = Object.keys(CRITERION_ICONS).find(k => 
        title.toLowerCase().includes(k.toLowerCase())
    );
    return key ? CRITERION_ICONS[key] : '📋';
};

export const fmtDate = (d) => new Date(d).toLocaleDateString('es-MX', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
});

export const parseResponse = (res) => Array.isArray(res.data)
    ? { rawList: res.data, page: 1, totalPages: 1, total: res.data.length }
    : { rawList: res.data.data, page: res.data.page, totalPages: res.data.totalPages, total: res.data.total };

export const getTotal = (res) => Array.isArray(res.data) ? res.data.length : (res.data.total ?? 0);