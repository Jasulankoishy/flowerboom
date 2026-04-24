import { useAuthStore } from "../stores";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SearchModal from "../components/SearchModal";
import CartModal from "../components/CartModal";
import { motion } from "motion/react";
import { User, Mail, LogOut, Edit2, X, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authApi } from "../api/auth";

export default function ProfilePage() {
  const { user, logout, accessToken, setName: setStoreName } = useAuthStore();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [nameError, setNameError] = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const handleEditName = () => {
    setNewName(user?.name || "");
    setNameError("");
    setIsEditingName(true);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setNewName(user?.name || "");
    setNameError("");
  };

  const handleSaveName = async () => {
    setNameError("");

    if (newName.trim().length < 2) {
      setNameError("Имя должно содержать минимум 2 символа");
      return;
    }

    if (newName.trim().length > 50) {
      setNameError("Имя слишком длинное (максимум 50 символов)");
      return;
    }

    if (!accessToken) {
      setNameError("Ошибка авторизации");
      return;
    }

    setNameSaving(true);

    try {
      const response = await authApi.setName(newName.trim(), accessToken);
      if (response.user?.name) {
        setStoreName(response.user.name);
      }
      setIsEditingName(false);
    } catch (err: any) {
      setNameError(err.message || "Ошибка сохранения имени");
    } finally {
      setNameSaving(false);
    }
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
                <h1 className="text-3xl font-bold text-white-alt">{user?.name || user?.email || "Профиль"}</h1>
                <p className="text-slate-400">Ваши данные</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded">
                <User className="w-5 h-5 text-sky" />
                <div className="flex-1">
                  <p className="text-sm text-slate-400">Имя</p>
                  {!isEditingName ? (
                    <div className="flex items-center justify-between">
                      <p className="text-white-alt">{user?.name || "Не указано"}</p>
                      <button
                        onClick={handleEditName}
                        className="text-sky hover:text-sky/80 transition-colors"
                        title="Изменить имя"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          maxLength={50}
                          className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 text-white rounded focus:ring-2 focus:ring-sky focus:border-transparent"
                          placeholder="Введите имя"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveName}
                          disabled={nameSaving}
                          className="p-2 bg-sky/20 text-sky rounded hover:bg-sky/30 transition-colors disabled:opacity-50"
                          title="Сохранить"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={nameSaving}
                          className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors disabled:opacity-50"
                          title="Отмена"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {nameError && (
                        <p className="text-sm text-red-400">{nameError}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

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
