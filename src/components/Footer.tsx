import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-secondary/50 mt-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div>
            <h3 className="font-display text-3xl font-light mb-4 text-foreground">
              Aura <span className="text-primary">&</span> Bloom
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Mỗi đóa hoa là một câu chuyện. Chúng tôi tuyển chọn và sắp đặt hoa tươi như những tác phẩm nghệ thuật sống.
            </p>
          </div>

          <div>
            <h4 className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6">Khám phá</h4>
            <div className="flex flex-col gap-3">
              <Link to="/collection" className="text-sm text-foreground/70 hover:text-primary transition-colors">Bộ sưu tập</Link>
              <Link to="/subscription" className="text-sm text-foreground/70 hover:text-primary transition-colors">Hoa định kỳ</Link>
            </div>
          </div>

          <div>
            <h4 className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6">Liên hệ</h4>
            <div className="flex flex-col gap-3 text-sm text-foreground/70">
              <p>68 Hồ Tùng Mậu, Mai Dịch, Cầu Giấy, Hà Nội</p>
              <p>hello@aurabloom.vn</p>
              <p className="font-mono text-xs">0346 399 763</p>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground text-center tracking-widest">
            © 2026 AURA & BLOOM — Nghệ thuật hoa tươi
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
