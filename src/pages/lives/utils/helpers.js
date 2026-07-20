// src/components/Live/utils/helpers.js

import { statusLabels, statusColors } from '../components/constants';

export const getImage = (live) => {
    return live.thumbnail_url ? live.thumbnail_url : "/no-image.jpg";
};

export const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";
    const date = new Date(dateString);
    return date.toLocaleString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const getStatusLabel = (status) => {
    return statusLabels[status] || status || "Sin estado";
};

export const getStatusColor = (status) => {
    return statusColors[status] || {
        bg: '#FF5C92',
        color: '#fff'
    };
};