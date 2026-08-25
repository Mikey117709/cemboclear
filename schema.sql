SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS staff;
CREATE TABLE staff (
    id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    email         VARCHAR(255)  NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    phone         VARCHAR(30)   NULL,

    first_name    VARCHAR(100)  NOT NULL,
    middle_name   VARCHAR(100)  NULL,
    last_name     VARCHAR(100)  NOT NULL,
    position      VARCHAR(100)  NULL,
    branch        VARCHAR(150)  NULL,
    birthdate     DATE          NULL,

    is_verified   TINYINT(1)    NOT NULL DEFAULT 1,
    status        ENUM('active','inactive') NOT NULL DEFAULT 'active',
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                   ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_staff_email (email),
    KEY idx_staff_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS residents;
CREATE TABLE residents (
    id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,

    email         VARCHAR(255)  NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    phone         VARCHAR(30)   NOT NULL,

    first_name    VARCHAR(100)  NOT NULL,
    middle_name   VARCHAR(100)  NULL,
    last_name     VARCHAR(100)  NOT NULL,
    suffix        VARCHAR(20)   NULL,
    birthdate     DATE          NOT NULL,
    gender        ENUM('male','female','other') NOT NULL,

    civil_status  VARCHAR(40)   NULL,
    birth_place   VARCHAR(150)  NULL,
    address       VARCHAR(255)  NULL,
    purok         VARCHAR(20)   NULL,
    citizenship   VARCHAR(100)  NULL,
    control_no    VARCHAR(40)   NULL,

    is_verified   TINYINT(1)    NOT NULL DEFAULT 0,
    registry_status ENUM('pending','verified','outdated') NOT NULL DEFAULT 'pending',
    account_status  ENUM('active','inactive') NOT NULL DEFAULT 'active',
    last_census_at  DATE          NULL,
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                   ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_residents_email (email),
    UNIQUE KEY uq_residents_control_no (control_no),
    KEY idx_residents_phone (phone),
    KEY idx_residents_name (last_name, first_name),
    KEY idx_residents_registry_status (registry_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS agencies;
CREATE TABLE agencies (
    id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)  NOT NULL,
    description TEXT          NULL,
    icon        VARCHAR(100)  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_agencies_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS request_types;
CREATE TABLE request_types (
    id        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    agency_id INT UNSIGNED  NOT NULL,
    name      VARCHAR(150)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_request_types_agency (agency_id),
    CONSTRAINT fk_request_types_agency FOREIGN KEY (agency_id)
        REFERENCES agencies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS requests;
CREATE TABLE requests (
    id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
    ticket_id       VARCHAR(40)  NOT NULL,
    resident_id     INT UNSIGNED NOT NULL,
    agency_id       INT UNSIGNED NOT NULL,
    request_type_id INT UNSIGNED NULL,
    subject         VARCHAR(150) NULL,
    details         TEXT         NULL,
    status          ENUM('pending_review','reviewed','resolved','closed')
                        NOT NULL DEFAULT 'pending_review',
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_requests_ticket (ticket_id),
    KEY idx_requests_resident (resident_id),
    KEY idx_requests_agency (agency_id),
    KEY idx_requests_status (status),
    CONSTRAINT fk_requests_resident FOREIGN KEY (resident_id)
        REFERENCES residents(id) ON DELETE CASCADE,
    CONSTRAINT fk_requests_agency FOREIGN KEY (agency_id)
        REFERENCES agencies(id) ON DELETE CASCADE,
    CONSTRAINT fk_requests_type FOREIGN KEY (request_type_id)
        REFERENCES request_types(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS attachments;
CREATE TABLE attachments (
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    request_id  INT UNSIGNED NULL,
    resident_id INT UNSIGNED NULL,
    kind        ENUM('signature','valid_id','supporting_document') NOT NULL,
    file_name   VARCHAR(255) NOT NULL,
    file_path   VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_attachments_request (request_id),
    KEY idx_attachments_resident (resident_id),
    KEY idx_attachments_kind (kind),
    CONSTRAINT fk_attachments_request FOREIGN KEY (request_id)
        REFERENCES requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_attachments_resident FOREIGN KEY (resident_id)
        REFERENCES residents(id) ON DELETE CASCADE,
    CONSTRAINT chk_attachments_target CHECK (request_id IS NOT NULL OR resident_id IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS certificate_purposes;
CREATE TABLE certificate_purposes (
    id   INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    name VARCHAR(150)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_cert_purposes_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS certificate_applications;
CREATE TABLE certificate_applications (
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    resident_id INT UNSIGNED NOT NULL,
    purpose_id  INT UNSIGNED NOT NULL,
    status      ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    applied_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_cert_app_resident (resident_id),
    KEY idx_cert_app_purpose (purpose_id),
    CONSTRAINT fk_cert_app_resident FOREIGN KEY (resident_id)
        REFERENCES residents(id) ON DELETE CASCADE,
    CONSTRAINT fk_cert_app_purpose FOREIGN KEY (purpose_id)
        REFERENCES certificate_purposes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS appointments;
CREATE TABLE appointments (
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    resident_id INT UNSIGNED NOT NULL,
    appt_date   DATE         NOT NULL,
    time_slot   VARCHAR(30)  NOT NULL,
    status      ENUM('booked','available','cancelled') NOT NULL DEFAULT 'booked',
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_appointments_resident (resident_id),
    KEY idx_appointments_date (appt_date),
    KEY idx_appointments_slot (appt_date, time_slot),
    CONSTRAINT fk_appointments_resident FOREIGN KEY (resident_id)
        REFERENCES residents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS mail;
CREATE TABLE mail (
    id                     INT UNSIGNED NOT NULL AUTO_INCREMENT,
    sender_staff_id        INT UNSIGNED NULL,
    sender_resident_id     INT UNSIGNED NULL,
    recipient_staff_id     INT UNSIGNED NULL,
    recipient_resident_id  INT UNSIGNED NULL,
    subject                VARCHAR(255) NULL,
    body                   TEXT         NULL,
    is_read                TINYINT(1)   NOT NULL DEFAULT 0,
    is_archived            TINYINT(1)   NOT NULL DEFAULT 0,
    created_at             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_mail_sender_staff (sender_staff_id),
    KEY idx_mail_sender_resident (sender_resident_id),
    KEY idx_mail_recipient_staff (recipient_staff_id),
    KEY idx_mail_recipient_resident (recipient_resident_id),
    CONSTRAINT fk_mail_sender_staff FOREIGN KEY (sender_staff_id)
        REFERENCES staff(id) ON DELETE CASCADE,
    CONSTRAINT fk_mail_sender_resident FOREIGN KEY (sender_resident_id)
        REFERENCES residents(id) ON DELETE CASCADE,
    CONSTRAINT fk_mail_recipient_staff FOREIGN KEY (recipient_staff_id)
        REFERENCES staff(id) ON DELETE CASCADE,
    CONSTRAINT fk_mail_recipient_resident FOREIGN KEY (recipient_resident_id)
        REFERENCES residents(id) ON DELETE CASCADE,
    CONSTRAINT chk_mail_sender CHECK
        ((sender_staff_id IS NOT NULL AND sender_resident_id IS NULL)
          OR (sender_staff_id IS NULL AND sender_resident_id IS NOT NULL)),
    CONSTRAINT chk_mail_recipient CHECK
        ((recipient_staff_id IS NOT NULL AND recipient_resident_id IS NULL)
          OR (recipient_staff_id IS NULL AND recipient_resident_id IS NOT NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
    id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
    staff_id        INT UNSIGNED NULL,
    resident_id     INT UNSIGNED NULL,
    message         VARCHAR(255) NOT NULL,
    is_read         TINYINT(1)   NOT NULL DEFAULT 0,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_notifications_staff (staff_id),
    KEY idx_notifications_resident (resident_id),
    CONSTRAINT fk_notifications_staff FOREIGN KEY (staff_id)
        REFERENCES staff(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_resident FOREIGN KEY (resident_id)
        REFERENCES residents(id) ON DELETE CASCADE,
    CONSTRAINT chk_notifications_target CHECK
        ((staff_id IS NOT NULL AND resident_id IS NULL)
          OR (staff_id IS NULL AND resident_id IS NOT NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
    id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
    staff_id        INT UNSIGNED NULL,
    action          VARCHAR(255) NOT NULL,
    ip_address      VARCHAR(45)  NULL,
    security_status ENUM('authorized','unauthorized') NOT NULL DEFAULT 'authorized',
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_audit_staff (staff_id),
    KEY idx_audit_created (created_at),
    CONSTRAINT fk_audit_staff FOREIGN KEY (staff_id)
        REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS transactions;
CREATE TABLE transactions (
    id             INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    resident_id    INT UNSIGNED    NOT NULL,
    description    VARCHAR(255)    NULL,
    amount         DECIMAL(12,2)   NULL,
    transacted_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_transactions_resident (resident_id),
    CONSTRAINT fk_transactions_resident FOREIGN KEY (resident_id)
        REFERENCES residents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO staff (email, password_hash, phone, first_name, middle_name, last_name, position, branch, birthdate, is_verified, status, created_at, updated_at) VALUES
    ('michael.nieva@cemboclear.gov', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 912 345 6789', 'Michael', 'Vernice', 'Nieva', 'System Administrator', 'Cembo Barangay Office', '1988-08-14', 1, 'active', NOW(), NOW()),
    ('lara.abao@cemboclear.gov', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 917 000 1111', 'Lara', 'Mae', 'Abao', 'Encoder', 'Cembo Barangay Office', NULL, 1, 'active', NOW(), NOW()),
    ('andrea.gultiano@cemboclear.gov', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 917 000 2222', 'Andrea', NULL, 'Gultiano', 'Encoder', 'Cembo Barangay Office', NULL, 1, 'active', NOW(), NOW()),
    ('ellen.degeneres@cemboclear.gov', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 917 100 0001', 'Ellen', 'Lee', 'DeGeneres', 'System Administrator', 'Cembo Barangay Office', '1958-01-26', 1, 'active', NOW(), NOW()),
    ('rupaul.charles@cemboclear.gov', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 917 100 0002', 'RuPaul', 'Andre', 'Charles', 'Registrar', 'Cembo Barangay Office', '1960-11-17', 1, 'active', NOW(), NOW()),
    ('laverne.cox@cemboclear.gov', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 917 100 0003', 'Laverne', NULL, 'Cox', 'Encoder', 'Cembo Barangay Office', '1972-05-29', 1, 'active', NOW(), NOW()),
    ('billy.porter@cemboclear.gov', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 917 100 0004', 'Billy', NULL, 'Porter', 'Encoder', 'Cembo Barangay Office', '1969-09-21', 1, 'active', NOW(), NOW()),
    ('lily.tomlin@cemboclear.gov', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 917 100 0005', 'Lily', 'Marie', 'Tomlin', 'Records Officer', 'Cembo Barangay Office', '1939-09-01', 1, 'active', NOW(), NOW()),
    ('anderson.cooper@cemboclear.gov', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 917 100 0006', 'Anderson', 'Landon', 'Cooper', 'Encoder', 'Cembo Barangay Office', '1967-06-03', 1, 'inactive', NOW(), NOW());

INSERT INTO residents (email, password_hash, phone, first_name, middle_name, last_name, suffix, birthdate, gender, civil_status, birth_place, address, purok, citizenship, control_no, is_verified, registry_status, account_status, last_census_at, created_at, updated_at) VALUES
    ('juan.delacruz@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 917 123 4567', 'Juan', 'M.', 'Dela Cruz', NULL, '1990-01-15', 'male', 'Single', 'Taguig City', '#12 Street Name, Purok 4', 'Purok 4', 'Filipino', 'CC-2026-0101', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('maria.santos@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 917 222 3333', 'Maria', 'L.', 'Santos', NULL, '1985-06-20', 'female', 'Married', 'Manila City', '#45 Avenue Rd, Purok 1', 'Purok 1', 'Filipino', 'CC-2026-0113', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('pedro.alcantara@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 917 444 5555', 'Pedro', 'A.', 'Alcantara', NULL, '1995-11-02', 'male', 'Single', 'Quezon City', '#8 Main St, Purok 2', 'Purok 2', 'Filipino', 'CC-2026-0102', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('wanda.sykes@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 918 089 9674', 'Wanda', 'R.', 'Sykes', NULL, '1962-01-24', 'female', 'Widowed', 'Manila City', '#18 Kalayaan Ave., Purok 4', 'Purok 4', 'Filipino', 'CC-2026-0120', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('janelle.monae@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 913 459 9654', 'Janelle', 'B.', 'Monae', NULL, '1968-04-17', 'female', 'Single', 'Taguig City', '#92 Maharlika St., Purok 4', 'Purok 4', 'Filipino', 'CC-2026-0121', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('brandi.carlile@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 915 104 1519', 'Brandi', 'A.', 'Carlile', NULL, '2003-03-23', 'female', 'Separated', 'Quezon City', '#20 General Luna St., Purok 5', 'Purok 5', 'Filipino', 'CC-2026-0122', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('tegan.quin@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 916 080 9044', 'Tegan', 'M.', 'Quin', NULL, '1993-05-26', 'female', 'Single', 'Paranaque City', '#69 Kalayaan Ave., Purok 8', 'Purok 8', 'Filipino', 'CC-2026-0123', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('hayley.kiyoko@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 914 081 3814', 'Hayley', 'P.', 'Kiyoko', NULL, '1978-10-07', 'female', 'Single', 'Taguig City', '#85 General Luna St., Purok 1', 'Purok 1', 'Filipino', 'CC-2026-0124', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('tracy.chapman@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 911 623 2803', 'Tracy', 'J.', 'Chapman', NULL, '1995-06-06', 'female', 'Widowed', 'Quezon City', '#86 Rizal St., Purok 4', 'Purok 4', 'Filipino', 'CC-2026-0125', 0, 'pending', 'active', NULL, NOW(), NOW()),
    ('kd.lang@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 910 234 0525', 'K.D.', 'C.', 'Lang', NULL, '1984-07-09', 'female', 'Single', 'Paranaque City', '#88 Bonifacio Ave., Purok 4', 'Purok 4', 'Filipino', 'CC-2026-0126', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('marshap.johnson@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 912 271 2287', 'Marsha P.', 'B.', 'Johnson', NULL, '1968-10-23', 'female', 'Widowed', 'Manila City', '#51 E. Jacinto St., Purok 8', 'Purok 8', 'Filipino', 'CC-2026-0127', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('sylvia.rivera@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 912 521 8085', 'Sylvia', 'N.', 'Rivera', NULL, '1971-12-19', 'female', 'Separated', 'Pasig City', '#47 General Luna St., Purok 7', 'Purok 7', 'Filipino', 'CC-2026-0128', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('sally.ride@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 919 479 8669', 'Sally', 'B.', 'Ride', NULL, '1964-11-06', 'female', 'Single', 'Makati City', '#50 Maharlika St., Purok 2', 'Purok 2', 'Filipino', 'CC-2026-0129', 1, 'verified', 'inactive', '2026-08-01', NOW(), NOW()),
    ('billiejean.king@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 911 300 7123', 'Billie Jean', 'A.', 'King', NULL, '1998-12-04', 'female', 'Single', 'Pasig City', '#99 Bonifacio Ave., Purok 5', 'Purok 5', 'Filipino', 'CC-2026-0130', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('rachel.maddow@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 918 623 3258', 'Rachel', 'S.', 'Maddow', NULL, '2001-05-17', 'female', 'Married', 'Pasig City', '#112 Rizal St., Purok 2', 'Purok 2', 'Filipino', 'CC-2026-0131', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('samira.wiley@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 915 899 5038', 'Samira', 'C.', 'Wiley', NULL, '1989-09-01', 'female', 'Single', 'Quezon City', '#3 Kalayaan Ave., Purok 8', 'Purok 8', 'Filipino', 'CC-2026-0132', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('lena.waithe@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 918 169 4342', 'Lena', 'P.', 'Waithe', NULL, '1960-02-24', 'female', 'Separated', 'Taguig City', '#17 E. Jacinto St., Purok 3', 'Purok 3', 'Filipino', 'CC-2026-0133', 0, 'pending', 'active', NULL, NOW(), NOW()),
    ('jazz.jennings@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 916 687 6118', 'Jazz', 'L.', 'Jennings', NULL, '1968-09-25', 'female', 'Single', 'Paranaque City', '#92 Rizal St., Purok 4', 'Purok 4', 'Filipino', 'CC-2026-0134', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('gigi.gorgeous@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 919 225 0117', 'Gigi', 'J.', 'Gorgeous', NULL, '1962-04-08', 'female', 'Single', 'Quezon City', '#76 General Luna St., Purok 1', 'Purok 1', 'Filipino', 'CC-2026-0135', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('nikkie.dejager@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 913 552 2167', 'Nikkie', 'A.', 'De Jager', NULL, '1969-02-02', 'female', 'Widowed', 'Taguig City', '#36 E. Jacinto St., Purok 4', 'Purok 4', 'Filipino', 'CC-2026-0136', 1, 'outdated', 'active', NULL, NOW(), NOW()),
    ('audre.lorde@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 916 362 6939', 'Audre', 'P.', 'Lorde', NULL, '1991-08-08', 'female', 'Separated', 'Makati City', '#13 Kalayaan Ave., Purok 4', 'Purok 4', 'Filipino', 'CC-2026-0137', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('tim.cook@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 911 254 3139', 'Tim', 'S.', 'Cook', NULL, '1958-11-21', 'male', 'Single', 'Taguig City', '#52 Bonifacio Ave., Purok 1', 'Purok 1', 'Filipino', 'CC-2026-0138', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('jim.parsons@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 910 667 8856', 'Jim', 'C.', 'Parsons', NULL, '1982-03-09', 'male', 'Separated', 'Manila City', '#57 Kalayaan Ave., Purok 2', 'Purok 2', 'Filipino', 'CC-2026-0139', 1, 'verified', 'inactive', '2026-08-01', NOW(), NOW()),
    ('neilpatrick.harris@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 910 168 6209', 'Neil Patrick', 'T.', 'Harris', NULL, '1970-03-14', 'male', 'Separated', 'Makati City', '#111 Maharlika St., Purok 4', 'Purok 4', 'Filipino', 'CC-2026-0140', 1, 'verified', 'inactive', '2026-08-01', NOW(), NOW()),
    ('jonathan.groff@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 914 222 0958', 'Jonathan', 'E.', 'Groff', NULL, '1984-05-14', 'male', 'Single', 'Paranaque City', '#20 General Luna St., Purok 8', 'Purok 8', 'Filipino', 'CC-2026-0141', 0, 'pending', 'active', NULL, NOW(), NOW()),
    ('troye.sivan@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 910 983 8320', 'Troye', 'A.', 'Sivan', NULL, '2002-06-02', 'male', 'Single', 'Pasig City', '#65 San Jose St., Purok 8', 'Purok 8', 'Filipino', 'CC-2026-0142', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('ricky.martin@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 919 608 0651', 'Ricky', 'B.', 'Martin', NULL, '1993-02-22', 'male', 'Married', 'Makati City', '#114 General Luna St., Purok 2', 'Purok 2', 'Filipino', 'CC-2026-0143', 0, 'pending', 'active', NULL, NOW(), NOW()),
    ('elton.john@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 913 271 6484', 'Elton', 'R.', 'John', NULL, '1992-10-17', 'male', 'Widowed', 'Quezon City', '#86 Bonifacio Ave., Purok 4', 'Purok 4', 'Filipino', 'CC-2026-0144', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('adam.lambert@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 911 550 3492', 'Adam', 'E.', 'Lambert', NULL, '1984-06-25', 'male', 'Single', 'Taguig City', '#80 Kalayaan Ave., Purok 8', 'Purok 8', 'Filipino', 'CC-2026-0145', 0, 'pending', 'active', NULL, NOW(), NOW()),
    ('frank.ocean@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 919 826 8666', 'Frank', 'M.', 'Ocean', NULL, '1959-04-12', 'male', 'Widowed', 'Manila City', '#107 Rizal St., Purok 8', 'Purok 8', 'Filipino', 'CC-2026-0146', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('wentworth.miller@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 918 159 4462', 'Wentworth', 'N.', 'Miller', NULL, '1974-11-04', 'male', 'Married', 'Quezon City', '#114 Kalayaan Ave., Purok 2', 'Purok 2', 'Filipino', 'CC-2026-0147', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('jussie.smollett@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 911 649 6939', 'Jussie', 'S.', 'Smollett', NULL, '1976-04-22', 'male', 'Single', 'Quezon City', '#33 Sta. Ana St., Purok 8', 'Purok 8', 'Filipino', 'CC-2026-0148', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('dan.levy@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 918 009 1832', 'Dan', 'M.', 'Levy', NULL, '2004-03-21', 'male', 'Widowed', 'Manila City', '#71 Maharlika St., Purok 8', 'Purok 8', 'Filipino', 'CC-2026-0149', 1, 'verified', 'inactive', '2026-08-01', NOW(), NOW()),
    ('billy.eichner@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 910 315 5974', 'Billy', 'S.', 'Eichner', NULL, '1964-09-02', 'male', 'Widowed', 'Pasig City', '#56 San Jose St., Purok 3', 'Purok 3', 'Filipino', 'CC-2026-0150', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('luke.evans@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 913 885 2662', 'Luke', 'D.', 'Evans', NULL, '1998-04-22', 'male', 'Single', 'Quezon City', '#80 San Jose St., Purok 7', 'Purok 7', 'Filipino', 'CC-2026-0151', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('colton.underwood@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 911 391 0634', 'Colton', 'A.', 'Underwood', NULL, '1966-12-11', 'male', 'Separated', 'Paranaque City', '#35 San Jose St., Purok 4', 'Purok 4', 'Filipino', 'CC-2026-0152', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('gus.kenworthy@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 916 336 4564', 'Gus', 'J.', 'Kenworthy', NULL, '1977-05-27', 'male', 'Married', 'Manila City', '#85 General Luna St., Purok 1', 'Purok 1', 'Filipino', 'CC-2026-0153', 1, 'verified', 'inactive', '2026-08-01', NOW(), NOW()),
    ('george.takei@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 914 182 9512', 'George', 'E.', 'Takei', NULL, '1977-11-17', 'male', 'Separated', 'Paranaque City', '#4 Kalayaan Ave., Purok 6', 'Purok 6', 'Filipino', 'CC-2026-0154', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('sam.smith@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 914 045 7144', 'Sam', 'P.', 'Smith', NULL, '1982-06-24', 'other', 'Widowed', 'Makati City', '#50 General Luna St., Purok 2', 'Purok 2', 'Filipino', 'CC-2026-0155', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('demi.lovato@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 911 971 5409', 'Demi', 'T.', 'Lovato', NULL, '1989-11-24', 'other', 'Single', 'Paranaque City', '#47 Maharlika St., Purok 4', 'Purok 4', 'Filipino', 'CC-2026-0156', 0, 'pending', 'active', NULL, NOW(), NOW()),
    ('jonathanvan.ness@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 914 567 2085', 'Jonathan Van', 'B.', 'Ness', NULL, '2001-05-17', 'other', 'Widowed', 'Paranaque City', '#42 Maharlika St., Purok 7', 'Purok 7', 'Filipino', 'CC-2026-0157', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('ruby.rose@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 914 293 3443', 'Ruby', 'L.', 'Rose', NULL, '1998-12-06', 'other', 'Single', 'Pasig City', '#52 Sta. Ana St., Purok 5', 'Purok 5', 'Filipino', 'CC-2026-0158', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('elliot.page@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 912 674 1389', 'Elliot', 'P.', 'Page', NULL, '1996-06-15', 'other', 'Separated', 'Makati City', '#66 E. Jacinto St., Purok 4', 'Purok 4', 'Filipino', 'CC-2026-0159', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('ezra.miller@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 912 025 0757', 'Ezra', 'R.', 'Miller', NULL, '1994-06-03', 'other', 'Married', 'Paranaque City', '#29 General Luna St., Purok 5', 'Purok 5', 'Filipino', 'CC-2026-0160', 1, 'verified', 'inactive', '2026-08-01', NOW(), NOW()),
    ('indya.moore@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 917 409 3997', 'Indya', 'P.', 'Moore', NULL, '2004-02-15', 'other', 'Separated', 'Paranaque City', '#92 Maharlika St., Purok 4', 'Purok 4', 'Filipino', 'CC-2026-0161', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('asiakate.dillon@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 910 570 4082', 'Asia Kate', 'A.', 'Dillon', NULL, '2003-02-25', 'other', 'Separated', 'Manila City', '#103 E. Jacinto St., Purok 3', 'Purok 3', 'Filipino', 'CC-2026-0162', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('lachlan.watson@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 919 834 8270', 'Lachlan', 'T.', 'Watson', NULL, '1984-11-17', 'other', 'Single', 'Pasig City', '#97 E. Jacinto St., Purok 6', 'Purok 6', 'Filipino', 'CC-2026-0163', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('amandla.stenberg@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 914 784 8540', 'Amandla', 'N.', 'Stenberg', NULL, '1983-03-24', 'other', 'Separated', 'Makati City', '#97 General Luna St., Purok 5', 'Purok 5', 'Filipino', 'CC-2026-0164', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('bella.ramsey@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 918 082 2267', 'Bella', 'E.', 'Ramsey', NULL, '1983-02-23', 'other', 'Widowed', 'Manila City', '#43 Bonifacio Ave., Purok 5', 'Purok 5', 'Filipino', 'CC-2026-0165', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('emma.corrin@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 916 063 3388', 'Emma', 'S.', 'Corrin', NULL, '1964-12-07', 'other', 'Single', 'Makati City', '#43 E. Jacinto St., Purok 7', 'Purok 7', 'Filipino', 'CC-2026-0166', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('chella.man@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 914 771 6389', 'Chella', 'T.', 'Man', NULL, '1992-12-01', 'other', 'Single', 'Makati City', '#1 Bonifacio Ave., Purok 8', 'Purok 8', 'Filipino', 'CC-2026-0167', 1, 'verified', 'active', '2026-08-01', NOW(), NOW()),
    ('alok.vaidmenon@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 910 398 5507', 'Alok', 'S.', 'Vaid-Menon', NULL, '1989-10-08', 'other', 'Separated', 'Manila City', '#56 E. Jacinto St., Purok 5', 'Purok 5', 'Filipino', 'CC-2026-0168', 1, 'outdated', 'active', NULL, NOW(), NOW()),
    ('gottmik.kade@email.com', '$2y$10$LRUpc6BTDRjLlV.Rh62jlOx3wRXW8997k4b.Yro4q41JRIuMJTnOG', '+63 919 577 0444', 'Gottmik', 'L.', 'Kade', NULL, '2001-03-27', 'other', 'Separated', 'Manila City', '#117 Maharlika St., Purok 1', 'Purok 1', 'Filipino', 'CC-2026-0169', 1, 'verified', 'active', '2026-08-01', NOW(), NOW());

INSERT INTO agencies (id, name, description, icon) VALUES
    (1, 'Administrative', 'Oversees all resident requests and ensures proper routing, monitoring, and resolution.', 'Administrator.png'),
    (2, 'Health', 'Handles urgent health and emergency response concerns, medical assistance, and critical support services.', 'HealthCenter.png'),
    (3, 'Social Welfare', 'Provides support programs and assistance for vulnerable individuals and families.', 'WelfareCare.png'),
    (4, 'Peace & Order', 'Manages public safety concerns, complaints, and community security matters.', 'PeaceAndOrder.png'),
    (5, 'Disaster Response', 'Responds to emergencies, hazard reports, and disaster preparedness concerns.', 'DisasterResponse.png'),
    (6, 'Environment & Sanitation', 'Handles environmental concerns, sanitation issues, and community cleanliness.', 'Environment.png');

INSERT INTO certificate_purposes (id, name) VALUES
    (1, 'Barangay Certificate of Residency'),
    (2, 'First-Time Job Seeker Barangay Certificate'),
    (3, 'Barangay Certificate of Indigency'),
    (4, 'Barangay Business-related Certification'),
    (5, 'Barangay Certificate of Good Moral Character');

INSERT INTO request_types (id, agency_id, name) VALUES
    (1, 1, 'Resident Record Correction'),
    (2, 1, 'System Feedback Report'),
    (3, 1, 'Community Improvement Suggestion'),
    (4, 1, 'Official Information Request'),
    (5, 1, 'Request Barangay Profile'),
    (6, 1, 'General Inquiry / Concern'),
    (7, 2, 'Medical Assistance Request'),
    (8, 2, 'Health Certificate Inquiry'),
    (9, 2, 'Vaccination Slot Request'),
    (10, 2, 'Senior Citizen Health Program'),
    (11, 2, 'Community Health Concern Report'),
    (12, 3, 'Financial Assistance Request'),
    (13, 3, 'Senior Citizen Program'),
    (14, 3, 'PWD Assistance Application'),
    (15, 3, 'Family Welfare Concern'),
    (16, 3, 'Livelihood Training Program'),
    (17, 4, 'Noise Complaint'),
    (18, 4, 'Neighborhood Dispute Report'),
    (19, 4, 'Public Disturbance Report'),
    (20, 4, 'CCTV Footage Request'),
    (21, 4, 'Security Assistance Request'),
    (22, 5, 'Hazard / Danger Report'),
    (23, 5, 'Flood Management Query'),
    (24, 5, 'Evacuation Center Inquiry'),
    (25, 5, 'Rescue Relief Request'),
    (26, 5, 'Emergency Preparedness Inquiry'),
    (27, 6, 'Garbage Collection Complaint'),
    (28, 6, 'Illegal Dumping Report'),
    (29, 6, 'Drainage Clogging Issue'),
    (30, 6, 'Street Cleaning Request'),
    (31, 6, 'Environmental Hazard Report');

INSERT INTO appointments (resident_id, appt_date, time_slot, status, created_at) VALUES
    (4, CURDATE()+INTERVAL 1 DAY, '8:00 - 9:00', 'booked', NOW()),
    (5, CURDATE()+INTERVAL 1 DAY, '10:00 - 11:00', 'booked', NOW()),
    (6, CURDATE()+INTERVAL 2 DAY, '1:00 - 2:00', 'booked', NOW()),
    (7, CURDATE()+INTERVAL 2 DAY, '4:00 - 5:00', 'cancelled', NOW()),
    (8, CURDATE()+INTERVAL 3 DAY, '9:00 - 10:00', 'booked', NOW());

INSERT INTO requests (ticket_id, resident_id, agency_id, request_type_id, subject, details, status, created_at, updated_at) VALUES
    ('#REQ-2026-8001', 4, 1, 1, 'Record correction', 'Please correct my registered address in the system.', 'pending_review', NOW(), NOW()),
    ('#REQ-2026-8002', 5, 2, 7, 'Medical assistance', 'Requesting financial assistance for medical bills.', 'reviewed', NOW(), NOW()),
    ('#REQ-2026-8003', 6, 3, 12, 'Financial aid', 'Assistance for livelihood support program.', 'resolved', NOW(), NOW()),
    ('#REQ-2026-8004', 7, 4, 17, 'Noise complaint', 'Recurring noise disturbance in our purok.', 'pending_review', NOW(), NOW()),
    ('#REQ-2026-8005', 8, 5, 25, 'Rescue relief', 'Requesting relief goods for affected families.', 'closed', NOW(), NOW()),
    ('#REQ-2026-8006', 9, 6, 27, 'Garbage collection', 'Missed garbage pick-up this week.', 'reviewed', NOW(), NOW());

INSERT INTO transactions (resident_id, description, amount, transacted_at) VALUES
    (4, 'Certification fee', 50.00, NOW()),
    (5, 'Clearance processing', 100.00, NOW()),
    (6, 'Business permit', 250.00, NOW()),
    (7, 'Certificate of Indigency', 0.00, NOW()),
    (8, 'Appointment service fee', 30.00, NOW()),
    (9, 'Record verification', 20.00, NOW());

INSERT INTO notifications (staff_id, resident_id, message, is_read, created_at) VALUES
    (1, NULL, 'New resident account pending verification', 0, NOW()),
    (NULL, 4, 'Your account has been verified', 0, NOW()),
    (NULL, 5, 'A new certificate is available', 1, NOW()),
    (4, NULL, 'Daily registry report is ready', 0, NOW()),
    (NULL, 6, 'Your appointment was confirmed', 0, NOW()),
    (NULL, 7, 'Please update your census information', 1, NOW());

INSERT INTO audit_logs (staff_id, action, ip_address, security_status, created_at) VALUES
    (1, 'Logged in', '192.168.1.10', 'authorized', NOW()),
    (1, 'Verified resident record', '192.168.1.10', 'authorized', NOW()),
    (2, 'Logged in', '192.168.1.20', 'authorized', NOW()),
    (NULL, 'Failed login attempt', '203.0.113.9', 'unauthorized', NOW());

SET FOREIGN_KEY_CHECKS = 1;
