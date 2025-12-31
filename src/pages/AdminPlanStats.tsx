import React, { useEffect } from "react";
import UserPlanPie from "../components/UserPlanPie";
import AdminLayout from "../components/AdminLayout";
import "./AdminDashboard.css";

const AdminPlanStats: React.FC = () => {
  useEffect(() => {
    const root = document.getElementById("root");
    if (root) root.classList.add("full-bleed");
    return () => {
      if (root) root.classList.remove("full-bleed");
    };
  }, []);

  return (
    <AdminLayout
      headerTitle="Plan details"
      headerSubtitle="Overview of subscription plans"
    >
      <section className="list-card" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <UserPlanPie />
      </section>
    </AdminLayout>
  );
};

export default AdminPlanStats;
