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
                height: 200,
                border: zone.highlighted
                  ? "1.5px dashed #4D6BA9"
                  : "1.5px dashed hsl(var(--card-border))",
                boxShadow: zone.highlighted
                  ? "0 0 0 3px rgba(77,107,169,0.1)"
                  : "none",
              }}
            >
              <Icon size={35} className="text-breadcrumb mb-2" />
              <span className="text-[18px] text-body-text">{zone.label}</span>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="my-5 border-t border-border" />

      {/* File List */}
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {files.map(
            (file) =>
              file.visible && (
                <motion.div
                  key={file.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex items-center gap-4"
                  style={{ height: 70 }}
                >
                  {/* Icon container */}
                  <div
                    className="flex items-center justify-center rounded-lg flex-shrink-0"
                    style={{
                      width: 50,
                      height: 50,
                      background: fileTypeStyles[file.type].bg,
                    }}
                  >
                    {(() => {
                      const FIcon = fileTypeStyles[file.type].icon;
                      return <FIcon size={24} style={{ color: fileTypeStyles[file.type].iconColor }} />;
                    })()}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[19px] font-medium text-heading truncate">{file.name}</p>
                    <p className="text-[17px] text-breadcrumb">{file.detail}</p>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    {file.done ? (
                      <div
                        className="flex items-center justify-center rounded-full"
                        style={{ width: 24, height: 24, background: "#10B981" }}
                      >
                        <Check size={15} className="text-primary-foreground" />
                      </div>
                    ) : (
                      <Loader2
                        size={24}
                        className="animate-spin-slow"
                        style={{ color: "#4D6BA9" }}
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
