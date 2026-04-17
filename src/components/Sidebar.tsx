import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, DollarSign, Wrench, Store, Landmark, Shield, FileText, Check
} from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  icon: LucideIcon;
  id: string;
  path: string;
}

const navItemsList: NavItem[] = [
  { label: "Onboarding", icon: LayoutDashboard, id: "overview", path: "/onboarding" },
  { label: "Inventory", icon: Package, id: "inventory", path: "/inventory" },
  { label: "Financials", icon: DollarSign, id: "financials", path: "/financials" },
  { label: "Projects", icon: Wrench, id: "projects", path: "/projects" },
  { label: "Marketplace", icon: Store, id: "marketplace", path: "/marketplace" },
  { label: "Funding", icon: Landmark, id: "funding", path: "/funding" },
  { label: "Insurance", icon: Shield, id: "insurance", path: "/insurance" },
  { label: "Reports", icon: FileText, id: "reports", path: "/reports" },
];

interface SidebarProps {
  activeItem: string;
  visitedItems: string[];
}

const Sidebar = ({ activeItem, visitedItems }: SidebarProps) => {
  const navigate = useNavigate();
  const currentIndex = navItemsList.findIndex((item) => item.id === activeItem);
  const progress = (currentIndex + 1) / navItemsList.length;

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 flex flex-col justify-between z-50"
      style={{
        width: 320,
        background: "linear-gradient(180deg, rgba(77,107,169,0.03) 0%, transparent 100%), hsl(var(--sidebar-bg))",
      }}
    >
      {/* Logo */}
      <div>
        <div className="px-6 pt-7 pb-8">
          <span className="text-[26px] font-bold tracking-tight">
            <span className="text-sidebar-text-active">RECO</span>
            <span className="text-sidebar-text-active">study</span>
            <sup className="text-[14px] text-sidebar-text ml-0.5 -top-2 relative">™</sup>
          </span>
        </div>

        {/* Nav Items */}
        <nav className="px-3 flex flex-col gap-1">
          {navItemsList.map((item) => {
            const isActive = item.id === activeItem;
            const isVisited = visitedItems.includes(item.id);
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                onClick={() => navigate(item.path)}
                className="relative flex items-center gap-3 rounded-md transition-colors cursor-pointer hover:bg-sidebar-bg-hover"
                style={{
                  height: 54,
                  paddingLeft: isActive ? 17 : 20,
                  paddingRight: 16,
                  background: isActive ? "hsl(var(--sidebar-bg-active))" : undefined,
                  borderLeft: isActive ? "3px solid #4D6BA9" : "3px solid transparent",
                }}
              >
                <Icon
                  size={26}
                  className={isActive ? "text-sidebar-text-active" : "text-sidebar-text"}
                />
                <span
                  className={`text-[19px] flex-1 font-medium ${
                    isActive ? "text-sidebar-text-active" : "text-sidebar-text"
                  }`}
                >
                  {item.label}
                </span>
                {isVisited && !isActive && (
                  <Check size={18} style={{ color: "#10B981" }} />
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Progress */}
      <div>
        <div className="px-6 pb-4">
          <p className="text-[17px] text-sidebar-text mb-2">
            {currentIndex + 1} of {navItemsList.length}
          </p>
        </div>
        <div style={{ height: 3, background: "hsl(var(--sidebar-progress-bg))", width: "100%" }}>
          <div
            style={{
              height: "100%",
              width: `${progress * 100}%`,
              background: "#0F1729",
              transition: "width 700ms ease",
            }}
          />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
