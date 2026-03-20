import { RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NAV_ORDER = [
  { id: "overview",    path: "/" },
  { id: "inventory",   path: "/inventory" },
  { id: "financials",  path: "/financials" },
  { id: "projects",    path: "/projects" },
  { id: "marketplace", path: "/marketplace" },
  { id: "funding",     path: "/funding" },
  { id: "insurance",   path: "/insurance" },
  { id: "reports",     path: "/reports" },
];

interface TopBarProps {
  onReplay?: () => void;
  breadcrumb?: string;
  activeItem?: string;
}

const TopBar = ({ onReplay, breadcrumb = "Buildings › ABC Condominium Association, Inc. › Onboarding", activeItem }: TopBarProps) => {
  const navigate = useNavigate();

  const currentIndex = NAV_ORDER.findIndex((n) => n.id === activeItem);
  const prevPath = currentIndex > 0 ? NAV_ORDER[currentIndex - 1].path : null;
  const nextPath = currentIndex >= 0 && currentIndex < NAV_ORDER.length - 1 ? NAV_ORDER[currentIndex + 1].path : null;

  return (
    <div className="flex items-center justify-between mb-8">
      <p className="text-[13px] text-breadcrumb">
        {breadcrumb}
      </p>
      <div className="flex items-center gap-4">
        {/* Prev / Next */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => prevPath && navigate(prevPath)}
            disabled={!prevPath}
            className="flex items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ width: 32, height: 32 }}
            title="Previous"
          >
            <ChevronLeft size={16} className="text-breadcrumb" />
          </button>
          <button
            onClick={() => nextPath && navigate(nextPath)}
            disabled={!nextPath}
            className="flex items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ width: 32, height: 32 }}
            title="Next"
          >
            <ChevronRight size={16} className="text-breadcrumb" />
          </button>
        </div>

        <button
          onClick={onReplay}
          className="flex items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-secondary"
          style={{ width: 32, height: 32 }}
        >
          <RotateCcw size={14} className="text-breadcrumb" />
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[14px] font-medium text-heading">RECollab Admin</p>
            <p className="text-[12px] text-breadcrumb">Platform Administrator</p>
          </div>
          <div
            className="flex items-center justify-center rounded-full text-primary-foreground text-[13px] font-semibold"
            style={{ width: 36, height: 36, background: "#4F6BFF" }}
          >
            RA
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
