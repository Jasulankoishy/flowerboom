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
    <div className="mb-10 flex w-full flex-col gap-6 sm:mb-16 lg:mb-24 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-2">
        <div className={`text-[10px] font-bold uppercase tracking-[0.22em] sm:text-xs sm:tracking-[0.3em] ${isDark ? 'text-pink-400' : 'text-sky'}`}>FLORAL DESIGN STUDIO</div>
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

      <div className="grid grid-cols-4 gap-2 sm:flex sm:gap-4 lg:shrink-0">
        <motion.div
          onClick={toggleTheme}
          className={`h-12 w-12 rounded-full border flex items-center justify-center transition-all cursor-pointer sm:h-16 sm:w-16 ${
            isDark
              ? 'border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-gray-900'
              : 'border-sky text-sky hover:bg-sky hover:text-ink'
          }`}
          whileHover={{ scale: 1.1, rotate: isDark ? 0 : 180 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {isDark ? <Sun className="h-5 w-5 stroke-[3px] sm:h-6 sm:w-6" /> : <Moon className="h-5 w-5 stroke-[3px] sm:h-6 sm:w-6" />}
        </motion.div>
        <motion.div
          onClick={onSearchClick}
          className={`h-12 w-12 rounded-full border flex items-center justify-center transition-all cursor-pointer sm:h-16 sm:w-16 ${
            isDark
              ? 'border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-gray-900'
              : 'border-sky text-sky hover:bg-sky hover:text-ink'
          }`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Search className="h-5 w-5 stroke-[3px] sm:h-6 sm:w-6" />
        </motion.div>
        <motion.div
          onClick={onCartClick}
          className={`relative h-12 w-12 rounded-full border flex items-center justify-center transition-all cursor-pointer sm:h-16 sm:w-16 ${
            isDark
              ? 'border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-gray-900'
              : 'border-sky text-sky hover:bg-sky hover:text-ink'
          }`}
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <ShoppingBag className="h-5 w-5 stroke-[3px] sm:h-6 sm:w-6" />
          {totalItems > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold sm:h-6 sm:w-6 sm:text-xs ${
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
          className={`h-12 w-12 rounded-full border flex items-center justify-center transition-all cursor-pointer sm:h-16 sm:w-16 ${
            isDark
              ? 'border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-gray-900'
              : 'border-sky text-sky hover:bg-sky hover:text-ink'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <User className="h-5 w-5 stroke-[3px] sm:h-6 sm:w-6" />
        </motion.div>
      </div>
    </div>
  );
}
