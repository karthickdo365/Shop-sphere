// Seed script for ShopSphere e-commerce
// Run with: npm run db:seed
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const categories = [
  { name: 'T-Shirts', slug: 't-shirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600' },
  { name: 'Mobiles', slug: 'mobiles', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600' },
  { name: 'Laptops', slug: 'laptops', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600' },
  { name: 'Toys', slug: 'toys', image: 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600' },
  { name: 'Furniture', slug: 'furniture', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600' },
  { name: 'Books', slug: 'books', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600' },
];

const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
const colors = ['BLACK', 'BLUE', 'BEIGE', 'BURGUNDY', 'DARK GREY', 'NAVY', 'PEACOCK', 'RED', 'GREY', 'BOTTLE GREEN'];

// Sample products for various categories — proving the spec system works for any product type
const sampleProducts = [
  // ===== T-SHIRT (clothing) =====
  {
    name: 'Premium Cotton Crew Neck T-Shirt',
    categorySlug: 't-shirts',
    price: 399,
    mrp: 799,
    img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
    bundle: true,
    newArrival: true,
    specs: [
      { section: 'General', key: 'Brand', value: 'ShopSphere' },
      { section: 'General', key: 'Sleeve', value: 'Half Sleeve' },
      { section: 'General', key: 'Pattern', value: 'Solid' },
      { section: 'Material', key: 'Fabric', value: '100% Cotton' },
      { section: 'Material', key: 'GSM', value: '180' },
      { section: 'Wash Care', key: 'Wash', value: 'Machine Wash Cold' },
      { section: 'Wash Care', key: 'Iron', value: 'Medium Heat' },
    ],
  },
  {
    name: 'Striped Polo T-Shirt - Smart Casual',
    categorySlug: 't-shirts',
    price: 599,
    mrp: 1299,
    img: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600',
    bundle: false,
    specs: [
      { section: 'General', key: 'Brand', value: 'ShopSphere' },
      { section: 'General', key: 'Collar', value: 'Polo Collar' },
      { section: 'General', key: 'Fit', value: 'Regular Fit' },
      { section: 'Material', key: 'Fabric', value: 'Pique Cotton' },
      { section: 'Material', key: 'GSM', value: '220' },
    ],
  },

  // ===== MOBILE (electronics) =====
  {
    name: 'Galaxy Pro Smartphone - 8GB RAM - 256GB Storage',
    categorySlug: 'mobiles',
    price: 24999,
    mrp: 32999,
    img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
    bundle: false,
    isFeatured: true,
    specs: [
      { section: 'Display', key: 'Size', value: '6.7 inch' },
      { section: 'Display', key: 'Type', value: 'AMOLED' },
      { section: 'Display', key: 'Resolution', value: '1080 x 2400 px' },
      { section: 'Display', key: 'Refresh Rate', value: '120 Hz' },
      { section: 'Performance', key: 'RAM', value: '8 GB' },
      { section: 'Performance', key: 'Storage', value: '256 GB' },
      { section: 'Performance', key: 'Processor', value: 'Octa-core 2.4 GHz' },
      { section: 'Performance', key: 'OS', value: 'Android 14' },
      { section: 'Battery', key: 'Capacity', value: '5000 mAh' },
      { section: 'Battery', key: 'Charging', value: '65W Fast Charging' },
      { section: 'Camera', key: 'Rear', value: '50MP + 12MP + 5MP' },
      { section: 'Camera', key: 'Front', value: '32MP' },
      { section: 'Connectivity', key: 'Network', value: '5G, 4G, 3G, 2G' },
      { section: 'Connectivity', key: 'WiFi', value: 'WiFi 6' },
      { section: 'Connectivity', key: 'Bluetooth', value: '5.3' },
    ],
  },
  {
    name: 'Budget Smart Phone - 4GB RAM - 64GB Storage',
    categorySlug: 'mobiles',
    price: 8999,
    mrp: 11999,
    img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600',
    bundle: false,
    onOffer: true,
    specs: [
      { section: 'Display', key: 'Size', value: '6.5 inch' },
      { section: 'Display', key: 'Type', value: 'IPS LCD' },
      { section: 'Performance', key: 'RAM', value: '4 GB' },
      { section: 'Performance', key: 'Storage', value: '64 GB' },
      { section: 'Battery', key: 'Capacity', value: '4000 mAh' },
      { section: 'Camera', key: 'Rear', value: '13MP + 2MP' },
    ],
  },

  // ===== LAPTOP (electronics) =====
  {
    name: 'UltraBook Pro 14 - 16GB RAM - 512GB SSD',
    categorySlug: 'laptops',
    price: 64999,
    mrp: 79999,
    img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600',
    bundle: false,
    isFeatured: true,
    specs: [
      { section: 'Display', key: 'Size', value: '14 inch' },
      { section: 'Display', key: 'Resolution', value: '1920 x 1200 px' },
      { section: 'Display', key: 'Type', value: 'IPS Anti-glare' },
      { section: 'Performance', key: 'Processor', value: 'Intel Core i5-1335U' },
      { section: 'Performance', key: 'RAM', value: '16 GB DDR4' },
      { section: 'Performance', key: 'Storage', value: '512 GB NVMe SSD' },
      { section: 'Performance', key: 'Graphics', value: 'Intel Iris Xe' },
      { section: 'Performance', key: 'OS', value: 'Windows 11 Home' },
      { section: 'Connectivity', key: 'WiFi', value: 'WiFi 6E' },
      { section: 'Connectivity', key: 'Bluetooth', value: '5.3' },
      { section: 'Ports', key: 'USB', value: '2x USB-A 3.2, 1x USB-C' },
      { section: 'Ports', key: 'HDMI', value: '1x HDMI 2.1' },
      { section: 'Battery', key: 'Capacity', value: '56 Wh' },
      { section: 'Battery', key: 'Backup', value: 'Up to 10 hours' },
      { section: 'General', key: 'Weight', value: '1.4 kg' },
      { section: 'General', key: 'Warranty', value: '1 Year International' },
    ],
  },

  // ===== TOY =====
  {
    name: 'Building Blocks Set - 200 Pieces',
    categorySlug: 'toys',
    price: 499,
    mrp: 999,
    img: 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600',
    bundle: true,
    newArrival: true,
    specs: [
      { section: 'General', key: 'Brand', value: 'PlayMax' },
      { section: 'General', key: 'Age Group', value: '3+ Years' },
      { section: 'General', key: 'Number of Pieces', value: '200' },
      { section: 'Material', key: 'Material', value: 'Non-toxic ABS Plastic' },
      { section: 'Material', key: 'Color', value: 'Multi-color' },
      { section: 'Dimensions', key: 'Box Size', value: '30 x 22 x 8 cm' },
      { section: 'Dimensions', key: 'Weight', value: '450 g' },
      { section: 'Safety', key: 'Certification', value: 'BIS Approved' },
      { section: 'Safety', key: 'Choking Hazard', value: 'Yes - Small parts' },
    ],
  },

  // ===== FURNITURE =====
  {
    name: 'Ergonomic Office Chair with Lumbar Support',
    categorySlug: 'furniture',
    price: 7999,
    mrp: 14999,
    img: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600',
    bundle: false,
    onOffer: true,
    specs: [
      { section: 'General', key: 'Brand', value: 'ComfortSeat' },
      { section: 'General', key: 'Type', value: 'High Back Office Chair' },
      { section: 'General', key: 'Color', value: 'Black' },
      { section: 'Material', key: 'Seat Material', value: 'Breathable Mesh' },
      { section: 'Material', key: 'Frame', value: 'Nylon Reinforced' },
      { section: 'Material', key: 'Base', value: 'Metal' },
      { section: 'Dimensions', key: 'Seat Width', value: '50 cm' },
      { section: 'Dimensions', key: 'Seat Depth', value: '48 cm' },
      { section: 'Dimensions', key: 'Back Height', value: '65 cm' },
      { section: 'Dimensions', key: 'Max Load', value: '120 kg' },
      { section: 'Adjustment', key: 'Height Adjustable', value: 'Yes - 8 cm range' },
      { section: 'Adjustment', key: 'Recline', value: 'Up to 135 degrees' },
      { section: 'Adjustment', key: 'Armrest', value: 'Adjustable 3D' },
      { section: 'Warranty', key: 'Duration', value: '3 Years' },
    ],
  },

  // ===== BOOK =====
  {
    name: 'Atomic Habits - by James Clear',
    categorySlug: 'books',
    price: 399,
    mrp: 699,
    img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600',
    bundle: false,
    isFeatured: true,
    specs: [
      { section: 'General', key: 'Title', value: 'Atomic Habits' },
      { section: 'General', key: 'Author', value: 'James Clear' },
      { section: 'General', key: 'Publisher', value: 'Penguin Random House' },
      { section: 'General', key: 'Language', value: 'English' },
      { section: 'General', key: 'Genre', value: 'Self-help' },
      { section: 'Details', key: 'Pages', value: '320' },
      { section: 'Details', key: 'Binding', value: 'Paperback' },
      { section: 'Details', key: 'Edition', value: '1st Edition, 2018' },
      { section: 'Details', key: 'ISBN', value: '978-1847941831' },
      { section: 'Dimensions', key: 'Size', value: '13.4 x 2.1 x 19.8 cm' },
      { section: 'Dimensions', key: 'Weight', value: '280 g' },
    ],
  },
];

async function main() {
  console.log('Seeding ShopSphere database...');

  // 1. Categories + Subcategories
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        name: c.name,
        slug: c.slug,
        image: c.image,
        description: `${c.name} category`,
      },
    });
  }
  console.log(`Created ${categories.length} categories`);

  // 2. Admin user
  const adminPass = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@shopsphere.com' },
    update: {},
    create: {
      email: 'admin@shopsphere.com',
      password: adminPass,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  const customerPass = await bcrypt.hash('customer123', 10);
  await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: customerPass,
      name: 'Test Customer',
      phone: '9876543210',
    },
  });
  console.log('Created admin + customer users');

  // 3. Products + Specifications
  for (const p of sampleProducts) {
    const category = await prisma.category.findUnique({ where: { slug: p.categorySlug } });
    if (!category) continue;
    const slug = slugify(p.name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) continue;

    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: `${p.name}. Premium quality product from ShopSphere. Shop with confidence - 30 day returns and free shipping on orders above ₹999.`,
        basePrice: p.mrp,
        discountPrice: p.price,
        bundleAvailable: p.bundle || false,
        bundleLabel: p.bundle ? 'Bundle Available' : null,
        isFeatured: p.isFeatured || false,
        isNewArrival: p.newArrival || false,
        isOnOffer: p.onOffer || false,
        rating: Number((3.8 + Math.random() * 1.2).toFixed(1)),
        numReviews: Math.floor(Math.random() * 200) + 10,
        categoryId: category.id,
        images: {
          create: [
            { url: p.img, alt: p.name, position: 0 },
            { url: p.img, alt: p.name + ' - view 2', position: 1 },
          ],
        },
        variants: {
          create: p.categorySlug === 't-shirts'
            ? sizes.flatMap((size) =>
                colors.slice(0, 5).map((color) => ({
                  size,
                  color,
                  stock: Math.floor(Math.random() * 30) + 5,
                  sku: `${slug.toUpperCase().replace(/-/g, '').slice(0, 8)}-${size}-${color.replace(/\s/g, '').slice(0, 4)}`,
                }))
              )
            : [
                { size: 'STANDARD', color: 'DEFAULT', stock: Math.floor(Math.random() * 50) + 10, sku: slug.toUpperCase().replace(/-/g, '').slice(0, 12) },
              ],
        },
        specifications: p.specs
          ? { create: p.specs.map((s, i) => ({ section: s.section, key: s.key, value: s.value, position: i })) }
          : undefined,
      },
    });
    console.log(`Created product: ${product.name} (${p.specs?.length || 0} specs)`);
  }

  // 4. Coupons
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      description: '10% off on first order',
      type: 'PERCENT',
      value: 10,
      minOrder: 500,
      maxDiscount: 200,
      endsAt: new Date('2027-12-31'),
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
