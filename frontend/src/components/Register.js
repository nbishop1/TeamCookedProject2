import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  async function handleCreate(e) {
    e.preventDefault();

    setStatus("Checking username...");
    try {
      // Check if username exists
      const checkRes = await fetch("http://localhost:4000/accounts/exists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const checkData = await checkRes.json();

      if (checkData.status === 1) {
        setStatus("Username already in use");
        return;
      }

      setStatus("Creating account...");
      // Create new account
      const createRes = await fetch("http://localhost:4000/accounts/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const createData = await createRes.json();

      if (!createRes.ok) {
        setStatus("Account creation failed");
        return;
      }

      setStatus("Account created successfully. Redirecting to login...");
      setTimeout(() => navigate("/"), 1500); // redirect to login after 1.5s

    } catch (err) {
      console.error(err);
      setStatus("Server error");
    }
  }

  return (
    <form onSubmit={handleCreate} className="card">
      <h3>Create account</h3>
      <input
        placeholder="username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
      />
      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button type="submit">Create</button>
      <div className="status">{status}</div>
    </form>
  );
}
