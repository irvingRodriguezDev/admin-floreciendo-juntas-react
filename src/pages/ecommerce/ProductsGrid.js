import React from "react";
import {
  Grid,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Card,
  CardActions,
  CardContent,
  CardActionArea,
  CardMedia,
  TextField,
  InputAdornment,
  Button,
  Paper,
  Fade,
} from "@mui/material";
import { useHistory } from "react-router-dom";
import {
  Star as StarIcon,
  Search as SearchIcon,
  Tune as TuneIcon,
} from "@mui/icons-material";
import { yellow } from "@mui/material/colors";
import useStyles from "./styles";
import { Typography, Chip } from "../../components/Wrappers";
import { rows } from "./mock";

const Product = () => {
  const history = useHistory();
  const typeRef = React.useRef(null);
  const brandsRef = React.useRef(null);
  const sizeRef = React.useRef(null);

  const [width, setWidth] = React.useReducer(
    (s, a) => ({ ...s, ...a }),
    { type: 0, brands: 0, size: 0 }
  );

  React.useEffect(() => {
    setWidth({
      type: typeRef.current.offsetWidth,
      brands: brandsRef.current.offsetWidth,
      size: sizeRef.current.offsetWidth,
    });
  }, []);

  const [state, dispatch] = React.useReducer(
    (s, a) => ({ ...s, ...a }),
    {
      valueType: "Shoes",
      valueBrands: "All",
      valueSize: 7,
      searchTerm: "",
    }
  );

  const filteredRows = rows.filter((c) =>
    c.title.toLowerCase().includes(state.searchTerm.toLowerCase())
  );

  return (
    <Grid container spacing={3}>
      {/* 🎛️ Filtros */}
      <Grid item xs={12}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            background:
              "linear-gradient(135deg, rgba(240,244,248,0.9), rgba(255,255,255,0.95))",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(200,200,200,0.3)",
          }}
        >
          <Box
            display="flex"
            flexWrap="wrap"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
          >
            <Box display="flex" flexWrap="wrap" alignItems="center" gap={2}>
              {/* Categoria */}
              <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
                <InputLabel ref={typeRef}>Categoría</InputLabel>
                <Select
                  value={state.valueType}
                  onChange={(e) =>
                    dispatch({ valueType: e.target.value })
                  }
                  label="Categoría"
                >
                  <MenuItem value={"Shoes"}>Shoes</MenuItem>
                  <MenuItem value={"Boots"}>Boots</MenuItem>
                  <MenuItem value={"Trainers"}>Trainers</MenuItem>
                </Select>
              </FormControl>

              {/* Sistema */}
              <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
                <InputLabel ref={brandsRef}>Sistema</InputLabel>
                <Select
                  value={state.valueBrands}
                  onChange={(e) =>
                    dispatch({ valueBrands: e.target.value })
                  }
                  label="Sistema"
                >
                  <MenuItem value={"All"}>Todos</MenuItem>
                  <MenuItem value={"Nike"}>Nike</MenuItem>
                  <MenuItem value={"Adidas"}>Adidas</MenuItem>
                </Select>
              </FormControl>

              {/* Nivel */}
              <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
                <InputLabel ref={sizeRef}>Nivel</InputLabel>
                <Select
                  value={state.valueSize}
                  onChange={(e) =>
                    dispatch({ valueSize: e.target.value })
                  }
                  label="Nivel"
                >
                  {[7, 8, 9, 10, 11, 12, 12.5, 13].map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Buscador con botón */}
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Buscar curso..."
                value={state.searchTerm}
                onChange={(e) =>
                  dispatch({ searchTerm: e.target.value })
                }
                sx={{
                  backgroundColor: "white",
                  borderRadius: 2,
                  width: 250,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              {/* <Button
                variant="contained"
                startIcon={<TuneIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  px: 2.5,
                  background:
                    "linear-gradient(45deg, #536DFE, #23a075)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #4359D8, #1f8b65)",
                  },
                }}
              >
                Filtrar
              </Button> */}
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* 🧱 Cards */}
      <Grid item xs={12}>
        <Grid container spacing={3}>
          {filteredRows.map((c) => (
            <Grid item xs={12} sm={6} md={3} key={c.id}>
              <Fade in timeout={400 + c.id * 80}>
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow:
                      "0px 4px 15px rgba(0,0,0,0.08), 0px 1px 3px rgba(0,0,0,0.1)",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow:
                        "0px 6px 18px rgba(0,0,0,0.12), 0px 3px 6px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => history.push(`/app/ecommerce/product/${c.id}`)}
                  >
                    <Box sx={{ position: "relative" }}>
                      <CardMedia
                        component="img"
                        height="190"
                        image={c.img}
                        alt={c.title}
                        sx={{ borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
                      />
                      <Chip
                        label={c.id % 2 ? "New" : "Sale"}
                        color={c.id % 2 ? "success" : "secondary"}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          borderRadius: "8px",
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {c.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {c.subtitle}
                      </Typography>
                    </CardContent>
                  </CardActionArea>

                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      width="100%"
                    >
                      <Typography fontWeight="bold">${c.price}</Typography>
                      <Box display="flex" alignItems="center" color={yellow[700]}>
                        <Typography>{rows[0].rating}</Typography>
                        <StarIcon sx={{ ml: 0.3, fontSize: 18 }} />
                      </Box>
                    </Box>
                  </CardActions>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Product;
