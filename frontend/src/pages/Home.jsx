import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PawPrint, Heart, Shield, Users, ArrowRight } from "lucide-react";
import { petsApi, analyticsApi } from "../api/client";
import PetCard from "../components/PetCard";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";

const HERO_PETS = [
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&q=80",
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&q=80",
  "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=500&q=80",
];

export default function Home() {
  const [summary,      setSummary]      = useState(null);
  const [featuredPets, setFeaturedPets] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [heroIdx,      setHeroIdx]      = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [sumRes, petsRes] = await Promise.all([
          analyticsApi.summary(),
          petsApi.list({ status: "available", per_page: 6, sort_by: "created_at", sort_dir: "desc" }),
        ]);
        setSummary(sumRes.data);
        setFeaturedPets(petsRes.data.data || []);
      } catch (_) {
        // silently degrade
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Cycle hero images
  useEffect(() => {
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_PETS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="animate-fade-in">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden min-h-[88vh] flex items-center">
        {/* Background pet images */}
        <div className="absolute inset-0">
          {HERO_PETS.map((src, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: heroIdx === i ? 0.18 : 0 }}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-forest-900/90 via-forest-900/70 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full
                            px-4 py-2 text-white/90 text-sm font-medium mb-6 border border-white/20">
              <PawPrint className="w-4 h-4" />
              {summary?.available_pets ?? "…"} pets waiting for a home
            </div>
            <h1 className="font-display text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
              Find Your
              <br />
              <span className="text-amber">Perfect</span> Companion
            </h1>
            <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-lg">
              Give a rescued pet a loving forever home. Browse dogs, cats, rabbits, and birds
              from shelters near you — each one waiting to change your life.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/pets" className="btn-secondary flex items-center gap-2 text-base">
                Find a Pet <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/my-applications"
                className="border-2 border-white/40 text-white px-6 py-3 rounded-xl font-semibold
                           hover:bg-white/10 transition-all duration-200 text-base">
                My Applications
              </Link>
            </div>
          </div>

          {/* Floating pet image card */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-4 bg-amber/20 rounded-3xl blur-2xl" />
              <img
                src={HERO_PETS[heroIdx]}
                alt="Featured pet"
                className="relative rounded-3xl shadow-2xl w-full h-80 object-cover
                           transition-all duration-1000 border-4 border-white/20"
              />
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-coral fill-coral" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Already adopted</p>
                  <p className="font-bold text-gray-800">{summary?.adopted_pets ?? "…"} pets 🎉</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C480,0 960,0 1440,60 L1440,60 L0,60 Z" fill="#FDF6EC" />
          </svg>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { title: "Total Pets",       value: summary?.total_pets,         icon: PawPrint, color: "forest" },
            { title: "Available Now",    value: summary?.available_pets,     icon: Heart,    color: "green"  },
            { title: "Applications",     value: summary?.total_applications, icon: Users,    color: "blue"   },
            { title: "Happy Adoptions",  value: summary?.adopted_pets,       icon: Shield,   color: "amber"  },
          ].map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </div>
      </section>

      {/* ── Featured pets ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title">Meet Our Pets</h2>
            <p className="section-subtitle mb-0">Available and waiting for a forever home</p>
          </div>
          <Link to="/pets"
            className="hidden sm:flex items-center gap-1 text-forest-600 font-medium hover:text-forest-700 text-sm">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : featuredPets.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <PawPrint className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No pets available right now. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/pets" className="btn-outline inline-flex items-center gap-2">
            Browse All Pets <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Why adopt section ─────────────────────────── */}
      <section className="bg-forest-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Why Adopt with PawPal?</h2>
            <p className="section-subtitle">We make the journey simple, safe and joyful</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "🔍", title: "Smart Search", desc: "Filter by species, age, location, vaccination status, and more to find your perfect match." },
              { icon: "📋", title: "Easy Applications", desc: "Our simple online adoption form gets processed quickly. Track your status in real time." },
              { icon: "🏡", title: "Lifetime Support", desc: "Our adoption counsellors are here to help before, during, and after you bring your new friend home." },
            ].map((f, i) => (
              <div key={i} className="text-center p-8 bg-white rounded-2xl shadow-card">
                <span className="text-5xl">{f.icon}</span>
                <h3 className="font-display font-bold text-xl text-forest-700 mt-4 mb-2">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="hero-gradient rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 text-white text-8xl flex items-center justify-center">
            🐾🐾🐾
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-3 relative">
            Ready to change a life?
          </h2>
          <p className="text-white/80 mb-6 relative">
            Hundreds of loving pets are waiting. Find yours today.
          </p>
          <Link to="/pets" className="btn-secondary inline-flex items-center gap-2 relative">
            Find Your Pet <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
