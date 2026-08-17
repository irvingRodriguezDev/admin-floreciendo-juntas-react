import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Menu, MenuItem, Divider, Box } from '@mui/material';
import { useTheme, alpha } from '@mui/material';
import {
  Menu as MenuIcon,
  Person as AccountIcon,
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
  KeyboardArrowDown as ChevronIcon,
} from '@mui/icons-material';
import classNames from 'classnames';
import { deepOrange } from '@mui/material/colors';

// styles
import useStyles from './styles';

// components
import { Typography, Avatar } from '../Wrappers/Wrappers';

// context
import {
  useLayoutState,
  useLayoutDispatch,
  toggleSidebar,
} from '../../context/LayoutContext';
import AuthContext from '../../context/AuthContext/AuthContext';

export default function Header(props) {
  const classes = useStyles();
  const theme = useTheme();

  // global
  const layoutState = useLayoutState();
  const layoutDispatch = useLayoutDispatch();

  // local
  const [profileMenu, setProfileMenu] = useState(null);
  const [isSmall, setSmall] = useState(false);

  // usuario autenticado
  const { usuario, cerrarSesion } = useContext(AuthContext);
  const userName = usuario?.user?.name || 'Usuario';
  const userInitial = userName?.[0]?.toUpperCase();
  const hasAvatarImage = Boolean(usuario?.user?.profileImage);

  const handleLogout = () => {
    setProfileMenu(null);
    cerrarSesion();
    localStorage.removeItem('token');
    props.history.push('/login');
  };

  const handleWindowWidthChange = useCallback(() => {
    const breakpointWidth = theme.breakpoints.values.md;
    setSmall(window.innerWidth < breakpointWidth);
  }, [theme.breakpoints.values.md]);

  // Solo se registra/limpia una vez, no en cada render
  useEffect(() => {
    handleWindowWidthChange();
    window.addEventListener('resize', handleWindowWidthChange);
    return () => window.removeEventListener('resize', handleWindowWidthChange);
  }, [handleWindowWidthChange]);

  const isMenuOpen = Boolean(profileMenu);
  const closeMenu = () => setProfileMenu(null);

  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        {/* Botón de menú: ahora es un botón cuadrado con esquinas suaves, no un icono suelto */}
        <IconButton
          color="inherit"
          aria-label={layoutState.isSidebarOpened ? 'Contraer menú' : 'Abrir menú'}
          onClick={() => toggleSidebar(layoutDispatch)}
          sx={{
            borderRadius: 1.5,
            mr: 1,
            '&:hover': { backgroundColor: alpha('#fff', 0.12) },
          }}
        >
          {(!layoutState.isSidebarOpened && isSmall) ||
          (layoutState.isSidebarOpened && !isSmall) ? (
            <ArrowBackIcon
              classes={{
                root: classNames(classes.headerIcon, classes.headerIconCollapse),
              }}
              sx={{ fontSize: 24 }}
            />
          ) : (
            <MenuIcon
              classes={{
                root: classNames(classes.headerIcon, classes.headerIconCollapse),
              }}
              sx={{ fontSize: 24 }}
            />
          )}
        </IconButton>

        {/* Logo con acento: punto + tipografía espaciada en vez de texto plano */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            // sx={{
            //   width: 8,
            //   height: 8,
            //   borderRadius: '50%',
            //   backgroundColor: '#fff',
            //   flexShrink: 0,
            // }}
          />
          <Typography
            variant="h6"
            weight="medium"
            className={classes.logotype}
            sx={{ margin: '0 !important', letterSpacing: 0.4 }}
          >
            Floreciendo Juntas
          </Typography>
        </Box>

        <div className={classes.grow} />

        {/* Chip de usuario: avatar + nombre + chevron, todo en un solo control */}
        <Box
          component="button"
          onClick={(e) => setProfileMenu(e.currentTarget)}
          aria-label="Abrir menú de perfil"
          aria-controls={isMenuOpen ? 'profile-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={isMenuOpen ? 'true' : undefined}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            border: '1px solid',
            borderColor: alpha('#fff', 0.3),
            backgroundColor: isMenuOpen ? alpha('#fff', 0.14) : 'transparent',
            borderRadius: 999,
            pl: 0.5,
            pr: isSmall ? 0.5 : 1.5,
            py: 0.5,
            cursor: 'pointer',
            transition: '0.2s',
            '&:hover': {
              backgroundColor: alpha('#fff', 0.14),
              borderColor: alpha('#fff', 0.5),
            },
          }}
        >
          <Avatar
            alt={userName}
            src={usuario?.user?.profileImage || ''}
            sx={{
              width: 30,
              height: 30,
              bgcolor: hasAvatarImage ? 'transparent' : deepOrange[500],
              color: '#fff',
              fontSize: 14,
            }}
          >
            {!hasAvatarImage && userInitial}
          </Avatar>

          {/* Nombre visible solo en pantallas medianas o mayores */}
          {!isSmall && (
            <Typography weight="medium" sx={{ color: '#fff', fontSize: 14, lineHeight: 1 }}>
              {userName}
            </Typography>
          )}

          <ChevronIcon
            sx={{
              color: alpha('#fff', 0.8),
              fontSize: 20,
              transition: 'transform 0.2s',
              transform: isMenuOpen ? 'rotate(180deg)' : 'none',
            }}
          />
        </Box>

        <Menu
          id="profile-menu"
          open={isMenuOpen}
          anchorEl={profileMenu}
          onClose={closeMenu}
          MenuListProps={{ 'aria-label': 'Menú de perfil', sx: { p: 1 } }}
          PaperProps={{
            elevation: 6,
            sx: {
              mt: 1.5,
              borderRadius: 3,
              minWidth: 250,
              overflow: 'hidden',
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          {/* Header tipo "tarjeta de identidad" */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.06),
            }}
          >
            <Avatar
              alt={userName}
              src={usuario?.user?.profileImage || ''}
              sx={{
                width: 44,
                height: 44,
                bgcolor: hasAvatarImage ? 'transparent' : deepOrange[500],
                color: '#fff',
              }}
            >
              {!hasAvatarImage && userInitial}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                weight="bold"
                sx={{
                  fontSize: 15,
                  color: theme.palette.text.primary,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {userName}
              </Typography>
              {usuario?.user?.email && (
                <Typography
                  sx={{
                    fontSize: 13,
                    color: theme.palette.text.hint,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: "#545353"
                  }}
                >
                  {usuario.user.email}
                </Typography>
              )}
            </Box>
          </Box>

          <Divider />

          {/* Acciones como "hover chips" redondeados en vez de filas cuadradas */}
          <Box sx={{ p: 1 }}>
            <MenuItem
              component={Link}
              to="/profile"
              onClick={closeMenu}
              sx={{
                borderRadius: 2,
                py: 1,
                color: theme.palette.text.primary,
                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) },
              }}
            >
              <AccountIcon sx={{ fontSize: 20, mr: 1.5, color: 'primary.main' }} />
              Perfil
            </MenuItem>

            <MenuItem
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                py: 1,
                mt: 0.5,
                '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.08) },
              }}
            >
              <LogoutIcon sx={{ fontSize: 20, mr: 1.5, color: 'error.main' }} />
              <Typography color="error.main">Cerrar sesión</Typography>
            </MenuItem>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}