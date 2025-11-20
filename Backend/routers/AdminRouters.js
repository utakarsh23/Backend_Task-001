const {
    getAllUsers,
    getUserTasks,
    updateUserRole,
    deleteUser,
    getUserProfile
} = require('../controllers/AdminController');
const express = require('express');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/roleAuthenticator');


const router = express.Router();

router.get('/users', authMiddleware, roleMiddleware('admin', 'dev'), getAllUsers);
router.get('/users/:userId/tasks', authMiddleware, roleMiddleware('admin', 'dev'), getUserTasks);
router.put('/users/:userId/role', authMiddleware, roleMiddleware('admin', 'dev'), updateUserRole);
router.delete('/users/:userId/delete', authMiddleware, roleMiddleware('admin'), deleteUser);
router.get('/users/:userId/profile', authMiddleware, roleMiddleware('admin', 'dev'), getUserProfile);


module.exports = router;