import { Link } from "react-router-dom";
import { MapPin, Calendar, Shield, Heart } from "lucide-react";

const SPECIES_EMOJI = { dog: "🐶", cat: "🐱", rabbit: "🐰", bird: "🐦" };

function StatusBadge({ status }) {
  const cls = {
    available: "badge-available",
    pending:   "badge-pending",
    adopted:   "badge-adopted",
  };
  return <span className={cls[status] || "badge bg-gray-100 text-gray-600"}>{status}</span>;
}

export default function PetCard({ pet, onFavorite }) {
  const emoji = SPECIES_EMOJI[pet.species] || "🐾";

  return (
    <article className="card card-hover group cursor-pointer flex flex-col h-full">
      {/* Image */}
      <Link to={`/pets/${pet.id}`} className="block overflow-hidden aspect-[4/3] relative bg-cream-dark">
        <img
          src={pet.image_url || `https://placehold.co/400x300/e9f5ee/2D6A4F?text=${emoji}`}
          alt={pet.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = `https://placehold.co/400x300/e9f5ee/2D6A4F?text=${emoji}`;
          }}
        />
        {/* Status badge overlay */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={pet.status} />
        </div>
        {/* Species pill */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full px-2 py-0.5
                        text-xs font-medium text-forest-600 capitalize flex items-center gap-1">
          {emoji} {pet.species}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display font-bold text-lg text-gray-800 leading-tight">
              <Link to={`/pets/${pet.id}`} className="hover:text-forest-600 transition-colors">
                {pet.name}
              </Link>
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{pet.breed}</p>
          </div>
          <button
            onClick={() => onFavorite && onFavorite(pet.id)}
            aria-label="Favourite"
            className="text-gray-300 hover:text-coral transition-colors flex-shrink-0 mt-0.5"
          >
            <Heart className="w-5 h-5" />
          </button>
        </div>

        {/* Details row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {pet.age === 1 ? "1 year" : `${pet.age} years`}
          </span>
          <span className="capitalize">{pet.gender}</span>
          {pet.vaccinated && (
            <span className="flex items-center gap-1 text-green-600 font-medium">
              <Shield className="w-3.5 h-3.5" /> Vaccinated
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-400">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{pet.location}</span>
        </div>

        {/* Description snippet */}
        {pet.description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">
            {pet.description}
          </p>
        )}

        {/* CTA */}
        <div className="mt-auto pt-2">
          {pet.status === "available" ? (
            <Link to={`/adopt/${pet.id}`} className="btn-primary w-full text-center text-sm py-2.5 block">
              Adopt Me 🐾
            </Link>
          ) : (
            <Link to={`/pets/${pet.id}`}
              className="btn-outline w-full text-center text-sm py-2.5 block">
              View Details
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
