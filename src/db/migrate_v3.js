const { query, pool } = require('../config/db');

async function migrate() {
  try {
    console.log('Starting migration v3...');

    // 1. Create admin_roles
    await query(`
      CREATE TABLE IF NOT EXISTS admin_roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_name VARCHAR(100) NOT NULL UNIQUE,
        description VARCHAR(255),
        is_active TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('admin_roles table created or exists.');

    // Seed roles
    const roles = ['Super Admin', 'Operations', 'Finance', 'Sales', 'Support', 'Marketing', 'Auditor'];
    for (const role of roles) {
      await query('INSERT IGNORE INTO admin_roles (role_name) VALUES (?)', [role]);
    }
    console.log('admin_roles seeded.');

    // 2. Create admin_permissions
    await query(`
      CREATE TABLE IF NOT EXISTS admin_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        permission_key VARCHAR(100) NOT NULL UNIQUE,
        description VARCHAR(255),
        module VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('admin_permissions table created or exists.');

    // Seed permissions
    const permissions = [
      'dashboard.view', 'partners.view', 'partners.edit', 'partners.review_kyc',
      'leads.view', 'leads.assign', 'leads.update_status', 'commissions.view',
      'commissions.reconcile', 'payouts.view', 'payouts.approve', 'marketing.view',
      'marketing.manage', 'support.view', 'support.reply', 'reports.view', 'audit.view', 'users.manage'
    ];
    for (const perm of permissions) {
      await query('INSERT IGNORE INTO admin_permissions (permission_key, module) VALUES (?, ?)', [perm, perm.split('.')[0]]);
    }
    console.log('admin_permissions seeded.');

    // 3. Create admin_role_permissions
    await query(`
      CREATE TABLE IF NOT EXISTS admin_role_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_id INT NOT NULL,
        permission_id INT NOT NULL,
        UNIQUE(role_id, permission_id),
        FOREIGN KEY (role_id) REFERENCES admin_roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES admin_permissions(id) ON DELETE CASCADE
      )
    `);
    console.log('admin_role_permissions table created or exists.');

    // Assign Super Admin all permissions
    await query(`
      INSERT IGNORE INTO admin_role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM admin_roles r, admin_permissions p WHERE r.role_name = 'Super Admin'
    `);

    // Assign Operations permissions
    await query(`
      INSERT IGNORE INTO admin_role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM admin_roles r, admin_permissions p 
      WHERE r.role_name = 'Operations' AND p.permission_key IN ('dashboard.view', 'partners.view', 'leads.view', 'leads.update_status')
    `);

    // Assign Finance permissions
    await query(`
      INSERT IGNORE INTO admin_role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM admin_roles r, admin_permissions p 
      WHERE r.role_name = 'Finance' AND p.permission_key IN ('dashboard.view', 'commissions.view', 'payouts.view')
    `);

    // Assign Support permissions
    await query(`
      INSERT IGNORE INTO admin_role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM admin_roles r, admin_permissions p 
      WHERE r.role_name = 'Support' AND p.permission_key IN ('dashboard.view', 'support.view', 'support.reply')
    `);
    console.log('admin_role_permissions seeded.');

    // 4. Create audit_logs
    await query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(100),
        entity_id VARCHAR(100),
        metadata JSON,
        ip_address VARCHAR(45),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX(admin_id),
        INDEX(entity_type, entity_id),
        INDEX(created_at)
      )
    `);
    console.log('audit_logs table created or exists.');

    // 5. Alter admin_users
    const [columns] = await query("SHOW COLUMNS FROM admin_users LIKE 'role_id'");
    if (columns.length === 0) {
      await query('ALTER TABLE admin_users ADD role_id INT DEFAULT NULL');
      console.log('Added role_id to admin_users.');
    }
    
    const [activeCols] = await query("SHOW COLUMNS FROM admin_users LIKE 'is_active'");
    if (activeCols.length === 0) {
      await query('ALTER TABLE admin_users ADD is_active TINYINT(1) DEFAULT 1');
      console.log('Added is_active to admin_users.');
    }

    const [loginCols] = await query("SHOW COLUMNS FROM admin_users LIKE 'last_login_at'");
    if (loginCols.length === 0) {
      await query('ALTER TABLE admin_users ADD last_login_at DATETIME DEFAULT NULL');
      console.log('Added last_login_at to admin_users.');
    }

    // Link existing admins to Super Admin
    await query(`
      UPDATE admin_users au
      JOIN admin_roles ar ON ar.role_name = 'Super Admin'
      SET au.role_id = ar.id
      WHERE au.role_id IS NULL
    `);
    console.log('Updated existing admins to Super Admin.');

    console.log('Migration v3 completed successfully.');
    pool.end();
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
