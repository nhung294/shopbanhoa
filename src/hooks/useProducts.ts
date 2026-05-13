import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Product } from '@/data/products';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/products')
      .then(setProducts)
      .catch(() => setError('Không thể tải sản phẩm'))
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}
