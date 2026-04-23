import { motion } from "motion/react";
import { Search, ShoppingBag, User, Moon, Sun } from "lucide-react";
import { useCartStore, useThemeStore } from "../stores";

interface HeaderProps {
  onSearchClick: () => void;
  onCartClick: () => void;
  onProfileClick: () => void;
}

export default function Header({ onSearchClick, onCartClick, onProfileClick }: HeaderProps) {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <div className="flex justify-between items-start mb-24">
      <div className="space-y-2">
        <div className={`font-bold text-xs uppercase tracking-[0.3em] ${isDark ? 'text-pink-400' : 'text-sky'}`}>FLORAL DESIGN STUDIO</div>
        <motion.h1
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1]
          }}
          className={`massive-heading -ml-1 ${isDark ? 'text-white' : 'text-white-alt'}`}
        >
          Flower<br />Boom
        </motion.h1>
      </div>

      <div className="flex gap-4">
        <motion.div
          onClick={toggleTheme}
          className={`w-16 h-16 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
            isDark
              ? 'border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-gray-900'
              : 'border-sky text-sky hover:bg-sky hover:text-ink'
          }`}
          whileHover={{ scale: 1.1, rotate: isDark ? 0 : 180 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {isDark ? <Sun className="w-6 h-6 stroke-[3px]" /> : <Moon className="w-6 h-6 stroke-[3px]" />}
        </motion.div>
        <motion.div
          onClick={onSearchClick}
          className={`w-16 h-16 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
            isDark
              ? 'border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-gray-900'
              : 'border-sky text-sky hover:bg-sky hover:text-ink'
          }`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Search className="w-6 h-6 stroke-[3px]" />
        </motion.div>
        <motion.div
          onClick={onCartClick}
          className={`w-16 h-16 rounded-full border flex items-center justify-center transition-all cursor-pointer relative ${
            isDark
              ? 'border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-gray-900'
              : 'border-sky text-sky hover:bg-sky hover:text-ink'
          }`}
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
              className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                isDark
                  ? 'bg-pink-400 text-gray-900'
                  : 'bg-sky text-ink'
              }`}
            >
              {totalItems}
            </motion.div>
          )}
        </motion.div>
        <motion.div
          onClick={onProfileClick}
          className={`w-16 h-16 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
            isDark
              ? 'border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-gray-900'
              : 'border-sky text-sky hover:bg-sky hover:text-ink'
          }`}
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
