import { RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NAV_ORDER = [
  { id: "overview",    path: "/onboarding" },
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

const TopBar = ({ onReplay, breadcrumb = "Buildings › Meridian Condominium Association, Inc. › Onboarding", activeItem }: TopBarProps) => {
  const navigate = useNavigate();

  const currentIndex = NAV_ORDER.findIndex((n) => n.id === activeItem);
  const prevPath = currentIndex > 0 ? NAV_ORDER[currentIndex - 1].path : null;
  const nextPath = currentIndex >= 0 && currentIndex < NAV_ORDER.length - 1 ? NAV_ORDER[currentIndex + 1].path : null;

  return (
    <div className="flex items-center justify-between mb-8">
      <p className="text-[18px] text-breadcrumb">
        {breadcrumb}
      </p>
      <div className="flex items-center gap-4">
        {/* Prev / Next */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => prevPath && navigate(prevPath)}
            disabled={!prevPath}
            className="flex items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ width: 40, height: 40 }}
            title="Previous"
          >
            <ChevronLeft size={20} className="text-breadcrumb" />
          </button>
          <button
            onClick={() => nextPath && navigate(nextPath)}
            disabled={!nextPath}
            className="flex items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ width: 40, height: 40 }}
            title="Next"
          >
            <ChevronRight size={20} className="text-breadcrumb" />
          </button>
        </div>

        <button
          onClick={onReplay}
          className="flex items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-secondary"
          style={{ width: 40, height: 40 }}
        >
          <RotateCcw size={18} className="text-breadcrumb" />
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[19px] font-medium text-heading">RECollab Admin</p>
            <p className="text-[17px] text-breadcrumb">Platform Administrator</p>
          </div>
          <div
            className="flex items-center justify-center rounded-full text-primary-foreground text-[18px] font-semibold"
            style={{ width: 44, height: 44, background: "#4D6BA9" }}
          >
            RA
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
