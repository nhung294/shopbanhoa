import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';

interface CollectionOption {
  _id: string;
  name: string;
  slug: string;
}

interface ProductFormData {
  name: string;
  nameEn: string;
  price: string;
  description: string;
  meaning: string;
  durability: string;
  size: string;
  mood: string;
  occasion: string;
  season: string;
  image: string;
  collection: string;
  featured: boolean;
}

interface Product {
  _id?: string;
  name: string;
  nameEn: string;
  price: number;
  description: string;
  meaning: string;
  durability: string;
  size: string;
  mood: string;
  occasion: string[];
  season: string[];
  image: string;
  collection?: string | CollectionOption | null;
  featured?: boolean;
}

interface ProductFormProps {
  product?: Product | null;
  collections: CollectionOption[];
  onSuccess: () => void;
  onCancel: () => void;
}

const ProductForm = ({ product, collections, onSuccess, onCancel }: ProductFormProps) => {
  const noCollectionValue = '__none__';
  const [form, setForm] = useState<ProductFormData>({
    name: '', nameEn: '', price: '', description: '', meaning: '',
    durability: '', size: '', mood: 'romantic', occasion: '', season: '', image: '', collection: noCollectionValue, featured: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      const collectionId = typeof product.collection === 'object' && product.collection
        ? product.collection._id
        : typeof product.collection === 'string'
          ? product.collection
          : '';

      setForm({
        name: product.name, nameEn: product.nameEn, price: String(product.price),
        description: product.description, meaning: product.meaning, durability: product.durability,
        size: product.size, mood: product.mood, occasion: (product.occasion ?? []).join(', '),
        season: (product.season ?? []).join(', '), image: product.image, collection: collectionId || noCollectionValue, featured: product.featured || false,
      });
    } else {
      setForm({
        name: '', nameEn: '', price: '', description: '', meaning: '',
        durability: '', size: '', mood: 'romantic', occasion: '', season: '', image: '', collection: noCollectionValue, featured: false,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        occasion: form.occasion.split(',').map(s => s.trim()).filter(Boolean),
        season: form.season.split(',').map(s => s.trim()).filter(Boolean),
        collection: form.collection === noCollectionValue ? null : form.collection,
      };
      if (product?._id) {
        await api.put(`/api/products/${product._id}`, payload);
      } else {
        await api.post('/api/products', payload);
      }
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi khi lưu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, key: keyof ProductFormData, type = 'text', placeholder = '') => (
    <div>
      <label className="text-xs tracking-widest uppercase text-muted-foreground">{label}</label>
      <Input
        type={type}
        value={String(form[key])}
        onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
        className="mt-1 bg-secondary/50 border-0"
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md py-2 px-3">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        {field('Tên (VI)', 'name', 'text', 'Hoàng Hôn Mùa Thu')}
        {field('Tên (EN)', 'nameEn', 'text', 'Autumn Sunset')}
      </div>
      {field('Giá (VND)', 'price', 'number', '850000')}
      <div>
        <label className="text-xs tracking-widest uppercase text-muted-foreground">Mô tả</label>
        <Textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} className="mt-1 bg-secondary/50 border-0 resize-none" rows={3} />
      </div>
      {field('Ý nghĩa', 'meaning')}
      <div className="grid grid-cols-2 gap-4">
        {field('Độ bền', 'durability', 'text', '7-10 ngày')}
        {field('Kích thước', 'size', 'text', '35cm × 30cm')}
      </div>
      <div>
        <label className="text-xs tracking-widest uppercase text-muted-foreground">Mood</label>
        <select value={form.mood} onChange={e => setForm(prev => ({ ...prev, mood: e.target.value }))} className="mt-1 w-full h-10 px-3 rounded-md bg-secondary/50 text-sm border-0 outline-none">
          <option value="romantic">romantic</option>
          <option value="serene">serene</option>
          <option value="vibrant">vibrant</option>
        </select>
      </div>
      <div>
        <label className="text-xs tracking-widest uppercase text-muted-foreground">Category / Collection</label>
        <Select value={form.collection} onValueChange={(value) => setForm((prev) => ({ ...prev, collection: value }))}>
          <SelectTrigger className="mt-1 bg-secondary/50 border-0">
            <SelectValue placeholder="Chọn category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={noCollectionValue}>Không gắn category</SelectItem>
            {collections.map((collection) => (
              <SelectItem key={collection._id} value={collection._id}>
                {collection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {field('Occasion (comma-separated)', 'occasion', 'text', 'birthday, anniversary')}
      {field('Season (comma-separated)', 'season', 'text', 'spring, summer')}
      {field('URL ảnh', 'image', 'url')}
      <div className="flex items-center gap-2">
        <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm(prev => ({ ...prev, featured: e.target.checked }))} />
        <label htmlFor="featured" className="text-sm text-muted-foreground">Nổi bật</label>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1 rounded-full" disabled={loading}>
          {loading ? 'Đang lưu...' : (product ? 'Cập nhật' : 'Thêm mới')}
        </Button>
        <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={onCancel}>Hủy</Button>
      </div>
    </form>
  );
};

export default ProductForm;
