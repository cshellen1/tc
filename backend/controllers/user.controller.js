import bcrypt from "bcryptjs";
import {v2 as cloudinary} from 'cloudinary';

import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";


export const getUserProfile = async (req, res) => {
  const { username } = req.params; 
  
  try {
    const user = await User.findOne({ username }).select("-password");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);

  } catch (error) {
    console.log("Error in getUserProfile", error.message);
    return res.status(500).json({ error: error.message });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToFollowUnfollow = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollowUnfollow) {
      return res.status(404).json({ error: "User not found" });
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot follow/unfollow yourself" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow user
      await currentUser.updateOne({ $pull: { following: id } });
      await userToFollowUnfollow.updateOne({ $pull: { followers: req.user._id } });
      // TODO return the id of the user as a response for the front end to redirect to the user's profile page
      return res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Follow user
      await currentUser.updateOne({ $push: { following: id } });
      await userToFollowUnfollow.updateOne({ $push: { followers: req.user._id } });
      // send notification to user
      await new Notification({
        from: req.user._id,
        to: userToFollowUnfollow._id,
        type: "follow",
      }).save();
      // TODO return the id of the user as a response for the front end to redirect to the user's profile page
      return res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.log("Error in followUnfollowUser", error.message);
    return res.status(500).json({ error: error.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const usersFollowedByCurrentUser = await User.findById(currentUserId).select(
      "following"
    );

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: currentUserId },
        }
      },
      { $sample: { size: 10 } },
    ]);
    
    const filteredUsers = users.filter(user => !usersFollowedByCurrentUser.following.includes(user._id));
    const suggestedUsers = filteredUsers.slice(0, 4);
    // Updates the suggested users passwords to null in the reponse only, the database is unaffected
    suggestedUsers.forEach(user => user.password = null);

    return res.status(200).json(suggestedUsers);

  } catch (error) {
    console.log("Error in getSuggestedUsers", error.message);
    return res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const {
    username,
    fullName, 
    email, 
    currentPassword, 
    newPassword, 
    bio,  
    link
  } = req.body;
  let { profileImg, coverImg } = req.body;

  const userId = req.user._id;

  try {
		let user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		if (
			(!newPassword && currentPassword) ||
			(!currentPassword && newPassword)
		) {
			return res
				.status(400)
				.json({ error: "Please provide both current and new passwords" });
		}
		if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      console.log(isMatch);
			if (!isMatch) {
				return res.status(400).json({ error: "Incorrect current password" });
			}
			if (newPassword.length < 6) {
				return res
					.status(400)
					.json({ error: "Password must be at least 6 characters" });
			}
			user.password = await bcrypt.hash(newPassword, 10);
		}

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
      }
			const uploadedResponse = await cloudinary.uploader.upload(profileImg);
			profileImg = uploadedResponse.secure_url;
		}

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
      }
			const uploadedResponse = await cloudinary.uploader.upload(coverImg);
			coverImg = uploadedResponse.secure_url;
		}

		user.fullname = fullName || user.fullName;
		user.username = username || user.username;
		user.email = email || user.email;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

		user = await user.save();
		// Updates the suggested users passwords to null in the reponse only, the database is unaffected
		user.password = null;

		return res.status(200).json(user);
	} catch (error) {
    console.log("Error in updateUser", error.message);
    return res.status(500).json({ error: error.message });
  }
}