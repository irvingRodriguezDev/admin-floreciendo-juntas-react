import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useHistory } from 'react-router';
import { uniqueId } from 'lodash';
import { makeStyles } from '@mui/styles';
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Chip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import Widget from 'components/Widget';
import Actions from 'components/Table/Actions';
import Dialog from 'components/Dialog';
import UserContext from '../../../../context/UserContext/UserContext';

const useStyles = makeStyles(() => ({
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
    '& a': {
      textDecoration: 'none',
      color: '#fff',
    },
  },
  filterContainer: {
    padding: 16,
    marginBottom: 20,
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
}));

const UsersTable = () => {
  const history = useHistory();
  const classes = useStyles();

  const { users, loading, getUsers, deleteUser } = useContext(UserContext);

  const [filterItems, setFilterItems] = useState([]);
  const [sortModel, setSortModel] = useState([]);
  const [selectionModel, setSelectionModel] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const [rowsState, setRowsState] = useState({
    page: 0,
    pageSize: 5,
  });

  const filters = [
    { label: 'Nombre', title: 'name' },
    { label: 'Teléfono', title: 'phone' },
    { label: 'E-Mail', title: 'email' },
  ];

  useEffect(() => {
    getUsers();
  }, []);

  const displayRows = useMemo(() => {
    if (filterItems.length === 0) return users;

    return users.filter((row) =>
      filterItems.every((filter) => {
        const field = filter.fields.selectedField;
        const value = filter.fields.filterValue.toLowerCase();
        return row[field]?.toLowerCase().includes(value);
      })
    );
  }, [filterItems, users]);

  const handleChange = (id) => (e) => {
    const { name, value } = e.target;
    setFilterItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, fields: { ...item.fields, [name]: value } } : item
      )
    );
  };

  const handleReset = () => setFilterItems([]);

  const addFilter = () => {
    const newItem = {
      id: uniqueId(),
      fields: {
        selectedField: filters[0].title,
        filterValue: '',
      },
    };
    setFilterItems([...filterItems, newItem]);
  };

  const deleteFilter = (id) => setFilterItems(filterItems.filter((item) => item.id !== id));

  const openModal = (event, id) => {
    event.stopPropagation();
    setIdToDelete(id);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleDelete = async () => {
    await deleteUser(idToDelete);
    setModalOpen(false);
  };

  const columns = [
    { field: 'name', flex: 1, headerName: 'Nombre' },
    { field: 'phone', flex: 1, headerName: 'Teléfono' },
    { field: 'email', flex: 1.2, headerName: 'E-Mail' },

    {
      field: 'isSubscribed',
      flex: 0.8,
      headerName: 'Suscripción',
      renderCell: (params) => {
        if (params.row.roleId === 5 || params.row.roleId === 1) {
          return (
            <Chip
              label="No aplica"
              color="default"
              size="small"
              sx={{
                fontWeight: 'bold',
                color: '#fff',
                backgroundColor: '#9e9e9e',
              }}
            />
          );
        }

        return (
          <Chip
            label={params.value ? 'Activa' : 'Inactiva'}
            color={params.value ? 'success' : 'secondary'}
            size="small"
            sx={{ fontWeight: 'bold', color: '#fff' }}
          />
        );
      },
    },

    {
      field: 'avatar',
      headerName: 'Avatar',
      sortable: false,
      flex: 0.5,
      renderCell: (params) => {
        const imageUrl = params.row.profileImageUrl;
        return (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FF5723',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 16,
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={params.row.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.parentNode.textContent =
                    params.row.name?.[0]?.toUpperCase() || '?';
                }}
              />
            ) : (
              params.row.name?.[0]?.toUpperCase() || '?'
            )}
          </Box>
        );
      },
    },
  ];

  const NoRowsOverlay = () => (
    <Stack height="100%" alignItems="center" justifyContent="center">
      No se encontraron resultados
    </Stack>
  );

  return (
    <Box>
      <Widget title="Usuarios" disableWidgetMenu>
        {/* FILTROS */}
        {filterItems.length > 0 && (
          <Paper className={classes.filterContainer}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Filtros
            </Typography>

            {filterItems.map((item) => (
              <Grid container alignItems="center" spacing={2} key={item.id} sx={{ mb: 1 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Campo</InputLabel>
                    <Select
                      label="Campo"
                      name="selectedField"
                      value={item.fields.selectedField}
                      onChange={handleChange(item.id)}
                    >
                      {filters.map((f) => (
                        <MenuItem key={f.title} value={f.title}>
                          {f.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    label="Contiene"
                    name="filterValue"
                    size="small"
                    fullWidth
                    value={item.fields.filterValue}
                    onChange={handleChange(item.id)}
                  />
                </Grid>

                <Grid item xs={12} sm={12} md={2}>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={() => deleteFilter(item.id)}
                  >
                    <CloseIcon />
                  </Button>
                </Grid>
              </Grid>
            ))}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button variant="contained">Aplicar</Button>
              <Button
                color="error"
                variant="outlined"
                startIcon={<ClearAllIcon />}
                onClick={handleReset}
              >
                Limpiar
              </Button>
            </Stack>
          </Paper>
        )}

        {/* TABLA - SIEMPRE MOSTRAR TODA LA INFO */}
        <Box
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            backgroundColor: '#fff',
            p: 1.5,
            overflowX: 'auto',    // Permite ver todo con desplazamiento horizontal
            overflowY: 'hidden',
          }}
        >
          <Box sx={{ minWidth: 900 }}>  {/* Nunca oculta columnas */}
            <DataGrid
              autoHeight
              rows={displayRows}
              columns={columns}
              getRowId={(row) => row.id}
              sortingMode="server"
              sortModel={sortModel}
              onSortModelChange={setSortModel}
              rowsPerPageOptions={[5, 10, 20, 50]}
              pageSize={rowsState.pageSize}
              pagination
              paginationMode="client"
              components={{
                NoRowsOverlay,
                LoadingOverlay: LinearProgress,
              }}
              loading={loading}
              onPageChange={(page) =>
                setRowsState((prev) => ({ ...prev, page }))
              }
              onPageSizeChange={(pageSize) =>
                setRowsState((prev) => ({ ...prev, pageSize }))
              }
              onSelectionModelChange={setSelectionModel}
              selectionModel={selectionModel}
              disableSelectionOnClick
              disableColumnMenu
            />
          </Box>
        </Box>
      </Widget>

      {/* MODAL */}
      <Dialog
        open={modalOpen}
        title="Confirmar eliminación"
        contentText="¿Estás seguro de eliminar este usuario?"
        onClose={closeModal}
        onSubmit={handleDelete}
      />
    </Box>
  );
};

export default UsersTable;
