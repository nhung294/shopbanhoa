export type Mood = 'romantic' | 'serene' | 'vibrant';
export type Occasion = 'birthday' | 'anniversary' | 'sympathy' | 'celebration' | 'everyday';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface Product {
  _id: string;
  name: string;
  nameEn: string;
  price: number;
  description: string;
  meaning: string;
  durability: string;
  size: string;
  mood: Mood;
  occasion: Occasion[];
  season: Season[];
  image: string;
  featured?: boolean;
  stock?: number;
  minimumStock?: number;
}

export const products: Product[] = [
  {
    _id: '1',
    name: 'Hoàng Hôn Mùa Thu',
    nameEn: 'Autumn Sunset',
    price: 850000,
    description: 'Bó hoa hồng cam pha peach, điểm xuyến lá eucalyptus bạc, gợi nên ánh chiều tà dịu dàng.',
    meaning: 'Sự ấm áp, lòng biết ơn và niềm vui giản dị.',
    durability: '7-10 ngày',
    size: '35cm × 30cm',
    mood: 'romantic',
    occasion: ['anniversary', 'everyday'],
    season: ['autumn'],
    image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80',
    featured: true,
  },
  {
_id: '2',
    name: 'Sương Mai',
    nameEn: 'Morning Dew',
    price: 650000,
    description: 'Cúc trắng tinh khôi kết hợp baby breath, như giọt sương mai trên cánh đồng tĩnh lặng.',
    meaning: 'Sự thuần khiết, bình yên và khởi đầu mới.',
    durability: '10-14 ngày',
    size: '30cm × 25cm',
    mood: 'serene',
    occasion: ['sympathy', 'everyday'],
    season: ['spring', 'winter'],
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&q=80',
    featured: true,
  },
  {
    _id: '3',
    name: 'Lửa Phượng',
    nameEn: 'Phoenix Fire',
    price: 1200000,
    description: 'Hoa ly đỏ thẫm phối với hồng nhung và lá monstera, bùng cháy như ngọn lửa phượng.',
    meaning: 'Đam mê mãnh liệt, sức sống và sự tái sinh.',
    durability: '7-10 ngày',
    size: '45cm × 35cm',
    mood: 'vibrant',
    occasion: ['celebration', 'anniversary'],
    season: ['summer'],
    image: 'https://images.unsplash.com/photo-1596438459194-f275f413d6ff?w=800&q=80',
    featured: true,
  },
  {
    _id: '4',
    name: 'Mây Trắng',
    nameEn: 'White Cloud',
    price: 550000,
    description: 'Hoa cẩm tú cầu trắng xanh nhẹ nhàng, tựa đám mây bồng bềnh ngày hè.',
    meaning: 'Sự biết ơn chân thành và ước nguyện tốt đẹp.',
    durability: '5-7 ngày',
    size: '25cm × 25cm',
    mood: 'serene',
    occasion: ['birthday', 'everyday'],
    season: ['summer', 'spring'],
    image: 'https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=800&q=80',
  },
  {
    _id: '5',
    name: 'Vườn Tím',
    nameEn: 'Purple Garden',
    price: 980000,
    description: 'Lavender tươi kết hợp hoa hồng tím pastel và lá olive, hương thơm dịu nhẹ chữa lành.',
    meaning: 'Sự thanh tao, duyên dáng và tĩnh tâm.',
    durability: '7-10 ngày',
    size: '35cm × 30cm',
    mood: 'serene',
    occasion: ['birthday', 'sympathy'],
    season: ['spring', 'summer'],
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&q=80',
  },
  {
    _id: '6',
    name: 'Nắng Vàng',
    nameEn: 'Golden Sun',
    price: 720000,
    description: 'Hướng dương rực rỡ phối cúc vàng và solidago, tỏa sáng như mặt trời buổi sớm.',
    meaning: 'Niềm vui, sự lạc quan và trung thành.',
    durability: '7-10 ngày',
    size: '40cm × 30cm',
    mood: 'vibrant',
    occasion: ['birthday', 'celebration'],
    season: ['summer', 'autumn'],
    image: 'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=800&q=80',
    featured: true,
  },
  {
    _id: '7',
    name: 'Hồng Nhạt',
    nameEn: 'Blush Pink',
    price: 780000,
    description: 'Hoa mẫu đơn hồng phấn phối hồng David Austin, mềm mại và lãng mạn.',
    meaning: 'Tình yêu dịu dàng, sự nữ tính và hạnh phúc.',
    durability: '5-7 ngày',
    size: '30cm × 28cm',
    mood: 'romantic',
    occasion: ['anniversary', 'birthday'],
    stock: 10,
    season: ['spring'],
    image: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=800&q=80',
  },
  {
    _id: '8',
    name: 'Đồng Nội',
    nameEn: 'Meadow Dreams',
    price: 480000,
    description: 'Hoa dại đồng nội: cúc mini, thạch thảo, statice, gợi nhớ cánh đồng quê thanh bình.',
    meaning: 'Tự do, hồn nhiên và vẻ đẹp giản dị.',
    durability: '10-14 ngày',
    size: '35cm × 25cm',
    mood: 'serene',
    occasion: ['everyday'],
    season: ['spring', 'summer'],
    image: 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=800&q=80',
  },
  {
    _id: '9',
    name: 'Đêm Huyền Bí',
    nameEn: 'Mystic Night',
    price: 1350000,
    description: 'Hoa hồng đen đỏ Ecuador phối calla lily tím đen, bí ẩn và quyến rũ.',
    meaning: 'Sự bí ẩn, quyền lực và tình yêu sâu thẳm.',
    durability: '10-14 ngày',
    size: '40cm × 35cm',
    mood: 'vibrant',
    stock: 10,
    occasion: ['anniversary', 'celebration'],
    season: ['autumn', 'winter'],
    image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&q=80',
  },
  {
    _id: '10',
    name: 'Giọt Nắng',
    nameEn: 'Sundrops',
    price: 620000,
    description: 'Tulip vàng cam tươi sáng, điểm xuyết fern xanh, tươi vui như nắng sớm.',
    meaning: 'Niềm vui, sự tươi mới và tình bạn đẹp.',
    durability: '5-7 ngày',
    size: '30cm × 22cm',
    mood: 'vibrant',
    occasion: ['birthday', 'everyday'],
    season: ['spring'],
    image: 'https://images.unsplash.com/photo-1524386416438-98b9b2d4b433?w=800&q=80',
  },
  {
    _id: '11',
    name: 'Trăng Thu',
    nameEn: 'Autumn Moon',
    price: 890000,
    description: 'Hoa cúc mâm xôi trắng ngà phối hoa hồng kem và cành khô nghệ thuật.',
    meaning: 'Sự trường tồn, nỗi nhớ và vẻ đẹp trầm lắng.',
    durability: '10-14 ngày',
    size: '35cm × 32cm',
    mood: 'romantic',
    stock: 10,
    occasion: ['sympathy', 'anniversary'],
    season: ['autumn'],
    image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&q=80',
  },
  {
    _id: '12',
    name: 'Xuân Thì',
    nameEn: 'Spring Bloom',
    price: 750000,
    description: 'Hoa anh đào phối hoa lan hồ điệp trắng, thanh tao và sang trọng.',
    meaning: 'Vẻ đẹp thoáng qua, sự trân quý khoảnh khắc.',
    durability: '7-10 ngày',
    size: '40cm × 30cm',
    mood: 'romantic',
    occasion: ['celebration', 'birthday'],
    season: ['spring'],
    image: 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=800&q=80',
    featured: true,
  },
];

export const moodLabels: Record<Mood, { name: string; description: string }> = {
  romantic: { name: 'Lãng Mạn', description: 'Dịu dàng, nồng nàn, chạm đến trái tim' },
  serene: { name: 'Tĩnh Lặng', description: 'Bình yên, thanh tao, chữa lành tâm hồn' },
  vibrant: { name: 'Rực Rỡ', description: 'Tươi sáng, mãnh liệt, tràn đầy năng lượng' },
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};
