import dotenv from 'dotenv';
import { sequelize } from './config/database.js';
import { User } from './models/User.js';

dotenv.config();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    
    // Sync database (create tables if they don't exist)
    await sequelize.sync();
    console.log('✅ Database synchronized');
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { email: 'rameesvk551@gmail.com' } 
    });
    
    if (existingUser) {
      console.log('⚠️  User rameesvk551@gmail.com already exists');
      console.log('   Updating password...');
      
      existingUser.password = 'admin@123';
      existingUser.isEmailVerified = true;
      existingUser.role = 'admin';
      existingUser.isActive = true;
      await existingUser.save();
      
      console.log('✅ User updated successfully');
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Role: ${existingUser.role}`);
    } else {
      // Create admin user
      const adminUser = await User.create({
        name: 'Ramees VK',
        email: 'rameesvk551@gmail.com',
        password: 'admin@123',
        role: 'admin',
        isEmailVerified: true,
        isActive: true,
        bio: 'System Administrator',
        preferences: {
          newsletter: true,
          notifications: true
        },
        refreshTokens: []
      });
      
      console.log('✅ Admin user created successfully!');
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   Name: ${adminUser.name}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Email Verified: ${adminUser.isEmailVerified}`);
    }
    
    console.log('');
    console.log('🎉 Database seeding completed!');
    console.log('');
    console.log('Login credentials:');
    console.log('  Email: rameesvk551@gmail.com');
    console.log('  Password: admin@123');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
