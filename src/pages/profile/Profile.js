import React, { useContext } from "react";
import { Avatar, Grid, Typography } from "@mui/material";
import { useTheme } from "@mui/styles";
import { Chip } from '../../components/Wrappers';
import Widget from "../../components/Widget/Widget";
import AuthContext from "../../context/AuthContext/AuthContext";
import { deepOrange } from '@mui/material/colors';
import { useHistory } from "react-router-dom";
import useStyles from "./styles";

function Profile() {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { usuario } = useContext(AuthContext);

  // Mapeo de roles
  const roleLabels = {
    1: "Admin",
    2: "Gerente",
    3: "Supervisor",
    4: "Vendedor",
    5: "Escaneador",
  };

  // Si el usuario tiene un roleId, se usa el texto correspondiente
  const roleLabel = roleLabels[usuario?.user?.roleId] || "Usuario";

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} sm={6} md={6} lg={5}>
        <Widget>
          <Grid container spacing={1}>
            {/* Imagen y rol */}
            <Grid item xs={12} sm={5}>
              <div className={classes.visualProfile}>
                <div className={classes.profileImage}>
                  <Avatar
                    alt={usuario?.user?.name || "Usuario"}
                    src={usuario?.user?.profileImage || ""}
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: !usuario?.user?.profileImage ? deepOrange[500] : 'transparent',
                      fontSize: 48,
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {!usuario?.user?.profileImage && usuario?.user?.name?.[0]}
                  </Avatar>
                </div>

                {/* Chip dinámico según rol */}
                <Chip
                  className={classes.chipMargin}
                  color="secondary"
                  label={roleLabel}
                />
              </div>
            </Grid>

            {/* Información del usuario */}
            <Grid item xs={12} sm={7}>
              <div className={classes.profileDescription}>
                <Typography variant="h3" className={classes.profileTitle}>
                  {usuario?.user?.name || "Administrador"}
                </Typography>

                <span className={classes.profileSubtitle}>
                  Correo: {usuario?.user?.email || "admin@floreciendojuntas.com"}
                </span>

                <a
                  className={classes.profileExternalRes}
                  href="https://floreciendojuntas.com"
                >
                  Floreciendojuntas.com
                </a>
              </div>
            </Grid>
          </Grid>
        </Widget>
      </Grid>
    </Grid>
  );
}

export default Profile;
