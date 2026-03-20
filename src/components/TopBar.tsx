import { RotateCcw } from "lucide-react";

interface TopBarProps {
  onReplay?: () => void;
  breadcrumb?: string;
}

const TopBar = ({ onReplay, breadcrumb = "Buildings › ABC Condominium Association, Inc. › Onboarding" }: TopBarProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <p className="text-[13px] text-breadcrumb">
        {breadcrumb}
      </p>
      <div className="flex items-center gap-4">
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
