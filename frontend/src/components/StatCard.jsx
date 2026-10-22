import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ title, value, subtitle, icon: Icon, color = "forest", trend }) {
  const colorMap = {
    forest: "bg-forest-50  text-forest-600 border-forest-100",
    amber:  "bg-amber-50   text-amber-600  border-amber-100",
    coral:  "bg-red-50     text-red-500    border-red-100",
    purple: "bg-purple-50  text-purple-600 border-purple-100",
    blue:   "bg-blue-50    text-blue-600   border-blue-100",
    green:  "bg-green-50   text-green-600  border-green-100",
  };
  const iconBg = colorMap[color] || colorMap.forest;

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${
            trend >= 0 ? "text-green-600" : "text-red-500"
          }`}>
            {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value ?? "–"}</p>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
