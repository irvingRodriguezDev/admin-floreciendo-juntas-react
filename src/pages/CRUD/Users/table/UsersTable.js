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
  IconButton,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
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
    padding: 24,
    marginBottom: 24,
    borderRadius: 16,
    background: 'linear-gradient(135deg, #FFEEF8 0%, #FFE0F0 100%)',
    border: '1px solid #FFD6EA',
    boxShadow: '0 4px 20px rgba(255, 105, 180, 0.12)',
  },
  filterHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
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
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [rowsState, setRowsState] = useState({
    page: 0,
    pageSize: 7,
  });

  const filters = [
    { label: 'Nombre', title: 'name' },
    { label: 'Teléfono', title: 'phone' },
    { label: 'E-Mail', title: 'email' },
  ];

  useEffect(() => {
    getUsers();
  }, []);

  // ARREGLADO: Ahora primero filtra por búsqueda, luego por filtros avanzados
  const displayRows = useMemo(() => {
    let filtered = users;

    // Filtro de búsqueda global
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((row) => {
        const email = row.email?.toLowerCase() || '';
        const phone = row.phone?.toLowerCase() || '';
        const name = row.name?.toLowerCase() || '';
        return email.includes(search) || phone.includes(search) || name.includes(search);
      });
    }

    // Filtros avanzados (si existen)
    if (filterItems.length > 0) {
      filtered = filtered.filter((row) =>
        filterItems.every((filter) => {
          const field = filter.fields.selectedField;
          const value = filter.fields.filterValue.toLowerCase();
          return row[field]?.toLowerCase().includes(value);
        })
      );
    }

    return filtered;
  }, [filterItems, users, searchTerm]);

  const handleChange = (id) => (e) => {
    const { name, value } = e.target;
    setFilterItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, fields: { ...item.fields, [name]: value } } : item
      )
    );
  };

  const handleReset = () => {
    setFilterItems([]);
    setShowFilters(false);
  };

  const addFilter = () => {
    const newItem = {
      id: uniqueId(),
      fields: {
        selectedField: filters[0].title,
        filterValue: '',
      },
    };
    setFilterItems([...filterItems, newItem]);
    setShowFilters(true);
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

  const NoRowsOverlay = () => (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
      gap={2}
    >
      <SearchIcon sx={{ fontSize: 48, color: '#FFB3DC' }} />
      <Typography variant="body1" color="text.secondary">
        No se encontraron resultados
      </Typography>
    </Box>
  );

  return (
    <Box>
      <Widget disableWidgetMenu>
        {/* FILTROS */}
        {filterItems.length > 0 && (
          <Fade in={showFilters || filterItems.length > 0}>
            <Paper className={classes.filterContainer}>
              <Box className={classes.filterHeader}>
                <FilterAltIcon sx={{ color: '#FF69B4', fontSize: 24 }} />
                <Typography variant="h6" fontWeight="700" sx={{ color: '#FF69B4' }}>
                  Filtros Activos
                </Typography>
              </Box>

              {filterItems.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    backgroundColor: '#fff',
                    borderRadius: 3,
                    p: 2,
                    mb: 2,
                    boxShadow: '0 2px 8px rgba(255, 182, 217, 0.15)',
                  }}
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Campo</InputLabel>
                        <Select
                          label="Campo"
                          name="selectedField"
                          value={item.fields.selectedField}
                          onChange={handleChange(item.id)}
                          sx={{
                            borderRadius: 2,
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#FFD6EA',
                            },
                          }}
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
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '& fieldset': {
                              borderColor: '#FFD6EA',
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={12} md={2}>
                      <IconButton
                        onClick={() => deleteFilter(item.id)}
                        sx={{
                          color: '#FF6B9D',
                          backgroundColor: '#FFF0F5',
                          '&:hover': {
                            backgroundColor: '#FFE1EE',
                          },
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #FF6B9D 0%, #C969E0 100%)',
                    color: '#fff',
                    fontWeight: '600',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(255, 107, 157, 0.3)',
                  }}
                >
                  Aplicar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ClearAllIcon />}
                  onClick={handleReset}
                  sx={{
                    borderColor: '#FF6B9D',
                    color: '#FF6B9D',
                    fontWeight: '600',
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: '#FF5A8C',
                      backgroundColor: '#FFF5FA',
                    },
                  }}
                >
                  Limpiar Todo
                </Button>
              </Stack>
            </Paper>
          </Fade>
        )}

        {/* TABLA CON ESTILO DASHBOARD */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid #FFE6F0',
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #FF5C93)',
              p: 3,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 3,
              flexWrap: 'wrap',
            }}
          >
            {/* TÍTULO */}
            <Box>
              <Typography variant="h6" fontWeight="700">
                Lista de Usuarios
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Gestión completa de usuarios registrados
              </Typography>
            </Box>

            {/* BUSCADOR */}
            <TextField
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setRowsState((prev) => ({ ...prev, page: 0 }));
              }}
              variant="outlined"
              size="small"
              sx={{
                minWidth: 300,
                maxWidth: 400,
                backgroundColor: '#fff',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#FFD6EA' },
                  '&:hover fieldset': { borderColor: '#FF69B4' },
                  '&.Mui-focused fieldset': { borderColor: '#FF69B4' },
                },
              }}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ color: '#FF69B4', mr: 1 }} />
                ),
                endAdornment: searchTerm && (
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm('')}
                    sx={{ color: '#FF6B9D' }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                ),
              }}
            />
          </Box>

          {/* CONTADOR DE RESULTADOS */}
          {searchTerm && (
            <Box sx={{ px: 3, py: 1.5, bgcolor: '#FFF5FA', borderBottom: '1px solid #FFE6F0' }}>
              <Typography variant="caption" color="text.secondary">
                🔍 Mostrando {displayRows.length} resultado{displayRows.length !== 1 ? 's' : ''} para "{searchTerm}"
              </Typography>
            </Box>
          )}

          {loading ? (
            <Box sx={{ p: 4 }}>
              <LinearProgress sx={{
                backgroundColor: '#FFE6F0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#FF69B4',
                }
              }} />
            </Box>
          ) : displayRows.length === 0 ? (
            <NoRowsOverlay />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#FFF5FA' }}>
                    <TableCell sx={{ fontWeight: '700', color: '#FF69B4' }}>
                      Avatar
                    </TableCell>
                    <TableCell sx={{ fontWeight: '700', color: '#FF69B4' }}>
                      Nombre
                    </TableCell>
                    <TableCell sx={{ fontWeight: '700', color: '#FF69B4' }}>
                      Teléfono
                    </TableCell>
                    <TableCell sx={{ fontWeight: '700', color: '#FF69B4' }}>
                      E-Mail
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: '700', color: '#FF69B4' }}
                    >
                      Suscripción
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayRows
                    .slice(
                      rowsState.page * rowsState.pageSize,
                      rowsState.page * rowsState.pageSize + rowsState.pageSize
                    )
                    .map((user, index) => (
                      <TableRow
                        key={user.id}
                        sx={{
                          '&:hover': {
                            bgcolor: '#FFF5FA',
                            transition: 'all 0.2s',
                          },
                        }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '50%',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'linear-gradient(135deg, #FF5723 0%, #FF8A60 100%)',
                              color: '#fff',
                              fontWeight: 'bold',
                              fontSize: 18,
                              boxShadow: '0 4px 12px rgba(255, 87, 35, 0.3)',
                            }}
                          >
                            {user.profileImageUrl ? (
                              <img
                                src={user.profileImageUrl}
                                alt={user.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  e.target.parentNode.textContent =
                                    user.name?.[0]?.toUpperCase() || '?';
                                }}
                              />
                            ) : (
                              user.name?.[0]?.toUpperCase() || '?'
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="600" color="text.primary">
                            {user.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {user.phone || 'Sin teléfono'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {user.roleId === 5 || user.roleId === 1 ? (
                            <Chip
                              label="No aplica"
                              size="small"
                              sx={{
                                fontWeight: '600',
                                color: '#666',
                                backgroundColor: '#f5f5f5',
                                border: '1px solid #e0e0e0',
                              }}
                            />
                          ) : (
                            <Chip
                              label={user.isSubscribed ? 'Activa' : 'Inactiva'}
                              size="small"
                              sx={{
                                fontWeight: '600',
                                color: '#fff',
                                background: user.isSubscribed
                                  ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
                                  : 'linear-gradient(135deg, #FF6B9D 0%, #FF8AB4 100%)',
                                boxShadow: user.isSubscribed
                                  ? '0 2px 8px rgba(76, 175, 80, 0.3)'
                                  : '0 2px 8px rgba(255, 107, 157, 0.3)',
                              }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* PAGINACIÓN MANUAL */}
          {!loading && displayRows.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                bgcolor: '#FFF5FA',
                borderTop: '1px solid #FFE6F0',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Mostrando {rowsState.page * rowsState.pageSize + 1} -{' '}
                {Math.min(
                  (rowsState.page + 1) * rowsState.pageSize,
                  displayRows.length
                )}{' '}
                de {displayRows.length}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  disabled={rowsState.page === 0}
                  onClick={() => setRowsState((prev) => ({ ...prev, page: prev.page - 1 }))}
                  sx={{
                    color: '#FF69B4',
                    '&:disabled': { color: '#ccc' },
                  }}
                >
                  Anterior
                </Button>
                <Button
                  size="small"
                  disabled={
                    (rowsState.page + 1) * rowsState.pageSize >= displayRows.length
                  }
                  onClick={() => setRowsState((prev) => ({ ...prev, page: prev.page + 1 }))}
                  sx={{
                    color: '#FF69B4',
                    '&:disabled': { color: '#ccc' },
                  }}
                >
                  Siguiente
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
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