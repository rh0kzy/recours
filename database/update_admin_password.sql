-- ================================================
-- UPDATE DEFAULT ADMIN PASSWORD
-- ================================================
-- Run this in Supabase SQL Editor AFTER running the main migration
-- This updates the default admin account with the proper password hash
-- ================================================

-- Update the default admin user with the bcrypt hash
-- Password: Admin123!
-- Hash: $2b$10$bE0BFobNo037b9fg/12cXOaad8q7XVpkA2TqmqtWb7kerhwOsQf0q

UPDATE admin_users 
SET password_hash = '$2b$10$bE0BFobNo037b9fg/12cXOaad8q7XVpkA2TqmqtWb7kerhwOsQf0q'
WHERE email = 'admin@usthb.dz';

-- Verify the update
SELECT email, name, role, is_active, created_at 
FROM admin_users 
WHERE email = 'admin@usthb.dz';

-- ================================================
-- DEFAULT ADMIN CREDENTIALS
-- ================================================
-- Email: admin@usthb.dz
-- Password: Admin123!
-- 
-- ⚠️ IMPORTANT: Change this password after first login!
-- ================================================
