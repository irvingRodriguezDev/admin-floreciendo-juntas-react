import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import AuthState from "./context/AuthContext/AuthState";
import AppRouter from "./Routes/AppRouter";
import ResetPasswordState from "./context/ResetPasswordContext/ResetPasswordState";
import SystemState from "./context/SystemContext/SystemState";
import CoursesState from "./context/CoursesContext/CoursesState";

const App = () => {
  return (
    <AuthState>
     <ResetPasswordState>
      <SystemState>
        <CoursesState>
         <Router>
           <AppRouter />
         </Router>
        </CoursesState>
       </SystemState>
      </ResetPasswordState>
    </AuthState>
  );
};

export default App;
