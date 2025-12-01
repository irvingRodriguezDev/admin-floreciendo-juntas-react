import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import AuthState from "./context/AuthContext/AuthState";
import AppRouter from "./Routes/AppRouter";
import ResetPasswordState from "./context/ResetPasswordContext/ResetPasswordState";
import SystemState from "./context/SystemContext/SystemState";
import CoursesState from "./context/CoursesContext/CoursesState";
import UserState from "./context/UserContext/UserState";
import EventState from "./context/EventContext/EventState";
import ProductState from "./context/ProductContext/ProdcutState";
import OrdersState from "./context/OrdersContext/OrdersState";

const App = () => {
  return (
    <AuthState>
     <ResetPasswordState>
      <SystemState>
        <CoursesState>
         <UserState>
          <EventState>
           <ProductState>
            <OrdersState>
             <Router>
               <AppRouter />
             </Router>
            </OrdersState>
           </ProductState>
          </EventState>
         </UserState>
        </CoursesState>
       </SystemState>
      </ResetPasswordState>
    </AuthState>
  );
};

export default App;
