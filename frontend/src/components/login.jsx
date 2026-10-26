import { useState } from "react";
import axios from "axios";

export default function Login({ initialMode = "login", onAuthenticated }) {
  const [isRegistering, setIsRegistering] = useState(
    initialMode === "register",
  );
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const endpoint = isRegistering ? "/api/register" : "/api/login";
      const infoToSend = isRegistering
        ? { username, email, password }
        : { username, password };

      const response = await axios.post(endpoint, infoToSend);
      onAuthenticated?.(response.data);
    } catch (error) {
      alert(error.response?.data?.message || "Could not connect to the server");
    }
  };

  return (
    <div className="login-section">
      <h1 className="login-title">
        {isRegistering ? "Create your account" : "Welcome back"}
      </h1>
      <p className="login-subtitle">
        {isRegistering
          ? "Register to continue to Hazard Mapper"
          : "Sign in to continue to Hazard Mapper"}
      </p>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-field">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            required
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        {isRegistering && (
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              autoComplete="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        )}
        <div className="login-field">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="login-button" type="submit">
          {isRegistering ? "Register" : "Login"}
        </button>
      </form>
      <p className="account-prompt">
        {isRegistering ? "Already have an account?" : "No account?"}{" "}
        <button
          className="account-link"
          type="button"
          onClick={() => setIsRegistering((current) => !current)}
        >
          {isRegistering ? "Sign in" : "Register now"}
        </button>
      </p>
    </div>
  );
}
