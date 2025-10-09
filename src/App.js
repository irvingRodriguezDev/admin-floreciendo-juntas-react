import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import AuthState from "./context/AuthContext/AuthState";
import AppRouter from "./Routes/AppRouter";
import ResetPasswordState from "./context/ResetPasswordContext/ResetPasswordState";
import SystemState from "./context/SystemContext/SystemState";

const App = () => {
  return (
    <AuthState>
     <ResetPasswordState>
      <SystemState>
        <Router>
          <AppRouter />
        </Router>
       </SystemState>
      </ResetPasswordState>
    </AuthState>
  );
};

export default App;
