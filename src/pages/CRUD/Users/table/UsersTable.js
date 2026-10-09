import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import VerifiedIcon from '@mui/icons-material/Verified';

import UserContext from '../../../../context/UserContext/UserContext';

const ROWS_PER_PAGE = 7;
const PINK = '#FF5C93';

const COLUMNS = [
  { label: 'Usuario' },
  { label: 'Teléfono', hideOnXs: true },
  { label: 'E-Mail', hideOnXs: true },
  { label: 'Suscripción', align: 'center' },
];

const headCellSx = {
  bgcolor: '#FFF5FA',
  color: '#757575',
  fontWeight: 700,
  fontSize: '0.8rem',
  borderBottom: '1px solid #FFE6F0',
};

const hideOnXs = { display: { xs: 'none', sm: 'table-cell' } };

// Administradores (1) y rol 5 no tienen suscripción
const getSubscription = (user) => {
  if (user.roleId === 1 || user.roleId === 5) {
    return { label: 'No aplica', color: '#666', bg: '#F5F5F5', border: '#E0E0E0' };
  }
  return user?.Subscriptions?.[0]?.status === 'active'
    ? { label: 'Activa', color: '#28a745', bg: '#EAFCDD', border: '#28a745' }
    : { label: 'Inactiva', color: '#dc3545', bg: '#FEF4F6', border: '#dc3545' };
};

const UsersTable = () => {
  const history = useHistory();
  const { users = [], loading, getUsers } = useContext(UserContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    getUsers();
  }, []);

  const displayRows = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    const q = searchTerm.trim().toLowerCase();
    if (!q) return list;
    return list.filter((u) =>
      [u.name, u.email, u.phone].some((v) => v?.toLowerCase().includes(q))
    );
  }, [users, searchTerm]);

  const currentRows = useMemo(
    () => displayRows.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE),
    [displayRows, page]
  );

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(0);
  };

  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #FFE6F0', boxShadow: '0 8px 24px rgba(255,92,147,0.08)' }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #FF5C93 0%, #E94E88 100%)',
          p: { xs: 2.5, sm: 3 },
          color: '#fff',
          display: 'flex',
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', width: 48, height: 48 }}>
            <GroupIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>Lista de Usuarios</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {loading ? 'Cargando usuarios...' : `${displayRows.length} usuario${displayRows.length !== 1 ? 's' : ''} registrado${displayRows.length !== 1 ? 's' : ''}`}
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
          <TextField
            size="small"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{
              minWidth: { sm: 320 },
              bgcolor: '#fff',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: '#FFD6EA' },
                '&:hover fieldset, &.Mui-focused fieldset': { borderColor: PINK },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: PINK }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => handleSearch('')} sx={{ color: PINK }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => history.push('/users/useradd')}
            sx={{
              bgcolor: '#fff', color: PINK, fontWeight: 700, borderRadius: 2, whiteSpace: 'nowrap', boxShadow: 'none',
              '&:hover': { bgcolor: '#FFF5FA', boxShadow: 'none' },
            }}
          >
            Agregar Usuario
          </Button>
        </Stack>
      </Box>

      {/* Tabla */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableCell key={col.label} align={col.align} sx={{ ...headCellSx, ...(col.hideOnXs && hideOnXs) }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Skeleton variant="circular" width={44} height={44} />
                      <Skeleton width={140} />
                    </Stack>
                  </TableCell>
                  <TableCell sx={hideOnXs}><Skeleton width={100} /></TableCell>
                  <TableCell sx={hideOnXs}><Skeleton width={180} /></TableCell>
                  <TableCell align="center"><Skeleton width={70} sx={{ mx: 'auto' }} /></TableCell>
                </TableRow>
              ))
            ) : currentRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} sx={{ border: 0 }}>
                  <Stack alignItems="center" spacing={1.5} sx={{ py: 7 }}>
                    <Avatar sx={{ bgcolor: '#FFF0F7', width: 72, height: 72 }}>
                      <SearchOffIcon sx={{ fontSize: 38, color: '#FFB3DC' }} />
                    </Avatar>
                    <Typography color="text.secondary">No se encontraron resultados</Typography>
                    {searchTerm && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleSearch('')}
                        sx={{ borderColor: PINK, color: PINK, borderRadius: 2, '&:hover': { borderColor: '#FF5A8C', bgcolor: '#FFF5FA' } }}
                      >
                        Limpiar búsqueda
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              currentRows.map((user) => {
                const sub = getSubscription(user);
                return (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{ '&:hover': { bgcolor: '#FFF9FC !important' }, '&:last-child td': { border: 0 } }}
                  >
                    {/* Avatar + nombre (en móvil muestra también el correo) */}
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar
                          src={user.profileImageUrl || undefined}
                          alt={user.name || 'Usuario'}
                          sx={{
                            width: 44, height: 44, fontWeight: 700, color: '#fff',
                            background: 'linear-gradient(135deg, #FF5C93 0%, #FF8AB4 100%)',
                            boxShadow: '0 4px 12px rgba(255,92,147,0.3)',
                          }}
                        >
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </Avatar>

                        <Box sx={{ minWidth: 0 }}>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Typography fontWeight={600}>{user.name}</Typography>
                            {user.roleId === 1 && (
                              <Tooltip title="Administrador" arrow>
                                <VerifiedIcon sx={{ color: PINK, fontSize: 20 }} />
                              </Tooltip>
                            )}
                          </Stack>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: { xs: 'block', sm: 'none' }, maxWidth: 180 }}>
                            {user.email || 'Sin correo'}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ ...hideOnXs, color: 'text.secondary' }}>{user.phone || 'Sin teléfono'}</TableCell>
                    <TableCell sx={{ ...hideOnXs, color: 'text.secondary' }}>{user.email || 'Sin correo'}</TableCell>

                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={sub.label}
                        sx={{ fontWeight: 700, color: sub.color, bgcolor: sub.bg, border: `1px solid ${sub.border}` }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      {!loading && displayRows.length > 0 && (
        <TablePagination
          component="div"
          count={displayRows.length}
          page={page}
          rowsPerPage={ROWS_PER_PAGE}
          rowsPerPageOptions={[]}
          onPageChange={(_, newPage) => setPage(newPage)}
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
    </Paper>
  );
};

export default UsersTable;