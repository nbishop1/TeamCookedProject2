import React, { useState } from "react";

export default function AccountCard({ name, amount, accountKey, onUpdate }) {
  const [newName, setNewName] = useState("");

  async function renameOther() {
    if (!newName) return;
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`http://localhost:4000/newName/${user._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherName: newName }),
      });
      const data = await response.json();
      onUpdate({ otherName: data.otherName });
      setNewName("");
    } catch (err) {
      alert("Error renaming account");
    }
  }

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", margin: "10px" }}>
      <h4>{name}</h4>
      <p>Balance: ${amount.toFixed(2)}</p>
      {accountKey === "other" && (
        <div>
          <input
            type="text"
            placeholder="New name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button onClick={renameOther}>Rename</button>
        </div>
      )}
    </div>
  );
}