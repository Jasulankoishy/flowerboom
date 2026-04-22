import { motion } from "motion/react";
import { Search, ShoppingBag, User } from "lucide-react";
import { useCartStore } from "../stores";

interface HeaderProps {
  onSearchClick: () => void;
  onCartClick: () => void;
  onProfileClick: () => void;
}

export default function Header({ onSearchClick, onCartClick, onProfileClick }: HeaderProps) {
  const totalItems = useCartStore((state) => state.getTotalItems());

  return (
    <div className="flex justify-between items-start mb-24">
      <div className="space-y-2">
        <div className="text-sky font-bold text-xs uppercase tracking-[0.3em]">FLORAL DESIGN STUDIO</div>
        <motion.h1
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="massive-heading -ml-1 text-white-alt"
        >
          Flower<br />Boom
        </motion.h1>
      </div>

      <div className="flex gap-4">
        <motion.div
          onClick={onSearchClick}
          className="w-16 h-16 rounded-full border border-sky flex items-center justify-center text-sky hover:bg-sky hover:text-ink transition-all cursor-pointer"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Search className="w-6 h-6 stroke-[3px]" />
        </motion.div>
        <motion.div
          onClick={onCartClick}
          className="w-16 h-16 rounded-full border border-sky flex items-center justify-center text-sky hover:bg-sky hover:text-ink transition-all cursor-pointer relative"
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <ShoppingBag className="w-6 h-6 stroke-[3px]" />
          {totalItems > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className="absolute -top-1 -right-1 w-6 h-6 bg-sky text-ink rounded-full flex items-center justify-center text-xs font-bold"
            >
              {totalItems}
            </motion.div>
          )}
        </motion.div>
        <motion.div
          onClick={onProfileClick}
          className="w-16 h-16 rounded-full border border-sky flex items-center justify-center text-sky hover:bg-sky hover:text-ink transition-all cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <User className="w-6 h-6 stroke-[3px]" />
        </motion.div>
      </div>
    </div>
  );
}
