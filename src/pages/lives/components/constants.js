// src/components/Live/constants.js

// export const VISIBLE_COMMENTS = 6;
export const SCROLL_COMMENTS = 15;

export const statusLabels = {
    scheduled: 'Programado',
    live: 'En vivo',
    ended: 'Finalizado',
};

export const statusColors = {
    scheduled: {
        bg: 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)',
        color: '#fff'
    },
    live: {
        bg: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
        color: '#fff'
    },
    ended: {
        bg: 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)',
        color: '#fff'
    },
};

export const filters = [
    { label: 'Título', title: 'title' },
    { label: 'Estado', title: 'status' },
];

export const DEFAULT_PAGE_SIZE = 7;