-- Earnmitra V1 Database Schema
-- Target database: earnmitra
-- Safe, repeatable, idempotent table definitions

CREATE TABLE IF NOT EXISTS partners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  partner_code VARCHAR(32) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255) DEFAULT NULL,
  partner_type VARCHAR(100) NOT NULL,
  business_name VARCHAR(255) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  district VARCHAR(100) DEFAULT NULL,
  state VARCHAR(100) NOT NULL,
  pan VARCHAR(20) DEFAULT NULL,
  kyc_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  approval_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  bank_account_name VARCHAR(255) DEFAULT NULL,
  bank_account_number VARCHAR(50) DEFAULT NULL,
  bank_ifsc VARCHAR(20) DEFAULT NULL,
  bank_name VARCHAR(100) DEFAULT NULL,
  profile_image_path VARCHAR(500) DEFAULT NULL,
  profile_image_mime VARCHAR(100) DEFAULT NULL,
  profile_image_updated_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_partners_mobile (mobile),
  INDEX idx_partners_code (partner_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS partner_cibil_reports (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  partner_id INT NOT NULL,
  provider_client_id VARCHAR(191) DEFAULT NULL,
  customer_name VARCHAR(120) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  pan VARCHAR(10) NOT NULL,
  gender VARCHAR(20) NOT NULL,
  consent_given TINYINT(1) NOT NULL DEFAULT 0,
  consent_text_version VARCHAR(80) NOT NULL,
  consented_at DATETIME NOT NULL,
  consent_ip VARCHAR(64) DEFAULT NULL,
  consent_user_agent VARCHAR(500) DEFAULT NULL,
  credit_score INT DEFAULT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PROCESSING',
  report_storage_path VARCHAR(500) DEFAULT NULL,
  report_mime_type VARCHAR(100) DEFAULT NULL,
  provider_status_code INT DEFAULT NULL,
  failure_code VARCHAR(80) DEFAULT NULL,
  failure_message VARCHAR(255) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cibil_partner_created (partner_id, created_at),
  INDEX idx_cibil_status (status),
  CONSTRAINT fk_cibil_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS partner_audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  partner_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(80) DEFAULT NULL,
  metadata_json TEXT DEFAULT NULL,
  ip_address VARCHAR(64) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_partner_audit_actor (partner_id, created_at),
  INDEX idx_partner_audit_entity (entity_type, entity_id),
  CONSTRAINT fk_partner_audit_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lead_code VARCHAR(32) NOT NULL UNIQUE,
  partner_id INT NOT NULL,
  product_category VARCHAR(50) NOT NULL DEFAULT 'Loans',
  loan_type VARCHAR(100) NOT NULL,
  applicant_name VARCHAR(255) DEFAULT NULL,
  business_name VARCHAR(255) DEFAULT NULL,
  mobile VARCHAR(20) NOT NULL,
  city VARCHAR(100) NOT NULL,
  applicant_type VARCHAR(50) DEFAULT NULL,
  pan VARCHAR(20) DEFAULT NULL,
  dob_or_incorporation DATE DEFAULT NULL,
  income_or_turnover DECIMAL(15,2) DEFAULT NULL,
  loan_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(50) NOT NULL DEFAULT 'In Progress',
  current_stage VARCHAR(100) NOT NULL DEFAULT 'Lead submitted',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_leads_partner (partner_id),
  INDEX idx_leads_status (status),
  INDEX idx_leads_code (lead_code),
  INDEX idx_leads_mobile (mobile),
  CONSTRAINT fk_leads_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lead_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lead_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  stage VARCHAR(100) NOT NULL,
  note TEXT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_lsh_lead (lead_id),
  CONSTRAINT fk_lsh_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lead_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lead_id INT NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  original_file_name VARCHAR(255) DEFAULT NULL,
  stored_file_name VARCHAR(255) DEFAULT NULL,
  storage_path VARCHAR(500) DEFAULT NULL,
  mime_type VARCHAR(100) DEFAULT NULL,
  file_size BIGINT DEFAULT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_docs_lead (lead_id),
  CONSTRAINT fk_docs_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS partner_earnings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  partner_id INT NOT NULL,
  lead_id INT DEFAULT NULL,
  amount DECIMAL(15,2) NOT NULL,
  earning_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'available',
  description VARCHAR(255) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_earnings_partner (partner_id),
  INDEX idx_earnings_status (status),
  CONSTRAINT fk_earnings_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE RESTRICT,
  CONSTRAINT fk_earnings_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payout_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  partner_id INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'requested',
  requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME DEFAULT NULL,
  reference_number VARCHAR(100) DEFAULT NULL,
  INDEX idx_payouts_partner (partner_id),
  CONSTRAINT fk_payouts_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS otp_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mobile VARCHAR(20) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  purpose VARCHAR(50) NOT NULL DEFAULT 'login',
  attempt_count INT NOT NULL DEFAULT 0,
  is_consumed TINYINT(1) NOT NULL DEFAULT 0,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_otp_mobile (mobile),
  INDEX idx_otp_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS app_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
