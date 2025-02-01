import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./Components/LoginPage";
import Home from "./Components/Home"; // Your home page component
import OrderConfirmation from "./Components/OrderConfirmation";
import OrderCompleted from "./Components/OrderCompleted";
import Mode from "./Components/Mode";

const App = () => {
  return (

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<Home />} /> {/* Home route */}
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="mode" element={<Mode/>}></Route>
        <Route path="/order-completed" element={<OrderCompleted/>} />
      </Routes>
  );
};

export default App;
