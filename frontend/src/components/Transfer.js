import React, { useState } from "react";

export default function Transfer({ userId, onUpdate }) {
  const [form, setForm] = useState({
    targetUserId: "",
    targetAccount: "savings",
    sourceAccount: "savings",
    amount: 0,
    category: "",
  });

  function updateForm(value) {
    setForm(prev => ({ ...prev, ...value }));
  }

  async function onSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:4000/accounts/transfer/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.errorMessage || "Transfer failed");
        return;
      }

      onUpdate(data);
      setForm({ targetUserId: "", targetAccount: "savings", sourceAccount: "savings", amount: 0, category: "" });
    } catch (err) {
      alert("Server error. Try again later.");
    }
  }

  return (
    <div>
      <h4>Transfer Money</h4>
      <form onSubmit={onSubmit}>
        <div>
          <label>Source Account:</label>
          <select value={form.sourceAccount} onChange={(e) => updateForm({ sourceAccount: e.target.value })}>
            <option value="savings">Savings</option>
            <option value="checking">Checking</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label>Target User ID:</label>
          <input type="text" value={form.targetUserId} onChange={(e) => updateForm({ targetUserId: e.target.value })} />
        </div>

        <div>
          <label>Target Account:</label>
          <select value={form.targetAccount} onChange={(e) => updateForm({ targetAccount: e.target.value })}>
            <option value="savings">Savings</option>
            <option value="checking">Checking</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label>Amount:</label>
          <input type="number" value={form.amount} onChange={(e) => updateForm({ amount: e.target.value })} />
        </div>

        <div>
          <label>Category:</label>
          <input type="text" value={form.category} onChange={(e) => updateForm({ category: e.target.value })} />
        </div>

        <button type="submit">Transfer</button>
      </form>
    </div>
  );
}