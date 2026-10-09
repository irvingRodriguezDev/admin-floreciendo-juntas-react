import React, { useMemo } from 'react';
import {
    Avatar,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import OrderTableRow from './OrderTableRow';

const headCellSx = {
    bgcolor: '#FFF5FA',
    color: '#757575',
    fontWeight: 700,
    fontSize: '0.8rem',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid #FFE6F0',
};

const getColumns = (activeTab) => [
    'Número de Orden',
    'Cliente',
    'Fecha',
    'Dirección',
    'Total',
    'Estado',
    activeTab === 3 ? 'Número de Guía' : 'Envio Pagado',
    'Costo de Envío',
    'Acciones',
];

const OrderTable = ({
    activeTab,
    isLoading,
    searchTerm,
    displayRows,
    rowsState,
    setRowsState,
    onViewDetail,
    onEditShipping,
    onAddTracking,
}) => {
    const columns = useMemo(() => getColumns(activeTab), [activeTab]);
    const { page, pageSize } = rowsState;
    const currentRows = displayRows.slice(page * pageSize, (page + 1) * pageSize);
    const total = displayRows.length;

    return (
        <>
            {searchTerm && (
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ px: 3, py: 1.5, bgcolor: '#FFF5FA', borderBottom: '1px solid #FFE6F0' }}
                >
                    <SearchIcon sx={{ fontSize: 16, color: '#FF69B4' }} />
                    <Typography variant="caption" color="text.secondary">
                        Mostrando {total} resultado{total !== 1 ? 's' : ''} para "{searchTerm}"
                    </Typography>
                </Stack>
            )}

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {columns.map((label) => (
                                <TableCell key={label} align="center" sx={headCellSx}>
                                    {label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }, (_, i) => (
                                <TableRow key={i}>
                                    {columns.map((label) => (
                                        <TableCell key={label} align="center">
                                            <Skeleton sx={{ mx: 'auto' }} width="70%" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : currentRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} sx={{ border: 0 }}>
                                    <Stack alignItems="center" spacing={1.5} sx={{ py: 7 }}>
                                        <Avatar sx={{ bgcolor: '#FFF0F7', width: 72, height: 72 }}>
                                            <SearchOffIcon sx={{ fontSize: 38, color: '#FFB3DC' }} />
                                        </Avatar>
                                        <Typography color="text.secondary">
                                            No se encontraron órdenes en esta categoría
                                        </Typography>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentRows.map((order) => (
                                <OrderTableRow
                                    key={order.id}
                                    order={order}
                                    activeTab={activeTab}
                                    onViewDetail={onViewDetail}
                                    onEditShipping={onEditShipping}
                                    onAddTracking={onAddTracking}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {!isLoading && total > 0 && (
                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    rowsPerPage={pageSize}
                    rowsPerPageOptions={[]}
                    onPageChange={(_, newPage) =>
                        setRowsState((prev) => ({
                            ...prev,
                            page: newPage,
                        }))
                    }
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}–${to} de ${count}`
                    }
                    sx={{
                        borderTop: "1px solid #FFE6F0",
                        bgcolor: "#FFFAFC",

                        "& .MuiTablePagination-toolbar": {
                            justifyContent: "center",
                        },

                        "& .MuiTablePagination-spacer": {
                            display: "none",
                        },
                    }}
                />

            )}
        </>
    );
};

export default OrderTable;