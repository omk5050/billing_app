const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./auth.model');


/*
-----------------------------------------
REGISTER
-----------------------------------------
*/
exports.register = async (req, res, next) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400);
            throw new Error("Email and password required");
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            res.status(400);
            throw new Error("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashedPassword
        });

        const accessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json({
            message: "User registered successfully",
            accessToken,
            refreshToken
        });

    } catch (error) {
        next(error);
    }
};



/*
-----------------------------------------
LOGIN
-----------------------------------------
*/
exports.login = async (req, res, next) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            res.status(401);
            throw new Error("Invalid credentials");
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            res.status(401);
            throw new Error("Invalid credentials");
        }

        const accessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            message: "Login successful",
            accessToken,
            refreshToken
        });

    } catch (error) {
        next(error);
    }
};



/*
-----------------------------------------
REFRESH TOKEN
-----------------------------------------
*/
exports.refreshToken = async (req, res, next) => {
    try {

        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(401);
            throw new Error("Refresh token required");
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            res.status(403);
            throw new Error("Invalid refresh token");
        }

        const newAccessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({
            accessToken: newAccessToken
        });

    } catch (error) {
        next(error);
    }
};



/*
-----------------------------------------
LOGOUT
-----------------------------------------
*/
exports.logout = async (req, res, next) => {
    try {

        const user = await User.findById(req.user._id);

        if (user) {
            user.refreshToken = null;
            await user.save();
        }

        res.json({
            message: "Logged out successfully"
        });

    } catch (error) {
        next(error);
    }
};