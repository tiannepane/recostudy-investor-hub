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

const FileList = ({ files }: { files: FileItem[] }) => {
  return (
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
                <div
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ width: 40, height: 40, background: fileTypeStyles[file.type].bg }}
                >
                  {(() => {
                    const FIcon = fileTypeStyles[file.type].icon;
                    return <FIcon size={20} style={{ color: fileTypeStyles[file.type].iconColor }} />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-heading truncate">{file.name}</p>
                  <p className="text-[12px] text-breadcrumb">{file.detail}</p>
                </div>
                <div className="flex-shrink-0">
                  {file.done ? (
                    <div
                      className="flex items-center justify-center rounded-full"
                      style={{ width: 20, height: 20, background: "#10B981" }}
                    >
                      <Check size={12} className="text-primary-foreground" />
                    </div>
                  ) : (
                    <Loader2 size={20} className="animate-spin-slow" style={{ color: "#4F6BFF" }} />
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
