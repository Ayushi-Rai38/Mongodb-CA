import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import FindPet from "./pages/FindPet";
import PetDetails from "./pages/PetDetails";
import AdoptionForm from "./pages/AdoptionForm";
import MyApplications from "./pages/MyApplications";
import AdminDashboard from "./pages/AdminDashboard";
import PetManagement from "./pages/PetManagement";
import ApplicationManagement from "./pages/ApplicationManagement";

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <span className="text-8xl mb-4">🐾</span>
      <h1 className="text-4xl font-display font-bold text-forest-700 mb-2">404 – Page Not Found</h1>
      <p className="text-gray-500 mb-6">Looks like this paw-th doesn't exist.</p>
      <a href="/" className="btn-primary">Go Home</a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-cream">
        <Navbar />
        <main className="flex-1 page-enter">
          <Routes>
            <Route path="/"                      element={<Home />} />
            <Route path="/pets"                  element={<FindPet />} />
            <Route path="/pets/:id"              element={<PetDetails />} />
            <Route path="/adopt/:id"             element={<AdoptionForm />} />
            <Route path="/my-applications"       element={<MyApplications />} />
            <Route path="/admin"                 element={<AdminDashboard />} />
            <Route path="/admin/pets"            element={<PetManagement />} />
            <Route path="/admin/applications"    element={<ApplicationManagement />} />
            <Route path="*"                      element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
