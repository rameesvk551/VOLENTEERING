const Host = require("../model/host");

const updateLastActive = async (req, res, next) => {
  console.log("uuuuuuuuuuuuuuuuuuuuupdating last ",);
  
  try {
    if (req.hostName) {
      console.log("hhhhhst und");
      
    
      console.log("uuuuuuuuuuuuuuuuuuuuupdatid last ",);
  
    }
    next(); 
  } catch (error) {
    console.error("Error updating lastActive:", error);
    next();
  }
};

module.exports = updateLastActive;
