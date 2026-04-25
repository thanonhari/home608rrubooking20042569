/**
 * Room Booking System - Main JS (RRU Version)
 */

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

let user = null;
let calendar = null;
let currentLang = localStorage.getItem('lang') || 'th';

const translations = {
    th: {
        welcome: "ยินดีต้อนรับ", login: "เข้าสู่ระบบ", register: "สมัครสมาชิก", logout: "ออกจากระบบ",
        calendar: "ปฏิทิน", my_bookings: "การจองของฉัน", insights: "สถิติ", rooms: "ห้องประชุม",
        users: "ผู้ใช้งาน", logs: "ประวัติ", settings: "ตั้งค่า", cancel: "ยกเลิก", back: "กลับ",
        status: "สถานะ", title: "ชื่องาน/โครงการ", position: "ตำแหน่ง", department: "สังกัด",
        phone: "เบอร์โทรศัพท์", book_room: "จองห้องประชุม", select_room: "เลือกห้องประชุม",
        login_success: "เข้าสู่ระบบสำเร็จ", booking_success: "จองห้องสำเร็จ!",
        approved: "อนุมัติแล้ว", pending: "รออนุมัติ", rejected: "ไม่อนุมัติ"
    }
};

function t(key) { return translations[currentLang][key] || key; }
function escapeHtml(text) { if (!text) return ''; const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }; return String(text).replace(/[&<>"']/g, m => map[m]); }

const swalConfig = {
    customClass: { popup: 'rounded-3xl p-8', confirmButton: 'btn btn-primary px-8', cancelButton: 'btn btn-ghost', denyButton: 'btn btn-outline border-base-300' },
    buttonsStyling: false
};

async function initApp() {
    renderNav();
    try {
        toggleLoading(true);
        await checkAuth();
        initCalendar();
        setupEventListeners();
        fetchMasterData().then(data => window.masterData = data);
    } catch (e) { console.error('Init error:', e); }
    finally { toggleLoading(false); renderNav(); }
}

async function apiFetch(url, options = {}) {
    try {
        const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Request failed');
        return data;
    } catch (error) { showToast('error', error.message); throw error; }
}

async function checkAuth() {
    try {
        const data = await apiFetch('api/auth.php?action=status');
        user = data.loggedIn ? data.user : null;
    } catch (e) { user = null; }
}

async function fetchMasterData() {
    try { const res = await fetch('api/master_data.php'); return await res.json(); } catch (e) { return { departments: [], positions: [] }; }
}

function toggleLoading(show) {
    const el = document.getElementById('loading-screen');
    if (el) el.style.display = show ? 'flex' : 'none';
}

function showToast(icon, title) { Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon, title }); }

function renderNav() {
    const navLinks = document.getElementById('nav-links');
    const authSidebar = document.getElementById('auth-box-sidebar');
    if (!navLinks || !authSidebar) return;

    let linksHtml = `<li><a href="#" onclick="showSection('calendar')"><i class="fas fa-calendar-alt w-5 text-primary"></i> ${t('calendar')}</a></li>`;
    if (user) {
        linksHtml += `<li><a href="#" onclick="showSection('my-bookings')"><i class="fas fa-list w-5 text-primary"></i> ${t('my_bookings')}</a></li>`;
        if (['admin', 'approver', 'staff'].includes(user.role)) {
            linksHtml += `<li><a href="#" onclick="showSection('stats')"><i class="fas fa-chart-line w-5 text-primary"></i> ${t('insights')}</a></li>`;
            linksHtml += `<div class="menu-title text-xs opacity-40 uppercase mt-4">Management</div>`;
            linksHtml += `<li><a href="#" onclick="showSection('rooms')"><i class="fas fa-door-open w-5 text-primary"></i> ${t('rooms')}</a></li>`;
        }
        if (user.role === 'admin') {
            linksHtml += `<li><a href="#" onclick="showSection('admin')"><i class="fas fa-users w-5 text-primary"></i> ${t('users')}</a></li>`;
        }
        authSidebar.innerHTML = `<div class="bg-base-200 p-4 rounded-2xl flex items-center gap-3">
            <div class="avatar placeholder"><div class="bg-primary text-white rounded-full w-10"><span>${user.username[0].toUpperCase()}</span></div></div>
            <div class="flex-1 overflow-hidden"><div class="font-bold text-xs truncate">${user.fullname || user.username}</div><div class="text-[9px] opacity-50 uppercase">${user.role}</div></div>
            <button class="btn btn-ghost btn-xs text-error" onclick="logout()"><i class="fas fa-sign-out-alt"></i></button>
        </div>`;
    } else {
        authSidebar.innerHTML = `<button class="btn btn-primary w-full" onclick="showLoginModal()">${t('login')}</button>`;
    }
    navLinks.innerHTML = linksHtml;
}

function showSection(id) {
    ['calendar', 'admin', 'settings', 'my-bookings', 'logs', 'rooms', 'stats'].forEach(s => {
        const el = document.getElementById(`${s}-section`);
        if (el) el.style.display = (s === id) ? 'block' : 'none';
    });
    if (id === 'calendar' && calendar) calendar.render();
    if (id === 'rooms') renderRooms();
    if (id === 'stats') renderStats();
    if (id === 'my-bookings') renderMyBookings();
    if (id === 'admin') renderUserManagement();
}

async function renderRooms() {
    const container = document.getElementById('rooms-table-container');
    const rooms = await apiFetch('api/rooms.php');
    const isAdmin = user?.role === 'admin';

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-black">จัดการห้องประชุม</h2>
            ${isAdmin ? `<button class="btn btn-primary rounded-xl" onclick="showRoomDetails()"><i class="fas fa-plus mr-2"></i> เพิ่มห้องใหม่</button>` : ''}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${rooms.map(r => `
                <div class="card bg-base-100 shadow border border-base-200 overflow-hidden group">
                    <figure class="h-40 overflow-hidden"><img src="${r.main_photo || 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=800&auto=format&fit=crop'}" class="w-full h-full object-cover group-hover:scale-110 transition-all"></figure>
                    <div class="card-body p-4">
                        <h3 class="card-title text-sm">${escapeHtml(r.name)}</h3>
                        <button class="btn btn-outline btn-xs mt-2" onclick='showRoomDetails(${JSON.stringify(r)})'>จัดการ</button>
                    </div>
                </div>
            `).join('')}
        </div>`;
}

async function showRoomDetails(room = null) {
    const isAdmin = user?.role === 'admin';
    const canManage = ['admin', 'approver', 'staff'].includes(user?.role);
    let photosHtml = '';

    if (room?.id) {
        const fresh = await apiFetch(`api/rooms.php?id=${room.id}`);
        photosHtml = `
            <div class="mt-4 border-t pt-4">
                <h4 class="text-xs font-bold mb-2">รูปภาพประกอบ (${fresh.photos?.length || 0})</h4>
                <div class="grid grid-cols-4 gap-2 mb-4">
                    ${(fresh.photos || []).map(p => `<div class="relative"><img src="${p.file_path}" class="w-full h-12 object-cover rounded-lg">${isAdmin ? `<button onclick="deleteRoomPhoto(${p.id}, ${room.id})" class="btn btn-error btn-xs btn-circle absolute -top-1 -right-1">×</button>` : ''}</div>`).join('')}
                </div>
                ${canManage ? `
                    <div id="drop-zone" class="border-2 border-dashed border-base-300 rounded-xl p-6 text-center hover:bg-primary/5 hover:border-primary transition-all cursor-pointer">
                        <input type="file" id="file-input" class="hidden" onchange="handleFileUpload(this.files, ${room.id})">
                        <i class="fas fa-cloud-upload-alt text-2xl opacity-20 mb-1"></i>
                        <div class="text-[10px] font-bold">ลากวางรูปภาพ หรือ คลิกเพื่ออัปโหลด</div>
                    </div>` : ''}
            </div>`;
    }

    const { value: res } = await Swal.fire({
        ...swalConfig, title: room ? 'แก้ไขห้อง' : 'เพิ่มห้องใหม่', width: '500px',
        html: `<div class="text-left space-y-3">
            <input id="swal-n" class="input input-bordered w-full" value="${room ? escapeHtml(room.name) : ''}" placeholder="ชื่อห้อง">
            <textarea id="swal-d" class="textarea textarea-bordered w-full" placeholder="รายละเอียด">${room ? escapeHtml(room.description) : ''}</textarea>
            <input id="swal-c" type="number" class="input input-bordered w-full" value="${room ? room.capacity : ''}" placeholder="ความจุ">
            ${photosHtml}
        </div>`,
        didOpen: () => {
            const dz = document.getElementById('drop-zone');
            if (dz) {
                dz.onclick = () => document.getElementById('file-input').click();
                dz.ondragover = (e) => { e.preventDefault(); dz.classList.add('bg-primary/5', 'border-primary'); };
                dz.ondragleave = () => dz.classList.remove('bg-primary/5', 'border-primary');
                dz.ondrop = (e) => { e.preventDefault(); handleFileUpload(e.dataTransfer.files, room.id); };
            }
        },
        showCancelButton: true, confirmButtonText: 'บันทึก',
        preConfirm: () => ({ id: room?.id, name: document.getElementById('swal-n').value, description: document.getElementById('swal-d').value, capacity: document.getElementById('swal-c').value })
    });

    if (res && isAdmin) { await apiFetch('api/rooms_manage.php', { method: 'POST', body: JSON.stringify(res) }); renderRooms(); }
}

async function handleFileUpload(files, roomId) {
    if (!files[0]) return;
    const dz = document.getElementById('drop-zone');
    const old = dz.innerHTML;
    dz.innerHTML = `<span class="loading loading-spinner text-primary"></span>`;
    const fd = new FormData(); fd.append('photo', files[0]); fd.append('room_id', roomId);
    try {
        const res = await fetch('api/upload.php', { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Failed');
        showToast('success', 'Uploaded');
        const rooms = await apiFetch('api/rooms.php');
        showRoomDetails(rooms.find(r => r.id == roomId));
    } catch (e) { showToast('error', 'Error'); dz.innerHTML = old; }
}

async function initCalendar() {
    const el = document.getElementById('calendar'); if (!el) return;
    calendar = new FullCalendar.Calendar(el, { initialView: 'dayGridMonth', events: 'api/bookings.php', dateClick: (i) => user ? showBookingModal(i.dateStr) : showLoginModal(), eventClick: (i) => showEventDetails(i.event) });
    calendar.render();
}

async function showBookingModal(date) {
    const rooms = await apiFetch('api/rooms.php');
    window.calc = () => {
        const r = rooms.find(x => x.id == document.getElementById('b-r').value);
        const g = document.getElementById('b-g').value;
        const d = document.getElementById('b-d').value;
        const total = ((d === '4h' ? r.rate_4h : r.rate_8h) * { external: 1, gov: 0.6, internal: 0.5 }[g]);
        document.getElementById('p-est').innerHTML = `<div class="font-black text-primary">Total: ${total.toLocaleString()} ฿</div>`;
    };
    const { value: v } = await Swal.fire({
        ...swalConfig, title: 'จองห้องประชุม', width: '600px',
        html: `<div class="text-left space-y-3">
            <select id="b-r" class="select select-bordered w-full" onchange="calc()">${rooms.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}</select>
            <input id="b-t" class="input input-bordered w-full" placeholder="ชื่องาน">
            <div class="grid grid-cols-2 gap-2">
                <select id="b-g" class="select select-bordered" onchange="calc()"><option value="external">ภายนอก</option><option value="gov">ราชการ</option><option value="internal" selected>ภายใน</option></select>
                <select id="b-d" class="select select-bordered" onchange="calc()"><option value="4h">4 ชม.</option><option value="8h">8 ชม.</option></select>
            </div>
            <div id="p-est"></div>
            <input id="b-s" type="datetime-local" class="input input-bordered w-full" value="${date}T09:00">
            <input id="b-e" type="datetime-local" class="input input-bordered w-full" value="${date}T12:00">
        </div>`,
        didOpen: () => window.calc(),
        preConfirm: () => ({ room_id: document.getElementById('b-r').value, title: document.getElementById('b-t').value, start_time: document.getElementById('b-s').value, end_time: document.getElementById('b-e').value })
    });
    if (v) { await apiFetch('api/bookings.php', { method: 'POST', body: JSON.stringify(v) }); showToast('success', 'Booked'); calendar.refetchEvents(); }
}

async function showEventDetails(event) {
    const p = event.extendedProps;
    const isAdmin = ['admin', 'approver', 'staff'].includes(user?.role);
    let adminHtml = isAdmin ? `<div class="divider text-[10px]">Admin</div><div class="grid grid-cols-2 gap-2"><input id="a-t" type="number" class="input input-bordered input-sm" value="${p.total_amount || 0}"><input id="a-d" type="number" class="input input-bordered input-sm" value="${p.deposit_amount || 0}"></div><button onclick="updateAdmin(${event.id})" class="btn btn-success btn-sm btn-block mt-2">Save/Approve</button>` : '';
    Swal.fire({ ...swalConfig, title: event.title, html: `<div class="text-left text-xs"><div>Room: ${p.room_name}</div><div>By: ${p.fullname || p.username}</div>${adminHtml}</div>`, showConfirmButton: false });
}

async function updateAdmin(id) {
    await apiFetch('api/bookings.php', { method: 'PATCH', body: JSON.stringify({ id, status: 'approved', total_amount: document.getElementById('a-t').value, deposit_amount: document.getElementById('a-d').value }) });
    Swal.close(); calendar.refetchEvents();
}

async function showLoginModal() {
    const { value: v } = await Swal.fire({ ...swalConfig, title: 'Login', html: `<input id="l-u" class="input input-bordered w-full mb-2" placeholder="Username"><input id="l-p" type="password" class="input input-bordered w-full" placeholder="Password">`, preConfirm: () => ({ username: document.getElementById('l-u').value, password: document.getElementById('l-p').value }) });
    if (v) { await apiFetch('api/auth.php?action=login', { method: 'POST', body: JSON.stringify(v) }); location.reload(); }
}

async function logout() { await apiFetch('api/auth.php?action=logout'); location.reload(); }

function setupEventListeners() {}
async function renderStats() {
    const container = document.getElementById('stats-container');
    container.innerHTML = `<div class="flex items-center justify-center p-20"><span class="loading loading-spinner loading-lg text-primary"></span></div>`;

    try {
        const stats = await apiFetch('api/stats.php');
        
        container.innerHTML = `
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div class="stats shadow bg-base-100 border border-base-200">
                    <div class="stat">
                        <div class="stat-figure text-primary"><i class="fas fa-door-open text-2xl"></i></div>
                        <div class="stat-title text-xs font-bold uppercase">Total Rooms</div>
                        <div class="stat-value text-primary">${stats.summary.total_rooms}</div>
                    </div>
                </div>
                <div class="stats shadow bg-base-100 border border-base-200">
                    <div class="stat">
                        <div class="stat-figure text-secondary"><i class="fas fa-calendar-check text-2xl"></i></div>
                        <div class="stat-title text-xs font-bold uppercase">Total Bookings</div>
                        <div class="stat-value text-secondary">${stats.summary.total_bookings}</div>
                        <div class="stat-desc">${stats.summary.pending_bookings} pending</div>
                    </div>
                </div>
                <div class="stats shadow bg-base-100 border border-base-200">
                    <div class="stat">
                        <div class="stat-figure text-success"><i class="fas fa-star text-2xl"></i></div>
                        <div class="stat-title text-xs font-bold uppercase">Avg. Rating</div>
                        <div class="stat-value text-success">${stats.rating_stats.average}</div>
                        <div class="stat-desc">Out of 5.0</div>
                    </div>
                </div>
                <div class="stats shadow bg-base-100 border border-base-200">
                    <div class="stat">
                        <div class="stat-figure text-accent"><i class="fab fa-line text-2xl"></i></div>
                        <div class="stat-title text-xs font-bold uppercase">LINE Linked</div>
                        <div class="stat-value text-accent">${stats.summary.line_linked_users}</div>
                        <div class="stat-desc">Users connected</div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <!-- Rating Distribution -->
                <div class="card bg-base-100 shadow-xl border border-base-200">
                    <div class="card-body">
                        <h2 class="card-title text-sm font-black uppercase"><i class="fas fa-heart text-error"></i> Satisfaction Distribution</h2>
                        <div class="h-64"><canvas id="chart-rating"></canvas></div>
                    </div>
                </div>
                <!-- Financial Status -->
                <div class="card bg-base-100 shadow-xl border border-base-200">
                    <div class="card-body">
                        <h2 class="card-title text-sm font-black uppercase"><i class="fas fa-money-bill-wave text-success"></i> Payment Pipeline</h2>
                        <div class="h-64"><canvas id="chart-payments"></canvas></div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <!-- Revenue by User Type -->
                <div class="card bg-base-100 shadow-xl border border-base-200">
                    <div class="card-body">
                        <h2 class="card-title text-sm font-black uppercase"><i class="fas fa-users text-primary"></i> Revenue by User Type</h2>
                        <div class="h-64"><canvas id="chart-user-type"></canvas></div>
                    </div>
                </div>
                <!-- Monthly Revenue -->
                <div class="card bg-base-100 shadow-xl border border-base-200">
                    <div class="card-body">
                        <h2 class="card-title text-sm font-black uppercase"><i class="fas fa-chart-area text-info"></i> Monthly Revenue</h2>
                        <div class="h-64"><canvas id="chart-revenue"></canvas></div>
                    </div>
                </div>
            </div>
        `;

        // 1. Rating Chart
        new Chart(document.getElementById('chart-rating'), {
            type: 'bar',
            data: {
                labels: stats.rating_stats.distribution.map(d => '⭐ ' + d.star),
                datasets: [{
                    label: 'Count',
                    data: stats.rating_stats.distribution.map(d => d.count),
                    backgroundColor: '#f87171'
                }]
            },
            options: { maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });

        // 2. Payments Chart
        new Chart(document.getElementById('chart-payments'), {
            type: 'doughnut',
            data: {
                labels: stats.payment_status_dist.map(d => d.payment_status.toUpperCase()),
                datasets: [{
                    data: stats.payment_status_dist.map(d => d.count),
                    backgroundColor: ['#fbbf24', '#34d399', '#f87171', '#60a5fa']
                }]
            },
            options: { maintainAspectRatio: false }
        });

        // 3. User Type Revenue Chart
        new Chart(document.getElementById('chart-user-type'), {
            type: 'pie',
            data: {
                labels: stats.revenue_by_user_type.map(d => d.user_type.toUpperCase()),
                datasets: [{
                    data: stats.revenue_by_user_type.map(d => d.total),
                    backgroundColor: ['#60a5fa', '#a78bfa', '#f472b6']
                }]
            },
            options: { maintainAspectRatio: false }
        });

        // 4. Monthly Revenue Chart
        new Chart(document.getElementById('chart-revenue'), {
            type: 'line',
            data: {
                labels: stats.revenue_monthly.map(d => d.month),
                datasets: [{
                    label: 'Revenue (฿)',
                    data: stats.revenue_monthly.map(d => d.amount),
                    borderColor: '#2dd4bf',
                    backgroundColor: 'rgba(45, 212, 191, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { maintainAspectRatio: false }
        });

    } catch (e) {
        container.innerHTML = `<div class="alert alert-error">${e.message}</div>`;
    }
}
function renderMyBookings() { document.getElementById('my-bookings-container').innerHTML = 'My bookings here'; }
function renderUserManagement() { document.getElementById('users-table-container').innerHTML = 'User management here'; }
function deleteRoomPhoto(pid, rid) { if(confirm('Delete?')) apiFetch(`api/rooms_manage.php?action=delete_photo&id=${pid}`, { method: 'DELETE' }).then(() => renderRooms()); }
