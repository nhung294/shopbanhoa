import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const stored = localStorage.getItem('user');
      const user = stored ? JSON.parse(stored) : null;
      if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link to="/" className="font-display text-2xl font-light tracking-wide text-foreground">
            Aura <span className="text-primary">&</span> Bloom
          </Link>
          <p className="text-muted-foreground text-sm mt-3 tracking-widest uppercase">Đăng nhập</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-500 text-center bg-red-50 border border-red-200 rounded-md py-2 px-3">
              {error}
            </div>
          )}
          <div>
            <label className="text-xs tracking-widest uppercase text-muted-foreground">Email</label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 bg-secondary/50 border-0"
              placeholder="email@example.com"
              required
            />
          </div>
          <div>
            <label className="text-xs tracking-widest uppercase text-muted-foreground">Mật khẩu</label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 bg-secondary/50 border-0"
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full rounded-full h-12 font-body tracking-widest uppercase text-sm" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-primary hover:underline">Đăng ký</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
