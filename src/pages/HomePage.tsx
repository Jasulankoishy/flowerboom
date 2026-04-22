import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import ProductGrid from "../components/ProductGrid";
import Footer from "../components/Footer";
import SearchModal from "../components/SearchModal";
import CartModal from "../components/CartModal";
import QuickOrderModal from "../components/QuickOrderModal";
import type { Product } from "../types";


export default function HomePage() {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [quickOrderProduct, setQuickOrderProduct] = useState<Product | null>(null);

  const handleSearchClick = () => setShowSearch(true);
  const handleCartClick = () => setShowCart(true);
  const handleProfileClick = () => navigate("/profile");
  const handleQuickOrder = (product: Product) => setQuickOrderProduct(product);
  const handleShowReviews = () => setShowSearch(true);

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <Header
        onSearchClick={handleSearchClick}
        onCartClick={handleCartClick}
        onProfileClick={handleProfileClick}
      />
      <main className="flex-1">
        <HeroSection />
        <ProductGrid
          onQuickOrder={handleQuickOrder}
          onShowReviews={handleShowReviews}
        />
      </main>
      {showSearch && <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />}
      {showCart && <CartModal isOpen={showCart} onClose={() => setShowCart(false)} />}
      {quickOrderProduct && (
        <QuickOrderModal
          product={quickOrderProduct}
          onClose={() => setQuickOrderProduct(null)}
        />
      )}
      <Footer />
    </div>
  );
}
