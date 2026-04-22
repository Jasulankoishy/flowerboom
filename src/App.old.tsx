import { motion } from "motion/react";
import { Search, Heart, ShoppingBag, Plus, User, X } from "lucide-react";
import { useState, useEffect } from "react";
import Auth from "./Auth";
import Profile from "./Profile";
import Reviews from "./Reviews";

const CategoryCard = ({
  title,
  image,
  delay,
  index,
  onQuickOrder,
  onShowReviews
}: {
  title: string;
  image: string;
  delay: number;
  index: string;
  onQuickOrder: (title: string) => void;
  onShowReviews: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
      }}
      className="card flex flex-col items-center bg-slate-800 border-2 border-slate-700/50 p-6 rounded-lg group hover:border-sky/30 transition-all duration-500"
    >
      <div className="w-full flex justify-between items-start mb-4">
        <div className="text-sm font-bold tracking-[0.4em] text-slate-600 uppercase">Series {index}</div>
        <div className="text-4xl font-extralight text-sky leading-none opacity-40 group-hover:opacity-100 transition-opacity">{index}</div>
      </div>

      <motion.div
        className="relative w-full aspect-[4/5] bg-slate-700 rounded-md overflow-hidden border border-slate-600"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.img
          src={image}
          alt={title}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 contrast-[1.1] cursor-pointer"
          referrerPolicy="no-referrer"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onClick={onShowReviews}
        />
        <motion.div
          className="absolute inset-0 bg-ink/10 pointer-events-none"
          initial={{ opacity: 1 }}
          whileHover={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      <div className="mt-6 w-full space-y-4">
        <h3 className="text-xl font-bold text-white-alt uppercase tracking-tight">{title}</h3>
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => onQuickOrder(title)}
            className="text-xs uppercase font-bold tracking-widest text-ink bg-sky py-4 rounded hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              Quick Order
            </motion.span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const NavDot = ({ children, active, onClick }: { children: string; active?: boolean; onClick?: () => void }) => (
  <div
    onClick={onClick}
    className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold cursor-pointer transition-colors ${active ? 'bg-sky text-ink' : 'bg-slate-700 text-white-alt hover:bg-slate-600'}`}
  >
    {children}
  </div>
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("userToken") !== null;
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState("H");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3003";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("userToken");
  };

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  if (profileOpen) {
    return <Profile onClose={() => setProfileOpen(false)} onLogout={handleLogout} />;
  }

  const handleQuickOrder = (title: string) => {
    setCartItems(prev => [...prev, title]);
    alert(`"${title}" добавлен в корзину!`);
  };

  const handleRemoveFromCart = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      alert(`Поиск: "${searchQuery}"`);
    }
  };

  return (
    <div className="flex h-screen bg-ink text-white-alt overflow-hidden">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-12 overflow-y-auto relative custom-scrollbar">
        {/* Rail Text Overlay */}
        <div className="absolute right-8 top-12 rail-text text-sky/60 text-xs font-bold tracking-[0.2em] uppercase font-sans">
          CREATIVE / 2026 / FLOWER EXHIBITION
        </div>

        {/* Header */}
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
              onClick={() => setSearchOpen(true)}
              className="w-16 h-16 rounded-full border border-sky flex items-center justify-center text-sky hover:bg-sky hover:text-ink transition-all cursor-pointer"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Search className="w-6 h-6 stroke-[3px]" />
            </motion.div>
            <motion.div
              onClick={() => setCartOpen(true)}
              className="w-16 h-16 rounded-full border border-sky flex items-center justify-center text-sky hover:bg-sky hover:text-ink transition-all cursor-pointer relative"
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <ShoppingBag className="w-6 h-6 stroke-[3px]" />
              {cartItems.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-sky text-ink rounded-full flex items-center justify-center text-xs font-bold"
                >
                  {cartItems.length}
                </motion.div>
              )}
            </motion.div>
            <motion.div
              onClick={() => setProfileOpen(true)}
              className="w-16 h-16 rounded-full border border-sky flex items-center justify-center text-sky hover:bg-sky hover:text-ink transition-all cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <User className="w-6 h-6 stroke-[3px]" />
            </motion.div>
          </div>
        </div>

        {/* Hero Concept Content / Status area */}
        <div className="flex flex-col lg:flex-row gap-16 mb-24 items-end justify-between">
          <div className="max-w-xl">
             <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-2xl font-script text-sky/80 italic mb-4"
            >
              Создаем любовь через цветы
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-slate-400 text-lg leading-relaxed font-sans"
            >
              Мы выращиваем наши цветы с любовью специально для вас. 
              Трепетно относимся к доставке, чтобы доставить вам эстетическое удовольствие.
            </motion.p>
          </div>
          
          {/* Action button in Bold Typography style */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-6 border-t border-slate-700 pt-8 mt-8 w-full max-w-sm"
          >
            <div
              onClick={() => alert("Показать все 348+ товаров")}
              className="w-16 h-16 rounded-full border border-sky flex items-center justify-center text-sky cursor-pointer hover:bg-sky hover:text-ink transition-all"
            >
              <Plus className="w-6 h-6 stroke-[3px]" />
            </div>
            <div>
              <div className="font-bold uppercase tracking-widest text-sm mb-1">Explore all products</div>
              <div className="text-slate-500 text-xs uppercase tracking-widest">348+ varieties available</div>
            </div>
          </motion.div>
        </div>

        {/* Collection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {loading ? (
            <div className="col-span-full text-center py-20 text-slate-500 uppercase tracking-widest">
              Загрузка коллекции...
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-500 uppercase tracking-widest">
              Коллекция пуста
            </div>
          ) : (
            products.map((product, idx) => (
              <CategoryCard
                key={product.id || idx}
                index={product.index || String(idx + 1).padStart(2, '0')}
                title={product.title}
                image={product.image}
                delay={0.1 * (idx + 1)}
                onQuickOrder={handleQuickOrder}
                onShowReviews={() => setSelectedProduct(product)}
              />
            ))
          )}
        </div>

        {/* Footer info section */}
        <div className="mt-auto flex flex-col md:flex-row items-center gap-12 pt-12 border-t border-slate-800 border-dashed">
            <div className="text-right">
               <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-1">Global Presence</div>
               <div className="text-xl font-bold text-sky/80">14 Countries</div>
            </div>
            <div className="text-right">
               <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-1">Sustainability Score</div>
               <div className="text-xl font-bold text-sky">99% TRACEABLE</div>
            </div>
            <div className="ml-auto text-right">
               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Copyright 2026</div>
               <div className="text-sm font-medium tracking-tighter opacity-50">FLOWERBOOM® DESIGN SYSTEM</div>
            </div>
        </div>
      </main>

      {/* Search Modal */}
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-ink/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSearchOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="bg-slate-800 border-2 border-sky/30 rounded-lg p-8 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold uppercase tracking-tight">Поиск</h2>
              <motion.button
                onClick={() => setSearchOpen(false)}
                className="w-10 h-10 rounded-full border border-sky flex items-center justify-center text-sky hover:bg-sky hover:text-ink transition-all"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Введите название цветка..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white-alt focus:outline-none focus:border-sky transition-colors"
                autoFocus
              />
              <motion.button
                onClick={handleSearch}
                className="px-8 py-3 bg-sky text-ink font-bold uppercase tracking-widest rounded hover:brightness-110 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                Найти
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Cart Modal */}
      {cartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-ink/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setCartOpen(false)}
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
                onClick={() => setCartOpen(false)}
                className="w-10 h-10 rounded-full border border-sky flex items-center justify-center text-sky hover:bg-sky hover:text-ink transition-all"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
            {cartItems.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Корзина пуста</p>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="flex justify-between items-center bg-slate-700 border border-slate-600 rounded p-4"
                  >
                    <span className="font-medium">{item}</span>
                    <motion.button
                      onClick={() => handleRemoveFromCart(index)}
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
                  Оформить заказ ({cartItems.length})
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {selectedProduct && (
        <Reviews
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
