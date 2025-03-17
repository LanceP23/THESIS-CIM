// adminAccountController.js
const User = require('../models/user');

// Fetch all staff users
const getAllStaff = async (req, res) => {
  try {
    const staffUsers = await User.find({ position: { $exists: false }, organization: { $exists: false }, department: { $exists: false } });
    res.json(staffUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Fetch all faculty users
const getAllFaculty = async (req, res) => {
  try {
    const facultyUsers = await User.find({ department: { $exists: true } });
    res.json(facultyUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Fetch all student users
const getAllStudents = async (req, res) => {
  try {
    const studentUsers = await User.find({ position: { $exists: true }, organization: { $exists: true } });
    res.json(studentUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update an existing user
const updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  // Delete an existing user
  const deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      console.log(id);
      await User.findByIdAndDelete(id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

module.exports = {
  getAllStaff,
  getAllFaculty,
  getAllStudents,
  updateUser,
  deleteUser
};
