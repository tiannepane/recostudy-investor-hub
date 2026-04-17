import { motion, AnimatePresence } from "framer-motion";
import { FileText, Mic, Image as ImageIcon, Check, Loader2 } from "lucide-react";

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

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 24,
};

const FileList = ({ files }: { files: FileItem[] }) => {
  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence>
        {files.map(
          (file) =>
            file.visible && (
              <motion.div
                key={file.name}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={springTransition}
                className="flex items-center gap-4"
                style={{ height: 70 }}
              >
                <div
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ width: 50, height: 50, background: fileTypeStyles[file.type].bg }}
                >
                  {(() => {
                    const FIcon = fileTypeStyles[file.type].icon;
                    return <FIcon size={24} style={{ color: fileTypeStyles[file.type].iconColor }} />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[19px] font-medium text-heading truncate">{file.name}</p>
                  <p className="text-[17px] font-mono text-breadcrumb">{file.detail}</p>
                </div>
                <div className="flex-shrink-0">
                  {file.done ? (
                    <div
                      className="flex items-center justify-center rounded-full"
                      style={{ width: 24, height: 24, background: "#10B981" }}
                    >
                      <Check size={15} className="text-primary-foreground" />
                    </div>
                  ) : (
                    <Loader2 size={24} className="animate-spin-slow" style={{ color: "#4D6BA9" }} />
                  )}
                </div>
              </motion.div>
            )
        )}
      </AnimatePresence>
    </div>
  );
};

export { FileList };
export type { FileItem };
