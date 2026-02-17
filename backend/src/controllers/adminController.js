const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    let query = { role: 'user' };
    
    if (status && ['pending', 'active', 'expired'].includes(status)) {
      query.subscriptionStatus = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Approve user subscription
// @route   PUT /api/admin/users/:id/approve
// @access  Private/Admin
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    user.subscriptionStatus = 'active';
    user.subscriptionStartDate = startDate;
    user.subscriptionExpiryDate = expiryDate;
    user.renewalRequested = false;
    
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'User approved successfully',
      data: user 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Extend user subscription
// @route   PUT /api/admin/users/:id/extend
// @access  Private/Admin
exports.extendSubscription = async (req, res) => {
  try {
    const { days } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let newExpiryDate;
    
    if (user.subscriptionExpiryDate && new Date(user.subscriptionExpiryDate) > new Date()) {
      newExpiryDate = new Date(user.subscriptionExpiryDate);
    } else {
      newExpiryDate = new Date();
      user.subscriptionStartDate = new Date();
    }
    
    newExpiryDate.setDate(newExpiryDate.getDate() + (days || 30));
    
    user.subscriptionStatus = 'active';
    user.subscriptionExpiryDate = newExpiryDate;
    user.renewalRequested = false;
    
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: `Subscription extended by ${days || 30} days`,
      data: user 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update user expiry date
// @route   PUT /api/admin/users/:id/expiry
// @access  Private/Admin
exports.updateExpiryDate = async (req, res) => {
  try {
    const { expiryDate } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newExpiry = new Date(expiryDate);
    
    if (newExpiry <= new Date()) {
      user.subscriptionStatus = 'expired';
    } else {
      user.subscriptionStatus = 'active';
    }
    
    user.subscriptionExpiryDate = newExpiry;
    user.renewalRequested = false;
    
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'Expiry date updated successfully',
      data: user 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Deactivate user
// @route   PUT /api/admin/users/:id/deactivate
// @access  Private/Admin
exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: user.isActive ? 'User activated' : 'User deactivated',
      data: user 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const pendingUsers = await User.countDocuments({ role: 'user', subscriptionStatus: 'pending' });
    const activeUsers = await User.countDocuments({ role: 'user', subscriptionStatus: 'active' });
    const expiredUsers = await User.countDocuments({ role: 'user', subscriptionStatus: 'expired' });
    const renewalRequests = await User.countDocuments({ role: 'user', renewalRequested: true });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        pendingUsers,
        activeUsers,
        expiredUsers,
        renewalRequests
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
