import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Calendar, Shield, Heart, Users,
  CheckCircle, XCircle, Clock, PawPrint
} from "lucide-react";
import { petsApi } from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";

const SPECIES_EMOJI = { dog: "🐶", cat: "🐱", rabbit: "🐰", bird: "🐦" };

function InfoPill({ icon: Icon, label, value, highlight }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl ${
      highlight ? "bg-forest-50 border border-forest-100" : "bg-cream-dark"
    }`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        highlight ? "bg-forest-100" : "bg-white"
      }`}>
        <Icon className={`w-4 h-4 ${highlight ? "text-forest-600" : "text-gray-500"}`} />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-sm font-semibold ${highlight ? "text-forest-700" : "text-gray-700"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default function PetDetails() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [pet,      setPet]      = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    petsApi.get(id)
      .then((r) => setPet(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner fullPage message="Loading pet profile…" />;
  if (error)   return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
      <XCircle className="w-12 h-12 text-coral" />
      <p className="text-gray-500 text-center">{error}</p>
      <button onClick={() => navigate(-1)} className="btn-outline">Go Back</button>
    </div>
  );
  if (!pet) return null;

  const emoji = SPECIES_EMOJI[pet.species] || "🐾";
  const statusConfig = {
    available: { cls: "badge-available", icon: CheckCircle, label: "Available for Adoption" },
    pending:   { cls: "badge-pending",   icon: Clock,       label: "Adoption Pending"         },
    adopted:   { cls: "badge-adopted",   icon: Heart,       label: "Already Adopted"          },
  };
  const sc = statusConfig[pet.status] || statusConfig.available;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-forest-600 transition-colors mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image */}
        <div className="relative">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-card-hover bg-cream-dark">
            <img
              src={pet.image_url || `https://placehold.co/600x450/e9f5ee/2D6A4F?text=${emoji}`}
              alt={pet.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = `https://placehold.co/600x450/e9f5ee/2D6A4F?text=${emoji}`; }}
            />
          </div>
          {/* Status overlay */}
          <div className="absolute top-4 left-4">
            <span className={`${sc.cls} text-sm px-4 py-1.5`}>{sc.label}</span>
          </div>
          {pet.vaccinated && (
            <div className="absolute top-4 right-4 bg-white rounded-xl px-3 py-1.5 shadow-md
                            flex items-center gap-1.5 text-green-600 text-sm font-semibold">
              <Shield className="w-4 h-4" /> Vaccinated
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-6">
          {/* Name & breed */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-4xl">{emoji}</span>
              <div>
                <h1 className="font-display text-4xl font-bold text-gray-800">{pet.name}</h1>
                <p className="text-gray-500 font-medium">{pet.breed} · <span className="capitalize">{pet.species}</span></p>
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoPill icon={Calendar} label="Age"      value={`${pet.age} ${pet.age === 1 ? "year" : "years"}`} />
            <InfoPill icon={Users}    label="Gender"   value={pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)} />
            <InfoPill icon={MapPin}   label="Location" value={pet.location} />
            {pet.color && (
              <InfoPill icon={PawPrint} label="Colour" value={pet.color} />
            )}
          </div>

          {/* Compatibility */}
          <div className="flex gap-3">
            {[
              { label: "Good with Kids", val: pet.good_with_kids },
              { label: "Good with Pets", val: pet.good_with_pets },
            ].map((c) => (
              <div key={c.label}
                className={`flex-1 flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
                  c.val ? "bg-green-50 text-green-700" : "bg-red-50 text-red-500"
                }`}>
                {c.val ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
                {c.label}
              </div>
            ))}
          </div>

          {/* Description */}
          {pet.description && (
            <div className="bg-cream-dark rounded-2xl p-5">
              <h3 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">About {pet.name}</h3>
              <p className="text-gray-600 leading-relaxed">{pet.description}</p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-auto pt-2 flex gap-3">
            {pet.status === "available" ? (
              <Link to={`/adopt/${pet.id}`} className="btn-primary flex-1 text-center text-base">
                Adopt {pet.name} 🐾
              </Link>
            ) : (
              <div className={`flex-1 text-center py-3 px-6 rounded-xl font-semibold text-sm ${
                pet.status === "adopted"
                  ? "bg-purple-100 text-purple-600"
                  : "bg-yellow-100 text-yellow-700"
              }`}>
                <sc.icon className="w-4 h-4 inline mr-2" />
                {sc.label}
              </div>
            )}
            <Link to="/pets" className="btn-outline px-5">Browse More</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
