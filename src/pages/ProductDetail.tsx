import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Maximize2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatPrice, moodLabels, Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem, updateMessage } = useCart();
  const [note, setNote] = useState('');
  const [blooming, setBlooming] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/api/products/${id}`)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="pt-32 pb-20 text-center">
        <p className="font-display text-2xl text-muted-foreground">Đang tải...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="pt-32 pb-20 text-center">
        <p className="font-display text-2xl text-muted-foreground">Không tìm thấy sản phẩm</p>
        <Link to="/collection" className="text-primary mt-4 inline-block">Quay lại bộ sưu tập</Link>
      </main>
    );
  }

  const handleAdd = () => {
    addItem(product);
    if (note) updateMessage(product._id, note);
    setBlooming(true);
    setTimeout(() => setBlooming(false), 600);
  };

  return (
    <main className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <Link to="/collection" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10">
          <ArrowLeft size={14} />
          Quay lại
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Image */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm animate-fade-in">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <span className="inline-block px-3 py-1 rounded-full bg-secondary text-xs tracking-widest uppercase text-muted-foreground mb-6">
                {moodLabels[product.mood].name}
              </span>

              <h1 className="font-display text-4xl md:text-5xl font-light text-foreground leading-tight">
                {product.name}
              </h1>
              <p className="font-body text-sm text-muted-foreground italic mt-1">{product.nameEn}</p>

              <p className="font-mono text-2xl text-primary mt-6">
                {formatPrice(product.price)}
              </p>

              <p className="mt-8 text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              <div className="mt-8 p-6 bg-secondary/50 rounded-sm">
                <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">Ý nghĩa</h3>
                <p className="font-display text-lg italic text-foreground leading-relaxed">
                  "{product.meaning}"
                </p>
              </div>

              {/* Specs */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Clock size={14} strokeWidth={1.5} />
                  <span className="font-mono text-xs">{product.durability}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Maximize2 size={14} strokeWidth={1.5} />
                  <span className="font-mono text-xs">{product.size}</span>
                </div>
              </div>

              {/* Handwritten Card */}
              <div className="mt-8">
                <label className="text-xs tracking-[0.2em] uppercase text-muted-foreground block mb-3">
                  <Heart size={12} className="inline mr-2" />
                  Thiệp viết tay
                </label>
                <Textarea
                  placeholder="Viết lời nhắn yêu thương của bạn..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="bg-secondary/50 border-0 resize-none h-24 text-sm"
                />
              </div>

              <Button
                onClick={handleAdd}
                className={`mt-8 w-full rounded-full h-14 font-body tracking-widest uppercase text-sm ${blooming ? 'animate-bloom' : ''}`}
              >
                Chọn đóa hoa này
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;
