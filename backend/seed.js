require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Collection = require('./models/Collection');

const collectionsData = [
  {
    name: 'Romantic Signature',
    slug: 'romantic-signature',
    description: 'Những thiết kế hoa dành cho khoảnh khắc yêu thương và kỷ niệm đặc biệt.',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80',
  },
  {
    name: 'Serene Harmony',
    slug: 'serene-harmony',
    description: 'Bộ sưu tập nhẹ nhàng mang cảm giác bình yên, thư giãn và chữa lành.',
    image: 'https://images.unsplash.com/photo-1526045478516-99145907023c?w=800&q=80',
  },
  {
    name: 'Vibrant Energy',
    slug: 'vibrant-energy',
    description: 'Sắc hoa rực rỡ, giàu năng lượng cho dịp chúc mừng và lan tỏa niềm vui.',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80',
  },
];

const productsData = [
  {  name: 'Hoàng Hôn Mùa Thu', nameEn: 'Autumn Sunset', 
    price: 850000,
     description: 'Bó hoa hồng cam pha peach, điểm xuyến lá eucalyptus bạc, gợi nên ánh chiều tà dịu dàng.',
      meaning: 'Sự ấm áp, lòng biết ơn và niềm vui giản dị.',
       durability: '7-10 ngày',
        size: '35cm × 30cm',
         mood: 'romantic', occasion: ['anniversary', 'everyday'],
          season: ['autumn'], image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80',
           featured: true, collectionSlug: 'romantic-signature', stock: 15, minimumStock: 5 },
  { name: 'Sương Mai', nameEn: 'Morning Dew', price: 650000, description: 'Cúc trắng tinh khôi kết hợp baby breath, như giọt sương mai trên cánh đồng tĩnh lặng.', meaning: 'Sự thuần khiết, bình yên và khởi đầu mới.', durability: '10-14 ngày', size: '30cm × 25cm', mood: 'serene', occasion: ['sympathy', 'everyday'], season: ['spring', 'winter'], image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&q=80', featured: true, collectionSlug: 'serene-harmony', stock: 18, minimumStock: 6 },
  { name: 'Lửa Phượng', nameEn: 'Phoenix Fire', price: 1200000, description: 'Hoa ly đỏ thẫm phối với hồng nhung và lá monstera, bùng cháy như ngọn lửa phượng.', meaning: 'Đam mê mãnh liệt, sức sống và sự tái sinh.', durability: '7-10 ngày', size: '45cm × 35cm', mood: 'vibrant', occasion: ['celebration', 'anniversary'], season: ['summer'], image: 'https://images.unsplash.com/photo-1596438459194-f275f413d6ff?w=800&q=80', featured: true, collectionSlug: 'vibrant-energy', stock: 10, minimumStock: 4 },
  { name: 'Mây Trắng', nameEn: 'White Cloud', price: 550000, description: 'Hoa cẩm tú cầu trắng xanh nhẹ nhàng, tựa đám mây bồng bềnh ngày hè.', meaning: 'Sự biết ơn chân thành và ước nguyện tốt đẹp.', durability: '5-7 ngày', size: '25cm × 25cm', mood: 'serene', occasion: ['birthday', 'everyday'], season: ['summer', 'spring'], image: 'https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=800&q=80', collectionSlug: 'serene-harmony', stock: 12, minimumStock: 5 },
  { name: 'Vườn Tím', nameEn: 'Purple Garden', price: 980000, description: 'Lavender tươi kết hợp hoa hồng tím pastel và lá olive, hương thơm dịu nhẹ chữa lành.', meaning: 'Sự thanh tao, duyên dáng và tĩnh tâm.', durability: '7-10 ngày', size: '35cm × 30cm', mood: 'serene', occasion: ['birthday', 'sympathy'], season: ['spring', 'summer'], image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&q=80', collectionSlug: 'serene-harmony', stock: 9, minimumStock: 4 },
  { name: 'Nắng Vàng', nameEn: 'Golden Sun', price: 720000, description: 'Hướng dương rực rỡ phối cúc vàng và solidago, tỏa sáng như mặt trời buổi sớm.', meaning: 'Niềm vui, sự lạc quan và trung thành.', durability: '7-10 ngày', size: '40cm × 30cm', mood: 'vibrant', occasion: ['birthday', 'celebration'], season: ['summer', 'autumn'], image: 'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=800&q=80', featured: true, collectionSlug: 'vibrant-energy', stock: 20, minimumStock: 7 },
  { name: 'Hồng Nhạt', nameEn: 'Blush Pink', price: 780000, description: 'Hoa mẫu đơn hồng phấn phối hồng David Austin, mềm mại và lãng mạn.', meaning: 'Tình yêu dịu dàng, sự nữ tính và hạnh phúc.', durability: '5-7 ngày', size: '30cm × 28cm', mood: 'romantic', occasion: ['anniversary', 'birthday'], season: ['spring'], image: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=800&q=80', collectionSlug: 'romantic-signature', stock: 11, minimumStock: 5 },
  { name: 'Đồng Nội', nameEn: 'Meadow Dreams', price: 480000, description: 'Hoa dại đồng nội: cúc mini, thạch thảo, statice, gợi nhớ cánh đồng quê thanh bình.', meaning: 'Tự do, hồn nhiên và vẻ đẹp giản dị.', durability: '10-14 ngày', size: '35cm × 25cm', mood: 'serene', occasion: ['everyday'], season: ['spring', 'summer'], image: 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=800&q=80', collectionSlug: 'serene-harmony', stock: 16, minimumStock: 6 },
  { name: 'Đêm Huyền Bí', nameEn: 'Mystic Night', price: 1350000, description: 'Hoa hồng đen đỏ Ecuador phối calla lily tím đen, bí ẩn và quyến rũ.', meaning: 'Sự bí ẩn, quyền lực và tình yêu sâu thẳm.', durability: '10-14 ngày', size: '40cm × 35cm', mood: 'vibrant', occasion: ['anniversary', 'celebration'], season: ['autumn', 'winter'], image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&q=80', collectionSlug: 'vibrant-energy', stock: 8, minimumStock: 3 },
  { name: 'Giọt Nắng', nameEn: 'Sundrops', price: 620000, description: 'Tulip vàng cam tươi sáng, điểm xuyết fern xanh, tươi vui như nắng sớm.', meaning: 'Niềm vui, sự tươi mới và tình bạn đẹp.', durability: '5-7 ngày', size: '30cm × 22cm', mood: 'vibrant', occasion: ['birthday', 'everyday'], season: ['spring'], image: 'https://images.unsplash.com/photo-1524386416438-98b9b2d4b433?w=800&q=80', collectionSlug: 'vibrant-energy', stock: 14, minimumStock: 5 },
  { name: 'Trăng Thu', nameEn: 'Autumn Moon', price: 890000, description: 'Hoa cúc mâm xôi trắng ngà phối hoa hồng kem và cành khô nghệ thuật.', meaning: 'Sự trường tồn, nỗi nhớ và vẻ đẹp trầm lắng.', durability: '10-14 ngày', size: '35cm × 32cm', mood: 'romantic', occasion: ['sympathy', 'anniversary'], season: ['autumn'], image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&q=80', collectionSlug: 'romantic-signature', stock: 13, minimumStock: 5 },
  { name: 'Xuân Thì', nameEn: 'Spring Bloom', price: 750000, description: 'Hoa anh đào phối hoa lan hồ điệp trắng, thanh tao và sang trọng.', meaning: 'Vẻ đẹp thoáng qua, sự trân quý khoảnh khắc.', durability: '7-10 ngày', size: '40cm × 30cm', mood: 'romantic', occasion: ['celebration', 'birthday'], season: ['spring'], image: 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=800&q=80', featured: true, collectionSlug: 'romantic-signature', stock: 17, minimumStock: 6 },
];

const seedAdmin = async () => {
  const adminEmail = 'admin@bloom.com';
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    await User.create({
      name: 'Admin',
      email: adminEmail,
      password: 'admin123',
      role: 'admin',
    });
    return { created: true, updated: false };
  }

  let updated = false;
  if (existingAdmin.name !== 'Admin') {
    existingAdmin.name = 'Admin';
    updated = true;
  }
  if (existingAdmin.role !== 'admin') {
    existingAdmin.role = 'admin';
    updated = true;
  }

  if (updated) {
    await existingAdmin.save();
  }

  return { created: false, updated };
};

const seedCollections = async () => {
  let created = 0;
  let updated = 0;

  for (const collection of collectionsData) {
    const result = await Collection.updateOne(
      { slug: collection.slug },
      { $set: collection },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    if (result.upsertedCount > 0) {
      created += 1;
    } else if (result.modifiedCount > 0) {
      updated += 1;
    }
  }

  const seededCollections = await Collection.find({
    slug: { $in: collectionsData.map((item) => item.slug) },
  });

  const collectionIdBySlug = new Map(
    seededCollections.map((collection) => [collection.slug, collection._id])
  );

  return { created, updated, collectionIdBySlug };
};

const seedProducts = async (collectionIdBySlug) => {
  let created = 0;
  let updated = 0;

  for (const product of productsData) {
    const { collectionSlug, ...productData } = product;
    const collectionId = collectionIdBySlug.get(collectionSlug) || null;

    const result = await Product.updateOne(
      { nameEn: productData.nameEn },
      {
        $set: {
          ...productData,
          collection: collectionId,
        },
      },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    if (result.upsertedCount > 0) {
      created += 1;
    } else if (result.modifiedCount > 0) {
      updated += 1;
    }
  }

  return { created, updated };
};

const seed = async () => {
  try {
    const adminResult = await seedAdmin();
    const collectionResult = await seedCollections();
    const productResult = await seedProducts(collectionResult.collectionIdBySlug);

    if (adminResult.created) {
      console.log('Admin user created: admin@bloom.com / admin123');
    } else if (adminResult.updated) {
      console.log('Admin user updated to role=admin');
    } else {
      console.log('Admin user already exists');
    }

    console.log(
      `Collections seeded: +${collectionResult.created} created, ${collectionResult.updated} updated`
    );
    console.log(
      `Products seeded: +${productResult.created} created, ${productResult.updated} updated`
    );
  } catch (err) {
    console.error('Seed error:', err.message);
    throw err;
  }
};

if (require.main === module) {
  connectDB()
    .then(async () => {
      await seed();
      console.log('Seed complete');
    })
    .catch((err) => {
      console.error('Seed failed:', err.message);
      process.exitCode = 1;
    })
    .finally(async () => {
      await mongoose.disconnect();
    });
} else {
  module.exports = seed;
}
