<?php
declare(strict_types=1);

use App\Core\Router;

$router->get('/api/health', fn() => json_response(['status' => 'ok', 'time' => date('c')]));

$router->post('/api/login',              [App\Features\StaffAuthentication\StaffAuthenticationController::class, 'login']);
$router->post('/api/logout',             [App\Features\StaffAuthentication\StaffAuthenticationController::class, 'logout']);
$router->get('/api/me',                  [App\Features\StaffAuthentication\StaffAuthenticationController::class, 'me']);

$router->get('/api/residents',           [App\Features\ResidentRegistryRead\ResidentRegistryReadController::class, 'index']);
$router->get('/api/residents/search',    [App\Features\ResidentRegistryRead\ResidentRegistryReadController::class, 'search']);
$router->get('/api/residents/{id}',      [App\Features\ResidentRegistryRead\ResidentRegistryReadController::class, 'show']);
$router->get('/api/dashboard/stats',     [App\Features\ResidentRegistryRead\ResidentRegistryReadController::class, 'dashboardStats']);

$router->put('/api/residents/{id}',      [App\Features\ResidentRegistryWrite\ResidentRegistryWriteController::class, 'update']);
$router->put('/api/residents/{id}/verify', [App\Features\ResidentRegistryWrite\ResidentRegistryWriteController::class, 'verify']);
$router->put('/api/residents/{id}/status', [App\Features\ResidentRegistryWrite\ResidentRegistryWriteController::class, 'updateStatus']);

$router->get('/api/certificates',                   [App\Features\CertificateGeneration\CertificateGenerationController::class, 'index']);
$router->post('/api/certificates',                  [App\Features\CertificateGeneration\CertificateGenerationController::class, 'apply']);
$router->put('/api/certificates/{id}/approve',      [App\Features\CertificateGeneration\CertificateGenerationController::class, 'approve']);
$router->put('/api/certificates/{id}/reject',       [App\Features\CertificateGeneration\CertificateGenerationController::class, 'reject']);
$router->get('/api/certificate-purposes',           [App\Features\CertificateGeneration\CertificateGenerationController::class, 'purposes']);

$router->post('/api/signup',             [App\Features\ResidentAccountCreation\ResidentAccountCreationController::class, 'signup']);
$router->get('/api/requests',            [App\Features\ResidentAccountCreation\ResidentAccountCreationController::class, 'myRequests']);
$router->post('/api/requests',           [App\Features\ResidentAccountCreation\ResidentAccountCreationController::class, 'submitRequest']);
$router->put('/api/requests/{id}/status', [App\Features\ResidentAccountCreation\ResidentAccountCreationController::class, 'updateStatus']);
$router->get('/api/attachments/{id}',    [App\Features\ResidentAccountCreation\ResidentAccountCreationController::class, 'downloadAttachment']);

$router->get('/api/appointments/slots',  [App\Features\AppointmentScheduling\AppointmentSchedulingController::class, 'availableSlots']);
$router->post('/api/appointments',       [App\Features\AppointmentScheduling\AppointmentSchedulingController::class, 'book']);

$router->get('/api/appointments',               [App\Features\AppointmentManagement\AppointmentManagementController::class, 'index']);
$router->put('/api/appointments/{id}/cancel',   [App\Features\AppointmentManagement\AppointmentManagementController::class, 'cancel']);
$router->get('/api/appointments/resident/{id}', [App\Features\AppointmentManagement\AppointmentManagementController::class, 'byResident']);

$router->get('/api/transactions',               [App\Features\Transactions\TransactionsController::class, 'index']);
$router->get('/api/transactions/{id}',          [App\Features\Transactions\TransactionsController::class, 'show']);
$router->post('/api/transactions',              [App\Features\Transactions\TransactionsController::class, 'create']);

$router->get('/api/staff',                      [App\Features\UserManagement\UserManagementController::class, 'index']);
$router->post('/api/staff',                     [App\Features\UserManagement\UserManagementController::class, 'create']);
$router->put('/api/staff/{id}',                 [App\Features\UserManagement\UserManagementController::class, 'update']);
$router->put('/api/staff/{id}/status',          [App\Features\UserManagement\UserManagementController::class, 'updateStatus']);

$router->get('/api/audit-logs',                 [App\Features\ActivityLogViewer\ActivityLogViewerController::class, 'index']);

$router->post('/api/upload',                    [App\Features\FileUploads\FileUploadsController::class, 'upload']);

$router->get('/api/mail',                       [App\Features\MailBox\MailBoxController::class, 'index']);
$router->post('/api/mail',                      [App\Features\MailBox\MailBoxController::class, 'send']);
$router->put('/api/mail/{id}/read',             [App\Features\MailBox\MailBoxController::class, 'markRead']);
$router->put('/api/mail/{id}/archive',          [App\Features\MailBox\MailBoxController::class, 'archive']);
$router->get('/api/mail/recipients/search',     [App\Features\MailBox\MailBoxController::class, 'searchRecipients']);

$router->get('/api/notifications',              [App\Features\Notifications\NotificationsController::class, 'index']);
$router->put('/api/notifications/{id}/read',    [App\Features\Notifications\NotificationsController::class, 'markRead']);
