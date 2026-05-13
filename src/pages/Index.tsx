import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { moodLabels, type Mood } from '@/data/products';
import { useProducts } from '@/hooks/useProducts';

const moods: Mood[] = ['romantic', 'serene', 'vibrant'];

const moodImages: Record<Mood, string> = {
  romantic: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&q=80',
  serene: 'https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=600&q=80',
  vibrant: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&q=80',
};

const Index = () => {
  const { products } = useProducts();
  const featuredProducts = products.filter(p => p.featured);

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-12 lg:col-span-5 order-2 lg:order-1 z-10">
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6 animate-fade-in">
                Nghệ thuật hoa tươi
              </p>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light leading-[0.9] text-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Hơi thở
                <br />
                <span className="italic text-primary">của thiên</span>
                <br />
                nhiên
              </h1>
              <p className="mt-8 text-muted-foreground max-w-sm leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
                Mỗi đóa hoa là một tác phẩm nghệ thuật sống, được tuyển chọn và sắp đặt với cảm xúc tinh tế nhất.
              </p>
              <div className="mt-10 flex gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <Button asChild className="rounded-full px-8 h-12 font-body tracking-widest uppercase text-sm">
                  <Link to="/collection">Khám phá</Link>
                </Button>
                <Button asChild variant="ghost" className="rounded-full px-6 h-12 font-body tracking-widest uppercase text-sm group">
                  <Link to="/subscription" className="flex items-center gap-2">
                    Hoa định kỳ
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-7 order-1 lg:order-2">
              <div className="relative aspect-[4/3] lg:aspect-[4/5] overflow-hidden rounded-sm animate-fade-in">
                <img
                  src="https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1200&q=80"
                  alt="Bó hoa nghệ thuật Aura & Bloom"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-background/60 lg:block hidden" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mood Collection */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">Chọn theo cảm xúc</p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-foreground">
              Tâm trạng <span className="italic text-primary">của bạn</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {moods.map((mood) => (
              <Link
                key={mood}
                to={`/collection?mood=${mood}`}
                className="group relative overflow-hidden rounded-sm aspect-[3/4]"
              >
                <img
                  src={moodImages[mood]}
                  alt={moodLabels[mood].name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-charcoal/30 group-hover:bg-charcoal/40 transition-colors duration-500" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <h3 className="font-display text-3xl text-white font-light mb-2">{moodLabels[mood].name}</h3>
                  <p className="text-white/70 text-sm max-w-[200px]">{moodLabels[mood].description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 lg:py-32 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-16">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">Được yêu thích</p>
              <h2 className="font-display text-4xl md:text-5xl font-light text-foreground">
                Đóa hoa <span className="italic text-primary">nổi bật</span>
              </h2>
            </div>
            <Link to="/collection" className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
              Xem tất cả
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 stagger-fade-in">
            {featuredProducts.map(product => (
              <ProductCard key={product._id} product={product} variant="featured" />
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Banner */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-square overflow-hidden rounded-sm">
              <img
                src="https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80"
                alt="Hoa định kỳ"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6">Hoa định kỳ</p>
              <h2 className="font-display text-4xl md:text-5xl font-light text-foreground leading-tight">
                Mỗi tuần, một
                <br />
                <span className="italic text-primary">câu chuyện mới</span>
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed max-w-md">
                Đăng ký nhận hoa tươi định kỳ, được cá nhân hóa theo tâm trạng yêu thích của bạn. Mỗi bó hoa là một bất ngờ nghệ thuật.
              </p>
              <Button asChild className="mt-10 rounded-full px-10 h-12 font-body tracking-widest uppercase text-sm">
                <Link to="/subscription">Bắt đầu ngay</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
