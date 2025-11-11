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
} from "recharts";
import top1Image from "../../assets/images/top1.png";

const medalColors = ["#FF85C0", "#FF69B4", "#FFB6D9"]; // Top 2,1,3 colores rosas

export default function Dashboard() {
  const { eventos, obtenerEventos, cargando } = useContext(EventContext);
  const [showChart, setShowChart] = useState(true);

  useEffect(() => {
    obtenerEventos();
  }, []);

  const sortedEvents = useMemo(() => {
    if (!Array.isArray(eventos)) return [];
    return [...eventos].sort(
      (a, b) => (b.availableTickets ?? 0) - (a.availableTickets ?? 0)
    );
  }, [eventos]);

  if (cargando) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" mt={6}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const topThree = sortedEvents.slice(0, 3);

  return (
    <Box mt={4}>
      {/* Top 3 estilo podio */}
      <Typography
        variant="h5"
        fontWeight="bold"
        color="primary"
        mb={2}
        textAlign="center"
      >
        🌸 Podio de Eventos con Más boletos Vendidos
      </Typography>

      <Grid container spacing={2} justifyContent="center" alignItems="flex-end" mb={4}>
        {/* Top 2 */}
        {topThree[1] && (
          <Grid item xs={12} sm={3}>
            <Paper
              elevation={8}
              sx={{
                borderRadius: 3,
                p: 2,
                textAlign: "center",
                background: `linear-gradient(135deg, ${medalColors[0]} 0%, #fff 100%)`,
                color: "#333",
                height: 200,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  margin: "0 auto 5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "1.3rem",
                  color: medalColors[0],
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                }}
              >
                2
              </Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {topThree[1].title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {topThree[1].location || "Sin ubicación"}
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                color={medalColors[0]}
              >
                {topThree[1].availableTickets} boletos
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Top 1 */}
        {topThree[0] && (
          <Grid item xs={12} sm={3}>
            <Paper
              elevation={10}
              sx={{
                borderRadius: 3,
                p: 2,
                textAlign: "center",
                background: `linear-gradient(135deg, ${medalColors[1]} 0%, #fff 100%)`,
                color: "#333",
                height: 250,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
                position: "relative",
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.1)" },
              }}
            >
              {/* Imagen decorativa top1.png detrás del número */}
              <Box
                component="img"
                src={top1Image}
                alt="Corona Top 1"
                sx={{
                  width: 155,
                  height: 155,
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 1, // detrás del número
                }}
              />

              {/* Círculo con número 1 de frente */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  margin: "0 auto 5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  top: -28,
                  fontSize: "1.5rem",
                  color: medalColors[1],
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  position: "relative",
                  zIndex: 0, // por encima de la imagen
                }}
              >
                1
              </Box>

              <Typography variant="h6" fontWeight="bold">
                {topThree[0].title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {topThree[0].location || "Sin ubicación"}
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                color={medalColors[1]}
              >
                {topThree[0].availableTickets} boletos
              </Typography>
            </Paper>
          </Grid>
        )}


        {/* Top 3 */}
        {topThree[2] && (
          <Grid item xs={12} sm={3}>
            <Paper
              elevation={8}
              sx={{
                borderRadius: 3,
                p: 2,
                textAlign: "center",
                background: `linear-gradient(135deg, ${medalColors[2]} 0%, #fff 100%)`,
                color: "#333",
                height: 180,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  margin: "0 auto 5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "1.3rem",
                  color: medalColors[2],
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                }}
              >
                3
              </Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {topThree[2].title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {topThree[2].location || "Sin ubicación"}
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                color={medalColors[2]}
              >
                {topThree[2].availableTickets} boletos
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Gráfica con todos los eventos */}
      <Paper elevation={4} sx={{ borderRadius: 3, p: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" mb={2} color="primary">
          🌸 Todos los Eventos
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={sortedEvents}
            margin={{ top: 20, right: 30, left: 25, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f5c0e6" />
            <XAxis
              dataKey="title"
              tick={{ fontSize: 12, fill: "#555" }}
              angle={-30}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fontSize: 12, fill: "#555" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: 8,
                border: "1px solid #FF69B4",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            />
            <Bar dataKey="availableTickets">
              {sortedEvents.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={medalColors[index] || "#FF69B4"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Tabla con ranking */}
      {sortedEvents.length > 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#ffe6f0" }}>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Evento</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell align="right">Boletos vendidos</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedEvents.map((event, index) => (
                <TableRow
                  key={event.id}
                  sx={{
                    "&:hover": { backgroundColor: "rgba(255,105,180,0.05)" },
                  }}
                >
                  <TableCell>
                    {index < 3 ? (
                      <Box
                        sx={{
                          display: "inline-block",
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          bgcolor: medalColors[index],
                          color: "#fff",
                          textAlign: "center",
                          lineHeight: "24px",
                          fontWeight: "bold",
                        }}
                      >
                        {index + 1}
                      </Box>
                    ) : (
                      index + 1
                    )}
                  </TableCell>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>{event.location || "Sin ubicación"}</TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: index < 3 ? "bold" : "500",
                      color: index < 3 ? medalColors[index] : "#FF69B4",
                    }}
                  >
                    {event.availableTickets}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
