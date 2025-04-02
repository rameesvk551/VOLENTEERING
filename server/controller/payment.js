const { razorpay } = require("../config/razorpay");
const crypto=require("crypto");
const User = require("../model/user");
exports.createPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    // Create order
    const order = await razorpay.orders.create(options);
    console.log("🛠️ Created Order:", order);

    // 🔑 Generate Signature (Not Required for Order, But You Can Send)
    const hmac = crypto.createHmac("sha256", "YOUR_RAZORPAY_SECRET");
    hmac.update(order.id);
    const generatedSignature = hmac.digest("hex");

    // Send order & signature to frontend
    res.status(201).json({
      success: true,
      order,
      signature: generatedSignature, // Not needed but can be sent
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.verifyPayment= async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;


    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");
      console.log("signature ",razorpay_signature ,"generated",generated_signature);

 

    // ✅ Find User & Update Payment History
    console.log("user",req.user.id);
    
    const userId = req.user.id; // Assuming you have user authentication
    await User.findByIdAndUpdate(userId, {
      $push: {
        payments: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          amount: req.body.amount || 0, // Amount must be stored
          status: "Paid",
          method: req.body.method || "Unknown",
        },
      },
    });
console.log(User.findById(userId));

    return res.status(200).json({ success: true, message: "Payment Verified" });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}