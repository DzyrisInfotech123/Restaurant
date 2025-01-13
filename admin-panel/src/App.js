import React from "react";
import { Route, Routes } from "react-router-dom";
import LoginPage from "./Components/Pages/Login";
import Dashboard from "./Components/Pages/Dashboard";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} /> {/* Updated to /dashboard */}
    </Routes>
  );
};

export default App;
