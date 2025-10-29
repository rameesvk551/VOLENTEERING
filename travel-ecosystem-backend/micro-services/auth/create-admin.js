import bcrypt from 'bcryptjs';
import { sequelize } from './src/config/database.js';
import { User } from './src/models/User.js';

async function createAdminUser() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Delete existing user if any
    await User.destroy({ where: { email: 'rameesvk551@gmail.com' } });
    console.log('Deleted existing user');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin@123', salt);
    console.log('Password hashed:', hashedPassword.substring(0, 20) + '...');

    // Create user using Sequelize
    const user = await User.create({
      name: 'Admin',
      email: 'rameesvk551@gmail.com',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      refreshTokens: []
    });

    console.log('User created successfully:', {
      id: user.id,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password,
      passwordLength: user.password?.length
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdminUser();
