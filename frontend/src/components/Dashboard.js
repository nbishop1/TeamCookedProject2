import React, { useState } from "react";
import Dashboard from "./Dashboard";
import History from "./History";
import ChartBreakdown from "./ChartBreakdown";
import Transfer from "./Transfer";

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return <p>Loading user...</p>;

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "history":
        return <History userId={user._id} />;
      case "chart":
        return <ChartBreakdown userId={user._id} />;
      case "transfer":
        return <Transfer userId={user._id} onUpdate={() => {}} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div>
      <nav style={{ marginBottom: "20px" }}>
        <button onClick={() => setActiveTab("dashboard")}>Dashboard</button>
        <button onClick={() => setActiveTab("history")}>History</button>
        <button onClick={() => setActiveTab("chart")}>Chart</button>
        <button onClick={() => setActiveTab("transfer")}>Transfer</button>
      </nav>
      {renderTab()}
    </div>
  );
}