import React, { useContext, useEffect, useState } from "react";
import FormationContext from "../../context/FormationContext/FormationContext";
import Swal from "sweetalert2";
import {
    Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent,
    DialogTitle, Divider, Fade, Grid, IconButton, Paper, Skeleton,
    Stack, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Tooltip, Typography, useMediaQuery, useTheme,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import InboxIcon from "@mui/icons-material/Inbox";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import PersonIcon from "@mui/icons-material/Person";
import BookIcon from "@mui/icons-material/Book";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmailIcon from "@mui/icons-material/Email";
import LinkIcon from "@mui/icons-material/Link";
import { SchoolOutlined } from "@mui/icons-material";
import Pagination from "@mui/material/Pagination";

const PINK = "#FF5C93";
const PINK_DARK = "#e0456e";
const PINK_LIGHT = "rgba(255,92,147,0.08)";

const fmtDate = (d) =>
    new Date(d).toLocaleDateString("es-MX", {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
    });

const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

// Estado visual según status del delivery
const statusConfig = {
    submitted: { label: "Pendiente", bgcolor: "#fff3e0", color: "#e65100", icon: PendingActionsIcon },
    accepted: { label: "Aceptado", bgcolor: "#e8f5e9", color: "#2e7d32", icon: CheckCircleIcon },
    rejected: { label: "Rechazado", bgcolor: "#ffebee", color: "#c62828", icon: CancelIcon },
};
const getStatusConfig = (delivery) =>
    statusConfig[delivery.status] ?? statusConfig.submitted;

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal = ({ open, onClose, delivery, onAction, isMobile }) => {
    const [openImage, setOpenImage] = useState(false);

    if (!delivery) return null;

    const isPending = delivery.status === "submitted";
    const cfg = getStatusConfig(delivery);
    const StatusIcon = cfg.icon;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            fullScreen={isMobile}
            PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3, m: isMobile ? 0 : 2 } }}
        >
            {/* Title */}
            <DialogTitle sx={{ bgcolor: PINK, color: "#fff", py: { xs: 2, sm: 2.5 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pr: 4 }}>
                    <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 38, height: 38 }}>
                        <AssignmentIcon sx={{ color: "#fff", fontSize: 20 }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ color: "#fff", fontSize: { xs: "1rem", sm: "1.1rem" }, lineHeight: 1.2 }}>
                            Detalle del entregable
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#fff", opacity: 0.9 }}>
                            #{delivery.id} · {delivery.module?.name ?? "—"}
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} sx={{ position: "absolute", top: 10, right: 10, color: "#ffffff" }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            {/* Content */}
            <DialogContent sx={{ p: { xs: 2.5, sm: 3 }, bgcolor: "#fff" }}>

                {/* Info alumno */}
                <Paper sx={{ p: { xs: 2, sm: 2.5 }, mb: 2.5, bgcolor: "#fafafa", borderRadius: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
                        <Avatar sx={{ bgcolor: PINK, color: "#fff", width: 48, height: 48, fontWeight: 700, fontSize: "1rem" }}>
                            {getInitials(delivery.user?.name)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography fontWeight="700" sx={{ fontSize: "1rem", color: "#1a1a1a" }}>
                                {delivery.user?.name ?? "—"}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#757575", wordBreak: "break-all" }}>
                                {delivery.user?.email ?? "—"}
                            </Typography>
                        </Box>
                    </Box>
                    <Divider />
                    <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <BookIcon sx={{ fontSize: 15, color: "#9e9e9e" }} />
                                <Typography variant="caption" sx={{ color: "#757575" }}>Módulo</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight="600" sx={{ ml: 3 }}>
                                {delivery.module?.name ?? "—"}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <CalendarTodayIcon sx={{ fontSize: 15, color: "#9e9e9e" }} />
                                <Typography variant="caption" sx={{ color: "#757575" }}>Fecha de envío</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight="600" sx={{ ml: 3 }}>
                                {delivery.submitDate ? fmtDate(delivery.submitDate) : "—"}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <EmailIcon sx={{ fontSize: 15, color: "#9e9e9e" }} />
                                <Typography variant="caption" sx={{ color: "#757575" }}>Estado</Typography>
                            </Box>
                            <Box sx={{ ml: 3, mt: 0.3 }}>
                                <Chip
                                    icon={<StatusIcon sx={{ fontSize: "14px !important", color: `${cfg.color} !important` }} />}
                                    label={cfg.label}
                                    size="small"
                                    sx={{ bgcolor: cfg.bgcolor, color: cfg.color, fontWeight: 600, fontSize: "0.72rem" }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Archivo */}
                {delivery.urlDelivery && (
                    <Paper
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            border: `1px dashed ${PINK}`,
                            bgcolor: PINK_LIGHT,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <LinkIcon sx={{ color: PINK, flexShrink: 0 }} />

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: PINK,
                                        fontWeight: 600,
                                        display: "block",
                                        mb: 1,
                                    }}
                                >
                                    Archivo entregado
                                </Typography>

                                {delivery.urlDelivery ? (
                                    <Box
                                        onClick={() => setOpenImage(true)}
                                        sx={{
                                            width: 140,
                                            height: 140,
                                            borderRadius: 2,
                                            overflow: "hidden",
                                            bgcolor: "#fff",
                                            border: "1px solid #eee",
                                            cursor: "pointer",
                                            transition: "0.2s",
                                            "&:hover": {
                                                transform: "scale(1.02)",
                                                boxShadow: 3,
                                            },
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={delivery.urlDelivery}
                                            alt={delivery.user?.name}
                                            sx={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "contain",
                                                p: 1,
                                            }}
                                        />
                                    </Box>
                                ) : (
                                    <Box
                                        sx={{
                                            width: 140,
                                            height: 140,
                                            borderRadius: 2,
                                            bgcolor: "#f5f5f5",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <SchoolOutlined sx={{ color: "#bbb", fontSize: 40 }} />
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        <Dialog
                            open={openImage}
                            onClose={() => setOpenImage(false)}
                            maxWidth="lg"
                        >
                            <Box
                                sx={{
                                    // bgcolor: "#000",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    // p: 2,
                                }}
                            >
                                <Box
                                    component="img"
                                    src={delivery.urlDelivery}
                                    alt={delivery.user?.name}
                                    sx={{
                                        maxWidth: "90vw",
                                        maxHeight: "90vh",
                                        objectFit: "contain",
                                        borderRadius: 1,
                                    }}
                                />
                            </Box>
                        </Dialog>
                    </Paper>
                )}
            </DialogContent>

            {/* Actions */}
            <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: "#fff", gap: 1, flexWrap: "wrap" }}>
                {/* <Button onClick={onClose} sx={{ color: "#757575" }}>Cerrar</Button> */}
                <Box sx={{ flex: 1 }} />
                {/* Rechazar */}
                <Button
                    variant="outlined"
                    startIcon={<ThumbDownIcon />}
                    disabled={!isPending}
                    onClick={() => { onAction(delivery.id, delivery.user?.name, "rejected"); onClose(); }}
                    sx={{
                        borderColor: "#ef5350",
                        color: "#ef5350",
                        fontWeight: 600,
                        "&:hover": { borderColor: "#c62828", bgcolor: "#ffebee" },
                        "&.Mui-disabled": { borderColor: "#e0e0e0", color: "#bdbdbd" },
                    }}
                >
                    Rechazar
                </Button>
                {/* Aceptar */}
                <Button
                    variant="contained"
                    startIcon={<ThumbUpIcon />}
                    disabled={!isPending}
                    onClick={() => { onAction(delivery.id, delivery.user?.name, "accepted"); onClose(); }}
                    sx={{
                        background: isPending ? "linear-gradient(135deg,#ef709b 0%,#ef709b 100%)" : undefined,
                        bgcolor: isPending ? undefined : "#e0e0e0",
                        color: isPending ? "#fff" : "#9e9e9e",
                        fontWeight: 600,
                        "&:hover": { background: isPending ? "linear-gradient(135deg,#FF5C93 0%,#FF5C93 100%)" : undefined },
                        "&.Mui-disabled": { color: "#9e9e9e", bgcolor: "#e0e0e0" },
                    }}
                >
                    Aceptar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ─── Row skeleton ─────────────────────────────────────────────────────────────
const RowSkeleton = () => (
    <TableRow>
        {[48, 160, 130, 100, 110, 120].map((w, i) => (
            <TableCell key={i}>
                <Skeleton variant={i === 0 ? "circular" : "text"} width={i === 0 ? 36 : w} height={i === 0 ? 36 : 20} />
            </TableCell>
        ))}
    </TableRow>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Deliverable = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const { pendingDeliveries, getPendingDeliveries, reviewDelivery, cargando, error } =
        useContext(FormationContext);

    const [selected, setSelected] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        getPendingDeliveries();
    }, []);

    const openDetail = (delivery) => { setSelected(delivery); setModalOpen(true); };
    const closeDetail = () => setModalOpen(false);

    // status: "accepted" | "rejected"
    const handleAction = (id, userName, status) => {
        const isAccept = status === "accepted";
        Swal.fire({
            title: isAccept ? "¿Aceptar entregable?" : "¿Rechazar entregable?",
            text: `${isAccept ? "Aceptar" : "Rechazar"} el entregable de ${userName ?? "este alumno"}.`,
            icon: isAccept ? "question" : "warning",
            showCancelButton: true,
            confirmButtonColor: isAccept ? "#4caf50" : "#ef5350",
            cancelButtonColor: "#9e9e9e",
            confirmButtonText: isAccept ? "Sí, aceptar" : "Sí, rechazar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) reviewDelivery(id, status);
        });
    };

    const deliveries = pendingDeliveries?.deliveries || [];

    const totalItems = pendingDeliveries?.totalItems || 0;
    const totalPages = pendingDeliveries?.totalPages || 1;
    const currentPage = pendingDeliveries?.currentPage || 1;

    const pending = deliveries.filter(d => d.status === "submitted").length;
    const accepted = deliveries.filter(d => d.status === "accepted").length;
    const rejected = deliveries.filter(d => d.status === "rejected").length;

    return (
        <Box sx={{ maxWidth: 1400, mx: "auto", p: { xs: 1.5, sm: 2, md: 3 } }}>

            {/* ── Header ── */}
            <Paper sx={{ borderRadius: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3 }, overflow: "hidden" }}>
                <Box sx={{ background: "linear-gradient(135deg, #FF5C93 0%, #f73b7a 100%)", p: { xs: 2.5, sm: 3, md: 4 } }}>
                    <Box sx={{ display: "flex", alignItems: { xs: "flex-start", md: "center" }, justifyContent: "space-between", flexDirection: { xs: "column", md: "row" }, gap: { xs: 2, md: 3 } }}>
                        <Box>
                            <Typography variant="h4" fontWeight="700" sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 }, color: "#fff", fontSize: { xs: "1.4rem", sm: "1.75rem", md: "2.125rem" } }}>
                                <AssignmentIcon sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }} />
                                Entregables
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#fff", opacity: 0.9, mt: 0.5, fontSize: { xs: "0.85rem", sm: "1rem" } }}>
                                Revisa y confirma los entregables enviados por los alumnos
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={{ xs: 1, sm: 2 }} sx={{ width: { xs: "100%", md: "auto" } }}>
                            {[
                                // { value: deliveries.length, label: "Total", color: "#fff" },
                                { value: pending, label: "Pendientes", color: "#ffb74d" },
                                // { value: accepted, label: "Aceptados", color: "#81c784" },
                                // { value: rejected, label: "Rechazados", color: "#ef9a9a" },
                            ].map((s, i) => (
                                <Paper key={i} sx={{ p: { xs: 1.2, sm: 2 }, bgcolor: "rgba(255,255,255,0.12)", borderRadius: 2, flex: { xs: 1, md: "none" }, minWidth: { xs: 0, md: 80 }, textAlign: "center", boxShadow: "none" }}>
                                    <Typography variant="h4" fontWeight="700" sx={{ color: s.color, fontSize: { xs: "1.3rem", sm: "1.8rem" }, lineHeight: 1.1 }}>{s.value}</Typography>
                                    <Typography variant="caption" sx={{ color: "#fff", fontSize: { xs: "0.58rem", sm: "0.68rem" }, display: "block", mt: 0.3 }}>{s.label}</Typography>
                                </Paper>
                            ))}
                        </Stack>
                    </Box>
                </Box>
            </Paper>

            {/* ── Table ── */}
            <Paper sx={{ borderRadius: { xs: 2, sm: 3 }, overflow: "hidden" }}>

                <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 }, borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 1 }}>
                    <AssignmentIcon sx={{ color: PINK, fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight="600" sx={{ color: "#1a1a1a" }}>
                        Lista de entregables
                    </Typography>
                    {!cargando && deliveries.length > 0 && (
                        <Chip label={deliveries.length} size="small"
                            sx={{ bgcolor: PINK, color: "#fff", height: 20, fontSize: "0.68rem", ml: 0.5, "& .MuiChip-label": { px: 1 } }} />
                    )}
                </Box>

                {/* Empty */}
                {!cargando && !error && deliveries.length === 0 && (
                    <Fade in>
                        <Box sx={{ py: { xs: 8, sm: 12 }, textAlign: "center" }}>
                            <InboxIcon sx={{ fontSize: { xs: 60, sm: 72 }, color: "#e0e0e0", mb: 2 }} />
                            <Typography variant="h6" sx={{ color: "#bdbdbd", fontWeight: 500 }}>No hay entregables</Typography>
                            <Typography variant="body2" sx={{ color: "#bdbdbd", mt: 0.5 }}>Cuando los alumnos envíen entregables aparecerán aquí</Typography>
                        </Box>
                    </Fade>
                )}

                {/* Error */}
                {error && (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                        <Typography sx={{ color: "#f44336", mb: 2 }}>{error}</Typography>
                        <Button variant="contained" onClick={getPendingDeliveries} sx={{ bgcolor: PINK, "&:hover": { bgcolor: PINK_DARK } }}>Reintentar</Button>
                    </Box>
                )}

                {/* Table */}
                {(cargando || deliveries.length > 0) && (
                    <TableContainer>
                        <Table sx={{ minWidth: isMobile ? 340 : 700 }}>
                            <TableHead>
                                <TableRow sx={{ bgcolor: "#fafafa" }}>
                                    <TableCell sx={{ fontWeight: 600, color: "#757575", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", py: 1.5, width: 56 }} />
                                    <TableCell sx={{ fontWeight: 600, color: "#757575", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", py: 1.5 }}>Alumno</TableCell>
                                    {!isMobile && <TableCell sx={{ fontWeight: 600, color: "#757575", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", py: 1.5 }}>Módulo</TableCell>}
                                    <TableCell sx={{ fontWeight: 600, color: "#757575", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", py: 1.5 }}>Fecha envío</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: "#757575", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", py: 1.5 }}>Estado</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: "#757575", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", py: 1.5 }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cargando
                                    ? Array.from({ length: 5 }, (_, i) => <RowSkeleton key={i} />)
                                    : deliveries.map((delivery) => {
                                        const isPending = delivery.status === "submitted";
                                        const cfg = getStatusConfig(delivery);
                                        const StatusIcon = cfg.icon;
                                        return (
                                            <TableRow
                                                key={delivery.id}
                                                hover
                                                sx={{ cursor: "pointer", transition: "background 0.15s", "&:hover": { bgcolor: PINK_LIGHT }, "&:last-child td": { border: 0 } }}
                                                onClick={() => openDetail(delivery)}
                                            >
                                                {/* Avatar */}
                                                <TableCell sx={{ py: 1.5, pr: 0 }}>
                                                    <Avatar sx={{ bgcolor: isPending ? PINK_LIGHT : cfg.bgcolor, color: isPending ? PINK : cfg.color, width: 36, height: 36, fontSize: "0.75rem", fontWeight: 700 }}>
                                                        {delivery.user?.name ? getInitials(delivery.user.name) : <PersonIcon sx={{ fontSize: 18 }} />}
                                                    </Avatar>
                                                </TableCell>

                                                {/* Alumno */}
                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Typography variant="body2" fontWeight="600" sx={{ color: "#1a1a1a", fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                                                        {delivery.user?.name ?? "—"}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: "#9e9e9e", fontSize: "0.7rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: { xs: 130, sm: 200 }, display: "block" }}>
                                                        {delivery.user?.email ?? ""}
                                                    </Typography>
                                                    {isMobile && (
                                                        <Typography variant="caption" sx={{ color: PINK, fontWeight: 600, fontSize: "0.68rem" }}>
                                                            {delivery.module?.name ?? "—"}
                                                        </Typography>
                                                    )}
                                                </TableCell>

                                                {/* Módulo desktop */}
                                                {!isMobile && (
                                                    <TableCell sx={{ py: 1.5 }}>
                                                        <Chip
                                                            icon={<BookIcon sx={{ fontSize: "13px !important", color: `${PINK} !important` }} />}
                                                            label={delivery.module?.name ?? "—"}
                                                            size="small"
                                                            sx={{ bgcolor: PINK_LIGHT, color: PINK, fontWeight: 600, border: `1px solid ${PINK}`, fontSize: "0.72rem", "& .MuiChip-label": { whiteSpace: "normal" } }}
                                                        />
                                                    </TableCell>
                                                )}

                                                {/* Fecha */}
                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                                                        <CalendarTodayIcon sx={{ fontSize: 13, color: "#bdbdbd", flexShrink: 0 }} />
                                                        <Typography variant="caption" sx={{ color: "#757575", whiteSpace: "nowrap", fontSize: { xs: "0.68rem", sm: "0.75rem" } }}>
                                                            {delivery.submitDate ? fmtDate(delivery.submitDate) : "—"}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>

                                                {/* Estado */}
                                                <TableCell align="center" sx={{ py: 1.5 }}>
                                                    <Chip
                                                        icon={<StatusIcon sx={{ fontSize: "13px !important", color: `${cfg.color} !important` }} />}
                                                        label={cfg.label}
                                                        size="small"
                                                        sx={{ bgcolor: cfg.bgcolor, color: cfg.color, fontWeight: 600, fontSize: "0.7rem" }}
                                                    />
                                                </TableCell>

                                                {/* Acciones */}
                                                <TableCell align="center" sx={{ py: 1.5 }} onClick={(e) => e.stopPropagation()}>
                                                    <Stack direction="row" spacing={0.5} justifyContent="center">
                                                        {/* Ver detalle */}
                                                        <Tooltip title="Ver detalle">
                                                            <IconButton size="small" onClick={() => openDetail(delivery)}
                                                                sx={{ bgcolor: PINK_LIGHT, color: PINK, "&:hover": { bgcolor: PINK, color: "#fff" }, width: 30, height: 30 }}>
                                                                <VisibilityIcon sx={{ fontSize: 15 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {/* Aceptar */}
                                                        <Tooltip title={isPending ? "Aceptar" : "Ya procesado"}>
                                                            <span>
                                                                <IconButton size="small" disabled={!isPending}
                                                                    onClick={() => handleAction(delivery.id, delivery.user?.name, "accepted")}
                                                                    sx={{ bgcolor: isPending ? "#e8f5e9" : "#f5f5f5", color: isPending ? "#4caf50" : "#bdbdbd", "&:hover": { bgcolor: "#af4c95", color: "#fff" }, width: 30, height: 30 }}>
                                                                    <ThumbUpIcon sx={{ fontSize: 15 }} />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                        {/* Rechazar */}
                                                        <Tooltip title={isPending ? "Rechazar" : "Ya procesado"}>
                                                            <span>
                                                                <IconButton size="small" disabled={!isPending}
                                                                    onClick={() => handleAction(delivery.id, delivery.user?.name, "rejected")}
                                                                    sx={{ bgcolor: isPending ? "#ffebee" : "#f5f5f5", color: isPending ? "#ef5350" : "#bdbdbd", "&:hover": { bgcolor: "#ef5350", color: "#fff" }, width: 30, height: 30 }}>
                                                                    <ThumbDownIcon sx={{ fontSize: 15 }} />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(e, page) => {
                        getPendingDeliveries(page);
                    }}
                />
            </Box>

            {/* ── Detail Modal ── */}
            <DetailModal
                open={modalOpen}
                onClose={closeDetail}
                delivery={selected}
                onAction={handleAction}
                isMobile={isMobile}
            />
        </Box>
    );
};

export default Deliverable;