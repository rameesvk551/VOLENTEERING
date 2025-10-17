
const Call = require("../model/call");
const Host = require("../model/host");
const User = require("../model/user"); // Adjust path if needed

exports.getAllCalls = async (req, res) => {
  try {
    const loggedUserId = req.user ? req.user.id : req.hostName?.id;

    const allCalls = await Call.find({
      $or: [
        { callerId: loggedUserId },
        { receiverId: loggedUserId },
      ],
    })
      .sort({ startedAt: -1 })
      .lean();

    // Fetch only the other user details for each call
    const callsFormatted = await Promise.all(
      allCalls.map(async call => {
        const isOutgoing = call.callerId.toString() === loggedUserId;
        const otherUserId = isOutgoing ? call.receiverId : call.callerId;
         // Try to find user in both User and Host collections
         let otherUser = await User.findById(otherUserId).lean();
         if (!otherUser) {
           otherUser = await Host.findById(otherUserId).lean();
         }
        return {
          id: call._id.toString(),
          status:call.status,
          type:
            call.status === "missed" || call.status === "rejected"
              ? "missed"
              : isOutgoing
              ? "outgoing"
              : "incoming",
          time: call.startedAt
            ? call.startedAt.toISOString()
            : new Date().toISOString(),
          user: otherUser, // only the othe
        
          
        };
      })
    );

    res.status(200).json({ calls: callsFormatted });

  } catch (error) {
    console.error("Error fetching call history:", error);
    res.status(500).json({ message: "Failed to retrieve call history" });
  }
};
