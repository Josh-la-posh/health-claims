import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

type LoaderProps = {
  size?: number; // pixel size
  className?: string;
};

export default function Loader({ size = 20, className }: LoaderProps) {
  return (
    <motion.div
      className={cn(
        "rounded-full border-2 border-black border-t-transparent",
        className
      )}
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    />
  );
}
