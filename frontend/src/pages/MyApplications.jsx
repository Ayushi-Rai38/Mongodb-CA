import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Clock, CheckCircle, XCircle, PawPrint, AlertCircle, Loader } from "lucide-react";
import { applicationsApi } from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";

function StatusBadge({ status }) {
  const map = {
    pending:  { cls: "badge-pending",  icon: Clock,         label: "Pending" },
    approved: { cls: "badge-approved", icon: CheckCircle,   label: "Approved" },
    rejected: { cls: "badge-rejected", icon: XCircle,       label: "Rejected" },
  };
  const { cls, icon: Icon, label } = map[status] || map.pending;
  return (
    <span className={`${cls} flex items-center gap-1`}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
}

export default function MyApplications() {
  const [email,   setEmail]   = useState("");
  const [apps,    setApps]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error,   setError]   = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await applicationsApi.myApps(email.trim());
      setApps(res.data);
      setSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="section-title">My Applications</h1>
        <p className="section-subtitle mb-0">Enter your email to view all your adoption applications</p>
      </div>

      {/* Email search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="my-apps-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="input-field pl-10"
          />
        </div>
        <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {loading && <LoadingSpinner />}

      {/* Results */}
      {!loading && searched && (
        apps.length === 0 ? (
          <div className="card p-12 text-center">
            <PawPrint className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="font-display text-xl font-bold text-gray-500 mb-2">No applications found</h3>
            <p className="text-gray-400 mb-5">We couldn't find any applications for <strong>{email}</strong>.</p>
            <Link to="/pets" className="btn-primary">Browse Pets</Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-2">{apps.length} application{apps.length !== 1 ? "s" : ""} found</p>
            {apps.map((app) => (
              <div key={app.id} className="card p-0 overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  {/* Pet image */}
                  <div className="sm:w-36 h-32 sm:h-auto flex-shrink-0 bg-cream-dark">
                    <img
                      src={app.pet_image || "https://placehold.co/144x128/e9f5ee/2D6A4F?text=🐾"}
                      alt={app.pet_name || "Pet"}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://placehold.co/144x128/e9f5ee/2D6A4F?text=🐾"; }}
                    />
                  </div>
                  {/* Content */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-display text-lg font-bold text-gray-800">
                          {app.pet_name || "Unknown Pet"}
                        </h3>
                        <p className="text-xs text-gray-400">
                          Applied {app.applied_at
                            ? new Date(app.applied_at).toLocaleDateString("en-US", {
                                year: "numeric", month: "long", day: "numeric",
                              })
                            : "recently"}
                        </p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                    {app.message && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{app.message}</p>
                    )}
                    {app.admin_note && (
                      <div className={`text-xs px-3 py-2 rounded-lg ${
                        app.status === "approved"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-600"
                      }`}>
                        <strong>Admin note:</strong> {app.admin_note}
                      </div>
                    )}
                    {app.status === "approved" && (
                      <div className="mt-3 text-sm font-semibold text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Congratulations! Your adoption was approved. 🎉
                      </div>
                    )}
                    <div className="mt-3 flex gap-3 text-xs text-gray-400">
                      <span>🏠 {app.home_type}</span>
                      <span>·</span>
                      <span>{app.has_yard ? "Has yard ✓" : "No yard"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Pre-search prompt */}
      {!loading && !searched && (
        <div className="card p-12 text-center border-dashed border-2 border-cream-dark">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="font-display text-xl font-bold text-gray-400 mb-2">Enter your email above</h3>
          <p className="text-gray-400">We'll show all adoption applications linked to your email address.</p>
        </div>
      )}
    </div>
  );
}
