const Task = require("../models/Tasks");
const User = require("../models/User");
const redis = require("../utils/redis");


async function clearAdminCache(userId) {
    await redis.del("admin:users");
    if (userId) {
        await redis.del(`admin:user:${userId}:tasks`);
        await redis.del(`admin:user:${userId}:profile`);
    }
}




async function getAllUsers(req, res) {
    try {

        const cacheKey = "admin:users";

        const cached = await redis.get(cacheKey);
        if (cached) {
            return res.status(200).json({ source: "cache", users: JSON.parse(cached) });
        }

        const users = await User.find().select('-password');
        if(!users) {
            return res.status(404).json({ message: 'No users found' });
        }
        await redis.set(cacheKey, JSON.stringify(users), "EX", 120);
        return res.status(200).json({ users });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: "Something went wrong, please try again later." });
    }
}

//jus in case if needed, though it's a breach of user security
async function getUserTasks(req, res) {
    try {
        const {userId} = req.params;

        const cacheKey = `admin:user:${userId}:tasks`;

        const cached = await redis.get(cacheKey);
        if (cached) {
            return res.status(200).json({ source: "cache", tasks: JSON.parse(cached) });
        }

        const user = await User.findOne({_id: userId});
        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const tasks = await Task.find({ taskOwner: user._id });
        if(!tasks) {
            return res.status(404).json({ message: 'No tasks found for this user' });
        }
        await redis.set(cacheKey, JSON.stringify(tasks), "EX", 120);

        return res.status(200).json({ tasks });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: "Something went wrong, please try again later." });
    }
}

async function updateUserRole(req, res) {
    try {
        const {userId} = req.params;
        const { role } = req.body;
        const updatedUser = await User.findByIdAndUpdate(userId, { role: role }, { new: true }).select('-password');
        if(!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        await clearAdminCache(userId);
        return res.status(200).json({ message: 'User role updated successfully', user: updatedUser });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: "Something went wrong, please try again later." });
    }
}

async function deleteUser(req, res) {
    try {
        const userId = req.params.userId;
        const deletedUser = await User.findByIdAndDelete(userId).select('-password');
        if(!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        await clearAdminCache(userId);
        return res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: "Something went wrong, please try again later." });
    }
}

async function getUserProfile(req, res) {
    try {
        const {userId} = req.params;

        const cacheKey = `admin:user:${userId}:profile`;

        const cached = await redis.get(cacheKey);
        if (cached) {
            return res.status(200).json({
                source: "cache",
                profile: JSON.parse(cached),
            });
        }

        const user = await User.findOne({_id: userId}).select('-password');
        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const tasks = await Task.find({ taskOwner: user._id });
        if(!tasks) {
            return res.status(404).json({ message: 'No tasks found for this user' });
        }
        const profileData = {
            user,
            totalTasks: tasks.length,
            completedTasks: tasks.filter((t) => t.status === "Completed").length,
            incompleteTasks: tasks.filter((t) => t.status !== "Completed").length,
        };

        await redis.set(cacheKey, JSON.stringify(profileData), "EX", 120);

        return res.status(200).json({ message: 'User profile retrieved successfully',
            profileData
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: "Something went wrong, please try again later." });
    }
}


module.exports = {
    getAllUsers,
    getUserTasks,
    updateUserRole,
    deleteUser,
    getUserProfile
};