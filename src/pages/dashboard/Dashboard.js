import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Paper,
  Tab,
  Tabs,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
} from "@mui/material";

import SubscriptionsContext from "../../context/SubscriptionsContext/SubscriptionsContext";
import { SearchIcon } from "lucide-react";

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


  const handleTabChange = (_, value) => {
    setActiveTab(value);
  };

  const subscriptions =
    activeTab === 0
      ? subscriptionsActive
      : subscriptionsPastDue;

  const pagination =
    activeTab === 0
      ? paginationActive
      : paginationPastDue;



  if (loading && !subscriptions.length) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          height: 300,
          alignItems: "center"
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid #FFE6F0"
      }}
    >

      <Box
        sx={{
          background: "linear-gradient(135deg,#FF5C93,#FF69B4)",
          p: 3,
          color: "#fff"
        }}
      >
        <Typography variant="h5">
          <b>Suscripciones</b>
        </Typography>
      </Box>
      <Box
        sx={{
          bgcolor: "#FFF5FA",
          px: 3,
          pt: 2
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
        >
          <Tab
            label={`Activas (${paginationActive?.totalItems || 0})`}
          />
          <Tab
            label={`Vencidas (${paginationPastDue?.totalItems || 0})`}
          />
        </Tabs>
      </Box>


      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    {subscription.id}
                  </TableCell>
                  <TableCell>
                    {subscription.User?.name || "-"}
                  </TableCell>
                  <TableCell>
                    {subscription.User?.email || "-"}
                  </TableCell>
                  <TableCell>
                    {
                      activeTab === 0
                        ?
                        <Chip
                          label="Activa"
                          color="success"
                          variant="outlined"
                          sx={{
                            color: '#28a745',
                            backgroundColor: '#EAFCDD',
                            fontWeight: 'bold',
                          }}
                        />

                        : <Chip
                          label="Vencida"
                          color="error"
                          variant="outlined"
                          sx={{
                            color: '#dc3545',
                            backgroundColor: '#FEF4F6',
                            fontWeight: 'bold',
                          }}
                        />
                    }
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={
          pagination?.totalItems || 0
        }
        page={
          activeTab === 0
            ? pageActive
            : pagePastDue
        }
        rowsPerPage={15}
        rowsPerPageOptions={[15]}
        onPageChange={(event, newPage) => {

          if (activeTab === 0) {
            setPageActive(newPage);
          } else {
            setPagePastDue(newPage);
          }

        }}
      />
    </Paper>
  );
}