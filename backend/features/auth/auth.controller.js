const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./auth.model');


/*
---------------------------------------------------
REGISTER USER
POST /api/auth/register
---------------------------------------------------
*/
exports.register = async (req, res, next) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password required');
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400);
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token
    });

  } catch (error) {
    next(error);
  }
};



/*
---------------------------------------------------
LOGIN USER
POST /api/auth/login
---------------------------------------------------
*/
exports.login = async (req, res, next) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password required');
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token
    });

  } catch (error) {
    next(error);
  }
};



/*
---------------------------------------------------
LOGOUT USER
POST /api/auth/logout
---------------------------------------------------
*/
exports.logout = async (req, res) => {

  res.json({
    message: "User logged out successfully"
  });

};