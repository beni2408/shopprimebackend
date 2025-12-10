const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

const router = express.Router();

router.post('/seed', async (req, res) => {
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
        images: ['https://via.placeholder.com/300x300?text=iPhone+15+Pro'],
        isFeatured: true,
        reviews: [],
        averageRating: 4.5
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Premium Android smartphone with S Pen',
        price: 124999,
        discountPrice: 119999,
        category: 'Electronics',
        brand: 'Samsung',
        stock: 30,
        images: ['https://via.placeholder.com/300x300?text=Galaxy+S24'],
        isFeatured: true,
        reviews: [],
        averageRating: 4.3
      },
      {
        name: 'MacBook Air M3',
        description: '13-inch laptop with M3 chip',
        price: 114900,
        discountPrice: 109900,
        category: 'Computers',
        brand: 'Apple',
        stock: 25,
        images: ['https://via.placeholder.com/300x300?text=MacBook+Air'],
        isFeatured: true,
        reviews: [],
        averageRating: 4.7
      },
      {
        name: 'Sony WH-1000XM5',
        description: 'Wireless noise canceling headphones',
        price: 29990,
        discountPrice: 24990,
        category: 'Audio',
        brand: 'Sony',
        stock: 100,
        images: ['https://via.placeholder.com/300x300?text=Sony+Headphones'],
        reviews: [],
        averageRating: 4.4
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
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
      }
    ];

    await Coupon.insertMany(coupons);

    res.json({ 
      message: 'Database seeded successfully!',
      products: products.length,
      users: 2,
      coupons: coupons.length
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;