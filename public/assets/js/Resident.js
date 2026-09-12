
window.redirectToLogin = function () {
    window.location.href = 'CCLog-in.html';
};

let residentBannerTimeout = null;

function hideResidentBanner() {
    const banner = document.getElementById('resident-error-banner');
    if (banner) {
        banner.style.display = 'none';
    }
    if (residentBannerTimeout) {
        clearTimeout(residentBannerTimeout);
        residentBannerTimeout = null;
    }
}


function showError(message) {
    const banner = document.getElementById('resident-error-banner');
    const textEl = document.getElementById('resident-error-text');
    if (banner && textEl) {
        if (residentBannerTimeout) clearTimeout(residentBannerTimeout);
        textEl.textContent = message || 'An error occurred. Please try again.';
        banner.style.background = '#ffebe9';
        banner.style.borderColor = '#ff8182';
        banner.style.color = '#b20000';
        banner.style.display = 'flex';
        residentBannerTimeout = setTimeout(() => {
            hideResidentBanner();
        }, 5000);
    }
}

function showSuccess(message) {
    const banner = document.getElementById('resident-error-banner');
    const textEl = document.getElementById('resident-error-text');
    if (banner && textEl) {
        if (residentBannerTimeout) clearTimeout(residentBannerTimeout);
        textEl.textContent = message;
        banner.style.background = '#e6f4ea';
        banner.style.borderColor = '#34a853';
        banner.style.color = '#137333';
        banner.style.display = 'flex';
        residentBannerTimeout = setTimeout(() => {
            hideResidentBanner();
        }, 5000);
    }
}


let currentUser = null;
let currentAgencyId = null;
let selectedAppointmentSlot = null;
let cachedResidentMail = [];
let currentResidentMail = null;
let composeRecipientTimer = null;


function openUserAccountPanel() {
    const panel = document.getElementById('user-account-panel');
    const backdrop = document.getElementById('user-account-backdrop');
    if (panel) panel.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
}

function closeUserAccountPanel() {
    const panel = document.getElementById('user-account-panel');
    const backdrop = document.getElementById('user-account-backdrop');
    if (panel) panel.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
}

function switchView(viewId, element) {
    const views = document.querySelectorAll('.dashboard-view');
    views.forEach(view => view.classList.remove('active-view'));

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    const targetView = document.getElementById(viewId);
    if (targetView) targetView.classList.add('active-view');
    if (element) element.classList.add('active');
}

function toggleSettingsMenu(element) {
    const submenu = element.nextElementSibling;
    if (submenu) submenu.classList.toggle('open');
}

function toggleNotifications() {
    const panel = document.getElementById('notifications-panel');
    if (panel) panel.classList.toggle('open');
}

function closeNotifications() {
    const panel = document.getElementById('notifications-panel');
    if (panel) panel.classList.remove('open');
}

function toggleResidentProfile() {
    const card = document.getElementById('resident-profile-card');
    const backdrop = document.getElementById('resident-profile-backdrop');
    if (card) card.classList.toggle('open');
    if (backdrop) backdrop.classList.toggle('open');
}

function closeResidentProfile() {
    const card = document.getElementById('resident-profile-card');
    const backdrop = document.getElementById('resident-profile-backdrop');
    if (card) card.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
}

async function logoutResident() {
    try {
        await CemboClear.client().logout();
    } catch (e) {
    } finally {
        window.location.href = 'CCLog-in.html';
    }
}





async function loadCertificatePurposes() {
    const select = document.getElementById('certificate-purpose-select');
    if (!select) return;

    try {
        const res = await CemboClear.client().get('/certificate-purposes');
        const purposes = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);

        if (purposes.length === 0) {
            select.innerHTML = '<option value="">No certificate purposes available</option>';
            return;
        }

        select.innerHTML = '<option value="">-- Select Purpose of Certificate --</option>' +
            purposes.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    } catch (err) {
        showError(err.message || 'Failed to load certificate purposes');
    }
}





let signatureMode = 'draw';
let hasDrawnSignature = false;
let isDrawing = false;
let sigCtx = null;
let lastX = 0;
let lastY = 0;

function switchSignatureMode(mode) {
    signatureMode = mode;
    const btnDraw = document.getElementById('tab-sig-draw');
    const btnUpload = document.getElementById('tab-sig-upload');
    const panelDraw = document.getElementById('sig-draw-panel');
    const panelUpload = document.getElementById('sig-upload-panel');

    if (mode === 'draw') {
        if (btnDraw) btnDraw.classList.add('active');
        if (btnUpload) btnUpload.classList.remove('active');
        if (panelDraw) panelDraw.style.display = 'block';
        if (panelUpload) panelUpload.style.display = 'none';
        initSignatureCanvas();
    } else {
        if (btnDraw) btnDraw.classList.remove('active');
        if (btnUpload) btnUpload.classList.add('active');
        if (panelDraw) panelDraw.style.display = 'none';
        if (panelUpload) panelUpload.style.display = 'block';
    }
}

function clearSignatureCanvas() {
    const canvas = document.getElementById('signature-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    hasDrawnSignature = false;
    const badge = document.getElementById('sig-status-badge');
    const statusText = document.getElementById('sig-status-text');
    if (badge) {
        badge.className = 'sig-status-pill unready';
    }
    if (statusText) {
        statusText.textContent = 'Awaiting signature';
    }
}

function initSignatureCanvas() {
    const canvas = document.getElementById('signature-canvas');
    if (!canvas || canvas.dataset.initialized === 'true') return;

    canvas.dataset.initialized = 'true';
    const ctx = canvas.getContext('2d');
    sigCtx = ctx;

    const dpr = window.devicePixelRatio || 1;

    
    
    
    function applyCanvasSize() {
        const cRect = canvas.getBoundingClientRect();
        const w = cRect.width || 480;
        const h = cRect.height || 150;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#0f172a';
    }

    applyCanvasSize();

    function getCoords(e) {
        const cRect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0)) - cRect.left,
            y: (e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0)) - cRect.top
        };
    }

    function startDrawing(e) {
        if (e.button && e.button !== 0) return;
        isDrawing = true;
        const coords = getCoords(e);
        lastX = coords.x;
        lastY = coords.y;
    }

    function draw(e) {
        if (!isDrawing) return;
        const coords = getCoords(e);

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();

        lastX = coords.x;
        lastY = coords.y;
        hasDrawnSignature = true;

        const badge = document.getElementById('sig-status-badge');
        const statusText = document.getElementById('sig-status-text');
        if (badge) badge.className = 'sig-status-pill ready';
        if (statusText) statusText.textContent = 'Signature recorded';
    }

    function stopDrawing() {
        isDrawing = false;
    }

    canvas.addEventListener('pointerdown', startDrawing);
    canvas.addEventListener('pointermove', draw);
    canvas.addEventListener('pointerup', stopDrawing);
    canvas.addEventListener('pointerleave', stopDrawing);
    canvas.addEventListener('pointercancel', stopDrawing);

    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);

    
    
    function resizeCanvas() {
        const cRect = canvas.getBoundingClientRect();
        const newW = Math.round(cRect.width * dpr);
        const newH = Math.round(cRect.height * dpr);
        if (canvas.width === newW && canvas.height === newH) return;

        const snapshot = canvas.toDataURL('image/png');
        canvas.width = newW;
        canvas.height = newH;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#0f172a';
        if (hasDrawnSignature) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0, newW / dpr, newH / dpr);
            img.src = snapshot;
        }
    }

    if (!canvas.dataset.resizeBound) {
        canvas.dataset.resizeBound = 'true';
        window.addEventListener('resize', resizeCanvas);
        if (typeof ResizeObserver !== 'undefined') {
            window.__sigResizeObserver?.disconnect();
            window.__sigResizeObserver = new ResizeObserver(resizeCanvas);
            window.__sigResizeObserver.observe(canvas);
        }
    }
}

async function getSignatureBlobOrFile() {
    if (signatureMode === 'upload') {
        const sigFile = document.getElementById('info-signature')?.files[0];
        return sigFile || null;
    }

    if (signatureMode === 'draw') {
        if (!hasDrawnSignature) return null;
        const canvas = document.getElementById('signature-canvas');
        if (!canvas) return null;

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], 'drawn_signature.png', { type: 'image/png' });
                    resolve(file);
                } else {
                    resolve(null);
                }
            }, 'image/png');
        });
    }

    return null;
}




function validatePersonalInfo() {
    const val = (id) => {
        const el = document.getElementById(id);
        return el ? String(el.value || '').trim() : '';
    };

    const required = [
        ['info-last-name',   'Last name'],
        ['info-first-name',  'First name'],
        ['info-birthdate',   'Birth date'],
        ['info-gender',      'Sex'],
        ['info-address',     'Residence address'],
        ['info-phone',       'Contact number'],
        ['info-email',       'Email address'],
    ];

    for (const [id, label] of required) {
        if (val(id) === '') {
            return label + ' is required before applying for a certificate.';
        }
    }

    

    

    

    if (val('info-civil-status') === '') {
        return 'Civil status is required before applying for a certificate.';
    }

    const email = val('info-email');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return 'Please enter a valid email address.';
    }

    const phone = val('info-phone');
    if (phone && !/^[+\d][\d\s\-()]{6,}$/.test(phone)) {
        return 'Please enter a valid contact number.';
    }

    return null;
}

async function handleApplyCertificate(event) {
    event.preventDefault();
    const select = document.getElementById('certificate-purpose-select');
    const purposeId = select ? select.value : null;

    
    if (!purposeId) {
        showError('Please select a purpose for the certificate.');
        return;
    }

    
    
    const personalInfoError = validatePersonalInfo();
    if (personalInfoError) {
        showError(personalInfoError);
        return;
    }

    
    const sigFile = await getSignatureBlobOrFile();
    if (!sigFile) {
        showError('Please provide your signature before applying. Draw it on the pad or upload a signature file.');
        return;
    }

    
    const idFile = document.getElementById('info-valid-id')?.files[0];
    if (!idFile) {
        showError('Please attach a valid government ID to complete your application.');
        return;
    }

    const btn = document.getElementById('btn-apply-certificate');
    if (btn) btn.disabled = true;

    try {
        
        
        const formDataSig = new FormData();
        formDataSig.append('file', sigFile);
        formDataSig.append('kind', 'signature');
        if (currentUser && currentUser.id) formDataSig.append('resident_id', currentUser.id);
        await CemboClear.client().post('/upload', formDataSig);

        const formDataId = new FormData();
        formDataId.append('file', idFile);
        formDataId.append('kind', 'valid_id');
        if (currentUser && currentUser.id) formDataId.append('resident_id', currentUser.id);
        await CemboClear.client().post('/upload', formDataId);

        
        await CemboClear.client().post('/certificates', {
            purpose_id: parseInt(purposeId, 10)
        });

        showSuccess('Certificate application submitted successfully with signature and valid ID.');
        select.value = '';
        clearSignatureCanvas();
        const idInput = document.getElementById('info-valid-id');
        if (idInput) idInput.value = '';
        const sigInput = document.getElementById('info-signature');
        if (sigInput) sigInput.value = '';
        const sigName = document.getElementById('signature-file-name');
        if (sigName) sigName.textContent = 'No file chosen';
        const idName = document.getElementById('valid-id-file-name');
        if (idName) idName.textContent = 'No file chosen';
        await loadMyCertificates();

    } catch (err) {
        showError(err.message || 'Failed to submit certificate application');
    } finally {
        if (btn) btn.disabled = false;
    }
}

async function loadMyCertificates() {
    const container = document.getElementById('my-certificates-list');
    if (!container) return;

    try {
        const res = await CemboClear.client().get('/certificates');
        const certs = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);

        if (certs.length === 0) {
            container.innerHTML = '<p style="color:#777; font-style:italic;">No certificate applications found.</p>';
            return;
        }

        container.innerHTML = certs.map(c => `
            <div style="background:#fff; border:1px solid #e0e0e0; border-radius:12px; padding:15px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong style="color:#0056b3;">#CERT-${c.id}</strong> — <span>${c.purpose || c.purpose_name || 'Certificate Application'}</span>
                    <div style="font-size:12px; color:#888; margin-top:4px;">Applied: ${c.applied_at || 'N/A'}</div>
                </div>
                <div>
                    <span style="padding:4px 12px; border-radius:20px; font-weight:bold; font-size:12px; text-transform:uppercase; ${c.status === 'approved' ? 'background:#e6f4ea; color:#137333;' : c.status === 'rejected' ? 'background:#fce8e6; color:#c5221f;' : 'background:#fef7e0; color:#b06000;'}">${c.status}</span>
                </div>
            </div>
        `).join('');
    } catch (err) {
        showError(err.message || 'Failed to load certificates list');
    }
}





const AGENCY_NAME_MAP = {
    'Administrative': 1,
    'Health': 2,
    'Applying and Requirement': 3,
    'Peace & Order': 4,
    'Disaster Response': 5,
    'Environment & Sanitation': 6
};

function openComplaintModal(departmentName) {
    const modal = document.getElementById('complaint-modal');
    const deptDisplay = document.getElementById('modal-dept-name');
    const form = document.getElementById('complaint-form');
    const fileNameDisplay = document.getElementById('complaint-file-name');
    const select = document.getElementById('complaint-type');

    currentAgencyId = AGENCY_NAME_MAP[departmentName] || 1;

    const optionsByDepartment = {
        Administrative: [
            'Resident Record Correction',
            'System Feedback Report',
            'Community Improvement Suggestion',
            'Official Information Request',
            'Request Barangay Profile',
            'General Inquiry / Concern'
        ],
        Health: [
            'Medical Assistance Request',
            'Health Certificate Inquiry',
            'Vaccination Slot Request',
            'Senior Citizen Health Program',
            'Community Health Concern Report'
        ],
        'Applying and Requirement': [
            'Financial Assistance Request',
            'Senior Citizen Program',
            'PWD Assistance Application',
            'Family Welfare Concern',
            'Livelihood Training Program'
        ],
        'Peace & Order': [
            'Noise Complaint',
            'Neighborhood Dispute Report',
            'Public Disturbance Report',
            'CCTV Footage Request',
            'Security Assistance Request'
        ],
        'Disaster Response': [
            'Hazard / Danger Report',
            'Flood Management Query',
            'Evacuation Center Inquiry',
            'Rescue Relief Request',
            'Emergency Preparedness Inquiry'
        ],
        'Environment & Sanitation': [
            'Garbage Collection Complaint',
            'Illegal Dumping Report',
            'Drainage Clogging Issue',
            'Street Cleaning Request',
            'Environmental Hazard Report'
        ]
    };

    if (modal && deptDisplay) {
        deptDisplay.textContent = departmentName;
        modal.classList.add('open');

        if (form) form.reset();
        if (fileNameDisplay) fileNameDisplay.textContent = 'No file chosen';
        if (select) {
            const options = optionsByDepartment[departmentName] || [
                'General Inquiry / Concern',
                'Service Request',
                'Documentation Assistance',
                'Follow-up Request'
            ];

            select.innerHTML = '<option value="">-- Select request type --</option>' +
                options.map(option => `<option value="${option}">${option}</option>`).join('');
        }
    }
}

function closeComplaintModal() {
    const modal = document.getElementById('complaint-modal');
    if (modal) modal.classList.remove('open');
}

async function submitComplaint(event) {
    event.preventDefault();
    const typeSelect = document.getElementById('complaint-type');
    const detailsInput = document.getElementById('complaint-message');
    const fileInput = document.getElementById('complaint-file');

    const subjectVal = typeSelect ? typeSelect.value : 'General Request';
    const detailsVal = detailsInput ? detailsInput.value : '';
    const file = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;

    

    if (file) {
        const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        const fileName = (file.name || '').toLowerCase();
        const hasValidExt = allowedExts.some(ext => fileName.endsWith(ext));
        const hasValidType = allowedTypes.includes(file.type);

        if (!hasValidExt && !hasValidType) {
            showError('File type not allowed. Please upload a PDF, JPG, PNG, or WEBP document.');
            return;
        }

        const maxSize = 5 * 1024 * 1024; 

        if (file.size > maxSize) {
            showError('File too large. Maximum allowed size is 5MB.');
            return;
        }
    }

    let res = null;
    try {
        

        res = await CemboClear.client().post('/requests', {
            agency_id: currentAgencyId,
            request_type_id: null,
            subject: subjectVal,
            details: detailsVal
        });
    } catch (err) {
        showError(err.message || 'Failed to submit request');
        return;
    }

    const ticketId = (res && (res.ticket_id || '#REQ-' + res.id)) || 'Request';

    
    if (file && res && res.id) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('kind', 'supporting_document');
            formData.append('request_id', res.id);
            await CemboClear.client().post('/upload', formData);
            showSuccess('Request submitted successfully! Ticket ID: ' + ticketId);
        } catch (uploadErr) {
            showSuccess('Request submitted (' + ticketId + '), but supporting file upload failed: ' + (uploadErr.message || 'upload error'));
        }
    } else {
        showSuccess('Request submitted successfully! Ticket ID: ' + ticketId);
    }

    closeComplaintModal();
    const form = document.getElementById('complaint-form');
    if (form) form.reset();
    const fileNameDisplay = document.getElementById('complaint-file-name');
    if (fileNameDisplay) fileNameDisplay.textContent = 'No file chosen';
    await loadMyRequests();
}

async function loadMyRequests() {
    const container = document.getElementById('my-requests-list');
    if (!container) return;

    try {
        const res = await CemboClear.client().get('/requests');
        const reqs = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);

        if (reqs.length === 0) {
            container.innerHTML = '<p style="color:#777; font-style:italic;">No submitted requests found.</p>';
            return;
        }

        container.innerHTML = reqs.map(r => `
            <div style="background:#fff; border:1px solid #e0e0e0; border-radius:12px; padding:15px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong style="color:#0056b3;">${r.ticket_id || '#REQ-' + r.id}</strong> — <span>${r.subject || 'Request'}</span>
                    <div style="font-size:12px; color:#666; margin-top:4px;">Agency: ${r.agency_name || 'Office'} | Details: ${r.details || 'N/A'}</div>
                </div>
                <div>
                    <span style="padding:4px 12px; border-radius:20px; font-weight:bold; font-size:12px; text-transform:uppercase; background:#fef7e0; color:#b06000;">${r.status || 'PENDING'}</span>
                </div>
            </div>
        `).join('');
    } catch (err) {
        showError(err.message || 'Failed to load submitted requests');
    }
}






let calendarViewYear = 0;
let calendarViewMonth = -1; 
const CALENDAR_SLOTS_PER_DAY = 8;

function pad2(n) { return String(n).padStart(2, '0'); }

function dateKey(year, month, day) {
    return year + '-' + pad2(month + 1) + '-' + pad2(day);
}

function setHiddenPickerDate(year, month, day) {
    const picker = document.getElementById('appointment-date-picker');
    if (picker) picker.value = dateKey(year, month, day);
}

async function loadMonthAvailability(year, month) {
    const grid = document.getElementById('resident-calendar-grid');
    const progress = document.getElementById('resident-calendar-progress');
    if (!grid) return;

    
    grid.querySelectorAll('.calendar-day').forEach(c => {
        c.classList.remove('day-booked', 'day-available');
    });
    if (progress) progress.style.display = 'block';

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
    const todaySeen = new Set();

    
    const requests = [];
    for (let d = 1; d <= daysInMonth; d++) {
        const key = dateKey(year, month, d);
        const cell = grid.querySelector('[data-date="' + key + '"]');
        if (!cell) continue;

        
        if (key < todayKey) {
            cell.classList.remove('day-available', 'day-booked');
            cell.classList.add('day-past');
            continue;
        }

        requests.push(
            CemboClear.client().get('/appointments/slots?date=' + key)
                .then(res => {
                    const slots = (res && res.slots) ? res.slots : [];
                    const bookedCount = slots.filter(s => s.available === false).length;
                    if (bookedCount >= CALENDAR_SLOTS_PER_DAY) {
                        cell.classList.add('day-booked');
                    } else {
                        cell.classList.add('day-available');
                    }
                })
                .catch(() => {  })
                .finally(() => {
                    
                    if (key === todayKey && !todaySeen.has(key)) {
                        todaySeen.add(key);
                        cell.classList.add('day-today');
                    }
                })
        );
    }

    await Promise.all(requests);
    if (progress) progress.style.display = 'none';
}

function renderResidentCalendar() {
    const grid = document.getElementById('resident-calendar-grid');
    if (!grid) return;
    if (calendarViewMonth < 0) return;

    const year = calendarViewYear;
    const month = calendarViewMonth;

    const yearEl = document.getElementById('calendar-year');
    const monthEl = document.getElementById('calendar-month-label');
    if (yearEl) yearEl.textContent = String(year);
    if (monthEl) monthEl.textContent = new Date(year, month, 1)
        .toLocaleString('en-US', { month: 'long' }).toUpperCase();

    const firstDay = new Date(year, month, 1).getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

    let html = '<span class="day-label">Sun</span><span class="day-label">Mon</span><span class="day-label">Tue</span><span class="day-label">Wed</span><span class="day-label">Thu</span><span class="day-label">Fri</span><span class="day-label">Sat</span>';
    html += '<span class="calendar-day day-blank"></span>'.repeat(firstDay);

    for (let d = 1; d <= daysInMonth; d++) {
        const key = dateKey(year, month, d);
        const isToday = key === todayKey;
        const extra = isToday ? ' day-today' : '';
        html += '<span class="calendar-day' + extra + '" data-date="' + key + '" role="button" tabindex="0" ' +
            'onclick="selectCalendarDate(' + year + ',' + month + ',' + d + ')" ' +
            'onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();selectCalendarDate(' + year + ',' + month + ',' + d + ');}">' +
            d + '</span>';
    }

    grid.innerHTML = html;
    loadMonthAvailability(year, month);
}

function switchCalendarMonth(delta) {
    const d = new Date(calendarViewYear, calendarViewMonth + delta, 1);
    calendarViewYear = d.getFullYear();
    calendarViewMonth = d.getMonth();
    renderResidentCalendar();
}

function selectCalendarDate(year, month, day) {
    setHiddenPickerDate(year, month, day);
    const dateDisplay = document.getElementById('selected-date-display');
    if (dateDisplay) dateDisplay.textContent = dateKey(year, month, day);
    loadAvailableSlots();
}

async function loadAvailableSlots() {
    const datePicker = document.getElementById('appointment-date-picker');
    const slotsContainer = document.getElementById('time-slot-list');
    const dateDisplay = document.getElementById('selected-date-display');
    const bookBtn = document.getElementById('btn-book-appointment');

    const selectedDate = datePicker ? datePicker.value : '';
    if (!selectedDate) {
        showError('Please select an appointment date first.');
        return;
    }

    if (dateDisplay) dateDisplay.textContent = selectedDate;
    selectedAppointmentSlot = null;
    if (bookBtn) {
        bookBtn.disabled = true;
        bookBtn.style.display = '';
    }

    try {
        const res = await CemboClear.client().get('/appointments/slots?date=' + selectedDate);

        if (res && res.is_weekend) {
            if (bookBtn) bookBtn.style.display = 'none';
            slotsContainer.innerHTML = `
                <div class="time-slot-notice closed">
                    <strong>The office is closed on weekends.</strong>
                    <div>Please choose a weekday.</div>
                </div>`;
            return;
        }

        const slots = (res && res.slots) ? res.slots : (Array.isArray(res) ? res : []);

        if (!slots || slots.length === 0) {
            slotsContainer.innerHTML = '<p style="color:#777;">No slots available for this date.</p>';
            return;
        }

        slotsContainer.innerHTML = slots.map(s => {
            const isExpired = s.expired === true;
            const isAvail = s.available === true;
            const statusLabel = isExpired ? 'Time Passed' : (isAvail ? 'Available' : 'Fully Booked');
            const statusClass = isExpired ? 'color:#888; font-weight:bold;' : (isAvail ? 'color:#137333; font-weight:bold;' : 'color:#c5221f; font-weight:bold;');
            const disabled = !isAvail;
            const bg = isExpired ? '#f3f4f6' : (isAvail ? '#fff' : '#f9f9f9');

            return `
                <div class="time-slot" style="display:flex; justify-content:space-between; align-items:center; padding:12px 20px; border:1px solid #ddd; border-radius:10px; margin-bottom:8px; background:${bg}; ${isExpired ? 'opacity:0.65;' : ''}">
                    <div class="time-left" style="display:flex; align-items:center; gap:10px;">
                        <input type="radio" name="time_slot_radio" value="${s.time_slot}" ${disabled ? 'disabled' : ''} ${disabled ? '' : `onchange="selectAppointmentSlot('${s.time_slot}')"`} />
                        <span style="font-weight:600;${isExpired ? ' text-decoration:line-through;' : ''}">${s.time_slot}</span>
                    </div>
                    <span style="${statusClass}">${statusLabel}</span>
                </div>
            `;
        }).join('');

    } catch (err) {
        showError(err.message || 'Failed to fetch appointment slots');
    }
}

function selectAppointmentSlot(slot) {
    selectedAppointmentSlot = slot;
    const bookBtn = document.getElementById('btn-book-appointment');
    if (bookBtn) bookBtn.disabled = false;
}

async function bookAppointment() {
    const datePicker = document.getElementById('appointment-date-picker');
    const selectedDate = datePicker ? datePicker.value : '';

    if (!selectedDate || !selectedAppointmentSlot) {
        showError('Please select both a date and an available time slot.');
        return;
    }

    try {
        await CemboClear.client().post('/appointments', {
            date: selectedDate,
            time_slot: selectedAppointmentSlot
        });

        showSuccess(`Appointment booked successfully for ${selectedDate} at ${selectedAppointmentSlot}!`);
        await loadAvailableSlots();
        await loadMyAppointments();

    } catch (err) {
        showError(err.message || 'Failed to book appointment');
    }
}

async function loadMyAppointments() {
    const container = document.getElementById('my-appointments-list');
    if (!container) return;

    try {
        const res = await CemboClear.client().get('/appointments');
        const list = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);

        if (list.length === 0) {
            container.innerHTML = '<p style="color:#777; font-style:italic;">No upcoming appointments.</p>';
            return;
        }

        container.innerHTML = list.map(a => `
            <div style="background:#fff; border:1px solid #e0e0e0; border-radius:12px; padding:15px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong style="color:#0056b3;">${a.appt_date || a.date}</strong> — <span>Time Slot: ${a.time_slot}</span>
                    <div style="font-size:12px; color:#777; margin-top:4px;">Status: <span style="font-weight:bold; text-transform:uppercase;">${a.status}</span></div>
                </div>
                <div>
                    ${a.status !== 'cancelled' ? `<button onclick="cancelAppointment(${a.id})" style="background:#dc3545; color:#fff; border:none; padding:6px 15px; border-radius:6px; font-weight:bold; font-size:12px; cursor:pointer;">Cancel</button>` : '<span style="color:#888; font-size:12px;">Cancelled</span>'}
                </div>
            </div>
        `).join('');

    } catch (err) {
        showError(err.message || 'Failed to load appointments');
    }
}

async function cancelAppointment(id) {
    try {
        await CemboClear.client().put('/appointments/' + id + '/cancel');
        showSuccess('Appointment cancelled successfully.');
        await loadMyAppointments();
        await loadAvailableSlots();
    } catch (err) {
        showError(err.message || 'Failed to cancel appointment');
    }
}





async function loadMyTransactions() {
    const container = document.getElementById('resident-transactions-list');
    if (!container) return;

    try {
        const res = await CemboClear.client().get('/transactions');
        const txs = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);

        if (txs.length === 0) {
            container.innerHTML = '<p style="color:#777; font-style:italic;">No transactions recorded.</p>';
            return;
        }

        container.innerHTML = txs.map(t => `
            <div style="background:#fff; border:1px solid #e0e0e0; border-radius:12px; padding:15px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong>${t.description || 'Transaction #' + t.id}</strong>
                    <div style="font-size:12px; color:#888; margin-top:4px;">${t.transacted_at || ''}</div>
                </div>
                <div style="font-weight:bold; font-size:16px; color:#28a745;">
                    ₱${parseFloat(t.amount || 0).toFixed(2)}
                </div>
            </div>
        `).join('');
    } catch (err) {
        showError(err.message || 'Failed to load transactions');
    }
}





async function loadResidentMail() {
    const container = document.getElementById('resident-mail-list');
    const header = document.getElementById('resident-mail-header');
    if (!container) return;

    try {
        const res = await CemboClear.client().get('/mail');
        cachedResidentMail = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);

        if (header) header.textContent = `Inbox (${cachedResidentMail.length})`;

        if (cachedResidentMail.length === 0) {
            container.innerHTML = '<div style="padding:15px; color:#777; font-size:13px; text-align:center;">No mail messages in inbox.</div>';
            return;
        }

        container.innerHTML = cachedResidentMail.map(m => `
            <div class="mail-item ${m.is_read ? '' : 'active'}" onclick="selectResidentMail(${m.id})" style="cursor:pointer; padding:12px; border-bottom:1px solid #eee;">
                <div class="mail-item-top" style="display:flex; justify-content:space-between;">
                    <span class="mail-item-title" style="font-weight:bold;">${m.sender_name || 'Admin'}</span>
                    <span class="mail-item-time" style="font-size:12px; color:#888;">${m.created_at ? m.created_at.substring(0, 10) : ''}</span>
                </div>
                <div class="mail-item-preview" style="font-size:13px; color:#555; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${m.subject || 'No Subject'}</div>
            </div>
        `).join('');

        if (cachedResidentMail.length > 0) {
            selectResidentMail(cachedResidentMail[0].id);
        }
    } catch (err) {
        showError(err.message || 'Failed to load resident mail');
    }
}

function selectResidentMail(id) {
    const mail = cachedResidentMail.find(m => m.id === id);
    if (!mail) return;
    currentResidentMail = mail;

    const subjEl = document.getElementById('resident-mail-subject');
    const senderEl = document.getElementById('resident-mail-sender');
    const dateEl = document.getElementById('resident-mail-date');
    const bodyEl = document.getElementById('resident-mail-body');
    const readBtn = document.getElementById('resident-mail-read-btn');

    if (subjEl) subjEl.textContent = mail.subject || 'No Subject';
    if (senderEl) senderEl.textContent = 'From: ' + (mail.sender_name || 'Barangay Staff');
    if (dateEl) dateEl.textContent = 'Date: ' + (mail.created_at || '');
    if (bodyEl) bodyEl.textContent = mail.body || '';
    if (readBtn) {
        readBtn.onclick = async () => {
            try {
                await CemboClear.client().put('/mail/' + id + '/read');
                await loadResidentMail();
            } catch (err) {
                showError(err.message || 'Failed to mark mail read');
            }
        };
    }
}





function openComposeMail() {
    const modal = document.getElementById('compose-mail-modal');
    if (modal) modal.classList.add('open');
}

function closeComposeMail() {
    const modal = document.getElementById('compose-mail-modal');
    if (modal) modal.classList.remove('open');
}

function resetComposeMailForm() {
    const form = document.getElementById('compose-mail-form');
    if (form) form.reset();
    const idEl = document.getElementById('resident-mail-recipient-id');
    const typeEl = document.getElementById('resident-mail-recipient-type');
    const resEl = document.getElementById('resident-mail-recipient-results');
    if (idEl) idEl.value = '';
    if (typeEl) typeEl.value = 'staff';
    if (resEl) { resEl.classList.remove('show'); resEl.innerHTML = ''; }
}



function wireResidentRecipientSearch() {
    const searchEl = document.getElementById('resident-mail-recipient-search');
    const resEl = document.getElementById('resident-mail-recipient-results');
    if (!searchEl || !resEl) return;

    const show = function (html, keepOpen) {
        resEl.innerHTML = html;
        resEl.classList.toggle('show', !!keepOpen);
    };

    searchEl.addEventListener('input', function () {
        clearTimeout(composeRecipientTimer);
        const q = this.value.trim();
        if (!q) {
            show('', false);
            const idEl = document.getElementById('resident-mail-recipient-id');
            if (idEl) idEl.value = '';
            return;
        }
        composeRecipientTimer = setTimeout(async () => {
            try {
                const res = await CemboClear.client().get('/mail/recipients/search?q=' + encodeURIComponent(q));
                const recipients = (res && res.data) ? res.data : [];
                if (recipients.length === 0) {
                    show('<div class="compose-empty">No matching office or staff found.</div>', true);
                    return;
                }
                show(recipients.map(r => {
                    const safeName = String(r.name || '').replace(/\s+/g, ' ').trim();
                    const sub = r.type === 'staff'
                        ? (r.control_no || 'Barangay Staff')
                        : (r.control_no ? 'Resident ' + r.control_no : 'Resident');
                    return `<div class="compose-option" data-id="${r.id}" data-type="${r.type}" data-name="${safeName}">
                        <div>
                            <div class="compose-option-name">${safeName}</div>
                            <div class="compose-option-sub">${sub}</div>
                        </div>
                    </div>`;
                }).join(''), true);
            } catch (err) {
                show('<div class="compose-empty">Search failed. Try again.</div>', true);
            }
        }, 300);
    });

    resEl.addEventListener('click', function (e) {
        const opt = e.target.closest('.compose-option');
        if (!opt) return;
        const idEl = document.getElementById('resident-mail-recipient-id');
        const typeEl = document.getElementById('resident-mail-recipient-type');
        if (idEl) idEl.value = opt.getAttribute('data-id');
        if (typeEl) typeEl.value = opt.getAttribute('data-type');
        searchEl.value = opt.getAttribute('data-name');
        show('', false);
    });

    document.addEventListener('click', function (e) {
        if (!searchEl.contains(e.target) && !resEl.contains(e.target)) {
            show('', false);
        }
    });
}

async function sendResidentMail(event) {
    event.preventDefault();
    const idEl = document.getElementById('resident-mail-recipient-id');
    const typeEl = document.getElementById('resident-mail-recipient-type');
    const subjEl = document.getElementById('resident-mail-input-subject');
    const bodyEl = document.getElementById('resident-mail-input-body');

    const recipientId = idEl ? idEl.value : '';
    const recipientType = typeEl ? typeEl.value : 'staff';
    const subject = subjEl ? subjEl.value.trim() : '';
    const body = bodyEl ? bodyEl.value.trim() : '';

    if (!recipientId) {
        showError('Please select a recipient from the search results.');
        return;
    }
    if (!subject && !body) {
        showError('Please enter a subject or message body.');
        return;
    }

    try {
        await CemboClear.client().post('/mail', {
            recipient_id: parseInt(recipientId, 10),
            recipient_type: recipientType,
            subject: subject,
            body: body
        });
        showSuccess('Message sent successfully.');
        closeComposeMail();
        resetComposeMailForm();
        await loadResidentMail();
    } catch (err) {
        showError(err.message || 'Failed to send message');
    }
}


function replyToResidentMail() {
    if (!currentResidentMail) {
        showError('Select a message to reply to first.');
        return;
    }

    let recipientId = null;
    let recipientType = null;
    if (currentResidentMail.sender_staff_id) {
        recipientId = currentResidentMail.sender_staff_id;
        recipientType = 'staff';
    } else if (currentResidentMail.sender_resident_id) {
        recipientId = currentResidentMail.sender_resident_id;
        recipientType = 'resident';
    }
    if (!recipientId) {
        showError('Cannot reply: unknown sender.');
        return;
    }

    const searchEl = document.getElementById('resident-mail-recipient-search');
    const idEl = document.getElementById('resident-mail-recipient-id');
    const typeEl = document.getElementById('resident-mail-recipient-type');
    const subjEl = document.getElementById('resident-mail-input-subject');
    const bodyEl = document.getElementById('resident-mail-input-body');

    if (searchEl) searchEl.value = currentResidentMail.sender_name || ('Recipient #' + recipientId);
    if (idEl) idEl.value = recipientId;
    if (typeEl) typeEl.value = recipientType;
    if (subjEl) subjEl.value = (currentResidentMail.subject ? 'Re: ' : '') + (currentResidentMail.subject || '');
    if (bodyEl) bodyEl.value = '';

    openComposeMail();
}

async function loadResidentNotifications() {
    const container = document.getElementById('resident-notification-list');
    const badge = document.getElementById('resident-notification-badge');
    if (!container) return;

    try {
        const res = await CemboClear.client().get('/notifications');
        const notifs = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
        const unreadCount = notifs.filter(n => !n.is_read).length;

        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
                badge.textContent = '';
            }
        }

        if (notifs.length === 0) {
            container.innerHTML = '<div style="padding:15px; color:#777; font-size:13px; text-align:center;">No notifications.</div>';
            return;
        }

        container.innerHTML = notifs.map(n => `
            <div class="notification-item" onclick="markResidentNotificationRead(${n.id})" style="cursor:pointer; ${n.is_read ? 'opacity:0.6;' : ''}">
                <strong>Update:</strong> ${n.message}
                <div style="font-size:11px; color:#888; margin-top:2px;">${n.created_at || ''}</div>
            </div>
        `).join('');
    } catch (err) {
        showError(err.message || 'Failed to load notifications');
    }
}

async function markResidentNotificationRead(id) {
    try {
        await CemboClear.client().put('/notifications/' + id + '/read');
        await loadResidentNotifications();
    } catch (e) {}
}





document.addEventListener('DOMContentLoaded', async function () {
    
    const datePicker = document.getElementById('appointment-date-picker');
    if (datePicker) {
        const today = new Date().toISOString().split('T')[0];
        datePicker.value = today;
    }

    
    const now = new Date();
    calendarViewYear = now.getFullYear();
    calendarViewMonth = now.getMonth();
    renderResidentCalendar();

    
    const dateTimeEl = document.getElementById('info-datetime');
    if (dateTimeEl) {
        dateTimeEl.value = new Date().toLocaleString();
    }

    
    try {
        const meRes = await CemboClear.client().me();
        if (meRes && meRes.id) {
            currentUser = meRes; 
            if (currentUser.type !== 'resident') {
                window.location.href = 'CCLog-in.html';
                return;
            }

            const fullName = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || 'Resident User';
            const initials = `${(currentUser.first_name || 'J')[0]}${(currentUser.last_name || 'D')[0]}`.toUpperCase();

            
            const navName = document.getElementById('nav-user-name');
            const initialsPill = document.querySelector('.user-pill-initials');
            const sidebarInitials = document.getElementById('sidebar-user-initials');
            const profileName = document.getElementById('resident-profile-name-display');
            const avatarFallback = document.getElementById('resident-profile-avatar-fallback');
            const accountControl = document.getElementById('account-control-no');

            if (navName) navName.textContent = fullName;
            if (initialsPill) initialsPill.textContent = initials;
            if (sidebarInitials) sidebarInitials.textContent = initials;
            if (profileName) profileName.textContent = fullName;
            if (avatarFallback) avatarFallback.textContent = initials;
            if (accountControl) accountControl.value = currentUser.control_no || 'N/A';

            
            const accEmail = document.getElementById('account-email');
            const accPhone = document.getElementById('account-phone');
            const accBirth = document.getElementById('account-birthdate');
            if (accEmail) accEmail.value = currentUser.email || '';
            if (accPhone) accPhone.value = currentUser.phone || '';
            if (accBirth) accBirth.value = currentUser.birthdate || '';

            

            const profName = document.getElementById('resident-full-name');
            const profEmail = document.getElementById('resident-email');
            const profContact = document.getElementById('resident-contact');
            const profAddress = document.getElementById('resident-address');
            const profRole = document.getElementById('resident-role');
            if (profName) profName.value = fullName;
            if (profEmail) profEmail.value = currentUser.email || '';
            if (profContact) profContact.value = currentUser.phone || '';
            if (profAddress) profAddress.value = currentUser.address || '';
            if (profRole) profRole.value = currentUser.control_no || 'N/A';

            
            const infoLast = document.getElementById('info-last-name');
            const infoFirst = document.getElementById('info-first-name');
            const infoMiddle = document.getElementById('info-middle-name');
            const infoSuffix = document.getElementById('info-suffix');
            const infoBirth = document.getElementById('info-birthdate');
            const infoPlace = document.getElementById('info-birth-place');
            const infoGender = document.getElementById('info-gender');
            const infoCivil = document.getElementById('info-civil-status');
            const infoAddress = document.getElementById('info-address');
            const infoCitizen = document.getElementById('info-citizenship');
            const infoPhone = document.getElementById('info-phone');
            const infoEmail = document.getElementById('info-email');

            if (infoLast) infoLast.value = currentUser.last_name || '';
            if (infoFirst) infoFirst.value = currentUser.first_name || '';
            if (infoMiddle) infoMiddle.value = currentUser.middle_name || '';
            if (infoSuffix) infoSuffix.value = currentUser.suffix || '';
            if (infoBirth) infoBirth.value = currentUser.birthdate || '';
            if (infoPlace) infoPlace.value = currentUser.birth_place || '';
            if (infoGender) infoGender.value = (currentUser.gender || '').toLowerCase();
            if (infoCivil) infoCivil.value = currentUser.civil_status || '';
            if (infoAddress) infoAddress.value = currentUser.address || '';
            if (infoCitizen) infoCitizen.value = currentUser.citizenship || '';
            if (infoPhone) infoPhone.value = currentUser.phone || '';
            if (infoEmail) infoEmail.value = currentUser.email || '';
        }
    } catch (err) {
        if (err && err.status === 401) {
            window.redirectToLogin();
            return;
        }
    }

    

    const fileInput = document.getElementById('complaint-file');
    const fileNameDisplay = document.getElementById('complaint-file-name');
    if (fileInput && fileNameDisplay) {
        fileInput.addEventListener('change', function () {
            fileNameDisplay.textContent = this.files && this.files[0] ? this.files[0].name : 'No file chosen';
        });
    }

    
    await loadCertificatePurposes();
    initSignatureCanvas();
    await loadMyCertificates();
    await loadMyRequests();
    await loadAvailableSlots();
    await loadMyAppointments();
    await loadMyTransactions();
    wireResidentRecipientSearch();
    await loadResidentMail();
    await loadResidentNotifications();
});
