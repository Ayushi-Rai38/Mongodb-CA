import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, PawPrint } from "lucide-react";
import { petsApi } from "../api/client";
import PetCard from "../components/PetCard";
import FilterBar from "../components/FilterBar";
import LoadingSpinner from "../components/LoadingSpinner";

const DEFAULT_FILTERS = {
  search: "", species: "", gender: "", status: "available",
  vaccinated: "", location: "", age_min: "", age_max: "",
  sort: "created_at:desc",
};

export default function FindPet() {
  const [filters,  setFilters]  = useState(DEFAULT_FILTERS);
  const [pets,     setPets]     = useState([]);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const PER_PAGE = 12;

  const fetchPets = useCallback(async (currentFilters, currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const [sort_by, sort_dir] = (currentFilters.sort || "created_at:desc").split(":");
      const params = {
        page: currentPage,
        per_page: PER_PAGE,
        sort_by,
        sort_dir,
        ...(currentFilters.search    && { search:    currentFilters.search }),
        ...(currentFilters.species   && { species:   currentFilters.species }),
        ...(currentFilters.gender    && { gender:    currentFilters.gender }),
        ...(currentFilters.status    && { status:    currentFilters.status }),
        ...(currentFilters.location  && { location:  currentFilters.location }),
        ...(currentFilters.age_min   && { age_min:   Number(currentFilters.age_min) }),
        ...(currentFilters.age_max   && { age_max:   Number(currentFilters.age_max) }),
        ...(currentFilters.vaccinated !== "" && {
          vaccinated: currentFilters.vaccinated === "true",
        }),
      };
      const res = await petsApi.list(params);
      setPets(res.data.data || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced fetch on filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchPets(filters, 1);
    }, 350);
    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    fetchPets(filters, page);
  }, [page]);

  function handleClearFilters() {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="section-title">Find a Pet</h1>
        <p className="section-subtitle mb-0">
          Browse {total > 0 ? total : "all"} adorable pets looking for their forever home
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="lg:w-72 flex-shrink-0">
          <div className="sticky top-20">
            <FilterBar
              filters={filters}
              onChange={setFilters}
              onClear={handleClearFilters}
              totalResults={total}
            />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <LoadingSpinner message="Fetching pets…" />
          ) : error ? (
            <div className="card p-8 text-center">
              <p className="text-coral font-medium mb-2">Failed to load pets</p>
              <p className="text-sm text-gray-400 mb-4">{error}</p>
              <button onClick={() => fetchPets(filters, page)} className="btn-outline text-sm">
                Try Again
              </button>
            </div>
          ) : pets.length === 0 ? (
            <div className="card p-12 text-center">
              <PawPrint className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="font-display text-xl font-bold text-gray-500 mb-2">No pets found</h3>
              <p className="text-gray-400 mb-5">Try adjusting your filters or clear them to see all pets.</p>
              <button onClick={handleClearFilters} className="btn-outline">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {pets.map((pet) => (
                  <PetCard key={pet.id} pet={pet} />
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200
                               text-sm font-medium text-gray-600 hover:bg-forest-50
                               disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>

                  {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          page === p
                            ? "bg-forest-500 text-white"
                            : "border border-gray-200 text-gray-600 hover:bg-forest-50"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200
                               text-sm font-medium text-gray-600 hover:bg-forest-50
                               disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
