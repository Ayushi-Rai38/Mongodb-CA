import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, PawPrint, Users, TrendingUp, Heart,
  FileText, Cat, AlertCircle, RefreshCw,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import { analyticsApi } from "../api/client";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";

const COLORS = ["#2D6A4F", "#50a484", "#F4A261", "#E76F51", "#9b5de5", "#00b4d8"];
const SPECIES_COLORS = { dog: "#2D6A4F", cat: "#F4A261", rabbit: "#50a484", bird: "#00b4d8" };

function ChartCard({ title, children, className = "" }) {
  return (
    <div className={`card p-6 ${className}`}>
      <h3 className="font-semibold text-gray-700 mb-5 text-sm uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

export default function AdminDashboard() {
  const isAdmin = !!localStorage.getItem("pawpal_admin_key");
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const [summary, bySpecies, byStatus, monthly, avgAge, topPets, rate] = await Promise.all([
        analyticsApi.summary(),
        analyticsApi.bySpecies(),
        analyticsApi.byStatus(),
        analyticsApi.monthlyTrends(),
        analyticsApi.avgAgeBySpecies(),
        analyticsApi.topApplied(),
        analyticsApi.adoptionRate(),
      ]);
      setData({
        summary:  summary.data,
        bySpecies: bySpecies.data,
        byStatus:  byStatus.data,
        monthly:   monthly.data,
        avgAge:    avgAge.data,
        topPets:   topPets.data,
        rate:      rate.data,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <LayoutDashboard className="w-12 h-12 text-gray-300" />
        <h2 className="font-display text-2xl font-bold text-gray-600">Admin Access Required</h2>
        <p className="text-gray-400">Please log in as an admin using the Navbar button.</p>
      </div>
    );
  }

  if (loading) return <LoadingSpinner fullPage message="Loading analytics…" />;

  if (error) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertCircle className="w-12 h-12 text-coral" />
      <p className="text-gray-500">{error}</p>
      <button onClick={fetchAll} className="btn-outline flex items-center gap-2">
        <RefreshCw className="w-4 h-4" /> Retry
      </button>
    </div>
  );

  const s = data.summary;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title mb-1">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm">Real-time insights from MongoDB</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchAll}
            className="btn-outline text-sm flex items-center gap-2 py-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <Link to="/admin/pets"
            className="btn-primary text-sm flex items-center gap-2 py-2">
            <Cat className="w-4 h-4" /> Manage Pets
          </Link>
          <Link to="/admin/applications"
            className="btn-outline text-sm flex items-center gap-2 py-2">
            <FileText className="w-4 h-4" /> Applications
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Pets"         value={s.total_pets}            icon={PawPrint}    color="forest" />
        <StatCard title="Available"          value={s.available_pets}        icon={Heart}       color="green"  />
        <StatCard title="Pending Adoption"   value={s.pending_pets}          icon={TrendingUp}  color="amber"  />
        <StatCard title="Adopted"            value={s.adopted_pets}          icon={Users}       color="purple" />
        <StatCard title="Total Applications" value={s.total_applications}    icon={FileText}    color="blue"   />
        <StatCard title="Pending Apps"       value={s.pending_applications}  icon={AlertCircle} color="amber"  />
        <StatCard title="Approved Apps"      value={s.approved_applications} icon={Heart}       color="green"  />
        <StatCard title="Adoption Rate"
          value={`${data.rate.rate_percent}%`}
          icon={TrendingUp} color="forest"
          subtitle={`${data.rate.adopted_pets}/${data.rate.total_pets} pets adopted`}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Species pie */}
        <ChartCard title="Pets by Species">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data.bySpecies} dataKey="count" nameKey="species"
                   cx="50%" cy="50%" outerRadius={90} innerRadius={45}
                   paddingAngle={3} label={({ species, percent }) =>
                     `${species} ${(percent * 100).toFixed(0)}%`
                   }>
                {data.bySpecies.map((entry, i) => (
                  <Cell key={i}
                    fill={SPECIES_COLORS[entry.species] || COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Application status bar */}
        <ChartCard title="Applications by Status">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.byStatus} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="status" tick={{ fontSize: 12, textTransform: "capitalize" }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[6,6,0,0]}>
                {data.byStatus.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly trend line */}
        <ChartCard title="Monthly Application Trends">
          {data.monthly.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
              Not enough data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2D6A4F"
                  strokeWidth={2.5} dot={{ r: 5, fill: "#2D6A4F" }}
                  activeDot={{ r: 7 }} name="Applications" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Avg age bar */}
        <ChartCard title="Average Pet Age by Species">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.avgAge} barSize={50}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="species" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} label={{ value: "yrs", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v} yrs`, "Avg Age"]} />
              <Bar dataKey="avg_age" radius={[6,6,0,0]}>
                {data.avgAge.map((entry, i) => (
                  <Cell key={i}
                    fill={SPECIES_COLORS[entry.species] || COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top applied pets */}
      <ChartCard title="Most Applied-For Pets">
        {data.topPets.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No application data yet</p>
        ) : (
          <div className="space-y-3">
            {data.topPets.map((p, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-lg font-bold text-gray-300 w-6">#{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {p.pet_name || "Unknown"} <span className="text-gray-400 capitalize">({p.pet_species})</span>
                    </span>
                    <span className="text-sm font-bold text-forest-600">
                      {p.application_count} apps
                    </span>
                  </div>
                  <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-forest-500 rounded-full transition-all"
                      style={{
                        width: `${(p.application_count / (data.topPets[0]?.application_count || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ChartCard>
    </div>
  );
}
