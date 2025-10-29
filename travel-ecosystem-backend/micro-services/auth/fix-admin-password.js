import bcrypt from 'bcryptjs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function fixAdminPassword() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'travel_auth',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres123'
  });

  try {
    await client.connect();
    console.log('✓ Connected to database');

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin@123', salt);
    console.log('✓ Password hashed');

    // Update the user's password
    const result = await client.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email, role, "isActive", "isEmailVerified"',
      [hashedPassword, 'rameesvk551@gmail.com']
    );

    if (result.rows.length === 0) {
      console.log('✗ User not found in database');
      console.log('\nCreating new admin user...');

      const insertResult = await client.query(
        `INSERT INTO users (name, email, password, role, "isEmailVerified", "isActive", "refreshTokens", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING id, email, role, "isActive", "isEmailVerified"`,
        ['Admin', 'rameesvk551@gmail.com', hashedPassword, 'admin', true, true, '{}']
      );

      console.log('✓ Admin user created successfully:', insertResult.rows[0]);
    } else {
      console.log('✓ Password updated successfully for:', result.rows[0]);
    }

    await client.end();
    console.log('\n✓ Done! You can now login with:');
    console.log('  Email: rameesvk551@gmail.com');
    console.log('  Password: admin@123');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

fixAdminPassword();
