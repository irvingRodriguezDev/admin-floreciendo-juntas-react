import React, {
  useState,
  useEffect,
  useMemo,
} from "react";

import {
  Drawer,
  List,
  Box,
  useTheme,
} from "@mui/material";

import { withRouter } from "react-router-dom";

// Components
import SidebarLink from "./components/SidebarLink/SidebarLink";

// Context
import {
  useLayoutState,
  useLayoutDispatch,
  toggleSidebar,
} from "../../context/LayoutContext";

function Sidebar({ location, structure }) {
  const theme = useTheme();

  // Global
  const { isSidebarOpened } = useLayoutState();
  const layoutDispatch = useLayoutDispatch();

  // Local
  const [isPermanent, setPermanent] = useState(true);

  /*
   * Determina si el Drawer debe estar abierto.
   *
   * En desktop:
   *   isPermanent === true
   *   → utiliza directamente isSidebarOpened
   *
   * En mobile:
   *   isPermanent === false
   *   → invierte el valor porque el Drawer es temporal
   */
  const isSidebarOpenedWrapper = useMemo(
    () =>
      !isPermanent
        ? !isSidebarOpened
        : isSidebarOpened,
    [isPermanent, isSidebarOpened]
  );

  const handleWindowWidthChange = () => {
    const windowWidth = window.innerWidth;
    const breakpointWidth = theme.breakpoints.values.md;

    const isSmallScreen =
      windowWidth < breakpointWidth;

    if (isSmallScreen && isPermanent) {
      setPermanent(false);
    } else if (!isSmallScreen && !isPermanent) {
      setPermanent(true);
    }
  };

  useEffect(() => {
    handleWindowWidthChange();

    window.addEventListener(
      "resize",
      handleWindowWidthChange
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleWindowWidthChange
      );
    };
  }, [theme.breakpoints.values.md]);

  const toggleDrawer = (value) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" ||
        event.key === "Shift")
    ) {
      return;
    }

    if (value && !isPermanent) {
      toggleSidebar(layoutDispatch);
    }
  };

  return (
    <Drawer
      variant={
        isPermanent
          ? "permanent"
          : "temporary"
      }
      open={isSidebarOpenedWrapper}
      onClose={toggleDrawer(true)}
      sx={{
        width: {
          xs: isSidebarOpenedWrapper ? 260 : 0,
          md: isSidebarOpenedWrapper ? 260 : 72,
        },

        flexShrink: 0,

        "& .MuiDrawer-paper": {
          width: isSidebarOpenedWrapper
            ? 260
            : 72,

          boxSizing: "border-box",

          overflowX: "hidden",

          transition: theme.transitions.create(
            "width",
            {
              easing:
                theme.transitions.easing.sharp,
              duration:
                theme.transitions.duration.enteringScreen,
            }
          ),

          ...(isSidebarOpenedWrapper
            ? {
              width: 260,
            }
            : {
              width: 72,
            }),

          backgroundColor:
            theme.palette.background.paper,

          borderRight: `1px solid ${theme.palette.divider}`,

          zIndex:
            theme.zIndex.drawer,
        },

        ...(isPermanent && {
          "& .MuiDrawer-paper": {
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: isSidebarOpenedWrapper
              ? 260
              : 72,
            boxSizing: "border-box",
            overflowX: "hidden",
            transition: theme.transitions.create(
              "width",
              {
                easing:
                  theme.transitions.easing.sharp,
                duration:
                  theme.transitions.duration.enteringScreen,
              }
            ),
            backgroundColor:
              theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
            zIndex:
              theme.zIndex.drawer,
          },
        }),

        ...(isPermanent &&
          isSidebarOpenedWrapper && {
          width: 260,

          "& .MuiDrawer-paper": {
            width: 260,
          },
        }),

        ...(isPermanent &&
          !isSidebarOpenedWrapper && {
          width: 72,

          "& .MuiDrawer-paper": {
            width: 72,
          },
        }),
      }}
    >
      {/* Espacio para el Header */}
      <Box
        sx={{
          minHeight: {
            xs: 56,
            sm: 64,
          },

          flexShrink: 0,
        }}
      />

      {/* Contenedor de navegación */}
      <List
        disablePadding
        sx={{
          width: "100%",
          px: isSidebarOpenedWrapper
            ? 1
            : 0.5,

          py: 1,

          overflowX: "hidden",

          transition: "padding 0.2s ease",
        }}
      >
        {structure.map((link) => (
          <SidebarLink
            key={link.id}
            location={location}
            isSidebarOpened={
              !isPermanent
                ? !isSidebarOpened
                : isSidebarOpened
            }
            {...link}
            toggleDrawer={toggleDrawer(true)}
          />
        ))}
      </List>
    </Drawer>
  );
}

export default withRouter(Sidebar);