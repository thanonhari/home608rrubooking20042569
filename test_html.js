const p = {
    username: 'test',
    prefix: 'นาย',
    fullname: 'Test',
    user_type: 'external',
    organization: 'Org',
    address: null,
    phone: null,
    line_id: null,
    email: null
};

const master = { departments: ['A'], positions: ['B'] };
const depts = master.departments || [];
const pos = master.positions || [];

const type = p.user_type || 'internal';
const isExternal = ['external', 'gov'].includes(type);

function escapeHtml(text) { if (!text) return ''; const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }; return String(text).replace(/[&<>"']/g, m => map[m]); }

// Pre-generate options to avoid map errors inside template literal
const deptHtml = depts.map(d => `<option ${p.department===d?'selected':''}>${escapeHtml(d)}</option>`).join('');
const posHtml = pos.map(item => `<option ${p.position===item?'selected':''}>${escapeHtml(item)}</option>`).join('');

const html = `
    <div class="text-left space-y-3">
        <div class="form-control"><label class="label p-0 mb-1"><span class="label-text text-[10px] font-black uppercase opacity-40">Username</span></label><input class="input input-bordered input-sm font-bold" value="${escapeHtml(p.username)}" disabled></div>
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
`;
console.log("HTML generated successfully");
