<!DOCTYPE html>
<html lang="en" data-theme="corporate">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RRU Room Booking - Pro Max</title>
    
    <!-- CDNs -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.css">
    
    <!-- Tailwind + daisyUI -->
    <link href="https://cdn.jsdelivr.net/npm/daisyui@4.10.2/dist/full.min.css" rel="stylesheet" type="text/css" />
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- SweetAlert2 CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@sweetalert2/theme-bootstrap-4/bootstrap-4.css">
    
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="min-h-screen bg-base-200">
    <!-- Loading Screen -->
    <div id="loading-screen" class="fixed inset-0 z-[9999] flex items-center justify-center bg-base-100/80 backdrop-blur-md" style="display:none;">
        <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div class="drawer lg:drawer-open">
        <input id="main-drawer" type="checkbox" class="drawer-toggle" />
        
        <!-- Main Content -->
        <div class="drawer-content flex flex-col">
            <!-- Navbar -->
            <div class="navbar bg-base-100 shadow-sm sticky top-0 z-30 border-b border-base-300">
                <div class="flex-none lg:hidden">
                    <label for="main-drawer" class="btn btn-square btn-ghost">
                        <i class="fas fa-bars"></i>
                    </label>
                </div>
                <div class="flex-1 px-2 mx-2 font-bold text-xl text-primary">
                    <i class="fas fa-calendar-check mr-2"></i> <span id="page-title-display">Calendar</span>
                </div>
                <div class="flex-none gap-2" id="auth-box-top">
                    <!-- Top bar actions injected by JS -->
                </div>
            </div>

            <!-- Page Content Area -->
            <main class="p-6">
                <section id="calendar-section" class="card bg-base-100 shadow-xl overflow-hidden">
                    <div class="card-body p-4">
                        <div id="calendar"></div>
                    </div>
                </section>

                <section id="my-bookings-section" style="display: none;">
                    <h1 class="text-2xl font-black mb-6">My Bookings</h1>
                    <div id="my-bookings-container"></div>
                </section>

                <section id="admin-section" style="display: none;">
                    <h1 class="text-2xl font-black mb-6">User Management</h1>
                    <div id="users-table-container" class="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-x-auto"></div>
                </section>

                <section id="master-section" style="display: none;">
                    <h1 class="text-2xl font-black mb-6">ตั้งค่าข้อมูลพื้นฐาน</h1>
                    <div id="master-container"></div>
                </section>

                <section id="rooms-section" style="display: none;">
                    <div class="flex justify-between items-center mb-6">
                        <h1 class="text-2xl font-black">Room Management</h1>
                        <button class="btn btn-primary" onclick="showRoomForm()"><i class="fas fa-plus"></i> Add Room</button>
                    </div>
                    <div id="rooms-table-container" class="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-x-auto"></div>
                </section>

                <section id="logs-section" style="display: none;">
                    <h1 class="text-2xl font-black mb-6">Audit Logs</h1>
                    <div id="logs-table-container" class="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-x-auto"></div>
                </section>

                <section id="stats-section" style="display: none;">
                    <h1 class="text-2xl font-black mb-6">Dashboard & Insights</h1>
                    <div id="stats-container"></div>
                </section>

                <section id="settings-section" style="display: none;">
                    <h1 class="text-2xl font-black mb-6 text-center">System Settings</h1>
                    <div class="card bg-base-100 shadow-xl max-w-4xl mx-auto">
                        <div class="card-body">
                            <form id="settings-form" class="space-y-8">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div class="space-y-4">
                                        <h3 class="text-lg font-bold border-b pb-2 text-primary flex items-center gap-2"><i class="fab fa-telegram"></i> Telegram</h3>
                                        <div class="form-control">
                                            <label class="label"><span class="label-text font-bold">Bot Token</span></label>
                                            <input type="text" name="telegram_bot_token" class="input input-bordered w-full" />
                                        </div>
                                        <div class="form-control">
                                            <label class="label"><span class="label-text font-bold">Chat ID</span></label>
                                            <input type="text" name="telegram_chat_id" class="input input-bordered w-full" />
                                        </div>
                                    </div>
                                    <div class="space-y-4">
                                        <h3 class="text-lg font-bold border-b pb-2 text-primary flex items-center gap-2"><i class="fas fa-envelope"></i> SMTP Email</h3>
                                        <div class="grid grid-cols-2 gap-4">
                                            <div class="form-control"><label class="label"><span class="label-text font-bold">Host</span></label><input type="text" name="smtp_host" class="input input-bordered" /></div>
                                            <div class="form-control"><label class="label"><span class="label-text font-bold">Port</span></label><input type="text" name="smtp_port" class="input input-bordered" /></div>
                                        </div>
                                        <div class="form-control"><label class="label"><span class="label-text font-bold">User</span></label><input type="text" name="smtp_user" class="input input-bordered" /></div>
                                        <div class="form-control"><label class="label"><span class="label-text font-bold">Pass</span></label><input type="password" name="smtp_pass" class="input input-bordered" /></div>
                                    </div>
                                </div>
                                <div class="card-actions justify-center pt-6 border-t">
                                    <button type="submit" class="btn btn-primary btn-wide">Save All Settings</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            </main>
        </div> 

        <!-- Sidebar / Drawer Side -->
        <div class="drawer-side z-40">
            <label for="main-drawer" class="drawer-overlay"></label>
            <div class="menu p-4 w-72 min-h-full bg-base-100 border-r border-base-300 text-base-content flex flex-col">
                <div class="flex items-center gap-3 px-4 py-6 mb-4">
                    <div class="w-12 h-12 bg-primary text-primary-content rounded-xl flex items-center justify-center text-2xl font-black shadow-lg">R</div>
                    <div class="font-black text-2xl tracking-tighter">Room<span class="text-primary">Booking</span></div>
                </div>

                <div class="mb-6 px-2" id="auth-box-sidebar">
                    <!-- User Info -->
                </div>

                <ul class="menu menu-md flex-1 gap-1" id="nav-links">
                    <!-- Navigation links -->
                </ul>

                <div class="divider"></div>
                
                <div class="px-4 pb-4 space-y-4">
                    <div class="text-xs font-bold text-base-content/40 uppercase tracking-widest mb-2">
                        Quick Login (Test)
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <button class="btn btn-xs btn-outline btn-primary" onclick="quickLogin('admin')">Admin</button>
                        <button class="btn btn-xs btn-outline btn-secondary" onclick="quickLogin('approver')">Approv</button>
                        <button class="btn btn-xs btn-outline btn-accent" onclick="quickLogin('staff')">Staff</button>
                        <button class="btn btn-xs btn-outline" onclick="quickLogin('user')">User</button>
                    </div>
                </div>

                <div class="divider"></div>
                
                <div class="px-4 pb-4 space-y-4">
                    <div class="flex items-center justify-between text-xs font-bold text-base-content/40 uppercase tracking-widest">
                        Language
                    </div>
                    <div class="join w-full">
                        <button class="btn btn-xs join-item flex-1" onclick="switchLang('th')">TH</button>
                        <button class="btn btn-xs join-item flex-1" onclick="switchLang('en')">EN</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- JS CDNs -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="assets/js/app.js"></script>
</body>
</html>
