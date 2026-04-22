import { motion } from "motion/react";
import { X, MapPin, Calendar, Package, Plus, Edit2, Heart, Home, Briefcase, Gift, LogOut } from "lucide-react";
import { useState } from "react";

interface ProfileProps {
  onClose: () => void;
  onLogout: () => void;
}

interface Order {
  id: string;
  name: string;
  image: string;
  date: string;
  price: string;
}

interface Address {
  id: string;
  label: string;
  address: string;
  icon: "home" | "work" | "gift";
}

interface ImportantDate {
  id: string;
  name: string;
  date: string;
  type: string;
}

export default function Profile({ onClose, onLogout }: ProfileProps) {
  const [orders] = useState<Order[]>([
    {
      id: "1",
      name: "Vintage Sahara",
      image: "https://images.unsplash.com/photo-1548681528-6a5c45b66b42?q=80&w=800&auto=format&fit=crop",
      date: "15 апр 2026",
      price: "4 500 ₽"
    },
    {
      id: "2",
      name: "Amber Peony",
      image: "https://images.unsplash.com/photo-1591880482226-259779357021?q=80&w=800&auto=format&fit=crop",
      date: "8 апр 2026",
      price: "5 200 ₽"
    },
    {
      id: "3",
      name: "Golden Hour",
      image: "https://images.unsplash.com/photo-1522673607200-164848371868?q=80&w=800&auto=format&fit=crop",
      date: "1 апр 2026",
      price: "3 800 ₽"
    }
  ]);

  const [addresses] = useState<Address[]>([
    { id: "1", label: "Дом", address: "ул. Пушкина, д. 10, кв. 5", icon: "home" },
    { id: "2", label: "Работа", address: "Невский проспект, д. 28", icon: "work" },
    { id: "3", label: "Для неё", address: "ул. Ленина, д. 45, кв. 12", icon: "gift" }
  ]);

  const [importantDates] = useState<ImportantDate[]>([
    { id: "1", name: "День рождения мамы", date: "25 мая", type: "birthday" },
    { id: "2", name: "Годовщина", date: "14 июня", type: "anniversary" },
    { id: "3", name: "8 марта", date: "8 марта", type: "holiday" }
  ]);

  return (
    <div className="fixed inset-0 bg-ink z-50 overflow-y-auto">
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="flex justify-between items-start">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-6"
            >
              {/* Profile Photo - Arched */}
              <div className="relative">
                <div className="w-32 h-32 rounded-[100px_100px_40px_40px] overflow-hidden border-2 border-sky/30 bg-slate-800">
                  <div className="w-full h-full bg-gradient-to-br from-sky/20 to-slate-700 flex items-center justify-center text-5xl font-serif text-sky">
                    А
                  </div>
                </div>
                <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-sky text-ink flex items-center justify-center hover:brightness-110 transition-all">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* User Info */}
              <div>
                <h1 className="text-5xl font-serif text-white-alt mb-2">Александр</h1>
                <p className="text-sky/80 text-lg italic font-script">Ценитель эстетики</p>
                <div className="flex gap-4 mt-4 text-sm text-slate-400">
                  <span>12 заказов</span>
                  <span>•</span>
                  <span>С нами с 2025</span>
                </div>
              </div>
            </motion.div>

            <div className="flex gap-3">
              <button
                onClick={onLogout}
                className="w-12 h-12 rounded-full border border-red-500/50 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all"
                title="Выйти"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="w-12 h-12 rounded-full border border-sky/50 flex items-center justify-center text-sky hover:bg-sky hover:text-ink transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Beauty History - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 glass-card rounded-[32px] p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-serif text-white-alt mb-1">Моя история красоты</h2>
                <p className="text-slate-400 text-sm">Ваши прошлые заказы</p>
              </div>
              <button className="flex items-center gap-2 text-sky hover:text-sky/80 transition-colors">
                <span className="text-sm uppercase tracking-wider">Смотреть все</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="group cursor-pointer"
                >
                  {/* Arched Image Frame */}
                  <div className="relative rounded-[100px_100px_24px_24px] overflow-hidden border border-slate-700/50 group-hover:border-sky/30 transition-all duration-500 mb-4">
                    <div className="aspect-[3/4] bg-slate-800">
                      <img
                        src={order.image}
                        alt={order.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#1A1D1A]/80 backdrop-blur-sm border border-sky/20 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-sky" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-serif text-lg text-white-alt">{order.name}</h3>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">{order.date}</span>
                      <span className="text-sky font-medium">{order.price}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Address Book */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 glass-card rounded-[32px] p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-serif text-white-alt mb-1">Книга адресов</h2>
                <p className="text-slate-400 text-sm">Доставка в два клика</p>
              </div>
              <button className="w-10 h-10 rounded-full bg-sky/10 border border-sky/30 flex items-center justify-center text-sky hover:bg-sky hover:text-ink transition-all">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {addresses.map((addr, index) => {
                const IconComponent = addr.icon === "home" ? Home : addr.icon === "work" ? Briefcase : Gift;
                return (
                  <motion.div
                    key={addr.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-[24px] bg-[#1A1D1A]/50 border border-slate-700/30 hover:border-sky/30 transition-all cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-[20px] bg-sky/10 flex items-center justify-center text-sky">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white-alt mb-1">{addr.label}</h3>
                      <p className="text-sm text-slate-400">{addr.address}</p>
                    </div>
                    <MapPin className="w-5 h-5 text-slate-600 group-hover:text-sky transition-colors" />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Important Dates Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-[32px] p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-serif text-white-alt mb-1">Важные даты</h2>
                <p className="text-slate-400 text-sm">Не забудьте поздравить</p>
              </div>
              <button className="w-10 h-10 rounded-full bg-sky/10 border border-sky/30 flex items-center justify-center text-sky hover:bg-sky hover:text-ink transition-all">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {importantDates.map((date, index) => (
                <motion.div
                  key={date.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="p-4 rounded-[24px] bg-[#1A1D1A]/50 border border-slate-700/30 hover:border-sky/30 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-[16px] bg-sky/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-sky" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white-alt mb-1 truncate">{date.name}</h3>
                      <p className="text-sm text-sky">{date.date}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-[24px] bg-sky/5 border border-sky/20">
              <p className="text-xs text-slate-400 text-center">
                Мы напомним вам за 3 дня до события
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .glass-card {
          background: rgba(26, 29, 26, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(212, 175, 55, 0.1);
        }
      `}</style>
    </div>
  );
}
