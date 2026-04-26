/**
 * Room Booking System - Main JS (RRU Version 2024 Optimized)
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
        approved: "อนุมัติแล้ว", pending: "รออนุมัติ", rejected: "ไม่อนุมัติ",
        maintenance: "บำรุงรักษา"
    }
};

function t(key) { return translations[currentLang][key] || key; }
function escapeHtml(text) { if (!text) return ''; const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }; return String(text).replace(/[&<>"']/g, m => map[m]); }

const swalConfig = {
    customClass: { popup: 'rounded-3xl p-8', confirmButton: 'btn btn-primary px-8', cancelButton: 'btn btn-ghost', denyButton: 'btn btn-outline border-base-300' },
    buttonsStyling: false,
    showCloseButton: true
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
        linksHtml += `<li><a href="#" onclick="showProfileModal()"><i class="fas fa-user-circle w-5 text-primary"></i> Profile</a></li>`;
        linksHtml += `<li><a href="#" onclick="showSection('my-bookings')"><i class="fas fa-list w-5 text-primary"></i> ${t('my_bookings')}</a></li>`;
        if (['admin', 'approver', 'staff'].includes(user.role)) {
            linksHtml += `<li><a href="#" onclick="showSection('stats')"><i class="fas fa-chart-line w-5 text-primary"></i> ${t('insights')}</a></li>`;
            linksHtml += `<div class="menu-title text-xs opacity-40 uppercase mt-4">Management</div>`;
            linksHtml += `<li><a href="#" onclick="showSection('rooms')"><i class="fas fa-door-open w-5 text-primary"></i> ${t('rooms')}</a></li>`;
        }
        if (user.role === 'admin') {
            linksHtml += `<li><a href="#" onclick="showSection('admin')"><i class="fas fa-users w-5 text-primary"></i> ${t('users')}</a></li>`;
            linksHtml += `<li><a href="#" onclick="showSection('master')"><i class="fas fa-tags w-5 text-primary"></i> Master Data</a></li>`;
            linksHtml += `<li><a href="#" onclick="showSection('logs')"><i class="fas fa-history w-5 text-primary"></i> Audit Logs</a></li>`;
            linksHtml += `<li><a href="#" onclick="showSection('maintenance')"><i class="fas fa-tools w-5 text-primary"></i> ${t('maintenance')}</a></li>`;
            linksHtml += `<li><a href="#" onclick="showSection('settings')"><i class="fas fa-cog w-5 text-primary"></i> Settings</a></li>`;
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
    ['calendar', 'admin', 'settings', 'my-bookings', 'logs', 'rooms', 'stats', 'maintenance', 'master'].forEach(s => {
        const el = document.getElementById(`${s}-section`);
        if (el) el.style.display = (s === id) ? 'block' : 'none';
    });
    if (id === 'calendar' && calendar) calendar.render();
    if (id === 'rooms') renderRooms();
    if (id === 'stats') renderStats();
    if (id === 'my-bookings') renderMyBookings();
    if (id === 'admin') renderUserManagement();
    if (id === 'logs') renderLogs();
    if (id === 'settings') renderSettings();
    if (id === 'master') renderMasterData();
    if (id === 'maintenance') renderMaintenance();
}

async function renderRooms() {
    const container = document.getElementById('rooms-table-container');
    const rooms = await apiFetch('api/rooms.php');
    const isAdmin = user?.role === 'admin';
    const canManage = ['admin', 'approver', 'staff'].includes(user?.role);
    const defaultImg = 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=800&auto=format&fit=crop';

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-xl font-black">จัดการห้องประชุม</h2>
                <p class="text-xs opacity-50 mt-1">ทั้งหมด ${rooms.length} ห้อง</p>
            </div>
            ${isAdmin ? `<button class="btn btn-primary rounded-xl" onclick="showRoomDetails()"><i class="fas fa-plus mr-2"></i> เพิ่มห้องใหม่</button>` : ''}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${rooms.map(r => `
                <div class="card bg-base-100 shadow-xl border border-base-200 overflow-hidden group">
                    <figure class="h-48 overflow-hidden relative">
                        <img src="${r.main_photo || defaultImg}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                        <div class="absolute top-2 right-2 badge badge-primary font-bold">฿${Number(r.rate_4h).toLocaleString()}</div>
                    </figure>
                    <div class="card-body p-5 text-left">
                        <h3 class="card-title text-base font-black">${r.name}</h3>
                        <p class="text-xs opacity-60 line-clamp-2">${r.description || '-'}</p>
                        <div class="flex justify-between items-center mt-3">
                            <span class="text-[10px] uppercase font-bold opacity-40"><i class="fas fa-users mr-1"></i> ${r.capacity} ท่าน</span>
                            <div class="flex gap-1">
                                ${canManage ? `<button class="btn btn-ghost btn-xs" onclick='showRoomDetails(${JSON.stringify(r)})'><i class="fas fa-cog text-primary"></i></button>` : ''}
                                <button class="btn btn-primary btn-sm rounded-xl px-4" onclick='showBookingModal("${new Date().toISOString().slice(0,10)}", ${r.id})'>จองเลย</button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function showRoomDetails(room = null) {
    const isAdmin = user?.role === 'admin';
    const canManage = ['admin', 'approver', 'staff'].includes(user?.role);
    let photosHtml = '';

    if (room?.id) {
        const fresh = await apiFetch(`api/rooms.php?id=${room.id}`);
        photosHtml = `
            <div class="mt-4 border-t pt-4">
                <h4 class="text-xs font-bold mb-2 uppercase opacity-50">รูปภาพประกอบ</h4>
                <div class="grid grid-cols-4 gap-2 mb-4">
                    ${(fresh.photos || []).map(p => `<div class="relative group"><img src="${p.file_path}" class="w-full h-12 object-cover rounded-lg">${isAdmin ? `<button onclick="deleteRoomPhoto(${p.id}, ${room.id})" class="btn btn-error btn-xs btn-circle absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">×</button>` : ''}</div>`).join('')}
                </div>
                ${canManage ? `
                    <div id="drop-zone" class="border-2 border-dashed border-base-300 rounded-2xl p-6 text-center hover:bg-primary/5 hover:border-primary transition-all cursor-pointer">
                        <input type="file" id="file-input" class="hidden" accept="image/jpeg,image/png,image/webp" onchange="handleFileUpload(this.files, ${room.id})">
                        <i class="fas fa-cloud-upload-alt text-2xl opacity-20 mb-1"></i>
                        <div class="text-[10px] font-bold">อัปโหลดรูปภาพ</div>
                    </div>` : ''}
            </div>`;
    }

    const { value: res } = await Swal.fire({
        ...swalConfig, title: room ? 'แก้ไขห้อง' : 'เพิ่มห้องใหม่', width: '500px',
        html: `<div class="text-left space-y-3">
            <div class="form-control"><label class="label text-xs font-bold opacity-50 uppercase">ชื่อห้อง</label><input id="swal-n" class="input input-bordered w-full" value="${room ? escapeHtml(room.name) : ''}"></div>
            <div class="form-control"><label class="label text-xs font-bold opacity-50 uppercase">รายละเอียด</label><textarea id="swal-d" class="textarea textarea-bordered w-full">${room ? escapeHtml(room.description) : ''}</textarea></div>
            <div class="grid grid-cols-2 gap-2">
                <div class="form-control"><label class="label text-xs font-bold opacity-50 uppercase">ความจุ (คน)</label><input id="swal-c" type="number" class="input input-bordered w-full" value="${room ? room.capacity : ''}"></div>
                <div class="form-control"><label class="label text-xs font-bold opacity-50 uppercase">ราคา 4 ชม.</label><input id="swal-r4" type="number" class="input input-bordered w-full" value="${room ? (room.rate_4h || 0) : 0}"></div>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div class="form-control"><label class="label text-xs font-bold opacity-50 uppercase">ราคา 8 ชม.</label><input id="swal-r8" type="number" class="input input-bordered w-full" value="${room ? (room.rate_8h || 0) : 0}"></div>
            </div>
            ${photosHtml}
        </div>`,
        didOpen: () => {
            const dz = document.getElementById('drop-zone');
            if (dz) dz.onclick = () => document.getElementById('file-input').click();
        },
        showCancelButton: true, confirmButtonText: 'บันทึก', cancelButtonText: 'ยกเลิก',
        preConfirm: () => ({ id: room?.id, name: document.getElementById('swal-n').value, description: document.getElementById('swal-d').value, capacity: document.getElementById('swal-c').value, rate_4h: document.getElementById('swal-r4').value, rate_8h: document.getElementById('swal-r8').value })
    });

    if (res && isAdmin) { await apiFetch('api/rooms_manage.php', { method: 'POST', body: JSON.stringify(res) }); renderRooms(); }
}

async function handleFileUpload(files, roomId) {
    if (!files[0]) return;
    const fd = new FormData(); fd.append('photo', files[0]); fd.append('room_id', roomId);
    try {
        const res = await fetch('api/upload.php', { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Upload failed');
        showToast('success', 'อัปโหลดสำเร็จ');
        Swal.close(); renderRooms();
    } catch (e) { showToast('error', e.message); }
}

async function initCalendar() {
    const el = document.getElementById('calendar'); if (!el) return;
    
    // Thai Holidays 2026 (Background Events)
    const holidays = [
        { title: 'วันขึ้นปีใหม่', start: '2026-01-01', display: 'background', color: '#fee2e2' },
        { title: 'วันมาฆบูชา', start: '2026-03-03', display: 'background', color: '#fee2e2' },
        { title: 'วันจักรี', start: '2026-04-06', display: 'background', color: '#fee2e2' },
        { title: 'วันสงกรานต์', start: '2026-04-13', end: '2026-04-16', display: 'background', color: '#fee2e2' },
        { title: 'วันแรงงาน', start: '2026-05-01', display: 'background', color: '#fee2e2' },
        { title: 'วันฉัตรมงคล', start: '2026-05-04', display: 'background', color: '#fee2e2' },
        { title: 'วันวิสาขบูชา', start: '2026-05-31', display: 'background', color: '#fee2e2' },
        { title: 'วันเฉลิมพระชนมพรรษา ร.10', start: '2026-07-28', display: 'background', color: '#fee2e2' },
        { title: 'วันแม่แห่งชาติ', start: '2026-08-12', display: 'background', color: '#fee2e2' },
        { title: 'วันคล้ายวันสวรรคต ร.9', start: '2026-10-13', display: 'background', color: '#fee2e2' },
        { title: 'วันปิยมหาราช', start: '2026-10-23', display: 'background', color: '#fee2e2' },
        { title: 'วันพ่อแห่งชาติ', start: '2026-12-05', display: 'background', color: '#fee2e2' },
        { title: 'วันรัฐธรรมนูญ', start: '2026-12-10', display: 'background', color: '#fee2e2' },
        { title: 'วันสิ้นปี', start: '2026-12-31', display: 'background', color: '#fee2e2' }
    ];

    calendar = new FullCalendar.Calendar(el, { 
        initialView: 'dayGridMonth', 
        events: (info, success, failure) => {
            fetch('api/bookings.php').then(r => r.json()).then(data => {
                success([...data, ...holidays]);
            }).catch(failure);
        },
        firstDay: 1, // Start week on Monday
        dateClick: (i) => {
            if (!user) { showLoginModal(); return; }
            
            const selectedDate = new Date(i.dateStr);
            const today = new Date();
            today.setHours(0,0,0,0);
            
            const minDate = new Date();
            minDate.setDate(minDate.getDate() + 3);
            minDate.setHours(0,0,0,0);

            if (selectedDate < today) {
                showToast('error', 'ไม่สามารถจองวันที่ย้อนหลังได้ครับ');
                return;
            }
            if (selectedDate < minDate) {
                showToast('error', 'ต้องจองล่วงหน้าอย่างน้อย 3 วันครับ');
                return;
            }
            showBookingModal(i.dateStr);
        },
        eventClick: (i) => showEventDetails(i.event) 
    });
    calendar.render();
}

async function injectRoomPhotos(roomId, containerId) {
    const r = await apiFetch(`api/rooms.php?id=${roomId}`);
    const container = document.getElementById(containerId);
    if (!container) return r;

    const defaultImg = 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=800&auto=format&fit=crop';
    const photos = (r.photos && r.photos.length > 0) ? r.photos : [{file_path: r.main_photo || defaultImg}];
    
    container.innerHTML = `
        <div class="relative w-full h-full">
            <div class="carousel w-full h-full snap-x snap-mandatory overflow-x-hidden flex" id="${containerId}-inner">
                ${photos.map((p, i) => `
                    <div class="carousel-item relative min-w-full h-full snap-start flex items-center justify-center bg-black">
                        <img src="${p.file_path}" class="w-full h-full object-cover" />
                        <div class="absolute bottom-2 right-2 badge badge-sm bg-black/50 text-white border-0 font-bold text-[9px]">${i+1}/${photos.length}</div>
                    </div>
                `).join('')}
            </div>
            ${photos.length > 1 ? `
                <div class="absolute top-1/2 -translate-y-1/2 left-2 right-2 flex justify-between pointer-events-none">
                    <button class="btn btn-circle btn-xs bg-white/80 border-0 pointer-events-auto shadow hover:bg-white" onclick="const el = document.getElementById('${containerId}-inner'); el.scrollBy({left: -el.offsetWidth, behavior: 'smooth'})">❮</button>
                    <button class="btn btn-circle btn-xs bg-white/80 border-0 pointer-events-auto shadow hover:bg-white" onclick="const el = document.getElementById('${containerId}-inner'); el.scrollBy({left: el.offsetWidth, behavior: 'smooth'})">❯</button>
                </div>
            ` : ''}
        </div>
    `;
    return r;
}

async function showBookingModal(date, targetRoomId = null) {
    const rooms = await apiFetch('api/rooms.php');
    
    window.calc = async () => {
        const roomId = document.getElementById('b-r').value;
        const r = await injectRoomPhotos(roomId, 'room-photos-carousel');

        document.getElementById('room-info-box').innerHTML = `
            <div class="flex justify-between items-center mb-1">
                <span class="font-black text-primary text-sm uppercase italic">${r.name}</span>
                <span class="badge badge-sm badge-outline opacity-50 font-bold">ความจุ: ${r.capacity} ท่าน</span>
            </div>
        `;

        // Check role: automatically set user_type from profile
        const userType = user?.user_type || 'internal';
        const typeSelect = document.getElementById('b-g');
        typeSelect.value = userType;

        const g = typeSelect.value;
        const d = document.getElementById('b-d').value;
        const multiplier = { external: 1.0, gov: 0.6, internal: 0.5 }[g];
        let total = (d === '4h' ? parseFloat(r.rate_4h) : parseFloat(r.rate_8h)) * multiplier;
        
        if (document.getElementById('eq-p')?.checked) total += 1000;
        if (document.getElementById('eq-s')?.checked) total += 500;
        if (document.getElementById('eq-pod')?.checked) total += 300;
        
        const snackQty = parseInt(document.getElementById('sn-q')?.value || 0);
        const snackMat = document.getElementById('sn-m')?.value;
        if (snackMat === 'ceramic') total += (snackQty <= 30 ? 150 : 200);
        else if (snackMat === 'melamine') {
            if (snackQty <= 30) total += 100;
            else if (snackQty <= 50) total += 150;
            else total += 200;
        }

        document.getElementById('p-est').innerHTML = `
            <div class="bg-primary text-primary-content p-3 rounded-2xl flex justify-between items-center shadow-lg shadow-primary/20 animate-in zoom-in duration-300">
                <div class="flex flex-col">
                    <span class="text-[9px] font-black opacity-70 uppercase">ประมาณการยอดชำระ</span>
                    <span class="text-xl font-black">฿${total.toLocaleString()}</span>
                </div>
                <div class="text-[9px] bg-white/20 px-2 py-1 rounded-lg font-black italic uppercase">มัดจำ ๕๐%: ฿${(total * 0.5).toLocaleString()}</div>
            </div>
        `;
    };

    const { value: v } = await Swal.fire({
        ...swalConfig, title: 'จองห้องประชุม', width: '580px', showCancelButton: true, cancelButtonText: 'ยกเลิก', confirmButtonText: 'ยืนยันการจอง',
        html: `<div class="text-left space-y-3">
            <div id="room-photos-carousel" class="relative rounded-2xl border border-base-300 h-48 bg-base-200 overflow-hidden shadow-inner"></div>
            <div id="room-info-box" class="px-1"></div>
            <div class="grid grid-cols-2 gap-3">
                <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">เลือกห้อง</span></label><select id="b-r" class="select select-bordered select-sm font-black text-xs" onchange="calc()">${rooms.map(r => `<option value="${r.id}" ${targetRoomId == r.id ? 'selected' : ''}>${r.name}</option>`).join('')}</select></div>
                <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">หัวข้อโครงการ</span></label><input id="b-t" class="input input-bordered input-sm font-black text-xs" placeholder="ระบุชื่องาน"></div>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">ประเภทผู้จอง (จาก Role)</span></label><select id="b-g" class="select select-bordered select-sm text-xs font-bold" disabled><option value="external">บุคคลภายนอก (๑๐๐%)</option><option value="gov">หน่วยงานราชการ (๖๐%)</option><option value="internal">บุคลากรภายใน (๕๐%)</option></select></div>
                <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">ระยะเวลา</span></label><select id="b-d" class="select select-bordered select-sm text-xs font-bold" onchange="calc()"><option value="4h">ครึ่งวัน (๔ ชม.)</option><option value="8h">เต็มวัน (๘ ชม.)</option></select></div>
            </div>
            <div class="divider text-[9px] opacity-30 my-0 uppercase font-black text-primary tracking-widest">บริการเสริม (Add-ons)</div>
            <div class="grid grid-cols-3 gap-2">
                <label class="label cursor-pointer bg-base-200/50 px-2 py-1 rounded-xl border border-base-300/50"><span class="label-text text-[9px] font-bold opacity-60">โปรเจคเตอร์</span><input type="checkbox" id="eq-p" class="checkbox checkbox-primary checkbox-xs" onchange="calc()"></label>
                <label class="label cursor-pointer bg-base-200/50 px-2 py-1 rounded-xl border border-base-300/50"><span class="label-text text-[9px] font-bold opacity-60">ชุดโซฟา</span><input type="checkbox" id="eq-s" class="checkbox checkbox-primary checkbox-xs" onchange="calc()"></label>
                <label class="label cursor-pointer bg-base-200/50 px-2 py-1 rounded-xl border border-base-300/50"><span class="label-text text-[9px] font-bold opacity-60">โพเดียม</span><input type="checkbox" id="eq-pod" class="checkbox checkbox-primary checkbox-xs" onchange="calc()"></label>
            </div>
            <div class="grid grid-cols-2 gap-3 items-end">
                <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">จำนวนอาหารว่าง</span></label><input type="number" id="sn-q" class="input input-bordered input-sm w-full text-center font-bold" value="0" onchange="calc()"></div>
                <select id="sn-m" class="select select-bordered select-sm text-xs" onchange="calc()"><option value="none">ไม่รับอาหารว่าง</option><option value="ceramic">วัสดุกระเบื้อง</option><option value="melamine">วัสดุเมลามีน</option></select>
            </div>
            <div id="p-est" class="pt-1"></div>
            <div class="grid grid-cols-2 gap-3">
                <input id="b-s" type="datetime-local" class="input input-bordered input-sm text-xs font-bold" value="${date}T09:00">
                <input id="b-e" type="datetime-local" class="input input-bordered input-sm text-xs font-bold" value="${date}T12:00">
            </div>
        </div>`,
        didOpen: () => window.calc(),
        preConfirm: () => {
            const title = document.getElementById('b-t').value;
            if (!title) { Swal.showValidationMessage('กรุณาระบุหัวข้อโครงการ'); return false; }
            return {
                room_id: document.getElementById('b-r').value, title: title, start_time: document.getElementById('b-s').value, end_time: document.getElementById('b-e').value,
                user_type: document.getElementById('b-g').value, equip_projector: document.getElementById('eq-p').checked ? 1 : 0, equip_sofa: document.getElementById('eq-s').checked ? 1 : 0, equip_podium: document.getElementById('eq-pod').checked ? 1 : 0,
                snack_qty: document.getElementById('sn-q').value, snack_material: document.getElementById('sn-m').value, purpose_type: 'meeting'
            };
        }
    });

    if (v) {
        try {
            toggleLoading(true);
            await apiFetch('api/bookings.php', { method: 'POST', body: JSON.stringify(v) });
            showToast('success', 'ส่งคำขอจองเรียบร้อยแล้ว');
            calendar.refetchEvents();
        } catch (e) {} finally { toggleLoading(false); }
    }
}

async function showEventDetails(event) {
    const p = event.extendedProps;
    const isAdmin = ['admin', 'approver', 'staff'].includes(user?.role);
    const isOwner = p.user_id == user?.id;
    
    let adminHtml = isAdmin ? `
        <div class="divider text-[10px] opacity-30 uppercase font-black tracking-tighter">Admin Panel (ใบขอใช้สถานที่)</div>
        <div class="grid grid-cols-2 gap-2">
            <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[9px] font-black uppercase opacity-40">เลขรับ (Doc Ref)</span></label><input id="a-ref" class="input input-bordered input-sm font-bold text-xs" value="${p.doc_ref_no || ''}"></div>
            <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[9px] font-black uppercase opacity-40">เลขใบเสร็จ (Receipt)</span></label><input id="a-rec" class="input input-bordered input-sm font-bold text-xs" value="${p.receipt_no || ''}"></div>
        </div>
        <div class="grid grid-cols-2 gap-2 mt-2">
            <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[9px] font-black uppercase opacity-40">ค่าตอบแทนผู้ปฏิบัติงาน</span></label><input id="e-staff" type="number" class="input input-bordered input-sm font-bold text-xs" value="${p.extra_services?.staff_fee || 0}"></div>
            <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[9px] font-black uppercase opacity-40">ค่าเช่าโต๊ะจีน/อื่นๆ</span></label><input id="e-table" type="number" class="input input-bordered input-sm font-bold text-xs" value="${p.extra_services?.table_fee || 0}"></div>
        </div>
        <div class="grid grid-cols-2 gap-2 mt-2">
            <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[9px] font-black uppercase opacity-40">Total Amount</span></label><input id="a-t" type="number" class="input input-bordered input-sm font-bold text-xs" value="${p.total_amount || 0}"></div>
            <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[9px] font-black uppercase opacity-40">Deposit (50%)</span></label><input id="a-d" type="number" class="input input-bordered input-sm font-bold text-xs" value="${p.deposit_amount || 0}"></div>
        </div>
        <button onclick="updateAdmin(${event.id})" class="btn btn-success btn-sm btn-block mt-3 rounded-2xl font-black uppercase shadow-lg shadow-success/20">Verify & Approve</button>
    ` : '';

    let userActions = '';
    if (isAdmin || (isOwner && p.status === 'approved')) {
        userActions += `
            <a href="api/export.php?id=${event.id}&type=invoice" target="_blank" class="btn btn-outline btn-sm flex-1 rounded-2xl text-[10px] font-black uppercase tracking-tight">
                <i class="fas fa-file-pdf mr-1 text-primary"></i> Confirmation / Invoice
            </a>
        `;
    }
    
    if (isOwner && p.status === 'pending') {
        userActions += `
            <button onclick="cancelBooking(${event.id})" class="btn btn-error btn-sm btn-outline flex-1 rounded-2xl text-[10px] font-black uppercase tracking-tight">
                <i class="fas fa-times-circle mr-1"></i> ยกเลิกการจอง
            </a>
        `;
    }

    Swal.fire({
        ...swalConfig, 
        title: 'รายละเอียดการจอง', 
        width: '480px',
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: 'ปิดหน้าต่าง',
        html: `
            <div class="text-left space-y-4">
                <div id="details-photos-carousel" class="relative rounded-2xl border border-base-300 h-40 bg-base-200 overflow-hidden shadow-inner"></div>
                
                <div class="bg-base-200/50 p-4 rounded-3xl border border-base-300/50 relative overflow-hidden">
                    <div class="relative z-10">
                        <h3 class="text-lg font-black text-primary leading-tight mb-2">${event.title}</h3>
                        <div class="grid grid-cols-2 gap-y-2 text-[11px]">
                            <div class="opacity-50 font-bold uppercase">สถานที่:</div><div class="font-black text-right">${p.room_name}</div>
                            <div class="opacity-50 font-bold uppercase">ผู้จอง:</div><div class="font-black text-right">${p.fullname || p.username}</div>
                            <div class="opacity-50 font-bold uppercase">สถานะ:</div><div class="text-right"><span class="badge badge-sm ${p.status === 'approved' ? 'badge-success' : 'badge-warning'} uppercase font-black text-[9px] px-3 border-0">${p.status}</span></div>
                        </div>
                    </div>
                </div>

                <div class="space-y-1 px-1">
                    <div class="flex items-center justify-between text-[11px]"><div class="flex items-center gap-2"><i class="fas fa-clock w-4 text-primary"></i> <span class="opacity-50">เริ่ม:</span></div> <span class="font-bold">${new Date(p.start_time).toLocaleString('th-TH')}</span></div>
                    <div class="flex items-center justify-between text-[11px]"><div class="flex items-center gap-2"><i class="fas fa-clock w-4 text-secondary"></i> <span class="opacity-50">สิ้นสุด:</span></div> <span class="font-bold">${new Date(p.end_time).toLocaleString('th-TH')}</span></div>
                </div>

                ${p.total_amount > 0 ? `
                    <div class="bg-primary/5 p-4 rounded-3xl border border-primary/10 flex justify-between items-center">
                        <div>
                            <div class="text-[9px] font-black uppercase opacity-40 leading-none">Total Payment</div>
                            <div class="text-xl font-black text-primary leading-none mt-1">฿${Number(p.total_amount).toLocaleString()}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-[9px] font-black uppercase opacity-40 leading-none">Deposit 50%</div>
                            <div class="text-sm font-bold text-primary opacity-70 leading-none mt-1">฿${Number(p.deposit_amount).toLocaleString()}</div>
                        </div>
                    </div>
                ` : ''}

                ${adminHtml}
                ${userActions ? `<div class="divider text-[9px] opacity-20 uppercase font-bold">Actions</div><div class="flex flex-col gap-2">${userActions}</div>` : ''}
            </div>
        `,
        didOpen: () => injectRoomPhotos(p.room_id, 'details-photos-carousel')
    });
}

async function updateAdmin(id) {
    const data = {
        id,
        status: 'approved',
        total_amount: document.getElementById('a-t').value,
        deposit_amount: document.getElementById('a-d').value,
        doc_ref_no: document.getElementById('a-ref').value,
        receipt_no: document.getElementById('a-rec').value,
        extra_services: {
            staff_fee: document.getElementById('e-staff').value,
            table_fee: document.getElementById('e-table').value
        }
    };
    await apiFetch('api/bookings.php', { method: 'PATCH', body: JSON.stringify(data) });
    Swal.close(); calendar.refetchEvents();
}

async function showLoginModal() {
    const { value: v, isDenied } = await Swal.fire({ 
        ...swalConfig, 
        title: 'Login', 
        html: `<input id="l-u" class="input input-bordered w-full mb-2" placeholder="Username"><input id="l-p" type="password" class="input input-bordered w-full" placeholder="Password">`, 
        showDenyButton: true,
        denyButtonText: 'สมัครสมาชิก (Register)',
        confirmButtonText: 'เข้าสู่ระบบ',
        preConfirm: () => ({ username: document.getElementById('l-u').value, password: document.getElementById('l-p').value }) 
    });
    
    if (isDenied) {
        showRegisterModal();
        return;
    }

    if (v) { 
        await apiFetch('api/auth.php?action=login', { method: 'POST', body: JSON.stringify(v) }); 
        location.reload(); 
    }
}

async function logout() { await apiFetch('api/auth.php?action=logout'); location.reload(); }

function setupEventListeners() {}
async function renderStats() {
    const container = document.getElementById('stats-container');
    container.innerHTML = `<div class="flex items-center justify-center p-20"><span class="loading loading-spinner loading-lg text-primary"></span></div>`;
    try {
        const stats = await apiFetch('api/stats.php');
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div class="stats shadow bg-base-100 border border-base-200"><div class="stat"><div class="stat-title text-[10px] font-black uppercase opacity-50 text-primary">Total Rooms</div><div class="stat-value text-primary">${stats.summary.total_rooms}</div></div></div>
                <div class="stats shadow bg-base-100 border border-base-200"><div class="stat"><div class="stat-title text-[10px] font-black uppercase opacity-50 text-secondary">Total Bookings</div><div class="stat-value text-secondary">${stats.summary.total_bookings}</div></div></div>
                <div class="stats shadow bg-base-100 border border-base-200"><div class="stat"><div class="stat-title text-[10px] font-black uppercase opacity-50 text-success">Verified Revenue</div><div class="stat-value text-success text-2xl">฿${Number(stats.revenue_by_user_type.reduce((a,b)=>a+(parseFloat(b.total)||0), 0)).toLocaleString()}</div></div></div>
                <div class="stats shadow bg-base-100 border border-base-200"><div class="stat"><div class="stat-title text-[10px] font-black uppercase opacity-50 text-accent">LINE Connected</div><div class="stat-value text-accent">${stats.summary.line_linked_users}</div></div></div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div class="card bg-base-100 shadow-xl border border-base-200"><div class="card-body"><h2 class="card-title text-xs font-black uppercase opacity-40">Payment Status</h2><div class="h-64"><canvas id="chart-payments"></canvas></div></div></div>
                <div class="card bg-base-100 shadow-xl border border-base-200"><div class="card-body"><h2 class="card-title text-xs font-black uppercase opacity-40">Revenue by User Type</h2><div class="h-64"><canvas id="chart-user-type"></canvas></div></div></div>
            </div>
        `;
        new Chart(document.getElementById('chart-payments'), { type: 'doughnut', data: { labels: stats.payment_status_dist.map(d => d.payment_status.toUpperCase()), datasets: [{ data: stats.payment_status_dist.map(d => d.count), backgroundColor: ['#fbbf24', '#34d399', '#f87171', '#60a5fa'] }] }, options: { maintainAspectRatio: false } });
        new Chart(document.getElementById('chart-user-type'), { type: 'pie', data: { labels: stats.revenue_by_user_type.map(d => d.user_type.toUpperCase()), datasets: [{ data: stats.revenue_by_user_type.map(d => d.total), backgroundColor: ['#60a5fa', '#a78bfa', '#f472b6'] }] }, options: { maintainAspectRatio: false } });
    } catch (e) { container.innerHTML = `<div class="alert alert-error">${e.message}</div>`; }
}

async function renderUserManagement() {
    const container = document.getElementById('users-table-container');
    container.innerHTML = '<div class="p-8 text-center"><span class="loading loading-spinner loading-lg text-primary"></span></div>';
    try {
        const users = await apiFetch('api/users.php');
        let html = '<table class="table table-zebra w-full"><thead><tr class="bg-base-200 uppercase text-[10px] font-black"><th>User</th><th>Role</th><th>Type</th><th>Status</th><th>Org/Dept</th><th>Actions</th></tr></thead><tbody>';
        users.forEach(u => {
            html += `<tr><td><div class="font-bold">${u.username}</div><div class="text-[10px] opacity-50">${u.fullname || '-'}</div></td>
                <td><select class="select select-xs select-bordered w-full" onchange="updateUser(${u.id}, {role: this.value})"><option value="user" ${u.role==='user'?'selected':''}>User</option><option value="staff" ${u.role==='staff'?'selected':''}>Staff</option><option value="approver" ${u.role==='approver'?'selected':''}>Approver</option><option value="admin" ${u.role==='admin'?'selected':''}>Admin</option></select></td>
                <td>
                    <select class="select select-xs select-bordered w-full" onchange="updateUser(${u.id}, {user_type: this.value})">
                        <option value="internal" ${u.user_type==='internal'?'selected':''}>Internal (50%)</option>
                        <option value="gov" ${u.user_type==='gov'?'selected':''}>Government (60%)</option>
                        <option value="external" ${u.user_type==='external'?'selected':''}>External (100%)</option>
                    </select>
                </td>
                <td><select class="select select-xs select-bordered w-full" onchange="updateUser(${u.id}, {status: this.value})"><option value="pending" ${u.status==='pending'?'selected':''}>Pending</option><option value="active" ${u.status==='active'?'selected':''}>Active</option><option value="inactive" ${u.status==='inactive'?'selected':''}>Inactive</option></select></td>
                <td class="text-[10px] opacity-70">${u.organization || u.department || '-'}</td>
                <td><button class="btn btn-square btn-ghost btn-xs text-error" onclick="deleteUser(${u.id})"><i class="fas fa-trash"></i></button></td></tr>`;
        });
        container.innerHTML = html + '</tbody></table>';
    } catch (e) { container.innerHTML = `<div class="alert alert-error">${e.message}</div>`; }
}

async function updateUser(id, data) { try { await apiFetch('api/users.php', { method: 'PATCH', body: JSON.stringify({ id, ...data }) }); showToast('success', 'User updated'); } catch (e) { showToast('error', e.message); } }
async function deleteUser(id) { if (!confirm('Are you sure?')) return; try { await apiFetch(`api/users.php?id=${id}`, { method: 'DELETE' }); showToast('success', 'User deleted'); renderUserManagement(); } catch (e) { showToast('error', e.message); } }

async function renderMyBookings() {
    const container = document.getElementById('my-bookings-container');
    container.innerHTML = '<div class="p-8 text-center"><span class="loading loading-spinner loading-lg"></span></div>';
    try {
        const bookings = await apiFetch('api/bookings.php?mine=1');
        let html = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
        bookings.forEach(b => {
            const statusClass = b.status === 'approved' ? 'badge-success' : (b.status === 'pending' ? 'badge-warning' : 'badge-error');
            html += `<div class="card bg-base-100 shadow-sm border border-base-300"><div class="card-body p-4"><div class="flex justify-between items-start mb-2"><h3 class="font-bold text-sm">${b.title}</h3><span class="badge badge-sm ${statusClass} uppercase font-black text-[9px]">${b.status}</span></div><div class="text-[10px] opacity-70 flex flex-col gap-1"><div><i class="fas fa-door-open w-4"></i> ${b.room_name}</div><div><i class="fas fa-clock w-4"></i> ${b.start} - ${b.end}</div></div>${b.status === 'pending' ? `<div class="card-actions justify-end mt-4"><button class="btn btn-error btn-xs btn-outline rounded-lg" onclick="cancelBooking(${b.id})">Cancel</button></div>` : ''}</div></div>`;
        });
        container.innerHTML = html + '</div>';
    } catch (e) { container.innerHTML = `<div class="alert alert-error">${e.message}</div>`; }
}

async function cancelBooking(id) { if (!confirm('ต้องการยกเลิกการจองนี้ใช่หรือไม่?')) return; try { await apiFetch(`api/bookings.php?id=${id}`, { method: 'DELETE' }); showToast('success', 'ยกเลิกการจองเรียบร้อยแล้ว'); if (calendar) calendar.refetchEvents(); if (document.getElementById('my-bookings-section').style.display !== 'none') renderMyBookings(); Swal.close(); } catch (e) { showToast('error', e.message); } }

function deleteRoomPhoto(pid, rid) { if (!confirm('ลบรูปภาพนี้?')) return; apiFetch(`api/rooms_manage.php?action=delete_photo&id=${pid}`, { method: 'DELETE' }).then(() => { showToast('success', 'ลบรูปภาพแล้ว'); Swal.close(); apiFetch('api/rooms.php').then(rooms => showRoomDetails(rooms.find(r => r.id == rid))); }); }

window.quickLogin = async function(role) { try { toggleLoading(true); await apiFetch('api/dev_login.php', { method: 'POST', body: JSON.stringify({ role }) }); setTimeout(() => location.reload(), 500); } catch (e) { showToast('error', 'Login failed'); } finally { toggleLoading(false); } }
window.switchLang = function(lang) { localStorage.setItem('lang', lang); location.reload(); }

async function renderLogs() {
    const container = document.getElementById('logs-table-container');
    container.innerHTML = '<div class="p-8 text-center"><span class="loading loading-spinner loading-lg"></span></div>';
    try {
        const logs = await apiFetch('api/logs.php');
        let html = '<table class="table table-zebra w-full"><thead><tr class="bg-base-200 text-[10px] font-black"><th>Time</th><th>User</th><th>Action</th><th>Details</th><th>IP</th></tr></thead><tbody>';
        logs.forEach(l => { html += `<tr><td class="text-[10px]">${l.created_at}</td><td class="font-bold text-[10px]">${l.username || 'System'}</td><td><span class="badge badge-outline badge-xs text-[9px] uppercase font-bold">${l.action}</span></td><td class="text-[10px] opacity-70">${l.details || '-'}</td><td class="text-[9px] opacity-30">${l.ip_address}</td></tr>`; });
        container.innerHTML = html + '</tbody></table>';
    } catch (e) { container.innerHTML = `<div class="alert alert-error">${e.message}</div>`; }
}

async function renderSettings() {
    try {
        const settings = await apiFetch('api/settings.php');
        const form = document.getElementById('settings-form');
        if (!form) return;
        if (settings.telegram_bot_token) form.querySelector('[name="telegram_bot_token"]').value = settings.telegram_bot_token;
        if (settings.telegram_chat_id) form.querySelector('[name="telegram_chat_id"]').value = settings.telegram_chat_id;
        if (settings.smtp_host) form.querySelector('[name="smtp_host"]').value = settings.smtp_host;
        if (settings.smtp_user) form.querySelector('[name="smtp_user"]').value = settings.smtp_user;
        if (!form.dataset.listened) { form.addEventListener('submit', async (e) => { e.preventDefault(); const data = Object.fromEntries(new FormData(form).entries()); try { await apiFetch('api/settings.php', { method: 'POST', body: JSON.stringify(data) }); showToast('success', 'Settings saved'); } catch (err) { showToast('error', err.message); } }); form.dataset.listened = 'true'; }
    } catch (e) {}
}

window.cancelSettings = function() { if(confirm('ยกเลิก?')) renderSettings(); }

async function renderMasterData() {
    const container = document.getElementById('master-container');
    container.innerHTML = '<div class="p-8 text-center"><span class="loading loading-spinner loading-lg"></span></div>';
    try {
        const data = await apiFetch('api/master_data.php');
        const depts = data.departments || [];
        const pos = data.positions || [];
        
        container.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="card bg-base-100 shadow-sm border border-base-300"><div class="card-body">
                <h3 class="card-title justify-between text-xs font-black uppercase opacity-40">สังกัด/แผนก <button class="btn btn-primary btn-xs" onclick="addMasterData('dept')">+ เพิ่ม</button></h3>
                <table class="table table-xs"><tbody>
                    ${depts.length ? depts.map(d => `<tr><td class="text-xs font-bold">${d.name}</td><td class="text-right"><button class="btn btn-ghost btn-xs text-error" onclick="deleteMasterData('dept', ${d.id})">×</button></td></tr>`).join('') : '<tr><td class="opacity-30 italic text-center p-4">ไม่มีข้อมูล</td></tr>'}
                </tbody></table>
            </div></div>
            <div class="card bg-base-100 shadow-sm border border-base-300"><div class="card-body">
                <h3 class="card-title justify-between text-xs font-black uppercase opacity-40">ตำแหน่ง <button class="btn btn-primary btn-xs" onclick="addMasterData('pos')">+ เพิ่ม</button></h3>
                <table class="table table-xs"><tbody>
                    ${pos.length ? pos.map(p => `<tr><td class="text-xs font-bold">${p.name}</td><td class="text-right"><button class="btn btn-ghost btn-xs text-error" onclick="deleteMasterData('pos', ${p.id})">×</button></td></tr>`).join('') : '<tr><td class="opacity-30 italic text-center p-4">ไม่มีข้อมูล</td></tr>'}
                </tbody></table>
            </div></div>
        </div>`;
    } catch (e) { 
        console.error('Master Data Error:', e);
        container.innerHTML = `<div class="alert alert-error">ไม่สามารถดึงข้อมูลพื้นฐานได้: ${e.message}</div>`;
    }
}

async function addMasterData(type) { const { value: name } = await Swal.fire({ ...swalConfig, title: `เพิ่ม${type==='dept'?'สังกัด':'ตำแหน่ง'}`, input: 'text', showCancelButton: true, cancelButtonText: 'ยกเลิก', confirmButtonText: 'บันทึก' }); if (name) { await apiFetch('api/master_data.php', { method: 'POST', body: JSON.stringify({ type, name }) }); renderMasterData(); } }
async function deleteMasterData(type, id) { if (!confirm('ยืนยันการลบ?')) return; await apiFetch(`api/master_data.php?type=${type}&id=${id}`, { method: 'DELETE' }); renderMasterData(); }

async function renderMaintenance() {
    checkSystemHealth();
    const container = document.getElementById('recent-backups-container');
    container.innerHTML = '<span class="loading loading-spinner loading-xs"></span>';
    try {
        const backups = await apiFetch('api/admin_tools.php?action=list_backups');
        if (backups.length === 0) {
            container.innerHTML = '<div class="opacity-40 italic">No backups found</div>';
        } else {
            container.innerHTML = backups.map(b => `
                <div class="flex justify-between items-center bg-base-200 p-2 rounded-lg">
                    <div class="flex flex-col">
                        <span class="font-bold truncate max-w-[150px]">${b.filename}</span>
                        <span class="opacity-50">${b.date}</span>
                    </div>
                    <span class="badge badge-ghost font-bold">${b.size}</span>
                </div>
            `).join('');
        }
    } catch (e) { container.innerHTML = '<div class="text-error">Failed to load backups</div>'; }
}

async function checkSystemHealth() {
    const container = document.getElementById('health-status-container');
    try {
        const h = await apiFetch('api/health.php');
        container.innerHTML = `
            <div class="flex items-center justify-between"><span class="font-bold opacity-60">Database:</span> <span class="badge badge-success badge-sm font-black">ONLINE</span></div>
            <div class="flex items-center justify-between"><span class="font-bold opacity-60">PHP Version:</span> <span class="font-black">${h.server.php_version}</span></div>
            <div class="flex items-center justify-between"><span class="font-bold opacity-60">OS:</span> <span class="font-black">${h.server.os}</span></div>
            <div class="divider my-1"></div>
            <div class="flex items-center justify-between"><span class="font-bold opacity-60">Disk Usage:</span> <span class="font-black">${h.server.disk.usage_percent}</span></div>
            <div class="w-full bg-base-300 h-2 rounded-full overflow-hidden mt-1"><div class="bg-primary h-full" style="width: ${h.server.disk.usage_percent}"></div></div>
            <div class="text-[9px] opacity-40 text-right">${h.server.disk.free} free of ${h.server.disk.total}</div>
            <div class="divider my-1"></div>
            <div class="grid grid-cols-2 gap-2 text-[10px]">
                <div class="p-2 bg-base-200 rounded-xl flex flex-col items-center">
                    <span class="opacity-50 font-bold uppercase">Uploads</span>
                    <span class="font-black ${h.folders.uploads.writable ? 'text-success' : 'text-error'}">${h.folders.uploads.writable ? 'WRITABLE' : 'LOCKED'}</span>
                </div>
                <div class="p-2 bg-base-200 rounded-xl flex flex-col items-center">
                    <span class="opacity-50 font-bold uppercase">Backups</span>
                    <span class="font-black ${h.folders.backups.writable ? 'text-success' : 'text-error'}">${h.folders.backups.writable ? 'WRITABLE' : 'LOCKED'}</span>
                </div>
            </div>
        `;
    } catch (e) { container.innerHTML = '<div class="alert alert-error">Health Check Failed</div>'; }
}

async function runManualBackup() {
    try {
        toggleLoading(true);
        const res = await apiFetch('api/admin_tools.php?action=backup');
        showToast('success', 'Backup created successfully!');
        renderMaintenance();
    } catch (e) { showToast('error', e.message); }
    finally { toggleLoading(false); }
}

async function showRegisterModal() {
    const master = await apiFetch('api/master_data.php');
    const depts = master.departments || [];
    const pos = master.positions || [];

    const { value: v } = await Swal.fire({
        ...swalConfig,
        title: 'สมัครสมาชิก',
        width: '550px',
        showCancelButton: true,
        cancelButtonText: 'ยกเลิก',
        confirmButtonText: 'ยืนยันการสมัคร',
        html: `
            <div class="text-left space-y-3">
                <div class="grid grid-cols-2 gap-3">
                    <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">Username</span></label><input id="reg-u" class="input input-bordered input-sm font-bold"></div>
                    <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">Password</span></label><input id="reg-p" type="password" class="input input-bordered input-sm font-bold"></div>
                </div>
                <div class="grid grid-cols-4 gap-3">
                    <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">คำนำหน้า</span></label><select id="reg-pre" class="select select-bordered select-sm font-bold text-xs"><option>นาย</option><option>นาง</option><option>นางสาว</option></select></div>
                    <div class="form-control col-span-3"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">ชื่อ-นามสกุล</span></label><input id="reg-f" class="input input-bordered input-sm font-bold"></div>
                </div>
                <div class="divider text-[9px] opacity-30 my-0 uppercase font-black text-primary tracking-widest">ประเภทผู้ใช้งาน</div>
                <div class="flex gap-4 justify-center bg-base-200/50 p-3 rounded-2xl border border-base-300">
                    <label class="label cursor-pointer gap-2"><input type="radio" name="reg-type" value="internal" class="radio radio-primary radio-sm" checked onclick="toggleOrgArea(false)"> <span class="label-text font-bold text-xs">บุคลากรภายใน</span></label>
                    <label class="label cursor-pointer gap-2"><input type="radio" name="reg-type" value="gov" class="radio radio-primary radio-sm" onclick="toggleOrgArea(true)"> <span class="label-text font-bold text-xs">หน่วยงานราชการ</span></label>
                    <label class="label cursor-pointer gap-2"><input type="radio" name="reg-type" value="external" class="radio radio-primary radio-sm" onclick="toggleOrgArea(true)"> <span class="label-text font-bold text-xs">บุคคลภายนอก</span></label>
                </div>
                
                <div id="area-internal" class="grid grid-cols-2 gap-3">
                    <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">สังกัด/แผนก</span></label><select id="reg-d" class="select select-bordered select-sm font-bold text-xs">${depts.map(d => `<option>${d.name}</option>`).join('')}</select></div>
                    <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">ตำแหน่ง</span></label><select id="reg-pos" class="select select-bordered select-sm font-bold text-xs">${pos.map(p => `<option>${p.name}</option>`).join('')}</select></div>
                </div>

                <div id="area-external" class="hidden space-y-3">
                    <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">ชื่อหน่วยงาน/บริษัท (ระบุส่วนบุคคลหากไม่มี)</span></label><input id="reg-org" class="input input-bordered input-sm font-bold"></div>
                    <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">ที่อยู่ที่ติดต่อได้</span></label><textarea id="reg-addr" class="textarea textarea-bordered textarea-sm font-bold h-20"></textarea></div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">เบอร์โทรศัพท์</span></label><input id="reg-ph" class="input input-bordered input-sm font-bold"></div>
                    <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">ID Line</span></label><input id="reg-line" class="input input-bordered input-sm font-bold"></div>
                </div>
                <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">Email (ถ้ามี)</span></label><input id="reg-em" type="email" class="input input-bordered input-sm font-bold"></div>
            </div>
        `,
        preConfirm: () => {
            const utype = document.querySelector('input[name="reg-type"]:checked').value;
            return {
                username: document.getElementById('reg-u').value,
                password: document.getElementById('reg-p').value,
                prefix: document.getElementById('reg-pre').value,
                fullname: document.getElementById('reg-f').value,
                user_type: utype,
                department: utype === 'internal' ? document.getElementById('reg-d').value : '',
                position: utype === 'internal' ? document.getElementById('reg-pos').value : '',
                organization: utype !== 'internal' ? document.getElementById('reg-org').value : '',
                address: utype !== 'internal' ? document.getElementById('reg-addr').value : '',
                phone: document.getElementById('reg-ph').value,
                line_id: document.getElementById('reg-line').value,
                email: document.getElementById('reg-em').value
            }
        }
    });

    if (v) {
        try {
            toggleLoading(true);
            await apiFetch('api/register.php', { method: 'POST', body: JSON.stringify(v) });
            Swal.fire({ ...swalConfig, icon: 'success', title: 'สมัครสมาชิกสำเร็จ!', text: 'กรุณารอเจ้าหน้าที่ตรวจสอบและอนุมัติการใช้งาน' });
        } catch (e) { } finally { toggleLoading(false); }
    }
}

window.toggleOrgArea = (isExternal) => {
    document.getElementById('area-internal').classList.toggle('hidden', isExternal);
    document.getElementById('area-external').classList.toggle('hidden', !isExternal);
}

async function showProfileModal() {
    toggleLoading(true);
    let data;
    try {
        data = await apiFetch('api/profile.php');
        if (!data || !data.profile) throw new Error('Data incomplete');
    } catch (e) {
        console.error('Profile Error:', e);
        showToast('error', 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้: ' + e.message);
        toggleLoading(false);
        return;
    }
    
    toggleLoading(false);

    try {
        const p = data.profile;
        const master = data.master || { departments: [], positions: [] };
        const depts = master.departments || [];
        const pos = master.positions || [];
        
        const type = p.user_type || 'internal';
        const isExternal = ['external', 'gov'].includes(type);

        const deptHtml = depts.map(d => `<option ${p.department===d?'selected':''}>${escapeHtml(d)}</option>`).join('');
        const posHtml = pos.map(item => `<option ${p.position===item?'selected':''}>${escapeHtml(item)}</option>`).join('');

        toggleLoading(false); // Hide loading BEFORE opening the modal

        const { value: v } = await Swal.fire({
            ...swalConfig,
            title: 'แก้ไขข้อมูลส่วนตัว',
            width: '550px',
            showCancelButton: true,
            confirmButtonText: 'บันทึกการเปลี่ยนแปลง',
            html: `
                <div class="text-left space-y-3">
                    <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">Username (เปลี่ยนไม่ได้)</span></label><input class="input input-bordered input-sm font-bold" value="${escapeHtml(p.username)}" disabled></div>
                    <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40 text-primary">รหัสผ่านใหม่ (ปล่อยว่างหากไม่ต้องการเปลี่ยน)</span></label><input id="p-pass" type="password" class="input input-bordered input-sm font-bold" placeholder="••••••••"></div>
                    
                    <div class="grid grid-cols-4 gap-3">
                        <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">คำนำหน้า</span></label><select id="p-pre" class="select select-bordered select-sm font-bold text-xs"><option ${p.prefix==='นาย'?'selected':''}>นาย</option><option ${p.prefix==='นาง'?'selected':''}>นาง</option><option ${p.prefix==='นางสาว'?'selected':''}>นางสาว</option></select></div>
                        <div class="form-control col-span-3"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">ชื่อ-นามสกุล</span></label><input id="p-f" class="input input-bordered input-sm font-bold" value="${escapeHtml(p.fullname)}"></div>
                    </div>

                    ${!isExternal ? `
                        <div class="grid grid-cols-2 gap-3">
                            <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">สังกัด/แผนก</span></label><select id="p-d" class="select select-bordered select-sm font-bold text-xs">${deptHtml}</select></div>
                            <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">ตำแหน่ง</span></label><select id="p-pos" class="select select-bordered select-sm font-bold text-xs">${posHtml}</select></div>
                        </div>
                    ` : `
                        <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">ชื่อหน่วยงาน/บริษัท</span></label><input id="p-org" class="input input-bordered input-sm font-bold" value="${escapeHtml(p.organization)}"></div>
                        <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">ที่อยู่ที่ติดต่อได้</span></label><textarea id="p-addr" class="textarea textarea-bordered textarea-sm font-bold h-20">${escapeHtml(p.address)}</textarea></div>
                    `}

                    <div class="grid grid-cols-2 gap-3">
                        <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">เบอร์โทรศัพท์</span></label><input id="p-ph" class="input input-bordered input-sm font-bold" value="${escapeHtml(p.phone)}"></div>
                        <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">ID Line</span></label><input id="p-line" class="input input-bordered input-sm font-bold" value="${escapeHtml(p.line_id)}"></div>
                    </div>
                    <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">Email</span></label><input id="p-em" type="email" class="input input-bordered input-sm font-bold" value="${escapeHtml(p.email)}"></div>
                </div>
            `,
            preConfirm: () => {
                const res = {
                    new_password: document.getElementById('p-pass').value,
                    prefix: document.getElementById('p-pre').value,
                    fullname: document.getElementById('p-f').value,
                    phone: document.getElementById('p-ph').value,
                    line_id: document.getElementById('p-line').value,
                    email: document.getElementById('p-em').value
                };
                if (!isExternal) {
                    res.department = document.getElementById('p-d').value;
                    res.position = document.getElementById('p-pos').value;
                } else {
                    res.organization = document.getElementById('p-org').value;
                    res.address = document.getElementById('p-addr').value;
                }
                return res;
            }
        });

        if (v) {
            toggleLoading(true);
            await apiFetch('api/profile.php', { method: 'PATCH', body: JSON.stringify(v) });
            showToast('success', 'อัปเดตข้อมูลสำเร็จ!');
            setTimeout(() => location.reload(), 1000);
        }
    } catch (e) {
        showToast('error', e.message);
    } finally {
        toggleLoading(false);
    }
}
