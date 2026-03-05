import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AdminDashboard from "./components/AdminDashboard";
import CustomerPortal from "./components/CustomerPortal";
import LandingPage from "./components/LandingPage";

export type AppView = "home" | "customer" | "admin";

export default function App() {
  const [view, setView] = useState<AppView>("home");

  return (
    <div className="min-h-screen bg-background">
      {view === "home" && <LandingPage onNavigate={setView} />}
      {view === "customer" && <CustomerPortal onBack={() => setView("home")} />}
      {view === "admin" && <AdminDashboard onBack={() => setView("home")} />}
      <Toaster position="top-right" richColors />
    </div>
  );
}
