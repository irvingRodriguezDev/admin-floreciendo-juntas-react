import React from 'react';
import { Box, Paper } from '@mui/material';

import useOrders from './hooks/useOrders';
import OrderFilters from './components/OrderFilters';
import OrderTableHeader from './components/OrderTableHeader';
import OrderTabs from './components/OrderTabs';
import OrderTable from './components/OrderTable';
import OrderDetailModal from './components/OrderDeatilModal';
import ShippingCostModal from './components/ShippingCostModal';
import TrackingModal from './components/TrackingModal';
import SendConfirmModal from './components/SendConfirmModal';

const Order = () => {
    const o = useOrders();

    return (
        <Box>
            <OrderFilters
                filterItems={o.filterItems}
                showFilters={o.showFilters}
                onChange={o.handleFilterFieldChange}
                onDelete={o.deleteFilter}
                onReset={o.handleFilterReset}
            />

            <Paper
                elevation={0}
                sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: '1px solid #FFE6F0',
                }}
            >
                <OrderTableHeader
                    activeTab={o.activeTab}
                    searchTerm={o.searchTerm}
                    onSearchChange={(e) => {
                        o.setSearchTerm(e.target.value);
                        o.setRowsState((prev) => ({
                            ...prev,
                            page: 0,
                        }));
                    }}
                    onSearchClear={() => o.setSearchTerm('')}
                />

                <OrderTabs
                    activeTab={o.activeTab}
                    onChange={o.handleTabChange}
                    loadingTabs={o.loadingTabs}
                    counts={{
                        activas: o.ordenesActivas?.length,
                        liquidadas: o.ordenesLiquidadas?.length,
                        enviosPagados: o.enviosPagados?.length,
                        enviadas: o.ordenesEnviadas?.length,
                    }}
                />

                <OrderTable
                    activeTab={o.activeTab}
                    isLoading={o.isLoading}
                    searchTerm={o.searchTerm}
                    displayRows={o.displayRows}
                    rowsState={o.rowsState}
                    setRowsState={o.setRowsState}
                    onViewDetail={o.openDetailModal}
                    onEditShipping={o.openShippingModal}
                    onAddTracking={o.openTrackingModal}
                />
            </Paper>

            <OrderDetailModal
                open={o.detailModalOpen}
                onClose={o.closeDetailModal}
                selectedOrder={o.selectedOrder}
                orderDetail={o.orderDetail}
                loading={o.detailLoading}
            />

            <ShippingCostModal
                open={o.shippingModalOpen}
                onClose={o.closeShippingModal}
                order={o.selectedOrder}
                value={o.shippingCostInput}
                onChange={(e) => o.setShippingCostInput(e.target.value)}
                onSave={o.handleSaveShippingCost}
            />

            <TrackingModal
                open={o.trackingModalOpen}
                onClose={o.closeTrackingModal}
                order={o.selectedOrder}
                trackingNumber={o.trackingNumberInput}
                onTrackingNumberChange={(e) =>
                    o.setTrackingNumberInput(e.target.value)
                }
                carrier={o.carrierInput}
                onCarrierChange={(e) =>
                    o.setCarrierInput(e.target.value)
                }
                onSave={o.handleSaveTrackingNumber}
            />

            <SendConfirmModal
                open={o.sendModalOpen}
                onClose={o.closeSendModal}
                order={o.selectedOrder}
                onConfirm={o.handleMarkAsSent}
            />
        </Box>
    );
};

export default Order;
