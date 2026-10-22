import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { petsApi, applicationsApi } from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";

const HOME_TYPE_OPTIONS = [
  { value: "apartment", label: "Apartment" },
  { value: "house",     label: "House" },
  { value: "condo",     label: "Condo" },
  { value: "farm",      label: "Farm" },
  { value: "other",     label: "Other" },
];

export default function AdoptionForm() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [pet,      setPet]      = useState(null);
  const [petLoading, setPetLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState(null);

  const [form, setForm] = useState({
    applicant_name:  "",
    applicant_email: "",
    applicant_phone: "",
    home_type:       "house",
    has_yard:        false,
    other_pets:      "",
    experience:      "",
    message:         "",
  });

  useEffect(() => {
    petsApi.get(id)
      .then((r) => setPet(r.data))
      .catch(() => setPet(null))
      .finally(() => setPetLoading(false));
  }, [id]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await applicationsApi.submit({ ...form, pet_id: id });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (petLoading) return <LoadingSpinner fullPage />;

  if (!pet) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertCircle className="w-12 h-12 text-coral" />
      <p className="text-gray-500">Pet not found.</p>
      <Link to="/pets" className="btn-outline">Browse Pets</Link>
    </div>
  );

  if (pet.status === "adopted") return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="text-6xl">💜</span>
      <h2 className="font-display text-2xl font-bold text-gray-700">{pet.name} has found a home!</h2>
      <p className="text-gray-400">This pet has already been adopted. Check out our other available pets.</p>
      <Link to="/pets" className="btn-primary">Find Another Pet</Link>
    </div>
  );

  if (success) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 text-center animate-slide-up">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>
      <h2 className="font-display text-3xl font-bold text-forest-700">Application Submitted! 🎉</h2>
      <p className="text-gray-500 max-w-md leading-relaxed">
        Your application for <strong>{pet.name}</strong> has been received. Our team will review it
        and contact you at <strong>{form.applicant_email}</strong> within 2–3 business days.
      </p>
      <div className="flex gap-4">
        <Link to="/my-applications" className="btn-primary">View My Applications</Link>
        <Link to="/pets" className="btn-outline">Browse More Pets</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-forest-600 text-sm font-medium mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Pet summary banner */}
      <div className="card mb-8 overflow-hidden">
        <div className="flex items-center gap-5 p-5">
          <img
            src={pet.image_url || "https://placehold.co/120x90/e9f5ee/2D6A4F?text=🐾"}
            alt={pet.name}
            className="w-24 h-24 rounded-xl object-cover flex-shrink-0 border-2 border-cream-dark"
            onError={(e) => { e.target.src = "https://placehold.co/120x90/e9f5ee/2D6A4F?text=🐾"; }}
          />
          <div>
            <p className="text-xs text-forest-500 font-semibold uppercase tracking-wide mb-1">Adopting</p>
            <h1 className="font-display text-2xl font-bold text-gray-800">{pet.name}</h1>
            <p className="text-gray-500 text-sm capitalize">{pet.species} · {pet.breed} · {pet.age}yr · {pet.gender}</p>
          </div>
        </div>
      </div>

      <h2 className="font-display text-2xl font-bold text-forest-700 mb-1">Adoption Application</h2>
      <p className="text-gray-500 text-sm mb-6">Tell us a little about yourself so we can find the right match.</p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal info */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-forest-500 text-white text-xs flex items-center justify-center">1</span>
            Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="applicant_name">
                Full Name <span className="text-coral">*</span>
              </label>
              <input id="applicant_name" type="text" required
                value={form.applicant_name}
                onChange={(e) => handleChange("applicant_name", e.target.value)}
                placeholder="Jane Doe"
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="applicant_email">
                Email Address <span className="text-coral">*</span>
              </label>
              <input id="applicant_email" type="email" required
                value={form.applicant_email}
                onChange={(e) => handleChange("applicant_email", e.target.value)}
                placeholder="jane@example.com"
                className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="applicant_phone">
              Phone Number <span className="text-coral">*</span>
            </label>
            <input id="applicant_phone" type="tel" required
              value={form.applicant_phone}
              onChange={(e) => handleChange("applicant_phone", e.target.value)}
              placeholder="555-0100"
              className="input-field max-w-xs" />
          </div>
        </div>

        {/* Living situation */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-forest-500 text-white text-xs flex items-center justify-center">2</span>
            Living Situation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="home_type">
                Home Type <span className="text-coral">*</span>
              </label>
              <select id="home_type" required
                value={form.home_type}
                onChange={(e) => handleChange("home_type", e.target.value)}
                className="select-field">
                {HOME_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <input type="checkbox" id="has_yard"
                checked={form.has_yard}
                onChange={(e) => handleChange("has_yard", e.target.checked)}
                className="w-4 h-4 accent-forest-500 cursor-pointer" />
              <label htmlFor="has_yard" className="text-sm text-gray-700 cursor-pointer">
                I have a yard / outdoor space
              </label>
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-forest-500 text-white text-xs flex items-center justify-center">3</span>
            Pet Experience
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="other_pets">
              Current Pets (if any)
            </label>
            <input id="other_pets" type="text"
              value={form.other_pets}
              onChange={(e) => handleChange("other_pets", e.target.value)}
              placeholder="e.g. One 3-year-old golden retriever"
              className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="experience">
              Pet Ownership Experience
            </label>
            <textarea id="experience" rows={3}
              value={form.experience}
              onChange={(e) => handleChange("experience", e.target.value)}
              placeholder="Tell us about your experience with pets…"
              className="input-field resize-none" />
          </div>
        </div>

        {/* Message */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-forest-500 text-white text-xs flex items-center justify-center">4</span>
            Your Message
          </h3>
          <textarea id="adoption_message" rows={4}
            value={form.message}
            onChange={(e) => handleChange("message", e.target.value)}
            placeholder={`Why do you want to adopt ${pet.name}? What kind of life will you provide?`}
            className="input-field resize-none" />
        </div>

        <button type="submit" disabled={submitting}
          className="btn-primary w-full text-base py-4 flex items-center justify-center gap-2">
          {submitting
            ? <><Loader className="w-4 h-4 animate-spin" /> Submitting…</>
            : <>Submit Application 🐾</>
          }
        </button>

        <p className="text-xs text-center text-gray-400">
          By submitting, you agree that we may contact you regarding your adoption application.
        </p>
      </form>
    </div>
  );
}
