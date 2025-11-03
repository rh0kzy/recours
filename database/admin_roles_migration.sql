-- ================================================
-- ADMIN ROLES & PERMISSIONS - DATABASE MIGRATION
-- ================================================
-- Run this in Supabase SQL Editor
-- ================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. CREATE admin_users TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('viewer', 'reviewer', 'super_admin', 'department_admin')),
  department VARCHAR(255), -- Only used for department_admin role
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP
);

-- Indexes for admin_users
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_department ON admin_users(department);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- ================================================
-- 2. CREATE admin_sessions TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for admin_sessions
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_user_id ON admin_sessions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- ================================================
-- 3. CREATE audit_logs TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL, -- 'request', 'user', 'setting', 'auth'
  resource_id VARCHAR(255),
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_user_id ON audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);

-- ================================================
-- 4. UPDATE requests TABLE
-- ================================================
-- Add timestamp column if it doesn't exist
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Add new columns for admin assignment and tracking
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES admin_users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reviewed_by_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);
CREATE INDEX IF NOT EXISTS idx_requests_assigned_to ON requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_requests_reviewed_by_user_id ON requests(reviewed_by_user_id);

-- ================================================
-- 5. CREATE FUNCTION TO UPDATE updated_at
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 6. CREATE TRIGGER FOR admin_users
-- ================================================
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- 7. CREATE FUNCTION TO CLEAN EXPIRED SESSIONS
-- ================================================
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM admin_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 8. INSERT DEFAULT SUPER ADMIN
-- ================================================
-- Default password: Admin123!
-- IMPORTANT: Change this password after first login!
INSERT INTO admin_users (email, password_hash, name, role, is_active)
VALUES (
  'admin@usthb.dz',
  '$2a$10$YourHashedPasswordHere', -- Replace with actual bcrypt hash
  'System Administrator',
  'super_admin',
  true
)
ON CONFLICT (email) DO NOTHING;

-- ================================================
-- 9. CREATE VIEW FOR ADMIN DASHBOARD STATS
-- ================================================
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
  COUNT(*) as total_count,
  COUNT(DISTINCT specialite_souhaitee) as unique_specialties,
  DATE_TRUNC('month', requests.created_at) as month
FROM requests
GROUP BY DATE_TRUNC('month', requests.created_at)
ORDER BY month DESC;

-- ================================================
-- 10. CREATE FUNCTION TO LOG ACTIONS
-- ================================================
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_user_id UUID,
  p_action VARCHAR(100),
  p_resource_type VARCHAR(50),
  p_resource_id VARCHAR(255),
  p_details JSONB,
  p_ip_address VARCHAR(45),
  p_user_agent TEXT
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    admin_user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    p_admin_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 11. ROW LEVEL SECURITY POLICIES
-- ================================================

-- Enable RLS on admin tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Super admins can see all users
CREATE POLICY admin_users_super_admin_all ON admin_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()::uuid
      AND au.role = 'super_admin'
      AND au.is_active = true
    )
  );

-- Policy: Users can see their own record
CREATE POLICY admin_users_self_select ON admin_users
  FOR SELECT
  USING (id = auth.uid()::uuid);

-- Policy: Anyone can select sessions (will be filtered by application logic)
CREATE POLICY admin_sessions_select ON admin_sessions
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert sessions (controlled by application)
CREATE POLICY admin_sessions_insert ON admin_sessions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Super admins can view all audit logs
CREATE POLICY audit_logs_super_admin_select ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()::uuid
      AND au.role = 'super_admin'
      AND au.is_active = true
    )
  );

-- Policy: Users can view their own audit logs
CREATE POLICY audit_logs_self_select ON audit_logs
  FOR SELECT
  USING (admin_user_id = auth.uid()::uuid);

-- ================================================
-- 12. SAMPLE DATA (FOR TESTING)
-- ================================================

-- Insert sample admin users (passwords are "Test123!")
-- REMOVE THESE IN PRODUCTION!

/*
INSERT INTO admin_users (email, password_hash, name, role, department, is_active) VALUES
('viewer@usthb.dz', '$2a$10$YourHashedPasswordHere', 'Test Viewer', 'viewer', NULL, true),
('reviewer@usthb.dz', '$2a$10$YourHashedPasswordHere', 'Test Reviewer', 'reviewer', NULL, true),
('dept.admin@usthb.dz', '$2a$10$YourHashedPasswordHere', 'Department Admin', 'department_admin', 'Computer Science', true)
ON CONFLICT (email) DO NOTHING;
*/

-- ================================================
-- 13. GRANT PERMISSIONS
-- ================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON admin_users TO authenticated;
GRANT SELECT, INSERT, DELETE ON admin_sessions TO authenticated;
GRANT SELECT, INSERT ON audit_logs TO authenticated;
GRANT SELECT, UPDATE ON requests TO authenticated;

-- ================================================
-- MIGRATION COMPLETE
-- ================================================
-- Next steps:
-- 1. Replace '$2a$10$YourHashedPasswordHere' with actual bcrypt hash
-- 2. Update the default admin email if needed
-- 3. Test the setup with your application
-- 4. Remove sample data before production deployment
-- ================================================

-- To generate a bcrypt hash, use this in your Node.js environment:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('Admin123!', 10);
-- console.log(hash);
