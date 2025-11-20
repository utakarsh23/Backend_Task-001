const {
    addTasks,
    deleteTask,
    updateTask,
    getAllTasks,
    getCompletedTasks,
    getIncompleteTasks,
    getUserProfile
} = require('../controllers/UserController');
const express = require('express');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/roleAuthenticator');


const router = express.Router();


router.post('/tasks/add', authMiddleware, addTasks);
router.delete('/tasks/:id/delete', authMiddleware, deleteTask);
router.put('/tasks/update/:id', authMiddleware, updateTask);
router.get('/tasks', authMiddleware, getAllTasks);
router.get('/tasks/completed', authMiddleware, getCompletedTasks);
router.get('/tasks/incomplete', authMiddleware, getIncompleteTasks);
router.get('/profile', authMiddleware, getUserProfile);


module.exports = router;