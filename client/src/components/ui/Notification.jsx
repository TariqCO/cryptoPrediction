import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import clsx from "clsx";

const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export default function Notification({ type = "success", message = "", onClose, duration = 6000 }) {
  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
          className={clsx(
            "fixed bottom-6 right-6 z-50 rounded-lg border px-4 py-3 flex items-center gap-3 shadow-lg max-w-sm",
            type === "success"
              ? "bg-green-600/90 text-white border-green-400"
              : "bg-red-600/90 text-white border-red-400"
          )}
        >
          <span className="text-sm font-medium">{message}</span>
          <button onClick={onClose}>
            <X className="w-4 h-4 text-white hover:text-gray-200" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
