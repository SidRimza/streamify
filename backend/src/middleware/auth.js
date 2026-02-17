const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    if (!req.user.isActive) {
      return res.status(401).json({ success: false, message: 'Account has been deactivated' });
    }
    
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};

// Check subscription validity
exports.checkSubscription = async (req, res, next) => {
  const user = req.user;

  if (user.role === 'admin') {
    return next();
  }

  if (user.subscriptionStatus === 'pending') {
    return res.status(403).json({ 
      success: false, 
      message: 'Your account is pending approval',
      subscriptionStatus: 'pending'
    });
  }

  if (user.subscriptionStatus === 'expired' || !user.hasValidSubscription()) {
    // Update status if expired
    if (user.subscriptionStatus === 'active') {
      user.subscriptionStatus = 'expired';
      await user.save();
    }
    return res.status(403).json({ 
      success: false, 
      message: 'Your subscription has expired',
      subscriptionStatus: 'expired'
    });
  }

  next();
};
