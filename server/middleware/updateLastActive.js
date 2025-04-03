const Host = require("../model/host");

const updateLastActive = async (req, res, next) => {
  try {
    if (req.user) {
      await Host.findByIdAndUpdate(req.user.id, { lastActive: new Date() });
    }
    next();
  } catch (error) {
    console.error("Error updating lastActive:", error);
    next();
  }
};

module.exports = updateLastActive;
