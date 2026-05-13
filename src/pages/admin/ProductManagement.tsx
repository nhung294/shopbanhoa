import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import ProductForm from './ProductForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';

interface CollectionOption {
  _id: string;
  name: string;
  slug: string;
}

interface ProductCollection {
  _id: string;
  name: string;
  slug: string;
}

interface ProductItem {
  _id: string;
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
  featured?: boolean;
  stock?: number;
  minimumStock?: number;
  collection?: ProductCollection | string | null;
}

const ProductManagement = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [collections, setCollections] = useState<CollectionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [productData, collectionData] = await Promise.all([
        api.get('/api/products'),
        api.get('/api/collections'),
      ]);
      setProducts(productData);
      setCollections(collectionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return products;
    }

    return products.filter((product) => {
      const collectionName = typeof product.collection === 'object' && product.collection ? product.collection.name : '';
      return [product.name, product.nameEn, collectionName]
        .join(' ')
        .toLowerCase()
        .includes(keyword);
    });
  }, [products, search]);

  const collectionStats = useMemo(() => {
    return collections.map((collection) => ({
      ...collection,
      count: products.filter((product) => {
        if (typeof product.collection !== 'object' || !product.collection) {
          return false;
        }
        return product.collection._id === collection._id;
      }).length,
    }));
  }, [collections, products]);

  const handleDelete = async (productId: string) => {
    const confirmed = window.confirm('Bạn có chắc muốn xoá sản phẩm này?');
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/api/products/${productId}`);
      await loadData();
      if (editingProduct?._id === productId) {
        setEditingProduct(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xoá sản phẩm');
    }
  };

  const openCreateForm = () => {
    setEditingProduct(null);
    setIsCreating(true);
  };

  const openEditForm = (product: ProductItem) => {
    setEditingProduct(product);
    setIsCreating(true);
  };

  const closeForm = () => {
    setEditingProduct(null);
    setIsCreating(false);
  };

  const handleFormSuccess = async () => {
    await loadData();
    closeForm();
  };

  const activeProduct = editingProduct;

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border bg-white/90 p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Quản Lý Sản Phẩm</h2>
          <p className="text-sm text-muted-foreground">Thêm mới, chỉnh sửa, xoá và gắn sản phẩm vào category</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên sản phẩm hoặc category..."
              className="pl-9"
            />
          </div>
          <Button onClick={openCreateForm} className="gap-2 rounded-full">
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Tổng sản phẩm</CardDescription>
            <CardTitle>{products.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-white/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Đang hiển thị</CardDescription>
            <CardTitle>{filteredProducts.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-white/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Featured</CardDescription>
            <CardTitle>{products.filter((product) => product.featured).length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-white/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Category</CardDescription>
            <CardTitle>{collections.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Danh sách sản phẩm</CardTitle>
            <CardDescription>Nhấn sửa để cập nhật category hoặc nội dung sản phẩm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Đang tải sản phẩm...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Không có sản phẩm phù hợp.</div>
            ) : (
              filteredProducts.map((product) => {
                const collectionName = typeof product.collection === 'object' && product.collection ? product.collection.name : 'Chưa gắn category';
                return (
                  <div key={product._id} className="flex flex-col gap-4 rounded-2xl border bg-slate-50/70 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-foreground">{product.name}</h3>
                          {product.featured && <Badge variant="secondary">Featured</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{product.nameEn}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{collectionName}</span>
                          <span>•</span>
                          <span>{product.price.toLocaleString('vi-VN')} VNĐ</span>
                          <span>•</span>
                          <span>Tồn kho: {product.stock ?? 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => openEditForm(product)}>
                        <Pencil className="h-4 w-4" />
                        Sửa
                      </Button>
                      <Button variant="destructive" size="sm" className="gap-2" onClick={() => handleDelete(product._id)}>
                        <Trash2 className="h-4 w-4" />
                        Xoá
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {collectionStats.length > 0 && (
            <Card className="bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Phân bố category</CardTitle>
                <CardDescription>Số lượng sản phẩm theo từng bộ sưu tập</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {collectionStats.map((collection) => (
                  <div key={collection._id} className="flex items-center justify-between rounded-xl border bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{collection.name}</p>
                      <p className="text-xs text-muted-foreground">{collection.slug}</p>
                    </div>
                    <Badge variant="outline">{collection.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {isCreating && (
            <Card className="bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">
                  {activeProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                </CardTitle>
                <CardDescription>Chọn category và cập nhật nội dung sản phẩm ngay tại đây</CardDescription>
              </CardHeader>
              <CardContent>
                <ProductForm
                  product={activeProduct}
                  collections={collections}
                  onSuccess={handleFormSuccess}
                  onCancel={closeForm}
                />
              </CardContent>
            </Card>
          )}

          {!isCreating && (
            <Card className="bg-white/90 shadow-sm">
              <CardContent className="flex flex-col items-start gap-3 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Mở form quản lý</h3>
                  <p className="text-sm text-muted-foreground">Chọn một sản phẩm để chỉnh sửa hoặc tạo mới sản phẩm kèm category.</p>
                </div>
                <Button onClick={openCreateForm} className="rounded-full">
                  Thêm sản phẩm mới
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
