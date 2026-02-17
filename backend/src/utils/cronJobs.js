const cron = require('node-cron');
const User = require('../models/User');

// Run every day at midnight to check and update expired subscriptions
const checkExpiredSubscriptions = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running subscription expiry check...');
    try {
      const now = new Date();
      
      const result = await User.updateMany(
        {
          role: 'user',
          subscriptionStatus: 'active',
          subscriptionExpiryDate: { $lt: now }
        },
        {
          $set: { subscriptionStatus: 'expired' }
        }
      );

      console.log(`Updated ${result.modifiedCount} expired subscriptions`);
    } catch (error) {
      console.error('Error checking expired subscriptions:', error);
    }
  });
};

module.exports = { checkExpiredSubscriptions };
