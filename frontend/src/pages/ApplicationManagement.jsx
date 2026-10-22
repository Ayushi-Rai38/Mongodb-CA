import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle, XCircle, Clock, AlertCircle, RefreshCw,
  FileText, Loader, ChevronDown,
} from "lucide-react";
import { applicationsApi } from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";

function StatusBadge({ status }) {
  const map = {
    pending:  { cls: "badge-pending",  icon: Clock,       label: "Pending"  },
    approved: { cls: "badge-approved", icon: CheckCircle, label: "Approved" },
    rejected: { cls: "badge-rejected", icon: XCircle,     label: "Rejected" },
  };
  const { cls, icon: Icon, label } = map[status] || map.pending;
  return (
    <span className={`${cls} flex items-center gap-1`}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
}

function NoteModal({ appId, action, onClose, onConfirm }) {
  const [note,    setNote]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onConfirm(appId, action, note);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-slide-up">
        <h3 className={`font-display text-xl font-bold mb-1 ${
          action === "approved" ? "text-green-600" : "text-red-600"
        }`}>
          {action === "approved" ? "✓ Approve Application" : "✗ Reject Application"}
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          {action === "approved"
            ? "The pet will be marked as Adopted and all other applications for this pet will be rejected."
            : "The applicant will be notified of the rejection. The pet may be restored to Available."}
        </p>
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Admin Note (optional)
            </label>
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)}
              className="input-field resize-none text-sm"
              placeholder="Leave a note for the applicant…" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm
                         transition-all ${
                           action === "approved"
                             ? "bg-green-500 hover:bg-green-600 text-white"
                             : "bg-red-500 hover:bg-red-600 text-white"
                         }`}>
              {loading
                ? <Loader className="w-4 h-4 animate-spin" />
                : action === "approved" ? "Confirm Approval" : "Confirm Rejection"}
            </button>
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ApplicationManagement() {
  const isAdmin = !!localStorage.getItem("pawpal_admin_key");
  const [apps,     setApps]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [filter,   setFilter]   = useState("");
  const [modal,    setModal]    = useState(null); // { appId, action }
  const [expanded, setExpanded] = useState(null);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filter) params.status = filter;
      const res = await applicationsApi.listAll(params);
      setApps(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  async function handleStatusUpdate(appId, status, adminNote) {
    await applicationsApi.updateStatus(appId, { status, admin_note: adminNote || null });
    fetchApps();
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <FileText className="w-12 h-12 text-gray-300" />
        <h2 className="font-display text-2xl font-bold text-gray-600">Admin Access Required</h2>
      </div>
    );
  }

  const pendingCount  = apps.filter((a) => a.status === "pending").length;
  const approvedCount = apps.filter((a) => a.status === "approved").length;
  const rejectedCount = apps.filter((a) => a.status === "rejected").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title mb-1">Application Management</h1>
          <p className="text-gray-400 text-sm">{apps.length} total applications</p>
        </div>
        <button onClick={fetchApps}
          className="btn-outline text-sm flex items-center gap-2 py-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending",  count: pendingCount,  color: "bg-yellow-50 text-yellow-700 border-yellow-100" },
          { label: "Approved", count: approvedCount, color: "bg-green-50  text-green-700  border-green-100"  },
          { label: "Rejected", count: rejectedCount, color: "bg-red-50    text-red-600    border-red-100"    },
        ].map((s) => (
          <button key={s.label}
            onClick={() => setFilter(filter === s.label.toLowerCase() ? "" : s.label.toLowerCase())}
            className={`p-4 rounded-xl border text-center transition-all ${s.color} ${
              filter === s.label.toLowerCase() ? "ring-2 ring-offset-1 ring-forest-400" : "opacity-80 hover:opacity-100"
            }`}>
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-sm font-medium">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-4">
        {["", "pending", "approved", "rejected"].map((f) => (
          <button key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
              filter === f
                ? "bg-forest-500 text-white"
                : "bg-cream-dark text-gray-600 hover:bg-forest-100"
            }`}>
            {f || "All"}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : apps.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="font-display text-xl font-bold text-gray-400 mb-2">No applications found</h3>
          <p className="text-gray-400 text-sm">
            {filter ? `No ${filter} applications yet.` : "No applications have been submitted yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <div key={app.id} className="card overflow-hidden">
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                {/* Pet image */}
                <img
                  src={app.pet_image || "https://placehold.co/56x56/e9f5ee/2D6A4F?text=🐾"}
                  alt={app.pet_name}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-cream-dark"
                  onError={(e) => { e.target.src = "https://placehold.co/56x56/e9f5ee/2D6A4F?text=🐾"; }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {app.applicant_name}
                        <span className="text-gray-400 font-normal text-xs ml-2">
                          ({app.applicant_email})
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Applying for <strong className="text-forest-600">{app.pet_name || "Unknown Pet"}</strong>
                        {app.applied_at && (
                          <span className="ml-2 text-gray-400">
                            · {new Date(app.applied_at).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={app.status} />
                      <button onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                        className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-cream-dark">
                        <ChevronDown className={`w-4 h-4 transition-transform ${expanded === app.id ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action buttons (pending only) */}
                {app.status === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setModal({ appId: app.id, action: "approved" })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500
                                 hover:bg-green-600 text-white text-sm font-medium transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => setModal({ appId: app.id, action: "rejected" })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500
                                 hover:bg-red-600 text-white text-sm font-medium transition-colors">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>

              {/* Expanded details */}
              {expanded === app.id && (
                <div className="border-t border-cream-dark bg-cream/50 px-4 py-4 text-sm
                                grid grid-cols-2 sm:grid-cols-3 gap-3 animate-fade-in">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                    <p className="text-gray-700 font-medium">{app.applicant_phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Home Type</p>
                    <p className="text-gray-700 font-medium capitalize">{app.home_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Has Yard</p>
                    <p className="text-gray-700 font-medium">{app.has_yard ? "Yes" : "No"}</p>
                  </div>
                  {app.other_pets && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400 mb-0.5">Other Pets</p>
                      <p className="text-gray-700">{app.other_pets}</p>
                    </div>
                  )}
                  {app.experience && (
                    <div className="col-span-3">
                      <p className="text-xs text-gray-400 mb-0.5">Experience</p>
                      <p className="text-gray-700">{app.experience}</p>
                    </div>
                  )}
                  {app.message && (
                    <div className="col-span-3">
                      <p className="text-xs text-gray-400 mb-0.5">Message</p>
                      <p className="text-gray-700 italic">"{app.message}"</p>
                    </div>
                  )}
                  {app.admin_note && (
                    <div className={`col-span-3 p-2 rounded-lg text-xs ${
                      app.status === "approved" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                    }`}>
                      <strong>Admin note:</strong> {app.admin_note}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirmation modal */}
      {modal && (
        <NoteModal
          appId={modal.appId}
          action={modal.action}
          onClose={() => setModal(null)}
          onConfirm={handleStatusUpdate}
        />
      )}
    </div>
  );
}
