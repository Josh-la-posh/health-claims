import { motion } from "framer-motion";

export default function FullPageLoader() {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-bg text-fg">
      <motion.div
        className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
    </div>
  );
}
