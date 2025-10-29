UPDATE users SET "isActive" = true, "isEmailVerified" = true, role = 'admin' WHERE email = 'rameesvk551@gmail.com';
SELECT id, email, role, "isActive", "isEmailVerified" FROM users WHERE email = 'rameesvk551@gmail.com';
