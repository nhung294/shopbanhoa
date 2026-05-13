import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Product, formatPrice } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'featured';
}

const ProductCard = ({ product, variant = 'default' }: ProductCardProps) => {
  const { addItem } = useCart();
  const [blooming, setBlooming] = useState(false);

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem(product);
    setBlooming(true);
    setTimeout(() => setBlooming(false), 600);
  };

  return (
    <Link to={`/product/${product._id}`} className="group block">
      <div className={`relative overflow-hidden bg-card rounded-sm ${variant === 'featured' ? 'aspect-[3/4]' : 'aspect-[4/5]'}`}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-display text-lg">Hết hàng</span>
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`absolute bottom-4 right-4 w-10 h-10 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed ${blooming ? 'animate-bloom' : ''}`}
        >
          <Plus size={16} strokeWidth={1.5} />
        </button>
      </div>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h3 className="font-display text-xl font-light text-foreground group-hover:text-primary transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 font-body italic">{product.nameEn}</p>
          {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
            <p className="text-xs text-red-500 mt-1">Chỉ còn {product.stock} cái</p>
          )}
        </div>
        <span className="font-mono text-xs text-primary mt-1 whitespace-nowrap">
          {formatPrice(product.price)}
        </span>
      </div>
    </Link>
  );
};

export default ProductCard;
