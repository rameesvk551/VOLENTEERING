UPDATE users SET password = '$2a$10$knoCWC0HJ/Cw3UeRy.7oleRNhcjyieOC3SHHRgVE9LfUTml5ywX6u' WHERE email = 'rameesvk551@gmail.com';
SELECT id, email, role, "isActive", "isEmailVerified", LEFT(password, 20) as password_hash FROM users WHERE email = 'rameesvk551@gmail.com';
