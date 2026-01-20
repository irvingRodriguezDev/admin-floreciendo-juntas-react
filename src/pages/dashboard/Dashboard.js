import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Grid,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  Avatar,
} from "@mui/material";
import EventContext from "../../context/EventContext/EventContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend,
} from "recharts";
import top1Image from "../../assets/images/top1.png";
import {
  EmojiEvents,
  TrendingUp,
  ConfirmationNumber,
  MonetizationOn,
} from "@mui/icons-material";

const medalColors = ["#FF85C0", "#FF69B4", "#FFB6D9"];
const gradientColors = [
  "linear-gradient(135deg, #FF85C0 0%, #FFB6D9 100%)",
  "linear-gradient(135deg, #FF69B4 0%, #FF85C0 100%)",
  "linear-gradient(135deg, #FFB6D9 0%, #FFE6F0 100%)",
];

export default function Dashboard() {
  const { boletosMasVendidos, obtenerBoletosMasVendidos, cargando } =
    useContext(EventContext);

  useEffect(() => {
    obtenerBoletosMasVendidos();
  }, []);

  const sortedEvents = useMemo(() => {
    if (!Array.isArray(boletosMasVendidos)) return [];
    return [...boletosMasVendidos].sort(
      (a, b) => (b.tickets_sold ?? 0) - (a.tickets_sold ?? 0)
    );
  }, [boletosMasVendidos]);

  const totalTickets = useMemo(() => {
    return sortedEvents.reduce((sum, event) => sum + (event.tickets_sold ?? 0), 0);
  }, [sortedEvents]);

  if (cargando) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        gap={2}
      >
        <CircularProgress size={60} sx={{ color: "#FF69B4" }} />
        <Typography variant="h6" color="text.secondary">
          Cargando estadísticas...
        </Typography>
      </Box>
    );
  }

  if (!sortedEvents.length) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
        gap={2}
      >
        <ConfirmationNumber sx={{ fontSize: 80, color: "#FFB6D9" }} />
        <Typography variant="h5" color="text.secondary" fontWeight="500">
          No hay datos disponibles
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Aún no se han vendido boletos para eventos
        </Typography>
      </Box>
    );
  }

  const topThree = sortedEvents.slice(0, 3);

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      {/* Header con estadísticas generales */}
      <Box mb={5}>
        <Typography
          variant="h4"
          fontWeight="700"
          sx={{
            background: "linear-gradient(135deg, #FF69B4 0%, #FF85C0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 3,
            textAlign: "center",
          }}
        >
          🌸 Dashboard de Eventos
        </Typography>

        <Grid 
          container 
          spacing={3} mb={4}
          justifyContent="center" // centra horizontalmente
          alignItems="center"     // centra verticalmente (opcional)
>
          {/* <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                background: gradientColors[0],
                color: "#fff",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "150px",
                  height: "150px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "50%",
                  transform: "translate(50%, -50%)",
                },
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.3)",
                    width: 56,
                    height: 56,
                  }}
                >
                  <MonetizationOn />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="700">
                    {totalTickets}$100000
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total de Dinero Acumulado
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid> */}

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                background: gradientColors[1],
                color: "#fff",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "150px",
                  height: "150px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "50%",
                  transform: "translate(50%, -50%)",
                },
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.3)",
                    width: 56,
                    height: 56,
                  }}
                >
                  <EmojiEvents />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="700">
                    {sortedEvents.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Eventos Activos
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                background: gradientColors[2],
                color: "#333",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "150px",
                  height: "150px",
                  background: "rgba(255,105,180,0.1)",
                  borderRadius: "50%",
                  transform: "translate(50%, -50%)",
                },
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{
                    bgcolor: "#FF69B4",
                    width: 56,
                    height: 56,
                  }}
                >
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="700">
                    {topThree[0]?.tickets_sold || 0}$50000
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total en comisiones
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid> */}
        </Grid>
      </Box>

      {/* Podio de eventos */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          p: 4,
          mb: 4,
          background: "linear-gradient(135deg, #FFE5F4 0%, #FFD6EC 100%)",
          border: "1px solid #FFC9E5",
          boxShadow: "0 2px 12px rgba(255, 192, 229, 0.15)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            width: "150px",
            height: "150px",
            background: "rgba(255,105,180,0.1)",
            borderRadius: "50%",
            transform: "translate(50%, -50%)",
          },
        }}
      >
        <Box textAlign="center" mb={4}>
          <Typography variant="h5" fontWeight="700" color="#FF69B4" mb={1}>
            🏆 Top 3 Eventos Con Más Boletos Vendidos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Los eventos con mejor desempeño este periodo
          </Typography>
        </Box>
        <br></br>

        <Grid
          container
          spacing={3}
          justifyContent="center"
          alignItems="flex-end"
        >
          {/* Top 2 */}
          {topThree[1] && (
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={4}
                sx={{
                  borderRadius: 4,
                  p: 2,
                  textAlign: "center",
                  background: "#fff",
                  border: `3px solid ${medalColors[0]}`,
                  height: 270,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.3s ease",
                  position: "relative",
                  "&:hover": {
                    transform: "translateY(-10px)",
                    boxShadow: `0 12px 24px ${medalColors[0]}40`,
                  },
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: medalColors[0],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "1.8rem",
                    color: "#fff",
                    boxShadow: `0 4px 12px ${medalColors[0]}60`,
                  }}
                >
                  2
                </Box>

                <Box mt={5}>
                  <Chip
                    label="Segundo Lugar"
                    size="small"
                    sx={{
                      bgcolor: `${medalColors[0]}20`,
                      color: medalColors[0],
                      fontWeight: "600",
                      mb: 2,
                    }}
                  />
                  <Typography variant="h6" fontWeight="700" mb={1}>
                    {topThree[1].title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {topThree[1].location || "Sin ubicación"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box
                    sx={{
                      bgcolor: `${medalColors[0]}10`,
                      borderRadius: 2,
                      p: 2,
                      flex: 1,
                    }}
                  >
                    <Typography variant="h4" fontWeight="700" color={medalColors[0]}>
                      {topThree[1].tickets_sold}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      boletos vendidos
                    </Typography>
                  </Box>

                  {/* <Box
                    sx={{
                      bgcolor: `${medalColors[0]}10`,
                      borderRadius: 2,
                      p: 2,
                      flex: 1,
                    }}
                  >
                    <Typography variant="h4" fontWeight="700" color={medalColors[0]}>
                      {topThree[1].tickets_sold}$15000
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Dinero Generado
                    </Typography>
                  </Box> */}
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Top 1 */}
          {topThree[0] && (
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={8}
                sx={{
                  borderRadius: 4,
                  p: 2,
                  textAlign: "center",
                  background: "#fff",
                  border: `3px solid ${medalColors[1]}`,
                  height: 325,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.3s ease",
                  position: "relative",
                  "&:hover": {
                    transform: "translateY(-15px)",
                    boxShadow: `0 16px 32px ${medalColors[1]}50`,
                  },
                }}
              >
                <Box
                  component="img"
                  src={top1Image}
                  alt="Top 1"
                  sx={{
                    position: "absolute",
                    top: -74,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: { xs: 140, sm: 140 },
                    zIndex: 2,
                    filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
                  }}
                />

                <Box
                  sx={{
                    position: "absolute",
                    top: -36,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    background: medalColors[1],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "2.2rem",
                    color: "#fff",
                    boxShadow: `0 6px 16px ${medalColors[1]}60`,
                    zIndex: 1,
                  }}
                >
                  1
                </Box>

                <Box mt={7}>
                  <Chip
                    label="🌸 Primer Lugar"
                    sx={{
                      bgcolor: `${medalColors[1]}20`,
                      color: medalColors[1],
                      fontWeight: "700",
                      mb: 2,
                      fontSize: "0.85rem",
                    }}
                  />
                  <Typography variant="h5" fontWeight="700" mb={1}>
                    {topThree[0].title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {topThree[0].location || "Sin ubicación"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box
                    sx={{
                      bgcolor: `${medalColors[1]}15`,
                      borderRadius: 2,
                      p: 2,
                      flex: 1, // Para que ocupen el mismo ancho
                    }}
                  >
                    <Typography variant="h4" fontWeight="700" color={medalColors[1]}>
                      {topThree[0].tickets_sold}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      boletos vendidos
                    </Typography>
                  </Box>

                  {/* <Box
                    sx={{
                      bgcolor: `${medalColors[1]}15`,
                      borderRadius: 2,
                      p: 2,
                      flex: 1,
                    }}
                  >
                    <Typography variant="h4" fontWeight="700" color={medalColors[1]}>
                      {topThree[0].tickets_sold}$20000
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Dinero Generado
                    </Typography>
                  </Box> */}
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Top 3 */}
          {topThree[2] && (
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={4}
                sx={{
                  borderRadius: 4,
                  p: 2,
                  textAlign: "center",
                  background: "#fff",
                  border: `3px solid ${medalColors[0]}`,
                  height: 270,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.3s ease",
                  position: "relative",
                  "&:hover": {
                    transform: "translateY(-10px)",
                    boxShadow: `0 12px 24px ${medalColors[0]}40`,
                  },
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: medalColors[0],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "1.8rem",
                    color: "#fff",
                    boxShadow: `0 4px 12px ${medalColors[0]}60`,
                  }}
                >
                  3
                </Box>

                <Box mt={5}>
                  <Chip
                    label="Tercer Lugar"
                    size="small"
                    sx={{
                      bgcolor: `${medalColors[0]}20`,
                      color: medalColors[0],
                      fontWeight: "600",
                      mb: 2,
                    }}
                  />
                  <Typography variant="h6" fontWeight="700" mb={1}>
                    {topThree[2].title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {topThree[2].location || "Sin ubicación"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box
                    sx={{
                      bgcolor: `${medalColors[0]}10`,
                      borderRadius: 2,
                      p: 2,
                      flex: 1,
                    }}
                  >
                    <Typography variant="h4" fontWeight="700" color={medalColors[0]}>
                      {topThree[2].tickets_sold}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      boletos vendidos
                    </Typography>
                  </Box>

                  {/* <Box
                    sx={{
                      bgcolor: `${medalColors[0]}10`,
                      borderRadius: 2,
                      p: 2,
                      flex: 1,
                    }}
                  >
                    <Typography variant="h4" fontWeight="700" color={medalColors[0]}>
                      {topThree[2].tickets_sold}$10000
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Dinero Generado
                    </Typography>
                  </Box> */}
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Gráfica mejorada */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          p: 4,
          mb: 4,
          border: "1px solid #FFD9E8",
          background: "linear-gradient(180deg, #FFF7FB 0%, #FFFFFF 100%)",
          boxShadow: "0 8px 24px rgba(255,105,180,0.08)",
        }}
      >
        {/* HEADER */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar
            sx={{
              bgcolor: "#FF69B4",
              width: 48,
              height: 48,
              boxShadow: "0 4px 12px rgba(255,105,180,0.35)",
            }}
          >
            <TrendingUp />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="800" color="#FF4081">
              📊 Análisis de Ventas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comparativa de boletos vendidos por evento
            </Typography>
          </Box>
        </Box>

        {/* CHART */}
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={sortedEvents}
            margin={{ top: 20, right: 30, left: 10, bottom: 70 }}
          >
            {/* GRADIENTS */}
            <defs>
              {sortedEvents.map((_, index) => (
                <linearGradient
                  key={`grad-${index}`}
                  id={`grad-${index}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={medalColors[index]} stopOpacity={1} />
                  <stop offset="100%" stopColor={medalColors[index]} stopOpacity={0.4} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#FFE3EF"
              vertical={false}
            />

            <XAxis
              dataKey="title"
              tick={{ fontSize: 10, fill: "#444", fontWeight: 500 }}
              angle={-25}
              textAnchor="end"
              interval={0}
              height={60}
            />

            <YAxis
              tick={{ fontSize: 12, fill: "#444" }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              cursor={{ fill: "rgba(255,105,180,0.05)" }}
              contentStyle={{
                background: "#FFFFFF",
                borderRadius: 12,
                border: "1px solid #FFB3D4",
                boxShadow: "0 4px 18px rgba(255,105,180,0.18)",
                padding: 12,
              }}
              labelStyle={{ fontWeight: 600, color: "#FF4FA3" }}
            />

            {/* <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
            /> */}

            <Bar
              dataKey="tickets_sold"
              name="Boletos vendidos"
              radius={[10, 10, 0, 0]}
              animationDuration={1200}
            >
              {sortedEvents.map((_, index) => (
                <Cell key={`cell-${index}`} fill={`url(#grad-${index})`} />
              ))}
            </Bar>

            {/* LABELS SOBRE LAS BARRAS */}
            <Bar
              dataKey="tickets_sold"
              fill="transparent"
              label={{
                position: "top",
                fill: "#FF4081",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </Paper>


      {/* Tabla mejorada */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid #FFE6F0",
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(135deg, #FF69B4 0%, #FF85C0 100%)",
            p: 3,
            color: "#fff",
          }}
        >
          <Typography variant="h6" fontWeight="700">
            🏅 Ranking Completo de Eventos
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            Clasificación de todos los eventos por boletos vendidos
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#FFF5FA" }}>
                <TableCell sx={{ fontWeight: "700", color: "#FF69B4" }}>
                  Posición
                </TableCell>
                <TableCell sx={{ fontWeight: "700", color: "#FF69B4" }}>
                  Evento
                </TableCell>
                {/* <TableCell
                  align="right"
                  sx={{ fontWeight: "700", color: "#FF69B4" }}
                >
                  Efectivo
                </TableCell> */}
                <TableCell
                  align="right"
                  sx={{ fontWeight: "700", color: "#FF69B4" }}
                >
                  Boletos Vendidos
                </TableCell>
                {/* <TableCell
                  align="right"
                  sx={{ fontWeight: "700", color: "#FF69B4" }}
                >
                  Porcentaje
                </TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedEvents.map((event, index) => (
                <TableRow
                  key={event.id}
                  sx={{
                    "&:hover": {
                      bgcolor: "#FFF5FA",
                      transition: "all 0.2s",
                    },
                    bgcolor: index < 3 ? `${medalColors[index]}08` : "transparent",
                  }}
                >
                  <TableCell>
                    {index < 3 ? (
                      <Chip
                        label={index + 1}
                        sx={{
                          bgcolor: medalColors[index],
                          color: "#fff",
                          fontWeight: "700",
                          width: 36,
                          height: 36,
                          fontSize: "1rem",
                        }}
                      />
                    ) : (
                      <Typography fontWeight="600" color="text.secondary">
                        {index + 1}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography
                      fontWeight={index < 3 ? "700" : "500"}
                      color={index < 3 ? medalColors[index] : "text.primary"}
                    >
                      {event.title}
                    </Typography>
                    {event.location && (
                      <Typography variant="caption" color="text.secondary">
                        📍 {event.location}
                      </Typography>
                    )}
                  </TableCell>
                  {/* <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight="600"
                      color={index < 3 ? medalColors[index] : "text.secondary"}
                    >
                      {((event.tickets_sold / totalTickets) * 100).toFixed(1)}%$20000
                    </Typography>
                  </TableCell> */}
                  <TableCell align="right">
                    <Chip
                      label={event.tickets_sold}
                      size="small"
                      sx={{
                        fontWeight: "700",
                        bgcolor: index < 3 ? `${medalColors[index]}20` : "#FFE6F0",
                        color: index < 3 ? medalColors[index] : "#FF69B4",
                      }}
                    />
                  </TableCell>
                  {/* <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight="600"
                      color={index < 3 ? medalColors[index] : "text.secondary"}
                    >
                      {((event.tickets_sold / totalTickets) * 100).toFixed(1)}%
                    </Typography>
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}