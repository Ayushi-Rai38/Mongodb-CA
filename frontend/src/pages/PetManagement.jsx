import { useEffect, useState, useCallback } from "react";
import {
  Plus, Pencil, Trash2, X, Save, Loader, AlertCircle,
  PawPrint, Search, RefreshCw,
} from "lucide-react";
import { petsApi } from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";

const EMPTY_FORM = {
  name: "", species: "dog", breed: "", age: "", gender: "male",
  vaccinated: false, status: "available", location: "",
  description: "", image_url: "", good_with_kids: true, good_with_pets: true,
  color: "", weight_kg: "",
};

const SPECIES_OPTIONS = ["dog", "cat", "rabbit", "bird"];
const GENDER_OPTIONS  = ["male", "female"];
const STATUS_OPTIONS  = ["available", "pending", "adopted"];

function Modal({ pet, onClose, onSave }) {
  const [form,   setForm]   = useState(pet ? { ...pet } : { ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        age:       Number(form.age)       || 0,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : undefined,
      };
      if (pet?.id) {
        await petsApi.update(pet.id, payload);
      } else {
        await petsApi.create(payload);
      }
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function f(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-slide-up my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark">
          <h2 className="font-display text-xl font-bold text-forest-700">
            {pet?.id ? "Edit Pet" : "Add New Pet"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-cream-dark text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Name *</label>
              <input required value={form.name} onChange={(e) => f("name", e.target.value)}
                className="input-field" placeholder="Buddy" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Species *</label>
              <select required value={form.species} onChange={(e) => f("species", e.target.value)}
                className="select-field">
                {SPECIES_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Breed *</label>
              <input required value={form.breed} onChange={(e) => f("breed", e.target.value)}
                className="input-field" placeholder="Golden Retriever" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Age (years) *</label>
              <input required type="number" min="0" max="30" step="0.5"
                value={form.age} onChange={(e) => f("age", e.target.value)}
                className="input-field" placeholder="3" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Gender *</label>
              <select required value={form.gender} onChange={(e) => f("gender", e.target.value)}
                className="select-field">
                {GENDER_OPTIONS.map((g) => <option key={g} value={g} className="capitalize">{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status *</label>
              <select required value={form.status} onChange={(e) => f("status", e.target.value)}
                className="select-field">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Location *</label>
              <input required value={form.location} onChange={(e) => f("location", e.target.value)}
                className="input-field" placeholder="Austin, TX" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Color</label>
              <input value={form.color || ""} onChange={(e) => f("color", e.target.value)}
                className="input-field" placeholder="Golden" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Weight (kg)</label>
              <input type="number" min="0" step="0.1"
                value={form.weight_kg || ""} onChange={(e) => f("weight_kg", e.target.value)}
                className="input-field" placeholder="32" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Image URL</label>
            <input value={form.image_url} onChange={(e) => f("image_url", e.target.value)}
              className="input-field" placeholder="https://example.com/pet.jpg" />
            {form.image_url && (
              <img src={form.image_url} alt="preview"
                className="mt-2 h-24 w-36 object-cover rounded-lg border border-cream-dark"
                onError={(e) => { e.target.style.display = "none"; }} />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
            <textarea rows={3} value={form.description}
              onChange={(e) => f("description", e.target.value)}
              className="input-field resize-none" placeholder="Tell us about this pet…" />
          </div>

          <div className="flex flex-wrap gap-5">
            {[
              { field: "vaccinated",    label: "Vaccinated"      },
              { field: "good_with_kids", label: "Good with Kids" },
              { field: "good_with_pets", label: "Good with Pets" },
            ].map(({ field, label }) => (
              <label key={field} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input type="checkbox" checked={!!form[field]}
                  onChange={(e) => f(field, e.target.checked)}
                  className="w-4 h-4 accent-forest-500" />
                {label}
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-2 border-t border-cream-dark">
            <button type="submit" disabled={saving}
              className="btn-primary flex items-center gap-2 flex-1">
              {saving ? <><Loader className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Pet</>}
            </button>
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PetManagement() {
  const isAdmin = !!localStorage.getItem("pawpal_admin_key");
  const [pets,      setPets]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState("");
  const [modal,     setModal]     = useState(null); // null | "new" | pet object
  const [deleting,  setDeleting]  = useState(null);
  const [deleteErr, setDeleteErr] = useState(null);

  const PER_PAGE = 15;

  const fetchPets = useCallback(async (pg = 1, q = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: pg, per_page: PER_PAGE, sort_by: "created_at", sort_dir: "desc" };
      if (q) params.search = q;
      const res = await petsApi.list(params);
      setPets(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchPets(1, search); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { fetchPets(page, search); }, [page]);

  async function handleDelete(pet) {
    if (!window.confirm(`Delete ${pet.name}? This cannot be undone.`)) return;
    setDeleting(pet.id);
    setDeleteErr(null);
    try {
      await petsApi.remove(pet.id);
      fetchPets(page, search);
    } catch (err) {
      setDeleteErr(err.message);
    } finally {
      setDeleting(null);
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <PawPrint className="w-12 h-12 text-gray-300" />
        <h2 className="font-display text-2xl font-bold text-gray-600">Admin Access Required</h2>
      </div>
    );
  }

  const pages = Math.ceil(total / PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title mb-1">Pet Management</h1>
          <p className="text-gray-400 text-sm">{total} pets in database</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => fetchPets(page, search)}
            className="btn-ghost flex items-center gap-1.5 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={() => setModal("new")} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Pet
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text" value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pets…"
          className="input-field pl-9 text-sm py-2.5"
        />
      </div>

      {deleteErr && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" /> {deleteErr}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="card p-8 text-center text-coral">{error}</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-forest-50 border-b border-cream-dark">
                <tr>
                  {["Pet", "Species", "Breed", "Age", "Gender", "Vaccinated", "Status", "Location", "Actions"]
                    .map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-dark">
                {pets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400">
                      <PawPrint className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      No pets found
                    </td>
                  </tr>
                ) : pets.map((pet) => (
                  <tr key={pet.id} className="hover:bg-cream/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={pet.image_url || "https://placehold.co/40x40/e9f5ee/2D6A4F?text=🐾"}
                          alt={pet.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-cream-dark"
                          onError={(e) => { e.target.src = "https://placehold.co/40x40/e9f5ee/2D6A4F?text=🐾"; }}
                        />
                        <span className="font-semibold text-gray-700">{pet.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600">{pet.species}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[120px] truncate">{pet.breed}</td>
                    <td className="px-4 py-3 text-gray-600">{pet.age}yr</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{pet.gender}</td>
                    <td className="px-4 py-3">
                      {pet.vaccinated
                        ? <span className="text-green-600 font-medium text-xs">✓ Yes</span>
                        : <span className="text-gray-400 text-xs">No</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${
                        pet.status === "available" ? "badge-available" :
                        pet.status === "pending"   ? "badge-pending"   : "badge-adopted"
                      }`}>
                        {pet.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[120px] truncate">{pet.location}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => setModal(pet)}
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                          title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(pet)}
                          disabled={deleting === pet.id}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                          title="Delete">
                          {deleting === pet.id
                            ? <Loader className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-cream-dark">
              <span className="text-xs text-gray-400">
                Page {page} of {pages} · {total} pets
              </span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600
                             hover:bg-forest-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  Prev
                </button>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600
                             hover:bg-forest-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal
          pet={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchPets(page, search); }}
        />
      )}
    </div>
  );
}
