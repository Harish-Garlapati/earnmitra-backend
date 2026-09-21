-- Backup of earnmitra at 2026-09-19T06:38:47.108Z

DROP TABLE IF EXISTS `app_settings`;
CREATE TABLE `app_settings` (
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `app_settings` (`setting_key`, `setting_value`, `description`, `updated_at`) VALUES ('faqs', '[{"q":"How do I become an Earnmitra partner?","a":"Register with your mobile number, complete KYC and accept the partner agreement. Approval usually takes 1–2 working days."},{"q":"Is there a registration fee?","a":"No. Registration is free for all partner types."},{"q":"When will I receive my commission?","a":"Payouts are released after the lender settles, typically 3–5 working days after verification."},{"q":"Which loan products are available?","a":"Business, personal, MSME, equipment, working capital and loan against property."},{"q":"How do I track my leads?","a":"Open My Leads. Every status change is also sent to you on WhatsApp."}]', 'Frequently Asked Questions for support', '2026-09-18 11:55:52');
INSERT INTO `app_settings` (`setting_key`, `setting_value`, `description`, `updated_at`) VALUES ('partner_metadata', '{"partnerTypes":["CA","Tax Consultant","GST Practitioner","Accountant","Company HR","Company Finance","DSA / Loan Agent","Automobile Dealer","Equipment Dealer","Real Estate Agent","Business Consultant","Other"],"states":["Telangana","Andhra Pradesh"],"loanTypes":[{"icon":"🏦","label":"Business Loan"},{"icon":"👤","label":"Personal Loan"},{"icon":"🚜","label":"Equipment Loan"},{"icon":"🏪","label":"MSME Loan"},{"icon":"🏠","label":"Loan Against Property"},{"icon":"📄","label":"Other Loan"}],"loanPurposes":["Business expansion","Working capital","Equipment purchase","Machinery","Debt consolidation","Personal need","Other"],"lenders":["Any (recommended)","HDFC Bank","ICICI Bank","SBI","Axis Bank","Bajaj Finserv","Tata Capital"]}', 'Dropdown and metadata configuration for partner portal', '2026-09-18 11:55:52');

DROP TABLE IF EXISTS `lead_documents`;
CREATE TABLE `lead_documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lead_id` int(11) NOT NULL,
  `document_type` varchar(100) NOT NULL,
  `original_file_name` varchar(255) DEFAULT NULL,
  `stored_file_name` varchar(255) DEFAULT NULL,
  `storage_path` varchar(500) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_docs_lead` (`lead_id`),
  CONSTRAINT `fk_docs_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `lead_status_history`;
CREATE TABLE `lead_status_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lead_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL,
  `stage` varchar(100) NOT NULL,
  `note` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_lsh_lead` (`lead_id`),
  CONSTRAINT `fk_lsh_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `lead_status_history` (`id`, `lead_id`, `status`, `stage`, `note`, `created_at`) VALUES (1, 1, 'In Progress', 'Lead submitted', 'Lead submitted via partner portal', '2026-08-12 05:00:00');
INSERT INTO `lead_status_history` (`id`, `lead_id`, `status`, `stage`, `note`, `created_at`) VALUES (2, 1, 'In Progress', 'Documents under review', 'Financial documents being validated', '2026-08-12 05:45:00');
INSERT INTO `lead_status_history` (`id`, `lead_id`, `status`, `stage`, `note`, `created_at`) VALUES (3, 2, 'In Progress', 'Lead submitted', 'Initial submission', '2026-08-02 03:30:00');
INSERT INTO `lead_status_history` (`id`, `lead_id`, `status`, `stage`, `note`, `created_at`) VALUES (4, 2, 'In Progress', 'Documents verified', 'KYC and GST verified', '2026-08-04 05:30:00');
INSERT INTO `lead_status_history` (`id`, `lead_id`, `status`, `stage`, `note`, `created_at`) VALUES (5, 2, 'In Progress', 'Sent to lender', 'Sent to partner NBFC', '2026-08-05 08:30:00');
INSERT INTO `lead_status_history` (`id`, `lead_id`, `status`, `stage`, `note`, `created_at`) VALUES (6, 2, 'Sanctioned', 'Sanctioned', 'Loan sanctioned at 11.5% ROI', '2026-08-08 10:30:00');
INSERT INTO `lead_status_history` (`id`, `lead_id`, `status`, `stage`, `note`, `created_at`) VALUES (7, 2, 'Disbursed', 'Disbursed', 'Funds credited to borrower account', '2026-08-10 06:30:00');
INSERT INTO `lead_status_history` (`id`, `lead_id`, `status`, `stage`, `note`, `created_at`) VALUES (8, 3, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-08-08 04:30:00');
INSERT INTO `lead_status_history` (`id`, `lead_id`, `status`, `stage`, `note`, `created_at`) VALUES (9, 3, 'In Progress', 'Documents verified', 'Quotation verified', '2026-08-09 06:00:00');
INSERT INTO `lead_status_history` (`id`, `lead_id`, `status`, `stage`, `note`, `created_at`) VALUES (10, 3, 'Under Review', 'Credit under process', 'Credit assessment in progress', '2026-08-09 09:30:00');
INSERT INTO `lead_status_history` (`id`, `lead_id`, `status`, `stage`, `note`, `created_at`) VALUES (11, 4, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-08-05 04:00:00');
INSERT INTO `lead_status_history` (`id`, `lead_id`, `status`, `stage`, `note`, `created_at`) VALUES (12, 4, 'In Progress', 'Sent to lender', 'Shared with lender credit team', '2026-08-06 05:30:00');
INSERT INTO `lead_status_history` (`id`, `lead_id`, `status`, `stage`, `note`, `created_at`) VALUES (13, 4, 'Rejected', 'Closed — lender declined', 'CIBIL score below policy threshold', '2026-08-07 08:30:00');
INSERT INTO `lead_status_history` (`id`, `lead_id`, `status`, `stage`, `note`, `created_at`) VALUES (15, 6, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-18 12:33:16');
INSERT INTO `lead_status_history` (`id`, `lead_id`, `status`, `stage`, `note`, `created_at`) VALUES (16, 7, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-18 12:41:57');
INSERT INTO `lead_status_history` (`id`, `lead_id`, `status`, `stage`, `note`, `created_at`) VALUES (17, 8, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-18 15:24:25');
INSERT INTO `lead_status_history` (`id`, `lead_id`, `status`, `stage`, `note`, `created_at`) VALUES (18, 9, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-19 05:08:40');
INSERT INTO `lead_status_history` (`id`, `lead_id`, `status`, `stage`, `note`, `created_at`) VALUES (19, 10, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-19 05:22:51');

DROP TABLE IF EXISTS `leads`;
CREATE TABLE `leads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lead_code` varchar(32) NOT NULL,
  `partner_id` int(11) NOT NULL,
  `product_category` varchar(50) NOT NULL DEFAULT 'Loans',
  `loan_type` varchar(100) NOT NULL,
  `applicant_name` varchar(255) DEFAULT NULL,
  `business_name` varchar(255) DEFAULT NULL,
  `mobile` varchar(20) NOT NULL,
  `city` varchar(100) NOT NULL,
  `applicant_type` varchar(50) DEFAULT NULL,
  `pan` varchar(20) DEFAULT NULL,
  `dob_or_incorporation` date DEFAULT NULL,
  `income_or_turnover` decimal(15,2) DEFAULT NULL,
  `loan_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `status` varchar(50) NOT NULL DEFAULT 'In Progress',
  `current_stage` varchar(100) NOT NULL DEFAULT 'Lead submitted',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `lead_code` (`lead_code`),
  KEY `idx_leads_partner` (`partner_id`),
  KEY `idx_leads_status` (`status`),
  KEY `idx_leads_code` (`lead_code`),
  KEY `idx_leads_mobile` (`mobile`),
  CONSTRAINT `fk_leads_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `leads` (`id`, `lead_code`, `partner_id`, `product_category`, `loan_type`, `applicant_name`, `business_name`, `mobile`, `city`, `applicant_type`, `pan`, `dob_or_incorporation`, `income_or_turnover`, `loan_amount`, `status`, `current_stage`, `created_at`, `updated_at`) VALUES (1, 'FTL123456', 1, 'Loans', 'Business Loan', 'Suresh Kumar', 'Suresh Kumar', '9876500001', 'Hyderabad', NULL, NULL, NULL, NULL, '1000000.00', 'In Progress', 'Documents under review', '2026-08-12 05:00:00', '2026-09-18 11:55:51');
INSERT INTO `leads` (`id`, `lead_code`, `partner_id`, `product_category`, `loan_type`, `applicant_name`, `business_name`, `mobile`, `city`, `applicant_type`, `pan`, `dob_or_incorporation`, `income_or_turnover`, `loan_amount`, `status`, `current_stage`, `created_at`, `updated_at`) VALUES (2, 'FTL123455', 1, 'Loans', 'Business Loan', 'Lakshmi Traders', 'Lakshmi Traders', '9876500002', 'Warangal', NULL, NULL, NULL, NULL, '2500000.00', 'Disbursed', 'Disbursed', '2026-08-02 03:30:00', '2026-09-18 11:55:51');
INSERT INTO `leads` (`id`, `lead_code`, `partner_id`, `product_category`, `loan_type`, `applicant_name`, `business_name`, `mobile`, `city`, `applicant_type`, `pan`, `dob_or_incorporation`, `income_or_turnover`, `loan_amount`, `status`, `current_stage`, `created_at`, `updated_at`) VALUES (3, 'FTL123454', 1, 'Loans', 'Equipment Loan', 'Venkat Reddy', NULL, '9876500003', 'Karimnagar', NULL, NULL, NULL, NULL, '1500000.00', 'Under Review', 'Credit under process', '2026-08-08 04:30:00', '2026-09-18 11:55:52');
INSERT INTO `leads` (`id`, `lead_code`, `partner_id`, `product_category`, `loan_type`, `applicant_name`, `business_name`, `mobile`, `city`, `applicant_type`, `pan`, `dob_or_incorporation`, `income_or_turnover`, `loan_amount`, `status`, `current_stage`, `created_at`, `updated_at`) VALUES (4, 'FTL123453', 1, 'Loans', 'Personal Loan', 'Anita Rao', NULL, '9876500004', 'Hyderabad', NULL, NULL, NULL, NULL, '500000.00', 'Rejected', 'Closed — lender declined', '2026-08-05 04:00:00', '2026-09-18 11:55:52');
INSERT INTO `leads` (`id`, `lead_code`, `partner_id`, `product_category`, `loan_type`, `applicant_name`, `business_name`, `mobile`, `city`, `applicant_type`, `pan`, `dob_or_incorporation`, `income_or_turnover`, `loan_amount`, `status`, `current_stage`, `created_at`, `updated_at`) VALUES (6, 'FTL123457', 1, 'Loans', 'Business Loan', NULL, 'Apex Industrial Solutions Pvt Ltd', '9876543210', 'Hyderabad', 'Company', 'AAACA1234K', '2018-05-19 18:30:00', '7500000.00', '1800000.00', 'In Progress', 'Lead submitted', '2026-09-18 12:33:16', '2026-09-18 12:33:16');
INSERT INTO `leads` (`id`, `lead_code`, `partner_id`, `product_category`, `loan_type`, `applicant_name`, `business_name`, `mobile`, `city`, `applicant_type`, `pan`, `dob_or_incorporation`, `income_or_turnover`, `loan_amount`, `status`, `current_stage`, `created_at`, `updated_at`) VALUES (7, 'FTL123458', 1, 'Loans', 'Business Loan', NULL, 'Sri Balaji Logistics & Warehousing', '9123456780', 'Secunderabad', 'Proprietorship', 'BLABC5678D', '2019-11-14 18:30:00', '9200000.00', '3000000.00', 'In Progress', 'Lead submitted', '2026-09-18 12:41:57', '2026-09-18 12:41:57');
INSERT INTO `leads` (`id`, `lead_code`, `partner_id`, `product_category`, `loan_type`, `applicant_name`, `business_name`, `mobile`, `city`, `applicant_type`, `pan`, `dob_or_incorporation`, `income_or_turnover`, `loan_amount`, `status`, `current_stage`, `created_at`, `updated_at`) VALUES (8, 'FTL123459', 1, 'Loans', 'Business Loan', NULL, 'Shri Krishna Logistics & Infra', '9876599999', 'Hyderabad', 'Company', 'SHRKR9999P', NULL, NULL, '3500000.00', 'In Progress', 'Lead submitted', '2026-09-18 15:24:24', '2026-09-18 15:24:24');
INSERT INTO `leads` (`id`, `lead_code`, `partner_id`, `product_category`, `loan_type`, `applicant_name`, `business_name`, `mobile`, `city`, `applicant_type`, `pan`, `dob_or_incorporation`, `income_or_turnover`, `loan_amount`, `status`, `current_stage`, `created_at`, `updated_at`) VALUES (9, 'FTL123460', 1, 'Loans', 'Business Loan', NULL, 'Venkateshwara Solar Energy Systems', '9848012345', 'Hyderabad', 'Individual', NULL, NULL, NULL, '2500000.00', 'In Progress', 'Lead submitted', '2026-09-19 05:08:40', '2026-09-19 05:08:40');
INSERT INTO `leads` (`id`, `lead_code`, `partner_id`, `product_category`, `loan_type`, `applicant_name`, `business_name`, `mobile`, `city`, `applicant_type`, `pan`, `dob_or_incorporation`, `income_or_turnover`, `loan_amount`, `status`, `current_stage`, `created_at`, `updated_at`) VALUES (10, 'FTL123461', 1, 'Loans', 'Personal Loan', 'Ramu', NULL, '8933232323', 'Guntur', 'Individual', NULL, NULL, NULL, '0.00', 'In Progress', 'Lead submitted', '2026-09-19 05:22:51', '2026-09-19 05:22:51');

DROP TABLE IF EXISTS `otp_sessions`;
CREATE TABLE `otp_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mobile` varchar(20) NOT NULL,
  `otp_hash` varchar(255) NOT NULL,
  `purpose` varchar(50) NOT NULL DEFAULT 'login',
  `attempt_count` int(11) NOT NULL DEFAULT 0,
  `is_consumed` tinyint(1) NOT NULL DEFAULT 0,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_otp_mobile` (`mobile`),
  KEY `idx_otp_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `partner_earnings`;
CREATE TABLE `partner_earnings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `partner_id` int(11) NOT NULL,
  `lead_id` int(11) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `earning_type` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'available',
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_earnings_partner` (`partner_id`),
  KEY `idx_earnings_status` (`status`),
  KEY `fk_earnings_lead` (`lead_id`),
  CONSTRAINT `fk_earnings_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_earnings_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `partner_earnings` (`id`, `partner_id`, `lead_id`, `amount`, `earning_type`, `status`, `description`, `created_at`) VALUES (1, 1, NULL, '22500.00', 'commission', 'paid', 'Payout — FTL123455 (Lakshmi Traders)', '2026-09-18 11:55:52');
INSERT INTO `partner_earnings` (`id`, `partner_id`, `lead_id`, `amount`, `earning_type`, `status`, `description`, `created_at`) VALUES (2, 1, NULL, '13750.00', 'commission', 'paid', 'Payout — FTL123449', '2026-09-18 11:55:52');
INSERT INTO `partner_earnings` (`id`, `partner_id`, `lead_id`, `amount`, `earning_type`, `status`, `description`, `created_at`) VALUES (3, 1, NULL, '8500.00', 'commission', 'paid', 'Payout — FTL123441', '2026-09-18 11:55:52');
INSERT INTO `partner_earnings` (`id`, `partner_id`, `lead_id`, `amount`, `earning_type`, `status`, `description`, `created_at`) VALUES (4, 1, NULL, '12500.00', 'commission', 'available', 'Commission — FTL123450 (Available for payout)', '2026-09-18 11:55:52');
INSERT INTO `partner_earnings` (`id`, `partner_id`, `lead_id`, `amount`, `earning_type`, `status`, `description`, `created_at`) VALUES (5, 1, NULL, '-1125.00', 'tds', 'paid', 'TDS deduction', '2026-09-18 11:55:52');
INSERT INTO `partner_earnings` (`id`, `partner_id`, `lead_id`, `amount`, `earning_type`, `status`, `description`, `created_at`) VALUES (6, 1, NULL, '-12500.00', 'payout', 'pending', 'Payout request PAY-078253', '2026-09-18 15:57:58');

DROP TABLE IF EXISTS `partners`;
CREATE TABLE `partners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `partner_code` varchar(32) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `partner_type` varchar(100) NOT NULL,
  `business_name` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `state` varchar(100) NOT NULL,
  `pan` varchar(20) DEFAULT NULL,
  `kyc_status` varchar(50) NOT NULL DEFAULT 'pending',
  `approval_status` varchar(50) NOT NULL DEFAULT 'pending',
  `bank_account_name` varchar(255) DEFAULT NULL,
  `bank_account_number` varchar(50) DEFAULT NULL,
  `bank_ifsc` varchar(20) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `partner_code` (`partner_code`),
  UNIQUE KEY `mobile` (`mobile`),
  KEY `idx_partners_mobile` (`mobile`),
  KEY `idx_partners_code` (`partner_code`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `partners` (`id`, `partner_code`, `full_name`, `mobile`, `email`, `partner_type`, `business_name`, `city`, `district`, `state`, `pan`, `kyc_status`, `approval_status`, `bank_account_name`, `bank_account_number`, `bank_ifsc`, `bank_name`, `created_at`, `updated_at`) VALUES (1, 'P-1001', 'Ramesh Sharma', '9876543210', 'ramesh.sharma@example.com', 'CA & Tax Consultant', NULL, 'Hyderabad', NULL, 'Telangana', NULL, 'verified', 'approved', 'Ramesh Sharma', 'XXXXXX1234', 'HDFC0001234', 'HDFC Bank', '2026-09-18 11:55:51', '2026-09-18 11:55:51');

DROP TABLE IF EXISTS `payout_requests`;
CREATE TABLE `payout_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `partner_id` int(11) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'requested',
  `requested_at` datetime NOT NULL DEFAULT current_timestamp(),
  `processed_at` datetime DEFAULT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_payouts_partner` (`partner_id`),
  CONSTRAINT `fk_payouts_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `payout_requests` (`id`, `partner_id`, `amount`, `status`, `requested_at`, `processed_at`, `reference_number`) VALUES (1, 1, '36250.00', 'completed', '2026-08-12 06:30:00', '2026-08-12 10:00:00', 'PAY-20260812-9921');
INSERT INTO `payout_requests` (`id`, `partner_id`, `amount`, `status`, `requested_at`, `processed_at`, `reference_number`) VALUES (2, 1, '12500.00', 'processing', '2026-09-18 15:57:58', NULL, 'PAY-078253');

