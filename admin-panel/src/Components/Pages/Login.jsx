import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Import your CSS for styling

function Login() {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate login logic (replace this with your backend logic)
    setTimeout(() => {
      if (username === "admin" && password === "admin123") {
        navigate("dashboard"); // Redirect to dashboard
      } else {
        setError("Invalid username or password");
      }
      setIsLoading(false);
    }, 1000); // Simulating an API call
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-heading">Admin Login</h2>
        <p className="login-subheading">Please sign in to your admin account</p>
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
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
