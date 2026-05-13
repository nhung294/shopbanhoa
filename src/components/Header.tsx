import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const Header = () => {
  const { totalItems, setIsOpen } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="font-display text-2xl font-light tracking-wide text-foreground">
            Aura <span className="text-primary">&</span> Bloom
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            <Link to="/" className="text-sm font-body tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300">
              Trang chủ
            </Link>
            <Link to="/collection" className="text-sm font-body tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300">
              Bộ sưu tập
            </Link>
            <Link to="/subscription" className="text-sm font-body tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300">
              Đăng ký định kỳ
            </Link>
            {user ? (
              <>
                <Link
                  to={isAdmin ? '/admin/dashboard' : '/dashboard'}
                  className="text-sm font-body tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-body tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link to="/login" className="text-sm font-body tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300">
                Đăng nhập
              </Link>
            )}
          </nav>

          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 text-foreground hover:text-primary transition-colors duration-300"
          >
            <ShoppingBag size={20} strokeWidth={1} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-mono rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
