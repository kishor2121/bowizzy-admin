import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPlanStats from "./pages/AdminPlanStats";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* default redirect */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* admin login */}
        <Route path="/login" element={<AdminLogin />} />

        {/* admin dashboard (after login) */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/plans" element={<AdminPlanStats />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
