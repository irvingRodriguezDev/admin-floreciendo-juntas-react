// Función para formatear montos de string a número
export const formatCurrency = (value) => {
    if (value === null || value === undefined) return '0.00';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
};

// Función para verificar si tiene costo de envío
export const hasShippingCost = (order) => {
    const shippingCost = order.shippingCost;
    return shippingCost !== null && shippingCost !== undefined && shippingCost !== "0.00" && parseFloat(shippingCost) > 0;
};

// Función para verificar si tiene número de guía
export const hasTrackingNumber = (order) => {
    return order.trackingNumber && order.trackingNumber.trim() !== '';
};

// Formatea una fecha "YYYY-MM-DD" como fecha local (evita el corrimiento de un día por UTC)
export const formatLocalDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const localDate = new Date(year, month - 1, day);
    return localDate.toLocaleDateString('es-MX');
};