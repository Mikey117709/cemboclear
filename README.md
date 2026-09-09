# CemboClear — Barangay Cembo Digital Clearance & E-Services Portal

![Barangay Cembo](https://img.shields.io/badge/Barangay-Cembo-15803d?style=for-the-badge)
![PHP](https://img.shields.io/badge/PHP-8.1+-777bb4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479a1?style=for-the-badge&logo=mysql&logoColor=white)
![Security](https://img.shields.io/badge/OWASP-Aligned-0284c7?style=for-the-badge)

CemboClear is a secure, web-based municipal clearance and document management platform developed for Barangay Cembo. The system modernizes public service administration by digitizing document applications, streamlining resident record verification, reducing physical processing queues, and ensuring transactional transparency across barangay operations.

---

## Overview

Traditionally, acquiring barangay certifications requires physical attendance, paper application processing, and manual record verification. CemboClear transitions these administrative workflows into an integrated, role-based digital system:

* **Residents:** Submit clearance and permit applications online 24/7, upload verified identification credentials, track review statuses in real time, and reserve designated appointment slots for document collection.
* **Barangay Staff:** Process incoming applications through an organized verification queue, inspect digital attachments, approve or reject requests with audit-tracked remarks, and issue certifications efficiently.
* **Barangay Administrators:** Manage staff authorization levels, review comprehensive audit trails, monitor municipal service metrics, and preserve data integrity across all barangay records.

---

## System Portals & Functional Scope

### Resident Portal
* **Digital Document Applications:** Online filing for essential barangay certifications:
  * Barangay Clearance (Employment, Local Travel, Identification)
  * Certificate of Indigency (Social Welfare, Financial Assistance)
  * Certificate of Residency
  * Business Permits and Barangay Endorsements
* **Status Tracking:** End-to-end lifecycle monitoring (`Pending Review`, `Approved`, `Processing`, `Ready for Pickup`, `Completed`).
* **Appointment Scheduling:** Automated slot reservation for physical document release and identity validation.
* **Attachment Handling:** Secure upload pipeline for government-issued identification cards and supporting requirements.
* **Notifications & Inquiries:** System-generated updates regarding application progress and official remarks.

### Staff Workstation
* **Centralized Verification Queue:** Consolidated processing inbox categorizing applications by urgency and filing date.
* **Record Cross-Verification:** Immediate cross-referencing of applicant profiles against resident databases.
* **Workflow Processing:** Standardized approval and rejection actions with mandatory administrative remarks.
* **Issuance Tracking:** Automated ledger recording document releases, tracking numbers, and assigned personnel.

### Administrator Control Center
* **Role-Based Access Control (RBAC):** Administrative provisioning, staff account maintenance, and privilege tiering.
* **Immutable Audit Trail:** Comprehensive event logging detailing logins, status alterations, profile modifications, and document approvals.
* **Operational Reporting:** Data-driven metrics tracking daily application throughput, peak transaction periods, and pending volume.

---

## Security & Architectural Standards

CemboClear adheres to the OWASP Application Security baseline across all architectural tiers:

* **SQL Injection Prevention:** Database access is strictly parameterized using PDO prepared statements with native driver binding.
* **Cross-Site Request Forgery (CSRF):** Cryptographic token generation and mandatory verification across all state-altering requests.
* **Session Protection:** Session identifiers are regenerated upon authentication, configured with `HttpOnly`, `SameSite=Lax`, and `Secure` cookie attributes.
* **Rate Limiting:** IP and key-based throttlers prevent brute-force attacks against authentication and sensitive submission routes.
* **Cross-Site Scripting (XSS) Mitigation:** Strict context-aware output encoding and structured server-side sanitization.
* **File Upload Hardening:** Strict MIME type validation, binary header inspection, file extension whitelisting, and strict size restrictions.

---

## Technology Stack

| Component | Specification | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML5 / CSS3 / Vanilla JavaScript | High-performance, dependency-free client architecture |
| **Backend** | Native PHP 8.1+ | Vertical feature-slice structure with centralized routing |
| **Database** | MySQL 8.0+ | Relational schema with foreign key integrity and constraints |
| **Web Server** | Apache (XAMPP-compatible) | URL rewriting and directory protections via `.htaccess` |

---

## Local Setup & Deployment

### 1. Prerequisites
* **PHP 8.1 or higher** (with `pdo_mysql` extension enabled)
* **MySQL 8.0 or higher**
* **Apache HTTP Server** (e.g., XAMPP) or PHP CLI

### 2. Database Initialization
```sql
CREATE DATABASE cemboclear CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Import the database schema:
```bash
mysql -u root -p cemboclear < schema.sql
```

### 3. Environment Configuration
Verify your database connection parameters in `config.php`:
```php
return [
    'db' => [
        'host' => '127.0.0.1',
        'port' => 3306,
        'name' => 'cemboclear',
        'user' => 'root',
        'pass' => '',
    ],
    // ...
];
```

### 4. Application Access
Run using the built-in development server:
```bash
php -S localhost:8000 -t public
```

Or deploy under your local web server root (e.g., `C:\xampp\htdocs\cemboclear`) and access the designated entry points:
* **Resident Portal:** `http://localhost/cemboclear/public/Resident.html`
* **Staff Portal:** `http://localhost/cemboclear/public/Staff.html`
* **Admin Portal:** `http://localhost/cemboclear/public/Admin.html`

---

## Authors & Maintainers

* **Mikey** ([@Mikey117709](https://github.com/Mikey117709)) — Backend Architecture, Database Design & Security Implementation
* **Aldrin Skyler** ([@aldrinskyler](https://github.com/aldrinskyler)) — UI/UX Engineering, Client Runtime & Frontend Integration

---

*Barangay Cembo E-Services System.*
