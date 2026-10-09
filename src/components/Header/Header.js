import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Box,
  Typography,
  Avatar,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Person as AccountIcon,
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
  KeyboardArrowDown as ChevronIcon,
} from "@mui/icons-material";
import { deepOrange } from "@mui/material/colors";

// context
import {
  useLayoutState,
  useLayoutDispatch,
  toggleSidebar,
} from "../../context/LayoutContext";
import AuthContext from "../../context/AuthContext/AuthContext";

export default function Header(props) {
  const theme = useTheme();

  // Global
  const layoutState = useLayoutState();
  const layoutDispatch = useLayoutDispatch();

  // Local
  const [profileMenu, setProfileMenu] = useState(null);
  const [isSmall, setSmall] = useState(false);

  // Usuario autenticado
  const { usuario, cerrarSesion } = useContext(AuthContext);

  const userName = usuario?.user?.name || "Usuario";
  const userInitial = userName?.[0]?.toUpperCase();
  const hasAvatarImage = Boolean(usuario?.user?.profileImage);

  const handleLogout = () => {
    setProfileMenu(null);
    cerrarSesion();
    localStorage.removeItem("token");
    props.history.push("/login");
  };

  const handleWindowWidthChange = useCallback(() => {
    const breakpointWidth = theme.breakpoints.values.md;

    setSmall(window.innerWidth < breakpointWidth);
  }, [theme.breakpoints.values.md]);

  useEffect(() => {
    handleWindowWidthChange();

    window.addEventListener("resize", handleWindowWidthChange);

    return () => {
      window.removeEventListener("resize", handleWindowWidthChange);
    };
  }, [handleWindowWidthChange]);

  const isMenuOpen = Boolean(profileMenu);

  const closeMenu = () => {
    setProfileMenu(null);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: "#FF5C95",
      }}
    >
      <Toolbar
        sx={{
          minHeight: {
            xs: 56,
            sm: 64,
          },
          px: {
            xs: 1.5,
            sm: 2,
          },
        }}
      >
        {/* Botón del menú */}
        <IconButton
          color="inherit"
          aria-label={
            layoutState.isSidebarOpened
              ? "Contraer menú"
              : "Abrir menú"
          }
          onClick={() => toggleSidebar(layoutDispatch)}
          sx={{
            borderRadius: 1.5,
            mr: 1,

            "&:hover": {
              backgroundColor: alpha("#fff", 0.12),
            },
          }}
        >
          {(!layoutState.isSidebarOpened && isSmall) ||
            (layoutState.isSidebarOpened && !isSmall) ? (
            <ArrowBackIcon
              sx={{
                fontSize: 24,
                color: "#fff",
              }}
            />
          ) : (
            <MenuIcon
              sx={{
                fontSize: 24,
                color: "#fff",
              }}
            />
          )}
        </IconButton>

        {/* Logo / Nombre */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              m: 0,
              color: "#fff",
              fontWeight: 500,
              letterSpacing: 0.4,
              whiteSpace: "nowrap",
            }}
          >
            Floreciendo Juntas
          </Typography>
        </Box>

        {/* Espaciador */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Botón de usuario */}
        <Box
          component="button"
          onClick={(e) => setProfileMenu(e.currentTarget)}
          aria-label="Abrir menú de perfil"
          aria-controls={isMenuOpen ? "profile-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={isMenuOpen ? "true" : undefined}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,

            border: "1px solid",
            borderColor: alpha("#fff", 0.3),

            backgroundColor: isMenuOpen
              ? alpha("#fff", 0.14)
              : "transparent",

            borderRadius: 999,

            pl: 0.5,
            pr: isSmall ? 0.5 : 1.5,
            py: 0.5,

            cursor: "pointer",
            transition: "0.2s",

            "&:hover": {
              backgroundColor: alpha("#fff", 0.14),
              borderColor: alpha("#fff", 0.5),
            },
          }}
        >
          {/* Avatar */}
          <Avatar
            alt={userName}
            src={usuario?.user?.profileImage || ""}
            sx={{
              width: 30,
              height: 30,
              bgcolor: hasAvatarImage
                ? "transparent"
                : deepOrange[500],
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {!hasAvatarImage && userInitial}
          </Avatar>

          {/* Nombre */}
          {!isSmall && (
            <Typography
              sx={{
                color: "#fff",
                fontSize: 14,
                lineHeight: 1,
                fontWeight: 500,
                maxWidth: 180,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {userName}
            </Typography>
          )}

          {/* Flecha */}
          <ChevronIcon
            sx={{
              color: alpha("#fff", 0.8),
              fontSize: 20,
              transition: "transform 0.2s",
              transform: isMenuOpen
                ? "rotate(180deg)"
                : "none",
            }}
          />
        </Box>

        {/* Menú de perfil */}
        <Menu
          id="profile-menu"
          open={isMenuOpen}
          anchorEl={profileMenu}
          onClose={closeMenu}
          MenuListProps={{
            "aria-label": "Menú de perfil",
            sx: {
              p: 1,
            },
          }}
          PaperProps={{
            elevation: 6,
            sx: {
              mt: 1.5,
              borderRadius: 3,
              minWidth: 250,
              maxWidth: 320,
              overflow: "hidden",
              backgroundColor:
                theme.palette.background.paper,
            },
          }}
        >
          {/* Información del usuario */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 2,
              backgroundColor: alpha(
                "#FF5C95",
                0.06
              ),
            }}
          >
            <Avatar
              alt={userName}
              src={usuario?.user?.profileImage || ""}
              sx={{
                width: 44,
                height: 44,
                bgcolor: hasAvatarImage
                  ? "transparent"
                  : deepOrange[500],
                color: "#fff",
                fontWeight: 600,
              }}
            >
              {!hasAvatarImage && userInitial}
            </Avatar>

            <Box
              sx={{
                minWidth: 0,
                flex: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {userName}
              </Typography>

              {usuario?.user?.email && (
                <Typography
                  sx={{
                    mt: 0.25,
                    fontSize: 13,
                    color: "#545353",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {usuario.user.email}
                </Typography>
              )}
            </Box>
          </Box>

          <Divider />

          {/* Acciones */}
          <Box sx={{ p: 1 }}>
            <MenuItem
              component={Link}
              to="/profile"
              onClick={closeMenu}
              sx={{
                borderRadius: 2,
                py: 1,
                color: theme.palette.text.primary,

                "&:hover": {
                  backgroundColor: alpha(
                    theme.palette.primary.main,
                    0.08
                  ),
                },
              }}
            >
              <AccountIcon
                sx={{
                  fontSize: 20,
                  mr: 1.5,
                  color: "#ff64a8",
                }}
              />

              <Typography
                sx={{
                  fontWeight: 500,
                }}
              >
                Perfil
              </Typography>
            </MenuItem>

            <MenuItem
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                py: 1,
                mt: 0.5,

                "&:hover": {
                  backgroundColor: alpha(
                    theme.palette.error.main,
                    0.08
                  ),
                },
              }}
            >
              <LogoutIcon
                sx={{
                  fontSize: 20,
                  mr: 1.5,
                  color: "error.main",
                }}
              />

              <Typography
                sx={{
                  color: "error.main",
                  fontWeight: 500,
                }}
              >
                Cerrar sesión
              </Typography>
            </MenuItem>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}