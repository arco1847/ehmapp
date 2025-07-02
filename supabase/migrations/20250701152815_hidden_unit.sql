-- Healthcare Prescription Management System Database Schema
-- Database: EMP

CREATE DATABASE IF NOT EXISTS EMP;
USE EMP;

-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    insurance_provider VARCHAR(100),
    insurance_policy_number VARCHAR(100),
    insurance_group_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

-- Prescriptions Table
CREATE TABLE prescriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    medication VARCHAR(200) NOT NULL,
    strength VARCHAR(50),
    dosage VARCHAR(100) NOT NULL,
    quantity VARCHAR(50),
    doctor_name VARCHAR(100) NOT NULL,
    pharmacy_name VARCHAR(100),
    prescription_date DATE DEFAULT (CURRENT_DATE),
    refills INT DEFAULT 0,
    instructions TEXT,
    status ENUM('Active', 'Expired', 'Cancelled') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Doctors Table
CREATE TABLE doctors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    rating DECIMAL(2,1) DEFAULT 0.0,
    experience_years INT DEFAULT 0,
    location VARCHAR(200),
    phone VARCHAR(20),
    email VARCHAR(100),
    bio TEXT,
    education VARCHAR(200),
    languages JSON,
    accepts_insurance BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_specialty (specialty),
    INDEX idx_rating (rating),
    INDEX idx_location (location)
);

-- Appointments Table
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    doctor_id INT,
    doctor_name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INT DEFAULT 30,
    status ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled') DEFAULT 'Pending',
    type ENUM('In-Person', 'Telemedicine') DEFAULT 'In-Person',
    location VARCHAR(200),
    notes TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_status (status)
);

-- Doctor Availability Table
CREATE TABLE doctor_availability (
    id INT PRIMARY KEY AUTO_INCREMENT,
    doctor_id INT NOT NULL,
    available_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_doctor_date (doctor_id, available_date),
    INDEX idx_available_date (available_date)
);

-- Notifications Table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('medication', 'appointment', 'refill', 'general') DEFAULT 'general',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_scheduled_for (scheduled_for)
);

-- Medical History Table
CREATE TABLE medical_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    condition_name VARCHAR(200) NOT NULL,
    diagnosed_date DATE,
    status ENUM('Active', 'Resolved', 'Chronic') DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- Allergies Table
CREATE TABLE allergies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    allergen VARCHAR(200) NOT NULL,
    severity ENUM('Mild', 'Moderate', 'Severe') DEFAULT 'Mild',
    reaction TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_severity (severity)
);

-- Medication Reminders Table
CREATE TABLE medication_reminders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    prescription_id INT NOT NULL,
    reminder_time TIME NOT NULL,
    days_of_week JSON, -- ["Monday", "Tuesday", etc.]
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_prescription_id (prescription_id),
    INDEX idx_is_active (is_active)
);

-- Insert Sample Data

-- Sample Users
INSERT INTO users (first_name, last_name, email, phone, password_hash) VALUES
('John', 'Doe', 'john.doe@email.com', '+1-555-123-4567', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3Haa'),
('Jane', 'Smith', 'jane.smith@email.com', '+1-555-987-6543', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3Haa');

-- Sample Doctors
INSERT INTO doctors (name, specialty, rating, experience_years, location, phone, email, bio, education, languages, image_url) VALUES
('Dr. Sarah Johnson', 'Cardiologist', 4.9, 15, 'Heart Care Center, 123 Medical Ave', '+1-555-123-4567', 'sarah.johnson@heartcare.com', 'Dr. Johnson is a board-certified cardiologist with over 15 years of experience.', 'MD from Harvard Medical School', '["English", "Spanish"]', 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg'),
('Dr. Michael Brown', 'General Practitioner', 4.7, 12, 'Family Health Clinic, 456 Wellness Blvd', '+1-555-987-6543', 'michael.brown@familyhealth.com', 'Dr. Brown provides comprehensive primary care services.', 'MD from Johns Hopkins University', '["English"]', 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg'),
('Dr. Emily Davis', 'Dermatologist', 4.8, 10, 'Skin Health Clinic, 789 Beauty Lane', '+1-555-456-7890', 'emily.davis@skinhealth.com', 'Dr. Davis specializes in medical and cosmetic dermatology.', 'MD from Stanford University', '["English", "French"]', 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg');

-- Sample Doctor Availability
INSERT INTO doctor_availability (doctor_id, available_date, start_time, end_time) VALUES
(1, '2024-02-15', '09:00:00', '17:00:00'),
(1, '2024-02-16', '09:00:00', '17:00:00'),
(2, '2024-02-15', '08:00:00', '16:00:00'),
(2, '2024-02-16', '08:00:00', '16:00:00');