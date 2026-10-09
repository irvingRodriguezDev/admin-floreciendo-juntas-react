import React, { useContext, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

import SubscriptionsContext from "../../context/SubscriptionsContext/SubscriptionsContext";

const ROWS_PER_PAGE = 15;

const STATUS = [
  { label: "Activa", color: "#28a745", bg: "#EAFCDD", icon: <CheckCircleOutlineIcon /> },
  { label: "Vencida", color: "#dc3545", bg: "#FEF4F6", icon: <ErrorOutlineIcon /> },
];

const headCellSx = {
  bgcolor: "#FFF5FA",
  color: "#757575",
  fontWeight: 700,
  fontSize: "0.8rem",
  borderBottom: "1px solid #FFE6F0",
};

const getInitials = (name) =>
  name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

export default function Dashboard() {
  const {
    subscriptionsActive,
    subscriptionsPastDue,
    paginationActive,
    paginationPastDue,
    getSubscriptionsActive,
    getSubscriptionsPastDue,
    loading,
  } = useContext(SubscriptionsContext);

  const [activeTab, setActiveTab] = useState(0);
  const [pageActive, setPageActive] = useState(0);
  const [pagePastDue, setPagePastDue] = useState(0);

  useEffect(() => {
    getSubscriptionsActive(pageActive + 1);
  }, [pageActive]);

  useEffect(() => {
    getSubscriptionsPastDue(pagePastDue + 1);
  }, [pagePastDue]);

  const isActiveTab = activeTab === 0;
  const status = STATUS[activeTab];
  const subscriptions = (isActiveTab ? subscriptionsActive : subscriptionsPastDue) || [];
  const pagination = isActiveTab ? paginationActive : paginationPastDue;
  const page = isActiveTab ? pageActive : pagePastDue;

  const tabs = [
    { label: "Activas", total: paginationActive?.totalItems || 0, color: "#28a745" },
    { label: "Vencidas", total: paginationPastDue?.totalItems || 0, color: "#dc3545" },
  ];

  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: 4, overflow: "hidden", border: "1px solid #FFE6F0", boxShadow: "0 8px 24px rgba(255,92,147,0.08)" }}
    >
      {/* Header */}
      <Box sx={{ background: "linear-gradient(135deg,#FF5C93,#FF69B4)", p: { xs: 2.5, sm: 3 }, color: "#fff" }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff", width: 48, height: 48 }}>
            <CardMembershipIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: "1.3rem", sm: "1.5rem" } }}>
              Suscripciones
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Consulta el estado de las suscripciones de tus clientes
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Tabs */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={{ xs: 1, md: 2 }}
        sx={{ bgcolor: "#FFF5FA", px: { xs: 1, sm: 3 }, pt: { xs: 1, sm: 1.5 }, pb: { xs: 1.5, md: 0 }, borderBottom: "1px solid #FFE6F0" }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, value) => { setActiveTab(value); }}
          variant="scrollable"
          scrollButtons={false}
          sx={{
            "& .MuiTabs-indicator": { bgcolor: "#FF5C93", height: 3, borderRadius: "3px 3px 0 0" },
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, minHeight: 48 },
            "& .Mui-selected": { color: "#FF5C93 !important" },
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.label}
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>{tab.label}</span>
                  <Chip
                    size="small"
                    label={tab.total}
                    sx={{ bgcolor: tab.color, color: "#fff", fontWeight: 700, height: 20, fontSize: "0.7rem" }}
                  />
                </Stack>
              }
            />
          ))}
        </Tabs>
      </Stack>

      {/* Tabla */}
      <Box sx={{ height: 3 }}>{loading && <LinearProgress sx={{ bgcolor: "#FFE6F0", "& .MuiLinearProgress-bar": { bgcolor: "#FF5C93" } }} />}</Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={headCellSx}>ID</TableCell>
              <TableCell sx={headCellSx}>Cliente</TableCell>
              <TableCell sx={{ ...headCellSx, display: { xs: "none", sm: "table-cell" } }}>Email</TableCell>
              <TableCell sx={headCellSx} align="right">Estado</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ border: 0 }}>
                  <Stack alignItems="center" spacing={1} sx={{ py: 8, color: "#9e9e9e" }}>
                    <InboxOutlinedIcon sx={{ fontSize: 56, color: "#e0e0e0" }} />
                    <Typography variant="subtitle1" color="text.secondary">
                      {loading ? "Cargando suscripciones..." : "No hay suscripciones"}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((subscription) => (
                <TableRow
                  key={subscription.id}
                  hover
                  sx={{ "&:hover": { bgcolor: "#FFF9FC !important" }, "&:last-child td": { border: 0 } }}
                >
                  <TableCell sx={{ color: "#757575", fontWeight: 600 }}>#{subscription.id}</TableCell>

                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ bgcolor: "#FFE6F0", color: "#FF5C93", width: 36, height: 36, fontSize: "0.85rem", fontWeight: 700 }}>
                        {getInitials(subscription.User?.name)}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {subscription.User?.name || "-"}
                        </Typography>
                        {/* En móvil el email se muestra debajo del nombre */}
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: { xs: "block", sm: "none" }, maxWidth: 180 }}>
                          {subscription.User?.email || "-"}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" }, color: "text.secondary" }}>
                    {subscription.User?.email || "-"}
                  </TableCell>

                  <TableCell align="right">
                    <Chip
                      size="small"
                      icon={React.cloneElement(status.icon, { sx: { fontSize: 16, color: `${status.color} !important` } })}
                      label={status.label}
                      sx={{ color: status.color, bgcolor: status.bg, border: `1px solid ${status.color}`, fontWeight: 700 }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={pagination?.totalItems || 0}
        page={page}
        rowsPerPage={ROWS_PER_PAGE}
        rowsPerPageOptions={[]}
        onPageChange={(_, newPage) =>
          isActiveTab
            ? setPageActive(newPage)
            : setPagePastDue(newPage)
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

    </Paper>
  );
}