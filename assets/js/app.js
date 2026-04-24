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
        welcome: "ยินดีต้อนรับ",
        login: "เข้าสู่ระบบ",
        register: "สมัครสมาชิก",
        logout: "ออกจากระบบ",
        calendar: "ปฏิทิน",
        my_bookings: "การจองของฉัน",
        insights: "สถิติ",
        rooms: "ห้องประชุม",
        users: "ผู้ใช้งาน",
        logs: "ประวัติ",
        settings: "ตั้งค่า",
        cancel: "ยกเลิก",
        back: "กลับ",
        submit: "ส่งข้อมูลการจอง",
        room_name: "ชื่อห้อง",
        capacity: "ความจุ",
        equipment: "อุปกรณ์",
        action: "จัดการ",
        status: "สถานะ",
        title: "ชื่องาน/โครงการ",
        position: "ตำแหน่ง",
        department: "สังกัด (คณะ/สำนัก)",
        phone: "เบอร์โทรศัพท์",
        participants: "จำนวนผู้เข้าร่วม (คน)",
        prep_time: "เวลาเตรียมสถานที่",
        start: "เวลาเริ่มงานจริง",
        end: "เวลาสิ้นสุดงาน",
        stay_logged_in: "จดจำการเข้าระบบ (30 วัน)",
        advance_3_days: "ต้องจองล่วงหน้าอย่างน้อย 3 วันทำการ",
        pending: "รออนุมัติ",
        approved: "อนุมัติแล้ว",
        rejected: "ไมือนุมัติ",
        book_room: "แบบฟอร์มขอใช้ห้องประชุม",
        select_room: "เลือกห้องประชุม",
        purpose: "วัตถุประสงค์การใช้",
        login_success: "เข้าสู่ระบบสำเร็จ",
        logout_info: "กำลังออกจากระบบ...",
        reg_success: "สมัครสมาชิกสำเร็จ กรุณารอการอนุมัติจากผู้ดูแล",
        booking_success: "ส่งคำขอจองสำเร็จ! กรุณารอการอนุมัติ",
        access_restricted: "พื้นที่จำกัด กรุณาเข้าสู่ระบบ",
        no_exit: "ออกจากการใช้งาน",
        table_setup: "การจัดโต๊ะ-เก้าอี้ (จำนวน)",
        setup_p: "ผู้เข้าร่วม",
        setup_s: "วิทยากร",
        setup_sn: "อาหารว่าง",
        setup_r: "ลงทะเบียน",
        layout: "รูปแบบการจัดห้อง",
        equip_needed: "อุปกรณ์ที่ต้องการ"
    },
    en: {
        welcome: "Welcome",
        login: "Login",
        register: "Register",
        logout: "Logout",
        calendar: "Calendar",
        my_bookings: "My Bookings",
        insights: "Insights",
        rooms: "Rooms",
        users: "Users",
        logs: "Logs",
        settings: "Settings",
        cancel: "Cancel",
        back: "Back",
        submit: "Submit Booking",
        room_name: "Room Name",
        capacity: "Capacity",
        equipment: "Equipment",
        action: "Action",
        status: "Status",
        title: "Event/Project Title",
        position: "Position",
        department: "Department/Faculty",
        phone: "Phone Number",
        participants: "Participants Count",
        prep_time: "Preparation Time",
        start: "Actual Start Time",
        end: "Actual End Time",
        stay_logged_in: "Remember Me (30 days)",
        advance_3_days: "Must book at least 3 days in advance",
        pending: "Pending",
        approved: "Approved",
        rejected: "Rejected",
        book_room: "Meeting Room Request Form",
        select_room: "Select Room",
        purpose: "Purpose",
        login_success: "Logged in successfully",
        logout_info: "Logging out...",
        reg_success: "Registration successful. Please wait for admin approval.",
        booking_success: "Booking requested! Awaiting approval.",
        access_restricted: "Access restricted. Please login.",
        no_exit: "No, Exit",
        table_setup: "Table/Chair Setup (Qty)",
        setup_p: "Participants",
        setup_s: "Speakers",
        setup_sn: "Snacks",
        setup_r: "Registration",
        layout: "Room Layout",
        equip_needed: "Equipment Needed"
    }
};

function t(key) {
    return translations[currentLang][key] || key;
}

function escapeHtml(text) {
    if (!text) return '';
    if (typeof text !== 'string') return text;
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function switchLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    location.reload();
}

const swalConfig = {
    customClass: {
        popup: 'rounded-3xl p-8',
        confirmButton: 'btn btn-primary px-8',
        cancelButton: 'btn btn-ghost',
        denyButton: 'btn btn-outline border-base-300'
    },
    buttonsStyling: false
};

async function initApp() {
    toggleLoading(true);
    await checkAuth();
    initCalendar();
    setupEventListeners();
    window.masterData = await fetchMasterData();
    toggleLoading(false);
}

async function fetchMasterData() {
    try {
        const res = await fetch('api/master_data.php');
        return await res.json();
    } catch (e) { return { departments: [], positions: [] }; }
}

function setupEventListeners() {
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) toggleBtn.onclick = () => document.querySelector('.sidebar').classList.toggle('show');

    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const res = await Swal.fire({
                ...swalConfig,
                title: "ต้องการบันทึกการตั้งค่าหรือไม่?",
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: "บันทึก",
                denyButtonText: `ไม่บันทึก`
            });
            if (res.isConfirmed) {
                const formData = new FormData(settingsForm);
                const data = Object.fromEntries(formData.entries());
                try {
                    await apiFetch('api/settings.php', { method: 'POST', body: JSON.stringify(data) });
                    Swal.fire({ ...swalConfig, title: "บันทึกสำเร็จ!", icon: "success", timer: 1500 });
                } catch (e) {}
            }
        });
    }
}

function toggleLoading(show) {
    const el = document.getElementById('loading-screen');
    if (el) el.style.display = show ? 'flex' : 'none';
}

async function apiFetch(url, options = {}) {
    toggleLoading(true);
    try {
        const response = await fetch(url, {
            ...options,
            headers: { 'Content-Type': 'application/json', ...options.headers }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Request failed');
        return data;
    } catch (error) {
        showToast('error', error.message);
        throw error;
    } finally {
        toggleLoading(false);
    }
}

async function checkAuth() {
    try {
        const data = await apiFetch('api/auth.php?action=status');
        user = data.loggedIn ? data.user : null;
        renderNav();
    } catch (e) { user = null; renderNav(); }
}

function showSection(sectionId) {
    const sections = ['calendar-section', 'admin-section', 'settings-section', 'my-bookings-section', 'logs-section', 'rooms-section', 'stats-section', 'master-section'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    const activeSection = document.getElementById(`${sectionId}-section`);
    if (activeSection) {
        activeSection.style.display = 'block';
        document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
        const activeLink = document.querySelector(`[onclick*="${sectionId}"]`);
        if (activeLink) activeLink.classList.add('active');
        const titleEl = document.getElementById('page-title-display');
        if (titleEl) titleEl.innerText = t(sectionId.replace('-','_')) || sectionId;
        if (sectionId === 'calendar') calendar.render();
        if (sectionId === 'admin') renderUserManagement();
        if (sectionId === 'settings') renderSettings();
        if (sectionId === 'my-bookings') renderMyBookings();
        if (sectionId === 'logs') renderAuditLogs();
        if (sectionId === 'rooms') renderRooms();
        if (sectionId === 'stats') renderStats();
        if (sectionId === 'master') renderMasterDataManagement();
        const drawerCheck = document.getElementById('main-drawer');
        if (drawerCheck) drawerCheck.checked = false;
    }
}

function renderNav() {
    const navLinks = document.getElementById('nav-links');
    const authBoxSidebar = document.getElementById('auth-box-sidebar');
    const authBoxTop = document.getElementById('auth-box-top');
    
    let linksHtml = `<li><a href="#" onclick="showSection('calendar')"><i class="fas fa-calendar-alt w-5 text-primary"></i> ${t('calendar')}</a></li>`;
    if (user) {
        linksHtml += `<li><a href="#" onclick="showSection('my-bookings')"><i class="fas fa-list w-5 text-primary"></i> ${t('my_bookings')}</a></li>`;
        if (user.role === 'admin' || user.role === 'approver') linksHtml += `<li><a href="#" onclick="showSection('stats')"><i class="fas fa-chart-line w-5 text-primary"></i> ${t('insights')}</a></li>`;
        
        if (['admin', 'approver', 'staff'].includes(user.role)) {
            linksHtml += `<div class="menu-title text-xs font-bold text-base-content/40 uppercase mt-4">Management</div>`;
            linksHtml += `<li><a href="#" onclick="showSection('rooms')"><i class="fas fa-door-open w-5 text-primary"></i> ${t('rooms')}</a></li>`;
        }

        if (user.role === 'admin') {
            linksHtml += `
                <li><a href="#" onclick="showSection('admin')"><i class="fas fa-users w-5 text-primary"></i> ${t('users')}</a></li>
                <li><a href="#" onclick="showSection('master')"><i class="fas fa-database w-5 text-primary"></i> ตั้งค่าข้อมูล</a></li>
                <li><a href="#" onclick="showSection('logs')"><i class="fas fa-history w-5 text-primary"></i> ${t('logs')}</a></li>
                <li><a href="#" onclick="showSection('settings')"><i class="fas fa-cogs w-5 text-primary"></i> ${t('settings')}</a></li>
            `;
        }
        authBoxSidebar.innerHTML = `
            <div class="bg-base-200 p-4 rounded-2xl flex items-center gap-4">
                <div class="avatar placeholder"><div class="bg-primary text-primary-content rounded-full w-10"><span class="text-xl font-bold">${user.username[0].toUpperCase()}</span></div></div>
                <div class="overflow-hidden"><div class="font-bold text-sm truncate text-base-content">${user.fullname || user.username}</div><div class="text-[10px] uppercase font-black opacity-50">${user.role}</div></div>
            </div>`;
        authBoxTop.innerHTML = `<button class="btn btn-ghost btn-circle" onclick="showProfileModal()"><i class="fas fa-user-cog"></i></button><button class="btn btn-error btn-sm ml-2" onclick="logout()"><i class="fas fa-sign-out-alt"></i> ${t('logout')}</button>`;
    } else {
        authBoxSidebar.innerHTML = `<button class="btn btn-primary w-full" onclick="showLoginModal()">${t('login')}</button>`;
        authBoxTop.innerHTML = ``;
    }
    navLinks.innerHTML = linksHtml;
}

let charts = {};
async function renderStats() {
    const container = document.getElementById('stats-container');
    try {
        const data = await apiFetch('api/stats.php');
        container.innerHTML = `
            <div class="stats stats-vertical lg:stats-horizontal shadow bg-base-100 w-full mb-8 border border-base-300">
                <div class="stat"><div class="stat-figure text-primary text-3xl"><i class="fas fa-calendar-check"></i></div><div class="stat-title">ทั้งหมดในระบบ</div><div class="stat-value text-primary">${data.summary.total_bookings}</div></div>
                <div class="stat"><div class="stat-figure text-warning text-3xl"><i class="fas fa-clock"></i></div><div class="stat-title">รอการอนุมัติ</div><div class="stat-value text-warning">${data.summary.pending_bookings}</div></div>
                <div class="stat"><div class="stat-figure text-success text-3xl"><i class="fas fa-users"></i></div><div class="stat-title">ผู้ใช้ที่ Active</div><div class="stat-value text-success">${data.summary.active_users}</div></div>
                <div class="stat"><div class="stat-figure text-secondary text-3xl"><i class="fas fa-door-open"></i></div><div class="stat-title">ห้องประชุม</div><div class="stat-value text-secondary">${data.summary.total_rooms}</div></div>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div class="card bg-base-100 shadow border border-base-300"><div class="card-body"><h2 class="card-title text-base-content/60">ยอดนิยมสูงสุด 10 อันดับแรก</h2><canvas id="roomUsageChart"></canvas></div></div>
                <div class="card bg-base-100 shadow border border-base-300"><div class="card-body"><h2 class="card-title text-base-content/60">สัดส่วนสถานะการจอง</h2><div class="h-[300px] flex items-center justify-center"><canvas id="statusDistChart"></canvas></div></div></div>
            </div>`;
        if (charts.room) charts.room.destroy();
        charts.room = new Chart(document.getElementById('roomUsageChart'), { type: 'bar', data: { labels: data.room_usage.map(r => r.name), datasets: [{ label: 'ครั้ง', data: data.room_usage.map(r => r.total), backgroundColor: '#4f46e5', borderRadius: 8 }] }, options: { responsive: true, indexAxis: 'y', plugins: { legend: { display: false } } } });
        if (charts.status) charts.status.destroy();
        charts.status = new Chart(document.getElementById('statusDistChart'), { type: 'doughnut', data: { labels: data.status_dist.map(s => t(s.status)), datasets: [{ data: data.status_dist.map(s => s.count), backgroundColor: ['#ffc107', '#22c55e', '#ef4444'] }] }, options: { responsive: true, maintainAspectRatio: false } });
    } catch (e) {}
}

async function renderRooms() {
    const container = document.getElementById('rooms-table-container');
    try {
        const rooms = await apiFetch('api/rooms.php');
        const isAdmin = user && user.role === 'admin';
        const canManage = user && ['admin', 'approver', 'staff'].includes(user.role);

        let html = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
        `;
        
        rooms.forEach(r => { 
            const editBtnLabel = isAdmin ? 'แก้ไขข้อมูล' : 'จัดการรูปภาพ';
            const editBtnIcon = isAdmin ? 'fa-edit' : 'fa-images';
            const mainPhoto = r.main_photo || 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=800&auto=format&fit=crop';
            
            html += `
                <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-200 overflow-hidden group">
                    <figure class="relative h-48 overflow-hidden">
                        <img src="${mainPhoto}" alt="${escapeHtml(r.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div class="absolute top-2 right-2 flex flex-col gap-1">
                            <div class="badge badge-primary shadow-lg">${r.capacity} ท่าน</div>
                        </div>
                    </figure>
                    <div class="card-body p-5">
                        <div class="flex justify-between items-start">
                            <div>
                                <h2 class="card-title text-lg font-bold text-base-content leading-tight">${escapeHtml(r.name)}</h2>
                                <p class="text-xs opacity-60 mt-1"><i class="fas fa-map-marker-alt mr-1"></i> ${escapeHtml(r.description || 'ไม่มีรายละเอียด')}</p>
                            </div>
                        </div>
                        
                        <div class="mt-4 space-y-2">
                            <div class="flex flex-wrap gap-1">
                                ${r.equipment ? r.equipment.split(',').slice(0, 3).map(e => `<span class="badge badge-ghost badge-sm text-[10px] opacity-70">${escapeHtml(e.trim())}</span>`).join('') : '<span class="text-[10px] opacity-30">ไม่มีข้อมูลอุปกรณ์</span>'}
                                ${r.equipment && r.equipment.split(',').length > 3 ? `<span class="badge badge-ghost badge-sm text-[10px] opacity-50">+${r.equipment.split(',').length - 3}</span>` : ''}
                            </div>
                        </div>

                        <div class="card-actions justify-end mt-6 pt-4 border-t border-base-100">
                            <div class="join w-full">
                                <button class="btn btn-primary btn-sm join-item flex-1" onclick='showRoomForm(${JSON.stringify(r)})' title="${editBtnLabel}">
                                    <i class="fas ${editBtnIcon} mr-2"></i> ${editBtnLabel}
                                </button>
                                ${isAdmin ? `
                                    <button class="btn btn-success btn-sm join-item text-white" onclick="generateRoomQR(${r.id}, '${escapeHtml(r.name)}')" title="สร้าง QR Code">
                                        <i class="fas fa-qrcode"></i>
                                    </button>
                                    <button class="btn btn-error btn-sm join-item text-white" onclick="deleteRoom(${r.id})" title="ลบห้อง">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `; 
        });
        
        html += `</div>`;
        container.innerHTML = html;
    } catch (e) {}
}

async function showRoomDetails(room = null) {
    const isAdmin = user && user.role === 'admin';
    const canManage = user && ['admin', 'approver', 'staff'].includes(user.role);
    let photosHtml = '';
    
    if (room && room.id) {
        const freshRoom = await apiFetch(`api/rooms.php?id=${room.id}`);
        const photos = freshRoom.photos || [];
        
        photosHtml = `
            <div class="mt-6 border-t border-base-200 pt-6">
                <h3 class="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                    <i class="fas fa-images"></i> รูปภาพประกอบ (${photos.length})
                </h3>
                
                ${photos.length > 0 ? `
                    <div class="relative group">
                        <div id="room-carousel" class="carousel w-full rounded-3xl shadow-2xl h-80 bg-black scroll-smooth">
                            ${photos.map((p, idx) => `
                                <div id="room-slide-${room.id}-${idx}" class="carousel-item relative w-full flex items-center justify-center">
                                    <img src="${p.file_path}" class="max-w-full max-h-full object-contain cursor-pointer" onclick="window.open('${p.file_path}', '_blank')">
                                    ${isAdmin ? `
                                        <div class="absolute top-4 right-4">
                                            <button onclick="deleteRoomPhoto(${p.id}, ${room.id})" class="btn btn-error btn-sm shadow-2xl backdrop-blur-md border-none"><i class="fas fa-trash mr-1"></i> ลบรูป</button>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                        ${photos.length > 1 ? `
                            <div class="absolute inset-y-0 left-2 flex items-center">
                                <button onclick="document.getElementById('room-carousel').scrollBy({left: -document.getElementById('room-carousel').clientWidth, behavior: 'smooth'})" class="btn btn-circle btn-md btn-ghost bg-base-100/20 backdrop-blur-md text-white hover:bg-base-100/40 opacity-0 group-hover:opacity-100 transition-all">❮</button>
                            </div>
                            <div class="absolute inset-y-0 right-2 flex items-center">
                                <button onclick="document.getElementById('room-carousel').scrollBy({left: document.getElementById('room-carousel').clientWidth, behavior: 'smooth'})" class="btn btn-circle btn-md btn-ghost bg-base-100/20 backdrop-blur-md text-white hover:bg-base-100/40 opacity-0 group-hover:opacity-100 transition-all">❯</button>
                            </div>
                        ` : ''}
                    </div>
                ` : `
                    <div class="bg-base-200/50 p-12 rounded-3xl text-center opacity-40 border-2 border-dashed border-base-300 mb-6">
                        <i class="fas fa-images text-5xl mb-3"></i>
                        <p class="text-sm font-bold">ยังไม่มีรูปภาพประกอบ</p>
                    </div>
                `}

                ${canManage ? `
                    <div class="flex flex-col gap-3 mt-6">
                        <label class="btn btn-primary btn-outline border-2 rounded-2xl h-auto py-4">
                            <div class="flex flex-col items-center">
                                <i class="fas fa-cloud-upload-alt text-2xl mb-1"></i>
                                <span class="text-xs font-bold">อัปโหลดรูปภาพใหม่</span>
                                <span class="text-[9px] opacity-60 mt-1 uppercase tracking-wider">JPG, PNG (Max 5MB)</span>
                            </div>
                            <input type="file" class="hidden" onchange="uploadRoomPhoto(this, ${room.id})">
                        </label>
                    </div>
                ` : ''}
            </div>`;
    }

    const { value: formValues } = await Swal.fire({
        ...swalConfig,
        title: isAdmin ? (room ? 'แก้ไขข้อมูลห้อง' : 'เพิ่มห้องประชุมใหม่') : 'ข้อมูลห้องประชุมและรูปภาพ',
        width: '750px',
        html: `
            <div class="text-left space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 ${!isAdmin ? 'bg-base-200 p-6 rounded-[2.5rem]' : ''}">
                    <div class="form-control col-span-2">
                        <label class="label"><span class="label-text font-black text-xs uppercase opacity-40">${t('room_name')}</span></label>
                        <input id="swal-name" class="input input-bordered w-full font-bold ${!isAdmin ? 'bg-transparent border-none px-0 h-auto text-xl' : ''}" value="${room ? escapeHtml(room.name) : ''}" ${!isAdmin ? 'readonly' : ''}>
                    </div>
                    <div class="form-control col-span-2">
                        <label class="label"><span class="label-text font-black text-xs uppercase opacity-40">รายละเอียด / อาคาร</span></label>
                        <input id="swal-desc" class="input input-bordered w-full ${!isAdmin ? 'bg-transparent border-none px-0 h-auto' : ''}" value="${room ? escapeHtml(room.description || '') : ''}" ${!isAdmin ? 'readonly' : ''}>
                    </div>
                    <div class="form-control">
                        <label class="label"><span class="label-text font-black text-xs uppercase opacity-40">${t('capacity')} (คน)</span></label>
                        <div class="flex items-center gap-2">
                            ${!isAdmin ? '<i class="fas fa-users text-primary"></i>' : ''}
                            <input id="swal-cap" type="number" class="input input-bordered w-full ${!isAdmin ? 'bg-transparent border-none px-0 h-auto font-bold' : ''}" value="${room ? room.capacity : ''}" ${!isAdmin ? 'readonly' : ''}>
                        </div>
                    </div>
                    <div class="form-control">
                        <label class="label"><span class="label-text font-black text-xs uppercase opacity-40">อุปกรณ์พื้นฐาน</span></label>
                        <div class="flex items-center gap-2">
                            ${!isAdmin ? '<i class="fas fa-tools text-primary"></i>' : ''}
                            <input id="swal-equip" class="input input-bordered w-full ${!isAdmin ? 'bg-transparent border-none px-0 h-auto font-bold' : ''}" value="${room ? escapeHtml(room.equipment || '') : ''}" ${!isAdmin ? 'readonly' : ''}>
                        </div>
                    </div>
                </div>
                ${photosHtml}
            </div>`,
        showCancelButton: true,
        showConfirmButton: isAdmin,
        confirmButtonText: 'บันทึกข้อมูล',
        cancelButtonText: 'ปิดหน้าต่าง',
        preConfirm: () => {
            if (!isAdmin) return null;
            const name = document.getElementById('swal-name').value;
            if (!name) {
                Swal.showValidationMessage('กรุณากรอกชื่อห้อง');
                return false;
            }
            return {
                id: room ? room.id : undefined,
                name,
                description: document.getElementById('swal-desc').value,
                capacity: document.getElementById('swal-cap').value,
                equipment: document.getElementById('swal-equip').value
            }
        }
    });

    if (formValues && isAdmin) {
        try {
            await apiFetch('api/rooms_manage.php', { method: 'POST', body: JSON.stringify(formValues) });
            showToast('success', 'บันทึกข้อมูลเรียบร้อย');
            renderRooms();
        } catch (e) {}
    }
}

async function logout() {
    const res = await Swal.fire({
        ...swalConfig,
        title: "ออกจากระบบหรือไม่?",
        text: "คุณต้องการสิ้นสุดการใช้งานในครั้งนี้ใช่หรือไม่?",
        icon: "question",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "ออกจากระบบ",
        denyButtonText: `ยกเลิก`,
        confirmButtonColor: '#ef4444'
    });
    if (res.isConfirmed) {
        try { await apiFetch('api/auth.php?action=logout'); } catch (e) {}
        location.reload();
    } else if (res.isDenied) {
        Swal.fire({ ...swalConfig, title: "ยกเลิกการออกจากระบบ", icon: "info", timer: 1000, showConfirmButton: false });
    }
}

async function cancelBooking(id) {
    const res = await Swal.fire({
        ...swalConfig,
        title: "ยกเลิกการจองหรือไม่?",
        text: "ข้อมูลการจองนี้จะถูกลบออกจากปฏิทิน",
        icon: "warning",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "ใช่, ยกเลิกการจอง",
        denyButtonText: `ไม่, เก็บไว้เหมือนเดิม`,
        confirmButtonColor: '#ef4444'
    });
    if (res.isConfirmed) {
        try {
            await apiFetch(`api/bookings.php?id=${id}`, { method: 'DELETE' });
            Swal.fire({ ...swalConfig, title: "ยกเลิกสำเร็จ", icon: "success", timer: 1500 });
            renderMyBookings();
            calendar.refetchEvents();
        } catch (e) {}
    }
}

async function deleteUser(userId) {
    const res = await Swal.fire({
        ...swalConfig,
        title: "ลบผู้ใช้งานหรือไม่?",
        text: "การกระทำนี้ไม่สามารถย้อนกลับได้",
        icon: "error",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "ใช่, ลบผู้ใช้",
        denyButtonText: `ไม่ต้องลบ`,
        confirmButtonColor: '#ef4444'
    });
    if (res.isConfirmed) {
        try {
            await apiFetch(`api/users.php?id=${userId}`, { method: 'DELETE' });
            Swal.fire({ ...swalConfig, title: "ลบสำเร็จ", icon: "success", timer: 1500 });
            renderUserManagement();
        } catch (e) {}
    }
}

async function showLoginModal() {
    const res = await Swal.fire({
        ...swalConfig,
        title: t('welcome'),
        text: t('access_restricted'),
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: t('login'),
        cancelButtonText: t('cancel'),
        showDenyButton: true,
        denyButtonText: t('register')
    });

    if (res.isConfirmed) {
        const { value: v } = await Swal.fire({
            ...swalConfig,
            title: t('login'),
            html: `<div class="space-y-4"><input id="swal-u" class="input input-bordered w-full" placeholder="Username"><input id="swal-p" type="password" class="input input-bordered w-full" placeholder="Password"></div>`,
            showCancelButton: true,
            preConfirm: () => {
                const u = document.getElementById('swal-u').value;
                const p = document.getElementById('swal-p').value;
                if(!u || !p) return Swal.showValidationMessage('Required');
                return { username:u, password:p }
            }
        });
        if (v) {
            try {
                await apiFetch('api/auth.php?action=login', { method: 'POST', body: JSON.stringify(v) });
                showToast('success', t('login_success'));
                setTimeout(() => location.reload(), 500);
            } catch (e) { showLoginModal(); }
        }
    } else if (res.isDenied) {
        showRegisterModal();
    }
}

async function showRegisterModal() {
    const depts = window.masterData?.departments || [];
    const positions = window.masterData?.positions || [];
    
    let deptOptions = depts.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
    deptOptions += `<option value="OTHER">อื่นๆ (โปรดระบุ)</option>`;
    
    let posOptions = positions.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
    posOptions += `<option value="OTHER">อื่นๆ (โปรดระบุ)</option>`;
    
    const prefixOptions = ['นาย', 'นาง', 'นางสาว', 'ดร.', 'ผศ.', 'รศ.', 'ศ.'].map(p => `<option value="${p}">${p}</option>`).join('');

    const { value: v } = await Swal.fire({
        ...swalConfig,
        title: t('register'),
        width: '800px',
        html: `
            <div style="text-align: left;" class="space-y-6">
                <div class="p-6 bg-base-200 rounded-2xl">
                    <h3 class="text-sm font-black uppercase tracking-widest text-primary mb-4"><i class="fas fa-user-circle"></i> ข้อมูลส่วนตัว (Profile)</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold">คำนำหน้า</span></label>
                            <select id="reg-prefix" class="select select-bordered w-full">${prefixOptions}</select>
                        </div>
                        <div class="form-control md:col-span-2">
                            <label class="label"><span class="label-text font-bold">ชื่อ-นามสกุล</span></label>
                            <input id="reg-fullname" class="input input-bordered w-full" placeholder="Full Name">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold">${t('position')}</span></label>
                            <select id="reg-pos" class="select select-bordered w-full" onchange="document.getElementById('reg-pos-other-div').style.display = this.value === 'OTHER' ? 'block' : 'none'">${posOptions}</select>
                            <div id="reg-pos-other-div" class="hidden mt-2"><input id="reg-pos-other" class="input input-bordered input-sm w-full" placeholder="ระบุตำแหน่งของคุณ"></div>
                        </div>
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold">${t('department')}</span></label>
                            <select id="reg-dept" class="select select-bordered w-full" onchange="document.getElementById('reg-dept-other-div').style.display = this.value === 'OTHER' ? 'block' : 'none'">${deptOptions}</select>
                            <div id="reg-dept-other-div" class="hidden mt-2"><input id="reg-dept-other" class="input input-bordered input-sm w-full" placeholder="ระบุชื่อคณะ/สำนัก"></div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold">${t('phone')}</span></label>
                            <input id="reg-phone" class="input input-bordered w-full" placeholder="08x-xxx-xxxx">
                        </div>
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold">Email</span></label>
                            <input id="reg-email" type="email" class="input input-bordered w-full" placeholder="email@example.com">
                        </div>
                    </div>
                </div>
                
                <div class="p-6 border border-base-300 rounded-2xl">
                    <h3 class="text-sm font-black uppercase tracking-widest text-secondary mb-4"><i class="fas fa-shield-alt"></i> ข้อมูลบัญชี (Account)</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold">Username</span></label>
                            <input id="reg-username" class="input input-bordered w-full" placeholder="Username">
                        </div>
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold">Password</span></label>
                            <input id="reg-password" type="password" class="input input-bordered w-full" placeholder="Password">
                        </div>
                    </div>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: "ลงทะเบียน",
        cancelButtonText: t('back'),
        preConfirm: () => {
            const username = document.getElementById('reg-username').value;
            const password = document.getElementById('reg-password').value;
            const fullname = document.getElementById('reg-fullname').value;
            if (!username || !password || !fullname) { Swal.showValidationMessage('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน'); return false; }
            
            const posSelect = document.getElementById('reg-pos').value;
            const deptSelect = document.getElementById('reg-dept').value;
            
            return { 
                username, password,
                prefix: document.getElementById('reg-prefix').value,
                fullname: fullname,
                position: posSelect === 'OTHER' ? document.getElementById('reg-pos-other').value : posSelect,
                department: deptSelect === 'OTHER' ? document.getElementById('reg-dept-other').value : deptSelect,
                phone: document.getElementById('reg-phone').value,
                email: document.getElementById('reg-email').value
            }
        }
    });

    if (v) {
        const confirmRes = await Swal.fire({
            ...swalConfig,
            title: "ยืนยันการสมัครสมาชิก?",
            text: "ข้อมูลของคุณจะถูกส่งไปยังผู้ดูแลระบบเพื่ออนุมัติ",
            icon: "question",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "ใช่, สมัครเลย",
            denyButtonText: `ตรวจสอบอีกครั้ง`
        });
        if (confirmRes.isConfirmed) {
            try {
                const res = await apiFetch('api/register.php', { method: 'POST', body: JSON.stringify(v) });
                await Swal.fire({ ...swalConfig, icon: 'success', title: 'สำเร็จ!', text: res.message });
                showLoginModal();
            } catch (e) {}
        } else if (confirmRes.isDenied) {
            // Re-open with values (YOLO logic to prevent losing data)
            showRegisterModal(); 
        }
    } else {
        showLoginModal();
    }
}

function initCalendar() {
    const el = document.getElementById('calendar');
    if (!el) return;
    calendar = new FullCalendar.Calendar(el, { initialView: 'dayGridMonth', locale: currentLang, headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }, events: 'api/bookings.php', dateClick: (info) => { user ? showBookingModal(info.dateStr) : showLoginModal(); }, eventClick: (info) => { showEventDetails(info.event); } });
    calendar.render();
}

function showToast(icon, title) { Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true, icon, title }); }

async function showProfileModal() {
    const data = await apiFetch('api/profile.php');
    const p = data.profile;
    const master = data.master;

    const prefixes = ['นาย', 'นาง', 'นางสาว', 'ดร.', 'ผศ.', 'รศ.', 'ศ.'];
    let prefixOptions = prefixes.map(opt => `<option value="${opt}" ${p.prefix === opt ? 'selected' : ''}>${opt}</option>`).join('');
    if (p.prefix && !prefixes.includes(p.prefix)) {
        prefixOptions += `<option value="${p.prefix}" selected>${p.prefix}</option>`;
    }

    let deptOptions = master.departments.map(d => `<option value="${d}" ${p.department === d ? 'selected' : ''}>${d}</option>`).join('');
    if (p.department && !master.departments.includes(p.department)) {
        deptOptions += `<option value="${p.department}" selected>${p.department}</option>`;
    }
    deptOptions += `<option value="OTHER">อื่นๆ (ระบุเอง)</option>`;

    let posOptions = master.positions.map(pos => `<option value="${pos}" ${p.position === pos ? 'selected' : ''}>${pos}</option>`).join('');
    if (p.position && !master.positions.includes(p.position)) {
        posOptions += `<option value="${p.position}" selected>${p.position}</option>`;
    }
    posOptions += `<option value="OTHER">อื่นๆ (ระบุเอง)</option>`;

    const { value: v } = await Swal.fire({
        ...swalConfig,
        title: 'ตั้งค่าโปรไฟล์ส่วนตัว',
        width: '700px',
        html: `
            <div class="text-left space-y-6">
                <div class="p-4 bg-base-200 rounded-2xl space-y-4">
                    <h3 class="text-xs font-black uppercase tracking-widest text-primary"><i class="fas fa-id-card"></i> ข้อมูลพื้นฐาน</h3>
                    <div class="grid grid-cols-3 gap-4">
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold">คำนำหน้า</span></label>
                            <select id="p-prefix" class="select select-bordered w-full">${prefixOptions}</select>
                        </div>
                        <div class="form-control col-span-2">
                            <label class="label"><span class="label-text font-bold">ชื่อ-นามสกุล</span></label>
                            <input id="p-fullname" class="input input-bordered w-full" value="${escapeHtml(p.fullname || '')}">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold">ตำแหน่ง</span></label>
                            <select id="p-pos" class="select select-bordered w-full" onchange="document.getElementById('p-pos-other-div').style.display = this.value === 'OTHER' ? 'block' : 'none'">${posOptions}</select>
                            <div id="p-pos-other-div" class="hidden mt-2"><input id="p-pos-other" class="input input-bordered input-sm w-full" placeholder="ระบุตำแหน่ง"></div>
                        </div>
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold">สังกัด</span></label>
                            <select id="p-dept" class="select select-bordered w-full" onchange="document.getElementById('p-dept-other-div').style.display = this.value === 'OTHER' ? 'block' : 'none'">${deptOptions}</select>
                            <div id="p-dept-other-div" class="hidden mt-2"><input id="p-dept-other" class="input input-bordered input-sm w-full" placeholder="ระบุสังกัด"></div>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold">เบอร์โทรศัพท์</span></label>
                            <input id="p-phone" class="input input-bordered w-full" value="${escapeHtml(p.phone || '')}">
                        </div>
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold">Email</span></label>
                            <input id="p-email" type="email" class="input input-bordered w-full" value="${escapeHtml(p.email || '')}">
                        </div>
                    </div>
                </div>

                <div class="p-4 border border-base-300 rounded-2xl space-y-4">
                    <h3 class="text-xs font-black uppercase tracking-widest text-secondary"><i class="fas fa-key"></i> เปลี่ยนรหัสผ่าน (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold">รหัสผ่านใหม่</span></label>
                            <input id="p-new-pass" type="password" class="input input-bordered w-full" placeholder="••••••••">
                        </div>
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold">ยืนยันรหัสผ่านใหม่</span></label>
                            <input id="p-confirm-pass" type="password" class="input input-bordered w-full" placeholder="••••••••">
                        </div>
                    </div>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'บันทึกการเปลี่ยนแปลง',
        preConfirm: () => {
            const newPass = document.getElementById('p-new-pass').value;
            const confirmPass = document.getElementById('p-confirm-pass').value;

            if (newPass && newPass !== confirmPass) {
                Swal.showValidationMessage('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
                return false;
            }

            if (newPass && newPass.length < 6) {
                Swal.showValidationMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
                return false;
            }

            const posSelect = document.getElementById('p-pos').value;
            const deptSelect = document.getElementById('p-dept').value;

            return {
                prefix: document.getElementById('p-prefix').value,
                fullname: document.getElementById('p-fullname').value,
                position: posSelect === 'OTHER' ? document.getElementById('p-pos-other').value : posSelect,
                department: deptSelect === 'OTHER' ? document.getElementById('p-dept-other').value : deptSelect,
                phone: document.getElementById('p-phone').value,
                email: document.getElementById('p-email').value,
                new_password: newPass
            }
        }
    });

    if (v) {
        try {
            await apiFetch('api/profile.php', { method: 'PATCH', body: JSON.stringify(v) });
            showToast('success', 'ปรับปรุงโปรไฟล์เรียบร้อย');
            checkAuth(); // Refresh top bar
        } catch (e) {}
    }
}

async function showBookingModal(date) {
    const rooms = await apiFetch('api/rooms.php');
    
    const updatePreview = (roomId) => {
        const room = rooms.find(r => r.id == roomId);
        const previewEl = document.getElementById('room-preview-box');
        if (room && previewEl) {
            const photo = room.main_photo || 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=800&auto=format&fit=crop';
            previewEl.innerHTML = `
                <div class="flex gap-4 p-3 bg-base-200 rounded-2xl border border-base-300 animate-fadeIn">
                    <img src="${photo}" class="w-24 h-24 object-cover rounded-xl shadow-md">
                    <div class="flex-1">
                        <div class="font-bold text-sm text-primary">${escapeHtml(room.name)}</div>
                        <div class="text-[10px] opacity-60 line-clamp-2 mt-1">${escapeHtml(room.description || '-')}</div>
                        <div class="flex gap-2 mt-2">
                            <div class="badge badge-sm badge-outline opacity-70"><i class="fas fa-users mr-1"></i> ${room.capacity}</div>
                            <div class="badge badge-sm badge-ghost text-[9px] opacity-50"><i class="fas fa-info-circle mr-1"></i> ดูรูปอื่นๆ ในเมนูห้องประชุม</div>
                        </div>
                    </div>
                </div>
            `;
        }
    };

    const { value: v } = await Swal.fire({ 
        ...swalConfig, 
        title: t('book_room'), 
        width: '800px', 
        html: `
            <div class="text-left space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-control">
                        <label class="label font-bold text-xs uppercase opacity-50">${t('select_room')}</label>
                        <select id="b-r" class="select select-bordered w-full" onchange="window.updateBookingRoomPreview(this.value)">
                            ${rooms.map(r=>`<option value="${r.id}">${r.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-control">
                        <label class="label font-bold text-xs uppercase opacity-50">${t('title')}</label>
                        <input id="b-t" class="input input-bordered w-full" placeholder="ระบุชื่อโครงการ/งาน">
                    </div>
                </div>

                <div id="room-preview-box"></div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-base-200 pt-4 mt-4">
                    <div class="form-control">
                        <label class="label font-bold text-xs uppercase opacity-50">${t('start')}</label>
                        <input id="b-s" type="datetime-local" class="input input-bordered w-full" value="${date}T09:00">
                    </div>
                    <div class="form-control">
                        <label class="label font-bold text-xs uppercase opacity-50">${t('end')}</label>
                        <input id="b-e" type="datetime-local" class="input input-bordered w-full" value="${date}T12:00">
                    </div>
                </div>
            </div>
        `, 
        didOpen: () => {
            window.updateBookingRoomPreview = updatePreview;
            updatePreview(document.getElementById('b-r').value);
        },
        showCancelButton: true, 
        confirmButtonText: 'ถัดไป (ระบุรายละเอียด)',
        preConfirm: () => {
            const title = document.getElementById('b-t').value;
            if (!title) return Swal.showValidationMessage('กรุณาระบุชื่องาน/โครงการ');
            return { 
                room_id: document.getElementById('b-r').value, 
                title: title, 
                start_time: document.getElementById('b-s').value, 
                end_time: document.getElementById('b-e').value 
            }
        } 
    });

    if (v) { 
        // YOLO: In a production app, we would show a second modal for participants, snacks, etc.
        // For now, we proceed to submit or show a summary
        try { 
            await apiFetch('api/bookings.php', { method: 'POST', body: JSON.stringify(v) }); 
            showToast('success', t('booking_success')); 
            calendar.refetchEvents(); 
        } catch (e) {} 
    }
}

async function showEventDetails(event) {
    const props = event.extendedProps;
    const now = new Date();
    const isAdmin = user && ['admin', 'approver'].includes(user.role);
    const isOwner = user && props.username === user.username;
    
    const statusColors = {
        pending: 'bg-warning text-warning-content',
        approved: 'bg-success text-white',
        rejected: 'bg-error text-white'
    };

    const canCheckIn = (props.status === 'approved' && now >= new Date(event.start) && !props.check_in_time);
    const canCheckOut = (props.status === 'approved' && props.check_in_time && !props.check_out_time);
    
    // Actions Section
    let actionsHtml = '';
    if (isAdmin && props.status === 'pending') {
        actionsHtml += `
            <div class="divider text-[10px] font-black uppercase tracking-widest opacity-30 mt-8">Admin Controls</div>
            <div class="grid grid-cols-2 gap-3">
                <button onclick="updateBookingStatus(${event.id}, 'approved')" class="btn btn-success text-white rounded-2xl shadow-lg shadow-success/20"><i class="fas fa-check-circle mr-2"></i> อนุมัติ</button>
                <button onclick="updateBookingStatus(${event.id}, 'rejected')" class="btn btn-error text-white rounded-2xl shadow-lg shadow-error/20"><i class="fas fa-times-circle mr-2"></i> ไม่อนุมัติ</button>
            </div>
        `;
    }

    if (canCheckIn) {
        actionsHtml += `<button onclick="checkInBooking(${event.id})" class="btn btn-success btn-block mt-6 shadow-xl shadow-success/30 rounded-2xl animate-pulse py-4 h-auto">
            <i class="fas fa-sign-in-alt text-xl mr-3"></i> 
            <div class="text-left">
                <div class="text-xs font-black uppercase tracking-tighter">Ready to use</div>
                <div class="text-lg">Check-in เข้าใช้งานห้อง</div>
            </div>
        </button>`;
    } else if (canCheckOut) {
        actionsHtml += `<button onclick="checkOutBooking(${event.id})" class="btn btn-primary btn-block mt-6 shadow-xl shadow-primary/30 rounded-2xl py-4 h-auto">
            <i class="fas fa-sign-out-alt text-xl mr-3"></i>
            <div class="text-left">
                <div class="text-xs font-black uppercase tracking-tighter">Job Finished</div>
                <div class="text-lg">Check-out และให้คะแนน</div>
            </div>
        </button>`;
    }

    if (isOwner && props.status === 'pending') {
        actionsHtml += `<button onclick="cancelBooking(${event.id})" class="btn btn-ghost btn-sm btn-block text-error/50 hover:text-error mt-6 transition-colors">
            <i class="fas fa-trash-alt mr-2"></i> ยกเลิกคำขอจองนี้
        </button>`;
    }

    const roomPhoto = props.room_photo || 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=800&auto=format&fit=crop';

    let html = `
        <div class="text-left space-y-8">
            <!-- Top Card with Image -->
            <div class="relative h-56 -mx-10 -mt-10 overflow-hidden rounded-b-[3rem] shadow-2xl">
                <img src="${roomPhoto}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div class="absolute bottom-6 left-8 right-6 flex justify-between items-end">
                    <div>
                        <div class="badge badge-primary border-none font-black text-[10px] uppercase tracking-[0.2em] mb-2 px-3 py-2 shadow-xl">${escapeHtml(props.room_name)}</div>
                        <h2 class="text-3xl font-black text-white leading-tight drop-shadow-lg">${escapeHtml(event.title)}</h2>
                    </div>
                    <div class="px-4 py-2 rounded-2xl ${statusColors[props.status]} font-black text-xs uppercase tracking-widest shadow-2xl">
                        ${t(props.status)}
                    </div>
                </div>
            </div>

            <!-- Content Area -->
            <div class="px-2 space-y-6">
                <!-- User Info -->
                <div class="flex items-center gap-4">
                    <div class="avatar placeholder"><div class="bg-primary/10 text-primary rounded-2xl w-12 h-12 shadow-inner font-black text-xl"><span>${(props.fullname || props.username)[0].toUpperCase()}</span></div></div>
                    <div>
                        <div class="text-[10px] font-black uppercase tracking-widest opacity-40">Request By</div>
                        <div class="text-lg font-black text-base-content">${escapeHtml(props.fullname || props.username)}</div>
                    </div>
                </div>

                <!-- Info Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="p-5 bg-base-200 rounded-[2rem] border border-base-300 transition-all hover:bg-base-100 group">
                        <div class="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 group-hover:text-primary transition-colors">Date & Time</div>
                        <div class="space-y-1">
                            <div class="text-sm font-bold flex items-center"><i class="far fa-calendar-check text-primary mr-3 text-base"></i> ${new Date(event.start).toLocaleDateString('th-TH', { dateStyle: 'long' })}</div>
                            <div class="text-sm font-bold flex items-center"><i class="far fa-clock text-primary mr-3 text-base"></i> ${new Date(event.start).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.end).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                    </div>
                    <div class="p-5 bg-base-200 rounded-[2rem] border border-base-300 transition-all hover:bg-base-100 group">
                        <div class="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 group-hover:text-primary transition-colors">Organization</div>
                        <div class="space-y-1">
                            <div class="text-sm font-bold flex items-center truncate" title="${escapeHtml(props.department)}"><i class="fas fa-building text-primary mr-3 text-base"></i> ${escapeHtml(props.department || '-')}</div>
                            <div class="text-sm font-bold flex items-center"><i class="fas fa-phone-alt text-primary mr-3 text-base"></i> ${escapeHtml(props.phone || '-')}</div>
                        </div>
                    </div>
                </div>

                <!-- Status Logs -->
                ${props.check_in_time ? `
                    <div class="p-4 bg-success/5 border border-success/20 rounded-2xl flex items-center gap-4">
                        <div class="w-10 h-10 bg-success text-white rounded-full flex items-center justify-center shadow-lg shadow-success/20"><i class="fas fa-check-double"></i></div>
                        <div class="flex-1">
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-[10px] font-black uppercase tracking-widest text-success opacity-70">Utilization log</span>
                                ${props.rating ? `
                                    <div class="rating rating-xs">
                                        ${[1,2,3,4,5].map(star => `<input type="radio" class="mask mask-star-2 bg-warning" ${star == props.rating ? 'checked' : ''} disabled />`).join('')}
                                    </div>
                                ` : ''}
                            </div>
                            <div class="text-xs font-bold text-success">เช็คอินเมื่อ: ${new Date(props.check_in_time).toLocaleTimeString('th-TH')} ${props.check_out_time ? ` • ออกเมื่อ: ${new Date(props.check_out_time).toLocaleTimeString('th-TH')}` : ''}</div>
                        </div>
                    </div>
                ` : ''}

                ${actionsHtml}
            </div>
        </div>
    `;

    Swal.fire({ 
        ...swalConfig, 
        html, 
        width: '600px',
        showConfirmButton: false, 
        showCloseButton: true,
        customClass: {
            ...swalConfig.customClass,
            popup: 'rounded-[3rem] p-10 shadow-2xl overflow-hidden'
        }
    });
}

async function checkInBooking(id) { try { await apiFetch('api/bookings.php', { method: 'PATCH', body: JSON.stringify({ id, action: 'check_in' }) }); showToast('success', 'Checked In'); Swal.close(); calendar.refetchEvents(); } catch (e) {} }
async function checkOutBooking(id) { const { value: r } = await Swal.fire({ ...swalConfig, title: 'Rating', input: 'range', inputAttributes: { min: 1, max: 5, step: 1 }, inputValue: 5, text: 'Rate your experience (1-5)' }); if (r) { try { await apiFetch('api/bookings.php', { method: 'PATCH', body: JSON.stringify({ id, action: 'check_out', rating: r }) }); showToast('success', 'Thank you!'); calendar.refetchEvents(); } catch (e) {} } }
async function renderMasterDataManagement() { const container = document.getElementById('master-container'); const data = await fetchMasterData(); container.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 gap-8"><div class="card bg-base-100 shadow border border-base-300"><div class="card-body"><h3 class="card-title justify-between">Departments <button class="btn btn-xs btn-primary" onclick="addMasterData('dept')">Add</button></h3><div class="overflow-x-auto"><table class="table table-xs w-full">${data.departments.map(d=>`<tr><td>${d.name}</td><td class="text-right"><button onclick="deleteMasterData('dept',${d.id})" class="btn btn-ghost btn-xs text-error"><i class="fas fa-trash"></i></button></td></tr>`).join('')}</table></div></div></div><div class="card bg-base-100 shadow border border-base-300"><div class="card-body"><h3 class="card-title justify-between">Positions <button class="btn btn-xs btn-primary" onclick="addMasterData('pos')">Add</button></h3><div class="overflow-x-auto"><table class="table table-xs w-full">${data.positions.map(p=>`<tr><td>${p.name}</td><td class="text-right"><button onclick="deleteMasterData('pos',${p.id})" class="btn btn-ghost btn-xs text-error"><i class="fas fa-trash"></i></button></td></tr>`).join('')}</table></div></div></div></div>`; }
async function addMasterData(type) { const { value: name } = await Swal.fire({ ...swalConfig, title: 'Add Data', input: 'text', showCancelButton: true }); if (name) { try { await apiFetch('api/master_data.php', { method: 'POST', body: JSON.stringify({ type, name }) }); renderMasterDataManagement(); window.masterData = await fetchMasterData(); } catch (e) {} } }
async function deleteMasterData(type, id) { if (confirm('Delete?')) { try { await apiFetch(`api/master_data.php?type=${type}&id=${id}`, { method: 'DELETE' }); renderMasterDataManagement(); window.masterData = await fetchMasterData(); } catch (e) {} } }
async function updateBookingStatus(id, status) { try { await apiFetch('api/bookings.php', { method: 'PATCH', body: JSON.stringify({ id, status }) }); Swal.close(); showToast('success', t('user_status_updated')); calendar.refetchEvents(); } catch (e) {} }
async function deleteRoomPhoto(photoId, roomId) { const res = await Swal.fire({ ...swalConfig, title: 'ลบรูปภาพ?', text: 'คุณต้องการลบรูปภาพนี้ใช่หรือไม่?', icon: 'warning', showCancelButton: true, confirmButtonText: 'ใช่, ลบเลย' }); if (res.isConfirmed) { try { await apiFetch(`api/rooms_manage.php?action=delete_photo&id=${photoId}`, { method: 'DELETE' }); showToast('success', 'ลบรูปภาพแล้ว'); const rooms = await apiFetch('api/rooms.php'); showRoomForm(rooms.find(r => r.id == roomId)); } catch (e) {} } }

let userManagementState = {
    allUsers: [],
    filteredUsers: [],
    currentPage: 1,
    pageSize: 10
};

async function renderMyBookings() {
    const container = document.getElementById('my-bookings-container');
    try {
        const bookings = await apiFetch('api/bookings.php?mine=1');
        
        if (bookings.length === 0) {
            container.innerHTML = `
                <div class="bg-base-200 p-20 rounded-[3rem] text-center border-2 border-dashed border-base-300">
                    <div class="w-24 h-24 bg-base-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <i class="fas fa-calendar-plus text-4xl text-primary opacity-30"></i>
                    </div>
                    <h3 class="text-xl font-black opacity-60">ยังไม่มีประวัติการจอง</h3>
                    <p class="text-sm opacity-40 mt-2">เริ่มจองห้องประชุมได้ง่ายๆ ผ่านหน้าปฏิทิน</p>
                    <button class="btn btn-primary mt-8 rounded-2xl px-8" onclick="showSection('calendar')">ไปที่ปฏิทิน</button>
                </div>`;
            return;
        }

        let html = `<div class="grid grid-cols-1 gap-4">`;
        
        bookings.forEach(b => {
            const statusColor = b.status === 'approved' ? 'badge-success' : (b.status === 'pending' ? 'badge-warning' : 'badge-error');
            const photo = b.room_photo || 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=800&auto=format&fit=crop';
            const start = new Date(b.start);
            
            html += `
                <div class="card card-side bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-all rounded-3xl overflow-hidden group">
                    <figure class="w-32 md:w-48 h-full relative">
                        <img src="${photo}" class="w-full h-full object-cover">
                        <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                    </figure>
                    <div class="card-body p-4 md:p-6 justify-between">
                        <div class="flex flex-col md:flex-row md:items-start justify-between gap-2">
                            <div>
                                <div class="badge badge-sm badge-outline opacity-50 mb-1">${escapeHtml(b.room_name)}</div>
                                <h3 class="card-title text-base md:text-lg font-black leading-tight">${escapeHtml(b.title)}</h3>
                                <div class="text-[10px] opacity-40 mt-1 uppercase font-bold tracking-widest">
                                    <i class="fas fa-history mr-1"></i> จองเมื่อ: ${new Date(b.created_at).toLocaleDateString('th-TH')}
                                </div>
                            </div>
                            <div class="badge ${statusColor} text-white font-black text-[10px] uppercase tracking-widest px-3 py-3 rounded-xl shadow-sm">
                                ${t(b.status)}
                            </div>
                        </div>

                        <div class="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs font-bold border-t border-dashed border-base-200 pt-4">
                            <div class="flex items-center gap-2"><i class="far fa-calendar-alt text-primary"></i> ${start.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })}</div>
                            <div class="flex items-center gap-2"><i class="far fa-clock text-primary"></i> ${start.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} - ${new Date(b.end).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</div>
                            ${b.check_in_time ? `<div class="flex items-center gap-2 text-success"><i class="fas fa-check-circle"></i> เช็คอินแล้ว</div>` : ''}
                        </div>

                        <div class="card-actions justify-end mt-4">
                            <button class="btn btn-ghost btn-xs text-primary" onclick="viewBookingDetailsById(${b.id})">ดูรายละเอียด</button>
                            ${b.status === 'pending' ? `<button class="btn btn-ghost btn-xs text-error" onclick="cancelBooking(${b.id})">ยกเลิก</button>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
        container.innerHTML = html;
    } catch (e) {}
}

async function viewBookingDetailsById(id) {
    try {
        const bookings = await apiFetch('api/bookings.php');
        const b = bookings.find(x => x.id == id);
        if (b) {
            // FullCalendar event object shim
            const mockEvent = {
                id: b.id,
                title: b.title,
                start: new Date(b.start),
                end: new Date(b.end),
                extendedProps: b
            };
            showEventDetails(mockEvent);
        }
    } catch (e) {}
}

async function renderUserManagement() {
    const container = document.getElementById('users-table-container');
    try {
        const users = await apiFetch('api/users.php');
        userManagementState.allUsers = users;
        userManagementState.filteredUsers = users;
        userManagementState.currentPage = 1;

        container.innerHTML = `
            <div class="p-4 border-b border-base-200 bg-base-100 flex flex-wrap gap-4 items-center justify-between rounded-t-2xl">
                <div class="flex flex-wrap gap-4 items-center flex-1">
                    <div class="relative w-full max-w-xs">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-base-content/50">
                            <i class="fas fa-search text-xs"></i>
                        </span>
                        <input type="text" id="user-search-input" class="input input-bordered input-sm w-full pl-10" placeholder="ค้นหาพนักงาน...">
                    </div>
                    <select id="user-page-size" class="select select-bordered select-sm">
                        <option value="5">5 รายการ/หน้า</option>
                        <option value="10" selected>10 รายการ/หน้า</option>
                        <option value="20">20 รายการ/หน้า</option>
                        <option value="50">50 รายการ/หน้า</option>
                        <option value="0">แสดงทั้งหมด</option>
                    </select>
                </div>
                <div class="text-[10px] font-black opacity-40 uppercase tracking-widest">
                    พบทั้งหมด <span id="user-count" class="text-primary">${users.length}</span> ราย
                </div>
            </div>
            <div id="users-list-target" class="overflow-x-auto"></div>
            <div class="p-4 border-t border-base-200 bg-base-50 rounded-b-2xl flex justify-between items-center" id="user-pagination-controls">
                <!-- Pagination buttons injected here -->
            </div>
        `;

        const renderTable = () => {
            const target = document.getElementById('users-list-target');
            const pageControls = document.getElementById('user-pagination-controls');
            
            // Filtering and Slicing
            const size = parseInt(userManagementState.pageSize);
            const total = userManagementState.filteredUsers.length;
            const maxPage = size > 0 ? Math.ceil(total / size) : 1;
            
            if (userManagementState.currentPage > maxPage) userManagementState.currentPage = maxPage;
            if (userManagementState.currentPage < 1) userManagementState.currentPage = 1;

            const start = size > 0 ? (userManagementState.currentPage - 1) * size : 0;
            const end = size > 0 ? start + size : total;
            const pagedUsers = userManagementState.filteredUsers.slice(start, end);

            document.getElementById('user-count').innerText = total;
            
            if (total === 0) {
                target.innerHTML = `<div class="p-20 text-center opacity-30"><i class="fas fa-user-slash text-5xl mb-4"></i><p>ไม่พบข้อมูล</p></div>`;
                pageControls.innerHTML = '';
                return;
            }

            let html = `
                <table class="table table-zebra w-full bg-base-100">
                    <thead>
                        <tr class="text-[10px] uppercase opacity-60">
                            <th>Account</th>
                            <th>Full Name & Department</th>
                            <th>Role / Status</th>
                            <th class="text-right">Manage</th>
                        </tr>
                    </thead>
                    <tbody>`;
            
            pagedUsers.forEach(u => {
                const statusColor = u.status === 'active' ? 'badge-success' : (u.status === 'pending' ? 'badge-warning' : 'badge-error');
                html += `
                    <tr class="hover cursor-pointer group" onclick="showUserEditModal(${u.id})">
                        <td>
                            <div class="flex items-center gap-3">
                                <div class="avatar placeholder"><div class="bg-neutral text-neutral-content rounded-full w-8"><span>${u.username[0].toUpperCase()}</span></div></div>
                                <div><div class="font-bold text-sm">${escapeHtml(u.username)}</div><div class="text-[10px] opacity-40">ID: #${u.id}</div></div>
                            </div>
                        </td>
                        <td>
                            <div class="text-xs font-bold">${escapeHtml(u.prefix || '')}${escapeHtml(u.fullname) || '(ยังไม่ระบุ)'}</div>
                            <div class="text-[10px] opacity-60 mt-0.5">${escapeHtml(u.department) || '-'}</div>
                            <div class="text-[10px] text-primary mt-0.5"><i class="fas fa-envelope mr-1"></i>${escapeHtml(u.email) || '-'}</div>
                        </td>
                        <td>
                            <div class="flex flex-col gap-1">
                                <div class="badge badge-sm font-bold uppercase text-[9px]">${u.role}</div>
                                <div class="badge ${statusColor} badge-xs text-[8px] font-black uppercase">${u.status}</div>
                            </div>
                        </td>
                        <td class="text-right">
                            <button class="btn btn-ghost btn-square btn-xs group-hover:bg-primary group-hover:text-white transition-all"><i class="fas fa-edit"></i></button>
                        </td>
                    </tr>`;
            });
            html += `</tbody></table>`;
            target.innerHTML = html;

            // Render Pagination Buttons
            if (size > 0 && total > size) {
                pageControls.innerHTML = `
                    <div class="text-xs opacity-50">หน้า ${userManagementState.currentPage} จาก ${maxPage}</div>
                    <div class="join">
                        <button class="join-item btn btn-xs ${userManagementState.currentPage === 1 ? 'btn-disabled' : ''}" onclick="changeUserPage(-1)">«</button>
                        <button class="join-item btn btn-xs btn-active">Page ${userManagementState.currentPage}</button>
                        <button class="join-item btn btn-xs ${userManagementState.currentPage === maxPage ? 'btn-disabled' : ''}" onclick="changeUserPage(1)">»</button>
                    </div>
                `;
            } else {
                pageControls.innerHTML = `<div class="text-xs opacity-30 text-center w-full">แสดงผลทั้งหมด ${total} รายการ</div>`;
            }
        };

        renderTable();

        // Listeners
        document.getElementById('user-search-input').oninput = (e) => {
            const q = e.target.value.toLowerCase().trim();
            userManagementState.filteredUsers = userManagementState.allUsers.filter(u => 
                u.username.toLowerCase().includes(q) || 
                (u.fullname||'').toLowerCase().includes(q) || 
                (u.department||'').toLowerCase().includes(q)
            );
            userManagementState.currentPage = 1;
            renderTable();
        };

        document.getElementById('user-page-size').onchange = (e) => {
            userManagementState.pageSize = e.target.value;
            userManagementState.currentPage = 1;
            renderTable();
        };

        window.changeUserPage = (dir) => {
            userManagementState.currentPage += dir;
            renderTable();
        };

    } catch (e) {}
}

async function showUserEditModal(userId) {
    // Ensure we have fresh data
    const users = await apiFetch('api/users.php');
    const u = users.find(user => user.id == userId);
    if (!u) return;

    const depts = window.masterData?.departments || [];
    const positions = window.masterData?.positions || [];
    
    let deptOptions = depts.map(d => `<option value="${d.name}" ${u.department === d.name ? 'selected' : ''}>${d.name}</option>`).join('');
    if (u.department && !depts.some(d => d.name === u.department)) {
        deptOptions += `<option value="${u.department}" selected>${u.department}</option>`;
    }
    deptOptions += `<option value="OTHER">อื่นๆ (ระบุเอง)</option>`;
    
    let posOptions = positions.map(p => `<option value="${p.name}" ${u.position === p.name ? 'selected' : ''}>${p.name}</option>`).join('');
    if (u.position && !positions.some(p => p.name === u.position)) {
        posOptions += `<option value="${u.position}" selected>${u.position}</option>`;
    }
    posOptions += `<option value="OTHER">อื่นๆ (ระบุเอง)</option>`;

    const { value: result, isConfirmed, isDenied } = await Swal.fire({
        ...swalConfig,
        title: `จัดการผู้ใช้: ${u.username}`,
        width: '800px',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-save mr-2"></i> บันทึก',
        denyButtonText: '<i class="fas fa-trash mr-2"></i> ลบผู้ใช้',
        html: `
            <div class="text-left space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-base-200 p-6 rounded-2xl">
                    <div class="form-control">
                        <label class="label"><span class="label-text font-bold">สิทธิ์ (Role)</span></label>
                        <select id="edit-user-role" class="select select-bordered w-full">
                            <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
                            <option value="approver" ${u.role==='approver'?'selected':''}>Approver</option>
                            <option value="staff" ${u.role==='staff'?'selected':''}>Staff</option>
                            <option value="user" ${u.role==='user'?'selected':''}>User</option>
                        </select>
                    </div>
                    <div class="form-control">
                        <label class="label"><span class="label-text font-bold">สถานะ (Status)</span></label>
                        <select id="edit-user-status" class="select select-bordered w-full">
                            <option value="active" ${u.status==='active'?'selected':''}>Active</option>
                            <option value="pending" ${u.status==='pending'?'selected':''}>Pending</option>
                            <option value="suspended" ${u.status==='suspended'?'selected':''}>Suspended</option>
                        </select>
                    </div>
                </div>

                <div class="p-6 border border-base-300 rounded-2xl space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold">คำนำหน้า</span></label>
                            <input id="edit-user-prefix" class="input input-bordered w-full" value="${escapeHtml(u.prefix || '')}">
                        </div>
                        <div class="form-control md:col-span-2">
                            <label class="label"><span class="label-text font-bold">ชื่อ-นามสกุล</span></label>
                            <input id="edit-user-fullname" class="input input-bordered w-full" value="${escapeHtml(u.fullname || '')}">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold">ตำแหน่ง</span></label>
                            <select id="edit-user-pos" class="select select-bordered w-full">${posOptions}</select>
                        </div>
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold">สังกัด</span></label>
                            <select id="edit-user-dept" class="select select-bordered w-full">${deptOptions}</select>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold">เบอร์โทรศัพท์</span></label>
                            <input id="edit-user-phone" class="input input-bordered w-full" value="${escapeHtml(u.phone || '')}">
                        </div>
                        <div class="form-control">
                            <label class="label"><span class="label-text font-bold">Email</span></label>
                            <input id="edit-user-email" type="email" class="input input-bordered w-full" value="${escapeHtml(u.email || '')}">
                        </div>
                    </div>
                </div>
            </div>
        `,
        preConfirm: () => {
            return {
                id: userId,
                role: document.getElementById('edit-user-role').value,
                status: document.getElementById('edit-user-status').value,
                prefix: document.getElementById('edit-user-prefix').value,
                fullname: document.getElementById('edit-user-fullname').value,
                position: document.getElementById('edit-user-pos').value,
                department: document.getElementById('edit-user-dept').value,
                phone: document.getElementById('edit-user-phone').value,
                email: document.getElementById('edit-user-email').value
            }
        }
    });

    if (isConfirmed) {
        try {
            await apiFetch('api/users.php', { method: 'PATCH', body: JSON.stringify(result) });
            showToast('success', 'บันทึกข้อมูลเรียบร้อย');
            renderUserManagement();
        } catch (e) {}
    } else if (isDenied) {
        deleteUser(userId);
    }
}

// Special handle for delete button inside Swal is cleaner as separate call
async function deleteUser(userId) {
    const res = await Swal.fire({
        ...swalConfig,
        title: "ลบผู้ใช้งานหรือไม่?",
        text: "การกระทำนี้ไม่สามารถย้อนกลับได้",
        icon: "error",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "ใช่, ลบผู้ใช้",
        denyButtonText: `ไม่ต้องลบ`,
        confirmButtonColor: '#ef4444'
    });
    if (res.isConfirmed) {
        try {
            await apiFetch(`api/users.php?id=${userId}`, { method: 'DELETE' });
            Swal.fire({ ...swalConfig, title: "ลบสำเร็จ", icon: "success", timer: 1500 });
            renderUserManagement();
        } catch (e) {}
    }
}

async function uploadRoomPhoto(input, roomId) {
    if (!input.files || !input.files[0]) return;
    
    const file = input.files[0];
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('room_id', roomId);

    toggleLoading(true);
    try {
        const response = await fetch('api/upload.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Upload failed');
        
        showToast('success', 'อัปโหลดรูปภาพสำเร็จ');
        // Refresh the room form to show new photo
        const rooms = await apiFetch('api/rooms.php');
        showRoomForm(rooms.find(r => r.id == roomId));
    } catch (error) {
        showToast('error', error.message);
    } finally {
        toggleLoading(false);
    }
}

