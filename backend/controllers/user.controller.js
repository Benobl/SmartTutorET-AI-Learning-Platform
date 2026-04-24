import User from "../models/User.js"
import FriendRequest from "../models/FriendRequest.js";
export async function getRecommendedUsers(req, res) {
  try {

    const currentUserId = req.user.id;
    const currentUser = req.user;

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },//Exclude current user
        { $id: { $nin: currentUser.friends } },//exclude current User friends
        { isOnboarded: true }
      ]
    });
    res.status(200).json(recommendedUsers)
  } catch (error) {
    console.error("Error in getRecommendedUsers controller", error.message)
    res.status(500).json({ message: "Internal Server Error" })
  }
}
export async function getMyFriends(req, res) {

  try {
    const currentUser = await User.findById(req.user.id).select("friends").populate("friends", "fullName profilePic nativeLanguage learningLanguage");
    res.status(200).json(currentUser.friends)
  } catch (error) {
    console.log('Error in getMyfriends controller', error.message);
    res.status(500).json({ message: "Internal Server Error" })
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;
    //prevent sending req to yourself
    if (myId === recipientId) {
      return res.status(400).json({ message: "You can't send friend request to yourself" })
    }
    //check if the user exists
    const recipient = await User.findById(recipientId)
    if (!recipient) {
      return res.status(400).json({ message: "Recipient not found" })
    }
    //check if the user already friends

    if (recipient.friends.includes(myId)) {
      return res.status(400).json({ message: "You are already friends with this user" })
    }
    //check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        {
          sender: myId, recipient: recipientId
        },
        {
          sender: recipientId, recipient: myId
        }
      ]
    })
    if (existingRequest) {
      return res.status(400).json({ message: "A friend request already exists between you and this user" })
    }

    const friendRequest = await FriendRequest.create({
      sender: myId, recipient: recipientId
    })
    res.status(201).json(friendRequest)
  } catch (error) {
    console.error("Error in sendFriendRequest controller", error.message)
    res.status(500).json({ message: "Internal Server Error" })
  }
}



export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });

    }
    //verify the current user is the recipent
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to accept this request" })
    }
    friendRequest.status = "accepted";
    await friendRequest.save()
    //add each user to the others friends array
    //$addToSet :add elements to an array only if they do not already exists

    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    })
    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    })
    res.status(200).json({ message: "Friend request accepted" })
  } catch (error) {
    console.log("Error in acceptFriendRequest controller ", error.message)
    res.status(500).json({ message: "Internal Server Error" })
  }
}

export async function getFriendRequest(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", "fullName,profilePic nativeLanguage learningLanguage");
    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipent", "fullName,profilePic");
    res.status(200).json({
      incomingReqs, acceptedReqs
    })
  } catch (error) {
    console.log("Error in acceptFriendRequest controller ", error.message)
    res.status(500).json({ message: "Internal Server Error" })
  }
}

export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipent", "fullName,profilePic nativeLanguage learningLanguage");
    res.status(200).json({
      outgoingRequests
    })
  } catch (error) {
    console.log("Error in getOutgoingFriendRequest controller ", error.message)
    res.status(500).json({ message: "Internal Server Error" })
  }
}

export async function getAllStudents(req, res) {
  try {
    const students = await User.find({ role: "student", _id: { $ne: req.user.id } }).select("fullName profilePic role");
    res.status(200).json(students);
  } catch (error) {
    console.error("Error in getAllStudents", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function searchUserByEmail(req, res) {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() }).select("fullName profilePic email role");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in searchUserByEmail", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
