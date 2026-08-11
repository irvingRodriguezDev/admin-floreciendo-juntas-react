import { useContext, useEffect, useMemo, useState } from 'react';
import OrdersContext from '../../../context/OrdersContext/OrdersContext';
import { statusLabels } from '../components/OrderConstans';

export default function useOrders() {
    const {
        cargando,
        ordenesActivas,
        ordenesLiquidadas,
        enviosPagados,
        ordenesEnviadas,
        obtenerOrdenesActivas,
        obtenerOrdenesCompletadas,
        obtenerOrdenesEnvioPagado,
        obtenerOrdenesEnviadas,
        actualizarCostoEnvio,
        actualizarGuiaEnvio,
        marcarComoEnviado,
        obtenerOrderPorId,
    } = useContext(OrdersContext);

    const [activeTab, setActiveTab] = useState(0);
    const [filterItems, setFilterItems] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [shippingModalOpen, setShippingModalOpen] = useState(false);
    const [trackingModalOpen, setTrackingModalOpen] = useState(false);
    const [sendModalOpen, setSendModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetail, setOrderDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const [shippingCostInput, setShippingCostInput] = useState('');
    const [trackingNumberInput, setTrackingNumberInput] = useState('');
    const [carrierInput, setCarrierInput] = useState('');

    const [initialLoad, setInitialLoad] = useState(false);
    const [loadingTabs, setLoadingTabs] = useState({ 0: false, 1: false, 2: false, 3: false });

    const [rowsState, setRowsState] = useState({ page: 0, pageSize: 7 });

    const cargarOrdenesActivas = async () => {
        if (obtenerOrdenesActivas) await obtenerOrdenesActivas();
    };
    const cargarOrdenesLiquidadas = async () => {
        if (obtenerOrdenesCompletadas) await obtenerOrdenesCompletadas();
    };
    const cargarEnviosPagados = async () => {
        if (obtenerOrdenesEnvioPagado) await obtenerOrdenesEnvioPagado();
    };
    const cargarOrdenesEnviadas = async () => {
        if (obtenerOrdenesEnviadas) await obtenerOrdenesEnviadas();
    };

    // Cargar TODOS los datos al montar el componente
    useEffect(() => {
        const cargarTodosLosDatos = async () => {
            try {
                setLoadingTabs((prev) => ({ ...prev, 0: true, 1: true, 2: true, 3: true }));
                await Promise.all([
                    cargarOrdenesActivas(),
                    cargarOrdenesLiquidadas(),
                    cargarEnviosPagados(),
                    cargarOrdenesEnviadas(),
                ]);
                setInitialLoad(true);
            } catch (error) {
                console.error('Error al cargar los datos iniciales:', error);
            } finally {
                setLoadingTabs((prev) => ({ ...prev, 0: false, 1: false, 2: false, 3: false }));
            }
        };

        cargarTodosLosDatos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTabChange = async (event, newValue) => {
        setActiveTab(newValue);
        setRowsState((prev) => ({ ...prev, page: 0 }));
        setSearchTerm('');

        if (!initialLoad) {
            setLoadingTabs((prev) => ({ ...prev, [newValue]: true }));
            try {
                switch (newValue) {
                    case 0:
                        await cargarOrdenesActivas();
                        break;
                    case 1:
                        await cargarOrdenesLiquidadas();
                        break;
                    case 2:
                        await cargarEnviosPagados();
                        break;
                    case 3:
                        await cargarOrdenesEnviadas();
                        break;
                    default:
                        break;
                }
            } finally {
                setLoadingTabs((prev) => ({ ...prev, [newValue]: false }));
            }
        }
    };

    const getOrdersToDisplay = () => {
        switch (activeTab) {
            case 0:
                return ordenesActivas || [];
            case 1:
                return ordenesLiquidadas || [];
            case 2:
                return enviosPagados || [];
            case 3:
                return ordenesEnviadas || [];
            default:
                return [];
        }
    };

    const displayRows = useMemo(() => {
        let filtered = getOrdersToDisplay();

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter((row) => {
                const orderNumber = `ORD-${row.id}`.toLowerCase();
                const customerName = row.user?.name?.toLowerCase() || 'Cliente no disponible';
                const status = statusLabels[row.status]?.toLowerCase() || row.status?.toLowerCase() || '';
                return orderNumber.includes(search) || customerName.includes(search) || status.includes(search);
            });
        }

        if (filterItems.length > 0) {
            filtered = filtered.filter((row) =>
                filterItems.every((filter) => {
                    const field = filter.fields.selectedField;
                    const value = filter.fields.filterValue.toLowerCase();

                    if (field === 'orderNumber') {
                        return `ORD-${row.id}`.toLowerCase().includes(value);
                    } else if (field === 'customerName') {
                        const customerName = row.user?.name?.toLowerCase() || 'Cliente no disponible';
                        return customerName.includes(value);
                    } else if (field === 'status') {
                        const status = statusLabels[row.status]?.toLowerCase() || row.status?.toLowerCase() || '';
                        return status.includes(value);
                    }
                    return false;
                })
            );
        }

        return filtered;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterItems, searchTerm, activeTab, ordenesActivas, ordenesLiquidadas, enviosPagados, ordenesEnviadas]);

    const handleFilterFieldChange = (id) => (e) => {
        const { name, value } = e.target;
        setFilterItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, fields: { ...item.fields, [name]: value } } : item))
        );
    };

    const handleFilterReset = () => {
        setFilterItems([]);
        setShowFilters(false);
    };

    const addFilter = () => {
        const newItem = {
            id: Date.now(),
            fields: { selectedField: 'orderNumber', filterValue: '' },
        };
        setFilterItems([...filterItems, newItem]);
        setShowFilters(true);
    };

    const deleteFilter = (id) => setFilterItems(filterItems.filter((item) => item.id !== id));

    // Modal: detalle de venta
    const openDetailModal = async (order) => {
        setSelectedOrder(order);
        setDetailLoading(true);
        setDetailModalOpen(true);

        try {
            const response = await obtenerOrderPorId(order.id);
            setOrderDetail(response.order);
        } catch (error) {
            console.error('Error al obtener detalles de la orden:', error);
            setOrderDetail(order);
        } finally {
            setDetailLoading(false);
        }
    };

    const closeDetailModal = () => {
        setDetailModalOpen(false);
        setSelectedOrder(null);
        setOrderDetail(null);
        setDetailLoading(false);
    };

    // Modal: costo de envío
    const openShippingModal = (order) => {
        setSelectedOrder(order);
        const currentShippingCost = order.shippingCost;
        const numericCost = currentShippingCost && currentShippingCost !== '0.00' ? parseFloat(currentShippingCost) : '';
        setShippingCostInput(numericCost !== '' ? numericCost.toString() : '');
        setShippingModalOpen(true);
    };

    const closeShippingModal = () => {
        setShippingModalOpen(false);
        setSelectedOrder(null);
        setShippingCostInput('');
    };

    const handleSaveShippingCost = async () => {
        if (selectedOrder && shippingCostInput) {
            const cost = parseFloat(shippingCostInput);
            if (!isNaN(cost) && cost >= 0) {
                try {
                    await actualizarCostoEnvio(selectedOrder.id, cost);
                    closeShippingModal();
                    setLoadingTabs((prev) => ({ ...prev, 1: true }));
                    await cargarOrdenesLiquidadas();
                    setLoadingTabs((prev) => ({ ...prev, 1: false }));
                } catch (error) {
                    console.error('Error al actualizar costo de envío:', error);
                    setLoadingTabs((prev) => ({ ...prev, 1: false }));
                }
            }
        }
    };

    // Modal: número de guía
    const openTrackingModal = (order) => {
        setSelectedOrder(order);
        setTrackingNumberInput(order.trackingNumber || '');
        setCarrierInput(order.carrier || '');
        setTrackingModalOpen(true);
    };

    const closeTrackingModal = () => {
        setTrackingModalOpen(false);
        setSelectedOrder(null);
        setTrackingNumberInput('');
        setCarrierInput('');
    };

    const handleSaveTrackingNumber = async () => {
        if (selectedOrder && trackingNumberInput.trim() && carrierInput.trim()) {
            try {
                await actualizarGuiaEnvio(selectedOrder.id, trackingNumberInput.trim(), carrierInput.trim());
                closeTrackingModal();
                setLoadingTabs((prev) => ({ ...prev, 2: true }));
                await cargarEnviosPagados();
                setLoadingTabs((prev) => ({ ...prev, 2: false }));
            } catch (error) {
                console.error('Error al actualizar número de guía:', error);
                setLoadingTabs((prev) => ({ ...prev, 2: false }));
            }
        }
    };

    // Modal: marcar como enviado
    const openSendModal = (order) => {
        setSelectedOrder(order);
        setSendModalOpen(true);
    };

    const closeSendModal = () => {
        setSendModalOpen(false);
        setSelectedOrder(null);
    };

    const handleMarkAsSent = async () => {
        if (selectedOrder) {
            try {
                setLoadingTabs((prev) => ({ ...prev, 2: true, 3: true }));
                await marcarComoEnviado(selectedOrder.id);
                closeSendModal();
                await Promise.all([cargarEnviosPagados(), cargarOrdenesEnviadas()]);
            } catch (error) {
                console.error('Error al marcar como enviado:', error);
            } finally {
                setLoadingTabs((prev) => ({ ...prev, 2: false, 3: false }));
            }
        }
    };

    const isLoading = cargando || loadingTabs[activeTab];

    return {
        // datos
        ordenesActivas,
        ordenesLiquidadas,
        enviosPagados,
        ordenesEnviadas,
        displayRows,
        isLoading,
        loadingTabs,

        // tabs / búsqueda / filtros
        activeTab,
        handleTabChange,
        searchTerm,
        setSearchTerm,
        filterItems,
        showFilters,
        addFilter,
        handleFilterFieldChange,
        handleFilterReset,
        deleteFilter,

        // paginación
        rowsState,
        setRowsState,

        // modal detalle
        detailModalOpen,
        selectedOrder,
        orderDetail,
        detailLoading,
        openDetailModal,
        closeDetailModal,

        // modal costo de envío
        shippingModalOpen,
        shippingCostInput,
        setShippingCostInput,
        openShippingModal,
        closeShippingModal,
        handleSaveShippingCost,

        // modal número de guía
        trackingModalOpen,
        trackingNumberInput,
        setTrackingNumberInput,
        carrierInput,
        setCarrierInput,
        openTrackingModal,
        closeTrackingModal,
        handleSaveTrackingNumber,

        // modal marcar como enviado
        sendModalOpen,
        openSendModal,
        closeSendModal,
        handleMarkAsSent,
    };
}