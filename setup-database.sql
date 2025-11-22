-- Database setup for Mathspedia extensions
-- Run this after MediaWiki installation

-- A/B Testing table
CREATE TABLE IF NOT EXISTS ab_test_versions (
    abt_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    abt_page VARCHAR(255) NOT NULL,
    abt_author VARCHAR(255) NOT NULL,
    abt_rank VARCHAR(50) NOT NULL,
    abt_content MEDIUMTEXT NOT NULL,
    abt_summary VARCHAR(255),
    abt_timestamp BINARY(14) NOT NULL,
    abt_feedback TEXT,
    INDEX idx_page (abt_page),
    INDEX idx_author (abt_author),
    INDEX idx_timestamp (abt_timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reported sources table
CREATE TABLE IF NOT EXISTS reported_sources (
    rs_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rs_source VARCHAR(500) NOT NULL,
    rs_reporter VARCHAR(255) NOT NULL,
    rs_reason ENUM('outdated', 'false') NOT NULL,
    rs_timestamp BINARY(14) NOT NULL,
    rs_resolved BOOLEAN DEFAULT FALSE,
    INDEX idx_source (rs_source(255)),
    INDEX idx_resolved (rs_resolved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

