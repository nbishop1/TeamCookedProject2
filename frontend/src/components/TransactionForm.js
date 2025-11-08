import React, { useState } from "react";

export default function TransactionForm({ userId, onUpdate }) {
  const [form, setForm] = useState({
    savings: 0,
    checking: 0,
    other: 0,
    type: "deposit",
    category: "",
  });

  function updateForm(value) {
    setForm((prev) => ({ ...prev, ...value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    const url = form.type === "deposit" 
      ? `http://localhost:4000/deposit/${userId}` 
      : `http://localhost:4000/withdraw/${userId}`;

    const payload = {
      savings: Number(form.savings),
      checking: Number(form.checking),
      other: Number(form.other),
      category: form.category,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.errorMessage || "Transaction failed");
        return;
      }

      onUpdate(data);
      setForm({ savings: 0, checking: 0, other: 0, type: "deposit", category: "" });
    } catch (err) {
      alert("Server error. Try again later.");
    }
  }

  return (
    <div>
      <h4>Make a Transaction</h4>
      <form onSubmit={onSubmit}>
        <div>
          <label>Type:</label>
          <select value={form.type} onChange={(e) => updateForm({ type: e.target.value })}>
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
          </select>
        </div>

        <div>
          <label>Savings:</label>
          <input type="number" value={form.savings} onChange={(e) => updateForm({ savings: e.target.value })} />
        </div>

        <div>
          <label>Checking:</label>
          <input type="number" value={form.checking} onChange={(e) => updateForm({ checking: e.target.value })} />
        </div>

        <div>
          <label>Other:</label>
          <input type="number" value={form.other} onChange={(e) => updateForm({ other: e.target.value })} />
        </div>

        <div>
          <label>Category:</label>
          <input type="text" value={form.category} onChange={(e) => updateForm({ category: e.target.value })} />
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}