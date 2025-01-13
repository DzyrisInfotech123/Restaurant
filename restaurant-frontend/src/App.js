import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./Components/LoginPage";
import Home from "./Components/Home"; // Your home page component

const App = () => {
  return (

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<Home />} /> {/* Home route */}
      </Routes>
  );
};

export default App;
