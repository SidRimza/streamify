const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@streamify.com',
        password: 'admin123',
        role: 'admin',
        subscriptionStatus: 'active',
        isActive: true
      });
      console.log('Default admin created: admin@streamify.com / admin123');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

module.exports = seedAdmin;
