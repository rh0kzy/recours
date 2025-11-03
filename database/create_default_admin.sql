-- Create default Super Admin user
-- Password: Admin123!
-- Email: admin@usthb.dz

INSERT INTO admin_users (
  name,
  email,
  password_hash,
  role,
  department,
  is_active
) VALUES (
  'Super Administrator',
  'admin@usthb.dz',
  '$2b$10$bE0BFobNo037b9fg/12cXOaad8q7XVpkA2TqmqtWb7kerhwOsQf0q',
  'super_admin',
  NULL,
  TRUE
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  is_active = TRUE,
  failed_login_attempts = 0,
  locked_until = NULL;

-- Verify the user was created
SELECT id, name, email, role, is_active, created_at
FROM admin_users
WHERE email = 'admin@usthb.dz';
