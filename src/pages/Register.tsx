import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate(data.user?.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại');
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
          <p className="text-muted-foreground text-sm mt-3 tracking-widest uppercase">Đăng ký tài khoản</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-500 text-center bg-red-50 border border-red-200 rounded-md py-2 px-3">
              {error}
            </div>
          )}
          <div>
            <label className="text-xs tracking-widest uppercase text-muted-foreground">Họ tên</label>
            <Input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 bg-secondary/50 border-0" placeholder="Nguyễn Văn A" required />
          </div>
          <div>
            <label className="text-xs tracking-widest uppercase text-muted-foreground">Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 bg-secondary/50 border-0" placeholder="email@example.com" required />
          </div>
          <div>
            <label className="text-xs tracking-widest uppercase text-muted-foreground">Mật khẩu</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 bg-secondary/50 border-0" placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full rounded-full h-12 font-body tracking-widest uppercase text-sm" disabled={loading}>
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-primary hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
