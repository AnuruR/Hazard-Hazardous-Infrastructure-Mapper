import { useState } from "react";

export default function Login({ initialMode = "login" }) {
  const [isRegistering, setIsRegistering] = useState(initialMode === "register");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="login-section">
      <h1 className="login-title">{isRegistering ? "Create your account" : "Welcome back"}</h1>
      <p className="login-subtitle">
        {isRegistering ? "Register to continue to Hazard Mapper" : "Sign in to continue to Hazard Mapper"}
      </p>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-field">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
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
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="login-button" type="submit">{isRegistering ? "Register" : "Login"}</button>
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
