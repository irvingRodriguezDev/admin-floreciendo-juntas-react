// Opciones para las paqueterías
export const carrierOptions = [
    { value: 'DHL', label: 'DHL' },
    { value: 'Estafeta', label: 'Estafeta' },
    { value: 'Fedex', label: 'Fedex' },
];

// Campos disponibles para filtrar
export const filters = [
    { label: 'Número de Orden', title: 'orderNumber' },
    { label: 'Cliente', title: 'customerName' },
    { label: 'Estado', title: 'status' },
];

export const statusLabels = {
    pending: 'Pendiente',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    pagado: 'Pagado',
    activo: 'Activo',
};

export const statusColors = {
    pending: { bg: 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)', color: '#fff' },
    shipped: { bg: 'linear-gradient(135deg, #42A5F5 0%, #1E88E5 100%)', color: '#fff' },
    delivered: { bg: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', color: '#fff' },
    cancelled: { bg: 'linear-gradient(135deg, #EF5350 0%, #E53935 100%)', color: '#fff' },
    pagado: { bg: 'linear-gradient(135deg, #45a049 0%, #45a049 100%)', color: '#fff' },
    activo: { bg: 'linear-gradient(135deg, #FF5C93 0%, #FF5C93 100%)', color: '#fff' },
};

// Textos del encabezado por tab
export const tabTitles = [
    'Órdenes Activas',
    'Órdenes Liquidadas',
    'Envíos Pagados',
    'Órdenes Enviadas',
];

export const tabSubtitles = [
    'Órdenes pendientes de procesar',
    'Agregar costo de envío',
    'Agregar número de guía',
    'Órdenes ya enviadas',
];