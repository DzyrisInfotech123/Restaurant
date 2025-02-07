import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../Services/Api"; // Ensure this points to your Axios setup
import "./Login.css"; // Import your CSS for styling

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post("https://dev.digitalexamregistration.com/api/login", {
        username,
        password,
      });

      const { token, user, vendor, menuItems } = response.data;

      if (token) {
        // Store token and user data in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user._id);
        localStorage.setItem("role", user.role); // Store user role

        // Store vendor info if the user is a vendor
        if (vendor) {
          localStorage.setItem("vendorId", vendor._id);
        }

        // Store menu items if available
        localStorage.setItem("menuItems", JSON.stringify(menuItems));

        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        setError("Login failed: No token received");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid username or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-heading">Admin Login</h2>
        <p className="login-subheading">Please sign in to your admin account</p>
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-field">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
              className="form-input"
            />
          </div>
          <div className="form-field">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="form-input"
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

export default Login;