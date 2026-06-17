import { TrendingUp } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  subtitle?: string;
}

export default function StatCard({ label, value, icon, color, trend, subtitle }: StatCardProps) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-sm text-gray-500 mt-0.5">{label}</div>
        {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-green-600 text-xs font-medium flex-shrink-0">
          <TrendingUp className="w-3.5 h-3.5" />
          {trend}
        </div>
      )}
    </div>
  );
}
