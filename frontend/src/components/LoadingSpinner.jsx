import { PawPrint } from "lucide-react";

export default function LoadingSpinner({ message = "Loading…", fullPage = false }) {
  const inner = (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-forest-100 border-t-forest-500 animate-spin" />
        <PawPrint className="absolute inset-0 m-auto w-5 h-5 text-forest-400 animate-pulse-soft" />
      </div>
      <p className="text-sm text-gray-500 font-medium">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {inner}
      </div>
    );
  }
  return <div className="flex items-center justify-center py-12">{inner}</div>;
}
