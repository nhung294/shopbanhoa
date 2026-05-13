import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import { moodLabels, type Mood } from '@/data/products';
import { useProducts } from '@/hooks/useProducts';

const Collection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMood = searchParams.get('mood') as Mood | null;
  const [selectedMood, setSelectedMood] = useState<Mood | null>(initialMood);
  const { products, loading, error } = useProducts();

  const filtered = useMemo(() => {
    if (!selectedMood) return products;
    return products.filter(p => p.mood === selectedMood);
  }, [selectedMood, products]);

  const handleMoodFilter = (mood: Mood | null) => {
    setSelectedMood(mood);
    if (mood) {
      setSearchParams({ mood });
    } else {
      setSearchParams({});
    }
  };

  return (
    <main className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">Bộ sưu tập</p>
          <h1 className="font-display text-5xl md:text-6xl font-light text-foreground">
            Tất cả <span className="italic text-primary">đóa hoa</span>
          </h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-12">
          <button
            onClick={() => handleMoodFilter(null)}
            className={`px-5 py-2 rounded-full text-xs tracking-widest uppercase transition-all duration-300 ${
              !selectedMood ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            Tất cả
          </button>
          {(Object.keys(moodLabels) as Mood[]).map(mood => (
            <button
              key={mood}
              onClick={() => handleMoodFilter(mood)}
              className={`px-5 py-2 rounded-full text-xs tracking-widest uppercase transition-all duration-300 ${
                selectedMood === mood ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {moodLabels[mood].name}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-muted-foreground italic">Đang tải...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-muted-foreground italic">{error}</p>
          </div>
        )}

        {/* Product Grid - staggered */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 stagger-fade-in">
            {filtered.map((product, i) => (
              <div key={product._id} className={i % 3 === 1 ? 'lg:mt-16' : ''}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-muted-foreground italic">Không tìm thấy đóa hoa nào</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Collection;
