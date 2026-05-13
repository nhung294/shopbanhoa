import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { moodLabels, type Mood, type Product } from '@/data/products';
import { Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { SubscriptionForm } from '@/components/SubscriptionForm';
import { useSubscriptions } from '@/hooks/useSubscriptions';

const plans = [
  { id: 'weekly', name: 'Hàng Tuần', price: 450000, frequency: 'mỗi tuần', description: 'Bó hoa tươi mới mỗi tuần, thay đổi theo mùa.' },
  { id: 'biweekly', name: '2 Tuần', price: 380000, frequency: 'mỗi 2 tuần', description: 'Hoa tươi 2 lần mỗi tháng, lựa chọn phổ biến nhất.', popular: true },
  { id: 'monthly', name: 'Hàng Tháng', price: 550000, frequency: 'mỗi tháng', description: 'Bó hoa đặc biệt mỗi tháng, lớn hơn và phong phú hơn.' },
];

const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState('biweekly');
  const [selectedMood, setSelectedMood] = useState<Mood>('romantic');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { createSubscription, loading: creating } = useSubscriptions();

  useEffect(() => {
    let mounted = true;
    api.get('/api/products')
      .then((res: any) => {
        if (!mounted) return;
        // API may return array or {products: []}
        const arr = Array.isArray(res) ? res : res.products || [];
        setProducts(arr as Product[]);
      })
      .catch(() => {
        if (!mounted) return;
        setProducts([]);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <main className="pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-20">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">Hoa định kỳ</p>
          <h1 className="font-display text-5xl md:text-6xl font-light text-foreground">
            Mỗi kỳ, một <span className="italic text-primary">bất ngờ</span>
          </h1>
          <p className="mt-6 text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Đăng ký nhận hoa tươi được tuyển chọn theo tâm trạng yêu thích. Mỗi lần giao là một tác phẩm mới.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {plans.map(plan => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative text-left p-8 rounded-sm transition-all duration-300 ${
                selectedPlan === plan.id
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'bg-card hover:bg-secondary/80'
              }`}
            >
              {plan.popular && (
                <span className={`absolute top-4 right-4 text-[10px] tracking-widest uppercase px-2 py-1 rounded-full ${
                  selectedPlan === plan.id ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'
                }`}>
                  Phổ biến
                </span>
              )}
              <h3 className="font-display text-2xl font-light">{plan.name}</h3>
              <div className="mt-4">
                <span className="font-mono text-3xl">{(plan.price / 1000).toFixed(0)}K</span>
                <span className={`text-xs ml-1 ${selectedPlan === plan.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  ₫ / {plan.frequency}
                </span>
              </div>
              <p className={`mt-4 text-sm leading-relaxed ${selectedPlan === plan.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {plan.description}
              </p>

              {selectedPlan === plan.id && (
                <div className="absolute bottom-4 right-4 w-6 h-6 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <Check size={14} />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Mood Selection */}
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-light text-foreground mb-2">
            Chọn <span className="italic text-primary">tâm trạng</span> yêu thích
          </h2>
          <p className="text-sm text-muted-foreground">Chúng tôi sẽ cá nhân hóa bó hoa theo phong cách bạn chọn</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {(Object.keys(moodLabels) as Mood[]).map(mood => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={`p-6 rounded-sm text-left transition-all duration-300 ${
                selectedMood === mood
                  ? 'bg-accent ring-2 ring-primary'
                  : 'bg-card hover:bg-secondary/80'
              }`}
            >
              <h4 className="font-display text-xl">{moodLabels[mood].name}</h4>
              <p className="text-sm text-muted-foreground mt-2">{moodLabels[mood].description}</p>
            </button>
          ))}
        </div>

        <div className="text-center">
          <div className="mb-4">
            <label className="text-sm block mb-2">Chọn sản phẩm</label>
            <select
              className="w-full max-w-md mx-auto p-3 border rounded"
              value={selectedProductId ?? ''}
              onChange={(e) => setSelectedProductId(e.target.value || null)}
            >
              <option value="">-- Chọn sản phẩm --</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>{p.name} — {(p.price/1000).toFixed(0)}K</option>
              ))}
            </select>
          </div>

          <Button
            className="rounded-full px-12 h-14 font-body tracking-widest uppercase text-sm"
            onClick={() => {
              if (!user) return navigate('/login');
              if (!selectedProductId) return; // noop if no product
              setShowForm(true);
            }}
          >
            Đăng ký ngay
          </Button>
          <p className="text-xs text-muted-foreground mt-4">Có thể hủy bất cứ lúc nào</p>
        </div>

        {showForm && selectedProductId && (
          <div className="mt-10 max-w-3xl mx-auto">
            {/** load selected product info */}
            {(() => {
              const prod = products.find(p => p._id === selectedProductId);
              if (!prod) return <p>Đang tải sản phẩm...</p>;
              return (
                <SubscriptionForm
                  productId={prod._id}
                  productName={prod.name}
                  productPrice={prod.price}
                  loading={creating}
                  onSubmit={async (data) => {
                    await createSubscription(data);
                    setShowForm(false);
                  }}
                />
              );
            })()}
          </div>
        )}
      </div>
    </main>
  );
};

export default Subscription;
