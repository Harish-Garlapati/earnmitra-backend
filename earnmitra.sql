-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 23, 2026 at 06:31 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `earnmitra`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_permissions`
--

CREATE TABLE `admin_permissions` (
  `id` int(11) NOT NULL,
  `permission_key` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `module` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_permissions`
--

INSERT INTO `admin_permissions` (`id`, `permission_key`, `description`, `module`, `created_at`) VALUES
(1, 'dashboard.view', NULL, 'dashboard', '2026-09-19 15:51:25'),
(2, 'partners.view', NULL, 'partners', '2026-09-19 15:51:25'),
(3, 'partners.edit', NULL, 'partners', '2026-09-19 15:51:25'),
(4, 'partners.review_kyc', NULL, 'partners', '2026-09-19 15:51:25'),
(5, 'leads.view', NULL, 'leads', '2026-09-19 15:51:25'),
(6, 'leads.assign', NULL, 'leads', '2026-09-19 15:51:25'),
(7, 'leads.update_status', NULL, 'leads', '2026-09-19 15:51:25'),
(8, 'commissions.view', NULL, 'commissions', '2026-09-19 15:51:25'),
(9, 'commissions.reconcile', NULL, 'commissions', '2026-09-19 15:51:25'),
(10, 'payouts.view', NULL, 'payouts', '2026-09-19 15:51:25'),
(11, 'payouts.approve', NULL, 'payouts', '2026-09-19 15:51:25'),
(12, 'marketing.view', NULL, 'marketing', '2026-09-19 15:51:25'),
(13, 'marketing.manage', NULL, 'marketing', '2026-09-19 15:51:25'),
(14, 'support.view', NULL, 'support', '2026-09-19 15:51:25'),
(15, 'support.reply', NULL, 'support', '2026-09-19 15:51:25'),
(16, 'reports.view', NULL, 'reports', '2026-09-19 15:51:25'),
(17, 'audit.view', NULL, 'audit', '2026-09-19 15:51:25'),
(18, 'users.manage', NULL, 'users', '2026-09-19 15:51:25');

-- --------------------------------------------------------

--
-- Table structure for table `admin_roles`
--

CREATE TABLE `admin_roles` (
  `id` int(11) NOT NULL,
  `role_name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_roles`
--

INSERT INTO `admin_roles` (`id`, `role_name`, `description`, `is_active`, `created_at`) VALUES
(1, 'Super Admin', NULL, 1, '2026-09-19 15:51:25'),
(2, 'Operations', NULL, 1, '2026-09-19 15:51:25'),
(3, 'Finance', NULL, 1, '2026-09-19 15:51:25'),
(4, 'Sales', NULL, 1, '2026-09-19 15:51:25'),
(5, 'Support', NULL, 1, '2026-09-19 15:51:25'),
(6, 'Marketing', NULL, 1, '2026-09-19 15:51:25'),
(7, 'Auditor', NULL, 1, '2026-09-19 15:51:25');

-- --------------------------------------------------------

--
-- Table structure for table `admin_role_permissions`
--

CREATE TABLE `admin_role_permissions` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_role_permissions`
--

INSERT INTO `admin_role_permissions` (`id`, `role_id`, `permission_id`) VALUES
(4, 1, 1),
(12, 1, 2),
(10, 1, 3),
(11, 1, 4),
(7, 1, 5),
(5, 1, 6),
(6, 1, 7),
(3, 1, 8),
(2, 1, 9),
(14, 1, 10),
(13, 1, 11),
(9, 1, 12),
(8, 1, 13),
(17, 1, 14),
(16, 1, 15),
(15, 1, 16),
(1, 1, 17),
(18, 1, 18),
(32, 2, 1),
(35, 2, 2),
(34, 2, 5),
(33, 2, 7),
(40, 3, 1),
(39, 3, 8),
(41, 3, 10),
(49, 3, 11),
(42, 5, 1),
(44, 5, 14),
(43, 5, 15);

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'admin',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `role_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `email`, `password_hash`, `role`, `created_at`, `updated_at`, `role_id`, `is_active`, `last_login_at`) VALUES
(1, 'admin', 'admin@earnmitra.in', '$2b$10$ENcV699pUHuVe1r2dymVY.e0pFnIOINVYxVJKE.L44V5iYI/QYRoa', 'admin', '2026-09-19 12:10:26', '2026-09-23 11:53:07', 1, 1, '2026-09-23 11:53:07'),
(2, 'finance_checker', 'checker@earnmitra.in', '$2b$10$DXvEcY/RjfRTf2pjoByf6uEiXgpbGy3k3FU4DwiXtC/tlTlvFJR4q', 'admin', '2026-09-19 18:04:05', '2026-09-23 11:35:26', 3, 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `app_settings`
--

CREATE TABLE `app_settings` (
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `app_settings`
--

INSERT INTO `app_settings` (`setting_key`, `setting_value`, `description`, `updated_at`) VALUES
('branding_theme', '{\"brandPrimary\":\"#1A56DB\",\"brandPrimaryHover\":\"#1545B0\",\"brandPrimarySoft\":\"#EBF2FF\",\"brandAccent\":\"#0D9488\",\"sidebarBackground\":\"#0B192C\",\"sidebarText\":\"#94A3B8\",\"sidebarMuted\":\"#64748B\",\"sidebarActiveBackground\":\"#1A56DB\",\"sidebarActiveText\":\"#FFFFFF\",\"headerAccent\":\"#1A56DB\",\"buttonPrimary\":\"#1A56DB\",\"linkHighlight\":\"#1A56DB\",\"pageBackground\":\"#F8FAFC\",\"surfaceBackground\":\"#FFFFFF\",\"surfaceCard\":\"#FFFFFF\",\"textPrimary\":\"#0F172A\",\"textSecondary\":\"#64748B\",\"borderColor\":\"#E2E8F0\",\"success\":\"#16A34A\",\"warning\":\"#D97706\",\"danger\":\"#DC2626\",\"info\":\"#2563EB\",\"focusRing\":\"rgba(26, 86, 219, 0.2)\"}', NULL, '2026-09-21 13:47:51'),
('company_address', 'Hyderabad, Telangana, India', NULL, '2026-09-21 12:20:35'),
('company_name', 'Earnmitra', NULL, '2026-09-21 12:20:35'),
('company_website', 'www.earnmitra.in', NULL, '2026-09-21 12:20:35'),
('faqs', '[{\"q\":\"How do I become an Earnmitra partner?\",\"a\":\"Register with your mobile number, complete KYC and accept the partner agreement. Approval usually takes 1–2 working days.\"},{\"q\":\"Is there a registration fee?\",\"a\":\"No. Registration is free for all partner types.\"},{\"q\":\"When will I receive my commission?\",\"a\":\"Payouts are released after the lender settles, typically 3–5 working days after verification.\"},{\"q\":\"Which loan products are available?\",\"a\":\"Business, personal, MSME, equipment, working capital and loan against property.\"},{\"q\":\"How do I track my leads?\",\"a\":\"Open My Leads. Every status change is also sent to you on WhatsApp.\"}]', 'Frequently Asked Questions for support', '2026-09-18 17:25:52'),
('gst_rate_standard', '18', NULL, '2026-09-21 12:20:35'),
('min_payout_amount', '500', NULL, '2026-09-23 18:55:10'),
('min_payout_threshold', '500', NULL, '2026-09-21 12:20:35'),
('partner_metadata', '{\"partnerTypes\":[\"CA\",\"Tax Consultant\",\"GST Practitioner\",\"Accountant\",\"Company HR\",\"Company Finance\",\"DSA / Loan Agent\",\"Automobile Dealer\",\"Equipment Dealer\",\"Real Estate Agent\",\"Business Consultant\",\"Other\"],\"states\":[\"Telangana\",\"Andhra Pradesh\"],\"loanTypes\":[{\"icon\":\"🏦\",\"label\":\"Business Loan\"},{\"icon\":\"👤\",\"label\":\"Personal Loan\"},{\"icon\":\"🚜\",\"label\":\"Equipment Loan\"},{\"icon\":\"🏪\",\"label\":\"MSME Loan\"},{\"icon\":\"🏠\",\"label\":\"Loan Against Property\"},{\"icon\":\"📄\",\"label\":\"Other Loan\"}],\"loanPurposes\":[\"Business expansion\",\"Working capital\",\"Equipment purchase\",\"Machinery\",\"Debt consolidation\",\"Personal need\",\"Other\"],\"lenders\":[\"Any (recommended)\",\"HDFC Bank\",\"ICICI Bank\",\"SBI\",\"Axis Bank\",\"Bajaj Finserv\",\"Tata Capital\"]}', 'Dropdown and metadata configuration for partner portal', '2026-09-18 17:25:52'),
('support_email', 'support@earnmitra.in', NULL, '2026-09-21 12:20:35'),
('support_phone', '1800-123-EARN', NULL, '2026-09-23 18:55:10'),
('system_maintenance_mode', '0', NULL, '2026-09-21 12:20:35'),
('tds_rate_standard', '5', NULL, '2026-09-21 12:20:35');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(100) DEFAULT NULL,
  `entity_id` varchar(100) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `admin_id`, `action`, `entity_type`, `entity_id`, `metadata`, `ip_address`, `created_at`) VALUES
(1, 1, 'admin.login', 'admin_user', '1', NULL, NULL, '2026-09-19 15:59:52'),
(2, 1, 'admin.login', 'admin_user', '1', NULL, NULL, '2026-09-19 16:24:28'),
(3, 1, 'lead.update_status', 'lead', '18', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-19 16:24:28'),
(4, 1, 'admin.login', 'admin_user', '1', NULL, NULL, '2026-09-19 16:24:48'),
(5, 1, 'lead.update_status', 'lead', '20', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-19 16:24:49'),
(6, 1, 'admin.login', 'admin_user', '1', NULL, NULL, '2026-09-19 16:25:12'),
(7, 1, 'lead.update_status', 'lead', '17', '{\"old_status\":\"Approved\",\"new_status\":\"Under Review\",\"stage\":\"Lead submitted\"}', NULL, '2026-09-19 16:25:12'),
(8, 1, 'admin.login', 'admin_user', '1', NULL, NULL, '2026-09-19 16:25:33'),
(9, 1, 'lead.update_status', 'lead', '17', '{\"old_status\":\"Under Review\",\"new_status\":\"Under Review\",\"stage\":\"Lead submitted\"}', NULL, '2026-09-19 16:25:33'),
(10, 1, 'admin.login', 'admin_user', '1', NULL, NULL, '2026-09-19 16:25:59'),
(11, 1, 'admin.login', 'admin_user', '1', NULL, NULL, '2026-09-19 16:46:54'),
(12, 1, 'admin.login', 'admin_user', '1', NULL, NULL, '2026-09-19 17:17:13'),
(13, 1, 'lead.update_status', 'lead', '22', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-19 17:17:14'),
(14, 1, 'admin.login', 'admin_user', '1', NULL, NULL, '2026-09-19 17:17:31'),
(15, 1, 'admin.login', 'admin_user', '1', NULL, NULL, '2026-09-19 17:18:14'),
(16, 1, 'admin.login', 'admin_user', '1', NULL, NULL, '2026-09-19 17:22:26'),
(17, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-19 17:27:38'),
(18, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-19 17:27:38'),
(19, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-19 17:27:38'),
(20, 1, 'lead.update_status', 'lead', '25', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-19 17:35:45'),
(21, 1, 'payout.process', 'payout_request', '3', '{\"status\":\"completed\",\"amount\":\"12500.00\",\"partner_id\":1,\"note\":null}', NULL, '2026-09-19 17:35:46'),
(22, 1, 'admin.login', 'admin_user', '1', NULL, NULL, '2026-09-19 17:36:52'),
(23, 1, 'lead.update_status', 'lead', '26', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-19 17:36:53'),
(24, 1, 'admin.login', 'admin_user', '1', NULL, NULL, '2026-09-19 17:36:54'),
(25, 1, 'admin.login', 'admin_user', '1', NULL, NULL, '2026-09-19 17:36:55'),
(26, 1, 'admin.login', 'admin_user', '1', NULL, NULL, '2026-09-19 17:36:56'),
(27, 1, 'lead.update_status', 'lead', '25', '{\"old_status\":\"Approved\",\"new_status\":\"Under Review\",\"stage\":\"Lead submitted\"}', NULL, '2026-09-19 17:36:56'),
(28, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-19 17:36:56'),
(29, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-19 17:36:56'),
(30, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-19 17:36:56'),
(31, 1, 'lead.update_status', 'lead', '28', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-19 17:36:57'),
(32, 1, 'payout.process', 'payout_request', '3', '{\"status\":\"completed\",\"amount\":\"12500.00\",\"partner_id\":1,\"note\":null}', NULL, '2026-09-19 17:36:57'),
(33, 1, 'admin.login', 'admin_user', '1', NULL, NULL, '2026-09-19 17:55:58'),
(34, 1, 'payout.review', 'payout_request', '5', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-20 09:05:22'),
(35, 1, 'payout.review', 'payout_request', '6', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-20 09:09:12'),
(36, 2, 'payout.approve', 'payout_request', '6', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-20 09:09:12'),
(37, 1, 'payout.process', 'payout_request', '6', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-20 09:09:12'),
(38, 1, 'payout.settle', 'payout_request', '6', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR75552352\",\"amount\":\"2500.00\"}', NULL, '2026-09-20 09:09:12'),
(39, 1, 'payout.reject', 'payout_request', '7', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-20 09:09:12'),
(40, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-20 09:09:12'),
(41, 1, 'payout.review', 'payout_request', '8', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-20 09:12:48'),
(42, 2, 'payout.approve', 'payout_request', '8', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-20 09:12:48'),
(43, 1, 'payout.process', 'payout_request', '8', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-20 09:12:48'),
(44, 1, 'payout.settle', 'payout_request', '8', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR75768973\",\"amount\":\"2500.00\"}', NULL, '2026-09-20 09:12:48'),
(45, 1, 'payout.reject', 'payout_request', '9', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-20 09:12:49'),
(46, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-20 09:12:49'),
(47, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-20 09:12:49'),
(48, 1, 'lead.update_status', 'lead', '30', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-20 09:12:49'),
(49, 1, 'lead.update_status', 'lead', '30', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-20 09:12:49'),
(50, 1, 'lead.update_status', 'lead', '31', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-20 09:12:49'),
(51, 1, 'lead.update_status', 'lead', '34', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-20 09:17:28'),
(52, 3, 'admin.login', 'admin_user', '3', NULL, NULL, '2026-09-20 09:17:29'),
(53, 1, 'lead.update_status', 'lead', '32', '{\"old_status\":\"In Progress\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-20 09:17:30'),
(54, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-20 09:17:30'),
(55, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-20 09:17:30'),
(56, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-20 09:17:30'),
(57, 1, 'lead.update_status', 'lead', '36', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-20 09:17:30'),
(58, 1, 'payout.review', 'payout_request', '10', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-20 09:17:31'),
(59, 2, 'payout.approve', 'payout_request', '10', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-20 09:17:31'),
(60, 1, 'payout.process', 'payout_request', '10', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-20 09:17:31'),
(61, 1, 'payout.settle', 'payout_request', '10', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR76051541\",\"amount\":\"2500.00\"}', NULL, '2026-09-20 09:17:31'),
(62, 1, 'payout.reject', 'payout_request', '11', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-20 09:17:31'),
(63, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-20 09:17:31'),
(64, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-20 09:17:31'),
(65, 1, 'lead.update_status', 'lead', '37', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-20 09:17:31'),
(66, 1, 'lead.update_status', 'lead', '37', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-20 09:17:31'),
(67, 1, 'lead.update_status', 'lead', '38', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-20 09:17:31'),
(68, 1, 'lead.update_status', 'lead', '39', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-20 09:58:44'),
(69, 4, 'admin.login', 'admin_user', '4', NULL, NULL, '2026-09-20 09:58:46'),
(70, 1, 'lead.update_status', 'lead', '37', '{\"old_status\":\"Card Issued\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-20 09:58:48'),
(71, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-20 09:58:49'),
(72, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-20 09:58:49'),
(73, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-20 09:58:49'),
(74, 1, 'lead.update_status', 'lead', '41', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-20 09:58:50'),
(75, 1, 'payout.review', 'payout_request', '12', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-20 09:58:51'),
(76, 2, 'payout.approve', 'payout_request', '12', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-20 09:58:51'),
(77, 1, 'payout.process', 'payout_request', '12', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-20 09:58:51'),
(78, 1, 'payout.settle', 'payout_request', '12', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR78531943\",\"amount\":\"2500.00\"}', NULL, '2026-09-20 09:58:51'),
(79, 1, 'payout.reject', 'payout_request', '13', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-20 09:58:52'),
(80, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-20 09:58:52'),
(81, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-20 09:58:52'),
(82, 1, 'lead.update_status', 'lead', '42', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-20 09:58:52'),
(83, 1, 'lead.update_status', 'lead', '42', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-20 09:58:52'),
(84, 1, 'lead.update_status', 'lead', '43', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-20 09:58:52'),
(85, 1, 'lead.update_status', 'lead', '44', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-20 11:51:07'),
(86, 5, 'admin.login', 'admin_user', '5', NULL, NULL, '2026-09-20 11:51:08'),
(87, 1, 'lead.update_status', 'lead', '42', '{\"old_status\":\"Card Issued\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-20 11:51:09'),
(88, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-20 11:51:09'),
(89, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-20 11:51:09'),
(90, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-20 11:51:09'),
(91, 1, 'lead.update_status', 'lead', '46', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-20 11:51:10'),
(92, 1, 'payout.review', 'payout_request', '14', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-20 11:51:10'),
(93, 2, 'payout.approve', 'payout_request', '14', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-20 11:51:10'),
(94, 1, 'payout.process', 'payout_request', '14', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-20 11:51:10'),
(95, 1, 'payout.settle', 'payout_request', '14', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR85270877\",\"amount\":\"2500.00\"}', NULL, '2026-09-20 11:51:10'),
(96, 1, 'payout.reject', 'payout_request', '15', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-20 11:51:10'),
(97, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-20 11:51:10'),
(98, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-20 11:51:10'),
(99, 1, 'lead.update_status', 'lead', '47', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-20 11:51:11'),
(100, 1, 'lead.update_status', 'lead', '47', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-20 11:51:11'),
(101, 1, 'lead.update_status', 'lead', '48', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-20 11:51:11'),
(102, 1, 'lead.update_status', 'lead', '55', '{\"old_status\":\"In Progress\",\"new_status\":\"Disbursed\",\"stage\":\"Disbursal\"}', NULL, '2026-09-20 11:58:58'),
(103, 1, 'lead.update_status', 'lead', '58', '{\"old_status\":\"In Progress\",\"new_status\":\"Disbursed\",\"stage\":\"Disbursal\"}', NULL, '2026-09-20 12:15:17'),
(104, 1, 'commission.credited', 'partner_earnings', '39', '{\"leadId\":58,\"partnerId\":28,\"ruleId\":1,\"grossAmount\":15000,\"tdsRate\":5,\"tdsAmount\":750,\"netCommission\":14250}', NULL, '2026-09-20 12:15:17'),
(105, 1, 'lead.update_status', 'lead', '59', '{\"old_status\":\"In Progress\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-20 12:15:17'),
(106, 1, 'commission.credited', 'partner_earnings', '40', '{\"leadId\":59,\"partnerId\":28,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-20 12:15:17'),
(107, 1, 'lead.update_status', 'lead', '60', '{\"old_status\":\"In Progress\",\"new_status\":\"Disbursed\",\"stage\":\"Disbursal\"}', NULL, '2026-09-20 12:15:17'),
(108, 1, 'kyc.review', 'kyc_document', '5', '{\"new_status\":\"approved\",\"note\":\"Verified against NSDL portal\",\"partner_id\":28}', NULL, '2026-09-20 12:15:17'),
(109, 1, 'lead.update_status', 'lead', '61', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-20 12:28:54'),
(110, 6, 'admin.login', 'admin_user', '6', NULL, NULL, '2026-09-20 12:28:55'),
(111, 1, 'lead.update_status', 'lead', '58', '{\"old_status\":\"Disbursed\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-20 12:29:00'),
(112, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-20 12:29:02'),
(113, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-20 12:29:02'),
(114, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-20 12:29:02'),
(115, 1, 'lead.update_status', 'lead', '63', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-20 12:29:03'),
(116, 1, 'payout.review', 'payout_request', '18', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-20 12:29:05'),
(117, 2, 'payout.approve', 'payout_request', '18', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-20 12:29:05'),
(118, 1, 'payout.process', 'payout_request', '18', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-20 12:29:05'),
(119, 1, 'payout.settle', 'payout_request', '18', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR87545346\",\"amount\":\"2500.00\"}', NULL, '2026-09-20 12:29:05'),
(120, 1, 'payout.reject', 'payout_request', '19', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-20 12:29:05'),
(121, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-20 12:29:05'),
(122, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-20 12:29:05'),
(123, 1, 'lead.update_status', 'lead', '64', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-20 12:29:05'),
(124, 1, 'lead.update_status', 'lead', '64', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-20 12:29:05'),
(125, 1, 'commission.credited', 'partner_earnings', '45', '{\"leadId\":64,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-20 12:29:05'),
(126, 1, 'lead.update_status', 'lead', '65', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-20 12:29:05'),
(127, 1, 'payout.review', 'payout_request', '17', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-21 11:07:12'),
(128, 1, 'lead.update_status', 'lead', '66', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-21 11:20:33'),
(129, 7, 'admin.login', 'admin_user', '7', NULL, NULL, '2026-09-21 11:20:34'),
(130, 1, 'lead.update_status', 'lead', '64', '{\"old_status\":\"Card Issued\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-21 11:20:35'),
(131, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-21 11:20:35'),
(132, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-21 11:20:35'),
(133, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-21 11:20:35'),
(134, 1, 'lead.update_status', 'lead', '68', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-21 11:20:36'),
(135, 1, 'payout.review', 'payout_request', '20', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-21 11:20:37'),
(136, 2, 'payout.approve', 'payout_request', '20', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-21 11:20:37'),
(137, 1, 'payout.process', 'payout_request', '20', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-21 11:20:37'),
(138, 1, 'payout.settle', 'payout_request', '20', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR69837244\",\"amount\":\"2500.00\"}', NULL, '2026-09-21 11:20:37'),
(139, 1, 'payout.reject', 'payout_request', '21', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-21 11:20:37'),
(140, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-21 11:20:37'),
(141, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-21 11:20:37'),
(142, 1, 'lead.update_status', 'lead', '69', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-21 11:20:37'),
(143, 1, 'lead.update_status', 'lead', '69', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-21 11:20:37'),
(144, 1, 'commission.credited', 'partner_earnings', '50', '{\"leadId\":69,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-21 11:20:37'),
(145, 1, 'lead.update_status', 'lead', '70', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-21 11:20:37'),
(146, 1, 'integration.toggle', 'platform_integration', '1', '{\"new_status\":\"Connected\"}', NULL, '2026-09-21 11:46:04'),
(147, 1, 'integration.toggle', 'platform_integration', '2', '{\"new_status\":\"Connected\"}', NULL, '2026-09-21 11:46:15'),
(148, 1, 'integration.toggle', 'platform_integration', '3', '{\"new_status\":\"Connected\"}', NULL, '2026-09-21 11:46:17'),
(149, 1, 'integration.toggle', 'platform_integration', '4', '{\"new_status\":\"Connected\"}', NULL, '2026-09-21 11:46:18'),
(150, 1, 'integration.toggle', 'platform_integration', '5', '{\"new_status\":\"Connected\"}', NULL, '2026-09-21 11:46:21'),
(151, 1, 'integration.toggle', 'platform_integration', '6', '{\"new_status\":\"Connected\"}', NULL, '2026-09-21 11:46:23'),
(152, 1, 'integration.toggle', 'platform_integration', '7', '{\"new_status\":\"Connected\"}', NULL, '2026-09-21 11:46:25'),
(153, 1, 'integration.toggle', 'platform_integration', '8', '{\"new_status\":\"Connected\"}', NULL, '2026-09-21 11:46:27'),
(154, 1, 'lead.update_status', 'lead', '69', '{\"old_status\":\"Card Issued\",\"new_status\":\"Underwriting\",\"stage\":\"Lead submitted\"}', NULL, '2026-09-21 12:19:10'),
(155, 1, 'lead.update_status', 'lead', '69', '{\"old_status\":\"Underwriting\",\"new_status\":\"Underwriting\",\"stage\":\"Lead submitted\"}', NULL, '2026-09-21 12:20:18'),
(156, 1, 'settings.update', 'app_settings', 'all', '{\"company_name\":\"Earnmitra\",\"company_website\":\"www.earnmitra.in\",\"support_email\":\"support@earnmitra.in\",\"support_phone\":\"1800-123-EARN\",\"company_address\":\"Hyderabad, Telangana, India\",\"min_payout_threshold\":\"500\",\"tds_rate_standard\":\"5\",\"gst_rate_standard\":\"18\",\"system_maintenance_mode\":\"0\"}', NULL, '2026-09-21 12:20:35'),
(157, 1, 'lead.update_status', 'lead', '71', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-21 12:21:30'),
(158, 8, 'admin.login', 'admin_user', '8', NULL, NULL, '2026-09-21 12:21:31'),
(159, 1, 'lead.update_status', 'lead', '69', '{\"old_status\":\"Underwriting\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-21 12:21:31'),
(160, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-21 12:21:32'),
(161, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-21 12:21:32'),
(162, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-21 12:21:32'),
(163, 1, 'lead.update_status', 'lead', '73', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-21 12:21:32'),
(164, 1, 'payout.review', 'payout_request', '22', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-21 12:21:33'),
(165, 2, 'payout.approve', 'payout_request', '22', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-21 12:21:33'),
(166, 1, 'payout.process', 'payout_request', '22', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-21 12:21:33'),
(167, 1, 'payout.settle', 'payout_request', '22', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR73493108\",\"amount\":\"2500.00\"}', NULL, '2026-09-21 12:21:33'),
(168, 1, 'payout.reject', 'payout_request', '23', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-21 12:21:33'),
(169, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-21 12:21:33'),
(170, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-21 12:21:33'),
(171, 1, 'lead.update_status', 'lead', '74', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-21 12:21:33'),
(172, 1, 'lead.update_status', 'lead', '74', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-21 12:21:33'),
(173, 1, 'commission.credited', 'partner_earnings', '55', '{\"leadId\":74,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-21 12:21:33'),
(174, 1, 'lead.update_status', 'lead', '75', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-21 12:21:33'),
(175, 1, 'lead.update_status', 'lead', '76', '{\"old_status\":\"In Progress\",\"new_status\":\"Underwriting\",\"stage\":\"Lead submitted\"}', NULL, '2026-09-21 12:31:37'),
(178, 1, 'settings.branding_update', 'app_settings', 'branding_theme', '{\"oldValues\":{\"brandPrimary\":\"#2563EB\",\"sidebarBackground\":\"#030712\"}}', NULL, '2026-09-21 12:46:59'),
(179, 1, 'settings.branding_reset', 'app_settings', 'branding_theme', '{\"resetTo\":\"Earnmitra Default\"}', NULL, '2026-09-21 12:47:30'),
(180, 1, 'settings.branding_update', 'app_settings', 'branding_theme', '{\"oldValues\":{\"brandPrimary\":\"#1A56DB\",\"brandPrimaryHover\":\"#1545B0\",\"brandPrimarySoft\":\"#EBF2FF\",\"brandAccent\":\"#0D9488\",\"sidebarBackground\":\"#0B192C\",\"sidebarText\":\"#94A3B8\",\"sidebarMuted\":\"#64748B\",\"sidebarActiveBackground\":\"#1A56DB\",\"sidebarActiveText\":\"#FFFFFF\",\"pageBackground\":\"#F8FAFC\",\"surfaceBackground\":\"#FFFFFF\",\"surfaceCard\":\"#FFFFFF\",\"textPrimary\":\"#0F172A\",\"textSecondary\":\"#64748B\",\"borderColor\":\"#E2E8F0\",\"success\":\"#16A34A\",\"warning\":\"#D97706\",\"danger\":\"#DC2626\",\"info\":\"#2563EB\",\"focusRing\":\"rgba(26, 86, 219, 0.2)\"}}', NULL, '2026-09-21 13:05:17'),
(181, 1, 'lead.update_status', 'lead', '79', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-21 13:21:56'),
(182, 9, 'admin.login', 'admin_user', '9', NULL, NULL, '2026-09-21 13:21:57'),
(183, 1, 'lead.update_status', 'lead', '74', '{\"old_status\":\"Card Issued\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-21 13:21:58'),
(184, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-21 13:21:59'),
(185, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-21 13:21:59'),
(186, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-21 13:21:59'),
(187, 1, 'lead.update_status', 'lead', '81', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-21 13:22:00'),
(188, 1, 'payout.review', 'payout_request', '24', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-21 13:22:01'),
(189, 2, 'payout.approve', 'payout_request', '24', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-21 13:22:01'),
(190, 1, 'payout.process', 'payout_request', '24', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-21 13:22:01'),
(191, 1, 'payout.settle', 'payout_request', '24', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR77121224\",\"amount\":\"2500.00\"}', NULL, '2026-09-21 13:22:01'),
(192, 1, 'payout.reject', 'payout_request', '25', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-21 13:22:01'),
(193, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-21 13:22:01'),
(194, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-21 13:22:01'),
(195, 1, 'lead.update_status', 'lead', '82', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-21 13:22:01'),
(196, 1, 'lead.update_status', 'lead', '82', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-21 13:22:01'),
(197, 1, 'commission.credited', 'partner_earnings', '60', '{\"leadId\":82,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-21 13:22:01'),
(198, 1, 'lead.update_status', 'lead', '83', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-21 13:22:01'),
(199, 1, 'lead.update_status', 'lead', '54', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Underwriting approved by insurance partner\"}', NULL, '2026-09-21 13:28:43'),
(200, 1, 'lead.update_status', 'lead', '54', '{\"old_status\":\"Approved\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy schedule generated and issued\"}', NULL, '2026-09-21 13:28:46'),
(201, 1, 'lead.update_status', 'lead', '54', '{\"old_status\":\"Policy Issued\",\"new_status\":\"Rejected\",\"stage\":\"Application does not meet credit policy\"}', NULL, '2026-09-21 13:28:52'),
(202, 1, 'lead.update_status', 'lead', '84', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-21 13:29:57'),
(203, 10, 'admin.login', 'admin_user', '10', NULL, NULL, '2026-09-21 13:29:57'),
(204, 1, 'lead.update_status', 'lead', '82', '{\"old_status\":\"Card Issued\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-21 13:29:59'),
(205, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-21 13:29:59'),
(206, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-21 13:29:59'),
(207, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-21 13:29:59'),
(208, 1, 'lead.update_status', 'lead', '86', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-21 13:29:59'),
(209, 1, 'payout.review', 'payout_request', '26', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-21 13:30:00'),
(210, 2, 'payout.approve', 'payout_request', '26', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-21 13:30:00'),
(211, 1, 'payout.process', 'payout_request', '26', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-21 13:30:00'),
(212, 1, 'payout.settle', 'payout_request', '26', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR77600714\",\"amount\":\"2500.00\"}', NULL, '2026-09-21 13:30:00'),
(213, 1, 'payout.reject', 'payout_request', '27', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-21 13:30:00'),
(214, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-21 13:30:00'),
(215, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-21 13:30:00'),
(216, 1, 'lead.update_status', 'lead', '87', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-21 13:30:00'),
(217, 1, 'lead.update_status', 'lead', '87', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-21 13:30:00'),
(218, 1, 'commission.credited', 'partner_earnings', '65', '{\"leadId\":87,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-21 13:30:00'),
(219, 1, 'lead.update_status', 'lead', '88', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-21 13:30:00'),
(220, 1, 'settings.branding_reset', 'app_settings', 'branding_theme', '{\"resetTo\":\"Earnmitra Default\"}', NULL, '2026-09-21 13:46:48'),
(221, 1, 'settings.branding_reset', 'app_settings', 'branding_theme', '{\"resetTo\":\"Earnmitra Default\"}', NULL, '2026-09-21 13:47:16'),
(222, 1, 'settings.branding_reset', 'app_settings', 'branding_theme', '{\"resetTo\":\"Earnmitra Default\"}', NULL, '2026-09-21 13:47:51'),
(223, 1, 'lead.update_status', 'lead', '90', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-21 16:21:06'),
(224, 11, 'admin.login', 'admin_user', '11', NULL, NULL, '2026-09-21 16:21:08'),
(225, 1, 'lead.update_status', 'lead', '89', '{\"old_status\":\"In Progress\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-21 16:21:09'),
(226, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-21 16:21:09'),
(227, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-21 16:21:09'),
(228, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-21 16:21:09'),
(229, 1, 'lead.update_status', 'lead', '92', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-21 16:21:10'),
(230, 1, 'payout.review', 'payout_request', '28', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-21 16:21:10'),
(231, 2, 'payout.approve', 'payout_request', '28', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-21 16:21:10'),
(232, 1, 'payout.process', 'payout_request', '28', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-21 16:21:11'),
(233, 1, 'payout.settle', 'payout_request', '28', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR87871022\",\"amount\":\"2500.00\"}', NULL, '2026-09-21 16:21:11'),
(234, 1, 'payout.reject', 'payout_request', '29', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-21 16:21:11'),
(235, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-21 16:21:11'),
(236, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-21 16:21:11'),
(237, 1, 'lead.update_status', 'lead', '93', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-21 16:21:11'),
(238, 1, 'lead.update_status', 'lead', '93', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-21 16:21:11'),
(239, 1, 'commission.credited', 'partner_earnings', '70', '{\"leadId\":93,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-21 16:21:11'),
(240, 1, 'lead.update_status', 'lead', '94', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-21 16:21:11'),
(241, 1, 'lead.update_status', 'lead', '95', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-21 16:27:55'),
(242, 1, 'lead.update_status', 'lead', '97', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-21 16:30:57'),
(243, 1, 'lead.update_status', 'lead', '99', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-21 16:31:54'),
(244, 12, 'admin.login', 'admin_user', '12', NULL, NULL, '2026-09-21 16:31:56'),
(245, 1, 'lead.update_status', 'lead', '95', '{\"old_status\":\"Approved\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-21 16:32:05'),
(246, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-21 16:32:07'),
(247, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-21 16:32:07'),
(248, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-21 16:32:07'),
(249, 1, 'lead.update_status', 'lead', '101', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-21 16:32:08'),
(250, 1, 'payout.review', 'payout_request', '30', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-21 16:32:10'),
(251, 2, 'payout.approve', 'payout_request', '30', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-21 16:32:10'),
(252, 1, 'payout.process', 'payout_request', '30', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-21 16:32:10'),
(253, 1, 'payout.settle', 'payout_request', '30', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR88530824\",\"amount\":\"2500.00\"}', NULL, '2026-09-21 16:32:10'),
(254, 1, 'payout.reject', 'payout_request', '31', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-21 16:32:10'),
(255, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-21 16:32:11'),
(256, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-21 16:32:11'),
(257, 1, 'lead.update_status', 'lead', '102', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-21 16:32:11'),
(258, 1, 'lead.update_status', 'lead', '102', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-21 16:32:11'),
(259, 1, 'commission.credited', 'partner_earnings', '75', '{\"leadId\":102,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-21 16:32:11'),
(260, 1, 'lead.update_status', 'lead', '103', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-21 16:32:11'),
(261, 1, 'lead.update_status', 'lead', '104', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-21 16:33:26'),
(262, 13, 'admin.login', 'admin_user', '13', NULL, NULL, '2026-09-21 16:33:27'),
(263, 1, 'lead.update_status', 'lead', '102', '{\"old_status\":\"Card Issued\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-21 16:33:28'),
(264, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-21 16:33:29'),
(265, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-21 16:33:29'),
(266, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-21 16:33:29'),
(267, 1, 'lead.update_status', 'lead', '106', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-21 16:33:29'),
(268, 1, 'payout.review', 'payout_request', '32', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-21 16:33:30'),
(269, 2, 'payout.approve', 'payout_request', '32', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-21 16:33:30'),
(270, 1, 'payout.process', 'payout_request', '32', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-21 16:33:30'),
(271, 1, 'payout.settle', 'payout_request', '32', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR88610338\",\"amount\":\"2500.00\"}', NULL, '2026-09-21 16:33:30'),
(272, 1, 'payout.reject', 'payout_request', '33', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-21 16:33:30'),
(273, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-21 16:33:30'),
(274, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-21 16:33:30'),
(275, 1, 'lead.update_status', 'lead', '107', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-21 16:33:30'),
(276, 1, 'lead.update_status', 'lead', '107', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-21 16:33:30'),
(277, 1, 'commission.credited', 'partner_earnings', '80', '{\"leadId\":107,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-21 16:33:30'),
(278, 1, 'lead.update_status', 'lead', '108', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-21 16:33:30'),
(279, 1, 'lead.update_status', 'lead', '109', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-21 17:02:39'),
(280, 14, 'admin.login', 'admin_user', '14', NULL, NULL, '2026-09-21 17:02:40'),
(281, 1, 'lead.update_status', 'lead', '107', '{\"old_status\":\"Card Issued\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-21 17:02:42'),
(282, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-21 17:02:43'),
(283, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-21 17:02:43'),
(284, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-21 17:02:43'),
(285, 1, 'lead.update_status', 'lead', '111', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-21 17:02:44'),
(286, 1, 'payout.review', 'payout_request', '34', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-21 17:02:44'),
(287, 2, 'payout.approve', 'payout_request', '34', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-21 17:02:45'),
(288, 1, 'payout.process', 'payout_request', '34', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-21 17:02:45'),
(289, 1, 'payout.settle', 'payout_request', '34', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR90365066\",\"amount\":\"2500.00\"}', NULL, '2026-09-21 17:02:45'),
(290, 1, 'payout.reject', 'payout_request', '35', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-21 17:02:45'),
(291, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-21 17:02:45'),
(292, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-21 17:02:45'),
(293, 1, 'lead.update_status', 'lead', '112', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-21 17:02:45'),
(294, 1, 'lead.update_status', 'lead', '112', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-21 17:02:45'),
(295, 1, 'commission.credited', 'partner_earnings', '85', '{\"leadId\":112,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-21 17:02:45'),
(296, 1, 'lead.update_status', 'lead', '113', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-21 17:02:45'),
(297, 1, 'lead.update_status', 'lead', '114', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-21 17:03:30'),
(298, 15, 'admin.login', 'admin_user', '15', NULL, NULL, '2026-09-21 17:03:31'),
(299, 1, 'lead.update_status', 'lead', '112', '{\"old_status\":\"Card Issued\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-21 17:03:32'),
(300, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-21 17:03:32'),
(301, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-21 17:03:32'),
(302, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-21 17:03:32'),
(303, 1, 'lead.update_status', 'lead', '116', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-21 17:03:33'),
(304, 1, 'payout.review', 'payout_request', '36', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-21 17:03:33'),
(305, 2, 'payout.approve', 'payout_request', '36', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-21 17:03:33'),
(306, 1, 'payout.process', 'payout_request', '36', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-21 17:03:33'),
(307, 1, 'payout.settle', 'payout_request', '36', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR90413589\",\"amount\":\"2500.00\"}', NULL, '2026-09-21 17:03:33'),
(308, 1, 'payout.reject', 'payout_request', '37', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-21 17:03:33'),
(309, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-21 17:03:33'),
(310, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-21 17:03:33'),
(311, 1, 'lead.update_status', 'lead', '117', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-21 17:03:33'),
(312, 1, 'lead.update_status', 'lead', '117', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-21 17:03:33'),
(313, 1, 'commission.credited', 'partner_earnings', '90', '{\"leadId\":117,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-21 17:03:33'),
(314, 1, 'lead.update_status', 'lead', '118', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-21 17:03:33'),
(315, 1, 'lead.update_status', 'lead', '119', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-21 18:25:31'),
(316, 16, 'admin.login', 'admin_user', '16', NULL, NULL, '2026-09-21 18:25:32');
INSERT INTO `audit_logs` (`id`, `admin_id`, `action`, `entity_type`, `entity_id`, `metadata`, `ip_address`, `created_at`) VALUES
(317, 1, 'lead.update_status', 'lead', '117', '{\"old_status\":\"Card Issued\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-21 18:25:34'),
(318, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-21 18:25:34'),
(319, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-21 18:25:34'),
(320, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-21 18:25:34'),
(321, 1, 'lead.update_status', 'lead', '121', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-21 18:25:35'),
(322, 1, 'payout.review', 'payout_request', '38', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-21 18:25:36'),
(323, 2, 'payout.approve', 'payout_request', '38', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-21 18:25:36'),
(324, 1, 'payout.process', 'payout_request', '38', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-21 18:25:36'),
(325, 1, 'payout.settle', 'payout_request', '38', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR95336156\",\"amount\":\"2500.00\"}', NULL, '2026-09-21 18:25:36'),
(326, 1, 'payout.reject', 'payout_request', '39', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-21 18:25:36'),
(327, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-21 18:25:36'),
(328, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-21 18:25:36'),
(329, 1, 'lead.update_status', 'lead', '122', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-21 18:25:36'),
(330, 1, 'lead.update_status', 'lead', '122', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-21 18:25:36'),
(331, 1, 'commission.credited', 'partner_earnings', '95', '{\"leadId\":122,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-21 18:25:36'),
(332, 1, 'lead.update_status', 'lead', '123', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-21 18:25:36'),
(333, 1, 'payout.review', 'payout_request', '40', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-22 00:39:28'),
(334, 2, 'payout.approve', 'payout_request', '40', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-22 00:39:28'),
(335, 1, 'payout.process', 'payout_request', '40', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-22 00:39:28'),
(336, 1, 'payout.settle', 'payout_request', '40', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR17768145\",\"amount\":\"2500.00\"}', NULL, '2026-09-22 00:39:28'),
(337, 1, 'payout.reject', 'payout_request', '41', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-22 00:39:28'),
(338, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-22 00:39:28'),
(339, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-22 00:39:28'),
(340, 1, 'lead.update_status', 'lead', '124', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-22 00:39:28'),
(341, 1, 'lead.update_status', 'lead', '124', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-22 00:39:28'),
(342, 1, 'commission.credited', 'partner_earnings', '100', '{\"leadId\":124,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-22 00:39:28'),
(343, 1, 'lead.update_status', 'lead', '125', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-22 00:39:28'),
(344, 1, 'lead.update_status', 'lead', '126', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter issued by lender\"}', NULL, '2026-09-22 00:41:36'),
(345, 1, 'commission.admin_decided', 'partner_earnings', '101', '{\"leadId\":126,\"partnerId\":1,\"grossAmount\":5250,\"tdsRate\":5,\"tdsAmount\":262.5,\"netCommission\":4987.5,\"description\":\"1.5% loan commission approved by Super Admin for FTL123536\"}', NULL, '2026-09-22 00:41:36'),
(346, 1, 'commission.admin_awarded', 'partner_earnings', '102', '{\"partnerId\":1,\"leadId\":null,\"grossAmount\":1000,\"tdsRate\":5,\"tdsAmount\":50,\"netCommission\":950,\"description\":\"Q1 Special Volume Performance Bonus\"}', NULL, '2026-09-22 00:41:36'),
(347, 1, 'kyc.review', 'kyc_document', '7', '{\"new_status\":\"approved\",\"note\":null,\"partner_id\":94}', NULL, '2026-09-22 10:34:57'),
(348, 1, 'kyc.review', 'kyc_document', '6', '{\"new_status\":\"approved\",\"note\":null,\"partner_id\":94}', NULL, '2026-09-22 10:35:16'),
(349, 1, 'lead.update_status', 'lead', '127', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-22 11:49:12'),
(350, 17, 'admin.login', 'admin_user', '17', NULL, NULL, '2026-09-22 11:49:13'),
(351, 1, 'lead.update_status', 'lead', '126', '{\"old_status\":\"Approved\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-22 11:49:14'),
(352, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-22 11:49:14'),
(353, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-22 11:49:15'),
(354, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-22 11:49:15'),
(355, 1, 'lead.update_status', 'lead', '129', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-22 11:49:15'),
(356, 1, 'payout.review', 'payout_request', '42', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-22 11:49:16'),
(357, 2, 'payout.approve', 'payout_request', '42', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-22 11:49:17'),
(358, 1, 'payout.process', 'payout_request', '42', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-22 11:49:17'),
(359, 1, 'payout.settle', 'payout_request', '42', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR57957069\",\"amount\":\"2500.00\"}', NULL, '2026-09-22 11:49:17'),
(360, 1, 'payout.reject', 'payout_request', '43', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-22 11:49:17'),
(361, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-22 11:49:17'),
(362, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-22 11:49:17'),
(363, 1, 'lead.update_status', 'lead', '130', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-22 11:49:17'),
(364, 1, 'lead.update_status', 'lead', '130', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-22 11:49:17'),
(365, 1, 'commission.credited', 'partner_earnings', '107', '{\"leadId\":130,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-22 11:49:17'),
(366, 1, 'lead.update_status', 'lead', '131', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-22 11:49:17'),
(367, 1, 'lead.update_status', 'lead', '132', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-22 12:52:42'),
(368, 18, 'admin.login', 'admin_user', '18', NULL, NULL, '2026-09-22 12:52:43'),
(369, 1, 'lead.update_status', 'lead', '130', '{\"old_status\":\"Card Issued\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-22 12:52:44'),
(370, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-22 12:52:45'),
(371, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-22 12:52:45'),
(372, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-22 12:52:45'),
(373, 1, 'lead.update_status', 'lead', '134', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-22 12:52:45'),
(374, 1, 'payout.review', 'payout_request', '44', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-22 12:52:46'),
(375, 2, 'payout.approve', 'payout_request', '44', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-22 12:52:46'),
(376, 1, 'payout.process', 'payout_request', '44', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-22 12:52:46'),
(377, 1, 'payout.settle', 'payout_request', '44', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR61766713\",\"amount\":\"2500.00\"}', NULL, '2026-09-22 12:52:46'),
(378, 1, 'payout.reject', 'payout_request', '45', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-22 12:52:46'),
(379, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-22 12:52:46'),
(380, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-22 12:52:46'),
(381, 1, 'lead.update_status', 'lead', '135', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-22 12:52:46'),
(382, 1, 'lead.update_status', 'lead', '135', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-22 12:52:46'),
(383, 1, 'commission.credited', 'partner_earnings', '112', '{\"leadId\":135,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-22 12:52:46'),
(384, 1, 'lead.update_status', 'lead', '136', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-22 12:52:46'),
(385, 1, 'lead.update_status', 'lead', '137', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-22 14:58:34'),
(386, 19, 'admin.login', 'admin_user', '19', NULL, NULL, '2026-09-22 14:58:35'),
(387, 1, 'lead.update_status', 'lead', '135', '{\"old_status\":\"Card Issued\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-22 14:58:36'),
(388, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-22 14:58:36'),
(389, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-22 14:58:36'),
(390, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-22 14:58:36'),
(391, 1, 'lead.update_status', 'lead', '139', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-22 14:58:37'),
(392, 1, 'payout.review', 'payout_request', '46', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-22 14:58:37'),
(393, 2, 'payout.approve', 'payout_request', '46', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-22 14:58:37'),
(394, 1, 'payout.process', 'payout_request', '46', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-22 14:58:37'),
(395, 1, 'payout.settle', 'payout_request', '46', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR69317636\",\"amount\":\"2500.00\"}', NULL, '2026-09-22 14:58:37'),
(396, 1, 'payout.reject', 'payout_request', '47', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-22 14:58:37'),
(397, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-22 14:58:37'),
(398, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-22 14:58:37'),
(399, 1, 'lead.update_status', 'lead', '140', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-22 14:58:37'),
(400, 1, 'lead.update_status', 'lead', '140', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-22 14:58:37'),
(401, 1, 'commission.credited', 'partner_earnings', '117', '{\"leadId\":140,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-22 14:58:37'),
(402, 1, 'lead.update_status', 'lead', '141', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-22 14:58:37'),
(403, 1, 'lead.update_status', 'lead', '142', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-22 17:06:30'),
(404, 1, 'lead.update_status', 'lead', '144', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-22 17:18:55'),
(405, 20, 'admin.login', 'admin_user', '20', NULL, NULL, '2026-09-22 17:18:56'),
(406, 1, 'lead.update_status', 'lead', '139', '{\"old_status\":\"Approved\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-22 17:18:58'),
(407, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-22 17:18:59'),
(408, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-22 17:18:59'),
(409, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-22 17:18:59'),
(410, 1, 'lead.update_status', 'lead', '146', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-22 17:19:00'),
(411, 1, 'payout.review', 'payout_request', '48', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-22 17:19:03'),
(412, 2, 'payout.approve', 'payout_request', '48', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-22 17:19:03'),
(413, 1, 'payout.process', 'payout_request', '48', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-22 17:19:03'),
(414, 1, 'payout.settle', 'payout_request', '48', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR77743499\",\"amount\":\"2500.00\"}', NULL, '2026-09-22 17:19:03'),
(415, 1, 'payout.reject', 'payout_request', '49', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-22 17:19:03'),
(416, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-22 17:19:03'),
(417, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-22 17:19:03'),
(418, 1, 'lead.update_status', 'lead', '147', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-22 17:19:03'),
(419, 1, 'lead.update_status', 'lead', '147', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-22 17:19:03'),
(420, 1, 'commission.credited', 'partner_earnings', '122', '{\"leadId\":147,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-22 17:19:03'),
(421, 1, 'lead.update_status', 'lead', '148', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-22 17:19:04'),
(422, 1, 'lender.create', 'lender', '9', '{\"name\":\"Federal Bank\",\"code\":\"FEDERAL_BANK\"}', NULL, '2026-09-22 18:24:53'),
(423, 1, 'ticket.create', 'support_ticket', 'TKT-845', '{\"subject\":\"API verification inquiry\",\"department\":\"General\"}', NULL, '2026-09-22 18:24:53'),
(424, 1, 'lead.create', 'lead', 'FTL123550', '{\"leadCode\":\"FTL123550\",\"applicant\":\"Automated Multi-API Test User\",\"amount\":250000}', '::1', '2026-09-22 18:25:45'),
(425, 1, 'ticket.create', 'support_ticket', 'TKT-315', '{\"subject\":\"API verification inquiry\",\"department\":\"General\"}', NULL, '2026-09-22 18:25:46'),
(426, 1, 'lead.create', 'lead', 'FTL123551', '{\"leadCode\":\"FTL123551\",\"applicant\":\"Automated Multi-API Test User\",\"amount\":250000}', '::1', '2026-09-22 18:26:36'),
(427, 1, 'lender.create', 'lender', '11', '{\"name\":\"Test Bank 1790081796455\",\"code\":\"BANK_1790081796455\"}', NULL, '2026-09-22 18:26:36'),
(428, 1, 'ticket.create', 'support_ticket', 'TKT-298', '{\"subject\":\"API verification inquiry\",\"department\":\"General\"}', NULL, '2026-09-22 18:26:36'),
(429, 1, 'lead.update_status', 'lead', '152', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-22 18:27:12'),
(430, 21, 'admin.login', 'admin_user', '21', NULL, NULL, '2026-09-22 18:27:13'),
(431, 1, 'lead.update_status', 'lead', '151', '{\"old_status\":\"In Progress\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-22 18:27:14'),
(432, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-22 18:27:15'),
(433, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-22 18:27:15'),
(434, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-22 18:27:15'),
(435, 1, 'lead.update_status', 'lead', '154', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-22 18:27:15'),
(436, 1, 'payout.review', 'payout_request', '50', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-22 18:27:16'),
(437, 2, 'payout.approve', 'payout_request', '50', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-22 18:27:16'),
(438, 1, 'payout.process', 'payout_request', '50', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-22 18:27:16'),
(439, 1, 'payout.settle', 'payout_request', '50', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR81836851\",\"amount\":\"2500.00\"}', NULL, '2026-09-22 18:27:16'),
(440, 1, 'payout.reject', 'payout_request', '51', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-22 18:27:16'),
(441, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-22 18:27:16'),
(442, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-22 18:27:17'),
(443, 1, 'lead.update_status', 'lead', '155', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-22 18:27:17'),
(444, 1, 'lead.update_status', 'lead', '155', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-22 18:27:17'),
(445, 1, 'commission.credited', 'partner_earnings', '127', '{\"leadId\":155,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-22 18:27:17'),
(446, 1, 'lead.update_status', 'lead', '156', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-22 18:27:17'),
(447, 1, 'admin.login', 'admin_user', '1', NULL, NULL, '2026-09-23 11:35:43'),
(448, 1, 'admin.login', 'admin_user', '1', NULL, NULL, '2026-09-23 11:37:00'),
(449, 1, 'admin.login', 'admin_user', '1', NULL, NULL, '2026-09-23 11:53:07'),
(450, 1, 'lead.update_status', 'lead', '158', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-23 11:53:19'),
(451, 22, 'admin.login', 'admin_user', '22', NULL, NULL, '2026-09-23 11:53:20'),
(452, 1, 'lead.update_status', 'lead', '157', '{\"old_status\":\"In Progress\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-23 11:53:21'),
(453, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-23 11:53:22'),
(454, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-23 11:53:22'),
(455, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-23 11:53:22'),
(456, 1, 'lead.update_status', 'lead', '160', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-23 11:53:23'),
(457, 1, 'payout.review', 'payout_request', '52', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-23 11:53:24'),
(458, 2, 'payout.approve', 'payout_request', '52', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-23 11:53:24'),
(459, 1, 'payout.process', 'payout_request', '52', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-23 11:53:24'),
(460, 1, 'payout.settle', 'payout_request', '52', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR44604688\",\"amount\":\"2500.00\"}', NULL, '2026-09-23 11:53:24'),
(461, 1, 'payout.reject', 'payout_request', '53', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-23 11:53:24'),
(462, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-23 11:53:24'),
(463, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-23 11:53:24'),
(464, 1, 'lead.update_status', 'lead', '161', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-23 11:53:24'),
(465, 1, 'lead.update_status', 'lead', '161', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-23 11:53:24'),
(466, 1, 'commission.credited', 'partner_earnings', '132', '{\"leadId\":161,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-23 11:53:24'),
(467, 1, 'lead.update_status', 'lead', '162', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-23 11:53:25'),
(468, 1, 'lead.update_status', 'lead', '157', '{\"old_status\":\"Under Review\",\"new_status\":\"Approved\",\"stage\":\"Credit sanctioned by lending partner\"}', NULL, '2026-09-23 12:21:58'),
(469, 1, 'commission.admin_decided', 'partner_earnings', '133', '{\"leadId\":157,\"partnerId\":94,\"grossAmount\":75000,\"tdsRate\":5,\"tdsAmount\":3750,\"netCommission\":71250,\"description\":\"Standard rule rate for Business Loan\"}', NULL, '2026-09-23 12:22:11'),
(470, 1, 'lead.update_status', 'lead', '163', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-23 12:55:47'),
(471, 1, 'lead.update_status', 'lead', '163', '{\"old_status\":\"Approved\",\"new_status\":\"Disbursed\",\"stage\":\"Disbursement completed to borrower account\"}', NULL, '2026-09-23 12:56:57'),
(472, 1, 'commission.credited', 'partner_earnings', '134', '{\"leadId\":163,\"partnerId\":94,\"ruleId\":2,\"grossAmount\":10000,\"tdsRate\":5,\"tdsAmount\":500,\"netCommission\":9500}', NULL, '2026-09-23 12:56:57'),
(473, 1, 'lead.update_status', 'lead', '164', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-23 13:33:15'),
(474, 23, 'admin.login', 'admin_user', '23', NULL, NULL, '2026-09-23 13:33:16'),
(475, 1, 'lead.update_status', 'lead', '163', '{\"old_status\":\"Disbursed\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-23 13:33:17'),
(476, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-23 13:33:18'),
(477, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-23 13:33:18'),
(478, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-23 13:33:18'),
(479, 1, 'lead.update_status', 'lead', '166', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-23 13:33:18'),
(480, 1, 'payout.review', 'payout_request', '54', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-23 13:33:19'),
(481, 2, 'payout.approve', 'payout_request', '54', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-23 13:33:19'),
(482, 1, 'payout.process', 'payout_request', '54', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-23 13:33:19'),
(483, 1, 'payout.settle', 'payout_request', '54', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR50599073\",\"amount\":\"2500.00\"}', NULL, '2026-09-23 13:33:19'),
(484, 1, 'payout.reject', 'payout_request', '55', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-23 13:33:19'),
(485, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-23 13:33:19'),
(486, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-23 13:33:19'),
(487, 1, 'lead.update_status', 'lead', '167', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-23 13:33:19'),
(488, 1, 'lead.update_status', 'lead', '167', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-23 13:33:19'),
(489, 1, 'commission.credited', 'partner_earnings', '139', '{\"leadId\":167,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-23 13:33:19'),
(490, 1, 'lead.update_status', 'lead', '168', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-23 13:33:19'),
(491, 1, 'lead.update_status', 'lead', '169', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-23 13:45:51'),
(492, 24, 'admin.login', 'admin_user', '24', NULL, NULL, '2026-09-23 13:45:52'),
(493, 1, 'lead.update_status', 'lead', '167', '{\"old_status\":\"Card Issued\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-23 13:45:53'),
(494, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-23 13:45:53'),
(495, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-23 13:45:53'),
(496, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-23 13:45:53'),
(497, 1, 'lead.update_status', 'lead', '171', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-23 13:45:54'),
(498, 1, 'payout.review', 'payout_request', '56', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-23 13:45:54'),
(499, 2, 'payout.approve', 'payout_request', '56', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-23 13:45:54'),
(500, 1, 'payout.process', 'payout_request', '56', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-23 13:45:54'),
(501, 1, 'payout.settle', 'payout_request', '56', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR51354702\",\"amount\":\"2500.00\"}', NULL, '2026-09-23 13:45:54'),
(502, 1, 'payout.reject', 'payout_request', '57', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-23 13:45:54'),
(503, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-23 13:45:54'),
(504, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-23 13:45:54'),
(505, 1, 'lead.update_status', 'lead', '172', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-23 13:45:54'),
(506, 1, 'lead.update_status', 'lead', '172', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-23 13:45:54'),
(507, 1, 'commission.credited', 'partner_earnings', '144', '{\"leadId\":172,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-23 13:45:54'),
(508, 1, 'lead.update_status', 'lead', '173', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-23 13:45:54'),
(509, 1, 'lead.update_status', 'lead', '174', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-23 14:32:34'),
(510, 25, 'admin.login', 'admin_user', '25', NULL, NULL, '2026-09-23 14:32:36'),
(511, 1, 'lead.update_status', 'lead', '172', '{\"old_status\":\"Card Issued\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-23 14:32:38'),
(512, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-23 14:32:39'),
(513, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-23 14:32:39'),
(514, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-23 14:32:39'),
(515, 1, 'lead.update_status', 'lead', '176', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-23 14:32:39'),
(516, 1, 'payout.review', 'payout_request', '58', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-23 14:32:40'),
(517, 2, 'payout.approve', 'payout_request', '58', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-23 14:32:40'),
(518, 1, 'payout.process', 'payout_request', '58', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-23 14:32:40'),
(519, 1, 'payout.settle', 'payout_request', '58', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR54160860\",\"amount\":\"2500.00\"}', NULL, '2026-09-23 14:32:40'),
(520, 1, 'payout.reject', 'payout_request', '59', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-23 14:32:40'),
(521, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-23 14:32:40'),
(522, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-23 14:32:41'),
(523, 1, 'lead.update_status', 'lead', '177', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-23 14:32:41'),
(524, 1, 'lead.update_status', 'lead', '177', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-23 14:32:41'),
(525, 1, 'commission.credited', 'partner_earnings', '149', '{\"leadId\":177,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-23 14:32:41'),
(526, 1, 'lead.update_status', 'lead', '178', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-23 14:32:41'),
(527, 1, 'lead.update_status', 'lead', '179', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-23 15:33:48'),
(528, 26, 'admin.login', 'admin_user', '26', NULL, NULL, '2026-09-23 15:33:49'),
(529, 1, 'lead.update_status', 'lead', '177', '{\"old_status\":\"Card Issued\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-23 15:33:50'),
(530, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-23 15:33:50'),
(531, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-23 15:33:50'),
(532, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-23 15:33:50'),
(533, 1, 'lead.update_status', 'lead', '181', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-23 15:33:51'),
(534, 1, 'lead.update_status', 'lead', '182', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-23 15:35:56'),
(535, 27, 'admin.login', 'admin_user', '27', NULL, NULL, '2026-09-23 15:35:56'),
(536, 1, 'lead.update_status', 'lead', '181', '{\"old_status\":\"Approved\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-23 15:35:57'),
(537, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-23 15:35:58'),
(538, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-23 15:35:58'),
(539, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-23 15:35:58'),
(540, 1, 'lead.update_status', 'lead', '184', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-23 15:35:58'),
(541, 1, 'lead.update_status', 'lead', '185', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-23 15:36:49'),
(542, 28, 'admin.login', 'admin_user', '28', NULL, NULL, '2026-09-23 15:36:49'),
(543, 1, 'lead.update_status', 'lead', '184', '{\"old_status\":\"Approved\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-23 15:36:50'),
(544, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-23 15:36:50'),
(545, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-23 15:36:50'),
(546, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-23 15:36:50'),
(547, 1, 'lead.update_status', 'lead', '187', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-23 15:36:51'),
(548, 1, 'payout.review', 'payout_request', '60', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-23 15:36:51'),
(549, 2, 'payout.approve', 'payout_request', '60', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-23 15:36:51'),
(550, 1, 'payout.process', 'payout_request', '60', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-23 15:36:51'),
(551, 1, 'payout.settle', 'payout_request', '60', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR58011864\",\"amount\":\"2500.00\"}', NULL, '2026-09-23 15:36:51'),
(552, 1, 'payout.reject', 'payout_request', '61', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-23 15:36:51'),
(553, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-23 15:36:51'),
(554, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-23 15:36:51'),
(555, 1, 'lead.update_status', 'lead', '188', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-23 15:36:52'),
(556, 1, 'lead.update_status', 'lead', '188', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-23 15:36:52'),
(557, 1, 'commission.credited', 'partner_earnings', '156', '{\"leadId\":188,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-23 15:36:52'),
(558, 1, 'lead.update_status', 'lead', '189', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-23 15:36:52'),
(559, 1, 'lead.update_status', 'lead', '190', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-23 15:38:07'),
(560, 29, 'admin.login', 'admin_user', '29', NULL, NULL, '2026-09-23 15:38:07'),
(561, 1, 'lead.update_status', 'lead', '189', '{\"old_status\":\"Policy Issued\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-23 15:38:08'),
(562, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-23 15:38:08'),
(563, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-23 15:38:08'),
(564, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-23 15:38:08'),
(565, 1, 'lead.update_status', 'lead', '192', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-23 15:38:09'),
(566, 1, 'payout.review', 'payout_request', '62', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-23 15:38:10'),
(567, 2, 'payout.approve', 'payout_request', '62', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-23 15:38:10'),
(568, 1, 'payout.process', 'payout_request', '62', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-23 15:38:10'),
(569, 1, 'payout.settle', 'payout_request', '62', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR58090305\",\"amount\":\"2500.00\"}', NULL, '2026-09-23 15:38:10'),
(570, 1, 'payout.reject', 'payout_request', '63', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-23 15:38:10'),
(571, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-23 15:38:10'),
(572, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-23 15:38:10'),
(573, 1, 'lead.update_status', 'lead', '193', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-23 15:38:10'),
(574, 1, 'lead.update_status', 'lead', '193', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-23 15:38:10'),
(575, 1, 'commission.credited', 'partner_earnings', '161', '{\"leadId\":193,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-23 15:38:10'),
(576, 1, 'lead.update_status', 'lead', '194', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-23 15:38:10'),
(577, 1, 'lead.update_status', 'lead', '195', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-23 15:57:37'),
(578, 30, 'admin.login', 'admin_user', '30', NULL, NULL, '2026-09-23 15:57:38'),
(579, 1, 'lead.update_status', 'lead', '193', '{\"old_status\":\"Card Issued\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-23 15:57:39'),
(580, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-23 15:57:39'),
(581, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-23 15:57:39'),
(582, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-23 15:57:39'),
(583, 1, 'lead.update_status', 'lead', '197', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-23 15:57:40'),
(584, 1, 'payout.review', 'payout_request', '64', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-23 15:57:41'),
(585, 2, 'payout.approve', 'payout_request', '64', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-23 15:57:41'),
(586, 1, 'payout.process', 'payout_request', '64', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-23 15:57:41'),
(587, 1, 'payout.settle', 'payout_request', '64', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR59261222\",\"amount\":\"2500.00\"}', NULL, '2026-09-23 15:57:41'),
(588, 1, 'payout.reject', 'payout_request', '65', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-23 15:57:41'),
(589, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-23 15:57:41'),
(590, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-23 15:57:41'),
(591, 1, 'lead.update_status', 'lead', '198', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-23 15:57:41'),
(592, 1, 'lead.update_status', 'lead', '198', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-23 15:57:41'),
(593, 1, 'commission.credited', 'partner_earnings', '166', '{\"leadId\":198,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-23 15:57:41'),
(594, 1, 'lead.update_status', 'lead', '199', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-23 15:57:41'),
(595, 1, 'lead.update_status', 'lead', '200', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-23 18:10:00'),
(596, 31, 'admin.login', 'admin_user', '31', NULL, NULL, '2026-09-23 18:10:01'),
(597, 1, 'lead.update_status', 'lead', '198', '{\"old_status\":\"Card Issued\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-23 18:10:02'),
(598, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-23 18:10:03'),
(599, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-23 18:10:03'),
(600, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-23 18:10:03'),
(601, 1, 'lead.update_status', 'lead', '202', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-23 18:10:03'),
(602, 1, 'payout.review', 'payout_request', '66', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-23 18:10:04'),
(603, 2, 'payout.approve', 'payout_request', '66', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-23 18:10:04'),
(604, 1, 'payout.process', 'payout_request', '66', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-23 18:10:04'),
(605, 1, 'payout.settle', 'payout_request', '66', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR67204539\",\"amount\":\"2500.00\"}', NULL, '2026-09-23 18:10:04'),
(606, 1, 'payout.reject', 'payout_request', '67', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-23 18:10:04'),
(607, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-23 18:10:04'),
(608, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-23 18:10:04'),
(609, 1, 'lead.update_status', 'lead', '203', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-23 18:10:04'),
(610, 1, 'lead.update_status', 'lead', '203', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-23 18:10:04'),
(611, 1, 'commission.credited', 'partner_earnings', '171', '{\"leadId\":203,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-23 18:10:04'),
(612, 1, 'lead.update_status', 'lead', '204', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-23 18:10:04'),
(613, 1, 'lead.update_status', 'lead', '205', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction\"}', NULL, '2026-09-23 18:55:06'),
(614, 32, 'admin.login', 'admin_user', '32', NULL, NULL, '2026-09-23 18:55:08'),
(615, 1, 'lead.update_status', 'lead', '203', '{\"old_status\":\"Card Issued\",\"new_status\":\"Under Review\",\"stage\":\"Underwriting and verification\"}', NULL, '2026-09-23 18:55:10'),
(616, 1, 'settings.update', 'app_settings', 'all', '{\"min_payout_amount\":\"500\",\"support_phone\":\"1800-123-EARN\"}', NULL, '2026-09-23 18:55:10'),
(617, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-23 18:55:10'),
(618, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-23 18:55:10'),
(619, 1, 'lead.update_status', 'lead', '207', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Sanction letter generated by HDFC Bank\"}', NULL, '2026-09-23 18:55:11'),
(620, 1, 'payout.review', 'payout_request', '68', '{\"old_status\":\"REQUESTED\",\"new_status\":\"UNDER_REVIEW\"}', NULL, '2026-09-23 18:55:12'),
(621, 2, 'payout.approve', 'payout_request', '68', '{\"old_status\":\"UNDER_REVIEW\",\"new_status\":\"APPROVED\",\"approved_by\":2}', NULL, '2026-09-23 18:55:12'),
(622, 1, 'payout.process', 'payout_request', '68', '{\"old_status\":\"APPROVED\",\"new_status\":\"PROCESSING\"}', NULL, '2026-09-23 18:55:12');
INSERT INTO `audit_logs` (`id`, `admin_id`, `action`, `entity_type`, `entity_id`, `metadata`, `ip_address`, `created_at`) VALUES
(623, 1, 'payout.settle', 'payout_request', '68', '{\"old_status\":\"PROCESSING\",\"new_status\":\"PAID\",\"utr_number\":\"UTR69912781\",\"amount\":\"2500.00\"}', NULL, '2026-09-23 18:55:12'),
(624, 1, 'payout.reject', 'payout_request', '69', '{\"old_status\":\"REQUESTED\",\"new_status\":\"REJECTED\",\"reason\":\"IFSC code invalid for NEFT settlement\",\"refunded_amount\":\"1500.00\"}', NULL, '2026-09-23 18:55:12'),
(625, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"approved\",\"new_status\":\"suspended\"}', NULL, '2026-09-23 18:55:12'),
(626, 1, 'partner.toggle_status', 'partner', '1', '{\"old_status\":\"suspended\",\"new_status\":\"approved\"}', NULL, '2026-09-23 18:55:12'),
(627, 1, 'lead.update_status', 'lead', '208', '{\"old_status\":\"In Progress\",\"new_status\":\"Approved\",\"stage\":\"Card Approved\"}', NULL, '2026-09-23 18:55:13'),
(628, 1, 'lead.update_status', 'lead', '208', '{\"old_status\":\"Approved\",\"new_status\":\"Card Issued\",\"stage\":\"Card Dispatched & Issued\"}', NULL, '2026-09-23 18:55:13'),
(629, 1, 'commission.credited', 'partner_earnings', '176', '{\"leadId\":208,\"partnerId\":1,\"ruleId\":3,\"grossAmount\":200,\"tdsRate\":5,\"tdsAmount\":10,\"netCommission\":190}', NULL, '2026-09-23 18:55:13'),
(630, 1, 'lead.update_status', 'lead', '209', '{\"old_status\":\"In Progress\",\"new_status\":\"Policy Issued\",\"stage\":\"Policy Generated & Active\"}', NULL, '2026-09-23 18:55:13');

-- --------------------------------------------------------

--
-- Table structure for table `bureau_pricing`
--

CREATE TABLE `bureau_pricing` (
  `id` int(11) NOT NULL,
  `bureau` varchar(30) NOT NULL,
  `provider` varchar(30) NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 100.00,
  `gst_percentage` decimal(5,2) NOT NULL DEFAULT 18.00,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bureau_pricing`
--

INSERT INTO `bureau_pricing` (`id`, `bureau`, `provider`, `price`, `gst_percentage`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'CIBIL', 'surepass', 99.00, 18.00, 1, '2026-09-23 13:25:59', '2026-09-23 18:55:18'),
(2, 'CRIF', 'surepass', 69.00, 18.00, 1, '2026-09-23 13:25:59', '2026-09-23 14:58:32'),
(3, 'EXPERIAN', 'verifyal', 79.00, 18.00, 1, '2026-09-23 13:25:59', '2026-09-23 14:58:32'),
(4, 'EQUIFAX', 'verifyal', 79.00, 18.00, 1, '2026-09-23 13:25:59', '2026-09-23 14:58:32');

-- --------------------------------------------------------

--
-- Table structure for table `commission_rules`
--

CREATE TABLE `commission_rules` (
  `id` int(11) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `partner_type` varchar(50) NOT NULL,
  `commission_rate` varchar(50) NOT NULL,
  `tds_rate` decimal(5,2) DEFAULT 5.00,
  `gst_rate` decimal(5,2) DEFAULT 18.00,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `commission_rules`
--

INSERT INTO `commission_rules` (`id`, `product_name`, `partner_type`, `commission_rate`, `tds_rate`, `gst_rate`, `is_active`, `created_at`) VALUES
(1, 'Personal Loan', 'DSA', '1.50%', 5.00, 18.00, 1, '2026-09-19 18:05:33'),
(2, 'Business Loan', 'CA/Tax', '1.00%', 5.00, 18.00, 1, '2026-09-19 18:05:33'),
(3, 'Credit Card', 'Agent', '₹200', 5.00, 18.00, 1, '2026-09-19 18:05:33'),
(4, 'Term Insurance', 'Agent', '20%', 5.00, 18.00, 1, '2026-09-19 18:05:33'),
(5, 'Home Loan', 'DSA', '0.85%', 5.00, 18.00, 1, '2026-09-19 18:05:33'),
(6, 'Health Insurance', 'CA/Tax', '18%', 5.00, 18.00, 1, '2026-09-19 18:05:33');

-- --------------------------------------------------------

--
-- Table structure for table `credit_card_lead_details`
--

CREATE TABLE `credit_card_lead_details` (
  `id` int(11) NOT NULL,
  `lead_id` int(11) NOT NULL,
  `card_category` varchar(100) DEFAULT NULL,
  `preferred_bank` varchar(100) DEFAULT NULL,
  `employment_type` varchar(50) DEFAULT NULL,
  `monthly_income` decimal(15,2) DEFAULT NULL,
  `has_existing_card` tinyint(1) DEFAULT 0,
  `existing_card_limit` decimal(15,2) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `credit_card_lead_details`
--

INSERT INTO `credit_card_lead_details` (`id`, `lead_id`, `card_category`, `preferred_bank`, `employment_type`, `monthly_income`, `has_existing_card`, `existing_card_limit`, `created_at`) VALUES
(1, 11, 'Millennia Credit Card', 'HDFC Bank', NULL, 65000.00, 1, 100000.00, '2026-09-19 12:14:05'),
(2, 12, 'Millennia Credit Card', 'HDFC Bank', NULL, 65000.00, 1, 100000.00, '2026-09-19 12:14:46'),
(3, 13, 'Millennia Credit Card', 'HDFC Bank', NULL, 65000.00, 1, 100000.00, '2026-09-19 12:51:00'),
(4, 15, 'Millennia Credit Card', 'HDFC Bank', NULL, 65000.00, 1, 100000.00, '2026-09-19 14:34:50'),
(5, 16, 'Millennia Credit Card', 'HDFC Bank', NULL, 65000.00, 1, 100000.00, '2026-09-19 14:56:22'),
(6, 17, 'Millennia Credit Card', 'HDFC Bank', NULL, 65000.00, 1, 100000.00, '2026-09-19 15:29:31'),
(7, 30, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-20 09:12:49'),
(8, 37, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-20 09:17:31'),
(9, 42, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-20 09:58:52'),
(10, 47, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-20 11:51:10'),
(11, 50, 'Lifestyle & Rewards', NULL, 'Salaried', 90000.00, 0, NULL, '2026-09-20 11:54:15'),
(12, 53, 'Lifestyle & Rewards', NULL, 'Salaried', 90000.00, 0, NULL, '2026-09-20 11:56:42'),
(13, 56, 'Lifestyle & Rewards', NULL, 'Salaried', 90000.00, 0, NULL, '2026-09-20 11:58:58'),
(14, 59, 'Rewards', NULL, NULL, 95000.00, 0, NULL, '2026-09-20 12:15:17'),
(15, 64, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-20 12:29:05'),
(16, 69, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-21 11:20:37'),
(17, 74, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-21 12:21:33'),
(18, 82, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-21 13:22:01'),
(19, 87, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-21 13:30:00'),
(20, 93, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-21 16:21:11'),
(21, 102, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-21 16:32:11'),
(22, 107, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-21 16:33:30'),
(23, 112, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-21 17:02:45'),
(24, 117, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-21 17:03:33'),
(25, 122, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-21 18:25:36'),
(26, 124, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-22 00:39:28'),
(27, 130, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-22 11:49:17'),
(28, 135, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-22 12:52:46'),
(29, 140, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-22 14:58:37'),
(30, 147, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-22 17:19:03'),
(31, 155, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-22 18:27:17'),
(32, 161, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-23 11:53:24'),
(33, 167, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-23 13:33:19'),
(34, 172, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-23 13:45:54'),
(35, 177, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-23 14:32:41'),
(36, 188, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-23 15:36:51'),
(37, 193, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-23 15:38:10'),
(38, 198, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-23 15:57:41'),
(39, 203, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-23 18:10:04'),
(40, 208, 'Rewards', 'HDFC Bank', NULL, 95000.00, 1, 200000.00, '2026-09-23 18:55:12');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(50) NOT NULL,
  `member_count` int(11) DEFAULT 0,
  `description` varchar(255) DEFAULT NULL,
  `scope` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `code`, `member_count`, `description`, `scope`, `created_at`) VALUES
(1, 'Operations', 'OPS', 12, 'Partner verification, KYC processing, underwriting queue', 'Partner approval, KYC, applications', '2026-09-19 18:05:33'),
(2, 'Sales & Partner Growth', 'SALES', 18, 'Partner acquisition, DSA onboarding, relationship management', 'Partner growth, lead tracking', '2026-09-19 18:05:33'),
(3, 'Finance & Accounts', 'FIN', 8, 'Payout approvals, ledger reconciliation, TDS & GST filings', 'Commission, payouts, TDS, GST', '2026-09-19 18:05:33'),
(4, 'Marketing', 'MKT', 6, 'Campaign management, WhatsApp/Email templates, brand collateral', 'Campaigns, content, leads', '2026-09-19 18:05:33'),
(5, 'Technology', 'TECH', 10, 'Platform infrastructure, API integrations, security & audit', 'Platform, integrations, security', '2026-09-19 18:05:33'),
(6, 'HR & Admin', 'HR', 5, 'Internal team management, compliance, administrative support', 'Employees, payroll, attendance', '2026-09-19 18:05:33'),
(7, 'Support', 'SUP', 7, 'Partner helpdesk, ticket resolution, query escalations', 'Partner & customer support', '2026-09-19 18:05:33');

-- --------------------------------------------------------

--
-- Table structure for table `insurance_lead_details`
--

CREATE TABLE `insurance_lead_details` (
  `id` int(11) NOT NULL,
  `lead_id` int(11) NOT NULL,
  `insurance_type` varchar(100) NOT NULL,
  `sum_insured` decimal(15,2) DEFAULT NULL,
  `vehicle_number` varchar(50) DEFAULT NULL,
  `policy_term` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `insurance_lead_details`
--

INSERT INTO `insurance_lead_details` (`id`, `lead_id`, `insurance_type`, `sum_insured`, `vehicle_number`, `policy_term`, `created_at`) VALUES
(1, 31, 'Term Life', 10000000.00, NULL, '30', '2026-09-20 09:12:49'),
(2, 38, 'Term Life', 10000000.00, NULL, '30', '2026-09-20 09:17:31'),
(3, 43, 'Term Life', 10000000.00, NULL, '30', '2026-09-20 09:58:52'),
(4, 48, 'Term Life', 10000000.00, NULL, '30', '2026-09-20 11:51:11'),
(5, 51, 'Life Insurance', 10000000.00, NULL, NULL, '2026-09-20 11:54:15'),
(6, 54, 'Life Insurance', 10000000.00, NULL, NULL, '2026-09-20 11:56:42'),
(7, 57, 'Life Insurance', 10000000.00, NULL, NULL, '2026-09-20 11:58:58'),
(8, 65, 'Term Life', 10000000.00, NULL, '30', '2026-09-20 12:29:05'),
(9, 70, 'Term Life', 10000000.00, NULL, '30', '2026-09-21 11:20:37'),
(10, 75, 'Term Life', 10000000.00, NULL, '30', '2026-09-21 12:21:33'),
(11, 83, 'Term Life', 10000000.00, NULL, '30', '2026-09-21 13:22:01'),
(12, 88, 'Term Life', 10000000.00, NULL, '30', '2026-09-21 13:30:00'),
(13, 94, 'Term Life', 10000000.00, NULL, '30', '2026-09-21 16:21:11'),
(14, 103, 'Term Life', 10000000.00, NULL, '30', '2026-09-21 16:32:11'),
(15, 108, 'Term Life', 10000000.00, NULL, '30', '2026-09-21 16:33:30'),
(16, 113, 'Term Life', 10000000.00, NULL, '30', '2026-09-21 17:02:45'),
(17, 118, 'Term Life', 10000000.00, NULL, '30', '2026-09-21 17:03:33'),
(18, 123, 'Term Life', 10000000.00, NULL, '30', '2026-09-21 18:25:36'),
(19, 125, 'Term Life', 10000000.00, NULL, '30', '2026-09-22 00:39:28'),
(20, 131, 'Term Life', 10000000.00, NULL, '30', '2026-09-22 11:49:17'),
(21, 136, 'Term Life', 10000000.00, NULL, '30', '2026-09-22 12:52:46'),
(22, 141, 'Term Life', 10000000.00, NULL, '30', '2026-09-22 14:58:37'),
(23, 148, 'Term Life', 10000000.00, NULL, '30', '2026-09-22 17:19:03'),
(24, 156, 'Term Life', 10000000.00, NULL, '30', '2026-09-22 18:27:17'),
(25, 162, 'Term Life', 10000000.00, NULL, '30', '2026-09-23 11:53:25'),
(26, 168, 'Term Life', 10000000.00, NULL, '30', '2026-09-23 13:33:19'),
(27, 173, 'Term Life', 10000000.00, NULL, '30', '2026-09-23 13:45:54'),
(28, 178, 'Term Life', 10000000.00, NULL, '30', '2026-09-23 14:32:41'),
(29, 189, 'Term Life', 10000000.00, NULL, '30', '2026-09-23 15:36:52'),
(30, 194, 'Term Life', 10000000.00, NULL, '30', '2026-09-23 15:38:10'),
(31, 199, 'Term Life', 10000000.00, NULL, '30', '2026-09-23 15:57:41'),
(32, 204, 'Term Life', 10000000.00, NULL, '30', '2026-09-23 18:10:04'),
(33, 209, 'Term Life', 10000000.00, NULL, '30', '2026-09-23 18:55:13');

-- --------------------------------------------------------

--
-- Table structure for table `kyc_documents`
--

CREATE TABLE `kyc_documents` (
  `id` int(11) NOT NULL,
  `partner_id` int(11) NOT NULL,
  `doc_type` varchar(100) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `review_remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kyc_documents`
--

INSERT INTO `kyc_documents` (`id`, `partner_id`, `doc_type`, `file_path`, `original_filename`, `mime_type`, `file_size`, `status`, `created_at`, `reviewed_by`, `reviewed_at`, `review_remarks`) VALUES
(2, 25, 'pan_card', '/uploads/kyc/pan_aakash.pdf', 'pan_card.pdf', 'application/pdf', 102400, 'verified', '2026-09-20 11:54:15', NULL, NULL, NULL),
(3, 26, 'pan_card', '/uploads/kyc/pan_aakash.pdf', 'pan_card.pdf', 'application/pdf', 102400, 'verified', '2026-09-20 11:56:42', NULL, NULL, NULL),
(4, 27, 'pan_card', '/uploads/kyc/pan_aakash.pdf', 'pan_card.pdf', 'application/pdf', 102400, 'verified', '2026-09-20 11:58:57', NULL, NULL, NULL),
(5, 28, 'pan_card', '/uploads/kyc/pan_rohan.pdf', 'pan_rohan.pdf', 'application/pdf', 204800, 'approved', '2026-09-20 12:15:17', 1, '2026-09-20 12:15:17', 'Verified against NSDL portal'),
(6, 94, 'aadhaar_card', 'C:\\Users\\haree\\Downloads\\fintalk-app\\backend\\uploads\\kyc\\file-1789993886733-170955760.jpeg', 'WhatsApp Image 2026-09-21 at 14.35.13 (1).jpeg', 'image/jpeg', 118173, 'approved', '2026-09-21 18:01:26', 1, '2026-09-22 10:35:16', NULL),
(7, 94, 'pan_card', 'C:\\Users\\haree\\Downloads\\fintalk-app\\backend\\uploads\\kyc\\file-1789993886694-281285527.jpeg', 'WhatsApp Image 2026-09-20 at 14.14.25.jpeg', 'image/jpeg', 165403, 'approved', '2026-09-21 18:01:26', 1, '2026-09-22 10:34:57', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `id` int(11) NOT NULL,
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
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leads`
--

INSERT INTO `leads` (`id`, `lead_code`, `partner_id`, `product_category`, `loan_type`, `applicant_name`, `business_name`, `mobile`, `city`, `applicant_type`, `pan`, `dob_or_incorporation`, `income_or_turnover`, `loan_amount`, `status`, `current_stage`, `created_at`, `updated_at`) VALUES
(1, 'FTL123456', 1, 'Loans', 'Business Loan', 'Suresh Kumar', 'Suresh Kumar', '9876500001', 'Hyderabad', NULL, NULL, NULL, NULL, 1000000.00, 'In Progress', 'Documents under review', '2026-08-12 10:30:00', '2026-09-18 17:25:51'),
(2, 'FTL123455', 1, 'Loans', 'Business Loan', 'Lakshmi Traders', 'Lakshmi Traders', '9876500002', 'Warangal', NULL, NULL, NULL, NULL, 2500000.00, 'Disbursed', 'Disbursed', '2026-08-02 09:00:00', '2026-09-18 17:25:51'),
(3, 'FTL123454', 1, 'Loans', 'Equipment Loan', 'Venkat Reddy', NULL, '9876500003', 'Karimnagar', NULL, NULL, NULL, NULL, 1500000.00, 'Under Review', 'Credit under process', '2026-08-08 10:00:00', '2026-09-18 17:25:52'),
(4, 'FTL123453', 1, 'Loans', 'Personal Loan', 'Anita Rao', NULL, '9876500004', 'Hyderabad', NULL, NULL, NULL, NULL, 500000.00, 'Rejected', 'Closed — lender declined', '2026-08-05 09:30:00', '2026-09-18 17:25:52'),
(6, 'FTL123457', 1, 'Loans', 'Business Loan', NULL, 'Apex Industrial Solutions Pvt Ltd', '9876543210', 'Hyderabad', 'Company', 'AAACA1234K', '2018-05-20', 7500000.00, 1800000.00, 'In Progress', 'Lead submitted', '2026-09-18 18:03:16', '2026-09-18 18:03:16'),
(7, 'FTL123458', 1, 'Loans', 'Business Loan', NULL, 'Sri Balaji Logistics & Warehousing', '9123456780', 'Secunderabad', 'Proprietorship', 'BLABC5678D', '2019-11-15', 9200000.00, 3000000.00, 'In Progress', 'Lead submitted', '2026-09-18 18:11:57', '2026-09-18 18:11:57'),
(8, 'FTL123459', 1, 'Loans', 'Business Loan', NULL, 'Shri Krishna Logistics & Infra', '9876599999', 'Hyderabad', 'Company', 'SHRKR9999P', NULL, NULL, 3500000.00, 'In Progress', 'Lead submitted', '2026-09-18 20:54:24', '2026-09-18 20:54:24'),
(9, 'FTL123460', 1, 'Loans', 'Business Loan', NULL, 'Venkateshwara Solar Energy Systems', '9848012345', 'Hyderabad', 'Individual', NULL, NULL, NULL, 2500000.00, 'In Progress', 'Lead submitted', '2026-09-19 10:38:40', '2026-09-19 10:38:40'),
(10, 'FTL123461', 1, 'Loans', 'Personal Loan', 'Ramu', NULL, '8933232323', 'Guntur', 'Individual', NULL, NULL, NULL, 0.00, 'In Progress', 'Lead submitted', '2026-09-19 10:52:51', '2026-09-19 10:52:51'),
(11, 'FTL123462', 1, 'Credit Cards', 'Credit Card', 'Vikram Reddy', NULL, '9123456799', 'Hyderabad', 'Individual', NULL, NULL, NULL, 150000.00, 'Approved', 'Sanction', '2026-09-19 12:14:05', '2026-09-19 12:14:05'),
(12, 'FTL123463', 2, 'Credit Cards', 'Credit Card', 'Vikram Reddy', NULL, '9123456799', 'Hyderabad', 'Individual', NULL, NULL, NULL, 150000.00, 'Approved', 'Sanction', '2026-09-19 12:14:46', '2026-09-19 12:14:46'),
(13, 'FTL123464', 2, 'Credit Cards', 'Credit Card', 'Vikram Reddy', NULL, '9123456799', 'Hyderabad', 'Individual', NULL, NULL, NULL, 150000.00, 'Approved', 'Sanction', '2026-09-19 12:51:00', '2026-09-19 12:51:00'),
(14, 'FTL123465', 1, 'Loans', 'Personal Loan', 'Dinesh Gupta', NULL, '4543545454', 'Guntur', 'Individual', '645654654h', NULL, 54543534545.00, 5345435.00, 'In Progress', 'Lead submitted', '2026-09-19 13:11:59', '2026-09-19 15:18:36'),
(15, 'FTL123466', 2, 'Credit Cards', 'Credit Card', 'Vikram Reddy', NULL, '9123456799', 'Hyderabad', 'Individual', NULL, NULL, NULL, 150000.00, 'Approved', 'Sanction', '2026-09-19 14:34:50', '2026-09-19 14:34:50'),
(16, 'FTL123467', 2, 'Credit Cards', 'Credit Card', 'Vikram Reddy', NULL, '9123456799', 'Hyderabad', 'Individual', NULL, NULL, NULL, 150000.00, 'Approved', 'Sanction', '2026-09-19 14:56:22', '2026-09-19 14:56:22'),
(17, 'FTL123468', 2, 'Credit Cards', 'Credit Card', 'Vikram Reddy', NULL, '9123456799', 'Hyderabad', 'Individual', NULL, NULL, NULL, 150000.00, 'Under Review', 'Lead submitted', '2026-09-19 15:29:31', '2026-09-19 16:25:33'),
(24, 'FTL123469', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'In Progress', 'Lead submitted', '2026-09-19 17:33:54', '2026-09-19 17:33:54'),
(25, 'FTL123470', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Under Review', 'Lead submitted', '2026-09-19 17:35:44', '2026-09-19 17:36:56'),
(28, 'FTL123471', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-19 17:36:57', '2026-09-19 17:36:57'),
(29, 'FTL123472', 1, 'Loans', 'Personal Loan', 'tharun', NULL, '9113980103', 'hyderabad', 'Individual', NULL, '2028-06-07', 25000.00, 100000.00, 'In Progress', 'Lead submitted', '2026-09-19 18:23:10', '2026-09-19 18:23:10'),
(30, 'FTL123473', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Card Issued', 'Card Dispatched & Issued', '2026-09-20 09:12:49', '2026-09-20 09:12:49'),
(31, 'FTL123474', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-20 09:12:49', '2026-09-20 09:12:49'),
(32, 'FTL123475', 1, 'Loans', 'Business Loan', 'Customer Alpha', 'Alpha Enterprises', '9800000001', 'Hyderabad', 'Company', NULL, NULL, NULL, 500000.00, 'Under Review', 'Underwriting and verification', '2026-09-20 09:13:52', '2026-09-20 09:17:30'),
(33, 'FTL123476', 1, 'Loans', 'Personal Loan', 'Customer Beta', NULL, '9800000002', 'Bangalore', 'Individual', NULL, NULL, NULL, 300000.00, 'In Progress', 'Lead submitted', '2026-09-20 09:13:52', '2026-09-20 09:13:52'),
(36, 'FTL123477', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-20 09:17:30', '2026-09-20 09:17:30'),
(37, 'FTL123478', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Under Review', 'Underwriting and verification', '2026-09-20 09:17:31', '2026-09-20 09:58:48'),
(38, 'FTL123479', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-20 09:17:31', '2026-09-20 09:17:31'),
(41, 'FTL123480', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-20 09:58:50', '2026-09-20 09:58:50'),
(42, 'FTL123481', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Under Review', 'Underwriting and verification', '2026-09-20 09:58:52', '2026-09-20 11:51:09'),
(43, 'FTL123482', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-20 09:58:52', '2026-09-20 09:58:52'),
(46, 'FTL123483', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-20 11:51:10', '2026-09-20 11:51:10'),
(47, 'FTL123484', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Card Issued', 'Card Dispatched & Issued', '2026-09-20 11:51:10', '2026-09-20 11:51:11'),
(48, 'FTL123485', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-20 11:51:11', '2026-09-20 11:51:11'),
(49, 'FTL123486', 25, 'Loans', 'Personal Loan', 'Kavita Sundaram', NULL, '9845012345', 'Bengaluru', 'Salaried', 'FGHIJ5678K', NULL, 75000.00, 500000.00, 'In Progress', 'Lead submitted', '2026-09-20 11:54:15', '2026-09-20 11:54:15'),
(50, 'FTL123487', 25, 'Credit Cards', 'Credit Card', 'Vikram Mehta', NULL, '9845012346', 'Mumbai', 'Individual', 'KLMNO9012P', NULL, NULL, 0.00, 'In Progress', 'Lead submitted', '2026-09-20 11:54:15', '2026-09-20 11:54:15'),
(51, 'FTL123488', 25, 'Insurance', 'Term Life Insurance', 'Ananya Roy', NULL, '9845012347', 'Kolkata', 'Individual', 'PQRST3456U', NULL, NULL, 0.00, 'In Progress', 'Lead submitted', '2026-09-20 11:54:15', '2026-09-20 11:54:15'),
(52, 'FTL123489', 26, 'Loans', 'Personal Loan', 'Kavita Sundaram', NULL, '9845012345', 'Bengaluru', 'Salaried', 'FGHIJ5678K', NULL, 75000.00, 500000.00, 'In Progress', 'Lead submitted', '2026-09-20 11:56:42', '2026-09-20 11:56:42'),
(53, 'FTL123490', 26, 'Credit Cards', 'Credit Card', 'Vikram Mehta', NULL, '9845012346', 'Mumbai', 'Individual', 'KLMNO9012P', NULL, NULL, 0.00, 'In Progress', 'Lead submitted', '2026-09-20 11:56:42', '2026-09-20 11:56:42'),
(54, 'FTL123491', 26, 'Insurance', 'Term Life Insurance', 'Ananya Roy', NULL, '9845012347', 'Kolkata', 'Individual', 'PQRST3456U', NULL, NULL, 0.00, 'Rejected', 'Application does not meet credit policy', '2026-09-20 11:56:42', '2026-09-21 13:28:52'),
(55, 'FTL123492', 27, 'Loans', 'Personal Loan', 'Kavita Sundaram', NULL, '9845012345', 'Bengaluru', 'Salaried', 'FGHIJ5678K', NULL, 75000.00, 500000.00, 'Disbursed', 'Disbursal', '2026-09-20 11:58:58', '2026-09-20 11:58:58'),
(56, 'FTL123493', 27, 'Credit Cards', 'Credit Card', 'Vikram Mehta', NULL, '9845012346', 'Mumbai', 'Individual', 'KLMNO9012P', NULL, NULL, 0.00, 'In Progress', 'Lead submitted', '2026-09-20 11:58:58', '2026-09-20 11:58:58'),
(57, 'FTL123494', 27, 'Insurance', 'Term Life Insurance', 'Ananya Roy', NULL, '9845012347', 'Kolkata', 'Individual', 'PQRST3456U', NULL, NULL, 0.00, 'In Progress', 'Lead submitted', '2026-09-20 11:58:58', '2026-09-20 11:58:58'),
(58, 'FTL123495', 28, 'Loans', 'Personal Loan', 'Meera Iyer', NULL, '9123456789', 'Hyderabad', 'Individual', NULL, NULL, NULL, 1000000.00, 'Under Review', 'Underwriting and verification', '2026-09-20 12:15:17', '2026-09-20 12:29:00'),
(59, 'FTL123496', 28, 'Credit Cards', 'Credit Card', 'Sanjay Nair', NULL, '9123456790', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Card Issued', 'Card Dispatched & Issued', '2026-09-20 12:15:17', '2026-09-20 12:15:17'),
(60, 'FTL123497', 28, 'Loans', 'Unlisted Exotic Yacht Loan', 'Vikram Birla', NULL, '9123456791', 'Mumbai', 'Individual', NULL, NULL, NULL, 5000000.00, 'Disbursed', 'Disbursal', '2026-09-20 12:15:17', '2026-09-20 12:15:17'),
(63, 'FTL123498', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-20 12:29:03', '2026-09-20 12:29:03'),
(64, 'FTL123499', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Under Review', 'Underwriting and verification', '2026-09-20 12:29:05', '2026-09-21 11:20:35'),
(65, 'FTL123500', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-20 12:29:05', '2026-09-20 12:29:05'),
(68, 'FTL123501', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-21 11:20:36', '2026-09-21 11:20:36'),
(69, 'FTL123502', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Card Issued', 'Underwriting and verification', '2026-09-21 11:20:37', '2026-09-21 12:28:21'),
(70, 'FTL123503', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-21 11:20:37', '2026-09-21 11:20:37'),
(73, 'FTL123504', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-21 12:21:32', '2026-09-21 12:21:32'),
(74, 'FTL123505', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Under Review', 'Underwriting and verification', '2026-09-21 12:21:33', '2026-09-21 13:21:58'),
(75, 'FTL123506', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-21 12:21:33', '2026-09-21 12:21:33'),
(81, 'FTL123507', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-21 13:22:00', '2026-09-21 13:22:00'),
(82, 'FTL123508', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Under Review', 'Underwriting and verification', '2026-09-21 13:22:01', '2026-09-21 13:29:59'),
(83, 'FTL123509', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-21 13:22:01', '2026-09-21 13:22:01'),
(86, 'FTL123510', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-21 13:29:59', '2026-09-21 13:29:59'),
(87, 'FTL123511', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Card Issued', 'Card Dispatched & Issued', '2026-09-21 13:30:00', '2026-09-21 13:30:00'),
(88, 'FTL123512', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-21 13:30:00', '2026-09-21 13:30:00'),
(89, 'FTL123513', 1, 'Loans', 'Home Loan', 'gjgghfhfhf', NULL, '9999999999', 'Hyderabad', 'Individual', NULL, NULL, NULL, 5000000.00, 'Under Review', 'Underwriting and verification', '2026-09-21 14:38:10', '2026-09-21 16:21:09'),
(92, 'FTL123514', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-21 16:21:10', '2026-09-21 16:21:10'),
(93, 'FTL123515', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Card Issued', 'Card Dispatched & Issued', '2026-09-21 16:21:11', '2026-09-21 16:21:11'),
(94, 'FTL123516', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-21 16:21:11', '2026-09-21 16:21:11'),
(95, 'FTL123517', 1, 'Loans', 'Business Loan', 'Customer Alpha', 'Alpha Enterprises', '9800000001', 'Hyderabad', 'Company', NULL, NULL, NULL, 500000.00, 'Under Review', 'Underwriting and verification', '2026-09-21 16:27:52', '2026-09-21 16:32:05'),
(96, 'FTL123518', 1, 'Loans', 'Personal Loan', 'Customer Beta', NULL, '9800000002', 'Bangalore', 'Individual', NULL, NULL, NULL, 300000.00, 'In Progress', 'Lead submitted', '2026-09-21 16:27:52', '2026-09-21 16:27:52'),
(101, 'FTL123519', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-21 16:32:08', '2026-09-21 16:32:08'),
(102, 'FTL123520', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Under Review', 'Underwriting and verification', '2026-09-21 16:32:11', '2026-09-21 16:33:28'),
(103, 'FTL123521', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-21 16:32:11', '2026-09-21 16:32:11'),
(106, 'FTL123522', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-21 16:33:29', '2026-09-21 16:33:29'),
(107, 'FTL123523', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Under Review', 'Underwriting and verification', '2026-09-21 16:33:30', '2026-09-21 17:02:42'),
(108, 'FTL123524', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-21 16:33:30', '2026-09-21 16:33:30'),
(111, 'FTL123525', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-21 17:02:44', '2026-09-21 17:02:44'),
(112, 'FTL123526', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Under Review', 'Underwriting and verification', '2026-09-21 17:02:45', '2026-09-21 17:03:32'),
(113, 'FTL123527', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-21 17:02:45', '2026-09-21 17:02:45'),
(116, 'FTL123528', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-21 17:03:32', '2026-09-21 17:03:32'),
(117, 'FTL123529', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Under Review', 'Underwriting and verification', '2026-09-21 17:03:33', '2026-09-21 18:25:34'),
(118, 'FTL123530', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-21 17:03:33', '2026-09-21 17:03:33'),
(121, 'FTL123531', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-21 18:25:35', '2026-09-21 18:25:35'),
(122, 'FTL123532', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Card Issued', 'Card Dispatched & Issued', '2026-09-21 18:25:36', '2026-09-21 18:25:36'),
(123, 'FTL123533', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-21 18:25:36', '2026-09-21 18:25:36'),
(124, 'FTL123534', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Card Issued', 'Card Dispatched & Issued', '2026-09-22 00:39:28', '2026-09-22 00:39:28'),
(125, 'FTL123535', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-22 00:39:28', '2026-09-22 00:39:28'),
(126, 'FTL123536', 1, 'Loans', 'Personal Loan', 'Vijay Kumar 5987', NULL, '9836084790', 'Hyderabad', 'Individual', NULL, NULL, NULL, 350000.00, 'Under Review', 'Underwriting and verification', '2026-09-22 00:41:35', '2026-09-22 11:49:14'),
(129, 'FTL123537', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-22 11:49:15', '2026-09-22 11:49:15'),
(130, 'FTL123538', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Under Review', 'Underwriting and verification', '2026-09-22 11:49:17', '2026-09-22 12:52:44'),
(131, 'FTL123539', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-22 11:49:17', '2026-09-22 11:49:17'),
(134, 'FTL123540', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-22 12:52:45', '2026-09-22 12:52:45'),
(135, 'FTL123541', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Under Review', 'Underwriting and verification', '2026-09-22 12:52:46', '2026-09-22 14:58:36'),
(136, 'FTL123542', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-22 12:52:46', '2026-09-22 12:52:46'),
(139, 'FTL123543', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Under Review', 'Underwriting and verification', '2026-09-22 14:58:37', '2026-09-22 17:18:58'),
(140, 'FTL123544', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Card Issued', 'Card Dispatched & Issued', '2026-09-22 14:58:37', '2026-09-22 14:58:37'),
(141, 'FTL123545', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-22 14:58:37', '2026-09-22 14:58:37'),
(146, 'FTL123546', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-22 17:19:00', '2026-09-22 17:19:00'),
(147, 'FTL123547', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Card Issued', 'Card Dispatched & Issued', '2026-09-22 17:19:03', '2026-09-22 17:19:03'),
(148, 'FTL123548', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-22 17:19:03', '2026-09-22 17:19:03'),
(149, 'FTL123549', 1, 'Loans', 'Personal Loan', 'Automated Multi-API Test User', NULL, '9888877777', 'Hyderabad', 'Individual', NULL, NULL, NULL, 250000.00, 'In Progress', 'Lead submitted', '2026-09-22 18:24:53', '2026-09-22 18:24:53'),
(150, 'FTL123550', 1, 'Loans', 'Personal Loan', 'Automated Multi-API Test User', NULL, '9888877777', 'Hyderabad', 'Individual', NULL, NULL, NULL, 250000.00, 'In Progress', 'Lead submitted', '2026-09-22 18:25:45', '2026-09-22 18:25:45'),
(151, 'FTL123551', 1, 'Loans', 'Personal Loan', 'Automated Multi-API Test User', NULL, '9819387516', 'Hyderabad', 'Individual', NULL, NULL, NULL, 250000.00, 'Under Review', 'Underwriting and verification', '2026-09-22 18:26:36', '2026-09-22 18:27:14'),
(154, 'FTL123552', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-22 18:27:15', '2026-09-22 18:27:15'),
(155, 'FTL123553', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Card Issued', 'Card Dispatched & Issued', '2026-09-22 18:27:17', '2026-09-22 18:27:17'),
(156, 'FTL123554', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-22 18:27:17', '2026-09-22 18:27:17'),
(157, 'FTL123555', 94, 'Loans', 'Business Loan', NULL, 'Harish Raj', '9888888888', 'GUNTUR', 'Company', NULL, NULL, NULL, 7500000.00, 'Approved', 'Credit sanctioned by lending partner', '2026-09-23 11:05:35', '2026-09-23 12:21:58'),
(160, 'FTL123556', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-23 11:53:22', '2026-09-23 11:53:23'),
(161, 'FTL123557', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Card Issued', 'Card Dispatched & Issued', '2026-09-23 11:53:24', '2026-09-23 11:53:24'),
(162, 'FTL123558', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-23 11:53:25', '2026-09-23 11:53:25'),
(163, 'FTL123559', 94, 'Loans', 'Business Loan', NULL, 'THAMMISETTY SIMHADRI', '7456546546', 'Hyderabad', 'Company', NULL, NULL, NULL, 1000000.00, 'Under Review', 'Underwriting and verification', '2026-09-23 12:55:15', '2026-09-23 13:33:17'),
(166, 'FTL123560', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-23 13:33:18', '2026-09-23 13:33:18'),
(167, 'FTL123561', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Under Review', 'Underwriting and verification', '2026-09-23 13:33:19', '2026-09-23 13:45:53'),
(168, 'FTL123562', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-23 13:33:19', '2026-09-23 13:33:19'),
(171, 'FTL123563', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-23 13:45:53', '2026-09-23 13:45:54'),
(172, 'FTL123564', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Under Review', 'Underwriting and verification', '2026-09-23 13:45:54', '2026-09-23 14:32:38'),
(173, 'FTL123565', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-23 13:45:54', '2026-09-23 13:45:54'),
(176, 'FTL123566', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-23 14:32:39', '2026-09-23 14:32:39'),
(177, 'FTL123567', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Under Review', 'Underwriting and verification', '2026-09-23 14:32:41', '2026-09-23 15:33:50'),
(178, 'FTL123568', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-23 14:32:41', '2026-09-23 14:32:41'),
(181, 'FTL123569', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Under Review', 'Underwriting and verification', '2026-09-23 15:33:51', '2026-09-23 15:35:57'),
(184, 'FTL123570', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Under Review', 'Underwriting and verification', '2026-09-23 15:35:58', '2026-09-23 15:36:50'),
(187, 'FTL123571', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-23 15:36:51', '2026-09-23 15:36:51'),
(188, 'FTL123572', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Card Issued', 'Card Dispatched & Issued', '2026-09-23 15:36:51', '2026-09-23 15:36:52'),
(189, 'FTL123573', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Under Review', 'Underwriting and verification', '2026-09-23 15:36:52', '2026-09-23 15:38:08'),
(192, 'FTL123574', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-23 15:38:09', '2026-09-23 15:38:09'),
(193, 'FTL123575', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Under Review', 'Underwriting and verification', '2026-09-23 15:38:10', '2026-09-23 15:57:39'),
(194, 'FTL123576', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-23 15:38:10', '2026-09-23 15:38:10'),
(197, 'FTL123577', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-23 15:57:40', '2026-09-23 15:57:40'),
(198, 'FTL123578', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Under Review', 'Underwriting and verification', '2026-09-23 15:57:41', '2026-09-23 18:10:02'),
(199, 'FTL123579', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-23 15:57:41', '2026-09-23 15:57:41'),
(202, 'FTL123580', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-23 18:10:03', '2026-09-23 18:10:03'),
(203, 'FTL123581', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Under Review', 'Underwriting and verification', '2026-09-23 18:10:04', '2026-09-23 18:55:10'),
(204, 'FTL123582', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-23 18:10:04', '2026-09-23 18:10:04'),
(207, 'FTL123583', 1, 'Loans', 'Personal Loan', 'Vikramaditya Verma', NULL, '9988776655', 'Pune', 'Salaried', 'ABCDE1234F', NULL, NULL, 750000.00, 'Approved', 'Sanction letter generated by HDFC Bank', '2026-09-23 18:55:11', '2026-09-23 18:55:11'),
(208, 'FTL123584', 1, 'Credit Cards', 'Credit Card', 'Pooja Hegde', NULL, '9888877771', 'Bengaluru', 'Individual', NULL, NULL, NULL, 0.00, 'Card Issued', 'Card Dispatched & Issued', '2026-09-23 18:55:12', '2026-09-23 18:55:13'),
(209, 'FTL123585', 1, 'Insurance', 'Term Insurance', 'Vikram Malhotra', NULL, '9777766662', 'Mumbai', 'Individual', NULL, NULL, NULL, 0.00, 'Policy Issued', 'Policy Generated & Active', '2026-09-23 18:55:13', '2026-09-23 18:55:13');

-- --------------------------------------------------------

--
-- Table structure for table `lead_documents`
--

CREATE TABLE `lead_documents` (
  `id` int(11) NOT NULL,
  `lead_id` int(11) NOT NULL,
  `document_type` varchar(100) NOT NULL,
  `original_file_name` varchar(255) DEFAULT NULL,
  `stored_file_name` varchar(255) DEFAULT NULL,
  `storage_path` varchar(500) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lead_status_history`
--

CREATE TABLE `lead_status_history` (
  `id` int(11) NOT NULL,
  `lead_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL,
  `stage` varchar(100) NOT NULL,
  `note` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lead_status_history`
--

INSERT INTO `lead_status_history` (`id`, `lead_id`, `status`, `stage`, `note`, `created_at`) VALUES
(1, 1, 'In Progress', 'Lead submitted', 'Lead submitted via partner portal', '2026-08-12 10:30:00'),
(2, 1, 'In Progress', 'Documents under review', 'Financial documents being validated', '2026-08-12 11:15:00'),
(3, 2, 'In Progress', 'Lead submitted', 'Initial submission', '2026-08-02 09:00:00'),
(4, 2, 'In Progress', 'Documents verified', 'KYC and GST verified', '2026-08-04 11:00:00'),
(5, 2, 'In Progress', 'Sent to lender', 'Sent to partner NBFC', '2026-08-05 14:00:00'),
(6, 2, 'Sanctioned', 'Sanctioned', 'Loan sanctioned at 11.5% ROI', '2026-08-08 16:00:00'),
(7, 2, 'Disbursed', 'Disbursed', 'Funds credited to borrower account', '2026-08-10 12:00:00'),
(8, 3, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-08-08 10:00:00'),
(9, 3, 'In Progress', 'Documents verified', 'Quotation verified', '2026-08-09 11:30:00'),
(10, 3, 'Under Review', 'Credit under process', 'Credit assessment in progress', '2026-08-09 15:00:00'),
(11, 4, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-08-05 09:30:00'),
(12, 4, 'In Progress', 'Sent to lender', 'Shared with lender credit team', '2026-08-06 11:00:00'),
(13, 4, 'Rejected', 'Closed — lender declined', 'CIBIL score below policy threshold', '2026-08-07 14:00:00'),
(15, 6, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-18 18:03:16'),
(16, 7, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-18 18:11:57'),
(17, 8, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-18 20:54:25'),
(18, 9, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-19 10:38:40'),
(19, 10, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-19 10:52:51'),
(20, 11, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-19 12:14:05'),
(21, 11, 'Approved', 'Sanction', 'Verified with lender by Admin', '2026-09-19 12:14:05'),
(22, 12, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-19 12:14:46'),
(23, 12, 'Approved', 'Sanction', 'Verified with lender by Admin', '2026-09-19 12:14:46'),
(24, 13, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-19 12:51:00'),
(25, 13, 'Approved', 'Sanction', 'Verified with lender by Admin', '2026-09-19 12:51:00'),
(26, 14, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-19 13:11:59'),
(27, 15, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-19 14:34:50'),
(28, 15, 'Approved', 'Sanction', 'Verified with lender by Admin', '2026-09-19 14:34:50'),
(29, 16, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-19 14:56:22'),
(30, 16, 'Approved', 'Sanction', 'Verified with lender by Admin', '2026-09-19 14:56:22'),
(31, 17, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-19 15:29:31'),
(32, 17, 'Approved', 'Sanction', 'Verified with lender by Admin', '2026-09-19 15:29:31'),
(39, 17, 'Under Review', 'Lead submitted', 'Status updated to Under Review by admin (ID: 1)', '2026-09-19 16:25:12'),
(40, 17, 'Under Review', 'Lead submitted', 'Status updated to Under Review by admin (ID: 1)', '2026-09-19 16:25:33'),
(44, 24, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-19 17:33:54'),
(45, 25, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-19 17:35:44'),
(46, 25, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-19 17:35:45'),
(50, 25, 'Under Review', 'Lead submitted', 'Status updated to Under Review by admin (ID: 1)', '2026-09-19 17:36:56'),
(51, 28, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-19 17:36:57'),
(52, 28, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-19 17:36:57'),
(53, 29, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-19 18:23:10'),
(54, 30, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 09:12:49'),
(55, 30, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-20 09:12:49'),
(56, 30, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-20 09:12:49'),
(57, 31, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 09:12:49'),
(58, 31, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-20 09:12:49'),
(59, 32, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 09:13:52'),
(60, 33, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 09:13:52'),
(64, 32, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-20 09:17:30'),
(65, 36, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 09:17:30'),
(66, 36, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-20 09:17:30'),
(67, 37, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 09:17:31'),
(68, 37, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-20 09:17:31'),
(69, 37, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-20 09:17:31'),
(70, 38, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 09:17:31'),
(71, 38, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-20 09:17:31'),
(75, 37, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-20 09:58:48'),
(76, 41, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 09:58:50'),
(77, 41, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-20 09:58:50'),
(78, 42, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 09:58:52'),
(79, 42, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-20 09:58:52'),
(80, 42, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-20 09:58:52'),
(81, 43, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 09:58:52'),
(82, 43, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-20 09:58:52'),
(86, 42, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-20 11:51:09'),
(87, 46, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 11:51:10'),
(88, 46, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-20 11:51:10'),
(89, 47, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 11:51:10'),
(90, 47, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-20 11:51:11'),
(91, 47, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-20 11:51:11'),
(92, 48, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 11:51:11'),
(93, 48, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-20 11:51:11'),
(94, 49, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 11:54:15'),
(95, 50, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 11:54:15'),
(96, 51, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 11:54:15'),
(97, 52, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 11:56:42'),
(98, 53, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 11:56:42'),
(99, 54, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 11:56:42'),
(100, 55, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 11:58:58'),
(101, 56, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 11:58:58'),
(102, 57, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 11:58:58'),
(103, 55, 'Disbursed', 'Disbursal', 'Disbursed by HDFC Bank', '2026-09-20 11:58:58'),
(104, 58, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 12:15:17'),
(105, 58, 'Disbursed', 'Disbursal', 'Disbursed by HDFC Bank', '2026-09-20 12:15:17'),
(106, 59, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 12:15:17'),
(107, 59, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-20 12:15:17'),
(108, 60, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 12:15:17'),
(109, 60, 'Disbursed', 'Disbursal', 'Status updated to Disbursed by admin (ID: 1)', '2026-09-20 12:15:17'),
(113, 58, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-20 12:29:00'),
(114, 63, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 12:29:03'),
(115, 63, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-20 12:29:03'),
(116, 64, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 12:29:05'),
(117, 64, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-20 12:29:05'),
(118, 64, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-20 12:29:05'),
(119, 65, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-20 12:29:05'),
(120, 65, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-20 12:29:05'),
(124, 64, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-21 11:20:35'),
(125, 68, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 11:20:36'),
(126, 68, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-21 11:20:36'),
(127, 69, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 11:20:37'),
(128, 69, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-21 11:20:37'),
(129, 69, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-21 11:20:37'),
(130, 70, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 11:20:37'),
(131, 70, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-21 11:20:37'),
(132, 69, 'Underwriting', 'Lead submitted', 'Status updated to Underwriting by admin (ID: 1)', '2026-09-21 12:19:10'),
(133, 69, 'Underwriting', 'Lead submitted', 'Status updated to Underwriting by admin (ID: 1)', '2026-09-21 12:20:18'),
(137, 69, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-21 12:21:31'),
(138, 73, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 12:21:32'),
(139, 73, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-21 12:21:32'),
(140, 74, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 12:21:33'),
(141, 74, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-21 12:21:33'),
(142, 74, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-21 12:21:33'),
(143, 75, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 12:21:33'),
(144, 75, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-21 12:21:33'),
(151, 74, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-21 13:21:58'),
(152, 81, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 13:22:00'),
(153, 81, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-21 13:22:00'),
(154, 82, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 13:22:01'),
(155, 82, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-21 13:22:01'),
(156, 82, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-21 13:22:01'),
(157, 83, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 13:22:01'),
(158, 83, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-21 13:22:01'),
(159, 54, 'Approved', 'Underwriting approved by insurance partner', 'Updated to Approved via rapid pipeline action', '2026-09-21 13:28:43'),
(160, 54, 'Policy Issued', 'Policy schedule generated and issued', 'Updated to Policy Issued via rapid pipeline action', '2026-09-21 13:28:46'),
(161, 54, 'Rejected', 'Application does not meet credit policy', 'Updated to Rejected via rapid pipeline action', '2026-09-21 13:28:52'),
(165, 82, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-21 13:29:59'),
(166, 86, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 13:29:59'),
(167, 86, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-21 13:29:59'),
(168, 87, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 13:30:00'),
(169, 87, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-21 13:30:00'),
(170, 87, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-21 13:30:00'),
(171, 88, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 13:30:00'),
(172, 88, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-21 13:30:00'),
(173, 89, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 14:38:10'),
(177, 89, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-21 16:21:09'),
(178, 92, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 16:21:10'),
(179, 92, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-21 16:21:10'),
(180, 93, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 16:21:11'),
(181, 93, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-21 16:21:11'),
(182, 93, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-21 16:21:11'),
(183, 94, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 16:21:11'),
(184, 94, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-21 16:21:11'),
(185, 95, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 16:27:52'),
(186, 96, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 16:27:52'),
(187, 95, 'Approved', 'Sanction', 'Cross-POV test: Admin approving Lead A', '2026-09-21 16:27:55'),
(194, 95, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-21 16:32:05'),
(195, 101, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 16:32:08'),
(196, 101, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-21 16:32:08'),
(197, 102, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 16:32:11'),
(198, 102, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-21 16:32:11'),
(199, 102, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-21 16:32:11'),
(200, 103, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 16:32:11'),
(201, 103, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-21 16:32:11'),
(205, 102, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-21 16:33:28'),
(206, 106, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 16:33:29'),
(207, 106, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-21 16:33:29'),
(208, 107, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 16:33:30'),
(209, 107, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-21 16:33:30'),
(210, 107, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-21 16:33:30'),
(211, 108, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 16:33:30'),
(212, 108, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-21 16:33:30'),
(216, 107, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-21 17:02:42'),
(217, 111, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 17:02:44'),
(218, 111, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-21 17:02:44'),
(219, 112, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 17:02:45'),
(220, 112, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-21 17:02:45'),
(221, 112, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-21 17:02:45'),
(222, 113, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 17:02:45'),
(223, 113, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-21 17:02:45'),
(227, 112, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-21 17:03:32'),
(228, 116, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 17:03:32'),
(229, 116, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-21 17:03:33'),
(230, 117, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 17:03:33'),
(231, 117, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-21 17:03:33'),
(232, 117, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-21 17:03:33'),
(233, 118, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 17:03:33'),
(234, 118, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-21 17:03:33'),
(238, 117, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-21 18:25:34'),
(239, 121, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 18:25:35'),
(240, 121, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-21 18:25:35'),
(241, 122, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 18:25:36'),
(242, 122, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-21 18:25:36'),
(243, 122, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-21 18:25:36'),
(244, 123, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-21 18:25:36'),
(245, 123, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-21 18:25:36'),
(246, 124, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-22 00:39:28'),
(247, 124, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-22 00:39:28'),
(248, 124, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-22 00:39:28'),
(249, 125, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-22 00:39:28'),
(250, 125, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-22 00:39:28'),
(251, 126, 'In Progress', 'Lead submitted', 'Initial submission by partner', '2026-09-22 00:41:35'),
(252, 126, 'Approved', 'Sanction letter issued by lender', 'Credit approved by Super Admin at 12:41:36 am', '2026-09-22 00:41:36'),
(256, 126, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-22 11:49:14'),
(257, 129, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-22 11:49:15'),
(258, 129, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-22 11:49:15'),
(259, 130, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-22 11:49:17'),
(260, 130, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-22 11:49:17'),
(261, 130, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-22 11:49:17'),
(262, 131, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-22 11:49:17'),
(263, 131, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-22 11:49:17'),
(267, 130, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-22 12:52:44'),
(268, 134, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-22 12:52:45'),
(269, 134, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-22 12:52:45'),
(270, 135, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-22 12:52:46'),
(271, 135, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-22 12:52:46'),
(272, 135, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-22 12:52:46'),
(273, 136, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-22 12:52:46'),
(274, 136, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-22 12:52:46'),
(278, 135, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-22 14:58:36'),
(279, 139, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-22 14:58:37'),
(280, 139, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-22 14:58:37'),
(281, 140, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-22 14:58:37'),
(282, 140, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-22 14:58:37'),
(283, 140, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-22 14:58:37'),
(284, 141, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-22 14:58:37'),
(285, 141, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-22 14:58:37'),
(292, 139, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-22 17:18:58'),
(293, 146, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-22 17:19:00'),
(294, 146, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-22 17:19:00'),
(295, 147, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-22 17:19:03'),
(296, 147, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-22 17:19:03'),
(297, 147, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-22 17:19:03'),
(298, 148, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-22 17:19:03'),
(299, 148, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-22 17:19:03'),
(300, 149, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-22 18:24:53'),
(301, 150, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-22 18:25:45'),
(302, 151, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-22 18:26:36'),
(306, 151, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-22 18:27:14'),
(307, 154, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-22 18:27:15'),
(308, 154, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-22 18:27:15'),
(309, 155, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-22 18:27:17'),
(310, 155, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-22 18:27:17'),
(311, 155, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-22 18:27:17'),
(312, 156, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-22 18:27:17'),
(313, 156, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-22 18:27:17'),
(314, 157, 'In Progress', 'Lead submitted', 'Model: Referral Model (You Refer, We Process) | Expected Earning: ₹150000', '2026-09-23 11:05:35'),
(318, 157, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-23 11:53:21'),
(319, 160, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 11:53:22'),
(320, 160, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-23 11:53:23'),
(321, 161, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 11:53:24'),
(322, 161, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-23 11:53:24'),
(323, 161, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-23 11:53:24'),
(324, 162, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 11:53:25'),
(325, 162, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-23 11:53:25'),
(326, 157, 'Approved', 'Credit sanctioned by lending partner', 'Updated to Approved via rapid pipeline action', '2026-09-23 12:21:58'),
(327, 163, 'In Progress', 'Lead submitted', 'Model: Referral Model (You Refer, We Process) | Expected Earning: ₹12500', '2026-09-23 12:55:15'),
(328, 163, 'Approved', 'Sanction', 'Updated to Approved from Loans Hub', '2026-09-23 12:55:47'),
(329, 163, 'Disbursed', 'Disbursement completed to borrower account', 'Updated to Disbursed via rapid pipeline action', '2026-09-23 12:56:57'),
(333, 163, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-23 13:33:17'),
(334, 166, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 13:33:18'),
(335, 166, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-23 13:33:18'),
(336, 167, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 13:33:19'),
(337, 167, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-23 13:33:19'),
(338, 167, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-23 13:33:19'),
(339, 168, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 13:33:19'),
(340, 168, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-23 13:33:19'),
(344, 167, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-23 13:45:53'),
(345, 171, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 13:45:53'),
(346, 171, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-23 13:45:54'),
(347, 172, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 13:45:54'),
(348, 172, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-23 13:45:54'),
(349, 172, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-23 13:45:54'),
(350, 173, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 13:45:54'),
(351, 173, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-23 13:45:54'),
(355, 172, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-23 14:32:38'),
(356, 176, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 14:32:39'),
(357, 176, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-23 14:32:39'),
(358, 177, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 14:32:41'),
(359, 177, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-23 14:32:41'),
(360, 177, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-23 14:32:41'),
(361, 178, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 14:32:41'),
(362, 178, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-23 14:32:41'),
(366, 177, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-23 15:33:50'),
(367, 181, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 15:33:51'),
(368, 181, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-23 15:33:51'),
(372, 181, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-23 15:35:57'),
(373, 184, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 15:35:58'),
(374, 184, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-23 15:35:58'),
(378, 184, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-23 15:36:50'),
(379, 187, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 15:36:51'),
(380, 187, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-23 15:36:51'),
(381, 188, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 15:36:51'),
(382, 188, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-23 15:36:52'),
(383, 188, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-23 15:36:52'),
(384, 189, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 15:36:52'),
(385, 189, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-23 15:36:52'),
(389, 189, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-23 15:38:08'),
(390, 192, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 15:38:09'),
(391, 192, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-23 15:38:09'),
(392, 193, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 15:38:10'),
(393, 193, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-23 15:38:10'),
(394, 193, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-23 15:38:10'),
(395, 194, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 15:38:10'),
(396, 194, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-23 15:38:10'),
(400, 193, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-23 15:57:39'),
(401, 197, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 15:57:40'),
(402, 197, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-23 15:57:40'),
(403, 198, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 15:57:41'),
(404, 198, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-23 15:57:41'),
(405, 198, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-23 15:57:41'),
(406, 199, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 15:57:41'),
(407, 199, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-23 15:57:41'),
(411, 198, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-23 18:10:02'),
(412, 202, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 18:10:03'),
(413, 202, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-23 18:10:03'),
(414, 203, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 18:10:04'),
(415, 203, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-23 18:10:04'),
(416, 203, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-23 18:10:04'),
(417, 204, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 18:10:04'),
(418, 204, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-23 18:10:04'),
(422, 203, 'Under Review', 'Underwriting and verification', 'Status updated to Under Review by admin (ID: 1)', '2026-09-23 18:55:10'),
(423, 207, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 18:55:11'),
(424, 207, 'Approved', 'Sanction letter generated by HDFC Bank', 'Verified 3 years ITR, approved at 10.75% ROI with zero processing fee.', '2026-09-23 18:55:11'),
(425, 208, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 18:55:12'),
(426, 208, 'Approved', 'Card Approved', 'Status updated to Approved by admin (ID: 1)', '2026-09-23 18:55:13'),
(427, 208, 'Card Issued', 'Card Dispatched & Issued', 'Status updated to Card Issued by admin (ID: 1)', '2026-09-23 18:55:13'),
(428, 209, 'In Progress', 'Lead submitted', 'Lead submitted', '2026-09-23 18:55:13'),
(429, 209, 'Policy Issued', 'Policy Generated & Active', 'Status updated to Policy Issued by admin (ID: 1)', '2026-09-23 18:55:13');

-- --------------------------------------------------------

--
-- Table structure for table `lenders`
--

CREATE TABLE `lenders` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `code` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lenders`
--

INSERT INTO `lenders` (`id`, `name`, `category`, `code`, `is_active`, `created_at`) VALUES
(1, 'HDFC Bank', 'Private Bank', 'HDFC', 1, '2026-09-19 18:05:33'),
(2, 'ICICI Bank', 'Private Bank', 'ICICI', 1, '2026-09-19 18:05:33'),
(3, 'State Bank of India', 'Public Bank', 'SBI', 1, '2026-09-19 18:05:33'),
(4, 'Axis Bank', 'Private Bank', 'AXIS', 1, '2026-09-19 18:05:33'),
(5, 'Bajaj Finserv', 'NBFC', 'BAJAJ', 1, '2026-09-19 18:05:33'),
(6, 'Tata Capital', 'NBFC', 'TATA', 1, '2026-09-19 18:05:33'),
(7, 'HDFC ERGO', 'General Insurance', 'HDFCERGO', 1, '2026-09-19 18:05:33'),
(8, 'Star Health', 'Health Insurance', 'STAR', 1, '2026-09-19 18:05:33'),
(9, 'Federal Bank', 'bank', 'FEDERAL_BANK', 1, '2026-09-22 18:24:53'),
(11, 'Test Bank 1790081796455', 'bank', 'BANK_1790081796455', 1, '2026-09-22 18:26:36');

-- --------------------------------------------------------

--
-- Table structure for table `marketing_campaigns`
--

CREATE TABLE `marketing_campaigns` (
  `id` int(11) NOT NULL,
  `campaign_name` varchar(150) NOT NULL,
  `channel` varchar(50) NOT NULL,
  `status` varchar(50) DEFAULT 'Active',
  `leads_count` int(11) DEFAULT 0,
  `budget` decimal(10,2) DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `marketing_campaigns`
--

INSERT INTO `marketing_campaigns` (`id`, `campaign_name`, `channel`, `status`, `leads_count`, `budget`, `created_at`) VALUES
(1, 'DSA Onboarding Campaign', 'WhatsApp', 'Active', 2480, 0.00, '2026-09-19 18:05:33'),
(2, 'Business Loan Offer', 'Email', 'Active', 1100, 0.00, '2026-09-19 18:05:33'),
(3, 'Credit Card Campaign', 'Push', 'Active', 980, 0.00, '2026-09-19 18:05:33'),
(4, 'Insurance Awareness', 'SMS', 'Active', 760, 0.00, '2026-09-19 18:05:33'),
(5, 'Festival Campaign', 'WhatsApp', 'Active', 1850, 0.00, '2026-09-19 18:05:33');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) NOT NULL,
  `partner_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `resource_type` varchar(50) DEFAULT NULL,
  `resource_id` varchar(100) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `read_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `partner_id`, `type`, `title`, `message`, `resource_type`, `resource_id`, `is_read`, `created_at`, `read_at`) VALUES
(22, 1, 'lead', 'Lead FTL123536 Status: Under Review', 'Your lead FTL123536 has progressed to stage \"Underwriting and verification\" with status \"Under Review\".', 'lead', 'FTL123536', 0, '2026-09-22 11:49:14', NULL),
(23, 1, 'lead', 'Lead FTL123537 Status: Approved', 'Your lead FTL123537 has progressed to stage \"Sanction letter generated by HDFC Bank\" with status \"Approved\".', 'lead', 'FTL123537', 0, '2026-09-22 11:49:15', NULL),
(24, 1, 'payout', 'Payout Request #42: APPROVED', 'Your payout request #42 has been approved by finance and is being queued for bank transfer.', 'payout', '42', 0, '2026-09-22 11:49:17', NULL),
(25, 1, 'payout', 'Payout Settled (UTR: UTR57957069)', 'Your payout request #42 has been successfully settled to your bank account. Bank UTR: UTR57957069.', 'payout', '42', 0, '2026-09-22 11:49:17', NULL),
(26, 1, 'payout', 'Payout Request #43: REJECTED', 'Your payout request #43 was rejected. Funds have been restored to your available balance.', 'payout', '43', 0, '2026-09-22 11:49:17', NULL),
(27, 1, 'lead', 'Lead FTL123538 Status: Approved', 'Your lead FTL123538 has progressed to stage \"Card Approved\" with status \"Approved\".', 'lead', 'FTL123538', 0, '2026-09-22 11:49:17', NULL),
(28, 1, 'lead', 'Lead FTL123538 Status: Card Issued', 'Your lead FTL123538 has progressed to stage \"Card Dispatched & Issued\" with status \"Card Issued\".', 'lead', 'FTL123538', 0, '2026-09-22 11:49:17', NULL),
(29, 1, 'commission', 'Commission Credited: ₹190', 'A commission of ₹190 has been credited to your available balance for lead FTL123538. (Flat ₹200)', 'lead', 'FTL123538', 0, '2026-09-22 11:49:17', NULL),
(30, 1, 'lead', 'Lead FTL123539 Status: Policy Issued', 'Your lead FTL123539 has progressed to stage \"Policy Generated & Active\" with status \"Policy Issued\".', 'lead', 'FTL123539', 0, '2026-09-22 11:49:17', NULL),
(39, 1, 'lead', 'Lead FTL123538 Status: Under Review', 'Your lead FTL123538 has progressed to stage \"Underwriting and verification\" with status \"Under Review\".', 'lead', 'FTL123538', 0, '2026-09-22 12:52:44', NULL),
(40, 1, 'lead', 'Lead FTL123540 Status: Approved', 'Your lead FTL123540 has progressed to stage \"Sanction letter generated by HDFC Bank\" with status \"Approved\".', 'lead', 'FTL123540', 0, '2026-09-22 12:52:45', NULL),
(41, 1, 'payout', 'Payout Request #44: APPROVED', 'Your payout request #44 has been approved by finance and is being queued for bank transfer.', 'payout', '44', 0, '2026-09-22 12:52:46', NULL),
(42, 1, 'payout', 'Payout Settled (UTR: UTR61766713)', 'Your payout request #44 has been successfully settled to your bank account. Bank UTR: UTR61766713.', 'payout', '44', 0, '2026-09-22 12:52:46', NULL),
(43, 1, 'payout', 'Payout Request #45: REJECTED', 'Your payout request #45 was rejected. Funds have been restored to your available balance.', 'payout', '45', 0, '2026-09-22 12:52:46', NULL),
(44, 1, 'lead', 'Lead FTL123541 Status: Approved', 'Your lead FTL123541 has progressed to stage \"Card Approved\" with status \"Approved\".', 'lead', 'FTL123541', 0, '2026-09-22 12:52:46', NULL),
(45, 1, 'lead', 'Lead FTL123541 Status: Card Issued', 'Your lead FTL123541 has progressed to stage \"Card Dispatched & Issued\" with status \"Card Issued\".', 'lead', 'FTL123541', 0, '2026-09-22 12:52:46', NULL),
(46, 1, 'commission', 'Commission Credited: ₹190', 'A commission of ₹190 has been credited to your available balance for lead FTL123541. (Flat ₹200)', 'lead', 'FTL123541', 0, '2026-09-22 12:52:46', NULL),
(47, 1, 'lead', 'Lead FTL123542 Status: Policy Issued', 'Your lead FTL123542 has progressed to stage \"Policy Generated & Active\" with status \"Policy Issued\".', 'lead', 'FTL123542', 0, '2026-09-22 12:52:46', NULL),
(56, 1, 'lead', 'Lead FTL123541 Status: Under Review', 'Your lead FTL123541 has progressed to stage \"Underwriting and verification\" with status \"Under Review\".', 'lead', 'FTL123541', 0, '2026-09-22 14:58:36', NULL),
(57, 1, 'lead', 'Lead FTL123543 Status: Approved', 'Your lead FTL123543 has progressed to stage \"Sanction letter generated by HDFC Bank\" with status \"Approved\".', 'lead', 'FTL123543', 0, '2026-09-22 14:58:37', NULL),
(58, 1, 'payout', 'Payout Request #46: APPROVED', 'Your payout request #46 has been approved by finance and is being queued for bank transfer.', 'payout', '46', 0, '2026-09-22 14:58:37', NULL),
(59, 1, 'payout', 'Payout Settled (UTR: UTR69317636)', 'Your payout request #46 has been successfully settled to your bank account. Bank UTR: UTR69317636.', 'payout', '46', 0, '2026-09-22 14:58:37', NULL),
(60, 1, 'payout', 'Payout Request #47: REJECTED', 'Your payout request #47 was rejected. Funds have been restored to your available balance.', 'payout', '47', 0, '2026-09-22 14:58:37', NULL),
(61, 1, 'lead', 'Lead FTL123544 Status: Approved', 'Your lead FTL123544 has progressed to stage \"Card Approved\" with status \"Approved\".', 'lead', 'FTL123544', 0, '2026-09-22 14:58:37', NULL),
(62, 1, 'lead', 'Lead FTL123544 Status: Card Issued', 'Your lead FTL123544 has progressed to stage \"Card Dispatched & Issued\" with status \"Card Issued\".', 'lead', 'FTL123544', 0, '2026-09-22 14:58:37', NULL),
(63, 1, 'commission', 'Commission Credited: ₹190', 'A commission of ₹190 has been credited to your available balance for lead FTL123544. (Flat ₹200)', 'lead', 'FTL123544', 0, '2026-09-22 14:58:37', NULL),
(64, 1, 'lead', 'Lead FTL123545 Status: Policy Issued', 'Your lead FTL123545 has progressed to stage \"Policy Generated & Active\" with status \"Policy Issued\".', 'lead', 'FTL123545', 0, '2026-09-22 14:58:37', NULL),
(74, 1, 'lead', 'Lead FTL123543 Status: Under Review', 'Your lead FTL123543 has progressed to stage \"Underwriting and verification\" with status \"Under Review\".', 'lead', 'FTL123543', 0, '2026-09-22 17:18:58', NULL),
(75, 1, 'lead', 'Lead FTL123546 Status: Approved', 'Your lead FTL123546 has progressed to stage \"Sanction letter generated by HDFC Bank\" with status \"Approved\".', 'lead', 'FTL123546', 0, '2026-09-22 17:19:00', NULL),
(76, 1, 'payout', 'Payout Request #48: APPROVED', 'Your payout request #48 has been approved by finance and is being queued for bank transfer.', 'payout', '48', 0, '2026-09-22 17:19:03', NULL),
(77, 1, 'payout', 'Payout Settled (UTR: UTR77743499)', 'Your payout request #48 has been successfully settled to your bank account. Bank UTR: UTR77743499.', 'payout', '48', 0, '2026-09-22 17:19:03', NULL),
(78, 1, 'payout', 'Payout Request #49: REJECTED', 'Your payout request #49 was rejected. Funds have been restored to your available balance.', 'payout', '49', 0, '2026-09-22 17:19:03', NULL),
(79, 1, 'lead', 'Lead FTL123547 Status: Approved', 'Your lead FTL123547 has progressed to stage \"Card Approved\" with status \"Approved\".', 'lead', 'FTL123547', 0, '2026-09-22 17:19:03', NULL),
(80, 1, 'lead', 'Lead FTL123547 Status: Card Issued', 'Your lead FTL123547 has progressed to stage \"Card Dispatched & Issued\" with status \"Card Issued\".', 'lead', 'FTL123547', 0, '2026-09-22 17:19:03', NULL),
(81, 1, 'commission', 'Commission Credited: ₹190', 'A commission of ₹190 has been credited to your available balance for lead FTL123547. (Flat ₹200)', 'lead', 'FTL123547', 0, '2026-09-22 17:19:03', NULL),
(82, 1, 'lead', 'Lead FTL123548 Status: Policy Issued', 'Your lead FTL123548 has progressed to stage \"Policy Generated & Active\" with status \"Policy Issued\".', 'lead', 'FTL123548', 0, '2026-09-22 17:19:04', NULL),
(91, 1, 'lead', 'Lead FTL123551 Status: Under Review', 'Your lead FTL123551 has progressed to stage \"Underwriting and verification\" with status \"Under Review\".', 'lead', 'FTL123551', 0, '2026-09-22 18:27:14', NULL),
(92, 1, 'lead', 'Lead FTL123552 Status: Approved', 'Your lead FTL123552 has progressed to stage \"Sanction letter generated by HDFC Bank\" with status \"Approved\".', 'lead', 'FTL123552', 0, '2026-09-22 18:27:15', NULL),
(93, 1, 'payout', 'Payout Request #50: APPROVED', 'Your payout request #50 has been approved by finance and is being queued for bank transfer.', 'payout', '50', 0, '2026-09-22 18:27:16', NULL),
(94, 1, 'payout', 'Payout Settled (UTR: UTR81836851)', 'Your payout request #50 has been successfully settled to your bank account. Bank UTR: UTR81836851.', 'payout', '50', 0, '2026-09-22 18:27:16', NULL),
(95, 1, 'payout', 'Payout Request #51: REJECTED', 'Your payout request #51 was rejected. Funds have been restored to your available balance.', 'payout', '51', 0, '2026-09-22 18:27:16', NULL),
(96, 1, 'lead', 'Lead FTL123553 Status: Approved', 'Your lead FTL123553 has progressed to stage \"Card Approved\" with status \"Approved\".', 'lead', 'FTL123553', 0, '2026-09-22 18:27:17', NULL),
(97, 1, 'lead', 'Lead FTL123553 Status: Card Issued', 'Your lead FTL123553 has progressed to stage \"Card Dispatched & Issued\" with status \"Card Issued\".', 'lead', 'FTL123553', 0, '2026-09-22 18:27:17', NULL),
(98, 1, 'commission', 'Commission Credited: ₹190', 'A commission of ₹190 has been credited to your available balance for lead FTL123553. (Flat ₹200)', 'lead', 'FTL123553', 0, '2026-09-22 18:27:17', NULL),
(99, 1, 'lead', 'Lead FTL123554 Status: Policy Issued', 'Your lead FTL123554 has progressed to stage \"Policy Generated & Active\" with status \"Policy Issued\".', 'lead', 'FTL123554', 0, '2026-09-22 18:27:17', NULL),
(108, 94, 'lead', 'Lead FTL123555 Status: Under Review', 'Your lead FTL123555 has progressed to stage \"Underwriting and verification\" with status \"Under Review\".', 'lead', 'FTL123555', 1, '2026-09-23 11:53:21', '2026-09-23 12:21:31'),
(109, 1, 'lead', 'Lead FTL123556 Status: Approved', 'Your lead FTL123556 has progressed to stage \"Sanction letter generated by HDFC Bank\" with status \"Approved\".', 'lead', 'FTL123556', 0, '2026-09-23 11:53:23', NULL),
(110, 1, 'payout', 'Payout Request #52: APPROVED', 'Your payout request #52 has been approved by finance and is being queued for bank transfer.', 'payout', '52', 0, '2026-09-23 11:53:24', NULL),
(111, 1, 'payout', 'Payout Settled (UTR: UTR44604688)', 'Your payout request #52 has been successfully settled to your bank account. Bank UTR: UTR44604688.', 'payout', '52', 0, '2026-09-23 11:53:24', NULL),
(112, 1, 'payout', 'Payout Request #53: REJECTED', 'Your payout request #53 was rejected. Funds have been restored to your available balance.', 'payout', '53', 0, '2026-09-23 11:53:24', NULL),
(113, 1, 'lead', 'Lead FTL123557 Status: Approved', 'Your lead FTL123557 has progressed to stage \"Card Approved\" with status \"Approved\".', 'lead', 'FTL123557', 0, '2026-09-23 11:53:24', NULL),
(114, 1, 'lead', 'Lead FTL123557 Status: Card Issued', 'Your lead FTL123557 has progressed to stage \"Card Dispatched & Issued\" with status \"Card Issued\".', 'lead', 'FTL123557', 0, '2026-09-23 11:53:24', NULL),
(115, 1, 'commission', 'Commission Credited: ₹190', 'A commission of ₹190 has been credited to your available balance for lead FTL123557. (Flat ₹200)', 'lead', 'FTL123557', 0, '2026-09-23 11:53:24', NULL),
(116, 1, 'lead', 'Lead FTL123558 Status: Policy Issued', 'Your lead FTL123558 has progressed to stage \"Policy Generated & Active\" with status \"Policy Issued\".', 'lead', 'FTL123558', 0, '2026-09-23 11:53:25', NULL),
(124, 94, 'lead', 'Lead FTL123555 Status: Approved', 'Your lead FTL123555 has progressed to stage \"Credit sanctioned by lending partner\" with status \"Approved\".', 'lead', 'FTL123555', 0, '2026-09-23 12:21:58', NULL),
(125, 94, 'lead', 'Lead FTL123559 Status: Approved', 'Your lead FTL123559 has progressed to stage \"Sanction\" with status \"Approved\".', 'lead', 'FTL123559', 0, '2026-09-23 12:55:47', NULL),
(126, 94, 'lead', 'Lead FTL123559 Status: Disbursed', 'Your lead FTL123559 has progressed to stage \"Disbursement completed to borrower account\" with status \"Disbursed\".', 'lead', 'FTL123559', 0, '2026-09-23 12:56:57', NULL),
(127, 94, 'commission', 'Commission Credited: ₹9,500', 'A commission of ₹9,500 has been credited to your available balance for lead FTL123559. (1% of ₹10,00,000)', 'lead', 'FTL123559', 0, '2026-09-23 12:56:57', NULL),
(129, 94, 'lead', 'Lead FTL123559 Status: Under Review', 'Your lead FTL123559 has progressed to stage \"Underwriting and verification\" with status \"Under Review\".', 'lead', 'FTL123559', 0, '2026-09-23 13:33:17', NULL),
(130, 1, 'lead', 'Lead FTL123560 Status: Approved', 'Your lead FTL123560 has progressed to stage \"Sanction letter generated by HDFC Bank\" with status \"Approved\".', 'lead', 'FTL123560', 0, '2026-09-23 13:33:18', NULL),
(131, 1, 'payout', 'Payout Request #54: APPROVED', 'Your payout request #54 has been approved by finance and is being queued for bank transfer.', 'payout', '54', 0, '2026-09-23 13:33:19', NULL),
(132, 1, 'payout', 'Payout Settled (UTR: UTR50599073)', 'Your payout request #54 has been successfully settled to your bank account. Bank UTR: UTR50599073.', 'payout', '54', 0, '2026-09-23 13:33:19', NULL),
(133, 1, 'payout', 'Payout Request #55: REJECTED', 'Your payout request #55 was rejected. Funds have been restored to your available balance.', 'payout', '55', 0, '2026-09-23 13:33:19', NULL),
(134, 1, 'lead', 'Lead FTL123561 Status: Approved', 'Your lead FTL123561 has progressed to stage \"Card Approved\" with status \"Approved\".', 'lead', 'FTL123561', 0, '2026-09-23 13:33:19', NULL),
(135, 1, 'lead', 'Lead FTL123561 Status: Card Issued', 'Your lead FTL123561 has progressed to stage \"Card Dispatched & Issued\" with status \"Card Issued\".', 'lead', 'FTL123561', 0, '2026-09-23 13:33:19', NULL),
(136, 1, 'commission', 'Commission Credited: ₹190', 'A commission of ₹190 has been credited to your available balance for lead FTL123561. (Flat ₹200)', 'lead', 'FTL123561', 0, '2026-09-23 13:33:19', NULL),
(137, 1, 'lead', 'Lead FTL123562 Status: Policy Issued', 'Your lead FTL123562 has progressed to stage \"Policy Generated & Active\" with status \"Policy Issued\".', 'lead', 'FTL123562', 0, '2026-09-23 13:33:19', NULL),
(144, 1, 'lead', 'Lead FTL123561 Status: Under Review', 'Your lead FTL123561 has progressed to stage \"Underwriting and verification\" with status \"Under Review\".', 'lead', 'FTL123561', 0, '2026-09-23 13:45:53', NULL),
(145, 1, 'lead', 'Lead FTL123563 Status: Approved', 'Your lead FTL123563 has progressed to stage \"Sanction letter generated by HDFC Bank\" with status \"Approved\".', 'lead', 'FTL123563', 0, '2026-09-23 13:45:54', NULL),
(146, 1, 'payout', 'Payout Request #56: APPROVED', 'Your payout request #56 has been approved by finance and is being queued for bank transfer.', 'payout', '56', 0, '2026-09-23 13:45:54', NULL),
(147, 1, 'payout', 'Payout Settled (UTR: UTR51354702)', 'Your payout request #56 has been successfully settled to your bank account. Bank UTR: UTR51354702.', 'payout', '56', 0, '2026-09-23 13:45:54', NULL),
(148, 1, 'payout', 'Payout Request #57: REJECTED', 'Your payout request #57 was rejected. Funds have been restored to your available balance.', 'payout', '57', 0, '2026-09-23 13:45:54', NULL),
(149, 1, 'lead', 'Lead FTL123564 Status: Approved', 'Your lead FTL123564 has progressed to stage \"Card Approved\" with status \"Approved\".', 'lead', 'FTL123564', 0, '2026-09-23 13:45:54', NULL),
(150, 1, 'lead', 'Lead FTL123564 Status: Card Issued', 'Your lead FTL123564 has progressed to stage \"Card Dispatched & Issued\" with status \"Card Issued\".', 'lead', 'FTL123564', 0, '2026-09-23 13:45:54', NULL),
(151, 1, 'commission', 'Commission Credited: ₹190', 'A commission of ₹190 has been credited to your available balance for lead FTL123564. (Flat ₹200)', 'lead', 'FTL123564', 0, '2026-09-23 13:45:54', NULL),
(152, 1, 'lead', 'Lead FTL123565 Status: Policy Issued', 'Your lead FTL123565 has progressed to stage \"Policy Generated & Active\" with status \"Policy Issued\".', 'lead', 'FTL123565', 0, '2026-09-23 13:45:54', NULL),
(162, 1, 'lead', 'Lead FTL123564 Status: Under Review', 'Your lead FTL123564 has progressed to stage \"Underwriting and verification\" with status \"Under Review\".', 'lead', 'FTL123564', 0, '2026-09-23 14:32:38', NULL),
(163, 1, 'lead', 'Lead FTL123566 Status: Approved', 'Your lead FTL123566 has progressed to stage \"Sanction letter generated by HDFC Bank\" with status \"Approved\".', 'lead', 'FTL123566', 0, '2026-09-23 14:32:39', NULL),
(164, 1, 'payout', 'Payout Request #58: APPROVED', 'Your payout request #58 has been approved by finance and is being queued for bank transfer.', 'payout', '58', 0, '2026-09-23 14:32:40', NULL),
(165, 1, 'payout', 'Payout Settled (UTR: UTR54160860)', 'Your payout request #58 has been successfully settled to your bank account. Bank UTR: UTR54160860.', 'payout', '58', 0, '2026-09-23 14:32:40', NULL),
(166, 1, 'payout', 'Payout Request #59: REJECTED', 'Your payout request #59 was rejected. Funds have been restored to your available balance.', 'payout', '59', 0, '2026-09-23 14:32:40', NULL),
(167, 1, 'lead', 'Lead FTL123567 Status: Approved', 'Your lead FTL123567 has progressed to stage \"Card Approved\" with status \"Approved\".', 'lead', 'FTL123567', 0, '2026-09-23 14:32:41', NULL),
(168, 1, 'lead', 'Lead FTL123567 Status: Card Issued', 'Your lead FTL123567 has progressed to stage \"Card Dispatched & Issued\" with status \"Card Issued\".', 'lead', 'FTL123567', 0, '2026-09-23 14:32:41', NULL),
(169, 1, 'commission', 'Commission Credited: ₹190', 'A commission of ₹190 has been credited to your available balance for lead FTL123567. (Flat ₹200)', 'lead', 'FTL123567', 0, '2026-09-23 14:32:41', NULL),
(170, 1, 'lead', 'Lead FTL123568 Status: Policy Issued', 'Your lead FTL123568 has progressed to stage \"Policy Generated & Active\" with status \"Policy Issued\".', 'lead', 'FTL123568', 0, '2026-09-23 14:32:41', NULL),
(178, 94, 'cibil', 'CIBIL Report Ready', 'Your CIBIL credit bureau report for Garlapati Harish is ready.', 'cibil', NULL, 0, '2026-09-23 15:00:27', NULL),
(179, 94, 'cibil', 'EQUIFAX Report Ready', 'Your EQUIFAX credit bureau report for MUNUKUNTLA PRAVEEN is ready.', 'cibil', NULL, 0, '2026-09-23 15:17:38', NULL),
(180, 94, 'cibil', 'EXPERIAN Report Ready', 'Your EXPERIAN credit bureau report for Mohammed Hassan Ali is ready.', 'cibil', NULL, 0, '2026-09-23 15:28:42', NULL),
(181, 245, 'cibil', 'CIBIL Report Ready', 'Your CIBIL credit bureau report for Jane Doe is ready.', 'cibil', NULL, 0, '2026-09-23 15:29:24', NULL),
(182, 253, 'cibil', 'CIBIL Report Ready', 'Your CIBIL credit bureau report for Jane Doe is ready.', 'cibil', NULL, 0, '2026-09-23 15:31:13', NULL),
(183, 261, 'cibil', 'CIBIL Report Ready', 'Your CIBIL credit bureau report for Jane Doe is ready.', 'cibil', NULL, 0, '2026-09-23 15:32:43', NULL),
(184, 269, 'cibil', 'CIBIL Report Ready', 'Your CIBIL credit bureau report for Jane Doe is ready.', 'cibil', NULL, 0, '2026-09-23 15:33:18', NULL),
(186, 1, 'lead', 'Lead FTL123567 Status: Under Review', 'Your lead FTL123567 has progressed to stage \"Underwriting and verification\" with status \"Under Review\".', 'lead', 'FTL123567', 0, '2026-09-23 15:33:50', NULL),
(187, 1, 'lead', 'Lead FTL123569 Status: Approved', 'Your lead FTL123569 has progressed to stage \"Sanction letter generated by HDFC Bank\" with status \"Approved\".', 'lead', 'FTL123569', 0, '2026-09-23 15:33:51', NULL),
(189, 1, 'lead', 'Lead FTL123569 Status: Under Review', 'Your lead FTL123569 has progressed to stage \"Underwriting and verification\" with status \"Under Review\".', 'lead', 'FTL123569', 0, '2026-09-23 15:35:57', NULL),
(190, 1, 'lead', 'Lead FTL123570 Status: Approved', 'Your lead FTL123570 has progressed to stage \"Sanction letter generated by HDFC Bank\" with status \"Approved\".', 'lead', 'FTL123570', 0, '2026-09-23 15:35:58', NULL),
(192, 1, 'lead', 'Lead FTL123570 Status: Under Review', 'Your lead FTL123570 has progressed to stage \"Underwriting and verification\" with status \"Under Review\".', 'lead', 'FTL123570', 0, '2026-09-23 15:36:50', NULL),
(193, 1, 'lead', 'Lead FTL123571 Status: Approved', 'Your lead FTL123571 has progressed to stage \"Sanction letter generated by HDFC Bank\" with status \"Approved\".', 'lead', 'FTL123571', 0, '2026-09-23 15:36:51', NULL),
(194, 1, 'payout', 'Payout Request #60: APPROVED', 'Your payout request #60 has been approved by finance and is being queued for bank transfer.', 'payout', '60', 0, '2026-09-23 15:36:51', NULL),
(195, 1, 'payout', 'Payout Settled (UTR: UTR58011864)', 'Your payout request #60 has been successfully settled to your bank account. Bank UTR: UTR58011864.', 'payout', '60', 0, '2026-09-23 15:36:51', NULL),
(196, 1, 'payout', 'Payout Request #61: REJECTED', 'Your payout request #61 was rejected. Funds have been restored to your available balance.', 'payout', '61', 0, '2026-09-23 15:36:51', NULL),
(197, 1, 'lead', 'Lead FTL123572 Status: Approved', 'Your lead FTL123572 has progressed to stage \"Card Approved\" with status \"Approved\".', 'lead', 'FTL123572', 0, '2026-09-23 15:36:52', NULL),
(198, 1, 'lead', 'Lead FTL123572 Status: Card Issued', 'Your lead FTL123572 has progressed to stage \"Card Dispatched & Issued\" with status \"Card Issued\".', 'lead', 'FTL123572', 0, '2026-09-23 15:36:52', NULL),
(199, 1, 'commission', 'Commission Credited: ₹190', 'A commission of ₹190 has been credited to your available balance for lead FTL123572. (Flat ₹200)', 'lead', 'FTL123572', 0, '2026-09-23 15:36:52', NULL),
(200, 1, 'lead', 'Lead FTL123573 Status: Policy Issued', 'Your lead FTL123573 has progressed to stage \"Policy Generated & Active\" with status \"Policy Issued\".', 'lead', 'FTL123573', 0, '2026-09-23 15:36:52', NULL),
(202, 1, 'lead', 'Lead FTL123573 Status: Under Review', 'Your lead FTL123573 has progressed to stage \"Underwriting and verification\" with status \"Under Review\".', 'lead', 'FTL123573', 0, '2026-09-23 15:38:08', NULL),
(203, 1, 'lead', 'Lead FTL123574 Status: Approved', 'Your lead FTL123574 has progressed to stage \"Sanction letter generated by HDFC Bank\" with status \"Approved\".', 'lead', 'FTL123574', 0, '2026-09-23 15:38:09', NULL),
(204, 1, 'payout', 'Payout Request #62: APPROVED', 'Your payout request #62 has been approved by finance and is being queued for bank transfer.', 'payout', '62', 0, '2026-09-23 15:38:10', NULL),
(205, 1, 'payout', 'Payout Settled (UTR: UTR58090305)', 'Your payout request #62 has been successfully settled to your bank account. Bank UTR: UTR58090305.', 'payout', '62', 0, '2026-09-23 15:38:10', NULL),
(206, 1, 'payout', 'Payout Request #63: REJECTED', 'Your payout request #63 was rejected. Funds have been restored to your available balance.', 'payout', '63', 0, '2026-09-23 15:38:10', NULL),
(207, 1, 'lead', 'Lead FTL123575 Status: Approved', 'Your lead FTL123575 has progressed to stage \"Card Approved\" with status \"Approved\".', 'lead', 'FTL123575', 0, '2026-09-23 15:38:10', NULL),
(208, 1, 'lead', 'Lead FTL123575 Status: Card Issued', 'Your lead FTL123575 has progressed to stage \"Card Dispatched & Issued\" with status \"Card Issued\".', 'lead', 'FTL123575', 0, '2026-09-23 15:38:10', NULL),
(209, 1, 'commission', 'Commission Credited: ₹190', 'A commission of ₹190 has been credited to your available balance for lead FTL123575. (Flat ₹200)', 'lead', 'FTL123575', 0, '2026-09-23 15:38:10', NULL),
(210, 1, 'lead', 'Lead FTL123576 Status: Policy Issued', 'Your lead FTL123576 has progressed to stage \"Policy Generated & Active\" with status \"Policy Issued\".', 'lead', 'FTL123576', 0, '2026-09-23 15:38:10', NULL),
(218, 298, 'cibil', 'CIBIL Report Ready', 'Your CIBIL credit bureau report for Jane Doe is ready.', 'cibil', NULL, 0, '2026-09-23 15:38:16', NULL),
(220, 1, 'lead', 'Lead FTL123575 Status: Under Review', 'Your lead FTL123575 has progressed to stage \"Underwriting and verification\" with status \"Under Review\".', 'lead', 'FTL123575', 0, '2026-09-23 15:57:39', NULL),
(221, 1, 'lead', 'Lead FTL123577 Status: Approved', 'Your lead FTL123577 has progressed to stage \"Sanction letter generated by HDFC Bank\" with status \"Approved\".', 'lead', 'FTL123577', 0, '2026-09-23 15:57:40', NULL),
(222, 1, 'payout', 'Payout Request #64: APPROVED', 'Your payout request #64 has been approved by finance and is being queued for bank transfer.', 'payout', '64', 0, '2026-09-23 15:57:41', NULL),
(223, 1, 'payout', 'Payout Settled (UTR: UTR59261222)', 'Your payout request #64 has been successfully settled to your bank account. Bank UTR: UTR59261222.', 'payout', '64', 0, '2026-09-23 15:57:41', NULL),
(224, 1, 'payout', 'Payout Request #65: REJECTED', 'Your payout request #65 was rejected. Funds have been restored to your available balance.', 'payout', '65', 0, '2026-09-23 15:57:41', NULL),
(225, 1, 'lead', 'Lead FTL123578 Status: Approved', 'Your lead FTL123578 has progressed to stage \"Card Approved\" with status \"Approved\".', 'lead', 'FTL123578', 0, '2026-09-23 15:57:41', NULL),
(226, 1, 'lead', 'Lead FTL123578 Status: Card Issued', 'Your lead FTL123578 has progressed to stage \"Card Dispatched & Issued\" with status \"Card Issued\".', 'lead', 'FTL123578', 0, '2026-09-23 15:57:41', NULL),
(227, 1, 'commission', 'Commission Credited: ₹190', 'A commission of ₹190 has been credited to your available balance for lead FTL123578. (Flat ₹200)', 'lead', 'FTL123578', 0, '2026-09-23 15:57:41', NULL),
(228, 1, 'lead', 'Lead FTL123579 Status: Policy Issued', 'Your lead FTL123579 has progressed to stage \"Policy Generated & Active\" with status \"Policy Issued\".', 'lead', 'FTL123579', 0, '2026-09-23 15:57:41', NULL),
(236, 316, 'cibil', 'CIBIL Report Ready', 'Your CIBIL credit bureau report for Jane Doe is ready.', 'cibil', NULL, 0, '2026-09-23 15:57:48', NULL),
(237, 94, 'cibil', 'CIBIL Report Ready', 'Your CIBIL credit bureau report for Mohammed Hassan Ali is ready.', 'cibil', NULL, 0, '2026-09-23 17:56:45', NULL),
(238, 94, 'cibil', 'CIBIL Report Ready', 'Your CIBIL credit bureau report for Mokthal Rajitha is ready.', 'cibil', NULL, 0, '2026-09-23 17:58:13', NULL),
(239, 94, 'cibil', 'EXPERIAN Report Ready', 'Your EXPERIAN credit bureau report for Vinay Kumar Palle is ready.', 'cibil', NULL, 0, '2026-09-23 17:59:42', NULL),
(241, 1, 'lead', 'Lead FTL123578 Status: Under Review', 'Your lead FTL123578 has progressed to stage \"Underwriting and verification\" with status \"Under Review\".', 'lead', 'FTL123578', 0, '2026-09-23 18:10:02', NULL),
(242, 1, 'lead', 'Lead FTL123580 Status: Approved', 'Your lead FTL123580 has progressed to stage \"Sanction letter generated by HDFC Bank\" with status \"Approved\".', 'lead', 'FTL123580', 0, '2026-09-23 18:10:03', NULL),
(243, 1, 'payout', 'Payout Request #66: APPROVED', 'Your payout request #66 has been approved by finance and is being queued for bank transfer.', 'payout', '66', 0, '2026-09-23 18:10:04', NULL),
(244, 1, 'payout', 'Payout Settled (UTR: UTR67204539)', 'Your payout request #66 has been successfully settled to your bank account. Bank UTR: UTR67204539.', 'payout', '66', 0, '2026-09-23 18:10:04', NULL),
(245, 1, 'payout', 'Payout Request #67: REJECTED', 'Your payout request #67 was rejected. Funds have been restored to your available balance.', 'payout', '67', 0, '2026-09-23 18:10:04', NULL),
(246, 1, 'lead', 'Lead FTL123581 Status: Approved', 'Your lead FTL123581 has progressed to stage \"Card Approved\" with status \"Approved\".', 'lead', 'FTL123581', 0, '2026-09-23 18:10:04', NULL),
(247, 1, 'lead', 'Lead FTL123581 Status: Card Issued', 'Your lead FTL123581 has progressed to stage \"Card Dispatched & Issued\" with status \"Card Issued\".', 'lead', 'FTL123581', 0, '2026-09-23 18:10:04', NULL),
(248, 1, 'commission', 'Commission Credited: ₹190', 'A commission of ₹190 has been credited to your available balance for lead FTL123581. (Flat ₹200)', 'lead', 'FTL123581', 0, '2026-09-23 18:10:04', NULL),
(249, 1, 'lead', 'Lead FTL123582 Status: Policy Issued', 'Your lead FTL123582 has progressed to stage \"Policy Generated & Active\" with status \"Policy Issued\".', 'lead', 'FTL123582', 0, '2026-09-23 18:10:04', NULL),
(257, 335, 'cibil', 'CIBIL Report Ready', 'Your CIBIL credit bureau report for Jane Doe is ready.', 'cibil', NULL, 0, '2026-09-23 18:10:11', NULL),
(259, 1, 'lead', 'Lead FTL123581 Status: Under Review', 'Your lead FTL123581 has progressed to stage \"Underwriting and verification\" with status \"Under Review\".', 'lead', 'FTL123581', 0, '2026-09-23 18:55:10', NULL),
(260, 1, 'lead', 'Lead FTL123583 Status: Approved', 'Your lead FTL123583 has progressed to stage \"Sanction letter generated by HDFC Bank\" with status \"Approved\".', 'lead', 'FTL123583', 0, '2026-09-23 18:55:11', NULL),
(261, 1, 'payout', 'Payout Request #68: APPROVED', 'Your payout request #68 has been approved by finance and is being queued for bank transfer.', 'payout', '68', 0, '2026-09-23 18:55:12', NULL),
(262, 1, 'payout', 'Payout Settled (UTR: UTR69912781)', 'Your payout request #68 has been successfully settled to your bank account. Bank UTR: UTR69912781.', 'payout', '68', 0, '2026-09-23 18:55:12', NULL),
(263, 1, 'payout', 'Payout Request #69: REJECTED', 'Your payout request #69 was rejected. Funds have been restored to your available balance.', 'payout', '69', 0, '2026-09-23 18:55:12', NULL),
(264, 1, 'lead', 'Lead FTL123584 Status: Approved', 'Your lead FTL123584 has progressed to stage \"Card Approved\" with status \"Approved\".', 'lead', 'FTL123584', 0, '2026-09-23 18:55:13', NULL),
(265, 1, 'lead', 'Lead FTL123584 Status: Card Issued', 'Your lead FTL123584 has progressed to stage \"Card Dispatched & Issued\" with status \"Card Issued\".', 'lead', 'FTL123584', 0, '2026-09-23 18:55:13', NULL),
(266, 1, 'commission', 'Commission Credited: ₹190', 'A commission of ₹190 has been credited to your available balance for lead FTL123584. (Flat ₹200)', 'lead', 'FTL123584', 0, '2026-09-23 18:55:13', NULL),
(267, 1, 'lead', 'Lead FTL123585 Status: Policy Issued', 'Your lead FTL123585 has progressed to stage \"Policy Generated & Active\" with status \"Policy Issued\".', 'lead', 'FTL123585', 0, '2026-09-23 18:55:13', NULL),
(275, 354, 'cibil', 'CIBIL Report Ready', 'Your CIBIL credit bureau report for Jane Doe is ready.', 'cibil', NULL, 0, '2026-09-23 18:55:19', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `otp_sessions`
--

CREATE TABLE `otp_sessions` (
  `id` int(11) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `otp_hash` varchar(255) NOT NULL,
  `purpose` varchar(50) NOT NULL DEFAULT 'login',
  `attempt_count` int(11) NOT NULL DEFAULT 0,
  `is_consumed` tinyint(1) NOT NULL DEFAULT 0,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `otp_sessions`
--

INSERT INTO `otp_sessions` (`id`, `mobile`, `otp_hash`, `purpose`, `attempt_count`, `is_consumed`, `expires_at`, `created_at`) VALUES
(1, '9876543210', '$2b$08$KGKQ/jaxW3o7grGheJaF3O6g8Gcelfwh53b96bERLyTjkk6cYUQ0q', 'login', 0, 0, '2026-09-19 12:19:05', '2026-09-19 12:14:05'),
(2, '9988776655', '$2b$08$ROKGDPNYKlRvcDh3dtKmy.7Q/zX.4EGlPOn44So9iVPNJRKKBbGCm', 'login', 0, 0, '2026-09-19 12:19:46', '2026-09-19 12:14:46'),
(3, '9988776655', '$2b$08$hGiwGAWz1RAsQlTZvBq5cunL40l0nl.XaI1PSqGuQO68.aDrnsQ2e', 'login', 0, 0, '2026-09-19 12:56:00', '2026-09-19 12:51:00'),
(4, '9876543210', '$2b$08$Y9fx3SxiquizpKtYEea5LucRpGlFfs5bkNReRM3bU4kicxUZcR2jm', 'register', 0, 1, '2026-09-19 13:13:42', '2026-09-19 13:08:42'),
(5, '9988776655', '$2b$08$rPdHe7tK2Cspqjif7a43veNqPCRMUDcStD7BXJWS2ulYbekpp0I7G', 'login', 0, 0, '2026-09-19 14:39:50', '2026-09-19 14:34:50'),
(6, '9876543210', '$2b$08$AQMglwio8lX4qzwu6UvdgefWipoMWRVs.rm8N0bS5YCLe8XnFVBe2', 'register', 0, 0, '2026-09-19 14:43:04', '2026-09-19 14:38:04'),
(7, '9876543210', '$2b$08$4.TOA.l4cQdxw9JCjWe/IOB/b9kfdMT97u7UGQMRBdn.eL1dLpqiW', 'register', 0, 0, '2026-09-19 14:56:32', '2026-09-19 14:51:32'),
(8, '9876543210', '$2b$08$8i8Ti7mQx2U5QeIgdjMdvuztBKIt6kIQm0Nyiijan3kqRoGaBZR.m', 'register', 0, 0, '2026-09-19 14:58:44', '2026-09-19 14:53:44'),
(9, '9988776655', '$2b$08$Se8RlgzgmBN4bnqAVdVvBO4/aWt3V3qR1D1J4.nKusIruDnpPFWVi', 'login', 0, 0, '2026-09-19 15:01:22', '2026-09-19 14:56:22'),
(10, '8897609479', '$2b$08$lclr.HG7.GtqYMqOPeVGm.IftqT4emVtUtKqrZhj2ghG809ShgaLu', 'register', 3, 0, '2026-09-19 15:17:02', '2026-09-19 15:12:02'),
(11, '9988776655', '$2b$08$HP2.xYDSmokhkITA2BkQy.EcCBacqBJZIgW89G7rDr/0R2zVpx0xq', 'login', 0, 0, '2026-09-19 15:34:31', '2026-09-19 15:29:31'),
(12, '9876543210', '$2b$08$CehyD2Oldxc6KaR.zdhN0.Zr80N931udKYxrg.eFcPSbr4VqSVt/e', 'register', 0, 0, '2026-09-19 15:36:48', '2026-09-19 15:31:48'),
(13, '9876543210', '$2b$08$n1TbsvwajTPd7YBtk322UuEkybSV15EkIjD/hZypRAqiVdrlxacLm', 'register', 0, 0, '2026-09-19 15:38:57', '2026-09-19 15:33:57'),
(14, '9876543210', '$2b$08$U3EwpZXTqhkFABb.yYbR.uVduFaSiyiiA.942G.Vr4cOdIGwfFSy2', 'device_verification', 0, 1, '2026-09-19 17:27:05', '2026-09-19 17:22:05'),
(15, '9876543210', '$2b$08$CB2ohcoV1lBUvyOuvyonG.Pzl0gvh15hSe6Uwwbw/5OiPX42IWa9a', 'device_verification', 0, 1, '2026-09-19 17:27:38', '2026-09-19 17:22:38'),
(16, '9876543210', '$2b$08$iRV2bEDiTAiDzr0nVdU.TeavDasogVgsuaIJHlHZIU.q4ZyCLvKNy', 'device_verification', 0, 0, '2026-09-19 17:36:54', '2026-09-19 17:31:54'),
(17, '9876543210', '$2b$08$LAxhcF9tzdn0OmcdrN9YROr5/upLSiDUgndVV427AkL1na1nV/bqO', 'device_verification', 0, 1, '2026-09-19 17:39:10', '2026-09-19 17:34:10'),
(18, '9876543210', '$2b$08$pBqo2QkACNuXwo0uUBqPTOOkKRculiasNycb2CoWp1S/8IJNqX/kK', 'device_verification', 0, 1, '2026-09-19 17:44:22', '2026-09-19 17:39:22'),
(19, '9876543210', '$2b$08$XugFndpeFYfhUaqi7zNUeeP4KCh8TsTT8Bq0DisTshXRcn8m8whpG', 'device_verification', 0, 1, '2026-09-19 17:46:18', '2026-09-19 17:41:18'),
(20, '9876543210', '$2b$08$GLFD0p4Q8X6QJ7kygZnCnOTmRavDHz4DWzgTmhKi34E/08mBttRQ.', 'mpin_reset', 0, 1, '2026-09-19 17:46:31', '2026-09-19 17:41:31'),
(21, '9876543210', '$2b$08$97k6098RtjqkXa/GNR2KmuMoTMORgUbN.x6X0dUMKXdSC3hPX2c8a', 'device_verification', 0, 1, '2026-09-19 18:06:35', '2026-09-19 18:01:35'),
(22, '9876543210', '$2b$08$kMFIDZYw0vHZOdAPiA64JuwICo79sLKbi4Kvw982xe/Ah.b7vwDUm', 'mpin_reset', 0, 1, '2026-09-19 18:06:47', '2026-09-19 18:01:47'),
(23, '9113980103', '$2b$08$7HjzerKdn2gTl05Fvvxxm.s0rv3NUBHkSIfK.c72U1Sy8jfsDozm2', 'register', 0, 0, '2026-09-19 18:25:12', '2026-09-19 18:20:12'),
(24, '7331129435', '$2b$08$mJ43fyT7JEfJxnGLNSWFfeNDpq93W9FQTSo8yn9e4NF.wJyZAqNma', 'device_verification', 0, 0, '2026-09-20 09:12:51', '2026-09-20 09:07:51'),
(25, '9876543210', '$2b$08$WsUVRBjMr5oXt56SGZiZUuERzBb8QCnv4MJox5R35y0yVLuqBHqSy', 'device_verification', 0, 1, '2026-09-20 09:30:47', '2026-09-20 09:25:47'),
(26, '9876543210', '$2b$08$13e2dGPdIr/XeTJQBFo7suxyHSREg92E4Sdt6DLCZa0EvDaRI167q', 'mpin_reset', 0, 1, '2026-09-20 09:30:59', '2026-09-20 09:25:59'),
(27, '9876543210', '$2b$08$E9yof169vx72UpaL2or5hucMlCYfZTfnCRR9dyVbyfcKn03SQ2CLK', 'register', 0, 0, '2026-09-20 09:32:22', '2026-09-20 09:27:22'),
(28, '9876543210', '$2b$08$HN88yowWFFvW23yZyG63.eYWOhG8Rx31o8fBr.JSda.9HKuMcnGYe', 'device_verification', 0, 1, '2026-09-20 10:18:53', '2026-09-20 10:13:53'),
(29, '9876543210', '$2b$08$oOmPgT0BXBHm5CtNN/sIS.z8UfJtKf/WurcNqFbl/926XHzUZ0bGe', 'mpin_reset', 0, 1, '2026-09-20 10:19:05', '2026-09-20 10:14:05'),
(30, '9876543210', '$2b$08$8/8x//PWt4ggJ/xYci3Ne.gsdCwOOrUmf433DQhQUqqDHpco1wdpu', 'register', 0, 0, '2026-09-20 11:23:02', '2026-09-20 11:18:02'),
(33, '9876543299', '$2b$08$R3SxS6zdNbORSDT5wauVROiMuoaDk1/QSpGLHnErJI1XO7D.DSQDe', 'device_verification', 0, 1, '2026-09-20 11:59:15', '2026-09-20 11:54:15'),
(34, '9811616403', '$2b$08$DgzfIY/g9R0L3wbQH.fHQemQsYHIK11uNSIhFwc2w3N5lIpLmAqFC', 'device_verification', 0, 1, '2026-09-20 12:01:42', '2026-09-20 11:56:42'),
(35, '9834154103', '$2b$08$WW0nsIAHh2PYeVNdvHgVL.ejoLL1WmXWAN3E51Gl9uDLvt7NP4iky', 'device_verification', 0, 1, '2026-09-20 12:03:57', '2026-09-20 11:58:57'),
(36, '8897609479', '$2b$08$SYN0nZr.gcp2drCEIkHBSeoSOmEqxQLfYPGs3JXV2zZtso6soP84a', 'register', 0, 0, '2026-09-20 14:27:18', '2026-09-20 14:22:18'),
(37, '9876543210', '$2b$08$W9CkxbftQjyhYOtdtxaKX.ZEQbNjEdt2HkKcN1uXHQbJHYt2CaWF6', 'device_verification', 0, 0, '2026-09-21 10:49:47', '2026-09-21 10:44:47'),
(38, '9876543210', '$2b$08$DTp8hvZnniF924A/9mBjMe4LG3x1WkcmXUh7.5vBn6Cd8R9/D95xG', 'device_verification', 0, 1, '2026-09-21 10:50:49', '2026-09-21 10:45:49'),
(39, '9876543210', '$2b$08$LEInvHb7HAZ.5dLBVGpOe.f95vjwX1ykQ9fMf1/Bd6MnNPXRsVfXS', 'mpin_reset', 5, 0, '2026-09-21 12:12:58', '2026-09-21 12:07:58'),
(40, '8897609479', '$2b$08$ikD3LrP3Y0eWDEpxqx18vupskCRhHeC6oj/cvulyg.MH2u1Bs8ufi', 'device_verification', 0, 0, '2026-09-21 12:13:33', '2026-09-21 12:08:33'),
(41, '8897609479', '$2b$08$K2Cm54qYwUi80xK6FkYb.uQZJ0jiuORLsjITUs5V4ya38OQVWVMbu', 'device_verification', 0, 0, '2026-09-21 12:13:42', '2026-09-21 12:08:42'),
(44, '9876543210', '$2b$08$oeYTPVvBQX2o9I2mo/oiE..vu7hbvCNY159emvryziGx827G8XxCq', 'password_reset', 0, 0, '2026-09-21 12:48:26', '2026-09-21 12:43:26'),
(45, '9876543210', '$2b$08$518CGJAq6A2zDBOSWZVsquFT/9FVlv.xIFO/X7W3y0V2IiHMcbq9y', 'password_reset', 0, 0, '2026-09-21 13:00:44', '2026-09-21 12:55:44'),
(46, '9876543210', '$2b$08$8mtDN3ppdfezjsefFExE.OY2NeVSXgRjMo0R1SgXK3WVZEaDWbmQW', 'password_reset', 0, 1, '2026-09-21 13:02:34', '2026-09-21 12:57:34'),
(47, '9876543210', '$2b$08$RlATuLitRmxI.NoYwNiGJ.XckhjHiE0665ILpZl5XZvTw.yjpogwW', 'password_reset', 0, 1, '2026-09-21 13:03:54', '2026-09-21 12:58:54'),
(48, '9876543210', '$2b$08$ma1QiZafjv2GKBbcvuVd1.b740ByBn8MxWDzUBN15mje7iAsgDNuO', 'password_reset', 0, 1, '2026-09-21 13:14:30', '2026-09-21 13:09:30'),
(49, '9876543210', '$2b$08$J.8/rFeoZMuDthndKL.vfOFRlIEEfJdJYUjFUmzSTat/B9RCaKIg.', 'password_reset', 0, 1, '2026-09-21 13:24:23', '2026-09-21 13:19:23'),
(52, '9876543210', '$2b$08$R.ic8p1qi4q.n9wl71/J4evvii07Aa2VxhfLkPsq30bs2u9OKigmO', 'password_reset', 0, 1, '2026-09-21 13:40:33', '2026-09-21 13:35:33'),
(53, '9876543210', '$2b$08$/CtPfaepDfLkJT994ZrsKu0C.VwiShGPH3vo2bQsx2Lg4BxJqLoX6', 'password_reset', 0, 1, '2026-09-21 13:50:47', '2026-09-21 13:45:47'),
(63, '8897609479', '$2b$08$WWRBKtUL5Ewo1t625aNpjOwUcr9vDqxwfqRI.6KPXmQVUIg/cLM1S', 'device_verification', 0, 1, '2026-09-21 17:57:49', '2026-09-21 17:52:49'),
(64, '8897609479', '$2b$08$LAqFzN.on7ZkDT/6XJPxmOJHU801F4RRGsPleF5gYTb6ezWZvp2.q', 'signup', 0, 1, '2026-09-21 18:04:21', '2026-09-21 17:59:21'),
(66, '8897609479', '$2b$08$J3cZAzRCmZClyZS2WPwoBOldmwgNf7ni6TOv7SMgg5HrEpiW4JTe6', 'device_verification', 0, 1, '2026-09-21 23:37:48', '2026-09-21 23:32:48'),
(68, '8897609479', '$2b$08$b0hjrV26DDv4b4YpddFC/e2UUyfkMj0sCJvSTtrQ09lKQpOSiNk66', 'signup', 0, 1, '2026-09-22 10:31:57', '2026-09-22 10:26:57'),
(85, '9885928776', '$2b$08$mf9YyfK6zPHeDWDJxm2Jse1hjzHK2Qy8AqoGlTTh8ETeSAi2PhRs2', 'device_verification', 0, 1, '2026-09-22 13:47:50', '2026-09-22 13:37:50'),
(110, '8897609479', '$2b$08$4ysm1UZdFRL5dtieuBzRge5enRjbMu5EYbmREs9Ok0ffRkCffeP7q', 'device_verification', 0, 1, '2026-09-23 18:04:29', '2026-09-23 17:54:29');

-- --------------------------------------------------------

--
-- Table structure for table `partners`
--

CREATE TABLE `partners` (
  `id` int(11) NOT NULL,
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
  `password_hash` varchar(255) DEFAULT NULL,
  `mpin_hash` varchar(255) DEFAULT NULL,
  `mpin_configured_at` datetime DEFAULT NULL,
  `mpin_attempts` int(11) DEFAULT 0,
  `mpin_locked_until` datetime DEFAULT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'partner',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `kyc_status` varchar(50) NOT NULL DEFAULT 'pending',
  `approval_status` varchar(50) NOT NULL DEFAULT 'pending',
  `bank_account_name` varchar(255) DEFAULT NULL,
  `bank_account_number` varchar(50) DEFAULT NULL,
  `bank_ifsc` varchar(20) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `referred_by_partner_id` int(11) DEFAULT NULL,
  `profile_image_path` varchar(500) DEFAULT NULL,
  `profile_image_mime` varchar(100) DEFAULT NULL,
  `profile_image_updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `partners`
--

INSERT INTO `partners` (`id`, `partner_code`, `full_name`, `mobile`, `email`, `partner_type`, `business_name`, `city`, `district`, `state`, `pan`, `password_hash`, `mpin_hash`, `mpin_configured_at`, `mpin_attempts`, `mpin_locked_until`, `role`, `is_active`, `kyc_status`, `approval_status`, `bank_account_name`, `bank_account_number`, `bank_ifsc`, `bank_name`, `created_at`, `updated_at`, `referred_by_partner_id`, `profile_image_path`, `profile_image_mime`, `profile_image_updated_at`) VALUES
(1, 'P-1001', 'Ramesh Sharma', '9876543210', 'ramesh.sharma@example.com', 'CA & Tax Consultant', NULL, 'Hyderabad', NULL, 'Telangana', NULL, '$2b$10$TXgGfbK0ntG23y1vrY7hc.c02PP6On6qD8JalpALJIr9beZ8RWEzi', '$2b$10$4qTtaOHL.X/CmSOH6fHB8uu1tsHVO7UkCifEUiHPF3bzNd0zXXEUG', '2026-09-20 10:14:10', 1, NULL, 'partner', 1, 'verified', 'approved', 'Ramesh Sharma', 'XXXXXX1234', 'HDFC0001234', 'HDFC Bank', '2026-09-18 17:25:51', '2026-09-23 18:55:12', NULL, 'C:\\Users\\haree\\Downloads\\fintalk-app\\backend\\uploads\\profile-photos\\dc927c79-0d45-4aac-9b9a-f366c45ebe66.jpg', 'image/jpeg', '2026-09-21 13:08:10'),
(2, 'P-1002', 'Sunita Rao', '9988776655', 'sunita@example.com', 'Financial Advisor', NULL, 'Hyderabad', NULL, 'Telangana', NULL, '$2b$10$DRGa103d2WUmw9kw5kcGAuzl7wO6JIQ8TeMeLaxeWygL.5gTDQV/S', NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'active', NULL, NULL, NULL, NULL, '2026-09-19 12:14:46', '2026-09-19 12:14:46', NULL, NULL, NULL, NULL),
(11, 'P-TEST-9232', 'Invited DSA Partner', '9111169232', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-20 09:12:49', '2026-09-20 09:12:49', 1, NULL, NULL, NULL),
(16, 'P-TEST-1727', 'Invited DSA Partner', '9111151727', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-20 09:17:31', '2026-09-20 09:17:31', 1, NULL, NULL, NULL),
(19, 'P-TEST-2270', 'Invited DSA Partner', '9111132270', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-20 09:58:52', '2026-09-20 09:58:52', 1, NULL, NULL, NULL),
(23, 'P-TEST-1083', 'Invited DSA Partner', '9111171083', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-20 11:51:11', '2026-09-20 11:51:11', 1, NULL, NULL, NULL),
(25, 'P-1003', 'Aakash Verma', '9876543299', 'aakash.verma@earnmitra.in', 'INDIVIDUAL', NULL, 'Bengaluru', NULL, 'Karnataka', NULL, '$2b$10$S1xbGtFfEaEKtuMyv9z9oezrdxh77VVGHhiZ1eopEh8fIWvvypGPq', '$2b$10$Mbo4KKYf8VHR8Cz775QXCOhLVx4O5H8FX9qOpdwWoGoqlAS30/5Y.', '2026-09-20 11:54:15', 1, NULL, 'partner', 1, 'pending', 'active', NULL, NULL, NULL, NULL, '2026-09-20 11:54:15', '2026-09-20 11:54:15', NULL, NULL, NULL, NULL),
(26, 'P-1004', 'Aakash Verma', '9811616403', 'aakash.verma@earnmitra.in', 'INDIVIDUAL', NULL, 'Bengaluru', NULL, 'Karnataka', NULL, '$2b$10$5sqB1jcYlcsBJgsVLSEvPOlw88oHg//uDr.PIZmCta00r4brUPuQO', '$2b$10$GLzrabvHB1FJed2VdQqy0Ojx0E5Iwo8ojl/EpaPrsAMb3vQedTeJu', '2026-09-20 11:56:42', 1, NULL, 'partner', 1, 'pending', 'active', NULL, NULL, NULL, NULL, '2026-09-20 11:56:42', '2026-09-20 11:56:42', NULL, NULL, NULL, NULL),
(27, 'P-1005', 'Aakash Verma', '9834154103', 'aakash.verma@earnmitra.in', 'INDIVIDUAL', NULL, 'Bengaluru', NULL, 'Karnataka', NULL, '$2b$10$Q3TYZhfBfgTKGnztIraOf.YHXAzFwR1JtVzRSyaDwCFhcV27II43u', '$2b$10$FW73PjT9jd6WxDKgORGG3.MFkt8ObRhMeJwFfXzLvFzsNzyMh307K', '2026-09-20 11:58:57', 1, NULL, 'partner', 1, 'pending', 'active', NULL, NULL, NULL, NULL, '2026-09-20 11:58:57', '2026-09-20 11:58:58', NULL, NULL, NULL, NULL),
(28, 'P-1006', 'Rohan Deshmukh', '9858284998', NULL, 'DSA', NULL, 'Hyderabad', NULL, 'Telangana', NULL, '$2b$10$DQZ0rNjHs.2ssIeV1x85depHytarnz2RTw.R7oE3dtfYO5PenTJaG', '$2b$10$Rp8.Q7BEDuzDlQ5.Dg4K/eHpPo3/Vp3Zvztbk53wSUCnor.DSlTQC', '2026-09-20 12:15:21', 5, '2026-09-20 12:30:22', 'partner', 1, 'approved', 'active', NULL, NULL, NULL, NULL, '2026-09-20 12:15:17', '2026-09-20 12:15:22', NULL, NULL, NULL, NULL),
(29, 'P-1007', 'Pooja Hegde', '9832283566', NULL, 'Agent', NULL, 'Pune', NULL, 'Maharashtra', NULL, '$2b$10$/zeabjr5MgdP5iWxrqvUHOstYw4B7SawstAdQRD.s16TnL5y8uzQa', NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'active', NULL, NULL, NULL, NULL, '2026-09-20 12:15:21', '2026-09-20 12:15:21', NULL, NULL, NULL, NULL),
(30, 'P-1008', 'Kiran Patel', '9883084493', NULL, 'DSA', NULL, 'Ahmedabad', NULL, 'Gujarat', NULL, '$2b$10$0UC1llNL1K8QNnFxagMxruehxGq6Hs542QLvo7tER9YvZ72xW.YBG', NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'active', NULL, NULL, NULL, NULL, '2026-09-20 12:15:22', '2026-09-20 12:15:22', NULL, NULL, NULL, NULL),
(33, 'P-TEST-5714', 'Invited DSA Partner', '9111145714', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-20 12:29:05', '2026-09-20 12:29:05', 1, NULL, NULL, NULL),
(38, 'P-TEST-7577', 'Invited DSA Partner', '9111137577', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-21 11:20:37', '2026-09-21 11:20:37', 1, NULL, NULL, NULL),
(43, 'P-1009', 'Final Visual Test', '7888809122', NULL, 'Test Partner', NULL, 'Test City', NULL, 'Telangana', NULL, '$2b$10$Pgej6gMCXAeEtGQcLlgYEe867Da9c.yiDMmaaBQ.fbp9TVOKJBqF.', NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'active', NULL, NULL, NULL, NULL, '2026-09-21 12:12:32', '2026-09-21 12:12:32', NULL, NULL, NULL, NULL),
(46, 'P-TEST-3284', 'Invited DSA Partner', '9111193284', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-21 12:21:33', '2026-09-21 12:21:33', 1, NULL, NULL, NULL),
(52, 'P-TEST-1673', 'Invited DSA Partner', '9111121673', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-21 13:22:01', '2026-09-21 13:22:01', 1, NULL, NULL, NULL),
(58, 'P-TEST-0957', 'Invited DSA Partner', '9111100957', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-21 13:30:00', '2026-09-21 13:30:00', 1, NULL, NULL, NULL),
(64, 'P-TEST-1367', 'Invited DSA Partner', '9111171367', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-21 16:21:11', '2026-09-21 16:21:11', 1, NULL, NULL, NULL),
(72, 'P-TEST-1312', 'Invited DSA Partner', '9111131312', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-21 16:32:11', '2026-09-21 16:32:11', 1, NULL, NULL, NULL),
(79, 'P-TEST-0533', 'Invited DSA Partner', '9111110533', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-21 16:33:30', '2026-09-21 16:33:30', 1, NULL, NULL, NULL),
(85, 'P-TEST-5336', 'Invited DSA Partner', '9111165336', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-21 17:02:45', '2026-09-21 17:02:45', 1, NULL, NULL, NULL),
(90, 'P-TEST-3738', 'Invited DSA Partner', '9111113738', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-21 17:03:33', '2026-09-21 17:03:33', 1, NULL, NULL, NULL),
(94, 'P-1010', 'Hareesh Chowdary', '8897609479', 'hareeshchowdary357@gmail.com', 'Firm Accountant', NULL, 'Hyderabad', NULL, 'Telangana', NULL, '$2b$10$8GdO.lt7vKlpsgs3eM.vm.16huaZtsNVk4O9zzLuSgTXm0CKqoObG', '$2b$10$87PmjCUQ8vxXPlEQHrFp1.TnAadTWxH3mliYaaGTytKwJrx1/Wt7O', '2026-09-21 18:01:54', 0, NULL, 'partner', 1, 'approved', 'active', NULL, NULL, NULL, NULL, '2026-09-21 18:01:26', '2026-09-22 10:35:16', NULL, NULL, NULL, NULL),
(97, 'P-TEST-6467', 'Invited DSA Partner', '9111136467', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-21 18:25:36', '2026-09-21 18:25:36', 1, NULL, NULL, NULL),
(105, 'P-TEST-8554', 'Invited DSA Partner', '9111168554', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-22 00:39:28', '2026-09-22 00:39:28', 1, NULL, NULL, NULL),
(121, 'P-TEST-7419', 'Invited DSA Partner', '9111157419', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-22 11:49:17', '2026-09-22 11:49:17', 1, NULL, NULL, NULL),
(130, 'P-TEST-6992', 'Invited DSA Partner', '9111166992', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-22 12:52:46', '2026-09-22 12:52:46', 1, NULL, NULL, NULL),
(139, 'P-TEST-7822', 'Invited DSA Partner', '9111117822', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-22 14:58:37', '2026-09-22 14:58:37', 1, NULL, NULL, NULL),
(150, 'P-TEST-4019', 'Invited DSA Partner', '9111144019', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-22 17:19:04', '2026-09-22 17:19:04', 1, NULL, NULL, NULL),
(157, 'P953338', 'Fast Track DSA Associates', '9777766666', 'fasttrack@dsa.in', 'DSA', 'Fast Track DSA Associates', 'Hyderabad', 'Hyderabad', 'Telangana', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-22 18:24:53', '2026-09-22 18:24:53', NULL, NULL, NULL, NULL),
(159, 'P826563', 'Fast Track DSA Associates', '9730566348', 'fasttrack_1790081796455@dsa.in', 'DSA', 'Fast Track DSA Associates', 'Hyderabad', 'Hyderabad', 'Telangana', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-22 18:26:36', '2026-09-22 18:26:36', NULL, NULL, NULL, NULL),
(162, 'P-TEST-7234', 'Invited DSA Partner', '9111137234', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-22 18:27:17', '2026-09-22 18:27:17', 1, NULL, NULL, NULL),
(171, 'P-TEST-5052', 'Invited DSA Partner', '9111105052', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 11:53:25', '2026-09-23 11:53:25', 1, NULL, NULL, NULL),
(180, 'P-TEST-9267', 'Invited DSA Partner', '9111199267', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 13:33:19', '2026-09-23 13:33:19', 1, NULL, NULL, NULL),
(183, 'T-A-1790150761359913', 'Isolation Partner A', '0761359913', NULL, 'Test', NULL, NULL, NULL, 'Telangana', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 13:36:01', '2026-09-23 13:36:01', NULL, 'C:\\Users\\haree\\Downloads\\fintalk-app\\backend\\uploads\\profile-photos\\3b3397b6-d6a6-4fa1-a9a6-e6aa33b516f4.png', 'image/png', '2026-09-23 13:36:01'),
(184, 'T-B-1790150761359913', 'Isolation Partner B', '6761359912', NULL, 'Test', NULL, NULL, NULL, 'Telangana', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 13:36:01', '2026-09-23 13:36:01', NULL, NULL, NULL, NULL),
(206, 'P-TEST-4979', 'Invited DSA Partner', '9111154979', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 13:45:54', '2026-09-23 13:45:54', 1, NULL, NULL, NULL),
(221, 'P-TEST-1182', 'Invited DSA Partner', '9111161182', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 14:32:41', '2026-09-23 14:32:41', 1, NULL, NULL, NULL),
(232, 'P_RECHARGE_1790157473861_933', 'Test Partner 1790157473861_933', '473861_933', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:27:53', '2026-09-23 15:27:53', NULL, NULL, NULL, NULL),
(233, 'P_COMMISSION_1790157473890_3032', 'Test Partner 1790157473890_3032', '73890_3032', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:27:53', '2026-09-23 15:27:53', NULL, NULL, NULL, NULL),
(234, 'P_PRIORITY_DEDUCT_1790157473909_', 'Test Partner 1790157473909_8844', '73909_8844', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:27:53', '2026-09-23 15:27:53', NULL, NULL, NULL, NULL),
(235, 'P_FINALIZE_DEBIT_1790157473938_8', 'Test Partner 1790157473938_8953', '73938_8953', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:27:53', '2026-09-23 15:27:53', NULL, NULL, NULL, NULL),
(236, 'P_PAYOUT_ISOLATION_1790157473968', 'Test Partner 1790157473968_2656', '73968_2656', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:27:53', '2026-09-23 15:27:53', NULL, NULL, NULL, NULL),
(237, 'P_DEV_MOCK_1790157473997_660', 'Test Partner 1790157473997_660', '473997_660', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:27:54', '2026-09-23 15:27:54', NULL, NULL, NULL, NULL),
(238, 'P_OWNER_1790157474012_9068', 'Test Partner 1790157474012_9068', '74012_9068', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:27:54', '2026-09-23 15:27:54', NULL, NULL, NULL, NULL),
(239, 'P_ATTACKER_1790157474015_4734', 'Test Partner 1790157474015_4734', '74015_4734', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:27:54', '2026-09-23 15:27:54', NULL, NULL, NULL, NULL),
(240, 'P_RECHARGE_1790157564826_7384', 'Test Partner 1790157564826_7384', '64826_7384', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:29:24', '2026-09-23 15:29:24', NULL, NULL, NULL, NULL),
(241, 'P_COMMISSION_1790157564854_760', 'Test Partner 1790157564854_760', '564854_760', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:29:24', '2026-09-23 15:29:24', NULL, NULL, NULL, NULL),
(242, 'P_PRIORITY_DEDUCT_1790157564867_', 'Test Partner 1790157564867_6499', '64867_6499', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:29:24', '2026-09-23 15:29:24', NULL, NULL, NULL, NULL),
(243, 'P_FINALIZE_DEBIT_1790157564887_3', 'Test Partner 1790157564887_3855', '64887_3855', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:29:24', '2026-09-23 15:29:24', NULL, NULL, NULL, NULL),
(244, 'P_PAYOUT_ISOLATION_1790157564904', 'Test Partner 1790157564904_2378', '64904_2378', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:29:24', '2026-09-23 15:29:24', NULL, NULL, NULL, NULL),
(245, 'P_DEV_MOCK_1790157564927_262', 'Test Partner 1790157564927_262', '564927_262', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:29:24', '2026-09-23 15:29:24', NULL, NULL, NULL, NULL),
(246, 'P_OWNER_1790157564965_3951', 'Test Partner 1790157564965_3951', '64965_3951', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:29:24', '2026-09-23 15:29:24', NULL, NULL, NULL, NULL),
(247, 'P_ATTACKER_1790157564968_4888', 'Test Partner 1790157564968_4888', '64968_4888', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:29:24', '2026-09-23 15:29:24', NULL, NULL, NULL, NULL),
(253, 'P_DEV_MOCK_1790157673827_1158', 'Test Partner 1790157673827_1158', '73827_1158', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:31:13', '2026-09-23 15:31:13', NULL, NULL, NULL, NULL),
(261, 'P_DEV_MOCK_1790157763725_1749', 'Test Partner 1790157763725_1749', '63725_1749', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:32:43', '2026-09-23 15:32:43', NULL, NULL, NULL, NULL),
(262, 'P_OWNER_1790157764119_5005', 'Test Partner 1790157764119_5005', '64119_5005', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:32:44', '2026-09-23 15:32:44', NULL, NULL, NULL, NULL),
(269, 'P_DEV_MOCK_1790157797979_163', 'Test Partner 1790157797979_163', '797979_163', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:33:17', '2026-09-23 15:33:17', NULL, NULL, NULL, NULL),
(270, 'P_OWNER_1790157798390_6249', 'Test Partner 1790157798390_6249', '98390_6249', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:33:18', '2026-09-23 15:33:18', NULL, NULL, NULL, NULL),
(278, 'P-TEST-2080', 'Invited DSA Partner', '9111112080', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:36:52', '2026-09-23 15:36:52', 1, NULL, NULL, NULL),
(285, 'P-TEST-0564', 'Invited DSA Partner', '9111190564', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:38:10', '2026-09-23 15:38:10', 1, NULL, NULL, NULL),
(298, 'P_DEV_MOCK_1790158096017_7356', 'Test Partner 1790158096017_7356', '96017_7356', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:38:16', '2026-09-23 15:38:16', NULL, NULL, NULL, NULL),
(299, 'P_OWNER_1790158096343_7053', 'Test Partner 1790158096343_7053', '96343_7053', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:38:16', '2026-09-23 15:38:16', NULL, NULL, NULL, NULL),
(303, 'P-TEST-1527', 'Invited DSA Partner', '9111161527', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:57:41', '2026-09-23 15:57:41', 1, NULL, NULL, NULL),
(316, 'P_DEV_MOCK_1790159268525_1197', 'Test Partner 1790159268525_1197', '68525_1197', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:57:48', '2026-09-23 15:57:48', NULL, NULL, NULL, NULL),
(317, 'P_OWNER_1790159269068_4373', 'Test Partner 1790159269068_4373', '69068_4373', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 15:57:49', '2026-09-23 15:57:49', NULL, NULL, NULL, NULL),
(322, 'P-TEST-4873', 'Invited DSA Partner', '9111104873', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 18:10:04', '2026-09-23 18:10:04', 1, NULL, NULL, NULL),
(335, 'P_DEV_MOCK_1790167211710_6109', 'Test Partner 1790167211710_6109', '11710_6109', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 18:10:11', '2026-09-23 18:10:11', NULL, NULL, NULL, NULL),
(336, 'P_OWNER_1790167212246_2668', 'Test Partner 1790167212246_2668', '12246_2668', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 18:10:12', '2026-09-23 18:10:12', NULL, NULL, NULL, NULL),
(341, 'P-TEST-3127', 'Invited DSA Partner', '9111113127', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'pending', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 18:55:13', '2026-09-23 18:55:13', 1, NULL, NULL, NULL),
(354, 'P_DEV_MOCK_1790169919408_6083', 'Test Partner 1790169919408_6083', '19408_6083', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 18:55:19', '2026-09-23 18:55:19', NULL, NULL, NULL, NULL),
(355, 'P_OWNER_1790169919814_2546', 'Test Partner 1790169919814_2546', '19814_2546', NULL, 'Dsa', NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, NULL, 0, NULL, 'partner', 1, 'approved', 'approved', NULL, NULL, NULL, NULL, '2026-09-23 18:55:19', '2026-09-23 18:55:19', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `partner_audit_logs`
--

CREATE TABLE `partner_audit_logs` (
  `id` bigint(20) NOT NULL,
  `partner_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(80) NOT NULL,
  `entity_id` varchar(80) DEFAULT NULL,
  `metadata_json` text DEFAULT NULL,
  `ip_address` varchar(64) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `partner_audit_logs`
--

INSERT INTO `partner_audit_logs` (`id`, `partner_id`, `action`, `entity_type`, `entity_id`, `metadata_json`, `ip_address`, `created_at`) VALUES
(9, 1, 'cibil.fetch_requested', 'cibil_report', '4', '{\"consentTextVersion\":\"earnmitra-cibil-v1\"}', '::1', '2026-09-21 11:38:06'),
(10, 1, 'cibil.fetch_failed', 'cibil_report', '4', '{\"code\":\"PROVIDER_NOT_CONFIGURED\"}', '::1', '2026-09-21 11:38:06'),
(11, 1, 'cibil.fetch_requested', 'cibil_report', '5', '{\"consentTextVersion\":\"earnmitra-cibil-v1\"}', '::1', '2026-09-21 11:38:19'),
(12, 1, 'cibil.fetch_failed', 'cibil_report', '5', '{\"code\":\"PROVIDER_NOT_CONFIGURED\"}', '::1', '2026-09-21 11:38:19'),
(13, 1, 'cibil.fetch_requested', 'cibil_report', '6', '{\"consentTextVersion\":\"earnmitra-cibil-v1\"}', '::1', '2026-09-21 11:38:22'),
(14, 1, 'cibil.fetch_failed', 'cibil_report', '6', '{\"code\":\"PROVIDER_NOT_CONFIGURED\"}', '::1', '2026-09-21 11:38:22'),
(15, 1, 'cibil.fetch_requested', 'cibil_report', '7', '{\"consentTextVersion\":\"earnmitra-cibil-v1\"}', '::1', '2026-09-21 11:38:22'),
(16, 1, 'cibil.fetch_failed', 'cibil_report', '7', '{\"code\":\"PROVIDER_NOT_CONFIGURED\"}', '::1', '2026-09-21 11:38:22'),
(17, 1, 'cibil.fetch_requested', 'cibil_report', '8', '{\"consentTextVersion\":\"earnmitra-cibil-v1\"}', '::1', '2026-09-21 11:38:23'),
(18, 1, 'cibil.fetch_failed', 'cibil_report', '8', '{\"code\":\"PROVIDER_NOT_CONFIGURED\"}', '::1', '2026-09-21 11:38:23'),
(19, 1, 'profile.photo_updated', 'partner', '1', '{\"mimeType\":\"image/jpeg\",\"size\":165403}', '::1', '2026-09-21 11:39:03'),
(20, 1, 'cibil.fetch_requested', 'cibil_report', '9', '{\"consentTextVersion\":\"earnmitra-cibil-v1\"}', '::1', '2026-09-21 11:48:06'),
(21, 1, 'cibil.fetch_failed', 'cibil_report', '9', '{\"code\":\"PROVIDER_NOT_CONFIGURED\"}', '::1', '2026-09-21 11:48:06'),
(25, 1, 'cibil.fetch_requested', 'cibil_report', '11', '{\"consentTextVersion\":\"earnmitra-cibil-v1\"}', '::1', '2026-09-21 12:34:28'),
(26, 1, 'cibil.fetch_failed', 'cibil_report', '11', '{\"code\":\"PROVIDER_NOT_CONFIGURED\"}', '::1', '2026-09-21 12:34:28'),
(27, 1, 'cibil.fetch_requested', 'cibil_report', '12', '{\"consentTextVersion\":\"earnmitra-cibil-v1\"}', '::1', '2026-09-21 12:34:54'),
(28, 1, 'cibil.fetch_failed', 'cibil_report', '12', '{\"code\":\"PROVIDER_NOT_CONFIGURED\"}', '::1', '2026-09-21 12:34:54'),
(29, 1, 'profile.photo_updated', 'partner', '1', '{\"mimeType\":\"image/jpeg\",\"size\":218139}', '::1', '2026-09-21 13:08:10'),
(102, 94, 'cibil.fetch_requested', 'cibil_report', '38', '{\"bureau\":\"CIBIL\",\"consentTextVersion\":\"earnmitra-cibil-v1\"}', '::1', '2026-09-23 15:00:24'),
(103, 94, 'cibil.fetch_succeeded', 'cibil_report', '38', '{\"bureau\":\"CIBIL\",\"creditScore\":743}', '::1', '2026-09-23 15:00:27'),
(104, 94, 'cibil.fetch_requested', 'cibil_report', '39', '{\"bureau\":\"EQUIFAX\",\"consentTextVersion\":\"earnmitra-cibil-v1\"}', '::1', '2026-09-23 15:17:38'),
(105, 94, 'cibil.fetch_succeeded', 'cibil_report', '39', '{\"bureau\":\"EQUIFAX\",\"creditScore\":710,\"isMock\":true}', '::1', '2026-09-23 15:17:38'),
(106, 94, 'cibil.fetch_requested', 'cibil_report', '40', '{\"bureau\":\"CIBIL\",\"consentTextVersion\":\"earnmitra-cibil-v1\"}', '::1', '2026-09-23 15:25:47'),
(107, 94, 'cibil.fetch_requested', 'cibil_report', '41', '{\"bureau\":\"EXPERIAN\",\"consentTextVersion\":\"earnmitra-cibil-v1\"}', '::1', '2026-09-23 15:28:42'),
(108, 94, 'cibil.fetch_succeeded', 'cibil_report', '41', '{\"bureau\":\"EXPERIAN\",\"creditScore\":735,\"isMock\":true}', '::1', '2026-09-23 15:28:42'),
(109, 245, 'cibil.fetch_requested', 'cibil_report', '42', '{\"bureau\":\"CIBIL\",\"consentTextVersion\":\"earnmitra-cibil-v1\"}', '127.0.0.1', '2026-09-23 15:29:24'),
(110, 245, 'cibil.fetch_succeeded', 'cibil_report', '42', '{\"bureau\":\"CIBIL\",\"creditScore\":720,\"isMock\":true}', '127.0.0.1', '2026-09-23 15:29:24'),
(111, 253, 'cibil.fetch_requested', 'cibil_report', '43', '{\"bureau\":\"CIBIL\",\"consentTextVersion\":\"earnmitra-cibil-v1\"}', '127.0.0.1', '2026-09-23 15:31:13'),
(112, 253, 'cibil.fetch_succeeded', 'cibil_report', '43', '{\"bureau\":\"CIBIL\",\"creditScore\":720,\"isMock\":true}', '127.0.0.1', '2026-09-23 15:31:13'),
(113, 261, 'cibil.fetch_requested', 'cibil_report', '45', '{\"bureau\":\"CIBIL\",\"consentTextVersion\":\"earnmitra-cibil-v1\"}', '127.0.0.1', '2026-09-23 15:32:43'),
(114, 261, 'cibil.fetch_succeeded', 'cibil_report', '45', '{\"bureau\":\"CIBIL\",\"creditScore\":720,\"isMock\":true}', '127.0.0.1', '2026-09-23 15:32:43'),
(115, 262, 'cibil.pdf_downloaded', 'cibil_report', '46', '{\"bureau\":\"CIBIL\",\"mode\":\"attachment\"}', '127.0.0.1', '2026-09-23 15:32:44'),
(116, 269, 'cibil.fetch_requested', 'cibil_report', '47', '{\"bureau\":\"CIBIL\",\"consentTextVersion\":\"earnmitra-cibil-v1\"}', '127.0.0.1', '2026-09-23 15:33:17'),
(117, 269, 'cibil.fetch_succeeded', 'cibil_report', '47', '{\"bureau\":\"CIBIL\",\"creditScore\":720,\"isMock\":true}', '127.0.0.1', '2026-09-23 15:33:18'),
(118, 270, 'cibil.pdf_downloaded', 'cibil_report', '48', '{\"bureau\":\"CIBIL\",\"mode\":\"attachment\"}', '127.0.0.1', '2026-09-23 15:33:18'),
(124, 298, 'cibil.fetch_requested', 'cibil_report', '52', '{\"bureau\":\"CIBIL\",\"consentTextVersion\":\"earnmitra-cibil-v1\"}', '127.0.0.1', '2026-09-23 15:38:16'),
(125, 298, 'cibil.fetch_succeeded', 'cibil_report', '52', '{\"bureau\":\"CIBIL\",\"creditScore\":720,\"isMock\":true}', '127.0.0.1', '2026-09-23 15:38:16'),
(126, 299, 'cibil.pdf_downloaded', 'cibil_report', '53', '{\"bureau\":\"CIBIL\",\"mode\":\"attachment\"}', '127.0.0.1', '2026-09-23 15:38:16'),
(129, 316, 'cibil.fetch_requested', 'cibil_report', '55', '{\"bureau\":\"CIBIL\",\"consentTextVersion\":\"earnmitra-cibil-v1\"}', '127.0.0.1', '2026-09-23 15:57:48'),
(130, 316, 'cibil.fetch_succeeded', 'cibil_report', '55', '{\"bureau\":\"CIBIL\",\"creditScore\":720,\"isMock\":true}', '127.0.0.1', '2026-09-23 15:57:48'),
(131, 317, 'cibil.pdf_downloaded', 'cibil_report', '56', '{\"bureau\":\"CIBIL\",\"mode\":\"attachment\"}', '127.0.0.1', '2026-09-23 15:57:49'),
(132, 94, 'cibil.fetch_requested', 'cibil_report', '57', '{\"bureau\":\"CIBIL\",\"consentTextVersion\":\"earnmitra-cibil-v1\"}', '::1', '2026-09-23 17:56:42'),
(133, 94, 'cibil.fetch_succeeded', 'cibil_report', '57', '{\"bureau\":\"CIBIL\",\"creditScore\":664,\"isMock\":false}', '::1', '2026-09-23 17:56:45'),
(134, 94, 'cibil.fetch_requested', 'cibil_report', '58', '{\"bureau\":\"CIBIL\",\"consentTextVersion\":\"earnmitra-cibil-v1\"}', '::1', '2026-09-23 17:58:09'),
(135, 94, 'cibil.fetch_succeeded', 'cibil_report', '58', '{\"bureau\":\"CIBIL\",\"creditScore\":787,\"isMock\":false}', '::1', '2026-09-23 17:58:13'),
(136, 94, 'cibil.fetch_requested', 'cibil_report', '59', '{\"bureau\":\"EXPERIAN\",\"consentTextVersion\":\"earnmitra-cibil-v1\"}', '::1', '2026-09-23 17:59:41'),
(137, 94, 'cibil.fetch_succeeded', 'cibil_report', '59', '{\"bureau\":\"EXPERIAN\",\"creditScore\":null,\"isMock\":false}', '::1', '2026-09-23 17:59:42'),
(140, 335, 'cibil.fetch_requested', 'cibil_report', '61', '{\"bureau\":\"CIBIL\",\"consentTextVersion\":\"earnmitra-cibil-v1\"}', '127.0.0.1', '2026-09-23 18:10:11'),
(141, 335, 'cibil.fetch_succeeded', 'cibil_report', '61', '{\"bureau\":\"CIBIL\",\"creditScore\":720,\"isMock\":true}', '127.0.0.1', '2026-09-23 18:10:11'),
(142, 336, 'cibil.pdf_downloaded', 'cibil_report', '62', '{\"bureau\":\"CIBIL\",\"mode\":\"attachment\"}', '127.0.0.1', '2026-09-23 18:10:12'),
(145, 354, 'cibil.fetch_requested', 'cibil_report', '64', '{\"bureau\":\"CIBIL\",\"consentTextVersion\":\"earnmitra-cibil-v1\"}', '127.0.0.1', '2026-09-23 18:55:19'),
(146, 354, 'cibil.fetch_succeeded', 'cibil_report', '64', '{\"bureau\":\"CIBIL\",\"creditScore\":720,\"isMock\":true}', '127.0.0.1', '2026-09-23 18:55:19'),
(147, 355, 'cibil.pdf_downloaded', 'cibil_report', '65', '{\"bureau\":\"CIBIL\",\"mode\":\"attachment\"}', '127.0.0.1', '2026-09-23 18:55:19');

-- --------------------------------------------------------

--
-- Table structure for table `partner_cibil_reports`
--

CREATE TABLE `partner_cibil_reports` (
  `id` bigint(20) NOT NULL,
  `partner_id` int(11) NOT NULL,
  `bureau` varchar(30) NOT NULL DEFAULT 'CIBIL',
  `provider` varchar(30) NOT NULL DEFAULT 'surepass',
  `report_type` varchar(30) NOT NULL DEFAULT 'cibil',
  `provider_client_id` varchar(191) DEFAULT NULL,
  `provider_report_id` varchar(100) DEFAULT NULL,
  `provider_request_id` varchar(100) DEFAULT NULL,
  `customer_name` varchar(120) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `pan` varchar(10) NOT NULL,
  `gender` varchar(20) NOT NULL,
  `consent_given` tinyint(1) NOT NULL DEFAULT 0,
  `consent_text_version` varchar(80) NOT NULL,
  `consented_at` datetime NOT NULL,
  `consent_ip` varchar(64) DEFAULT NULL,
  `consent_user_agent` varchar(500) DEFAULT NULL,
  `credit_score` int(11) DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'PROCESSING',
  `report_storage_path` varchar(500) DEFAULT NULL,
  `normalized_data_json` longtext DEFAULT NULL,
  `report_mime_type` varchar(100) DEFAULT NULL,
  `provider_status_code` int(11) DEFAULT NULL,
  `failure_code` varchar(80) DEFAULT NULL,
  `failure_message` varchar(255) DEFAULT NULL,
  `billing_status` enum('NOT_CALLED','NOT_BILLED','BILLED_REPORT_READY','BILLED_NO_REPORT','BILLING_UNKNOWN','REVIEW_REQUIRED','RESERVED','DEBITED','REFUNDED','EXEMPT') NOT NULL DEFAULT 'EXEMPT',
  `requested_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `partner_cibil_reports`
--

INSERT INTO `partner_cibil_reports` (`id`, `partner_id`, `bureau`, `provider`, `report_type`, `provider_client_id`, `provider_report_id`, `provider_request_id`, `customer_name`, `mobile`, `pan`, `gender`, `consent_given`, `consent_text_version`, `consented_at`, `consent_ip`, `consent_user_agent`, `credit_score`, `status`, `report_storage_path`, `normalized_data_json`, `report_mime_type`, `provider_status_code`, `failure_code`, `failure_message`, `billing_status`, `requested_at`, `completed_at`, `created_at`, `updated_at`) VALUES
(4, 1, 'CIBIL', 'surepass', 'cibil', NULL, NULL, NULL, 'Hareesh Chowdary', '8897609479', 'CEIPH3867N', 'male', 1, 'earnmitra-cibil-v1', '2026-09-21 11:38:06', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', NULL, 'FAILED', NULL, NULL, NULL, NULL, 'PROVIDER_NOT_CONFIGURED', 'CIBIL service is not configured. Please contact support.', 'EXEMPT', NULL, NULL, '2026-09-21 11:38:06', '2026-09-21 11:38:06'),
(5, 1, 'CIBIL', 'surepass', 'cibil', NULL, NULL, NULL, 'Garlapati Harish', '8897609479', 'CEIPH3867N', 'male', 1, 'earnmitra-cibil-v1', '2026-09-21 11:38:19', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', NULL, 'FAILED', NULL, NULL, NULL, NULL, 'PROVIDER_NOT_CONFIGURED', 'CIBIL service is not configured. Please contact support.', 'EXEMPT', NULL, NULL, '2026-09-21 11:38:19', '2026-09-21 11:38:19'),
(6, 1, 'CIBIL', 'surepass', 'cibil', NULL, NULL, NULL, 'Garlapati Harish', '8897609479', 'CEIPH3867N', 'male', 1, 'earnmitra-cibil-v1', '2026-09-21 11:38:22', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', NULL, 'FAILED', NULL, NULL, NULL, NULL, 'PROVIDER_NOT_CONFIGURED', 'CIBIL service is not configured. Please contact support.', 'EXEMPT', NULL, NULL, '2026-09-21 11:38:22', '2026-09-21 11:38:22'),
(7, 1, 'CIBIL', 'surepass', 'cibil', NULL, NULL, NULL, 'Garlapati Harish', '8897609479', 'CEIPH3867N', 'male', 1, 'earnmitra-cibil-v1', '2026-09-21 11:38:22', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', NULL, 'FAILED', NULL, NULL, NULL, NULL, 'PROVIDER_NOT_CONFIGURED', 'CIBIL service is not configured. Please contact support.', 'EXEMPT', NULL, NULL, '2026-09-21 11:38:22', '2026-09-21 11:38:22'),
(8, 1, 'CIBIL', 'surepass', 'cibil', NULL, NULL, NULL, 'Garlapati Harish', '8897609479', 'CEIPH3867N', 'male', 1, 'earnmitra-cibil-v1', '2026-09-21 11:38:23', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', NULL, 'FAILED', NULL, NULL, NULL, NULL, 'PROVIDER_NOT_CONFIGURED', 'CIBIL service is not configured. Please contact support.', 'EXEMPT', NULL, NULL, '2026-09-21 11:38:23', '2026-09-21 11:38:23'),
(9, 1, 'CIBIL', 'surepass', 'cibil', NULL, NULL, NULL, 'Garlapati Harish', '8897609479', 'CEIPH3867N', 'male', 1, 'earnmitra-cibil-v1', '2026-09-21 11:48:06', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', NULL, 'FAILED', NULL, NULL, NULL, NULL, 'PROVIDER_NOT_CONFIGURED', 'CIBIL service is not configured. Please contact support.', 'EXEMPT', NULL, NULL, '2026-09-21 11:48:06', '2026-09-21 11:48:06'),
(11, 1, 'CIBIL', 'surepass', 'cibil', NULL, NULL, NULL, 'Garlapati Harish', '8897609479', 'CEIPH3867N', 'male', 1, 'earnmitra-cibil-v1', '2026-09-21 12:34:28', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', NULL, 'FAILED', NULL, NULL, NULL, NULL, 'PROVIDER_NOT_CONFIGURED', 'CIBIL service is not configured. Please contact support.', 'EXEMPT', NULL, NULL, '2026-09-21 12:34:28', '2026-09-21 12:34:28'),
(12, 1, 'CIBIL', 'surepass', 'cibil', NULL, NULL, NULL, 'Garlapati Harish', '8897609479', 'CEIPH3867N', 'male', 1, 'earnmitra-cibil-v1', '2026-09-21 12:34:54', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', NULL, 'FAILED', NULL, NULL, NULL, NULL, 'PROVIDER_NOT_CONFIGURED', 'CIBIL service is not configured. Please contact support.', 'EXEMPT', NULL, NULL, '2026-09-21 12:34:54', '2026-09-21 12:34:54'),
(38, 94, 'CIBIL', 'surepass', 'cibil', 'credit_report_cibil_pdf_zWTojPAVpwawpuyTSkhS', NULL, NULL, 'Garlapati Harish', '8897609479', 'CEIPH3867N', 'male', 1, 'earnmitra-cibil-v1', '2026-09-23 15:00:24', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0', 743, 'SUCCESS', 'C:\\Users\\haree\\Downloads\\fintalk-app\\backend\\uploads\\cibil-reports\\6569936d-395c-4fad-8778-28463c3a6e0b.pdf', '{\"score\":743,\"bureau\":\"CIBIL\",\"scoreCategory\":\"Good\",\"clientId\":\"credit_report_cibil_pdf_zWTojPAVpwawpuyTSkhS\",\"reportDate\":\"2026-09-23T09:30:27.550Z\"}', 'application/pdf', 200, NULL, NULL, 'BILLED_REPORT_READY', '2026-09-23 15:00:24', '2026-09-23 15:00:27', '2026-09-23 15:00:24', '2026-09-23 18:50:54'),
(39, 94, 'EQUIFAX', 'MOCK', 'cibil', 'DEV-MOCK-EQUIFAX-1790156858605', NULL, NULL, 'MUNUKUNTLA PRAVEEN', '9052040404', 'AQAPM0844J', 'male', 1, 'earnmitra-cibil-v1', '2026-09-23 15:17:38', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0', 710, 'SUCCESS', NULL, '{\"score\":710,\"bureau\":\"EQUIFAX\",\"scoreCategory\":\"TEST DATA\",\"paymentHistory\":\"TEST DATA\",\"creditUtilization\":\"TEST DATA\",\"creditAge\":\"TEST DATA\",\"totalAccounts\":5,\"recentEnquiries\":2,\"writtenOff\":0,\"settled\":0,\"isMock\":true,\"testMode\":true,\"reportDate\":\"2026-09-23T09:47:38.605Z\"}', NULL, 200, NULL, NULL, 'BILLED_REPORT_READY', '2026-09-23 15:17:38', '2026-09-23 15:17:38', '2026-09-23 15:17:38', '2026-09-23 15:17:38'),
(40, 94, 'CIBIL', 'surepass', 'cibil', NULL, NULL, NULL, 'Mohammed Hassan Ali', '8143504992', 'AROPA1481G', 'male', 1, 'earnmitra-cibil-v1', '2026-09-23 15:25:47', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0', NULL, 'FAILED', NULL, NULL, NULL, 400, 'PRICING_NOT_CONFIGURED', 'Bureau pricing is not configured. Bureau inquiries are currently blocked.', 'NOT_CALLED', '2026-09-23 15:25:47', '2026-09-23 15:25:47', '2026-09-23 15:25:47', '2026-09-23 15:25:47'),
(41, 94, 'EXPERIAN', 'MOCK', 'cibil', 'DEV-MOCK-EXPERIAN-1790157522605', NULL, NULL, 'Mohammed Hassan Ali', '8143504992', 'AROPA1481G', 'male', 1, 'earnmitra-cibil-v1', '2026-09-23 15:28:42', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0', 735, 'SUCCESS', NULL, '{\"score\":735,\"bureau\":\"EXPERIAN\",\"scoreCategory\":\"TEST DATA\",\"paymentHistory\":\"TEST DATA\",\"creditUtilization\":\"TEST DATA\",\"creditAge\":\"TEST DATA\",\"totalAccounts\":5,\"recentEnquiries\":2,\"writtenOff\":0,\"settled\":0,\"isMock\":true,\"testMode\":true,\"reportDate\":\"2026-09-23T09:58:42.606Z\"}', NULL, 200, NULL, NULL, 'BILLED_REPORT_READY', '2026-09-23 15:28:42', '2026-09-23 15:28:42', '2026-09-23 15:28:42', '2026-09-23 15:28:42'),
(42, 245, 'CIBIL', 'MOCK', 'cibil', 'DEV-MOCK-CIBIL-1790157564946', NULL, NULL, 'Jane Doe', '9876543210', 'ABCDE1234F', 'female', 1, 'earnmitra-cibil-v1', '2026-09-23 15:29:24', '127.0.0.1', NULL, 720, 'SUCCESS', NULL, '{\"score\":720,\"bureau\":\"CIBIL\",\"scoreCategory\":\"TEST DATA\",\"paymentHistory\":\"TEST DATA\",\"creditUtilization\":\"TEST DATA\",\"creditAge\":\"TEST DATA\",\"totalAccounts\":5,\"recentEnquiries\":2,\"writtenOff\":0,\"settled\":0,\"isMock\":true,\"testMode\":true,\"reportDate\":\"2026-09-23T09:59:24.946Z\"}', NULL, 200, NULL, NULL, 'BILLED_REPORT_READY', '2026-09-23 15:29:24', '2026-09-23 15:29:24', '2026-09-23 15:29:24', '2026-09-23 15:29:24'),
(57, 94, 'CIBIL', 'surepass', 'cibil', 'credit_report_cibil_pdf_anwtsDZbnqdlffeeglzr', NULL, NULL, 'Mohammed Hassan Ali', '8143504992', 'AROPA1481G', 'male', 1, 'earnmitra-cibil-v1', '2026-09-23 17:56:42', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0', 664, 'SUCCESS', 'C:\\Users\\haree\\Downloads\\fintalk-app\\backend\\uploads\\cibil-reports\\34bc3dc5-8b38-42f9-9c14-6b02a5da2af2.pdf', '{\"score\":664,\"bureau\":\"CIBIL\",\"scoreCategory\":\"Fair\",\"clientId\":\"credit_report_cibil_pdf_anwtsDZbnqdlffeeglzr\",\"reportDate\":\"2026-09-23T12:26:45.709Z\"}', 'application/pdf', 200, NULL, NULL, 'BILLED_REPORT_READY', '2026-09-23 17:56:42', '2026-09-23 17:56:45', '2026-09-23 17:56:42', '2026-09-23 18:50:54'),
(58, 94, 'CIBIL', 'surepass', 'cibil', 'credit_report_cibil_pdf_zvALwFgNgLujKotBwePu', NULL, NULL, 'Mokthal Rajitha', '9573057780', 'CHEPM3931K', 'female', 1, 'earnmitra-cibil-v1', '2026-09-23 17:58:09', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0', 787, 'SUCCESS', 'C:\\Users\\haree\\Downloads\\fintalk-app\\backend\\uploads\\cibil-reports\\d8aa2af2-a6ad-4bbc-8899-b1b00de02480.pdf', '{\"score\":787,\"bureau\":\"CIBIL\",\"scoreCategory\":\"Excellent\",\"clientId\":\"credit_report_cibil_pdf_zvALwFgNgLujKotBwePu\",\"reportDate\":\"2026-09-23T12:28:13.539Z\"}', 'application/pdf', 200, NULL, NULL, 'BILLED_REPORT_READY', '2026-09-23 17:58:09', '2026-09-23 17:58:13', '2026-09-23 17:58:09', '2026-09-23 18:50:54'),
(59, 94, 'EXPERIAN', 'verifyal', 'cibil', NULL, NULL, NULL, 'Vinay Kumar Palle', '9618976256', 'AFSPV1369N', 'male', 1, 'earnmitra-cibil-v1', '2026-09-23 17:59:41', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0', NULL, 'SUCCESS', 'C:\\Users\\haree\\Downloads\\fintalk-app\\backend\\uploads\\cibil-reports\\6d616c00-b1e2-4ad4-a663-7db1bf756537.pdf', '{\"score\":null,\"bureau\":\"EXPERIAN\",\"scoreCategory\":null,\"reportDate\":\"2026-09-23T12:29:42.445Z\",\"clientId\":null}', 'application/pdf', 200, NULL, NULL, 'BILLED_REPORT_READY', '2026-09-23 17:59:41', '2026-09-23 17:59:42', '2026-09-23 17:59:41', '2026-09-23 18:50:54');

-- --------------------------------------------------------

--
-- Table structure for table `partner_devices`
--

CREATE TABLE `partner_devices` (
  `id` int(11) NOT NULL,
  `partner_id` int(11) NOT NULL,
  `device_id` varchar(128) NOT NULL,
  `device_token_hash` varchar(255) NOT NULL,
  `device_name` varchar(100) DEFAULT 'Mobile Device',
  `platform` varchar(50) DEFAULT 'android',
  `is_trusted` tinyint(1) DEFAULT 1,
  `last_unlocked_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `partner_devices`
--

INSERT INTO `partner_devices` (`id`, `partner_id`, `device_id`, `device_token_hash`, `device_name`, `platform`, `is_trusted`, `last_unlocked_at`, `created_at`, `updated_at`) VALUES
(18, 1, 'dev_g3o6qtwq6_mu9bzz3w', 'af58acc02d908698972956131dd815bc744e2c2fa36fd532218344273c39cc40', 'Mobile Device', 'android', 0, '2026-09-20 10:14:10', '2026-09-20 10:13:54', '2026-09-20 10:14:13'),
(24, 25, 'c38992f8-4faa-41e9-a32f-338aaccf5fab', '4da3d982ac9a1155c9d9e3cf8443c4679aff64ea4636fbf206ae32b93157f672', 'Mobile Device', 'android', 1, '2026-09-20 11:54:15', '2026-09-20 11:54:15', '2026-09-20 11:54:15'),
(25, 25, 'e2e-device-uuid-999', 'c6a4253b012d435058643dedf2e0b5cfbc930f91b526c208df3d76311f336209', 'Pixel 8 Pro (Automated)', 'android', 1, '2026-09-20 11:54:15', '2026-09-20 11:54:15', '2026-09-20 11:54:15'),
(26, 26, '5fdfabb8-4e9e-41de-8fe2-572a54ec1942', '4278dac49abd0827654eafc3937ac460b882228b40bad92f23fb4b55c65afa2c', 'Mobile Device', 'android', 1, '2026-09-20 11:56:42', '2026-09-20 11:56:42', '2026-09-20 11:56:42'),
(27, 26, 'e2e-device-uuid-999', 'f780886c0accec0f9b9106ffff0a13cc8ab4e8bf4d046d330ff2a24d74fcf0aa', 'Pixel 8 Pro (Automated)', 'android', 0, '2026-09-20 11:56:42', '2026-09-20 11:56:42', '2026-09-20 11:56:42'),
(28, 27, '95c07592-61dd-4253-aaeb-bbafc30eab42', 'c3509647454e8f4705bce8f74cdde31bc2df2f44c37d688514ff622dd579f0bb', 'Mobile Device', 'android', 1, '2026-09-20 11:58:57', '2026-09-20 11:58:57', '2026-09-20 11:58:57'),
(29, 27, 'e2e-device-uuid-999', '01cc1c7e1f0515163a25522e8c777a752ccc65b673ede2ca6cc19646c87f6ee0', 'Pixel 8 Pro (Automated)', 'android', 0, '2026-09-20 11:58:57', '2026-09-20 11:58:57', '2026-09-20 11:58:58'),
(30, 28, 'e031d063-c1a9-4bca-8968-bc7e55d9af55', '4d39be38b101eb0d8713f26deb3e44cd5f54da05b8dace351eea25cba930bc84', 'Mobile Device', 'android', 1, '2026-09-20 12:15:17', '2026-09-20 12:15:17', '2026-09-20 12:15:17'),
(31, 29, '23285384-138a-4eaa-9321-d52cb27f6206', '6eb91dcf144299ea795c5820b26af7d50f9ffba6dfe08ec95b8ef5fb369c5c3a', 'Mobile Device', 'android', 1, '2026-09-20 12:15:21', '2026-09-20 12:15:21', '2026-09-20 12:15:21'),
(32, 28, 'test-device-err-01', '6b98ec7c0ed41fac63f824f522a695b194238dd17fd7b97d54b27e3a7d98b353', 'Mobile Device', 'android', 1, '2026-09-20 12:15:21', '2026-09-20 12:15:21', '2026-09-20 12:15:21'),
(33, 30, 'c5d6cc3e-d641-41c3-9de2-13266f87bb82', 'b2a40ccf3d05a7600b1877d166644c209c96a5688f1a22c0f96f026ac8122b67', 'Mobile Device', 'android', 1, '2026-09-20 12:15:22', '2026-09-20 12:15:22', '2026-09-20 12:15:22'),
(36, 1, 'dev_q7hhvgb0d_muasksgk', '6fc918921c14f5a984a1ad009738da01ef4b69396e98cb3f9edfabef309a9485', 'Mobile Device', 'android', 0, '2026-09-21 10:46:04', '2026-09-21 10:46:04', '2026-09-21 10:49:18'),
(41, 43, 'codex_final_visual_20260921', 'c0b10ee967b1e81feb3616cbe36960ea7066ab787177c90af6d0f2eac46f08a6', 'Final Visual QA', 'web', 1, '2026-09-21 12:12:32', '2026-09-21 12:12:32', '2026-09-21 12:12:32'),
(69, 1, 'dev_b58sj1flv_mu8cdi9y', '1e4f1fe4b9086033427e2c01b58898a6ed63963ecf4e84d275fd63b6feae3605', 'Mobile Device', 'web', 1, '2026-09-21 17:52:09', '2026-09-21 17:52:09', '2026-09-21 17:52:09'),
(70, 94, 'dev_4f6rf7xdv_mu8cdlfy', 'b458ec553314dc859842d38dcc508d486ded4fae8f047eb5dc2187a5eba41c17', 'Mobile Device', 'web', 1, '2026-09-22 17:23:32', '2026-09-21 18:01:26', '2026-09-22 17:23:32'),
(75, 94, 'dev_b58sj1flv_mu8cdi9y', 'bdd4023239007854c5c5faf757bff1ecd6eaf30b1d3b49c8712ae7efd03a31ae', 'Mobile Device', 'web', 1, '2026-09-23 18:40:15', '2026-09-21 23:33:05', '2026-09-23 18:40:15');

-- --------------------------------------------------------

--
-- Table structure for table `partner_earnings`
--

CREATE TABLE `partner_earnings` (
  `id` int(11) NOT NULL,
  `partner_id` int(11) NOT NULL,
  `lead_id` int(11) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `earning_type` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'available',
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `partner_earnings`
--

INSERT INTO `partner_earnings` (`id`, `partner_id`, `lead_id`, `amount`, `earning_type`, `status`, `description`, `created_at`) VALUES
(1, 1, NULL, 22500.00, 'commission', 'paid', 'Payout — FTL123455 (Lakshmi Traders)', '2026-09-18 17:25:52'),
(2, 1, NULL, 13750.00, 'commission', 'paid', 'Payout — FTL123449', '2026-09-18 17:25:52'),
(3, 1, NULL, 8500.00, 'commission', 'paid', 'Payout — FTL123441', '2026-09-18 17:25:52'),
(4, 1, NULL, 12500.00, 'commission', 'available', 'Commission — FTL123450 (Available for payout)', '2026-09-18 17:25:52'),
(5, 1, NULL, -1125.00, 'tds', 'paid', 'TDS deduction', '2026-09-18 17:25:52'),
(6, 1, NULL, -12500.00, 'payout', 'pending', 'Payout request PAY-078253', '2026-09-18 21:27:58'),
(7, 1, NULL, -12500.00, 'payout', 'paid', 'Payout request PAY-098617', '2026-09-19 15:14:58'),
(8, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-20 09:04:20'),
(9, 1, NULL, -2500.00, 'payout', 'pending', 'Payout request PAY-260264', '2026-09-20 09:04:20'),
(10, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-20 09:05:22'),
(11, 1, NULL, -2500.00, 'payout', 'pending', 'Payout request PAY-322220', '2026-09-20 09:05:22'),
(12, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-20 09:09:12'),
(13, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-552233', '2026-09-20 09:09:12'),
(14, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-552395', '2026-09-20 09:09:12'),
(15, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-552395: IFSC code invalid for NEFT settlement', '2026-09-20 09:09:12'),
(16, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-20 09:10:36'),
(17, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-20 09:12:06'),
(18, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-20 09:12:48'),
(19, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-768879', '2026-09-20 09:12:48'),
(20, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-769008', '2026-09-20 09:12:49'),
(21, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-769008: IFSC code invalid for NEFT settlement', '2026-09-20 09:12:49'),
(22, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-20 09:17:31'),
(23, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-051475', '2026-09-20 09:17:31'),
(24, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-051572', '2026-09-20 09:17:31'),
(25, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-051572: IFSC code invalid for NEFT settlement', '2026-09-20 09:17:31'),
(26, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-20 09:58:51'),
(27, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-531823', '2026-09-20 09:58:51'),
(28, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-532000', '2026-09-20 09:58:52'),
(29, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-532000: IFSC code invalid for NEFT settlement', '2026-09-20 09:58:52'),
(30, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-20 11:51:10'),
(31, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-270805', '2026-09-20 11:51:10'),
(32, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-270914', '2026-09-20 11:51:10'),
(33, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-270914: IFSC code invalid for NEFT settlement', '2026-09-20 11:51:10'),
(35, 26, 52, 2500.00, 'lead_commission', 'available', 'Personal Loan Commission', '2026-09-20 11:56:42'),
(36, 26, NULL, -1000.00, 'payout', 'pending', 'Payout request PAY-602888', '2026-09-20 11:56:42'),
(37, 27, 55, 2500.00, 'lead_commission', 'available', 'Personal Loan Commission', '2026-09-20 11:58:58'),
(38, 27, NULL, -1000.00, 'payout', 'pending', 'Payout request PAY-738394', '2026-09-20 11:58:58'),
(39, 28, 58, 14250.00, 'lead_commission', 'available', 'Commission for Personal Loan (Rule #1: 1.5% of ₹10,00,000 less 5% TDS: ₹750)', '2026-09-20 12:15:17'),
(40, 28, 59, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less 5% TDS: ₹10)', '2026-09-20 12:15:17'),
(41, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-20 12:29:04'),
(42, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-545180', '2026-09-20 12:29:05'),
(43, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-545399', '2026-09-20 12:29:05'),
(44, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-545399: IFSC code invalid for NEFT settlement', '2026-09-20 12:29:05'),
(45, 1, 64, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less 5% TDS: ₹10)', '2026-09-20 12:29:05'),
(46, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-21 11:20:37'),
(47, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-837152', '2026-09-21 11:20:37'),
(48, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-837298', '2026-09-21 11:20:37'),
(49, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-837298: IFSC code invalid for NEFT settlement', '2026-09-21 11:20:37'),
(50, 1, 69, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-21 11:20:37'),
(51, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-21 12:21:33'),
(52, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-493065', '2026-09-21 12:21:33'),
(53, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-493128', '2026-09-21 12:21:33'),
(54, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-493128: IFSC code invalid for NEFT settlement', '2026-09-21 12:21:33'),
(55, 1, 74, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-21 12:21:33'),
(56, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-21 13:22:01'),
(57, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-121137', '2026-09-21 13:22:01'),
(58, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-121274', '2026-09-21 13:22:01'),
(59, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-121274: IFSC code invalid for NEFT settlement', '2026-09-21 13:22:01'),
(60, 1, 82, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-21 13:22:01'),
(61, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-21 13:30:00'),
(62, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-600636', '2026-09-21 13:30:00'),
(63, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-600745', '2026-09-21 13:30:00'),
(64, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-600745: IFSC code invalid for NEFT settlement', '2026-09-21 13:30:00'),
(65, 1, 87, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-21 13:30:00'),
(66, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-21 16:21:10'),
(67, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-870935', '2026-09-21 16:21:10'),
(68, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-871059', '2026-09-21 16:21:11'),
(69, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-871059: IFSC code invalid for NEFT settlement', '2026-09-21 16:21:11'),
(70, 1, 93, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-21 16:21:11'),
(71, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-21 16:32:10'),
(72, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-530610', '2026-09-21 16:32:10'),
(73, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-530930', '2026-09-21 16:32:10'),
(74, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-530930: IFSC code invalid for NEFT settlement', '2026-09-21 16:32:10'),
(75, 1, 102, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-21 16:32:11'),
(76, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-21 16:33:30'),
(77, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-610288', '2026-09-21 16:33:30'),
(78, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-610362', '2026-09-21 16:33:30'),
(79, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-610362: IFSC code invalid for NEFT settlement', '2026-09-21 16:33:30'),
(80, 1, 107, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-21 16:33:30'),
(81, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-21 17:02:44'),
(82, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-364941', '2026-09-21 17:02:44'),
(83, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-365107', '2026-09-21 17:02:45'),
(84, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-365107: IFSC code invalid for NEFT settlement', '2026-09-21 17:02:45'),
(85, 1, 112, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-21 17:02:45'),
(86, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-21 17:03:33'),
(87, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-413529', '2026-09-21 17:03:33'),
(88, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-413612', '2026-09-21 17:03:33'),
(89, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-413612: IFSC code invalid for NEFT settlement', '2026-09-21 17:03:33'),
(90, 1, 117, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-21 17:03:33'),
(91, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-21 18:25:35'),
(92, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-336054', '2026-09-21 18:25:36'),
(93, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-336196', '2026-09-21 18:25:36'),
(94, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-336196: IFSC code invalid for NEFT settlement', '2026-09-21 18:25:36'),
(95, 1, 122, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-21 18:25:36'),
(96, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-22 00:39:27'),
(97, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-767958', '2026-09-22 00:39:27'),
(98, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-768212', '2026-09-22 00:39:28'),
(99, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-768212: IFSC code invalid for NEFT settlement', '2026-09-22 00:39:28'),
(100, 1, 124, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-22 00:39:28'),
(101, 1, 126, 4987.50, 'lead_commission', 'available', '1.5% loan commission approved by Super Admin for FTL123536', '2026-09-22 00:41:36'),
(102, 1, NULL, 950.00, 'lead_commission', 'available', 'Q1 Special Volume Performance Bonus', '2026-09-22 00:41:36'),
(103, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-22 11:49:16'),
(104, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-956963', '2026-09-22 11:49:16'),
(105, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-957123', '2026-09-22 11:49:17'),
(106, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-957123: IFSC code invalid for NEFT settlement', '2026-09-22 11:49:17'),
(107, 1, 130, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-22 11:49:17'),
(108, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-22 12:52:46'),
(109, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-766625', '2026-09-22 12:52:46'),
(110, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-766758', '2026-09-22 12:52:46'),
(111, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-766758: IFSC code invalid for NEFT settlement', '2026-09-22 12:52:46'),
(112, 1, 135, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-22 12:52:46'),
(113, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-22 14:58:37'),
(114, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-317578', '2026-09-22 14:58:37'),
(115, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-317662', '2026-09-22 14:58:37'),
(116, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-317662: IFSC code invalid for NEFT settlement', '2026-09-22 14:58:37'),
(117, 1, 140, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-22 14:58:37'),
(118, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-22 17:19:02'),
(119, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-743378', '2026-09-22 17:19:03'),
(120, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-743601', '2026-09-22 17:19:03'),
(121, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-743601: IFSC code invalid for NEFT settlement', '2026-09-22 17:19:03'),
(122, 1, 147, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-22 17:19:03'),
(123, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-22 18:27:16'),
(124, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-836704', '2026-09-22 18:27:16'),
(125, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-836911', '2026-09-22 18:27:16'),
(126, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-836911: IFSC code invalid for NEFT settlement', '2026-09-22 18:27:16'),
(127, 1, 155, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-22 18:27:17'),
(128, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-23 11:53:24'),
(129, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-604555', '2026-09-23 11:53:24'),
(130, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-604743', '2026-09-23 11:53:24'),
(131, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-604743: IFSC code invalid for NEFT settlement', '2026-09-23 11:53:24'),
(132, 1, 161, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-23 11:53:24'),
(133, 94, 157, 71250.00, 'lead_commission', 'available', 'Standard rule rate for Business Loan', '2026-09-23 12:22:11'),
(134, 94, 163, 9500.00, 'lead_commission', 'available', 'Commission for Business Loan (Rule #2: 1% of ₹10,00,000 less Configured 5% TDS: ₹500)', '2026-09-23 12:56:57'),
(135, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-23 13:33:18'),
(136, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-598992', '2026-09-23 13:33:18'),
(137, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-599105', '2026-09-23 13:33:19'),
(138, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-599105: IFSC code invalid for NEFT settlement', '2026-09-23 13:33:19'),
(139, 1, 167, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-23 13:33:19'),
(140, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-23 13:45:54'),
(141, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-354634', '2026-09-23 13:45:54'),
(142, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-354736', '2026-09-23 13:45:54'),
(143, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-354736: IFSC code invalid for NEFT settlement', '2026-09-23 13:45:54'),
(144, 1, 172, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-23 13:45:54'),
(145, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-23 14:32:40'),
(146, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-160754', '2026-09-23 14:32:40'),
(147, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-160907', '2026-09-23 14:32:40'),
(148, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-160907: IFSC code invalid for NEFT settlement', '2026-09-23 14:32:40'),
(149, 1, 177, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-23 14:32:41'),
(150, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-23 15:33:51'),
(151, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-23 15:35:58'),
(152, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-23 15:36:51'),
(153, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-011775', '2026-09-23 15:36:51'),
(154, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-011897', '2026-09-23 15:36:51'),
(155, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-011897: IFSC code invalid for NEFT settlement', '2026-09-23 15:36:51'),
(156, 1, 188, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-23 15:36:52'),
(157, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-23 15:38:10'),
(158, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-090212', '2026-09-23 15:38:10'),
(159, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-090353', '2026-09-23 15:38:10'),
(160, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-090353: IFSC code invalid for NEFT settlement', '2026-09-23 15:38:10'),
(161, 1, 193, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-23 15:38:10'),
(162, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-23 15:57:40'),
(163, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-261112', '2026-09-23 15:57:41'),
(164, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-261270', '2026-09-23 15:57:41'),
(165, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-261270: IFSC code invalid for NEFT settlement', '2026-09-23 15:57:41'),
(166, 1, 198, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-23 15:57:41'),
(167, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-23 18:10:04'),
(168, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-204433', '2026-09-23 18:10:04'),
(169, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-204596', '2026-09-23 18:10:04'),
(170, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-204596: IFSC code invalid for NEFT settlement', '2026-09-23 18:10:04'),
(171, 1, 203, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-23 18:10:04'),
(172, 1, NULL, 10000.00, 'commission', 'available', 'Test Credit for Financial Safety Test', '2026-09-23 18:55:12'),
(173, 1, NULL, -2500.00, 'payout', 'paid', 'Payout request PAY-912531', '2026-09-23 18:55:12'),
(174, 1, NULL, -1500.00, 'payout', 'rejected', 'Payout request PAY-912835', '2026-09-23 18:55:12'),
(175, 1, NULL, 1500.00, 'refund', 'available', 'Refund for rejected payout #PAY-912835: IFSC code invalid for NEFT settlement', '2026-09-23 18:55:12'),
(176, 1, 208, 190.00, 'lead_commission', 'available', 'Commission for Credit Card (Rule #3: Flat ₹200 less Configured 5% TDS: ₹10)', '2026-09-23 18:55:13');

-- --------------------------------------------------------

--
-- Table structure for table `partner_wallets`
--

CREATE TABLE `partner_wallets` (
  `id` int(11) NOT NULL,
  `partner_id` int(11) NOT NULL,
  `balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `earned_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `recharge_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_recharged` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_spent` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `partner_wallets`
--

INSERT INTO `partner_wallets` (`id`, `partner_id`, `balance`, `earned_balance`, `recharge_balance`, `total_recharged`, `total_spent`, `created_at`, `updated_at`) VALUES
(1, 43, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(2, 94, 4673.14, 0.00, 4673.14, 5000.00, 326.86, '2026-09-23 13:26:53', '2026-09-23 17:59:42'),
(3, 58, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(4, 171, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(5, 79, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(6, 90, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(7, 139, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(8, 52, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(9, 72, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(10, 19, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(11, 97, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(12, 162, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(13, 38, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(14, 150, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(15, 33, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(16, 16, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(17, 121, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(18, 85, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(19, 130, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(20, 105, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(21, 11, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(22, 23, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(23, 64, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(24, 46, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(25, 159, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(26, 157, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(27, 26, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(28, 29, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(29, 27, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(30, 28, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(31, 1, 38450.00, 38450.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 18:55:13'),
(32, 25, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(33, 30, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(34, 2, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:26:53', '2026-09-23 13:26:53'),
(64, 183, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:36:01', '2026-09-23 13:36:01'),
(65, 184, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 13:36:01', '2026-09-23 13:36:01'),
(88, 206, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 14:17:44', '2026-09-23 14:17:44'),
(89, 180, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 14:17:44', '2026-09-23 14:17:44'),
(97, 221, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-09-23 14:35:56', '2026-09-23 14:35:56'),
(101, 232, 500.00, 0.00, 500.00, 500.00, 0.00, '2026-09-23 15:27:53', '2026-09-23 15:27:53'),
(102, 233, 1500.00, 1500.00, 0.00, 0.00, 0.00, '2026-09-23 15:27:53', '2026-09-23 15:27:53'),
(103, 234, 133.18, 133.18, 0.00, 50.00, 0.00, '2026-09-23 15:27:53', '2026-09-23 15:27:53'),
(104, 235, 68.58, 0.00, 68.58, 150.00, 81.42, '2026-09-23 15:27:53', '2026-09-23 15:27:53'),
(105, 236, 800.00, 300.00, 500.00, 500.00, 0.00, '2026-09-23 15:27:53', '2026-09-23 15:27:53'),
(106, 237, 200.00, 0.00, 200.00, 200.00, 0.00, '2026-09-23 15:27:54', '2026-09-23 15:27:54'),
(107, 240, 500.00, 0.00, 500.00, 500.00, 0.00, '2026-09-23 15:29:24', '2026-09-23 15:29:24'),
(108, 241, 1500.00, 1500.00, 0.00, 0.00, 0.00, '2026-09-23 15:29:24', '2026-09-23 15:29:24'),
(109, 242, 133.18, 133.18, 0.00, 50.00, 0.00, '2026-09-23 15:29:24', '2026-09-23 15:29:24'),
(110, 243, 68.58, 0.00, 68.58, 150.00, 81.42, '2026-09-23 15:29:24', '2026-09-23 15:29:24'),
(111, 244, 800.00, 300.00, 500.00, 500.00, 0.00, '2026-09-23 15:29:24', '2026-09-23 15:29:24'),
(112, 245, 83.18, 0.00, 83.18, 200.00, 116.82, '2026-09-23 15:29:24', '2026-09-23 15:29:24');

-- --------------------------------------------------------

--
-- Table structure for table `partner_wallet_transactions`
--

CREATE TABLE `partner_wallet_transactions` (
  `id` bigint(20) NOT NULL,
  `partner_id` int(11) NOT NULL,
  `transaction_type` enum('CREDIT','DEBIT','REFUND','RESERVATION','RESERVATION_RELEASE','ADJUSTMENT') NOT NULL,
  `category` varchar(50) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `gst_percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `gst_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `net_amount` decimal(15,2) NOT NULL,
  `recharge_component` decimal(15,2) NOT NULL DEFAULT 0.00,
  `earned_component` decimal(15,2) NOT NULL DEFAULT 0.00,
  `balance_before` decimal(15,2) NOT NULL DEFAULT 0.00,
  `balance_after` decimal(15,2) NOT NULL DEFAULT 0.00,
  `description` varchar(255) DEFAULT NULL,
  `reference_id` varchar(100) DEFAULT NULL,
  `payment_gateway` varchar(30) DEFAULT NULL,
  `status` enum('PENDING','SUCCESS','FAILED') NOT NULL DEFAULT 'SUCCESS',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `partner_wallet_transactions`
--

INSERT INTO `partner_wallet_transactions` (`id`, `partner_id`, `transaction_type`, `category`, `amount`, `gst_percentage`, `gst_amount`, `net_amount`, `recharge_component`, `earned_component`, `balance_before`, `balance_after`, `description`, `reference_id`, `payment_gateway`, `status`, `created_at`) VALUES
(33, 94, 'CREDIT', 'DEV_TEST_CREDIT', 5000.00, 0.00, 0.00, 5000.00, 0.00, 0.00, 0.00, 5000.00, 'Local development test wallet credit', 'DEV-WALLET-94-20260923', NULL, 'SUCCESS', '2026-09-23 14:45:42'),
(34, 94, 'DEBIT', 'BUREAU_REPORT', 116.82, 0.00, 0.00, 116.82, 0.00, 0.00, 5000.00, 4883.18, 'CIBIL Report Pull', 'REP-38', NULL, 'SUCCESS', '2026-09-23 15:00:24'),
(35, 94, 'DEBIT', 'BUREAU_REPORT', 93.22, 18.00, 14.22, 79.00, 93.22, 0.00, 4883.18, 4789.96, 'EQUIFAX Credit Report Pull (Base: ₹79.00 + 18% GST)', 'REP-39', NULL, 'SUCCESS', '2026-09-23 15:17:38'),
(48, 232, 'CREDIT', 'WALLET_RECHARGE', 500.00, 0.00, 0.00, 500.00, 500.00, 0.00, 0.00, 500.00, 'Online Wallet Recharge', 'REC_ORD_101', 'CASHFREE', 'SUCCESS', '2026-09-23 15:27:53'),
(49, 233, 'CREDIT', 'COMMISSION', 1500.00, 0.00, 0.00, 1500.00, 0.00, 1500.00, 0.00, 1500.00, 'Commission Earning Credited', 'undefined', NULL, 'SUCCESS', '2026-09-23 15:27:53'),
(50, 234, 'CREDIT', 'WALLET_RECHARGE', 50.00, 0.00, 0.00, 50.00, 50.00, 0.00, 0.00, 50.00, 'Recharge', 'REC_50', 'CASHFREE', 'SUCCESS', '2026-09-23 15:27:53'),
(51, 234, 'CREDIT', 'COMMISSION', 200.00, 0.00, 0.00, 200.00, 0.00, 200.00, 50.00, 250.00, 'Commission Earning Credited', 'undefined', NULL, 'SUCCESS', '2026-09-23 15:27:53'),
(52, 234, 'RESERVATION', 'BUREAU_RESERVATION', 116.82, 18.00, 17.82, 99.00, 50.00, 66.82, 250.00, 133.18, 'CIBIL Report Reservation', 'BUREAU_INQ_1', NULL, 'PENDING', '2026-09-23 15:27:53'),
(53, 235, 'CREDIT', 'WALLET_RECHARGE', 150.00, 0.00, 0.00, 150.00, 150.00, 0.00, 0.00, 150.00, 'Recharge', 'REC_150', 'CASHFREE', 'SUCCESS', '2026-09-23 15:27:53'),
(54, 235, 'DEBIT', 'CRIF_REPORT', 81.42, 18.00, 12.42, 69.00, 81.42, 0.00, 150.00, 68.58, 'CRIF Credit Report Pull (Base: ₹69.00 + 18% GST)', 'CRIF_INQ_1', NULL, 'SUCCESS', '2026-09-23 15:27:53'),
(55, 236, 'CREDIT', 'WALLET_RECHARGE', 500.00, 0.00, 0.00, 500.00, 500.00, 0.00, 0.00, 500.00, 'Recharge', 'REC_500', 'CASHFREE', 'SUCCESS', '2026-09-23 15:27:53'),
(56, 236, 'CREDIT', 'COMMISSION', 300.00, 0.00, 0.00, 300.00, 0.00, 300.00, 500.00, 800.00, 'Commission Earning Credited', 'undefined', NULL, 'SUCCESS', '2026-09-23 15:27:53'),
(57, 236, 'DEBIT', 'PAYOUT', 250.00, 0.00, 0.00, 250.00, 0.00, 250.00, 800.00, 550.00, 'Payout Request PAYOUT_REQ_PASS', 'PAYOUT_REQ_PASS', NULL, 'SUCCESS', '2026-09-23 15:27:53'),
(58, 236, 'REFUND', 'PAYOUT_REVERTED', 250.00, 0.00, 0.00, 250.00, 0.00, 250.00, 550.00, 800.00, 'Bank account details invalid', 'PAYOUT_REFUND_1', NULL, 'SUCCESS', '2026-09-23 15:27:53'),
(59, 237, 'CREDIT', 'WALLET_RECHARGE', 200.00, 0.00, 0.00, 200.00, 200.00, 0.00, 0.00, 200.00, 'Fund for test inquiry', 'REC_INQ', 'CASHFREE', 'SUCCESS', '2026-09-23 15:27:54'),
(60, 94, 'DEBIT', 'BUREAU_REPORT', 93.22, 18.00, 14.22, 79.00, 93.22, 0.00, 4789.96, 4696.74, 'EXPERIAN Credit Report Pull (Base: ₹79.00 + 18% GST)', 'REP-41', NULL, 'SUCCESS', '2026-09-23 15:28:42'),
(61, 240, 'CREDIT', 'WALLET_RECHARGE', 500.00, 0.00, 0.00, 500.00, 500.00, 0.00, 0.00, 500.00, 'Online Wallet Recharge', 'REC_ORD_101', 'CASHFREE', 'SUCCESS', '2026-09-23 15:29:24'),
(62, 241, 'CREDIT', 'COMMISSION', 1500.00, 0.00, 0.00, 1500.00, 0.00, 1500.00, 0.00, 1500.00, 'Commission Earning Credited', 'undefined', NULL, 'SUCCESS', '2026-09-23 15:29:24'),
(63, 242, 'CREDIT', 'WALLET_RECHARGE', 50.00, 0.00, 0.00, 50.00, 50.00, 0.00, 0.00, 50.00, 'Recharge', 'REC_50', 'CASHFREE', 'SUCCESS', '2026-09-23 15:29:24'),
(64, 242, 'CREDIT', 'COMMISSION', 200.00, 0.00, 0.00, 200.00, 0.00, 200.00, 50.00, 250.00, 'Commission Earning Credited', 'undefined', NULL, 'SUCCESS', '2026-09-23 15:29:24'),
(65, 242, 'RESERVATION', 'BUREAU_RESERVATION', 116.82, 18.00, 17.82, 99.00, 50.00, 66.82, 250.00, 133.18, 'CIBIL Report Reservation', 'BUREAU_INQ_1', NULL, 'PENDING', '2026-09-23 15:29:24'),
(66, 243, 'CREDIT', 'WALLET_RECHARGE', 150.00, 0.00, 0.00, 150.00, 150.00, 0.00, 0.00, 150.00, 'Recharge', 'REC_150', 'CASHFREE', 'SUCCESS', '2026-09-23 15:29:24'),
(67, 243, 'DEBIT', 'CRIF_REPORT', 81.42, 18.00, 12.42, 69.00, 81.42, 0.00, 150.00, 68.58, 'CRIF Credit Report Pull (Base: ₹69.00 + 18% GST)', 'CRIF_INQ_1', NULL, 'SUCCESS', '2026-09-23 15:29:24'),
(68, 244, 'CREDIT', 'WALLET_RECHARGE', 500.00, 0.00, 0.00, 500.00, 500.00, 0.00, 0.00, 500.00, 'Recharge', 'REC_500', 'CASHFREE', 'SUCCESS', '2026-09-23 15:29:24'),
(69, 244, 'CREDIT', 'COMMISSION', 300.00, 0.00, 0.00, 300.00, 0.00, 300.00, 500.00, 800.00, 'Commission Earning Credited', 'undefined', NULL, 'SUCCESS', '2026-09-23 15:29:24'),
(70, 244, 'DEBIT', 'PAYOUT', 250.00, 0.00, 0.00, 250.00, 0.00, 250.00, 800.00, 550.00, 'Payout Request PAYOUT_REQ_PASS', 'PAYOUT_REQ_PASS', NULL, 'SUCCESS', '2026-09-23 15:29:24'),
(71, 244, 'REFUND', 'PAYOUT_REVERTED', 250.00, 0.00, 0.00, 250.00, 0.00, 250.00, 550.00, 800.00, 'Bank account details invalid', 'PAYOUT_REFUND_1', NULL, 'SUCCESS', '2026-09-23 15:29:24'),
(72, 245, 'CREDIT', 'WALLET_RECHARGE', 200.00, 0.00, 0.00, 200.00, 200.00, 0.00, 0.00, 200.00, 'Fund for test inquiry', 'REC_INQ', 'CASHFREE', 'SUCCESS', '2026-09-23 15:29:24'),
(73, 245, 'DEBIT', 'BUREAU_REPORT', 116.82, 18.00, 17.82, 99.00, 116.82, 0.00, 200.00, 83.18, 'CIBIL Credit Report Pull (Base: ₹99.00 + 18% GST)', 'REP-42', NULL, 'SUCCESS', '2026-09-23 15:29:24'),
(116, 1, 'DEBIT', 'PAYOUT', 2500.00, 0.00, 0.00, 2500.00, 0.00, 2500.00, 10000.00, 7500.00, 'Payout request PAY-011775', 'PAY-011775', NULL, 'SUCCESS', '2026-09-23 15:36:51'),
(117, 1, 'DEBIT', 'PAYOUT', 1500.00, 0.00, 0.00, 1500.00, 0.00, 1500.00, 7500.00, 6000.00, 'Payout request PAY-011897', 'PAY-011897', NULL, 'SUCCESS', '2026-09-23 15:36:51'),
(118, 1, 'REFUND', 'PAYOUT_REVERTED', 1500.00, 0.00, 0.00, 1500.00, 0.00, 1500.00, 6000.00, 7500.00, 'Refund for rejected payout #PAY-011897: IFSC code invalid for NEFT settlement', 'PAY-011897', NULL, 'SUCCESS', '2026-09-23 15:36:51'),
(119, 1, 'CREDIT', 'COMMISSION', 190.00, 0.00, 0.00, 190.00, 0.00, 190.00, 7500.00, 7690.00, 'Commission: Credit Card (FTL123572)', '156', NULL, 'SUCCESS', '2026-09-23 15:36:52'),
(121, 1, 'DEBIT', 'PAYOUT', 2500.00, 0.00, 0.00, 2500.00, 0.00, 2500.00, 17690.00, 15190.00, 'Payout request PAY-090212', 'PAY-090212', NULL, 'SUCCESS', '2026-09-23 15:38:10'),
(122, 1, 'DEBIT', 'PAYOUT', 1500.00, 0.00, 0.00, 1500.00, 0.00, 1500.00, 15190.00, 13690.00, 'Payout request PAY-090353', 'PAY-090353', NULL, 'SUCCESS', '2026-09-23 15:38:10'),
(123, 1, 'REFUND', 'PAYOUT_REVERTED', 1500.00, 0.00, 0.00, 1500.00, 0.00, 1500.00, 13690.00, 15190.00, 'Refund for rejected payout #PAY-090353: IFSC code invalid for NEFT settlement', 'PAY-090353', NULL, 'SUCCESS', '2026-09-23 15:38:10'),
(124, 1, 'CREDIT', 'COMMISSION', 190.00, 0.00, 0.00, 190.00, 0.00, 190.00, 15190.00, 15380.00, 'Commission: Credit Card (FTL123575)', '161', NULL, 'SUCCESS', '2026-09-23 15:38:10'),
(144, 94, 'CREDIT', 'DEV_TEST_CREDIT', 5000.00, 0.00, 0.00, 5000.00, 5000.00, 0.00, 0.00, 5000.00, 'Dev test credit for Credit Bureau verification', 'DEV-WALLET-P94-20260923', 'INTERNAL_TEST', 'SUCCESS', '2026-09-23 15:53:46'),
(145, 1, 'DEBIT', 'PAYOUT', 2500.00, 0.00, 0.00, 2500.00, 0.00, 2500.00, 25380.00, 22880.00, 'Payout request PAY-261112', 'PAY-261112', NULL, 'SUCCESS', '2026-09-23 15:57:41'),
(146, 1, 'DEBIT', 'PAYOUT', 1500.00, 0.00, 0.00, 1500.00, 0.00, 1500.00, 22880.00, 21380.00, 'Payout request PAY-261270', 'PAY-261270', NULL, 'SUCCESS', '2026-09-23 15:57:41'),
(147, 1, 'REFUND', 'PAYOUT_REVERTED', 1500.00, 0.00, 0.00, 1500.00, 0.00, 1500.00, 21380.00, 22880.00, 'Refund for rejected payout #PAY-261270: IFSC code invalid for NEFT settlement', 'PAY-261270', NULL, 'SUCCESS', '2026-09-23 15:57:41'),
(148, 1, 'CREDIT', 'COMMISSION', 190.00, 0.00, 0.00, 190.00, 0.00, 190.00, 22880.00, 23070.00, 'Commission: Credit Card (FTL123578)', '166', NULL, 'SUCCESS', '2026-09-23 15:57:41'),
(169, 94, 'DEBIT', 'BUREAU_REPORT', 116.82, 18.00, 17.82, 99.00, 116.82, 0.00, 5000.00, 4883.18, 'CIBIL Credit Report Pull (Base: ₹99.00 + 18% GST)', 'REP-57', NULL, 'SUCCESS', '2026-09-23 17:56:42'),
(170, 94, 'DEBIT', 'BUREAU_REPORT', 116.82, 18.00, 17.82, 99.00, 116.82, 0.00, 4883.18, 4766.36, 'CIBIL Credit Report Pull (Base: ₹99.00 + 18% GST)', 'REP-58', NULL, 'SUCCESS', '2026-09-23 17:58:09'),
(171, 94, 'DEBIT', 'BUREAU_REPORT', 93.22, 18.00, 14.22, 79.00, 93.22, 0.00, 4766.36, 4673.14, 'EXPERIAN Credit Report Pull (Base: ₹79.00 + 18% GST)', 'REP-59', NULL, 'SUCCESS', '2026-09-23 17:59:41'),
(172, 1, 'DEBIT', 'PAYOUT', 2500.00, 0.00, 0.00, 2500.00, 0.00, 2500.00, 33070.00, 30570.00, 'Payout request PAY-204433', 'PAY-204433', NULL, 'SUCCESS', '2026-09-23 18:10:04'),
(173, 1, 'DEBIT', 'PAYOUT', 1500.00, 0.00, 0.00, 1500.00, 0.00, 1500.00, 30570.00, 29070.00, 'Payout request PAY-204596', 'PAY-204596', NULL, 'SUCCESS', '2026-09-23 18:10:04'),
(174, 1, 'REFUND', 'PAYOUT_REVERTED', 1500.00, 0.00, 0.00, 1500.00, 0.00, 1500.00, 29070.00, 30570.00, 'Refund for rejected payout #PAY-204596: IFSC code invalid for NEFT settlement', 'PAY-204596', NULL, 'SUCCESS', '2026-09-23 18:10:04'),
(175, 1, 'CREDIT', 'COMMISSION', 190.00, 0.00, 0.00, 190.00, 0.00, 190.00, 30570.00, 30760.00, 'Commission: Credit Card (FTL123581)', '171', NULL, 'SUCCESS', '2026-09-23 18:10:04'),
(196, 1, 'DEBIT', 'PAYOUT', 2500.00, 0.00, 0.00, 2500.00, 0.00, 2500.00, 40760.00, 38260.00, 'Payout request PAY-912531', 'PAY-912531', NULL, 'SUCCESS', '2026-09-23 18:55:12'),
(197, 1, 'DEBIT', 'PAYOUT', 1500.00, 0.00, 0.00, 1500.00, 0.00, 1500.00, 38260.00, 36760.00, 'Payout request PAY-912835', 'PAY-912835', NULL, 'SUCCESS', '2026-09-23 18:55:12'),
(198, 1, 'REFUND', 'PAYOUT_REVERTED', 1500.00, 0.00, 0.00, 1500.00, 0.00, 1500.00, 36760.00, 38260.00, 'Refund for rejected payout #PAY-912835: IFSC code invalid for NEFT settlement', 'PAY-912835', NULL, 'SUCCESS', '2026-09-23 18:55:12'),
(199, 1, 'CREDIT', 'COMMISSION', 190.00, 0.00, 0.00, 190.00, 0.00, 190.00, 38260.00, 38450.00, 'Commission: Credit Card (FTL123584)', '176', NULL, 'SUCCESS', '2026-09-23 18:55:13');

-- --------------------------------------------------------

--
-- Table structure for table `payment_orders`
--

CREATE TABLE `payment_orders` (
  `id` bigint(20) NOT NULL,
  `order_id` varchar(100) NOT NULL,
  `partner_id` int(11) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'INR',
  `payment_gateway` varchar(30) NOT NULL,
  `gateway_order_id` varchar(100) DEFAULT NULL,
  `payment_session_id` varchar(255) DEFAULT NULL,
  `payment_id` varchar(100) DEFAULT NULL,
  `status` enum('CREATED','PENDING','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'CREATED',
  `raw_webhook_json` longtext DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payout_requests`
--

CREATE TABLE `payout_requests` (
  `id` int(11) NOT NULL,
  `partner_id` int(11) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'REQUESTED',
  `requested_at` datetime NOT NULL DEFAULT current_timestamp(),
  `processed_at` datetime DEFAULT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `settled_by` int(11) DEFAULT NULL,
  `settled_at` datetime DEFAULT NULL,
  `utr_number` varchar(100) DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payout_requests`
--

INSERT INTO `payout_requests` (`id`, `partner_id`, `amount`, `status`, `requested_at`, `processed_at`, `reference_number`, `reviewed_by`, `reviewed_at`, `approved_by`, `approved_at`, `settled_by`, `settled_at`, `utr_number`, `rejection_reason`) VALUES
(1, 1, 36250.00, 'completed', '2026-08-12 12:00:00', '2026-08-12 15:30:00', 'PAY-20260812-9921', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 1, 12500.00, 'processing', '2026-09-18 21:27:58', NULL, 'PAY-078253', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 1, 12500.00, 'completed', '2026-09-19 15:14:58', '2026-09-19 17:36:57', 'PAY-098617', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 1, 2500.00, 'REQUESTED', '2026-09-20 09:04:20', NULL, 'PAY-260264', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 1, 2500.00, 'UNDER_REVIEW', '2026-09-20 09:05:22', NULL, 'PAY-322220', 1, '2026-09-20 09:05:22', NULL, NULL, NULL, NULL, NULL, NULL),
(6, 1, 2500.00, 'PAID', '2026-09-20 09:09:12', NULL, 'PAY-552233', 1, '2026-09-20 09:09:12', 2, '2026-09-20 09:09:12', 1, '2026-09-20 09:09:12', 'UTR75552352', NULL),
(7, 1, 1500.00, 'REJECTED', '2026-09-20 09:09:12', NULL, 'PAY-552395', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(8, 1, 2500.00, 'PAID', '2026-09-20 09:12:48', NULL, 'PAY-768879', 1, '2026-09-20 09:12:48', 2, '2026-09-20 09:12:48', 1, '2026-09-20 09:12:48', 'UTR75768973', NULL),
(9, 1, 1500.00, 'REJECTED', '2026-09-20 09:12:49', NULL, 'PAY-769008', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(10, 1, 2500.00, 'PAID', '2026-09-20 09:17:31', NULL, 'PAY-051475', 1, '2026-09-20 09:17:31', 2, '2026-09-20 09:17:31', 1, '2026-09-20 09:17:31', 'UTR76051541', NULL),
(11, 1, 1500.00, 'REJECTED', '2026-09-20 09:17:31', NULL, 'PAY-051572', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(12, 1, 2500.00, 'PAID', '2026-09-20 09:58:51', NULL, 'PAY-531823', 1, '2026-09-20 09:58:51', 2, '2026-09-20 09:58:51', 1, '2026-09-20 09:58:51', 'UTR78531943', NULL),
(13, 1, 1500.00, 'REJECTED', '2026-09-20 09:58:52', NULL, 'PAY-532000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(14, 1, 2500.00, 'PAID', '2026-09-20 11:51:10', NULL, 'PAY-270805', 1, '2026-09-20 11:51:10', 2, '2026-09-20 11:51:10', 1, '2026-09-20 11:51:10', 'UTR85270877', NULL),
(15, 1, 1500.00, 'REJECTED', '2026-09-20 11:51:10', NULL, 'PAY-270914', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(16, 26, 1000.00, 'REQUESTED', '2026-09-20 11:56:42', NULL, 'PAY-602888', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(17, 27, 1000.00, 'UNDER_REVIEW', '2026-09-20 11:58:58', NULL, 'PAY-738394', 1, '2026-09-21 11:07:12', NULL, NULL, NULL, NULL, NULL, NULL),
(18, 1, 2500.00, 'PAID', '2026-09-20 12:29:05', NULL, 'PAY-545180', 1, '2026-09-20 12:29:05', 2, '2026-09-20 12:29:05', 1, '2026-09-20 12:29:05', 'UTR87545346', NULL),
(19, 1, 1500.00, 'REJECTED', '2026-09-20 12:29:05', NULL, 'PAY-545399', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(20, 1, 2500.00, 'PAID', '2026-09-21 11:20:37', NULL, 'PAY-837152', 1, '2026-09-21 11:20:37', 2, '2026-09-21 11:20:37', 1, '2026-09-21 11:20:37', 'UTR69837244', NULL),
(21, 1, 1500.00, 'REJECTED', '2026-09-21 11:20:37', NULL, 'PAY-837298', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(22, 1, 2500.00, 'PAID', '2026-09-21 12:21:33', NULL, 'PAY-493065', 1, '2026-09-21 12:21:33', 2, '2026-09-21 12:21:33', 1, '2026-09-21 12:21:33', 'UTR73493108', NULL),
(23, 1, 1500.00, 'REJECTED', '2026-09-21 12:21:33', NULL, 'PAY-493128', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(24, 1, 2500.00, 'PAID', '2026-09-21 13:22:01', NULL, 'PAY-121137', 1, '2026-09-21 13:22:01', 2, '2026-09-21 13:22:01', 1, '2026-09-21 13:22:01', 'UTR77121224', NULL),
(25, 1, 1500.00, 'REJECTED', '2026-09-21 13:22:01', NULL, 'PAY-121274', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(26, 1, 2500.00, 'PAID', '2026-09-21 13:30:00', NULL, 'PAY-600636', 1, '2026-09-21 13:30:00', 2, '2026-09-21 13:30:00', 1, '2026-09-21 13:30:00', 'UTR77600714', NULL),
(27, 1, 1500.00, 'REJECTED', '2026-09-21 13:30:00', NULL, 'PAY-600745', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(28, 1, 2500.00, 'PAID', '2026-09-21 16:21:10', NULL, 'PAY-870935', 1, '2026-09-21 16:21:10', 2, '2026-09-21 16:21:10', 1, '2026-09-21 16:21:11', 'UTR87871022', NULL),
(29, 1, 1500.00, 'REJECTED', '2026-09-21 16:21:11', NULL, 'PAY-871059', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(30, 1, 2500.00, 'PAID', '2026-09-21 16:32:10', NULL, 'PAY-530610', 1, '2026-09-21 16:32:10', 2, '2026-09-21 16:32:10', 1, '2026-09-21 16:32:10', 'UTR88530824', NULL),
(31, 1, 1500.00, 'REJECTED', '2026-09-21 16:32:10', NULL, 'PAY-530930', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(32, 1, 2500.00, 'PAID', '2026-09-21 16:33:30', NULL, 'PAY-610288', 1, '2026-09-21 16:33:30', 2, '2026-09-21 16:33:30', 1, '2026-09-21 16:33:30', 'UTR88610338', NULL),
(33, 1, 1500.00, 'REJECTED', '2026-09-21 16:33:30', NULL, 'PAY-610362', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(34, 1, 2500.00, 'PAID', '2026-09-21 17:02:44', NULL, 'PAY-364941', 1, '2026-09-21 17:02:44', 2, '2026-09-21 17:02:45', 1, '2026-09-21 17:02:45', 'UTR90365066', NULL),
(35, 1, 1500.00, 'REJECTED', '2026-09-21 17:02:45', NULL, 'PAY-365107', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(36, 1, 2500.00, 'PAID', '2026-09-21 17:03:33', NULL, 'PAY-413529', 1, '2026-09-21 17:03:33', 2, '2026-09-21 17:03:33', 1, '2026-09-21 17:03:33', 'UTR90413589', NULL),
(37, 1, 1500.00, 'REJECTED', '2026-09-21 17:03:33', NULL, 'PAY-413612', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(38, 1, 2500.00, 'PAID', '2026-09-21 18:25:36', NULL, 'PAY-336054', 1, '2026-09-21 18:25:36', 2, '2026-09-21 18:25:36', 1, '2026-09-21 18:25:36', 'UTR95336156', NULL),
(39, 1, 1500.00, 'REJECTED', '2026-09-21 18:25:36', NULL, 'PAY-336196', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(40, 1, 2500.00, 'PAID', '2026-09-22 00:39:27', NULL, 'PAY-767958', 1, '2026-09-22 00:39:28', 2, '2026-09-22 00:39:28', 1, '2026-09-22 00:39:28', 'UTR17768145', NULL),
(41, 1, 1500.00, 'REJECTED', '2026-09-22 00:39:28', NULL, 'PAY-768212', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(42, 1, 2500.00, 'PAID', '2026-09-22 11:49:16', NULL, 'PAY-956963', 1, '2026-09-22 11:49:16', 2, '2026-09-22 11:49:17', 1, '2026-09-22 11:49:17', 'UTR57957069', NULL),
(43, 1, 1500.00, 'REJECTED', '2026-09-22 11:49:17', NULL, 'PAY-957123', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(44, 1, 2500.00, 'PAID', '2026-09-22 12:52:46', NULL, 'PAY-766625', 1, '2026-09-22 12:52:46', 2, '2026-09-22 12:52:46', 1, '2026-09-22 12:52:46', 'UTR61766713', NULL),
(45, 1, 1500.00, 'REJECTED', '2026-09-22 12:52:46', NULL, 'PAY-766758', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(46, 1, 2500.00, 'PAID', '2026-09-22 14:58:37', NULL, 'PAY-317578', 1, '2026-09-22 14:58:37', 2, '2026-09-22 14:58:37', 1, '2026-09-22 14:58:37', 'UTR69317636', NULL),
(47, 1, 1500.00, 'REJECTED', '2026-09-22 14:58:37', NULL, 'PAY-317662', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(48, 1, 2500.00, 'PAID', '2026-09-22 17:19:03', NULL, 'PAY-743378', 1, '2026-09-22 17:19:03', 2, '2026-09-22 17:19:03', 1, '2026-09-22 17:19:03', 'UTR77743499', NULL),
(49, 1, 1500.00, 'REJECTED', '2026-09-22 17:19:03', NULL, 'PAY-743601', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(50, 1, 2500.00, 'PAID', '2026-09-22 18:27:16', NULL, 'PAY-836704', 1, '2026-09-22 18:27:16', 2, '2026-09-22 18:27:16', 1, '2026-09-22 18:27:16', 'UTR81836851', NULL),
(51, 1, 1500.00, 'REJECTED', '2026-09-22 18:27:16', NULL, 'PAY-836911', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(52, 1, 2500.00, 'PAID', '2026-09-23 11:53:24', NULL, 'PAY-604555', 1, '2026-09-23 11:53:24', 2, '2026-09-23 11:53:24', 1, '2026-09-23 11:53:24', 'UTR44604688', NULL),
(53, 1, 1500.00, 'REJECTED', '2026-09-23 11:53:24', NULL, 'PAY-604743', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(54, 1, 2500.00, 'PAID', '2026-09-23 13:33:18', NULL, 'PAY-598992', 1, '2026-09-23 13:33:19', 2, '2026-09-23 13:33:19', 1, '2026-09-23 13:33:19', 'UTR50599073', NULL),
(55, 1, 1500.00, 'REJECTED', '2026-09-23 13:33:19', NULL, 'PAY-599105', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(56, 1, 2500.00, 'PAID', '2026-09-23 13:45:54', NULL, 'PAY-354634', 1, '2026-09-23 13:45:54', 2, '2026-09-23 13:45:54', 1, '2026-09-23 13:45:54', 'UTR51354702', NULL),
(57, 1, 1500.00, 'REJECTED', '2026-09-23 13:45:54', NULL, 'PAY-354736', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(58, 1, 2500.00, 'PAID', '2026-09-23 14:32:40', NULL, 'PAY-160754', 1, '2026-09-23 14:32:40', 2, '2026-09-23 14:32:40', 1, '2026-09-23 14:32:40', 'UTR54160860', NULL),
(59, 1, 1500.00, 'REJECTED', '2026-09-23 14:32:40', NULL, 'PAY-160907', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(60, 1, 2500.00, 'PAID', '2026-09-23 15:36:51', NULL, 'PAY-011775', 1, '2026-09-23 15:36:51', 2, '2026-09-23 15:36:51', 1, '2026-09-23 15:36:51', 'UTR58011864', NULL),
(61, 1, 1500.00, 'REJECTED', '2026-09-23 15:36:51', NULL, 'PAY-011897', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(62, 1, 2500.00, 'PAID', '2026-09-23 15:38:10', NULL, 'PAY-090212', 1, '2026-09-23 15:38:10', 2, '2026-09-23 15:38:10', 1, '2026-09-23 15:38:10', 'UTR58090305', NULL),
(63, 1, 1500.00, 'REJECTED', '2026-09-23 15:38:10', NULL, 'PAY-090353', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(64, 1, 2500.00, 'PAID', '2026-09-23 15:57:41', NULL, 'PAY-261112', 1, '2026-09-23 15:57:41', 2, '2026-09-23 15:57:41', 1, '2026-09-23 15:57:41', 'UTR59261222', NULL),
(65, 1, 1500.00, 'REJECTED', '2026-09-23 15:57:41', NULL, 'PAY-261270', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(66, 1, 2500.00, 'PAID', '2026-09-23 18:10:04', NULL, 'PAY-204433', 1, '2026-09-23 18:10:04', 2, '2026-09-23 18:10:04', 1, '2026-09-23 18:10:04', 'UTR67204539', NULL),
(67, 1, 1500.00, 'REJECTED', '2026-09-23 18:10:04', NULL, 'PAY-204596', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement'),
(68, 1, 2500.00, 'PAID', '2026-09-23 18:55:12', NULL, 'PAY-912531', 1, '2026-09-23 18:55:12', 2, '2026-09-23 18:55:12', 1, '2026-09-23 18:55:12', 'UTR69912781', NULL),
(69, 1, 1500.00, 'REJECTED', '2026-09-23 18:55:12', NULL, 'PAY-912835', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'IFSC code invalid for NEFT settlement');

-- --------------------------------------------------------

--
-- Table structure for table `platform_integrations`
--

CREATE TABLE `platform_integrations` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `provider` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Connected',
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `platform_integrations`
--

INSERT INTO `platform_integrations` (`id`, `name`, `category`, `provider`, `status`, `description`, `created_at`, `updated_at`) VALUES
(1, 'CIBIL', 'Credit Bureau', 'TransUnion CIBIL', 'Connected', 'Real-time soft credit pull and score verification', '2026-09-19 18:05:33', '2026-09-21 11:46:04'),
(2, 'Experian', 'Credit Bureau', 'Experian India', 'Connected', 'Credit report validation and debt summary', '2026-09-19 18:05:33', '2026-09-21 11:46:15'),
(3, 'TransUnion', 'Credit Bureau', 'TransUnion', 'Connected', 'Secondary bureau check for loan eligibility', '2026-09-19 18:05:33', '2026-09-21 11:46:17'),
(4, 'Equifax', 'Credit Bureau', 'Equifax', 'Connected', 'Optional tertiary credit scoring integration', '2026-09-19 18:05:33', '2026-09-21 11:46:18'),
(5, 'WhatsApp API', 'Communication', 'Meta Cloud API', 'Connected', 'Transactional notifications, OTPs & lead updates', '2026-09-19 18:05:33', '2026-09-21 11:46:21'),
(6, 'Email SMTP', 'Communication', 'SendGrid / Amazon SES', 'Connected', 'Welcome emails, payout advisories & monthly statements', '2026-09-19 18:05:33', '2026-09-21 11:46:23'),
(7, 'Payment Gateway', 'Payments', 'RazorpayX / Cashfree', 'Connected', 'Automated IMPS/NEFT partner payout disbursal', '2026-09-19 18:05:33', '2026-09-21 11:46:25'),
(8, 'Accounting (Tally)', 'Finance', 'TallyPrime XML/REST', 'Connected', 'Automated ledger posting and TDS reconciliation', '2026-09-19 18:05:33', '2026-09-21 11:46:27');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `commission_type` varchar(50) DEFAULT 'percentage',
  `default_rate` decimal(10,2) DEFAULT 1.00,
  `status` varchar(50) DEFAULT 'Active',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `product_name`, `category`, `description`, `commission_type`, `default_rate`, `status`, `created_at`) VALUES
(1, 'Personal Loan', 'Personal Loan', NULL, 'percentage', 1.50, 'Active', '2026-09-19 18:05:33'),
(2, 'Business Loan', 'Business Loan', NULL, 'percentage', 1.00, 'Active', '2026-09-19 18:05:33'),
(3, 'Home Loan', 'Credit & Accounts', NULL, 'percentage', 0.85, 'Active', '2026-09-19 18:05:33'),
(4, 'Loan Against Property', 'Insurance/Finance', NULL, 'percentage', 0.90, 'Active', '2026-09-19 18:05:33'),
(5, 'Credit Cards', 'Personal/Finance', NULL, 'flat', 200.00, 'Active', '2026-09-19 18:05:33'),
(6, 'Term Insurance', 'Companies/Corp', NULL, 'percentage', 20.00, 'Active', '2026-09-19 18:05:33'),
(7, 'Health Insurance', 'Insurance', NULL, 'percentage', 18.00, 'Active', '2026-09-19 18:05:33'),
(8, 'Working Capital Loan', 'Business Loan', NULL, 'percentage', 1.25, 'Active', '2026-09-19 18:05:33');

-- --------------------------------------------------------

--
-- Table structure for table `support_tickets`
--

CREATE TABLE `support_tickets` (
  `id` int(11) NOT NULL,
  `ticket_number` varchar(50) NOT NULL,
  `partner_id` int(11) DEFAULT NULL,
  `partner_name` varchar(100) DEFAULT NULL,
  `subject` varchar(200) NOT NULL,
  `department` varchar(50) DEFAULT 'Operations',
  `status` varchar(50) DEFAULT 'Open',
  `priority` varchar(20) DEFAULT 'Normal',
  `description` text DEFAULT NULL,
  `resolution_note` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `support_tickets`
--

INSERT INTO `support_tickets` (`id`, `ticket_number`, `partner_id`, `partner_name`, `subject`, `department`, `status`, `priority`, `description`, `resolution_note`, `created_at`, `updated_at`) VALUES
(1, 'TKT-101', NULL, 'Rajesh Verma', 'Payout not received', 'Finance', 'Open', 'High', 'Requested withdrawal of Rs 25,250 on 18 Sep, still pending settlement', NULL, '2026-09-19 18:05:33', '2026-09-19 18:05:33'),
(2, 'TKT-102', NULL, 'Priya Sharma', 'KYC Issue', 'Operations', 'In-Progress', 'Medium', 'PAN document verification pending for 48 hours', NULL, '2026-09-19 18:05:33', '2026-09-19 18:05:33'),
(3, 'TKT-103', NULL, 'Amit Kumar', 'Portal access', 'IT', 'Resolved', 'Low', 'Reset mobile session token successfully', NULL, '2026-09-19 18:05:33', '2026-09-19 18:05:33'),
(4, 'TKT-104', NULL, 'Sunil Patil', 'Commission query', 'Finance', 'Open', 'Medium', 'Commission slab mismatch on Business Loan lead #L-1002', NULL, '2026-09-19 18:05:33', '2026-09-19 18:05:33'),
(5, 'TKT-105', 28, 'Rohan Deshmukh', 'Urgent commission disbursement check', 'Finance', 'Open', 'Normal', 'Query regarding Personal Loan commission for lead #58', NULL, '2026-09-20 12:15:17', '2026-09-20 12:15:17'),
(6, 'TKT-337791', 1, 'Rajesh Verma (Partner)', 'Automated E2E Verification Ticket 1789887733377', 'Operations', 'Resolved', 'High', 'Partner testing ticket roundtrip for freeze correction pass.', 'Helpdesk reviewed case. Document verification cleared and issue resolved at 2026-09-20T07:02:13.469Z', '2026-09-20 12:32:13', '2026-09-20 12:32:13'),
(7, 'TKT-845', NULL, 'Partner', 'API verification inquiry', 'General', 'Open', 'High', 'Verifying end-to-end multi-endpoint backend API integration.', NULL, '2026-09-22 18:24:53', '2026-09-22 18:24:53'),
(8, 'TKT-315', NULL, 'Partner', 'API verification inquiry', 'General', 'Open', 'High', 'Verifying end-to-end multi-endpoint backend API integration.', NULL, '2026-09-22 18:25:46', '2026-09-22 18:25:46'),
(9, 'TKT-298', NULL, 'Partner', 'API verification inquiry', 'General', 'Open', 'High', 'Verifying end-to-end multi-endpoint backend API integration.', NULL, '2026-09-22 18:26:36', '2026-09-22 18:26:36');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_permissions`
--
ALTER TABLE `admin_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permission_key` (`permission_key`);

--
-- Indexes for table `admin_roles`
--
ALTER TABLE `admin_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `admin_role_permissions`
--
ALTER TABLE `admin_role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_id` (`role_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `app_settings`
--
ALTER TABLE `app_settings`
  ADD PRIMARY KEY (`setting_key`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_id` (`admin_id`),
  ADD KEY `entity_type` (`entity_type`,`entity_id`),
  ADD KEY `created_at` (`created_at`);

--
-- Indexes for table `bureau_pricing`
--
ALTER TABLE `bureau_pricing`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bureau` (`bureau`),
  ADD KEY `idx_bp_active` (`is_active`);

--
-- Indexes for table `commission_rules`
--
ALTER TABLE `commission_rules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_name` (`product_name`,`partner_type`);

--
-- Indexes for table `credit_card_lead_details`
--
ALTER TABLE `credit_card_lead_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cc_lead` (`lead_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `insurance_lead_details`
--
ALTER TABLE `insurance_lead_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ins_lead` (`lead_id`);

--
-- Indexes for table `kyc_documents`
--
ALTER TABLE `kyc_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_kyc_partner` (`partner_id`);

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lead_code` (`lead_code`),
  ADD KEY `idx_leads_partner` (`partner_id`),
  ADD KEY `idx_leads_status` (`status`),
  ADD KEY `idx_leads_code` (`lead_code`),
  ADD KEY `idx_leads_mobile` (`mobile`);

--
-- Indexes for table `lead_documents`
--
ALTER TABLE `lead_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_docs_lead` (`lead_id`);

--
-- Indexes for table `lead_status_history`
--
ALTER TABLE `lead_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lsh_lead` (`lead_id`);

--
-- Indexes for table `lenders`
--
ALTER TABLE `lenders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `marketing_campaigns`
--
ALTER TABLE `marketing_campaigns`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notif_partner_created` (`partner_id`,`created_at`),
  ADD KEY `idx_notif_partner_unread` (`partner_id`,`is_read`);

--
-- Indexes for table `otp_sessions`
--
ALTER TABLE `otp_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_otp_mobile` (`mobile`),
  ADD KEY `idx_otp_created` (`created_at`);

--
-- Indexes for table `partners`
--
ALTER TABLE `partners`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `partner_code` (`partner_code`),
  ADD UNIQUE KEY `mobile` (`mobile`),
  ADD KEY `idx_partners_mobile` (`mobile`),
  ADD KEY `idx_partners_code` (`partner_code`);

--
-- Indexes for table `partner_audit_logs`
--
ALTER TABLE `partner_audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_partner_audit_actor` (`partner_id`,`created_at`),
  ADD KEY `idx_partner_audit_entity` (`entity_type`,`entity_id`);

--
-- Indexes for table `partner_cibil_reports`
--
ALTER TABLE `partner_cibil_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cibil_partner_created` (`partner_id`,`created_at`),
  ADD KEY `idx_cibil_status` (`status`);

--
-- Indexes for table `partner_devices`
--
ALTER TABLE `partner_devices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_partner_device` (`partner_id`,`device_id`);

--
-- Indexes for table `partner_earnings`
--
ALTER TABLE `partner_earnings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_earnings_partner` (`partner_id`),
  ADD KEY `idx_earnings_status` (`status`),
  ADD KEY `fk_earnings_lead` (`lead_id`);

--
-- Indexes for table `partner_wallets`
--
ALTER TABLE `partner_wallets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `partner_id` (`partner_id`),
  ADD KEY `idx_pw_partner` (`partner_id`);

--
-- Indexes for table `partner_wallet_transactions`
--
ALTER TABLE `partner_wallet_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pwt_partner` (`partner_id`,`created_at`),
  ADD KEY `idx_pwt_ref` (`reference_id`),
  ADD KEY `idx_pwt_cat_ref` (`partner_id`,`category`,`reference_id`);

--
-- Indexes for table `payment_orders`
--
ALTER TABLE `payment_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`),
  ADD KEY `idx_po_partner` (`partner_id`),
  ADD KEY `idx_po_gateway` (`payment_gateway`,`gateway_order_id`);

--
-- Indexes for table `payout_requests`
--
ALTER TABLE `payout_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payouts_partner` (`partner_id`);

--
-- Indexes for table `platform_integrations`
--
ALTER TABLE `platform_integrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_name` (`product_name`);

--
-- Indexes for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ticket_number` (`ticket_number`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_permissions`
--
ALTER TABLE `admin_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `admin_roles`
--
ALTER TABLE `admin_roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `admin_role_permissions`
--
ALTER TABLE `admin_role_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=631;

--
-- AUTO_INCREMENT for table `bureau_pricing`
--
ALTER TABLE `bureau_pricing`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `commission_rules`
--
ALTER TABLE `commission_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `credit_card_lead_details`
--
ALTER TABLE `credit_card_lead_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `insurance_lead_details`
--
ALTER TABLE `insurance_lead_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `kyc_documents`
--
ALTER TABLE `kyc_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=210;

--
-- AUTO_INCREMENT for table `lead_documents`
--
ALTER TABLE `lead_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `lead_status_history`
--
ALTER TABLE `lead_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=430;

--
-- AUTO_INCREMENT for table `lenders`
--
ALTER TABLE `lenders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `marketing_campaigns`
--
ALTER TABLE `marketing_campaigns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=276;

--
-- AUTO_INCREMENT for table `otp_sessions`
--
ALTER TABLE `otp_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=117;

--
-- AUTO_INCREMENT for table `partners`
--
ALTER TABLE `partners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=358;

--
-- AUTO_INCREMENT for table `partner_audit_logs`
--
ALTER TABLE `partner_audit_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=148;

--
-- AUTO_INCREMENT for table `partner_cibil_reports`
--
ALTER TABLE `partner_cibil_reports`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `partner_devices`
--
ALTER TABLE `partner_devices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=134;

--
-- AUTO_INCREMENT for table `partner_earnings`
--
ALTER TABLE `partner_earnings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=177;

--
-- AUTO_INCREMENT for table `partner_wallets`
--
ALTER TABLE `partner_wallets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=173;

--
-- AUTO_INCREMENT for table `partner_wallet_transactions`
--
ALTER TABLE `partner_wallet_transactions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=220;

--
-- AUTO_INCREMENT for table `payment_orders`
--
ALTER TABLE `payment_orders`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payout_requests`
--
ALTER TABLE `payout_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT for table `platform_integrations`
--
ALTER TABLE `platform_integrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_role_permissions`
--
ALTER TABLE `admin_role_permissions`
  ADD CONSTRAINT `admin_role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `admin_roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `admin_role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `admin_permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `credit_card_lead_details`
--
ALTER TABLE `credit_card_lead_details`
  ADD CONSTRAINT `fk_cc_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `insurance_lead_details`
--
ALTER TABLE `insurance_lead_details`
  ADD CONSTRAINT `fk_ins_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `kyc_documents`
--
ALTER TABLE `kyc_documents`
  ADD CONSTRAINT `fk_kyc_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `leads`
--
ALTER TABLE `leads`
  ADD CONSTRAINT `fk_leads_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`);

--
-- Constraints for table `lead_documents`
--
ALTER TABLE `lead_documents`
  ADD CONSTRAINT `fk_docs_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lead_status_history`
--
ALTER TABLE `lead_status_history`
  ADD CONSTRAINT `fk_lsh_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notif_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `partner_audit_logs`
--
ALTER TABLE `partner_audit_logs`
  ADD CONSTRAINT `fk_partner_audit_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`);

--
-- Constraints for table `partner_cibil_reports`
--
ALTER TABLE `partner_cibil_reports`
  ADD CONSTRAINT `fk_cibil_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`);

--
-- Constraints for table `partner_devices`
--
ALTER TABLE `partner_devices`
  ADD CONSTRAINT `partner_devices_ibfk_1` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `partner_earnings`
--
ALTER TABLE `partner_earnings`
  ADD CONSTRAINT `fk_earnings_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_earnings_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`);

--
-- Constraints for table `partner_wallets`
--
ALTER TABLE `partner_wallets`
  ADD CONSTRAINT `fk_pw_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`);

--
-- Constraints for table `partner_wallet_transactions`
--
ALTER TABLE `partner_wallet_transactions`
  ADD CONSTRAINT `fk_pwt_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`);

--
-- Constraints for table `payment_orders`
--
ALTER TABLE `payment_orders`
  ADD CONSTRAINT `fk_po_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`);

--
-- Constraints for table `payout_requests`
--
ALTER TABLE `payout_requests`
  ADD CONSTRAINT `fk_payouts_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
