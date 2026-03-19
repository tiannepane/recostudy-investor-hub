import { motion, AnimatePresence } from "framer-motion";
import { Camera, FileText, Mic, Image as ImageIcon, Check, Loader2 } from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface UploadZone {
  label: string;
  icon: LucideIcon;
  highlighted: boolean;
}

interface FileItem {
  name: string;
  detail: string;
  type: "image" | "pdf" | "voice";
  visible: boolean;
  done: boolean;
}

const fileTypeStyles = {
  image: { bg: "#EFF6FF", icon: ImageIcon, iconColor: "#3B82F6" },
  pdf: { bg: "#FEF2F2", icon: FileText, iconColor: "#EF4444" },
  voice: { bg: "#F3E8FF", icon: Mic, iconColor: "#8B5CF6" },
};

interface UploadCardProps {
  zones: UploadZone[];
  files: FileItem[];
}

const UploadCard = ({ zones, files }: UploadCardProps) => {
  return (
    <div className="card-base p-6">
      {/* Upload Zones */}
      <div className="flex gap-3">
        {zones.map((zone) => {
          const Icon = zone.icon;
          return (
            <div
              key={zone.label}
              className="flex-1 flex flex-col items-center justify-center rounded-lg transition-all duration-300"
              style={{
                height: 160,
                border: zone.highlighted
                  ? "1.5px dashed #4F6BFF"
                  : "1.5px dashed hsl(var(--card-border))",
                boxShadow: zone.highlighted
                  ? "0 0 0 3px rgba(79,107,255,0.1)"
                  : "none",
              }}
            >
              <Icon size={28} className="text-breadcrumb mb-2" />
              <span className="text-[13px] text-body-text">{zone.label}</span>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="my-5 border-t border-border" />

      {/* File List */}
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {files.map(
            (file) =>
              file.visible && (
                <motion.div
                  key={file.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex items-center gap-3"
                  style={{ height: 56 }}
                >
                  {/* Icon container */}
                  <div
                    className="flex items-center justify-center rounded-lg flex-shrink-0"
                    style={{
                      width: 40,
                      height: 40,
                      background: fileTypeStyles[file.type].bg,
                    }}
                  >
                    {(() => {
                      const FIcon = fileTypeStyles[file.type].icon;
                      return <FIcon size={20} style={{ color: fileTypeStyles[file.type].iconColor }} />;
                    })()}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-heading truncate">{file.name}</p>
                    <p className="text-[12px] text-breadcrumb">{file.detail}</p>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    {file.done ? (
                      <div
                        className="flex items-center justify-center rounded-full"
                        style={{ width: 20, height: 20, background: "#10B981" }}
                      >
                        <Check size={12} className="text-primary-foreground" />
                      </div>
                    ) : (
                      <Loader2
                        size={20}
                        className="animate-spin-slow"
                        style={{ color: "#4F6BFF" }}
                      />
                    )}
                  </div>
                </motion.div>
              )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export { UploadCard, Camera, Mic };
export type { UploadZone, FileItem };
