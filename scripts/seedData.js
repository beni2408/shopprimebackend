const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = new User({
      name: 'Admin User',
      email: 'admin@shopprime.com',
      password: adminPassword,
      role: 'admin',
      phone: '9876543210'
    });
    await admin.save();

    // Create sample user
    const userPassword = await bcrypt.hash('user123', 12);
    const user = new User({
      name: 'John Doe',
      email: 'user@example.com',
      password: userPassword,
      phone: '9876543211'
    });
    await user.save();

    // Create sample products
    const products = [
      {
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with A17 Pro chip and titanium design',
        price: 134900,
        discountPrice: 129900,
        category: 'Electronics',
        brand: 'Apple',
        stock: 50,
        images: ['/uploads/iphone15pro.jpg'],
        isFeatured: true
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Premium Android smartphone with S Pen',
        price: 124999,
        discountPrice: 119999,
        category: 'Electronics',
        brand: 'Samsung',
        stock: 30,
        images: ['/uploads/galaxys24.jpg'],
        isFeatured: true
      },
      {
        name: 'MacBook Air M3',
        description: '13-inch laptop with M3 chip',
        price: 114900,
        discountPrice: 109900,
        category: 'Computers',
        brand: 'Apple',
        stock: 25,
        images: ['/uploads/macbookair.jpg'],
        isFeatured: true
      },
      {
        name: 'Sony WH-1000XM5',
        description: 'Wireless noise canceling headphones',
        price: 29990,
        discountPrice: 24990,
        category: 'Audio',
        brand: 'Sony',
        stock: 100,
        images: ['/uploads/sonywh1000xm5.jpg']
      },
      {
        name: 'Nike Air Max 270',
        description: 'Comfortable running shoes',
        price: 12995,
        discountPrice: 9995,
        category: 'Fashion',
        brand: 'Nike',
        stock: 75,
        images: ['/uploads/nikeairmax.jpg']
      },
      {
        name: 'Adidas Ultraboost 22',
        description: 'Premium running shoes with boost technology',
        price: 16999,
        discountPrice: 13999,
        category: 'Fashion',
        brand: 'Adidas',
        stock: 60,
        images: ['/uploads/ultraboost.jpg']
      }
    ];

    await Product.insertMany(products);

    // Create sample coupons
    const coupons = [
      {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 1000,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true
      },
      {
        code: 'FLAT500',
        discountType: 'flat',
        discountValue: 500,
        minOrderValue: 5000,
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        isActive: true
      }
    ];

    await Coupon.insertMany(coupons);

    console.log('Sample data seeded successfully!');
    console.log('Admin credentials: admin@shopprime.com / admin123');
    console.log('User credentials: user@example.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

connectDB().then(() => {
  seedData();
});