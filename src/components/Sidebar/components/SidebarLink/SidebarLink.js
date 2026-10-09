import React, { useState } from "react";
import {
  Box,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  TextField,
  Typography,
  Button,
  Badge,
} from "@mui/material";

import {
  Inbox as InboxIcon,
  ExpandMore as ExpandIcon,
} from "@mui/icons-material";

import { Link } from "react-router-dom";

const PINK = "#FF5C95";
const PINK_HOVER = "#F04483";

export default function SidebarLink({
  link,
  ext,
  icon,
  label,
  children,
  location,
  isSidebarOpened,
  nested,
  type,
  toggleDrawer,
  click,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const isLinkActive =
    link &&
    location?.pathname &&
    (location.pathname === link ||
      location.pathname.includes(link));

  const open = Boolean(anchorEl);
  const id = open ? "add-section-popover" : undefined;

  // Login
  const onLogin = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  // Popover
  const addSectionClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const addSectionClose = () => {
    setAnchorEl(null);
  };

  // Acciones de los elementos sin submenús
  const handleClick = (event) => {
    if (click) {
      return click(event, addSectionClick, onLogin);
    }

    return toggleDrawer?.(event);
  };

  // Estilos comunes
  const linkStyles = {
    position: "relative",
    minHeight: 48,
    mx: nested ? 0.5 : 1,
    my: 0.25,
    px: nested ? 2 : 1.5,
    borderRadius: 2,
    color: "text.secondary",
    transition: "all 0.2s ease",

    "&:hover": {
      backgroundColor: "rgba(255, 92, 149, 0.08)",
      color: PINK,
    },

    ...(isLinkActive &&
      !nested && {
      backgroundColor: "rgba(255, 92, 149, 0.12)",
      color: PINK,

      "&::before": {
        content: '""',
        position: "absolute",
        left: 0,
        top: 8,
        bottom: 8,
        width: 4,
        borderRadius: "0 4px 4px 0",
        backgroundColor: PINK,
      },

      "&:hover": {
        backgroundColor: "rgba(255, 92, 149, 0.16)",
      },
    }),

    ...(nested &&
      isLinkActive && {
      backgroundColor: "rgba(255, 92, 149, 0.08)",
      color: PINK,
    }),
  };

  const linkTextStyles = {
    fontSize: 14,
    fontWeight: isLinkActive ? 600 : 500,
    color: "inherit",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    opacity: isSidebarOpened ? 1 : 0,
    width: isSidebarOpened ? "auto" : 0,
    transition: "opacity 0.2s ease, width 0.2s ease",
  };

  const linkIconStyles = {
    minWidth: nested ? 0 : 56,
    width: nested ? "auto" : 56,
    mr: nested ? 1 : 0,
    color: isLinkActive ? PINK : "text.secondary",
    transition: "color 0.2s ease",
    ...(nested && {
      justifyContent: "center",
    }),
  };

  // Punto rosa de los submenús
  const renderDot = () => (
    <Box
      sx={{
        width: 5,
        height: 5,
        minWidth: 5,
        borderRadius: "50%",
        backgroundColor: PINK,
      }}
    />
  );

  // Texto reutilizable
  const renderLabel = (fontSize = "15px") => (
    <ListItemText
      primary={label}
      sx={{
        "& .MuiListItemText-primary": {
          ...linkTextStyles,
          fontSize: `${fontSize} !important`,
        },
      }}
    />
  );

  // Título de sección
  if (type === "title") {
    return (
      <Typography
        sx={{
          px: 2,
          pt: 2.5,
          pb: 1,
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          color: "text.secondary",
          opacity: isSidebarOpened ? 1 : 0,
          height: isSidebarOpened ? "auto" : 0,
          overflow: "hidden",
          transition: "opacity 0.2s ease, height 0.2s ease",
        }}
      >
        {label}
      </Typography>
    );
  }

  // Divisor
  if (type === "divider") {
    return (
      <Divider
        sx={{
          my: 1,
          mx: 1.5,
          borderColor: "rgba(255, 92, 149, 0.18)",
        }}
      />
    );
  }

  // Espacio
  if (type === "margin") {
    return <Box sx={{ height: 240 }} />;
  }

  // Elementos externos sin submenús
  if (!children && ext) {
    return (
      <ListItem
        onClick={handleClick}
        onKeyDown={toggleDrawer}
        component={link ? "a" : "div"}
        href={link}
        disablePadding
        sx={linkStyles}
      >
        <ListItemIcon sx={linkIconStyles}>
          {nested ? renderDot() : icon}
        </ListItemIcon>

        {renderLabel("12px")}
      </ListItem>
    );
  }

  // Elementos sin submenús
  if (!children) {
    return (
      <>
        <ListItemButton
          onClick={handleClick}
          onKeyDown={toggleDrawer}
          component={link ? Link : "div"}
          to={link}
          disableRipple
          sx={{
            ...linkStyles,
            pl: nested ? 3 : 1.5,
          }}
        >
          <ListItemIcon sx={linkIconStyles}>
            {nested ? renderDot() : icon}
          </ListItemIcon>

          {renderLabel()}
        </ListItemButton>

        {/* Popover */}
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={addSectionClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                borderRadius: 3,
                border: "1px solid rgba(255, 92, 149, 0.2)",
                boxShadow:
                  "0 8px 30px rgba(255, 92, 149, 0.12)",
              },
            },
          }}
        >
          <Box
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              minWidth: 280,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: PINK,
              }}
            >
              Add section
            </Typography>

            <TextField
              size="small"
              label="Section Name"
              placeholder="Section Name"
              fullWidth
              sx={{
                "& .MuiInputLabel-root.Mui-focused": {
                  color: PINK,
                },

                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,

                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: PINK,
                  },

                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: PINK,
                  },
                },
              }}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
              }}
            >
              <Button
                variant="contained"
                sx={{
                  borderRadius: 2,
                  backgroundColor: PINK,
                  color: "#FFFFFF",
                  boxShadow: "none",

                  "&:hover": {
                    backgroundColor: PINK_HOVER,
                    boxShadow: "none",
                  },
                }}
              >
                Add
              </Button>

              <Button
                onClick={addSectionClose}
                sx={{
                  borderRadius: 2,
                  color: PINK,

                  "&:hover": {
                    backgroundColor: "rgba(255, 92, 149, 0.08)",
                  },
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Popover>
      </>
    );
  }

  // Elementos con submenús
  return (
    <>
      <ListItemButton
        component={link ? Link : "div"}
        to={link}
        disableRipple
        onClick={(event) => {
          if (children) {
            event.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        sx={{
          ...linkStyles,

          ...(type === "nested" && {
            ml: 0.5,
          }),
        }}
      >
        <ListItemIcon
          sx={{
            ...linkIconStyles,
            minWidth: 56,
          }}
        >
          {icon || <InboxIcon />}
        </ListItemIcon>

        {props.badge ? (
          <Badge
            badgeContent={props.badge}
            color={props.badgeColor}
            sx={{
              "& .MuiBadge-badge": {
                right: -8,
                backgroundColor: PINK,
                color: "#FFFFFF",
              },
            }}
          >
            {renderLabel()}
          </Badge>
        ) : (
          renderLabel()
        )}

        <ExpandIcon
          sx={{
            ml: "auto",
            fontSize: 20,
            color: isOpen ? PINK : "text.secondary",
            opacity: isSidebarOpened ? 1 : 0,
            width: isSidebarOpened ? 20 : 0,
            transition:
              "transform 0.2s ease, opacity 0.2s ease, width 0.2s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </ListItemButton>

      {/* Submenú */}
      <Collapse
        in={isOpen && isSidebarOpened}
        timeout="auto"
        unmountOnExit
      >
        <List
          component="div"
          disablePadding
          sx={{ pl: 1 }}
        >
          {children.map((childrenLink) => (
            <SidebarLink
              key={childrenLink.link || childrenLink.label}
              location={location}
              isSidebarOpened={isSidebarOpened}
              toggleDrawer={toggleDrawer}
              nested
              {...childrenLink}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
}