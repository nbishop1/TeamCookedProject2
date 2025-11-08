import React, { useState, useEffect } from "react";
import dayjs from "dayjs";

export default function History({ userId }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await fetch(`http://localhost:4000/accounts/${userId}`);
        const data = await response.json();

        // Assume backend returns a "transactions" array
        setTransactions(data.transactions || []);
        setLoading(false);
      } catch (err) {
        alert("Failed to fetch transaction history");
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [userId]);

  if (loading) return <p>Loading transactions...</p>;

  return (
    <div>
      <h3>Transaction History</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Account</th>
            <th>Amount</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, idx) => (
            <tr key={idx}>
              <td>{dayjs(t.date).format('YYYY-MM-DD HH:mm')}</td>
              <td>{t.account}</td>
              <td>{t.amount}</td>
              <td>{t.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}