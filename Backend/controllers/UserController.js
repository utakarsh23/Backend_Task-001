const Task = require("../models/Tasks");
const redis = require("../utils/redis");

async function clearUserCache(userId) {
    await redis.del(`tasks:${userId}`);
    await redis.del(`tasksCompleted:${userId}`);
    await redis.del(`tasksIncomplete:${userId}`);
    await redis.del(`profile:${userId}`);
}


async function addTasks(req, res) {
    try {
        const body = req.body;
        if(!body || !body.taskName || !body.description) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const user = req.user;

        const newTask = await Task.create({
            taskName : body.taskName,
            description : body.description,
            status : body.status || 'Not_Started',
            taskOwner : user._id,
        })

        await clearUserCache(user._id);
        return res.status(201).json({message: "Task Added Successfully",
            task : newTask,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({status: "Something went wrong, please try again later."})
    }
}

async function deleteTask(req, res) {
    try {
        const {id : taskId} = req.params;
        const user = req.user;
        if(!taskId) {
            return res.status(400).json({ message: 'Task ID is required' });
        }

        const taskInDb = await Task.findOne({ _id: taskId});
        if(!taskInDb) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if(taskInDb.taskOwner.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to delete this task' });
        }

        const deletedTask = await Task.findByIdAndDelete(taskId);
        if(!deletedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        await clearUserCache(user._id);
        return res.status(200).json({message: "Task Deleted Successfully",
            task : deletedTask,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({status: "Something went wrong, please try again later."})
    }
}

async function updateTask(req, res) {
    try {
        const {id : taskId} = req.params;
        const {status} = req.body;
        const user = req.user;
        if(!taskId || !status) {
            return res.status(400).json({ message: 'Task ID and status are required' });
        }

        const taskInDb = await Task.findOne({ _id: taskId});
        if(!taskInDb) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if(taskInDb.taskOwner.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to update this task' });
        }

        taskInDb.status = status;
        const updatedTask = await taskInDb.save();

        await clearUserCache(user._id);
        return res.status(200).json({message: "Task Updated Successfully",
            task : updatedTask,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({status: "Something went wrong, please try again later."})
    }
}

async function getAllTasks(req, res) {
    try {
        const user = req.user;
        const userId = user._id;

        const cacheKey = `tasks:${userId}`;

        const cached = await redis.get(cacheKey);
        if (cached) {
            return res.status(200).json({
                source: "cache",
                tasks: JSON.parse(cached),
            });
        }

        const tasks = await Task.find({ taskOwner: userId });
        if(!tasks) {
            return res.status(404).json({ message: 'No tasks found for this user' });
        }
        await redis.set(cacheKey, JSON.stringify(tasks), "EX", 60);
        return res.status(200).json({ message: 'Tasks retrieved successfully', tasks: tasks });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: "Something went wrong, please try again later." });
    }
}

async function getCompletedTasks(req, res) {
    try {
        const user = req.user;
        const userId = user._id;

        const cacheKey = `tasksCompleted:${userId}`;

        const cached = await redis.get(cacheKey);
        if (cached) {
            return res.status(200).json({
                source: "cache",
                tasks: JSON.parse(cached),
            });
        }

        const tasks = await Task.find({ taskOwner: userId, status: 'Completed' });
        if(!tasks) {
            return res.status(404).json({ message: 'No completed tasks found for this user' });
        }
        await redis.set(cacheKey, JSON.stringify(tasks), "EX", 60);
        return res.status(200).json({ message: 'Completed tasks retrieved successfully', tasks: tasks });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: "Something went wrong, please try again later." });
    }
}

async function getIncompleteTasks(req, res) {
    try {
        const user = req.user;
        const userId = user._id;

        const cacheKey = `tasksIncomplete:${userId}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            return res.status(200).json({
                source: "cache",
                tasks: JSON.parse(cached),
            });
        }

        const tasks = await Task.find({ taskOwner: userId, status: { $ne: 'Completed' } });
        if(!tasks) {
            return res.status(404).json({ message: 'No incomplete tasks found for this user' });
        }
        await redis.set(cacheKey, JSON.stringify(tasks), "EX", 60);

        return res.status(200).json({message: 'Incomplete tasks retrieved successfully', tasks: tasks});
    } catch (error) {
        console.log(error);
        return res.status(500).json({status: "Something went wrong, please try again later."});
    }
}

async function getUserProfile(req, res) {
    try {
        const user = req.user;
        const userId = user._id;

        const cacheKey = `profile:${userId}`;

        const cached = await redis.get(cacheKey);
        if (cached) {
            return res.status(200).json({
                source: "cache",
                profile: JSON.parse(cached),
            });
        }


        const tasks = await Task.find({ taskOwner: userId });
        if(!tasks) {
            return res.status(404).json({ message: 'No tasks found for this user' });
        }
        const profileData = {
            user: req.user,
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === "Completed").length,
            incompleteTasks: tasks.filter(t => t.status !== "Completed").length,
        };

        await redis.set(cacheKey, JSON.stringify(profileData), "EX", 60);

        return res.status(200).json({ message: 'User profile retrieved successfully',
            profileData
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: "Something went wrong, please try again later." });
    }
}


module.exports = {
    addTasks,
    deleteTask,
    updateTask,
    getAllTasks,
    getCompletedTasks,
    getIncompleteTasks,
    getUserProfile,
};