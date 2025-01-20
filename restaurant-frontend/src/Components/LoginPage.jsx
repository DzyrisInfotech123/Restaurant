import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "./api";
import "./LoginPage.css";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Example of handling login response
  const handleLogin = async (e) => {
    e.preventDefault();

    setIsLoading(true); // Set loading state to true while making the request
    setError(null); // Reset error message if any

    try {
      const response = await axios.post("http://localhost:4001/api/login", {
        username,
        password,
      });

      const { token, user, vendor, menuItems } = response.data;

      if (token) {
        // Log the token in the console
        console.log("Token:", token);

        // Store token and user data
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user._id);
        localStorage.setItem("role", user.role);

        // If the user is a vendor, store vendor info
        if (vendor) {
          localStorage.setItem("vendorId", vendor._id);
          // Optionally, store other vendor info here
        }

        // Store the menu items in localStorage
        localStorage.setItem("menuItems", JSON.stringify(menuItems));

        // Redirect to home page or dashboard based on the role
        navigate("/home");
      } else {
        alert("Login failed: No token received");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false); // Set loading state back to false after request
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-heading">Welcome Back!</h2>
        <p className="login-subheading">Please sign in to your account</p>
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-field">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
              className="form-input"
              aria-label="Username"
            />
          </div>
          <div className="form-field">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="form-input"
              aria-label="Password"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
