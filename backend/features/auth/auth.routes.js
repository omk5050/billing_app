const express = require('express');
const router = express.Router();

const {
register,
login,
logout,
refreshToken
} = require('./auth.controller');

const { protect, authorize } = require('../../middleware/auth.middleware');


router.post('/register',register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login',login);
router.post('/refresh-token',refreshToken);
router.post('/logout',protect,logout);


/* example protected route */

router.get('/me',protect,(req,res)=>{
res.json({
message:"Protected route accessed",
user:req.user
});
});


router.get('/admin-only',
protect,
authorize('admin'),
(req,res)=>{
res.json({message:"Welcome Admin"});
});

module.exports = router;