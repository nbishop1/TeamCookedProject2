import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export default function ChartBreakdown({ userId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await fetch(`http://localhost:4000/accounts/${userId}`);
        const accountData = await response.json();
        const transactions = accountData.transactions || [];

        const categoryMap = {};
        transactions.forEach(t => {
          if (!categoryMap[t.category]) categoryMap[t.category] = 0;
          categoryMap[t.category] += Number(t.amount);
        });

        const chartData = Object.keys(categoryMap).map(key => ({ name: key, value: categoryMap[key] }));
        setData(chartData);
      } catch (err) {
        console.error(err);
      }
    }

    fetchTransactions();
  }, [userId]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#3399AA"];

  return (
    <div>
      <h3>Spending by Category</h3>
      <PieChart width={400} height={400}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}