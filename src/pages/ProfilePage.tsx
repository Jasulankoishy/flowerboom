import { useAuthStore } from "../stores";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SearchModal from "../components/SearchModal";
import CartModal from "../components/CartModal";
import { motion } from "motion/react";
import { User, Mail, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const handleSearchClick = () => setShowSearch(true);
  const handleCartClick = () => setShowCart(true);
  const handleProfileClick = () => navigate("/");

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <Header
        onSearchClick={handleSearchClick}
        onCartClick={handleCartClick}
        onProfileClick={handleProfileClick}
      />
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-slate-800 border-2 border-slate-700/50 rounded-lg p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 bg-sky/20 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name || "User"} className="w-20 h-20 rounded-full" />
                ) : (
                  <User className="w-10 h-10 text-sky" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white-alt">{user?.name || "Профиль"}</h1>
                <p className="text-slate-400">Ваши данные</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded">
                <Mail className="w-5 h-5 text-sky" />
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="text-white-alt">{user?.email || "Не указан"}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-500/10 border border-red-500/30 text-red-400 font-medium py-3 rounded hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Выйти
            </button>
          </div>
        </motion.div>
      </main>
      {showSearch && <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />}
      {showCart && <CartModal isOpen={showCart} onClose={() => setShowCart(false)} />}
      <Footer />
    </div>
  );
}
