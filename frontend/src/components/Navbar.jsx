import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { PawPrint, Menu, X, ChevronDown, LayoutDashboard, Cat, FileText } from "lucide-react";

const NAV_LINKS = [
  { to: "/",               label: "Home" },
  { to: "/pets",           label: "Find a Pet" },
  { to: "/my-applications", label: "My Applications" },
];

const ADMIN_LINKS = [
  { to: "/admin",                label: "Dashboard",    icon: LayoutDashboard },
  { to: "/admin/pets",           label: "Manage Pets",  icon: Cat },
  { to: "/admin/applications",   label: "Applications", icon: FileText },
];

export default function Navbar() {
  const [open, setOpen]         = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput]  = useState("");
  const navigate = useNavigate();
  const isAdmin = !!localStorage.getItem("pawpal_admin_key");

  function handleAdminLogin(e) {
    e.preventDefault();
    if (keyInput.trim()) {
      localStorage.setItem("pawpal_admin_key", keyInput.trim());
      setShowKeyModal(false);
      setKeyInput("");
      navigate("/admin");
      window.location.reload();
    }
  }
  function handleLogout() {
    localStorage.removeItem("pawpal_admin_key");
    window.location.href = "/";
  }

  return (
    <>
      <nav className="sticky top-0 z-50 glass border-b border-forest-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-forest-500 rounded-xl flex items-center justify-center
                              group-hover:bg-forest-600 transition-colors">
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-forest-700">
                Paw<span className="text-amber">Pal</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === "/"}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-forest-500 text-white"
                        : "text-gray-600 hover:bg-forest-50 hover:text-forest-600"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}

              {/* Admin dropdown */}
              {isAdmin ? (
                <div className="relative ml-2">
                  <button
                    onClick={() => setAdminOpen(!adminOpen)}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium
                               bg-forest-500 text-white hover:bg-forest-600 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin
                    <ChevronDown className={`w-3 h-3 transition-transform ${adminOpen ? "rotate-180" : ""}`} />
                  </button>
                  {adminOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-card-hover
                                    border border-cream-dark overflow-hidden animate-fade-in">
                      {ADMIN_LINKS.map((l) => (
                        <Link
                          key={l.to} to={l.to}
                          onClick={() => setAdminOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700
                                     hover:bg-forest-50 hover:text-forest-600 transition-colors"
                        >
                          <l.icon className="w-4 h-4" /> {l.label}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500
                                   hover:bg-red-50 transition-colors border-t border-gray-100"
                      >
                        Logout Admin
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowKeyModal(true)}
                  className="ml-2 px-4 py-2 rounded-lg text-sm font-medium border border-forest-300
                             text-forest-600 hover:bg-forest-50 transition-colors"
                >
                  Admin Login
                </button>
              )}
            </div>

            {/* Mobile menu btn */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-forest-50"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden bg-white border-t border-cream-dark animate-fade-in">
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l.to} to={l.to} end={l.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg text-sm font-medium ${
                      isActive ? "bg-forest-500 text-white" : "text-gray-700 hover:bg-forest-50"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              {isAdmin && ADMIN_LINKS.map((l) => (
                <Link
                  key={l.to} to={l.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                             text-forest-600 hover:bg-forest-50"
                >
                  <l.icon className="w-4 h-4" /> {l.label}
                </Link>
              ))}
              {!isAdmin && (
                <button
                  onClick={() => { setOpen(false); setShowKeyModal(true); }}
                  className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium
                             text-forest-600 hover:bg-forest-50"
                >
                  Admin Login
                </button>
              )}
              {isAdmin && (
                <button onClick={handleLogout}
                  className="w-full text-left px-4 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50">
                  Logout Admin
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Admin key modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
             onClick={(e) => e.target === e.currentTarget && setShowKeyModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm animate-slide-up">
            <h2 className="font-display text-xl font-bold text-forest-700 mb-1">Admin Login</h2>
            <p className="text-sm text-gray-500 mb-5">Enter your admin secret key to access the dashboard.</p>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input
                id="admin-key-input"
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Admin secret key"
                className="input-field"
                autoFocus
              />
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">Login</button>
                <button type="button" onClick={() => setShowKeyModal(false)}
                  className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
