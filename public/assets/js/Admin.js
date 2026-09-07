
window.redirectToLogin = function () {
    window.location.href = 'CCLog-in.html';
};


function showError(message) {
    const banner = document.getElementById('admin-error-banner');
    const textEl = document.getElementById('admin-error-text');
    if (banner && textEl) {
        textEl.textContent = message || 'An error occurred. Please try again.';
        banner.classList.remove('hidden');
    }
}



function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('hidden');
    el.classList.add('flex');
}


function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('hidden');
    el.classList.remove('flex');
}


let currentUser = null;
let genderPieChart = null;
let ageAreaChart = null;


let activeMainTab = 'gender';
let activeRecordsSub = 'compile';
let activeSecuritySub = 'monitoring';

function toggleProfilePanel(forceOpen) {
    const overlay = document.getElementById('profile-overlay');
    if (!overlay) return;
    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : overlay.classList.contains('hidden');
    overlay.classList.toggle('hidden', !shouldOpen);
    overlay.classList.toggle('flex', shouldOpen);
}

function toggleNotificationsPanel(forceOpen) {
    const panel = document.getElementById('notification-panel');
    const trigger = document.getElementById('notification-trigger');
    if (!panel || !trigger) return;

    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !shouldOpen);
    trigger.classList.toggle('bg-blue-50', shouldOpen);
    trigger.classList.toggle('text-blue-700', shouldOpen);
    trigger.classList.toggle('ring-2', shouldOpen);
    trigger.classList.toggle('ring-blue-400', shouldOpen);
}

function closeProfilePanel() {
    toggleProfilePanel(false);
    showProfileSection('contact');
}

function openAccountPanel() {
    const overlay = document.getElementById('account-panel-overlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
}

function closeAccountPanel() {
    const overlay = document.getElementById('account-panel-overlay');
    if (!overlay) return;
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
}

function closeNotificationsPanel() {
    toggleNotificationsPanel(false);
}

function showProfileSection(section) {
    const sections = ['contact', 'edit', 'activity'];
    sections.forEach(key => {
        const element = document.getElementById('profile-detail-' + key);
        if (element) {
            element.classList.toggle('hidden', key !== section);
        }
    });
}

function clearAllTabs() {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.records-tab-content').forEach(el => el.classList.add('hidden'));

    const tabs = ['gender', 'age', 'updates', 'records-data', 'transaction', 'print-receipt', 'settings', 'mail', 'security'];
    tabs.forEach(id => {
        const btn = document.getElementById('tab-btn-' + id);
        if (btn) {
            btn.classList.remove('active-menu', 'text-gray-900', 'font-semibold');
            btn.classList.add('text-gray-500');
        }
    });

    document.querySelectorAll('.records-subtab').forEach(btn => {
        btn.classList.remove('active-menu', 'text-gray-900', 'font-semibold');
        btn.classList.add('text-gray-500');
    });

    document.querySelectorAll('.security-subtab').forEach(btn => {
        btn.classList.remove('active-menu', 'text-gray-900', 'font-semibold');
        btn.classList.add('text-gray-500');
    });

    document.querySelectorAll('.mail-subtab').forEach(btn => {
        btn.classList.remove('active-menu', 'text-gray-900', 'font-semibold');
        btn.classList.add('text-gray-500');
    });
}

function activateMainButton(tabId) {
    const btn = document.getElementById('tab-btn-' + tabId);
    if (btn) {
        btn.classList.add('active-menu', 'text-gray-900', 'font-semibold');
        btn.classList.remove('text-gray-500');
    }
    activeMainTab = tabId;
}

function activateRecordsSub(subId) {
    const btn = document.getElementById('tab-btn-records-' + subId);
    if (btn) {
        btn.classList.add('active-menu', 'text-gray-900', 'font-semibold');
        btn.classList.remove('text-gray-500');
    }
    activeRecordsSub = subId;
}

function toggleSidebarGroup(groupId) {
    const groupItems = document.getElementById('sidebar-group-' + groupId + '-items');
    const toggleIcon = document.getElementById('sidebar-toggle-icon-' + groupId);
    if (!groupItems) return;

    const groups = ['dashboard', 'financial', 'records', 'security', 'mail', 'settings'];
    groups.forEach(g => {
        const items = document.getElementById('sidebar-group-' + g + '-items');
        const icon = document.getElementById('sidebar-toggle-icon-' + g);
        if (!items) return;
        if (g === groupId) return;
        if (!items.classList.contains('hidden')) {
            items.classList.add('hidden');
            if (icon) icon.textContent = '+';
        }
    });

    const isOpen = !groupItems.classList.contains('hidden');
    if (isOpen) {
        groupItems.classList.add('hidden');
        if (toggleIcon) toggleIcon.textContent = '+';
    } else {
        groupItems.classList.remove('hidden');
        if (toggleIcon) toggleIcon.textContent = '−';
    }
}

function switchTab(tabId) {
    const mainPanel = document.getElementById('view-' + tabId);
    const panelIsVisible = mainPanel && !mainPanel.classList.contains('hidden');

    if (panelIsVisible && activeMainTab === tabId) {
        clearAllTabs();
        activeMainTab = null;
        return;
    }

    clearAllTabs();
    if (mainPanel) {
        mainPanel.classList.remove('hidden');
    }
    activateMainButton(tabId);

    if (tabId === 'records-data') {
        const subId = activeRecordsSub || 'compile';
        activateRecordsSub(subId);
        const subPanel = document.getElementById('view-records-' + subId);
        if (subPanel) {
            subPanel.classList.remove('hidden');
        }
    }
}

function openSecuritySection(subId) {
    const secPanel = document.getElementById('view-security');
    const panelIsVisible = secPanel && !secPanel.classList.contains('hidden');

    if (panelIsVisible && activeMainTab === 'security' && activeSecuritySub === subId) {
        clearAllTabs();
        activeMainTab = null;
        return;
    }

    clearAllTabs();
    if (secPanel) secPanel.classList.remove('hidden');
    activateMainButton('security');
    activateSecuritySub(subId);

    document.querySelectorAll('.security-subview').forEach(el => el.classList.add('hidden'));
    const sub = document.getElementById('view-security-' + subId);
    if (sub) sub.classList.remove('hidden');

    
    
    
    if (subId === 'monitoring') {
        loadAuditLogs();
    } else if (subId === 'rbac') {
        loadStaff();
    }
}

function activateSecuritySub(subId) {
    document.querySelectorAll('.security-subtab').forEach(btn => {
        btn.classList.remove('active-menu', 'text-gray-900', 'font-semibold');
        btn.classList.add('text-gray-500');
    });
    const btn = document.getElementById('tab-btn-security-' + subId);
    if (btn) {
        btn.classList.add('active-menu', 'text-gray-900', 'font-semibold');
        btn.classList.remove('text-gray-500');
    }
    activeSecuritySub = subId;
}

function openRecordsData(subId) {
    const recordsPanel = document.getElementById('view-records-data');
    const panelIsVisible = recordsPanel && !recordsPanel.classList.contains('hidden');

    if (panelIsVisible && activeMainTab === 'records-data' && activeRecordsSub === subId) {
        clearAllTabs();
        activeMainTab = null;
        return;
    }

    clearAllTabs();
    if (recordsPanel) {
        recordsPanel.classList.remove('hidden');
    }
    activateMainButton('records-data');
    activateRecordsSub(subId);

    const subPanel = document.getElementById('view-records-' + subId);
    if (subPanel) {
        subPanel.classList.remove('hidden');
    }

    
    if (subId === 'audit') {
        loadFreshnessAudit(document.getElementById('freshness-search-input')?.value || '');
    }
}

function openMailSection(subId) {
    const mailPanel = document.getElementById('view-mail');
    const panelIsVisible = mailPanel && !mailPanel.classList.contains('hidden');

    if (panelIsVisible && activeMainTab === 'mail') {
        clearAllTabs();
        activeMainTab = null;
        return;
    }

    clearAllTabs();
    if (mailPanel) mailPanel.classList.remove('hidden');
    activateMainButton('mail');

    document.querySelectorAll('.mail-subtab').forEach(btn => {
        btn.classList.remove('active-menu', 'text-gray-900', 'font-semibold');
        btn.classList.add('text-gray-500');
    });
    const btn = document.getElementById('tab-btn-mail-' + subId);
    if (btn) {
        btn.classList.add('active-menu', 'text-gray-900', 'font-semibold');
        btn.classList.remove('text-gray-500');
    }
}





async function logoutStaff() {
    openConfirmModal({
        title: 'Log out?',
        message: 'Are you sure you want to log out of this account?',
        confirmText: 'Log out',
        danger: true,
        onConfirm: doLogout
    });
}

async function doLogout() {
    try {
        await CemboClear.client().logout();
    } catch (e) {
        
    } finally {
        window.location.href = 'CCLog-in.html';
    }
}


async function loadDashboardStats() {
    try {
        const stats = await CemboClear.client().get('/dashboard/stats');
        if (!stats) return;

        
        if (stats.gender_distribution && genderPieChart) {
            let maleCount = 0;
            let femaleCount = 0;
            stats.gender_distribution.forEach(g => {
                const name = String(g.gender || '').toLowerCase();
                if (name === 'male') maleCount = g.cnt;
                else if (name === 'female') femaleCount = g.cnt;
            });
            genderPieChart.data.labels = ['Male', 'Female'];
            genderPieChart.data.datasets[0].data = [maleCount, femaleCount];
            genderPieChart.update();

            const maleEl = document.getElementById('stat-gender-male-count');
            const femaleEl = document.getElementById('stat-gender-female-count');
            const totalEl = document.getElementById('stat-total-residents-gender');
            if (maleEl) maleEl.textContent = maleCount;
            if (femaleEl) femaleEl.textContent = femaleCount;
            if (totalEl) totalEl.textContent = stats.total_residents || (maleCount + femaleCount);
        }

        
        if (stats.age_distribution && ageAreaChart) {
            const labels = stats.age_distribution.map(a => a.age_group);
            const counts = stats.age_distribution.map(a => a.cnt);
            ageAreaChart.data.labels = labels.length ? labels : ageAreaChart.data.labels;
            if (counts.length) {
                ageAreaChart.data.datasets[0].data = counts;
            }
            ageAreaChart.update();
        }

        
        const pendingReq = document.getElementById('stat-pending-requests');
        const verifiedResCard = document.getElementById('stat-verified-residents-card');
        const totalResCard = document.getElementById('stat-total-residents-card');
        const pendingRes = document.getElementById('stat-pending-residents');
        const verifiedRes = document.getElementById('stat-verified-residents');
        const upcomingAppt = document.getElementById('stat-upcoming-appointments');

        if (pendingReq) pendingReq.textContent = stats.pending_requests ?? 0;
        if (verifiedResCard) verifiedResCard.textContent = stats.verified_residents ?? 0;
        if (totalResCard) totalResCard.textContent = stats.total_residents ?? 0;
        if (pendingRes) pendingRes.textContent = stats.pending_residents ?? 0;
        if (verifiedRes) verifiedRes.textContent = stats.verified_residents ?? 0;
        if (upcomingAppt) upcomingAppt.textContent = stats.upcoming_appointments ?? 0;

        if (stats.data_freshness) {
            const df = stats.data_freshness;
            const barUpdated = document.getElementById('freshness-bar-updated');
            const barWarning = document.getElementById('freshness-bar-warning');
            const barStale = document.getElementById('freshness-bar-stale');
            const lblUpdated = document.getElementById('freshness-label-updated');
            const lblWarning = document.getElementById('freshness-label-warning');
            const lblStale = document.getElementById('freshness-label-stale');
            const badge = document.getElementById('freshness-status-badge');

            if (barUpdated) barUpdated.style.width = df.updated_pct + '%';
            if (barWarning) barWarning.style.width = df.warning_pct + '%';
            if (barStale) barStale.style.width = df.stale_pct + '%';

            if (lblUpdated) lblUpdated.textContent = df.updated_pct + '% Updated';
            if (lblWarning) lblWarning.textContent = df.warning_pct + '% > 30d';
            if (lblStale) lblStale.textContent = df.stale_pct + '% Outdated';

            if (badge) {
                if (df.stale_pct > 20) {
                    badge.textContent = 'Action Required';
                    badge.className = 'bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-md';
                } else if (df.warning_pct > 30) {
                    badge.textContent = 'Review Needed';
                    badge.className = 'bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-md';
                } else {
                    badge.textContent = 'Healthy';
                    badge.className = 'bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md';
                }
            }
        }

    } catch (err) {
        showError(err.message || 'Failed to load dashboard stats');
    }
}


let searchDebounceTimer = null;
function getRbiStatusFilter() {
    const el = document.getElementById('rbi-status-filter');
    return el ? (el.value || '') : '';
}

async function loadResidents(page = 1, query = '', status = '') {
    const tableBody = document.getElementById('rbi-table-body');
    if (!tableBody) return;

    status = status === undefined ? getRbiStatusFilter() : status;
    query = query === undefined ? '' : query;

    try {
        let res;
        if (query.trim()) {
            

            res = await CemboClear.client().get('/residents/search?q=' + encodeURIComponent(query.trim()));
            let residents = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
            if (status) {
                residents = residents.filter(r => r.registry_status === status);
            }
            res = { data: residents, total: residents.length };
        } else {
            const url = '/residents?page=' + page + '&limit=25' + (status ? '&status=' + encodeURIComponent(status) : '');
            res = await CemboClear.client().get(url);
        }

        const residents = (res && res.data) ? res.data : [];
        if (residents.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-500">No resident records found.</td></tr>';
        } else {
            tableBody.innerHTML = residents.map(r => {
                const fullName = `${r.last_name || ''}, ${r.first_name || ''} ${r.middle_name || ''}`.trim();
                const initials = `${(r.first_name || 'R')[0]}${(r.last_name || 'U')[0]}`.toUpperCase();
                const statusClass = r.registry_status === 'verified'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-yellow-100 text-yellow-700';

                return `
                    <tr class="bg-white hover:bg-gray-50">
                        <td class="p-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-blue-800 text-white rounded-full flex items-center justify-center font-bold">${initials}</div>
                                <div>
                                    <div class="font-semibold text-gray-800">${fullName}</div>
                                    <div class="text-xs text-gray-400">Control No: ${r.control_no || 'N/A'}</div>
                                </div>
                            </div>
                        </td>
                        <td class="p-4 text-gray-600">${r.address || 'N/A'}</td>
                        <td class="p-4 text-gray-600 capitalize">${r.gender || 'N/A'}</td>
                        <td class="p-4">
                            <span class="inline-flex px-3 py-1 rounded-full ${statusClass} text-xs font-bold capitalize">${r.registry_status || 'pending'}</span>
                        </td>
                        <td class="p-4 flex items-center gap-2">
                            <button onclick="viewResidentDetail(${r.id})" class="text-gray-500 hover:text-blue-700" title="View Details"><i class="fas fa-eye"></i></button>
                            ${r.registry_status !== 'verified' ? `<button onclick="reviewAndVerify(${r.id})" class="text-emerald-600 hover:text-emerald-800 font-semibold text-xs border border-emerald-300 rounded px-2 py-1">Verify</button>` : ''}
                        </td>
                    </tr>
                `;
            }).join('');
        }

        

        const pagEl = document.getElementById('rbi-pagination');
        if (pagEl && res.total) {
            const totalPages = Math.ceil(res.total / 25);
            let btns = '';
            for (let i = 1; i <= Math.min(totalPages, 5); i++) {
                const active = i === page ? 'bg-blue-800 text-white font-bold' : 'bg-gray-200 text-gray-600';
                btns += `<button onclick="loadResidents(${i}, '${query}', '${status}')" class="w-9 h-9 rounded-full ${active}">${i}</button>`;
            }
            pagEl.innerHTML = btns;
        }

    } catch (err) {
        showError(err.message || 'Failed to load residents');
    }
}


function freshnessStatus(r) {
    
    const ref = r.updated_at || r.created_at;
    if (!ref) return { key: 'stale', label: 'Outdated', cls: 'bg-rose-100 text-rose-700' };
    const days = Math.max(0, Math.floor((Date.now() - new Date(ref).getTime()) / 86400000));
    if (days <= 30)  return { key: 'updated', label: 'Updated',   cls: 'bg-emerald-100 text-emerald-700' };
    if (days <= 90)  return { key: 'warning', label: 'Review',    cls: 'bg-amber-100 text-amber-700' };
    return { key: 'stale',   label: 'Outdated', cls: 'bg-rose-100 text-rose-700' };
}

async function loadFreshnessAudit(query = '') {
    const container = document.getElementById('freshness-audit-results');
    const countEl = document.getElementById('freshness-result-count');
    if (!container) return;

    const q = query.trim();
    if (!q) {
        container.innerHTML = 'Enter a resident name or ID above to audit their record freshness.';
        if (countEl) countEl.textContent = '';
        return;
    }

    try {
        const res = await CemboClear.client().get('/residents/search?q=' + encodeURIComponent(q));
        const residents = (res && res.data) ? res.data : [];

        if (residents.length === 0) {
            container.innerHTML = '<div class="p-8 text-center text-gray-500">No residents found for "' + q + '".</div>';
            if (countEl) countEl.textContent = '0 results';
            return;
        }

        if (countEl) countEl.textContent = residents.length + ' resident' + (residents.length === 1 ? '' : 's');
        container.innerHTML = residents.map(r => {
            const name = [r.first_name, r.middle_name, r.last_name].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
            const initials = `${(r.first_name || 'R')[0]}${(r.last_name || 'U')[0]}`.toUpperCase();
            const fs = freshnessStatus(r);
            const registryClass = r.registry_status === 'verified'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-yellow-100 text-yellow-700';
            const lastUpdated = r.updated_at || r.created_at;
            const lastUpdatedLabel = lastUpdated ? new Date(lastUpdated).toLocaleDateString() : '—';

            return `
                <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border border-gray-200 rounded-2xl p-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-blue-800 text-white rounded-full flex items-center justify-center font-bold">${initials}</div>
                        <div>
                            <div class="font-semibold text-gray-800">${name} <span class="text-gray-400 font-normal text-xs">(ID: #${r.id})</span></div>
                            <div class="text-xs text-gray-400">Control No: ${r.control_no || 'N/A'} &middot; Last Updated: ${lastUpdatedLabel}</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="inline-flex px-3 py-1 rounded-full ${registryClass} text-xs font-bold capitalize">${r.registry_status || 'pending'}</span>
                        <span class="inline-flex px-3 py-1 rounded-full ${fs.cls} text-xs font-bold">${fs.label}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        container.innerHTML = '<div class="p-8 text-center text-gray-500">Search failed.</div>';
        if (countEl) countEl.textContent = '';
    }
}

async function viewResidentDetail(id) {
    try {
        const res = await CemboClear.client().get('/residents/' + id);
        if (!res) return;
        const modal = document.getElementById('resident-detail-modal');
        const container = document.getElementById('resident-detail-content');
        if (modal && container) {
            container.innerHTML = `
                <div class="grid grid-cols-2 gap-4">
                    <div><strong>Full Name:</strong> ${res.first_name || ''} ${res.middle_name || ''} ${res.last_name || ''} ${res.suffix || ''}</div>
                    <div><strong>Control No:</strong> ${res.control_no || 'N/A'}</div>
                    <div><strong>Email:</strong> ${res.email || 'N/A'}</div>
                    <div><strong>Phone:</strong> ${res.phone || 'N/A'}</div>
                    <div><strong>Birthdate:</strong> ${res.birthdate || 'N/A'}</div>
                    <div><strong>Birth Place:</strong> ${res.birth_place || 'N/A'}</div>
                    <div><strong>Gender:</strong> ${res.gender || 'N/A'}</div>
                    <div><strong>Civil Status:</strong> ${res.civil_status || 'N/A'}</div>
                    <div class="col-span-2"><strong>Address:</strong> ${res.address || 'N/A'}</div>
                    <div><strong>Citizenship:</strong> ${res.citizenship || 'N/A'}</div>
                    <div><strong>Registry Status:</strong> ${res.registry_status || 'pending'}</div>
                </div>
            `;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    } catch (err) {
        showError(err.message || 'Failed to fetch resident details');
    }
}

function closeVerifyModal() {
    const modal = document.getElementById('verify-resident-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function openVerifyModal() {
    const modal = document.getElementById('verify-resident-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}


window.attachmentPreviewFail = function (imgEl, dlUrl) {
    if (!imgEl) return;
    const box = imgEl.closest('div');
    if (box) {
        box.innerHTML = `<div class="p-6 text-center text-sm text-gray-500">Preview unavailable &middot; <a class="text-blue-600 underline" href="${dlUrl}" target="_blank" rel="noopener">Download file</a></div>`;
    }
};



window.reviewAndVerify = async function (id) {
    let res;
    try {
        res = await CemboClear.client().get('/residents/' + id);
    } catch (err) {
        showError(err.message || 'Failed to load resident details');
        return;
    }
    if (!res) return;

    const container = document.getElementById('verify-resident-content');
    if (!container) return;

    const attachments = Array.isArray(res.attachments) ? res.attachments : [];
    const signature = attachments.find(a => a.kind === 'signature');
    const validId = attachments.find(a => a.kind === 'valid_id');

    const name = [res.first_name, res.middle_name, res.last_name].filter(Boolean).join(' ').trim() || ('Resident #' + res.id);

    const renderAttachment = function (label, att) {
        if (!att) {
            return `
                <div>
                    <div class="text-xs font-bold text-gray-400 uppercase mb-1">${label}</div>
                    <div class="border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-400">No ${label.toLowerCase()} uploaded.</div>
                </div>`;
        }
        const dlUrl = CemboClear.attachmentUrl(att.id);
        const inUrl = CemboClear.attachmentUrl(att.id, { inline: true });
        return `
            <div>
                <div class="text-xs font-bold text-gray-700 uppercase mb-1">${label}</div>
                <div class="border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <img src="${inUrl}" alt="${label}" class="w-full max-h-56 object-contain bg-white" onerror="attachmentPreviewFail(this, '${dlUrl}')" />
                </div>
                <div class="text-xs text-gray-400 mt-1">${att.file_name || ''}</div>
            </div>`;
    };

    container.innerHTML = `
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
                <div class="text-lg font-bold text-gray-800">${name}</div>
                <div class="text-xs text-gray-400">Control No: ${res.control_no || 'N/A'} &middot; ID: #${res.id}</div>
            </div>
            <span class="inline-flex px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold capitalize">${res.registry_status || 'pending'}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${renderAttachment('Signature', signature)}
            ${renderAttachment('Valid ID', validId)}
        </div>

        <div class="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
            <span>Confirm the uploaded signature and ID belong to this resident before marking their profile verified.</span>
        </div>

        <div class="flex justify-end gap-3 pt-2">
            <button type="button" onclick="closeVerifyModal()" class="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700">Cancel</button>
            <button onclick="confirmVerify(${res.id})" class="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-md hover:bg-emerald-700">Confirm &amp; Verify</button>
        </div>
    `;

    openVerifyModal();
};


window.confirmVerify = async function (id) {
    try {
        await CemboClear.client().put('/residents/' + id + '/verify');
        closeVerifyModal();
        await loadResidents();
        await loadDashboardStats();
    } catch (err) {
        showError(err.message || 'Failed to verify resident');
    }
};


let certCache = [];
async function loadCertificates() {
    const body = document.getElementById('certificates-table-body');
    if (!body) return;

    try {
        const res = await CemboClear.client().get('/certificates');
        certCache = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
        const certs = certCache;
        if (certs.length === 0) {
            body.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-gray-500">No certificate applications found.</td></tr>';
            return;
        }

        body.innerHTML = certs.map(c => {
            const statusBg = c.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                             c.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                             'bg-yellow-100 text-yellow-700';

            const residentName = c.first_name ? `${c.first_name} ${c.last_name}` : (c.resident_name || 'Resident #' + c.resident_id);
            const purposeName = c.purpose || c.purpose_name || 'N/A';

            return `
                <tr class="bg-white">
                    <td class="p-4 font-bold">#CERT-${c.id}</td>
                    <td class="p-4 font-semibold text-gray-800">${residentName}</td>
                    <td class="p-4 text-gray-600">${purposeName}</td>
                    <td class="p-4 text-gray-500 text-xs">${c.applied_at || 'N/A'}</td>
                    <td class="p-4"><span class="inline-flex px-3 py-1 rounded-full ${statusBg} text-xs font-bold uppercase">${c.status}</span></td>
                    <td class="p-4 text-right space-x-2">
                        ${c.status === 'pending' ? `
                            <button onclick="reviewCertificate(${c.id})" class="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700">Approve</button>
                            <button onclick="reviewCertificate(${c.id}, true)" class="bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-700">Reject</button>
                        ` : '<span class="text-xs text-gray-400 font-semibold">Processed</span>'}
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        showError(err.message || 'Failed to load certificates');
    }
}


function closeConfirmModal() {
    const modal = document.getElementById('confirm-action-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

window.openConfirmModal = function (opts) {
    const modal = document.getElementById('confirm-action-modal');
    if (!modal) return;
    opts = opts || {};

    const title = document.getElementById('confirm-action-title');
    const msg = document.getElementById('confirm-action-message');
    const btn = document.getElementById('confirm-action-btn');

    if (title) title.textContent = opts.title || 'Are you sure?';
    if (msg) msg.textContent = opts.message || 'Are you sure you want to do this?';
    if (btn) {
        btn.textContent = opts.confirmText || 'Confirm';
        btn.className = 'px-5 py-2 rounded-xl text-white text-sm font-bold shadow-md ' +
            (opts.danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700');
        btn.onclick = function () {
            
            closeConfirmModal();
            if (typeof opts.onConfirm === 'function') opts.onConfirm();
        };
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
};


function closeCertificateModal() {
    const modal = document.getElementById('certificate-review-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}


window.reviewCertificate = async function (id, rejectMode) {
    const cert = (certCache || []).find(c => c.id === id);
    if (!cert) {
        showError('Certificate application not found.');
        return;
    }

    const container = document.getElementById('certificate-review-content');
    if (!container) return;

    const name = cert.first_name ? `${cert.first_name} ${cert.last_name}`
        : (cert.resident_name || 'Resident #' + cert.resident_id);

    
    let attHtml = '';
    try {
        const res = await CemboClear.client().get('/residents/' + cert.resident_id);
        const attachments = (res && Array.isArray(res.attachments)) ? res.attachments : [];
        const signature = attachments.find(a => a.kind === 'signature');
        const validId = attachments.find(a => a.kind === 'valid_id');
        attHtml = renderVerifyAttachment('Signature', signature) + renderVerifyAttachment('Valid ID', validId);
    } catch (e) {
        attHtml = '<div class="text-xs text-gray-400">Could not load resident attachments.</div>';
    }

    const approveBtn = rejectMode
        ? `<button onclick="confirmRejectCertificate(${cert.id})" class="px-5 py-2 rounded-xl bg-rose-600 text-white text-sm font-bold shadow-md hover:bg-rose-700">Reject Application</button>`
        : `<button onclick="confirmApproveCertificate(${cert.id})" class="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-md hover:bg-emerald-700">Approve Application</button>`;

    container.innerHTML = `
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
                <div class="text-lg font-bold text-gray-800">#CERT-${cert.id}</div>
                <div class="text-xs text-gray-400">Applied ${cert.applied_at || 'N/A'}</div>
            </div>
            <span class="inline-flex px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold capitalize">${cert.status || 'pending'}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <div class="text-xs font-bold text-gray-700 uppercase mb-1">Resident</div>
                <div class="text-sm font-semibold text-gray-800">${name}</div>
                <div class="text-xs text-gray-400">Control No: ${cert.control_no || 'N/A'} &middot; ID: #${cert.resident_id}</div>
            </div>
            <div>
                <div class="text-xs font-bold text-gray-700 uppercase mb-1">Purpose</div>
                <div class="text-sm font-semibold text-gray-800">${cert.purpose || 'N/A'}</div>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${attHtml}
        </div>

        <div class="flex justify-end gap-3 pt-2">
            <button type="button" onclick="closeCertificateModal()" class="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700">Cancel</button>
            ${approveBtn}
        </div>
    `;

    const modal = document.getElementById('certificate-review-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.renderVerifyAttachment = function (label, att) {
    if (!att) {
        return `
            <div>
                <div class="text-xs font-bold text-gray-400 uppercase mb-1">${label}</div>
                <div class="border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-400">No ${label.toLowerCase()} uploaded.</div>
            </div>`;
    }
    const dlUrl = CemboClear.attachmentUrl(att.id);
    const inUrl = CemboClear.attachmentUrl(att.id, { inline: true });
    return `
        <div>
            <div class="text-xs font-bold text-gray-700 uppercase mb-1">${label}</div>
            <div class="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <img src="${inUrl}" alt="${label}" class="w-full max-h-40 object-contain bg-white" onerror="attachmentPreviewFail(this, '${dlUrl}')" />
            </div>
        </div>`;
};


window.confirmApproveCertificate = function (id) {
    openConfirmModal({
        title: 'Approve certificate?',
        message: 'Are you sure you want to approve certificate #CERT-' + id + '? The resident will be notified.',
        confirmText: 'Approve',
        onConfirm: function () { approveCertificate(id); }
    });
};

window.confirmRejectCertificate = function (id) {
    openConfirmModal({
        title: 'Reject certificate?',
        message: 'Are you sure you want to reject certificate #CERT-' + id + '?',
        confirmText: 'Reject',
        danger: true,
        onConfirm: function () { rejectCertificate(id); }
    });
};

async function approveCertificate(id) {
    try {
        await CemboClear.client().put('/certificates/' + id + '/approve');
        closeCertificateModal();
        await loadCertificates();
    } catch (err) {
        showError(err.message || 'Failed to approve certificate');
    }
}

async function rejectCertificate(id) {
    try {
        await CemboClear.client().put('/certificates/' + id + '/reject');
        closeCertificateModal();
        await loadCertificates();
    } catch (err) {
        showError(err.message || 'Failed to reject certificate');
    }
}


let cachedRequests = [];
async function loadRequests() {
    const body = document.getElementById('requests-table-body');
    if (!body) return;

    try {
        const res = await CemboClear.client().get('/requests');
        cachedRequests = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);

        if (cachedRequests.length === 0) {
            body.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-500">No requests submitted.</td></tr>';
            return;
        }

        body.innerHTML = cachedRequests.map(r => `
            <tr class="bg-white hover:bg-gray-50">
                <td class="p-4 font-bold text-gray-900">${r.ticket_id || '#REQ-' + r.id}</td>
                <td class="p-4">
                    <div class="font-semibold text-gray-800">${r.resident_name || (r.first_name ? r.first_name + ' ' + r.last_name : 'Resident')}</div>
                    <div class="text-xs text-gray-400">Control No: ${r.control_no || 'N/A'}</div>
                </td>
                <td class="p-4">
                    <div class="inline-flex px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">${r.agency_name || 'Department'}</div>
                    <div class="text-xs text-gray-500 mt-1">${r.subject || 'No Subject'}</div>
                </td>
                <td class="p-4">
                    <span class="inline-flex px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold uppercase">${r.status || 'PENDING'}</span>
                </td>
                <td class="p-4 text-right">
                    <button onclick="viewRequestDetail(${r.id})" class="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-200">View Details</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        showError(err.message || 'Failed to load requests');
    }
}

function closeRequestDetail() {
    const modal = document.getElementById('request-detail-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function viewRequestDetail(reqId) {
    const req = cachedRequests.find(r => r.id === reqId);
    const detailContainer = document.getElementById('request-detail-content');
    if (!req || !detailContainer) return;

    const statusBg =
        req.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
        req.status === 'closed'   ? 'bg-gray-200 text-gray-700' :
        req.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                                    'bg-amber-100 text-amber-700';

    
    let actions = '';
    if (req.status === 'pending_review') {
        actions = `
            <button onclick="confirmRequestStatus(${req.id}, 'reviewed')" class="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-md hover:bg-blue-700">Mark Reviewed</button>
            <button onclick="confirmRequestStatus(${req.id}, 'closed')" class="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-bold shadow-md hover:bg-rose-700">Close / Reject</button>
        `;
    } else if (req.status === 'reviewed') {
        actions = `
            <button onclick="confirmRequestStatus(${req.id}, 'resolved')" class="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-md hover:bg-emerald-700">Resolve</button>
            <button onclick="confirmRequestStatus(${req.id}, 'closed')" class="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-bold shadow-md hover:bg-rose-700">Close</button>
        `;
    } else {
        actions = '<span class="text-xs text-gray-400 font-semibold">This concern is already processed.</span>';
    }

    detailContainer.innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                    <div class="text-lg font-bold text-gray-800">${req.ticket_id || '#REQ-' + req.id}</div>
                    <div class="text-xs text-gray-400">Submitted ${req.created_at || 'N/A'}</div>
                </div>
                <span class="inline-flex px-3 py-1 rounded-full ${statusBg} text-xs font-bold capitalize">${req.status}</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <div class="text-xs font-bold text-gray-400 uppercase mb-1">Submitter</div>
                    <div class="font-semibold text-gray-800">${req.resident_name || 'Resident'}</div>
                    <div class="text-xs text-gray-400">Control No: ${req.control_no || 'N/A'}</div>
                </div>
                <div>
                    <div class="text-xs font-bold text-gray-400 uppercase mb-1">Department / Case Type</div>
                    <div class="font-semibold text-gray-800">${req.agency_name || 'N/A'}</div>
                    <div class="text-xs text-gray-400">${req.request_type || 'General'}</div>
                </div>
            </div>

            <div>
                <div class="text-xs font-bold text-gray-400 uppercase mb-1">Subject</div>
                <div class="font-semibold text-gray-800">${req.subject || 'N/A'}</div>
            </div>

            <div>
                <div class="text-xs font-bold text-gray-400 uppercase mb-1">Details / Concern</div>
                <div class="text-gray-600 whitespace-pre-line">${req.details || 'No additional details provided.'}</div>
            </div>

            <div class="flex justify-end gap-3 border-t border-gray-100 pt-3">
                <button type="button" onclick="closeRequestDetail()" class="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700">Close</button>
                ${actions}
            </div>
        </div>
    `;

    const modal = document.getElementById('request-detail-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}


window.confirmRequestStatus = function (reqId, status) {
    openConfirmModal({
        title: 'Update request status?',
        message: 'Are you sure you want to mark this request as "' + status + '"?',
        confirmText: status.charAt(0).toUpperCase() + status.slice(1),
        danger: status === 'closed',
        onConfirm: function () { setRequestStatus(reqId, status); }
    });
};

async function setRequestStatus(reqId, status) {
    try {
        await CemboClear.client().put('/requests/' + reqId + '/status', { status: status });
        closeRequestDetail();
        await loadRequests();
    } catch (err) {
        showError(err.message || 'Failed to update request status');
    }
}


async function loadTransactions(filterQuery = '') {
    const container = document.getElementById('transaction-results-list');
    if (!container) return;

    try {
        const res = await CemboClear.client().get('/transactions');
        let txs = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);

        if (filterQuery.trim()) {
            const q = filterQuery.trim().toLowerCase();
            txs = txs.filter(t => 
                String(t.resident_id) === q ||
                String(t.control_no || '').toLowerCase().includes(q) ||
                String(t.first_name || '').toLowerCase().includes(q) ||
                String(t.last_name || '').toLowerCase().includes(q)
            );
        }

        if (txs.length === 0) {
            container.innerHTML = '<div class="p-8 text-center text-gray-500 bg-white rounded-3xl border border-gray-200">No transactions recorded.</div>';
            return;
        }

        container.innerHTML = txs.map(t => {
            const residentLabel = t.first_name ? `${t.first_name} ${t.last_name}` : ('Resident #' + t.resident_id);
            const txInitials = t.first_name && t.last_name
                ? `${t.first_name[0]}${t.last_name[0]}`.toUpperCase()
                : 'TX';
            return `
                <div class="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center font-bold text-emerald-800 text-2xl">${txInitials}</div>
                        <div>
                            <div class="text-xl font-bold text-gray-800">${t.description || 'Transaction #' + t.id}</div>
                            <div class="text-sm text-gray-500">Resident: <span class="font-semibold text-gray-900">${residentLabel}</span> (ID: #${t.resident_id})</div>
                            <div class="text-xs text-gray-400 mt-1">${t.transacted_at || 'N/A'}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-emerald-600">₱${parseFloat(t.amount || 0).toFixed(2)}</div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        showError(err.message || 'Failed to load transactions');
    }
}


let cachedMail = [];
let currentMailFolder = 'inbox';
let currentMailSearch = '';
let mailSearchDebounceTimer = null;

function getMailFolder() {
    const el = document.getElementById('mail-folder-select');
    return (el && el.value) ? el.value : 'inbox';
}

function getMailSearch() {
    const el = document.getElementById('mail-search-input');
    return el ? el.value : '';
}

async function loadMail(folder, search) {
    const container = document.getElementById('mail-list-container');
    const countHeader = document.getElementById('mail-inbox-header');
    if (!container) return;

    folder = folder === undefined ? getMailFolder() : folder;
    search = search === undefined ? getMailSearch() : search;
    currentMailFolder = folder;
    currentMailSearch = search;

    try {
        const res = await CemboClear.client().get('/mail?folder=' + encodeURIComponent(folder));
        let mails = (res && res.data) ? res.data : [];
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            mails = mails.filter(m =>
                String(m.sender_name || '').toLowerCase().includes(q) ||
                String(m.sender_email || '').toLowerCase().includes(q) ||
                String(m.subject || '').toLowerCase().includes(q) ||
                String(m.body || '').toLowerCase().includes(q)
            );
        }
        cachedMail = mails;

        const folderLabel = folder === 'archived' ? 'Archived' : 'Inbox';
        if (countHeader) countHeader.textContent = folderLabel + ' (' + cachedMail.length + ')';

        if (cachedMail.length === 0) {
            container.innerHTML = '<div class="p-4 text-center text-gray-500 text-sm">No ' + folderLabel.toLowerCase() + ' messages' + (search.trim() ? ' match your search' : '') + '.</div>';
            return;
        }

        container.innerHTML = cachedMail.map(m => `
            <button type="button" onclick="selectMailItem(${m.id})" class="mail-list-item w-full text-left px-4 py-4 hover:bg-gray-100 transition ${m.is_read ? 'opacity-70' : 'bg-blue-50/50'}">
                <div class="flex items-start justify-between gap-3">
                    <div>
                        <div class="text-sm font-semibold text-gray-900">${m.sender_name || 'Sender'}</div>
                        <div class="text-sm text-gray-600 mt-1">${m.subject || 'No Subject'}</div>
                    </div>
                    <div class="text-xs text-gray-500">${m.created_at ? m.created_at.substring(0, 10) : ''}</div>
                </div>
                <div class="text-sm text-gray-500 mt-2 truncate">${m.body || ''}</div>
            </button>
        `).join('');

        if (cachedMail.length > 0) {
            selectMailItem(cachedMail[0].id);
        }
    } catch (err) {
        showError(err.message || 'Failed to load mail');
    }
}


window.archiveMail = async function () {
    if (!currentMail) {
        showError('Select a message to archive first.');
        return;
    }
    const id = currentMail.id;
    const archived = currentMailFolder === 'archived' ? 0 : 1;
    try {
        await CemboClear.client().put('/mail/' + id + '/archive', { archived: archived });
        await loadMail();
    } catch (err) {
        showError(err.message || 'Failed to archive message');
    }
};

let currentMail = null;

function selectMailItem(id) {
    const mail = cachedMail.find(m => m.id === id);
    if (!mail) return;
    currentMail = mail;

    const subjEl = document.getElementById('mail-subject');
    const senderEl = document.getElementById('mail-sender');
    const metaEl = document.getElementById('mail-meta');
    const bodyEl = document.getElementById('mail-body');
    const readBtn = document.getElementById('mail-mark-read-btn');

    if (subjEl) subjEl.textContent = mail.subject || 'No Subject';
    if (senderEl) {
        const email = mail.sender_email ? ' <' + mail.sender_email + '>' : '';
        senderEl.textContent = 'From ' + (mail.sender_name || 'Sender') + email;
    }
    if (metaEl) metaEl.textContent = mail.created_at || '';
    if (bodyEl) bodyEl.textContent = mail.body || '';
    if (readBtn) {
        readBtn.onclick = async () => {
            try {
                await CemboClear.client().put('/mail/' + id + '/read');
                loadMail();
            } catch (err) {
                showError(err.message || 'Failed to mark mail read');
            }
        };
    }
}


window.replyToMail = function () {
    if (!currentMail) {
        showError('Select a message to reply to first.');
        return;
    }

    
    let recipientId = null;
    let recipientType = null;
    if (currentMail.sender_staff_id) {
        recipientId = currentMail.sender_staff_id;
        recipientType = 'staff';
    } else if (currentMail.sender_resident_id) {
        recipientId = currentMail.sender_resident_id;
        recipientType = 'resident';
    }
    if (!recipientId || !recipientType) {
        showError('Cannot reply: unknown sender.');
        return;
    }

    const searchEl = document.getElementById('mail-recipient-search');
    const idEl = document.getElementById('mail-recipient-id');
    const typeEl = document.getElementById('mail-recipient-type');
    const subjEl = document.getElementById('mail-input-subject');
    const bodyEl = document.getElementById('mail-input-body');

    if (searchEl) searchEl.value = currentMail.sender_name || ('Recipient #' + recipientId);
    if (idEl) idEl.value = recipientId;
    if (typeEl) typeEl.value = recipientType;
    if (subjEl) subjEl.value = (currentMail.subject ? 'Re: ' : '') + (currentMail.subject || '');
    if (bodyEl) bodyEl.value = '';

    

    const modal = document.getElementById('compose-mail-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
    bodyEl && bodyEl.focus();
}

async function loadNotifications() {
    const container = document.getElementById('notification-list-container');
    const badge = document.getElementById('notification-count-badge');
    if (!container) return;

    try {
        const res = await CemboClear.client().get('/notifications');
        const notifs = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);

        const unreadCount = notifs.filter(n => !n.is_read).length;
        if (badge) badge.textContent = unreadCount;

        if (notifs.length === 0) {
            container.innerHTML = '<div class="p-4 text-center text-gray-500 text-xs">No notifications.</div>';
            return;
        }

        container.innerHTML = notifs.map(n => `
            <div onclick="markNotificationRead(${n.id})" class="flex items-start gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${n.is_read ? 'opacity-60' : ''}">
                <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mt-0.5"><i class="fas fa-bell"></i></div>
                <div>
                    <div class="text-sm font-semibold text-gray-800">${n.message}</div>
                    <div class="text-xs text-gray-400">${n.created_at || ''}</div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        showError(err.message || 'Failed to load notifications');
    }
}

async function markNotificationRead(id) {
    try {
        await CemboClear.client().put('/notifications/' + id + '/read');
        await loadNotifications();
    } catch (e) {}
}

const AUDIT_LOG_PAGE_SIZE = 25;
async function loadAuditLogs(page = 1) {
    const body = document.getElementById('audit-logs-table-body');
    if (!body) return;

    try {
        const pos = (currentUser && currentUser.position) ? currentUser.position : '';
        if (!String(pos).toLowerCase().includes('admin')) {
            body.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-gray-500">Audit logs are restricted to System Administrators.</td></tr>';
            return;
        }
        const res = await CemboClear.client().get('/audit-logs?page=' + page + '&limit=' + AUDIT_LOG_PAGE_SIZE);
        const logs = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);

        if (logs.length === 0) {
            body.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-gray-500">No audit logs recorded.</td></tr>';
        } else {
            body.innerHTML = logs.map(l => `
                <tr>
                    <td class="py-4 px-4">${l.created_at || 'N/A'}</td>
                    <td class="py-4 px-4 font-semibold">${l.actor_name || 'Staff #' + (l.staff_id || 'Unknown')}</td>
                    <td class="py-4 px-4">${l.action || 'N/A'}</td>
                    <td class="py-4 px-4">${l.ip_address || '127.0.0.1'}</td>
                    <td class="py-4 px-4 text-emerald-600 font-semibold capitalize">${l.security_status || 'Authorized'}</td>
                </tr>
            `).join('');
        }

        

        const pagEl = document.getElementById('audit-logs-pagination');
        if (pagEl) {
            const total = (res && res.total) ? parseInt(res.total, 10) : 0;
            const limit = (res && res.limit) ? parseInt(res.limit, 10) : AUDIT_LOG_PAGE_SIZE;
            const totalPages = Math.max(1, Math.ceil(total / limit));
            const current = Math.min(page, totalPages);

            let btns = '';
            if (current > 1) {
                btns += `<button onclick="loadAuditLogs(${current - 1})" class="w-9 h-9 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300">&larr;</button>`;
            }
            const start = Math.max(1, current - 2);
            const end = Math.min(totalPages, current + 2);
            for (let i = start; i <= end; i++) {
                const active = i === current ? 'bg-blue-800 text-white font-bold' : 'bg-gray-200 text-gray-600';
                btns += `<button onclick="loadAuditLogs(${i})" class="w-9 h-9 rounded-full ${active}">${i}</button>`;
            }
            if (current < totalPages) {
                btns += `<button onclick="loadAuditLogs(${current + 1})" class="w-9 h-9 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300">&rarr;</button>`;
            }

            if (totalPages > 1) {
                pagEl.innerHTML = btns;
            } else {
                pagEl.innerHTML = `<span class="text-xs text-gray-400">Page ${current} of ${totalPages}</span>`;
            }
        }
    } catch (err) {
        showError(err.message || 'Failed to load audit logs');
    }
}


let staffSearchDebounceTimer = null;
function getStaffSearch() {
    const el = document.getElementById('staff-search-input');
    return el ? el.value : '';
}

const STAFF_PAGE_SIZE = 25;
async function loadStaff(page = 1, query = '') {
    const body = document.getElementById('staff-table-body');
    if (!body) return;

    
    
    const pos = (currentUser && currentUser.position) ? currentUser.position : '';
    if (!String(pos).toLowerCase().includes('admin')) {
        body.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-gray-500">Staff management is restricted to System Administrators.</td></tr>';
        return;
    }

    query = query === undefined ? getStaffSearch() : query;

    try {
        const qs = '?page=' + page + '&limit=' + STAFF_PAGE_SIZE + (query.trim() ? '&q=' + encodeURIComponent(query.trim()) : '');
        const res = await CemboClear.client().get('/staff' + qs);
        const staff = (res && res.data) ? res.data : [];

        if (staff.length === 0) {
            body.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-gray-500">No staff accounts found.</td></tr>';
        } else {
            body.innerHTML = staff.map(s => {
                const fullName = [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(' ') || ('Staff #' + s.id);
                const statusBg = s.status === 'inactive' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700';
                return `
                    <tr class="bg-white">
                        <td class="p-4 font-semibold text-gray-800">${fullName}</td>
                        <td class="p-4 text-gray-600">${s.email || 'N/A'}</td>
                        <td class="p-4 text-gray-600">${s.position || 'N/A'}</td>
                        <td class="p-4 text-gray-600">${s.branch || 'N/A'}</td>
                        <td class="p-4"><span class="inline-flex px-3 py-1 rounded-full ${statusBg} text-xs font-bold uppercase">${s.status || 'active'}</span></td>
                        <td class="p-4 text-right">
                            <button onclick="toggleStaffStatus(${s.id}, '${s.status || 'active'}')" class="border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-100">${s.status === 'inactive' ? 'Activate' : 'Deactivate'}</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        

        const pagEl = document.getElementById('staff-pagination');
        if (pagEl) {
            const total = (res && res.total) ? parseInt(res.total, 10) : 0;
            const limit = (res && res.limit) ? parseInt(res.limit, 10) : STAFF_PAGE_SIZE;
            const totalPages = Math.max(1, Math.ceil(total / limit));
            const current = Math.min(page, totalPages);

            let btns = '';
            if (current > 1) {
                btns += `<button onclick="loadStaff(${current - 1})" class="w-9 h-9 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300">&larr;</button>`;
            }
            const start = Math.max(1, current - 2);
            const end = Math.min(totalPages, current + 2);
            for (let i = start; i <= end; i++) {
                const active = i === current ? 'bg-blue-800 text-white font-bold' : 'bg-gray-200 text-gray-600';
                btns += `<button onclick="loadStaff(${i})" class="w-9 h-9 rounded-full ${active}">${i}</button>`;
            }
            if (current < totalPages) {
                btns += `<button onclick="loadStaff(${current + 1})" class="w-9 h-9 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300">&rarr;</button>`;
            }

            if (totalPages > 1) {
                pagEl.innerHTML = btns;
            } else {
                pagEl.innerHTML = `<span class="text-xs text-gray-400">Page ${current} of ${totalPages}</span>`;
            }
        }
    } catch (err) {
        body.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-gray-500">Unable to load staff. Restricted to System Administrators.</td></tr>';
    }
}

function openCreateStaffModal() {
    const pos = (currentUser && currentUser.position) ? currentUser.position : '';
    if (!String(pos).toLowerCase().includes('admin')) {
        showError('Staff management is restricted to System Administrators.');
        return;
    }
    openModal('create-staff-modal');
}


function reloadStaff() {
    const inp = document.getElementById('staff-search-input');
    const q = inp ? inp.value : '';
    

    loadStaff(1, q);
}

async function toggleStaffStatus(id, currentStatus) {
    const current = currentStatus || 'active';
    const target = current === 'inactive' ? 'active' : 'inactive';
    try {
        await CemboClear.client().put('/staff/' + id + '/status', { status: target });
        reloadStaff();
    } catch (err) {
        showError(err.message || 'Failed to update staff status');
    }
}





document.addEventListener('DOMContentLoaded', async function () {
    
    try {
        const meRes = await CemboClear.client().me();
        if (meRes && meRes.id) {
            currentUser = meRes; 
            if (currentUser.type !== 'staff') {
                window.location.href = 'CCLog-in.html';
                return;
            }

            const fullName = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || 'Admin User';
            const initials = `${(currentUser.first_name || 'A')[0]}${(currentUser.last_name || 'D')[0]}`.toUpperCase();
            const pos = currentUser.position || 'System Administrator';

            const headerName = document.getElementById('header-user-name');
            const headerInitials = document.getElementById('header-user-initials');
            const sidebarInitials = document.getElementById('sidebar-user-initials');
            const sidebarRole = document.getElementById('sidebar-user-role');
            const profileAvatar = document.getElementById('profile-avatar-initials');
            const profileNameH = document.getElementById('profile-name-header');
            const profileNameC = document.getElementById('profile-name-card');
            const profileRoleC = document.getElementById('profile-role-card');
            const profileEmailC = document.getElementById('profile-email-card');
            const profilePhoneC = document.getElementById('profile-phone-card');
            const profileBranchC = document.getElementById('profile-branch-card');
            const editName = document.getElementById('edit-profile-name');
            const editPos = document.getElementById('edit-profile-pos');
            const accountName = document.getElementById('account-panel-name');
            const accountPos = document.getElementById('account-panel-pos');
            const accountInitials = document.getElementById('account-panel-initials');
            const accountEmailInput = document.getElementById('account-input-email');
            const accountPhoneInput = document.getElementById('account-input-phone');

            if (headerName) headerName.textContent = fullName;
            if (headerInitials) headerInitials.textContent = initials;
            if (sidebarInitials) sidebarInitials.textContent = initials;
            if (sidebarRole) sidebarRole.textContent = pos;
            if (profileAvatar) profileAvatar.textContent = initials;
            if (profileNameH) profileNameH.textContent = fullName;
            if (profileNameC) profileNameC.textContent = fullName;
            if (profileRoleC) profileRoleC.textContent = pos;
            if (profileEmailC) profileEmailC.textContent = currentUser.email || '';
            if (profilePhoneC) profilePhoneC.textContent = currentUser.phone || 'N/A';
            if (profileBranchC) profileBranchC.textContent = currentUser.branch || 'Barangay Office';
            if (editName) editName.textContent = fullName;
            if (editPos) editPos.textContent = pos;
            if (accountName) accountName.textContent = fullName;
            if (accountPos) accountPos.textContent = pos;
            if (accountInitials) accountInitials.textContent = initials;
            if (accountEmailInput) accountEmailInput.value = currentUser.email || '';
            if (accountPhoneInput) accountPhoneInput.value = currentUser.phone || '';
        }
    } catch (err) {
        if (err && err.status === 401) {
            window.redirectToLogin();
            return;
        }
    }

    

    const ctxPie = document.getElementById('genderPieChart')?.getContext('2d');
    if (ctxPie) {
        genderPieChart = new Chart(ctxPie, {
            type: 'pie',
            data: {
                labels: ['Male', 'Female'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: ['#1200b3', '#ff94da'],
                    borderWidth: 1,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }

    const ctxArea = document.getElementById('ageAreaChart')?.getContext('2d');
    if (ctxArea) {
        const ageLabels = ['Under 18', '18-30', '31-50', '51+'];
        ageAreaChart = new Chart(ctxArea, {
            type: 'bar',
            data: {
                labels: ageLabels,
                datasets: [{
                    label: 'Resident Count by Age Group',
                    data: [0, 0, 0, 0],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    
    const rbiSearch = document.getElementById('rbi-search-input');
    if (rbiSearch) {
        rbiSearch.addEventListener('input', function () {
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(() => {
                loadResidents(1, this.value, getRbiStatusFilter());
            }, 300);
        });
    }

    const rbiStatusFilter = document.getElementById('rbi-status-filter');
    if (rbiStatusFilter) {
        rbiStatusFilter.addEventListener('change', function () {
            loadResidents(1, rbiSearch ? rbiSearch.value : '', this.value);
        });
    }

    const txSearchBtn = document.getElementById('transaction-search-btn');
    const txSearchInput = document.getElementById('transaction-search-input');
    if (txSearchBtn && txSearchInput) {
        txSearchBtn.addEventListener('click', function () {
            loadTransactions(txSearchInput.value.trim());
        });
    }

    
    const freshnessBtn = document.getElementById('freshness-search-btn');
    const freshnessInput = document.getElementById('freshness-search-input');
    if (freshnessBtn && freshnessInput) {
        let freshnessDebounceTimer = null;
        const runFreshnessSearch = function () {
            loadFreshnessAudit(freshnessInput.value);
        };
        freshnessBtn.addEventListener('click', runFreshnessSearch);
        freshnessInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                clearTimeout(freshnessDebounceTimer);
                runFreshnessSearch();
            }
        });
        freshnessInput.addEventListener('input', function () {
            clearTimeout(freshnessDebounceTimer);
            freshnessDebounceTimer = setTimeout(runFreshnessSearch, 300);
        });
    }

    const addTxForm = document.getElementById('add-transaction-form');
    if (addTxForm) {
        const txResidentSearch = document.getElementById('tx-resident-search');
        const txResidentResults = document.getElementById('tx-resident-results');
        const txResidentIdEl = document.getElementById('tx-resident-id');
        let txResidentTimer = null;

        
        if (txResidentSearch) {
            txResidentSearch.addEventListener('input', function () {
                clearTimeout(txResidentTimer);
                const q = this.value.trim();
                if (!q) {
                    txResidentResults.classList.add('hidden');
                    txResidentResults.innerHTML = '';
                    txResidentIdEl.value = '';
                    return;
                }
                txResidentTimer = setTimeout(async () => {
                    try {
                        const res = await CemboClear.client().get('/residents/search?q=' + encodeURIComponent(q));
                        const residents = (res && res.data) ? res.data : [];
                        if (residents.length === 0) {
                            txResidentResults.innerHTML = '<div class="px-4 py-3 text-sm text-gray-400">No residents found.</div>';
                            txResidentResults.classList.remove('hidden');
                            return;
                        }
                        txResidentResults.innerHTML = residents.map(r => {
                            const initials = `${(r.first_name || '?')[0]}${(r.last_name || '?')[0]}`.toUpperCase();
                            const name = [r.first_name, r.middle_name, r.last_name]
                                .filter(Boolean)
                                .join(' ')
                                .replace(/\s+/g, ' ')
                                .trim();
                            const sub = r.control_no ? ('Control #' + r.control_no) : ('Resident #' + r.id);
                            return `
                                <div class="tx-resident-option flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-blue-50" data-id="${r.id}" data-name="${name}" data-sub="${sub}">
                                    <div class="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xs">${initials}</div>
                                    <div class="flex-1">
                                        <div class="text-sm font-semibold text-gray-800">${name}</div>
                                        <div class="text-xs text-gray-400">${sub}</div>
                                    </div>
                                </div>`;
                        }).join('');
                        txResidentResults.classList.remove('hidden');
                    } catch (err) {
                        txResidentResults.innerHTML = '<div class="px-4 py-3 text-sm text-gray-400">Search failed.</div>';
                        txResidentResults.classList.remove('hidden');
                    }
                }, 300);
            });

            
            txResidentResults.addEventListener('click', function (e) {
                const opt = e.target.closest('.tx-resident-option');
                if (!opt) return;
                txResidentIdEl.value = opt.getAttribute('data-id');
                txResidentSearch.value = opt.getAttribute('data-name');
                txResidentResults.classList.add('hidden');
                txResidentResults.innerHTML = '';
            });

            

            document.addEventListener('click', function (e) {
                if (!txResidentSearch.contains(e.target) && !txResidentResults.contains(e.target)) {
                    txResidentResults.classList.add('hidden');
                }
            });
        }

        addTxForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const resId = txResidentIdEl?.value;
            if (!resId) {
                showError('Please select a resident from the search results.');
                return;
            }
            const desc = document.getElementById('tx-description')?.value;
            const amt = document.getElementById('tx-amount')?.value;
            try {
                await CemboClear.client().post('/transactions', {
                    resident_id: parseInt(resId, 10),
                    description: desc,
                    amount: parseFloat(amt)
                });
                closeModal('add-transaction-modal');
                addTxForm.reset();
                txResidentIdEl.value = '';
                txResidentResults.classList.add('hidden');
                txResidentResults.innerHTML = '';
                await loadTransactions();
            } catch (err) {
                showError(err.message || 'Failed to create transaction');
            }
        });
    }

    const composeForm = document.getElementById('compose-mail-form');
    if (composeForm) {
        const recipientSearch = document.getElementById('mail-recipient-search');
        const recipientResults = document.getElementById('mail-recipient-results');
        const recipientIdEl = document.getElementById('mail-recipient-id');
        const recipientTypeEl = document.getElementById('mail-recipient-type');
        let recipientTimer = null;

        
        recipientSearch.addEventListener('input', function () {
            clearTimeout(recipientTimer);
            const q = this.value.trim();
            if (!q) {
                recipientResults.classList.add('hidden');
                recipientResults.innerHTML = '';
                recipientIdEl.value = '';
                recipientTypeEl.value = '';
                return;
            }
            recipientTimer = setTimeout(async () => {
                try {
                    const res = await CemboClear.client().get('/mail/recipients/search?q=' + encodeURIComponent(q));
                    const recipients = (res && res.data) ? res.data : [];
                    if (recipients.length === 0) {
                        recipientResults.innerHTML = '<div class="px-4 py-3 text-sm text-gray-400">No recipients found.</div>';
                        recipientResults.classList.remove('hidden');
                        return;
                    }
                    recipientResults.innerHTML = recipients.map(r => {
                        const initials = `${(r.first_name || '?')[0]}${(r.last_name || '?')[0]}`.toUpperCase();
                        const safeName = String(r.name || '').replace(/\s+/g, ' ').trim();
                        const sub = r.type === 'staff' ? 'Staff' : (r.control_no || 'Resident');
                        return `
                            <div class="recipient-option flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-blue-50" data-id="${r.id}" data-type="${r.type}" data-name="${safeName}">
                                <div class="w-8 h-8 bg-blue-800 text-white rounded-full flex items-center justify-center font-bold text-xs">${initials}</div>
                                <div class="flex-1">
                                    <div class="text-sm font-semibold text-gray-800">${safeName}</div>
                                    <div class="text-xs text-gray-400">${sub}</div>
                                </div>
                            </div>`;
                    }).join('');
                    recipientResults.classList.remove('hidden');
                } catch (err) {
                    recipientResults.innerHTML = '<div class="px-4 py-3 text-sm text-gray-400">Search failed.</div>';
                    recipientResults.classList.remove('hidden');
                }
            }, 250);
        });

        
        recipientResults.addEventListener('click', function (e) {
            const opt = e.target.closest('.recipient-option');
            if (!opt) return;
            recipientIdEl.value = opt.getAttribute('data-id');
            recipientTypeEl.value = opt.getAttribute('data-type');
            recipientSearch.value = opt.getAttribute('data-name');
            recipientResults.classList.add('hidden');
            recipientResults.innerHTML = '';
        });

        

        document.addEventListener('click', function (e) {
            if (!recipientSearch.contains(e.target) && !recipientResults.contains(e.target)) {
                recipientResults.classList.add('hidden');
            }
        });

        composeForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const recId = recipientIdEl?.value;
            const recType = recipientTypeEl?.value;
            const subj = document.getElementById('mail-input-subject')?.value;
            const body = document.getElementById('mail-input-body')?.value;

            if (!recId || !recType) {
                showError('Please select a recipient from the search results.');
                return;
            }

            try {
                await CemboClear.client().post('/mail', {
                    recipient_id: parseInt(recId, 10),
                    recipient_type: recType,
                    subject: subj,
                    body: body
                });
                closeModal('compose-mail-modal');
                composeForm.reset();
                recipientIdEl.value = '';
                recipientTypeEl.value = '';
                recipientSearch.value = '';
                recipientResults.classList.add('hidden');
                await loadMail();
            } catch (err) {
                showError(err.message || 'Failed to send mail');
            }
        });
    }

    
    const mailFolderSelect = document.getElementById('mail-folder-select');
    const mailArchiveBtn = document.getElementById('mail-archive-btn');
    const mailSearchInput = document.getElementById('mail-search-input');

    if (mailFolderSelect) {
        mailFolderSelect.addEventListener('change', function () {
            loadMail(this.value);
        });
    }

    if (mailArchiveBtn) {
        mailArchiveBtn.addEventListener('click', archiveMail);
    }

    if (mailSearchInput) {
        mailSearchInput.addEventListener('input', function () {
            clearTimeout(mailSearchDebounceTimer);
            mailSearchDebounceTimer = setTimeout(() => {
                loadMail();
            }, 300);
        });
    }

    
    const createStaffForm = document.getElementById('create-staff-form');
    if (createStaffForm) {
        createStaffForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const payload = {
                first_name: document.getElementById('staff-first-name')?.value,
                last_name: document.getElementById('staff-last-name')?.value,
                email: document.getElementById('staff-email')?.value,
                password: document.getElementById('staff-password')?.value,
                position: document.getElementById('staff-position')?.value || null,
                branch: document.getElementById('staff-branch')?.value || null,
            };
            try {
                await CemboClear.client().post('/staff', payload);
                closeModal('create-staff-modal');
                createStaffForm.reset();
                reloadStaff();
            } catch (err) {
                showError(err.message || 'Failed to create staff account');
            }
        });
    }

    
    const staffSearch = document.getElementById('staff-search-input');
    if (staffSearch) {
        staffSearch.addEventListener('input', function () {
            clearTimeout(staffSearchDebounceTimer);
            staffSearchDebounceTimer = setTimeout(() => {
                loadStaff(1, this.value);
            }, 300);
        });
    }

    
    await loadDashboardStats();
    await loadResidents();
    await loadCertificates();
    await loadRequests();
    await loadTransactions();
    await loadMail();
    await loadNotifications();

    
    
    const pos = (currentUser && currentUser.position) ? currentUser.position : '';
    if (String(pos).toLowerCase().includes('admin')) {
        await loadAuditLogs();
        await loadStaff();
    }
});
