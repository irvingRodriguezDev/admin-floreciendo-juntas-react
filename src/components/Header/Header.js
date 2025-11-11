import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Menu, MenuItem, Box, Divider } from '@mui/material';
import { useTheme } from '@mui/material';
import {
  Menu as MenuIcon,
  Person as AccountIcon,
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import classNames from 'classnames';
import { deepOrange } from '@mui/material/colors';


//images
import profile from '../../assets/images/main-profile.png';
import config from '../../config';

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
import {
  useManagementDispatch,
  useManagementState,
} from '../../context/ManagementContext';

import { actions } from '../../context/ManagementContext';
import { useUserDispatch, signOut } from '../../context/UserContext';
import AuthContext from '../../context/AuthContext/AuthContext';

export default function Header(props) {
  let classes = useStyles();
  let theme = useTheme();

  // global
  let layoutState = useLayoutState();
  let layoutDispatch = useLayoutDispatch();
  let userDispatch = useUserDispatch();
  const managementDispatch = useManagementDispatch();

  // local
  const [profileMenu, setProfileMenu] = useState(null);
  const [currentUser, setCurrentUser] = useState();
  const [isSmall, setSmall] = useState(false);

  const managementValue = useManagementState();

  // Obtenemos el usuario del contexto
  const { usuario, cerrarSesion } = useContext(AuthContext);

  const handleLogout = () => {
    cerrarSesion(); // actualiza el state global
    localStorage.removeItem("token"); // limpia token
    props.history.push("/login"); // redirige a login
  };


  useEffect(() => {
    actions.doFind(sessionStorage.getItem('user_id'))(managementDispatch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (config.isBackend) {
      setCurrentUser(managementValue.currentUser);
    }
  }, [managementValue]);

  useEffect(function () {
    window.addEventListener('resize', handleWindowWidthChange);
    handleWindowWidthChange();
    return function cleanup() {
      window.removeEventListener('resize', handleWindowWidthChange);
    };
  });

  function handleWindowWidthChange() {
    let windowWidth = window.innerWidth;
    let breakpointWidth = theme.breakpoints.values.md;
    let isSmallScreen = windowWidth < breakpointWidth;
    setSmall(isSmallScreen);
  }

  return (
    <AppBar position='fixed' className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        <IconButton
          color='inherit'
          onClick={() => toggleSidebar(layoutDispatch)}
          className={classNames(
            classes.headerMenuButton,
            classes.headerMenuButtonCollapse,
          )}
        >
          {(!layoutState.isSidebarOpened && isSmall) ||
            (layoutState.isSidebarOpened && !isSmall) ? (
            <ArrowBackIcon
              classes={{
                root: classNames(
                  classes.headerIcon,
                  classes.headerIconCollapse,
                ),
              }}
            />
          ) : (
            <MenuIcon
              classes={{
                root: classNames(
                  classes.headerIcon,
                  classes.headerIconCollapse,
                ),
              }}
            />
          )}
        </IconButton>
        <Typography variant='h6' weight='medium' className={classes.logotype}>
          Floreciendo Juntas
        </Typography>
        <div className={classes.grow} />
        <IconButton
          onClick={(e) => setProfileMenu(e.currentTarget)}
          sx={{
            p: 0.3,
            borderRadius: "50%",
            border: "2px solid rgba(255, 255, 255, 0.6)",
            transition: "0.2s",
            "&:hover": {
              borderColor: "#fff",
              transform: "scale(1.05)",
            },
          }}
        >
          <Avatar
            alt={usuario?.user?.name || "Usuario"}
            src={usuario?.user?.profileImage || ""}
            classes={{ root: classes.headerIcon }}
            sx={{
              bgcolor: !usuario?.user?.profileImage ? deepOrange[500] : "transparent",
              color: "#ffffffff",
            }}
          >
            {/* Si no hay imagen, muestra la primera letra del nombre */}
            {!usuario?.user?.profileImage && usuario?.user?.name?.[0]}
          </Avatar>
        </IconButton>
        <Typography
          block
          style={{ display: 'flex', alignItems: 'center', marginLeft: 8 }}
        >
          <div className={classes.profileLabel}>
            <b>Hola {usuario?.user?.name || "Admin"},&nbsp;</b>
          </div>
          <Typography weight={'bold'} className={classes.profileLabel}>
            {currentUser?.firstName}
          </Typography>
        </Typography>
        <Menu
          id="profile-menu"
          open={Boolean(profileMenu)}
          anchorEl={profileMenu}
          onClose={() => setProfileMenu(null)}
          PaperProps={{
            elevation: 4,
            sx: {
              mt: 1.5,
              borderRadius: 2,
              minWidth: 220,
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          {/* <Box sx={{ px: 2, py: 1.5 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: theme.palette.text.primary }}
            >
              {usuario?.user?.name || "Usuario"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary }}
            >
              {usuario?.user?.email || "Sin correo"}
            </Typography>
          </Box>

          <Divider /> */}

          <MenuItem
            onClick={() => setProfileMenu(null)}
            sx={{
              py: 1.2,
              "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
            }}
          >
            <AccountIcon sx={{ fontSize: 20, mr: 1, color: "primary.main" }} />
            <Link
              to="/app/profile"
              style={{
                textDecoration: "none",
                color: theme.palette.text.primary,
                width: "100%",
              }}
            >
              Perfil
            </Link>
          </MenuItem>

          <Divider />

          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.2,
              "&:hover": { backgroundColor: "rgba(255,0,0,0.05)" },
            }}
          >
            <LogoutIcon sx={{ fontSize: 20, mr: 1, color: "error.main" }} />
            <Typography color="error.main">Cerrar sesión</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
