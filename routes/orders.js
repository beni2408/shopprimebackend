const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { shippingAddress, couponCode, paymentId } = req.body;
    
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Calculate subtotal
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of cart.items) {
      const product = item.product;
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}` 
        });
      }
      
      const price = product.discountPrice || product.price;
      subtotal += price * item.quantity;
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: price
      });
      
      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }
    
    // Apply coupon if provided
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ 
        code: couponCode.toUpperCase(),
        isActive: true,
        expiryDate: { $gt: new Date() }
      });
      
      if (coupon && subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'percentage') {
          discount = (subtotal * coupon.discountValue) / 100;
        } else {
          discount = coupon.discountValue;
        }
        
        coupon.usedCount += 1;
        await coupon.save();
      }
    }
    
    const deliveryCharge = subtotal > 500 ? 0 : 50;
    const total = subtotal - discount + deliveryCharge;
    
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      subtotal,
      discount,
      deliveryCharge,
      total,
      couponCode,
      paymentId,
      paymentStatus: 'paid'
    });
    
    await order.save();
    
    // Clear cart
    await Cart.findOneAndDelete({ user: req.user.id });
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user orders
router.get('/my', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    }).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;