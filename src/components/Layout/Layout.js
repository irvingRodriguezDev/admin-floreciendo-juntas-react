import React, { useContext } from "react";
import {
  Route,
  Switch,
  withRouter,
  Redirect,
} from "react-router-dom";
import { Box } from "@mui/material";

// Components
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";

// Pages
import Dashboard from "../../pages/dashboard/Dashboard";
import Profile from "../../pages/profile/Profile";

import Product from "../../pages/products/Product";
import ProductsGrid from "../../pages/ecommerce/ProductsGrid";

import System from "../../pages/systems/System";
import AddSystem from "../../pages/systems/AddSystem";

import UsersTablePage from "../../pages/CRUD/Users/table/UsersTablePage";
import UserAdd from "../../pages/CRUD/Users/table/UserAdd";

import CourseAdd from "../../pages/ecommerce/CourseAdd";
import CourseVideoAdd from "../../pages/ecommerce/CourseVideoAdd";

import EventAdd from "../../pages/events/EventAdd";
import Event from "../../pages/events/Event";

import AddProduct from "../../pages/products/AddProduct";
import Order from "../../pages/orders/Order";
import Lottery from "../../pages/lottery/lottery";

import Live from "../../pages/lives/Live";
import AddLive from "../../pages/lives/AddLive";

import Task from "../../pages/task/Task";
import PendingTask from "../../pages/task/PendingTask";

import AddCertificate from "../../pages/certifications/AddCertificate";
import Certification from "../../pages/certifications/Certification";
import AddModules from "../../pages/certifications/AddModules";

import Formation from "../../pages/formations/formation";
import AddModuleFormation from "../../pages/formations/addmodule";
import AddFormation from "../../pages/formations/addformation";
import Deliverable from "../../pages/formations/deliverable";

// Context
import { useLayoutState } from "../../context/LayoutContext";
import AuthContext from "../../context/AuthContext/AuthContext";

// Routes
import { PrivateRouter } from "../../Routes/PrivateRoute";

// Sidebar
import { useSidebarStructure } from "../Sidebar/SidebarStructure";

function Layout(props) {
  const structure = useSidebarStructure();

  const {
    autenticado,
  } = useContext(AuthContext);

  const layoutState = useLayoutState();

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "background.default",
      }}
    >
      {/* Header */}
      <Header history={props.history} />

      {/* Sidebar */}
      <Sidebar structure={structure} />

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          minWidth: 0,

          transition: (theme) =>
            theme.transitions.create(["margin", "width"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),

          ...(layoutState.isSidebarOpened && {
            transition: (theme) =>
              theme.transitions.create(["margin", "width"], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
              }),
          }),
        }}
      >
        {/* Espacio reservado para el Header */}
        <Box
          sx={{
            minHeight: {
              xs: 56,
              sm: 64,
            },
          }}
        />

        {/* Contenido de las páginas */}
        <Box
          sx={{
            width: "100%",
            px: {
              xs: 1.5,
              sm: 2,
              md: 3,
            },
            py: {
              xs: 2,
              sm: 2.5,
              md: 3,
            },
            boxSizing: "border-box",
          }}
        >
          <Switch>
            {/* Dashboard */}
            <Route
              exact
              path="/"
              render={() => <Redirect to="/dashboard" />}
            />

            <Route
              path="/dashboard"
              component={Dashboard}
            />

            {/* Perfil */}
            <Route
              path="/profile"
              component={Profile}
            />

            {/* Sistema */}
            <Route
              exact
              path="/system"
              render={() => <Redirect to="/system/list" />}
            />

            <Route
              path="/system/list"
              component={System}
            />

            <Route
              path="/system/addsystem"
              component={AddSystem}
            />

            <Route
              path="/system/editsystem/:id"
              component={AddSystem}
            />

            {/* Tareas */}
            <PrivateRouter
              path="/task"
              component={Task}
              isAuthenticated={autenticado}
              allowedRoles={["3"]}
            />

            <Route
              path="/pending-tasks"
              component={PendingTask}
            />

            {/* Certificaciones */}
            <Route
              path="/certifications/list"
              component={Certification}
            />

            <Route
              path="/certifications/addcertificate"
              component={AddCertificate}
            />

            <Route
              path="/certifications/editcertificate/:id"
              component={AddCertificate}
            />

            <Route
              path="/certifications/:certificationId/modules"
              component={AddModules}
            />

            {/* Formaciones */}
            <Route
              path="/formations/list"
              component={Formation}
            />

            <Route
              path="/formations/addformation"
              component={AddFormation}
            />

            <Route
              path="/formations/editformation/:id"
              component={AddFormation}
            />

            <Route
              path="/formations/:formationId/modules"
              component={AddModuleFormation}
            />

            <Route
              path="/formations/deliverable"
              component={Deliverable}
            />

            {/* Productos */}
            <Route
              path="/product/list"
              component={Product}
            />

            <Route
              path="/product/addproduct"
              component={AddProduct}
            />

            <Route
              path="/product/editproduct/:id"
              component={AddProduct}
            />

            {/* Órdenes */}
            <Route
              path="/orders"
              component={Order}
            />

            {/* Salón de tus sueños */}
            <Route
              path="/salon_of_your_dreams"
              component={Lottery}
            />

            {/* Lives */}
            <Route
              exact
              path="/lives"
              render={() => (
                <Redirect to="/lives/live_playlist" />
              )}
            />

            <PrivateRouter
              exact
              path="/lives/live_playlist"
              component={Live}
              isAuthenticated={autenticado}
              allowedRoles={["6", "1"]}
            />

            <Route
              path="/lives/addlive"
              component={AddLive}
            />

            <Route
              path="/lives/editlive/:id"
              component={AddLive}
            />

            {/* Eventos */}
            <Route
              exact
              path="/event"
              render={() => (
                <Redirect to="/events/list" />
              )}
            />

            <Route
              path="/events/list"
              component={Event}
            />

            <Route
              path="/events/addevent"
              component={EventAdd}
            />

            <Route
              path="/events/editevent/:id"
              component={EventAdd}
            />

            {/* Ecommerce */}
            <Route
              path="/ecommerce/product/:id"
              component={Product}
            />

            <Route
              path="/ecommerce/product"
              component={Product}
            />

            <Route
              path="/ecommerce/gridproducts"
              component={ProductsGrid}
            />

            <Route
              path="/ecommerce/courseadd"
              component={CourseAdd}
            />

            <Route
              path="/ecommerce/coursevideoadd/:id"
              component={CourseVideoAdd}
            />

            <Route
              exact
              path="/ecommerce/edit/:id"
              component={CourseAdd}
            />

            {/* Usuarios */}
            <Route
              exact
              path="/users/list"
              component={UsersTablePage}
            />

            <Route
              exact
              path="/users/useradd"
              component={UserAdd}
            />
          </Switch>
        </Box>
      </Box>
    </Box>
  );
}

export default withRouter(Layout);