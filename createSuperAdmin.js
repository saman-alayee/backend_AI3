// createSuperAdmin.js
const mongoose = require('mongoose');
const { Admin } = require('./models/admin'); // Adjust the path based on your project structure
const config = require('config');
const bcrypt = require('bcrypt');

async function createSuperAdmin(email, password) {
  try {
    // Connect to your MongoDB database
    const mongoURI = config.get("mongo_URI");
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Check if the Super Admin already exists
    let admin = await Admin.findOne({ email });
    if (admin) {
      console.log('Super Admin already exists.');
      return;
    }

    // Create a new Super Admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt); // Use the provided password

    admin = new Admin({
      email,
      password: hashedPassword,
      fullname,
      role: 'superadmin',
    });

    await admin.save();
    console.log('Super Admin created successfully.');
  } catch (error) {
    console.error('Error creating Super Admin:', error);
  } finally {
    // Close the database connection
    mongoose.disconnect();
  }
}

// Read command-line arguments
const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4];
const lastname = process.argv[5];

if (!email || !password) {
  console.error('Usage: node createSuperAdmin.js <email> <password> <name> <lastname>');
  process.exit(1);
}

createSuperAdmin(email, password);
