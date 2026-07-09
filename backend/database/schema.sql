-- ONGC Support Ticketing System Database Schema
-- Provider: MySQL
-- Database: ongc

CREATE DATABASE IF NOT EXISTS `ongc`;
USE `ongc`;

-- ==========================================
-- 1. Table: users
-- Description: Stores user credentials and profile details.
-- ==========================================
CREATE TABLE IF NOT EXISTS `users` (
    `username` VARCHAR(50) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `cpfId` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `mobileNo` VARCHAR(20) NOT NULL,
    `status` VARCHAR(50) DEFAULT NULL,
    PRIMARY KEY (`username`),
    UNIQUE KEY `idx_cpfId` (`cpfId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 2. Table: issues
-- Description: Stores support issues raised by users.
-- ==========================================
CREATE TABLE IF NOT EXISTS `issues` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `raisedBy` VARCHAR(50) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `attachment` JSON DEFAULT NULL,
    `createdAt` VARCHAR(50) NOT NULL,
    `reply` TEXT DEFAULT NULL,
    `repliedBy` VARCHAR(50) DEFAULT NULL,
    `resolvedAt` VARCHAR(50) DEFAULT NULL,
    `resolvedBy` VARCHAR(50) DEFAULT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_issues_raisedBy` FOREIGN KEY (`raisedBy`) REFERENCES `users` (`username`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_issues_repliedBy` FOREIGN KEY (`repliedBy`) REFERENCES `users` (`username`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_issues_resolvedBy` FOREIGN KEY (`resolvedBy`) REFERENCES `users` (`username`) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX `idx_issues_status` (`status`),
    INDEX `idx_issues_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. Table: solutions
-- Description: Stores knowledge base solutions for common issues.
-- ==========================================
CREATE TABLE IF NOT EXISTS `solutions` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `preview` TEXT NOT NULL,
    `author` VARCHAR(50) NOT NULL,
    `date` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_solutions_author` FOREIGN KEY (`author`) REFERENCES `users` (`username`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_solutions_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
