import { motion } from "motion/react";
import { X } from "lucide-react";
import { useCartStore } from "../stores";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, removeItem } = useCartStore();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-ink/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-slate-800 border-2 border-sky/30 rounded-lg p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold uppercase tracking-tight">Корзина</h2>
          <motion.button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-sky flex items-center justify-center text-sky hover:bg-sky hover:text-ink transition-all"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
        {items.length === 0 ? (
          <p className="text-slate-400 text-center py-8">Корзина пуста</p>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex justify-between items-center bg-slate-700 border border-slate-600 rounded p-4"
              >
                <div>
                  <span className="font-medium">{item.title}</span>
                  <span className="text-slate-400 ml-2">x{item.quantity}</span>
                </div>
                <motion.button
                  onClick={() => removeItem(index)}
                  className="text-sky hover:text-sky/70 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  Удалить
                </motion.button>
              </motion.div>
            ))}
            <motion.button
              className="w-full mt-6 py-4 bg-sky text-ink font-bold uppercase tracking-widest rounded hover:brightness-110 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              Оформить заказ ({items.length})
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
