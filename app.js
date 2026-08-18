/**
 * ========================================================
 * STUDY TRACK - CORE APPLICATION CONTROLLER & ROUTER
 * ========================================================
 * Renders SPA views, handles client-side routing, form
 * validations, interactive task CRUD, SVG progress rings,
 * calendar engine, and responsive drawer navigation.
 */

(function () {
  // DOM Elements
  const appRoot = document.getElementById('app');
  const toastContainer = document.getElementById('toast-container');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalContent = document.getElementById('modal-content');

  // --- THEME ENGINE ---
  function hexToRgb(hex) {
    hex = (hex || '#0052cc').replace(/^#/, '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 82;
    const b = parseInt(hex.substring(4, 6), 16) || 204;
    return { r, g, b };
  }

  function applyThemeColor(hexColor) {
    if (!hexColor) hexColor = DataManager.getThemeColor();
    const rgb = hexToRgb(hexColor);
    document.documentElement.style.setProperty('--primary-blue', hexColor);
    document.documentElement.style.setProperty('--primary-blue-hover', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.88)`);
    document.documentElement.style.setProperty('--primary-blue-light', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`);
    document.documentElement.style.setProperty('--primary-blue-border', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`);
    document.documentElement.style.setProperty('--shadow-blue', `0 10px 25px -5px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`);
    DataManager.setThemeColor(hexColor);
  }

  function applyAppearanceMode(isDark) {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    DataManager.setDarkMode(isDark);
  }

  applyThemeColor(DataManager.getThemeColor());
  applyAppearanceMode(DataManager.getDarkMode());

  // --- TOAST ENGINE ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 4000);
  }

  // --- MODAL ENGINE ---
  function openModal(htmlContent) {
    modalContent.innerHTML = htmlContent;
    modalBackdrop.classList.remove('hidden');
  }

  function closeModal() {
    modalBackdrop.classList.add('hidden');
    modalContent.innerHTML = '';
  }

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeModal();
    }
  });

  // --- ROUTER ENGINE ---
  function getRoute() {
    const hash = window.location.hash.replace('#', '');
    if (!hash || hash === '/') return 'dashboard';
    return hash;
  }

  function navigateTo(route) {
    window.location.hash = route;
  }

  // Guard protected routes
  function router() {
    const rawHash = window.location.hash.replace('#', '');
    const route = getRoute();
    const isAuth = AuthEngine.isAuthenticated();

    const publicRoutes = ['login', 'register', 'forgot-password'];

    if (!isAuth && !publicRoutes.includes(route)) {
      if (rawHash && rawHash !== '/' && rawHash !== 'dashboard') {
        showToast('Please log in to access your workspace.', 'info');
      }
      navigateTo('login');
      return;
    }

    if (isAuth && publicRoutes.includes(route)) {
      navigateTo('dashboard');
      return;
    }

    renderPage(route);
  }

  window.addEventListener('hashchange', router);
  window.addEventListener('load', router);

  // --- SVG ICON HELPERS ---
  const Icons = {
    dashboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>`,
    tasks: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
    calendar: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    subjects: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    profile: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    settings: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    plus: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    logout: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    bell: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
    eye: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    eyeOff: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
    gradCap: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`
  };

  // --- PAGE RENDERER DISPATCHER ---
  function renderPage(route) {
    if (route === 'login') {
      renderLoginPage();
      return;
    }
    if (route === 'register') {
      renderRegisterPage();
      return;
    }
    if (route === 'forgot-password') {
      renderForgotPasswordPage();
      return;
    }

    // Render workspace wrapper for authenticated views
    renderWorkspaceShell(route);
  }

  // ========================================================
  // 1. LOGIN PAGE RENDERER
  // ========================================================
  function renderLoginPage() {
    appRoot.innerHTML = `
      <div class="auth-page-wrapper">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-brand-badge">
              ${Icons.gradCap} STUDY TRACK
            </div>
            <h1 class="auth-title">Welcome Back to Scholar</h1>
            <p class="auth-subtitle">Enter your credentials to access your academic workspace.</p>
          </div>

          <!-- Google Login Button -->
          <button id="btn-google-login" class="btn-google">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            Continue with Google
          </button>

          <!-- Divider -->
          <div class="auth-divider">
            <span>OR WITH EMAIL</span>
          </div>

          <!-- Email / Password Form -->
          <form id="login-form">
            <div class="form-group">
              <label class="form-label" for="login-email">University / Personal Email *</label>
              <input type="email" id="login-email" class="form-input" placeholder="student@university.edu" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="login-password">Password *</label>
              <div class="input-wrapper">
                <input type="password" id="login-password" class="form-input" placeholder="••••••••" required>
                <button type="button" id="toggle-password-btn" class="input-icon-btn" aria-label="Toggle password visibility">
                  ${Icons.eye}
                </button>
              </div>
            </div>

            <div class="form-row-between">
              <label class="checkbox-label">
                <input type="checkbox" id="remember-me" checked>
                Remember me
              </label>
              <a href="#forgot-password" class="link-primary">Forgot Password?</a>
            </div>

            <button type="submit" class="btn-primary">
              Sign In to Workspace
            </button>
          </form>

          <!-- Create Account Footer Link -->
          <div class="auth-footer">
            New to Scholar? <a href="#register" class="link-primary">Create an account</a>
          </div>

          <div class="auth-subfooter">
            <a href="#">Privacy Policy</a> • <a href="#">Terms of Service</a> • <a href="#">Data Privacy Portal</a><br>
            Contact: privacy@scholar.app
          </div>
        </div>
      </div>
    `;

    // Password Visibility Toggle Handler
    const passwordInput = document.getElementById('login-password');
    const togglePasswordBtn = document.getElementById('toggle-password-btn');
    let showPassword = false;

    togglePasswordBtn.addEventListener('click', () => {
      showPassword = !showPassword;
      passwordInput.type = showPassword ? 'text' : 'password';
      togglePasswordBtn.innerHTML = showPassword ? Icons.eyeOff : Icons.eye;
    });

    // Google Login OAuth Account Selector Flow
    document.getElementById('btn-google-login').addEventListener('click', () => {
      // Fetch any previously signed-in Google accounts on this device
      let existingUsers = [];
      try {
        const stored = JSON.parse(localStorage.getItem('studytrack_users')) || [];
        existingUsers = stored.filter(u => u.isGoogleUser || (u.id && u.id.startsWith('google_user_')));
      } catch (e) {
        existingUsers = [];
      }

      const savedAccountsHTML = existingUsers.length > 0 ? `
        <div style="margin-bottom: 12px; font-weight: 700; font-size: 0.85rem; color: var(--text-muted);">
          SELECT SAVED GOOGLE ACCOUNT
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
          ${existingUsers.map(acc => `
            <button type="button" class="btn-sidebar-outline google-acc-btn" data-name="${acc.name.replace(/"/g, '&quot;')}" data-email="${acc.email.replace(/"/g, '&quot;')}" style="text-align: left; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">${acc.name}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${acc.email}</div>
              </div>
              <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary-blue);">Select →</span>
            </button>
          `).join('')}
        </div>
        <div class="auth-divider" style="margin: 16px 0;">
          <span>OR ENTER GOOGLE ACCOUNT</span>
        </div>
      ` : '';

      openModal(`
        <div style="margin-bottom: 18px; text-align: center;">
          <div style="font-size: 2.2rem; margin-bottom: 6px;">🌐</div>
          <h2 style="font-size: 1.25rem; font-weight: 800;">Sign in with Google</h2>
          <p style="color: var(--text-muted); font-size: 0.88rem;">Authenticate with your Google account to enter Study Track.</p>
        </div>

        ${savedAccountsHTML}

        <form id="google-custom-form">
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input type="text" id="google-name-input" class="form-input" placeholder="e.g. User A" required>
          </div>
          <div class="form-group">
            <label class="form-label">Google Email *</label>
            <input type="email" id="google-email-input" class="form-input" placeholder="user@gmail.com" required>
          </div>
          <div style="display: flex; gap: 10px; margin-top: 18px;">
            <button type="button" id="btn-cancel-google-modal" class="btn-sidebar-outline" style="flex: 1;">Cancel</button>
            <button type="submit" class="btn-primary" style="flex: 1;">Continue</button>
          </div>
        </form>
      `);

      document.getElementById('btn-cancel-google-modal').addEventListener('click', closeModal);

      document.querySelectorAll('.google-acc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.getAttribute('data-name');
          const email = btn.getAttribute('data-email');
          const res = AuthEngine.demoGoogleLogin(name, email);
          if (res.success) {
            closeModal();
            showToast(`Signed in as ${res.user.name}`, 'success');
            navigateTo('dashboard');
          } else {
            showToast(res.message, 'error');
          }
        });
      });

      document.getElementById('google-custom-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('google-name-input').value;
        const email = document.getElementById('google-email-input').value;
        const res = AuthEngine.demoGoogleLogin(name, email);
        if (res.success) {
          closeModal();
          showToast(`Signed in as ${res.user.name}`, 'success');
          navigateTo('dashboard');
        } else {
          showToast(res.message, 'error');
        }
      });
    });

    // Form Submission Handler
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = passwordInput.value;
      const rememberMe = document.getElementById('remember-me').checked;

      const result = AuthEngine.login(email, password, rememberMe);
      if (result.success) {
        showToast('Welcome back to Study Track!', 'success');
        navigateTo('dashboard');
      } else {
        showToast(result.message, 'error');
      }
    });
  }

  // ========================================================
  // 2. REGISTRATION PAGE RENDERER
  // ========================================================
  function renderRegisterPage() {
    appRoot.innerHTML = `
      <div class="auth-page-wrapper">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-brand-badge">
              ${Icons.gradCap} STUDY TRACK
            </div>
            <h1 class="auth-title">Create Your Account</h1>
            <p class="auth-subtitle">Join Study Track to manage your academic assignments.</p>
          </div>

          <form id="register-form">
            <div class="form-group">
              <label class="form-label" for="reg-name">Full Name *</label>
              <input type="text" id="reg-name" class="form-input" placeholder="e.g. Jane Doe" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-email">University / Personal Email *</label>
              <input type="email" id="reg-email" class="form-input" placeholder="student@university.edu" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-password">Password *</label>
              <input type="password" id="reg-password" class="form-input" placeholder="••••••••" required minlength="6">
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-confirm">Confirm Password *</label>
              <input type="password" id="reg-confirm" class="form-input" placeholder="••••••••" required minlength="6">
            </div>

            <button type="submit" class="btn-primary" style="margin-top: 12px;">
              Create Account
            </button>
          </form>

          <div class="auth-footer">
            Already have an account? <a href="#login" class="link-primary">Sign In</a>
          </div>
        </div>
      </div>
    `;

    document.getElementById('register-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
      const confirm = document.getElementById('reg-confirm').value;

      if (password !== confirm) {
        showToast('Passwords do not match.', 'error');
        return;
      }

      const result = AuthEngine.register(name, email, password);
      if (result.success) {
        showToast('Account created successfully! Welcome to Study Track.', 'success');
        navigateTo('dashboard');
      } else {
        showToast(result.message, 'error');
      }
    });
  }

  // ========================================================
  // 3. FORGOT PASSWORD PAGE RENDERER
  // ========================================================
  function renderForgotPasswordPage() {
    appRoot.innerHTML = `
      <div class="auth-page-wrapper">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-brand-badge">
              ${Icons.gradCap} STUDY TRACK
            </div>
            <h1 class="auth-title">Forgot Password?</h1>
            <p class="auth-subtitle">Enter your email and we'll send you recovery instructions.</p>
          </div>

          <form id="forgot-form">
            <div class="form-group">
              <label class="form-label" for="forgot-email">University / Personal Email *</label>
              <input type="email" id="forgot-email" class="form-input" placeholder="student@university.edu" required>
            </div>

            <button type="submit" class="btn-primary" style="margin-top: 12px;">
              Send Recovery Link
            </button>
          </form>

          <div class="auth-footer">
            Remembered your password? <a href="#login" class="link-primary">Back to Sign In</a>
          </div>
        </div>
      </div>
    `;

    document.getElementById('forgot-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('forgot-email').value;
      const result = AuthEngine.forgotPassword(email);
      if (result.success) {
        showToast(result.message, 'success');
        navigateTo('login');
      } else {
        showToast(result.message, 'error');
      }
    });
  }

  // ========================================================
  // 4. WORKSPACE SHELL (HEADER, SIDEBAR, MOBILE BAR)
  // ========================================================
  // ========================================================
  // 4. WORKSPACE SHELL (HEADER, SIDEBAR, MOBILE BAR)
  // ========================================================
  function renderWorkspaceShell(activeRoute) {
    const user = AuthEngine.getCurrentUser();
    if (!user) {
      navigateTo('login');
      return;
    }
    const stats = DataManager.getStatsSummary();
    const notifications = DataManager.getNotifications();
    const unreadCount = DataManager.getUnreadNotificationCount();
    const isDarkMode = DataManager.getDarkMode();

    appRoot.innerHTML = `
      <div class="workspace-layout">
        <!-- Sidebar Navigation -->
        <aside id="sidebar" class="sidebar">
          <div class="sidebar-header">
            <div class="brand-pill">
              ${Icons.gradCap} STUDENT ASSIGNMENT TRACKER
            </div>
          </div>

          <div class="sidebar-section-title">MENU</div>
          <nav class="sidebar-nav">
            <a href="#dashboard" class="nav-item ${activeRoute === 'dashboard' ? 'active' : ''}">
              ${Icons.dashboard} Dashboard
            </a>
            <a href="#tasks" class="nav-item ${activeRoute === 'tasks' ? 'active' : ''}">
              ${Icons.tasks} Tasks
            </a>
            <a href="#calendar" class="nav-item ${activeRoute === 'calendar' ? 'active' : ''}">
              ${Icons.calendar} Calendar
            </a>
            <a href="#subjects" class="nav-item ${activeRoute === 'subjects' ? 'active' : ''}">
              ${Icons.subjects} Subjects
            </a>
            <a href="#caught-up" class="nav-item ${activeRoute === 'caught-up' ? 'active' : ''}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> All Caught Up
            </a>
            <a href="#profile" class="nav-item ${activeRoute === 'profile' ? 'active' : ''}">
              ${Icons.profile} Profile
            </a>
            <a href="#settings" class="nav-item ${activeRoute === 'settings' ? 'active' : ''}">
              ${Icons.settings} Settings
            </a>
          </nav>

          <div class="sidebar-section-title">QUICK ACTIONS</div>
          <div class="sidebar-actions">
            <button id="btn-quick-add-task" class="btn-sidebar-add">
              ${Icons.plus} Add New Task
            </button>
            <a href="#calendar" class="btn-sidebar-outline" style="text-decoration: none;">
              View Calendar
            </a>
          </div>

          <!-- Stats Overview Sidebar Widget -->
          <div class="sidebar-stats-card">
            <div class="stats-card-title">STATS OVERVIEW</div>
            <div class="stat-mini-row">
              <div class="stat-dot-badge"><span class="dot purple"></span> Total Tasks</div>
              <span class="stat-count-value">${stats.total}</span>
            </div>
            <div class="stat-mini-row">
              <div class="stat-dot-badge"><span class="dot green"></span> Completed</div>
              <span class="stat-count-value">${stats.completed}</span>
            </div>
            <div class="stat-mini-row">
              <div class="stat-dot-badge"><span class="dot orange"></span> Pending</div>
              <span class="stat-count-value">${stats.pending}</span>
            </div>
            <div class="stat-mini-row">
              <div class="stat-dot-badge"><span class="dot red"></span> Overdue</div>
              <span class="stat-count-value">${stats.overdue}</span>
            </div>
          </div>
        </aside>

        <!-- Main Wrapper -->
        <div class="main-wrapper">
          <!-- Top Sticky Header -->
          <header class="top-header">
            <div class="header-left">
              <button id="mobile-drawer-toggle" class="mobile-menu-toggle" aria-label="Toggle menu">
                ☰
              </button>
              <div class="page-title">Study Track</div>
            </div>

            <div class="header-right">
              <!-- Quick Dark / Light Mode Toggle Button -->
              <button id="btn-header-theme" class="icon-btn" title="Toggle Light/Dark Mode" aria-label="Toggle Light/Dark Mode" style="font-size: 1.1rem;">
                ${isDarkMode ? '☀️' : '🌙'}
              </button>

              <!-- Notification Bell Button & Dropdown Container -->
              <div class="notif-bell-wrapper">
                <button id="btn-notif-bell" class="icon-btn" title="Notifications" aria-label="Notifications">
                  ${Icons.bell}
                  ${unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : ''}
                </button>

                <!-- Floating Dropdown Panel -->
                <div id="notif-dropdown" class="notif-dropdown hidden">
                  <div class="notif-dropdown-header">
                    <span class="notif-dropdown-title">Notifications (${unreadCount})</span>
                    <button id="btn-mark-all-read" class="link-primary" style="font-size: 0.78rem; font-weight: 700;">
                      Mark all as read
                    </button>
                  </div>
                  <div class="notif-list">
                    ${notifications.length === 0 ? `
                      <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                        No notifications right now.
                      </div>
                    ` : notifications.map(n => `
                      <div class="notif-item ${n.read ? '' : 'unread'} ${n.type || ''}" data-id="${n.id}">
                        <div class="notif-icon-box">
                          ${n.type === 'warning' ? '⚠️' : n.type === 'success' ? '✅' : '🔔'}
                        </div>
                        <div class="notif-text-content">
                          <div class="notif-item-title">${n.title}</div>
                          <div class="notif-item-msg">${n.message}</div>
                          <div class="notif-item-time">${n.time}</div>
                        </div>
                        ${!n.read ? '<div class="unread-dot"></div>' : ''}
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- User Profile Avatar Badge -->
              <a href="#profile" id="user-menu-btn" class="user-profile-badge" style="text-decoration: none;">
                <div class="avatar-circle">
                  ${user.avatar ? `<img src="${user.avatar}" class="avatar-img" alt="${user.name}">` : (user.name ? user.name.charAt(0).toUpperCase() : '?')}
                </div>
                <span class="user-name-text">${user.name || 'User'}</span>
              </a>

              <button id="btn-logout" class="icon-btn" title="Logout">
                ${Icons.logout}
              </button>
            </div>
          </header>

          <!-- Content Body View Placeholder -->
          <main id="content-body" class="content-body"></main>
        </div>

        <!-- Mobile Bottom Bar -->
        <div class="mobile-bottom-nav">
          <a href="#dashboard" class="mobile-nav-item ${activeRoute === 'dashboard' ? 'active' : ''}">
            ${Icons.dashboard}
            <span>Dashboard</span>
          </a>
          <a href="#tasks" class="mobile-nav-item ${activeRoute === 'tasks' ? 'active' : ''}">
            ${Icons.tasks}
            <span>Tasks</span>
          </a>
          <a href="#calendar" class="mobile-nav-item ${activeRoute === 'calendar' ? 'active' : ''}">
            ${Icons.calendar}
            <span>Calendar</span>
          </a>
          <a href="#subjects" class="mobile-nav-item ${activeRoute === 'subjects' ? 'active' : ''}">
            ${Icons.subjects}
            <span>Subjects</span>
          </a>
          <a href="#profile" class="mobile-nav-item ${activeRoute === 'profile' ? 'active' : ''}">
            ${Icons.profile}
            <span>Profile</span>
          </a>
        </div>
      </div>
    `;

    // Header Quick Theme Toggle Handler
    const headerThemeBtn = document.getElementById('btn-header-theme');
    if (headerThemeBtn) {
      headerThemeBtn.addEventListener('click', () => {
        const currentDark = DataManager.getDarkMode();
        applyAppearanceMode(!currentDark);
        showToast(!currentDark ? 'Dark Mode activated!' : 'Light Mode activated!', 'info');
        renderWorkspaceShell(activeRoute);
      });
    }

    // Notification Dropdown Toggle Event
    const notifBellBtn = document.getElementById('btn-notif-bell');
    const notifDropdown = document.getElementById('notif-dropdown');

    notifBellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!notifDropdown.contains(e.target) && !notifBellBtn.contains(e.target)) {
        notifDropdown.classList.add('hidden');
      }
    });

    // Mark All Notifications Read Handler
    document.getElementById('btn-mark-all-read').addEventListener('click', (e) => {
      e.stopPropagation();
      DataManager.markAllNotificationsRead();
      showToast('All notifications marked as read.', 'info');
      renderWorkspaceShell(activeRoute);
      const openDropdown = document.getElementById('notif-dropdown');
      if (openDropdown) openDropdown.classList.remove('hidden');
    });

    // Individual Notification Click Handler
    document.querySelectorAll('.notif-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = item.getAttribute('data-id');
        DataManager.markNotificationRead(id);
        renderWorkspaceShell(activeRoute);
        const openDropdown = document.getElementById('notif-dropdown');
        if (openDropdown) openDropdown.classList.remove('hidden');
      });
    });

    // Mobile Drawer Toggle Event
    const sidebar = document.getElementById('sidebar');
    document.getElementById('mobile-drawer-toggle').addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });

    // Quick Add Task Modal Handler
    document.getElementById('btn-quick-add-task').addEventListener('click', openAddTaskModal);

    // Logout Handler
    document.getElementById('btn-logout').addEventListener('click', () => {
      AuthEngine.logout();
      showToast('Logged out of Study Track.', 'info');
      navigateTo('login');
    });

    // Render active body view
    const bodyContainer = document.getElementById('content-body');
    if (activeRoute === 'dashboard') renderDashboardView(bodyContainer);
    else if (activeRoute === 'tasks') renderTasksView(bodyContainer);
    else if (activeRoute === 'calendar') renderCalendarView(bodyContainer);
    else if (activeRoute === 'subjects') renderSubjectsView(bodyContainer);
    else if (activeRoute === 'profile') renderProfileView(bodyContainer);
    else if (activeRoute === 'settings') renderSettingsView(bodyContainer);
    else if (activeRoute === 'caught-up') renderCaughtUpView(bodyContainer);
  }

  // ========================================================
  // 5. DASHBOARD VIEW RENDERER
  // ========================================================
  function renderDashboardView(container) {
    const user = AuthEngine.getCurrentUser();
    const userName = (user && user.name) ? user.name.trim() : 'Student';
    const stats = DataManager.getStatsSummary();
    const tasks = DataManager.getTasks();

    const currentHour = new Date().getHours();
    let greetingPrefix = 'Good Evening';
    if (currentHour >= 5 && currentHour < 12) {
      greetingPrefix = 'Good Morning';
    } else if (currentHour >= 12 && currentHour < 17) {
      greetingPrefix = 'Good Afternoon';
    }

    const greetingText = `${greetingPrefix}, ${userName}!`;

    container.innerHTML = `
      <!-- Greeting Banner -->
      <div class="hero-banner">
        <div class="hero-text">
          <h1>${greetingText} 👋</h1>
          <p>Stay focused and keep learning.</p>
        </div>
        <div class="hero-illustration">📚🌱</div>
      </div>

      ${stats.pending === 0 ? `
        <div class="dash-card" style="grid-column: 1 / -1; text-align: center; padding: 24px 20px; margin-bottom: 20px; background: var(--card-bg);">
          <div style="font-size: 2.8rem; margin-bottom: 6px;">🎉</div>
          <h2 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); margin-bottom: 4px;">You're All Caught Up!</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 480px; margin: 0 auto 14px auto;">
            Great job staying on top of your work! You have zero pending tasks remaining right now.
          </p>
          <a href="#caught-up" class="btn-primary" style="display: inline-flex; width: auto; padding: 9px 20px; text-decoration: none;">
            View All Caught Up Page
          </a>
        </div>
      ` : ''}

      <!-- Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Weekly Goal Card -->
        <div class="dash-card">
          <div class="card-header-flex">
            <h2 class="card-title">Weekly Goal</h2>
          </div>
          <div class="weekly-goal-content">
            <div class="radial-progress-wrapper">
              <svg class="radial-progress-svg" width="120" height="120">
                <circle class="radial-bg" cx="60" cy="60" r="50" stroke-width="8" fill="none"/>
                <circle class="radial-fill" cx="60" cy="60" r="50" stroke-width="8" fill="none"
                        stroke-dasharray="314.16" stroke-dashoffset="${314.16 * (1 - (stats.progressPercent / 100))}"/>
              </svg>
              <div class="radial-text">${stats.progressPercent}%</div>
            </div>
            <div class="goal-subtitle">${stats.completed} of ${stats.total} tasks completed</div>
            <a href="#tasks" class="btn-primary" style="width: 100%; text-decoration: none; margin-top: 4px;">
              View Progress
            </a>
          </div>
        </div>

        <!-- At a Glance & Upcoming Deadlines Card -->
        <div class="dash-card">
          <div class="card-header-flex">
            <h2 class="card-title">At a Glance</h2>
            <a href="#tasks" class="card-action-link">View All →</a>
          </div>

          <div class="glance-grid">
            <div class="glance-box">
              <div class="glance-label">Total Tasks</div>
              <div class="glance-val" style="display: flex; align-items: center; justify-content: center; gap: 6px; color: var(--text-main);">
                <span class="dot purple"></span> ${stats.total}
              </div>
            </div>
            <div class="glance-box">
              <div class="glance-label">Completed</div>
              <div class="glance-val" style="display: flex; align-items: center; justify-content: center; gap: 6px; color: var(--text-main);">
                <span class="dot green"></span> ${stats.completed}
              </div>
            </div>
            <div class="glance-box">
              <div class="glance-label">Pending</div>
              <div class="glance-val" style="display: flex; align-items: center; justify-content: center; gap: 6px; color: var(--text-main);">
                <span class="dot orange"></span> ${stats.pending}
              </div>
            </div>
            <div class="glance-box">
              <div class="glance-label">Overdue</div>
              <div class="glance-val" style="display: flex; align-items: center; justify-content: center; gap: 6px; color: var(--text-main);">
                <span class="dot red"></span> ${stats.overdue}
              </div>
            </div>
          </div>

          <!-- Upcoming Deadlines Section -->
          <div style="margin-top: 20px;">
            <div class="card-header-flex" style="margin-bottom: 12px;">
              <h2 class="card-title" style="font-size: 0.95rem;">Upcoming Deadlines</h2>
              <a href="#tasks" class="card-action-link">View All →</a>
            </div>

            <div class="deadline-list">
              ${tasks.length === 0 ? `
                <div style="text-align: center; padding: 16px; color: var(--text-muted); font-size: 0.88rem;">No tasks scheduled.</div>
              ` : tasks.slice(0, 3).map(task => `
                <div class="deadline-item">
                  <div class="deadline-info">
                    <span class="dot ${task.completed ? 'green' : task.status === 'overdue' ? 'red' : task.subject.toLowerCase().includes('math') ? 'purple' : 'purple'}"></span>
                    <div>
                      <span class="deadline-title">${task.title}</span>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="deadline-time">Due ${task.dueDate}</span>
                    <span class="badge ${task.completed ? 'completed' : task.type.toLowerCase().includes('quiz') ? 'quiz' : task.type.toLowerCase().includes('lab') ? 'lab' : 'assignment'}">
                      ${task.completed ? 'Completed' : task.type}
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ========================================================
  // 6. TASKS / ASSIGNMENTS VIEW RENDERER
  // ========================================================
  let currentTaskTab = 'all';
  let searchQuery = '';

  function renderTasksView(container) {
    const tasks = DataManager.getTasks();

    let filteredTasks = tasks;
    if (currentTaskTab === 'pending') {
      filteredTasks = tasks.filter(t => !t.completed && t.status !== 'overdue');
    } else if (currentTaskTab === 'completed') {
      filteredTasks = tasks.filter(t => t.completed);
    } else if (currentTaskTab === 'overdue') {
      filteredTasks = tasks.filter(t => t.status === 'overdue' && !t.completed);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(t =>
        t.title.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q)
      );
    }

    container.innerHTML = `
      <div class="tasks-controls-bar">
        <div class="filter-tabs">
          <button class="tab-btn ${currentTaskTab === 'all' ? 'active' : ''}" data-tab="all">All</button>
          <button class="tab-btn ${currentTaskTab === 'pending' ? 'active' : ''}" data-tab="pending">Pending</button>
          <button class="tab-btn ${currentTaskTab === 'completed' ? 'active' : ''}" data-tab="completed">Completed</button>
          <button class="tab-btn ${currentTaskTab === 'overdue' ? 'active' : ''}" data-tab="overdue">Overdue</button>
        </div>

        <div class="search-filter-group">
          <input type="text" id="task-search-input" class="form-input" placeholder="Search tasks or subjects..." value="${searchQuery}">
          <button id="btn-add-task-header" class="btn-primary" style="white-space: nowrap; padding: 10px 18px;">
            ${Icons.plus} Add Task
          </button>
        </div>
      </div>

      <div class="task-list-card">
        ${filteredTasks.length === 0 ? `
          <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
            <div style="font-size: 3rem; margin-bottom: 8px;">📋</div>
            <div style="font-weight: 700; font-size: 1.1rem;">No tasks found</div>
            <p style="font-size: 0.9rem;">Try adjusting your filter or add a new task.</p>
          </div>
        ` : filteredTasks.map(task => `
          <div class="task-row ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <div class="task-left">
              <input type="checkbox" class="task-checkbox toggle-task-cb" ${task.completed ? 'checked' : ''}>
              <div>
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                  <span>${task.subject}</span> •
                  <span>Due ${task.dueDate}</span>
                </div>
              </div>
            </div>
            <div class="task-right">
              <span class="badge ${task.completed ? 'completed' : task.status === 'overdue' ? 'overdue' : 'assignment'}">
                ${task.completed ? 'Completed' : task.type}
              </span>
              <button class="icon-btn edit edit-task-btn" title="Edit Task">
                ✏️
              </button>
              <button class="icon-btn delete delete-task-btn" title="Delete Task">
                🗑️
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Filter tab events
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentTaskTab = btn.getAttribute('data-tab');
        renderTasksView(container);
      });
    });

    // Search Input event
    const searchInput = container.querySelector('#task-search-input');
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderTasksView(container);
    });

    // Add task header button
    container.querySelector('#btn-add-task-header').addEventListener('click', openAddTaskModal);

    // Toggle Task Checkboxes
    container.querySelectorAll('.toggle-task-cb').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const taskId = e.target.closest('.task-row').getAttribute('data-id');
        DataManager.toggleTaskCompletion(taskId);
        showToast('Task updated!', 'success');
        renderTasksView(container);
      });
    });

    // Edit Task buttons
    container.querySelectorAll('.edit-task-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = e.target.closest('.task-row').getAttribute('data-id');
        const tasks = DataManager.getTasks();
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          openEditTaskModal(task);
        }
      });
    });

    // Delete Task buttons
    container.querySelectorAll('.delete-task-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = e.target.closest('.task-row').getAttribute('data-id');
        DataManager.deleteTask(taskId);
        showToast('Task deleted.', 'info');
        renderTasksView(container);
      });
    });
  }

  // Edit Task Modal Dialog
  function openEditTaskModal(task) {
    openModal(`
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 1.25rem; font-weight: 800;">Edit Assignment</h2>
        <p style="color: var(--text-muted); font-size: 0.88rem;">Update details for your task.</p>
      </div>

      <form id="edit-task-form">
        <div class="form-group">
          <label class="form-label">Task Title *</label>
          <input type="text" id="edit-task-title" class="form-input" value="${task.title}" required>
        </div>

        <div class="form-group">
          <label class="form-label">Subject / Category</label>
          <select id="edit-task-subject" class="form-input">
            <option value="Computer Science" ${task.subject === 'Computer Science' ? 'selected' : ''}>Computer Science</option>
            <option value="Mathematics" ${task.subject === 'Mathematics' ? 'selected' : ''}>Mathematics</option>
            <option value="Physics" ${task.subject === 'Physics' ? 'selected' : ''}>Physics</option>
            <option value="Data Structures" ${task.subject === 'Data Structures' ? 'selected' : ''}>Data Structures</option>
            <option value="General" ${task.subject === 'General' ? 'selected' : ''}>General</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Task Type</label>
          <select id="edit-task-type" class="form-input">
            <option value="Assignment" ${task.type === 'Assignment' ? 'selected' : ''}>Assignment</option>
            <option value="Quiz" ${task.type === 'Quiz' ? 'selected' : ''}>Quiz</option>
            <option value="Lab Report" ${task.type === 'Lab Report' ? 'selected' : ''}>Lab Report</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Due Date *</label>
          <input type="date" id="edit-task-date" class="form-input" required value="${task.dueDate}">
        </div>

        <div style="display: flex; gap: 12px; margin-top: 24px;">
          <button type="button" id="btn-cancel-edit-modal" class="btn-sidebar-outline" style="flex: 1;">Cancel</button>
          <button type="submit" class="btn-primary" style="flex: 1;">Update Task</button>
        </div>
      </form>
    `);

    document.getElementById('btn-cancel-edit-modal').addEventListener('click', closeModal);

    document.getElementById('edit-task-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('edit-task-title').value;
      const subject = document.getElementById('edit-task-subject').value;
      const type = document.getElementById('edit-task-type').value;
      const dueDate = document.getElementById('edit-task-date').value;

      DataManager.updateTask(task.id, { title, subject, type, dueDate });
      showToast('Assignment updated!', 'success');
      closeModal();

      if (getRoute() === 'tasks') {
        renderTasksView(document.getElementById('content-body'));
      }
    });
  }

  // Add Task Modal Dialog
  function openAddTaskModal(defaultDateStr) {
    const initialDate = (typeof defaultDateStr === 'string' && defaultDateStr) ? defaultDateStr : new Date().toISOString().split('T')[0];

    openModal(`
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 1.25rem; font-weight: 800;">Add New Assignment</h2>
        <p style="color: var(--text-muted); font-size: 0.88rem;">Create a task to track your academic progress.</p>
      </div>

      <form id="add-task-form">
        <div class="form-group">
          <label class="form-label">Task Title *</label>
          <input type="text" id="task-title-input" class="form-input" placeholder="e.g. Operating Systems Lab 3" required>
        </div>

        <div class="form-group">
          <label class="form-label">Subject / Category</label>
          <select id="task-subject-select" class="form-input">
            <option value="Computer Science">Computer Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Data Structures">Data Structures</option>
            <option value="General">General</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Task Type</label>
          <select id="task-type-select" class="form-input">
            <option value="Assignment">Assignment</option>
            <option value="Quiz">Quiz</option>
            <option value="Lab Report">Lab Report</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Due Date *</label>
          <input type="date" id="task-date-input" class="form-input" required value="${initialDate}">
        </div>

        <div style="display: flex; gap: 12px; margin-top: 24px;">
          <button type="button" id="btn-cancel-modal" class="btn-sidebar-outline" style="flex: 1;">Cancel</button>
          <button type="submit" class="btn-primary" style="flex: 1;">Save Task</button>
        </div>
      </form>
    `);

    document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);

    document.getElementById('add-task-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('task-title-input').value;
      const subject = document.getElementById('task-subject-select').value;
      const type = document.getElementById('task-type-select').value;
      const dueDate = document.getElementById('task-date-input').value;

      DataManager.addTask({ title, subject, type, dueDate });
      showToast('New assignment added!', 'success');
      closeModal();

      if (getRoute() === 'tasks') {
        renderTasksView(document.getElementById('content-body'));
      }
    });
  }

  // ========================================================
  // 7. CALENDAR VIEW RENDERER
  // ========================================================
  // ========================================================
  // 7. CALENDAR VIEW RENDERER (DYNAMIC ENGINE)
  // ========================================================
  let currentCalendarYear = 2026;
  let currentCalendarMonth = 7; // 0-indexed: 0 = Jan, 7 = Aug
  let selectedCalendarDay = 18;

  function renderCalendarView(container) {
    const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const tasks = DataManager.getTasks();

    // Days in current month (handles leap years automatically)
    const totalDays = new Date(currentCalendarYear, currentCalendarMonth + 1, 0).getDate();

    // First day of month weekday offset (0 = Mon, 6 = Sun)
    const jsFirstDay = new Date(currentCalendarYear, currentCalendarMonth, 1).getDay();
    const firstDayOffset = jsFirstDay === 0 ? 6 : jsFirstDay - 1;

    // Clamp selected day if month length changed
    if (selectedCalendarDay > totalDays) {
      selectedCalendarDay = totalDays;
    }

    // Selected date formatted string YYYY-MM-DD
    const selectedMonthStr = String(currentCalendarMonth + 1).padStart(2, '0');
    const selectedDayStr = String(selectedCalendarDay).padStart(2, '0');
    const selectedDateFormatted = `${currentCalendarYear}-${selectedMonthStr}-${selectedDayStr}`;

    // Tasks for selected day
    const dayTasks = tasks.filter(t => t.dueDate === selectedDateFormatted);

    // Map tasks present in this month for dot indicators
    const taskDatesInMonth = new Set();
    tasks.forEach(t => {
      if (t.dueDate) {
        const parts = t.dueDate.split('-');
        if (parts.length === 3) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const d = parseInt(parts[2], 10);
          if (y === currentCalendarYear && m === currentCalendarMonth) {
            taskDatesInMonth.add(d);
          }
        }
      }
    });

    // Check today date indicator
    const todayObj = new Date();
    const todayYear = todayObj.getFullYear();
    const todayMonth = todayObj.getMonth();
    const todayDate = todayObj.getDate();

    container.innerHTML = `
      <div class="calendar-container">
        <!-- Compact Calendar Card -->
        <div class="calendar-card">
          <div class="calendar-header">
            <h2 style="font-size: 1.1rem; font-weight: 800;">${monthNames[currentCalendarMonth]} ${currentCalendarYear}</h2>
            <div style="display: flex; gap: 8px;">
              <button id="btn-cal-prev" class="btn-sidebar-outline" style="padding: 6px 12px; font-size: 0.8rem;">‹ Prev</button>
              <button id="btn-cal-next" class="btn-sidebar-outline" style="padding: 6px 12px; font-size: 0.8rem;">Next ›</button>
            </div>
          </div>

          <div class="calendar-grid">
            ${dayLabels.map(d => `<div class="cal-day-label">${d}</div>`).join('')}
            ${Array.from({ length: firstDayOffset }, () => `<div class="cal-date-cell empty" style="visibility: hidden; pointer-events: none;"></div>`).join('')}
            ${Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
      const isToday = (currentCalendarYear === todayYear && currentCalendarMonth === todayMonth && day === todayDate);
      const isSelected = (day === selectedCalendarDay);
      const hasTask = taskDatesInMonth.has(day);
      return `
                <div class="cal-date-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" data-day="${day}">
                  ${day}
                  ${hasTask ? '<div class="cal-dot"></div>' : ''}
                </div>
              `;
    }).join('')}
          </div>
        </div>

        <!-- Selected Day Tasks Card Below Calendar -->
        <div class="selected-day-card">
          <div class="selected-day-header">
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 800;">${monthNames[currentCalendarMonth]} ${selectedCalendarDay}, ${currentCalendarYear}</h3>
              <p style="font-size: 0.82rem; color: var(--text-muted);">${dayTasks.length} tasks scheduled for this day</p>
            </div>
            <button id="btn-add-day-task" class="btn-primary" style="padding: 8px 14px; font-size: 0.82rem; width: auto;">
              ${Icons.plus} Add Task
            </button>
          </div>

          <div class="deadline-list">
            ${dayTasks.length === 0 ? `
              <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.88rem; background: var(--bg-app); border-radius: var(--radius-md);">
                No tasks scheduled for ${monthNames[currentCalendarMonth]} ${selectedCalendarDay}.
              </div>
            ` : dayTasks.map(t => `
              <div class="deadline-item">
                <div class="deadline-info">
                  <span class="deadline-title">${t.title}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span class="deadline-time">${t.subject}</span>
                  <span class="badge ${t.type.toLowerCase().includes('quiz') ? 'quiz' : t.type.toLowerCase().includes('lab') ? 'lab' : 'assignment'}">
                    ${t.type}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Previous Month Handler
    container.querySelector('#btn-cal-prev').addEventListener('click', () => {
      currentCalendarMonth--;
      if (currentCalendarMonth < 0) {
        currentCalendarMonth = 11;
        currentCalendarYear--;
      }
      renderCalendarView(container);
    });

    // Next Month Handler
    container.querySelector('#btn-cal-next').addEventListener('click', () => {
      currentCalendarMonth++;
      if (currentCalendarMonth > 11) {
        currentCalendarMonth = 0;
        currentCalendarYear++;
      }
      renderCalendarView(container);
    });

    // Date Cell Click Handler
    container.querySelectorAll('.cal-date-cell:not(.empty)').forEach(cell => {
      cell.addEventListener('click', () => {
        const dayVal = parseInt(cell.getAttribute('data-day'), 10);
        if (!isNaN(dayVal)) {
          selectedCalendarDay = dayVal;
          renderCalendarView(container);
        }
      });
    });

    // Add Task Button with prefilled date
    container.querySelector('#btn-add-day-task').addEventListener('click', () => {
      openAddTaskModal(selectedDateFormatted);
    });
  }

  // ========================================================
  // 8. SUBJECTS VIEW RENDERER
  // ========================================================
  function renderSubjectsView(container) {
    const subjects = DataManager.getSubjects();

    container.innerHTML = `
      <div class="subjects-grid">
        ${subjects.map(sub => `
          <div class="subject-card">
            <div class="subject-icon-box">📘</div>
            <div>
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary-blue);">${sub.code}</div>
              <h3 class="subject-title">${sub.name}</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">${sub.instructor}</p>
            </div>
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin-top: auto;">
              ${sub.totalTasks} Assignments Active
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ========================================================
  // 9. PROFILE VIEW RENDERER WITH PHOTO UPLOAD & REMOVE
  // ========================================================
  function renderProfileView(container) {
    const user = AuthEngine.getCurrentUser();
    if (!user) return;

    const userCourse = user.course || user.major || 'Not specified';
    const userUniv = user.university || 'Not specified';
    const userSemester = user.semester || 'Not specified';
    const userStudentId = user.studentId || ('STU-' + (user.id ? user.id.replace(/\D/g, '').slice(-5) : '10001'));

    container.innerHTML = `
      <div class="profile-card">
        <div class="profile-cover"></div>
        <div class="profile-body">
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: -48px; margin-bottom: 16px;">
            <div class="profile-avatar-large">
              ${user.avatar ? `<img src="${user.avatar}" class="profile-avatar-img" alt="${user.name}">` : user.name.charAt(0).toUpperCase()}
            </div>

            <!-- Avatar Action Buttons -->
            <div style="display: flex; gap: 8px; margin-bottom: 10px;">
              <input type="file" id="avatar-file-input" accept="image/*" class="hidden">
              <button id="btn-change-photo" class="btn-sidebar-outline" style="font-size: 0.8rem; padding: 6px 12px;">
                📷 Change Photo
              </button>
              ${user.avatar ? `
                <button id="btn-remove-photo" class="btn-sidebar-outline" style="font-size: 0.8rem; padding: 6px 12px; color: var(--status-danger);">
                  🗑️ Remove Photo
                </button>
              ` : ''}
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <h2 style="font-size: 1.5rem; font-weight: 800;">${user.name}</h2>
              <p style="color: var(--text-muted); font-size: 0.95rem;">${userCourse}</p>
            </div>
            <button id="btn-edit-profile" class="btn-sidebar-outline">Edit Profile</button>
          </div>

          <div class="profile-stats-row">
            <div class="profile-stat-box">
              <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">CURRENT GPA</div>
              <div style="font-size: 1.75rem; font-weight: 800; color: var(--primary-blue); margin-top: 4px;">${user.gpa || '0.0'}</div>
            </div>
            <div class="profile-stat-box">
              <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">TOTAL CREDITS</div>
              <div style="font-size: 1.75rem; font-weight: 800; color: var(--text-main); margin-top: 4px;">${user.credits || '0'}</div>
            </div>
          </div>

          <div style="border-top: 1px solid var(--border-color); padding-top: 20px; font-size: 0.9rem;">
            <div style="margin-bottom: 10px;"><strong>Email:</strong> ${user.email}</div>
            <div style="margin-bottom: 10px;"><strong>University:</strong> ${userUniv}</div>
            <div style="margin-bottom: 10px;"><strong>Course / Program:</strong> ${userCourse}</div>
            <div style="margin-bottom: 10px;"><strong>Semester:</strong> ${userSemester}</div>
            <div><strong>Student ID:</strong> ${userStudentId}</div>
          </div>
        </div>
      </div>
    `;

    // File Input Listener for Photo Upload
    const avatarInput = document.getElementById('avatar-file-input');
    document.getElementById('btn-change-photo').addEventListener('click', () => {
      avatarInput.click();
    });

    avatarInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Data = event.target.result;
          AuthEngine.updateProfile({ avatar: base64Data });
          showToast('Profile picture updated!', 'success');
          renderWorkspaceShell('profile');
        };
        reader.readAsDataURL(file);
      }
    });

    // Remove Photo Listener
    const removeBtn = document.getElementById('btn-remove-photo');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        AuthEngine.updateProfile({ avatar: null });
        showToast('Profile picture removed.', 'info');
        renderWorkspaceShell('profile');
      });
    }

    document.getElementById('btn-edit-profile').addEventListener('click', () => {
      openModal(`
        <h2 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 16px;">Edit Profile Information</h2>
        <form id="edit-profile-form">
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input type="text" id="edit-name" class="form-input" value="${user.name}" required>
          </div>
          <div class="form-group">
            <label class="form-label">University *</label>
            <input type="text" id="edit-university" class="form-input" value="${user.university || ''}" placeholder="e.g. Stanford University" required>
          </div>
          <div class="form-group">
            <label class="form-label">Course / Program *</label>
            <input type="text" id="edit-course" class="form-input" value="${user.course || user.major || ''}" placeholder="e.g. Computer Science" required>
          </div>
          <div class="form-group">
            <label class="form-label">Semester *</label>
            <input type="text" id="edit-semester" class="form-input" value="${user.semester || ''}" placeholder="e.g. 1st Semester" required>
          </div>
          <div style="display: flex; gap: 12px; margin-top: 20px;">
            <button type="button" id="btn-close-prof-modal" class="btn-sidebar-outline" style="flex:1;">Cancel</button>
            <button type="submit" class="btn-primary" style="flex:1;">Save Changes</button>
          </div>
        </form>
      `);

      document.getElementById('btn-close-prof-modal').addEventListener('click', closeModal);
      document.getElementById('edit-profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('edit-name').value;
        const university = document.getElementById('edit-university').value;
        const course = document.getElementById('edit-course').value;
        const semester = document.getElementById('edit-semester').value;

        AuthEngine.updateProfile({
          name,
          university,
          course,
          major: course,
          semester
        });
        showToast('Profile updated!', 'success');
        closeModal();
        renderWorkspaceShell('profile');
      });
    });
  }

  // ========================================================
  // 11. "ALL CAUGHT UP!" EMPTY STATE VIEW RENDERER
  // ========================================================
  function renderCaughtUpView(container) {
    container.innerHTML = `
      <div class="caught-up-card">
        <div class="caught-up-icon">🎉</div>
        <h1 class="caught-up-title">You're All Caught Up!</h1>
        <p class="caught-up-subtitle">
          Great job staying on top of your work! You have no pending assignments or urgent deadlines right now.
        </p>
        <div style="display: flex; gap: 12px; margin-top: 8px;">
          <a href="#dashboard" class="btn-primary" style="width: auto; padding: 12px 24px;">
            Back to Dashboard
          </a>
          <button id="btn-caught-up-add" class="btn-sidebar-outline" style="padding: 12px 24px;">
            ${Icons.plus} Add New Task
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-caught-up-add').addEventListener('click', openAddTaskModal);
  }

  // ========================================================
  // 10. SETTINGS VIEW RENDERER WITH THEME CUSTOMIZATION
  // ========================================================
  // ========================================================
  // 10. SETTINGS VIEW RENDERER WITH THEME CUSTOMIZATION
  // ========================================================
  function renderSettingsView(container) {
    const settings = DataManager.getSettings();
    const currentTheme = DataManager.getThemeColor();
    const isDarkMode = DataManager.getDarkMode();

    const themeSwatches = [
      { name: 'Royal Blue (Default)', hex: '#0052cc' },
      { name: 'Hyper Purple', hex: '#8b5cf6' },
      { name: 'Emerald Green', hex: '#10b981' },
      { name: 'Sunset Gold', hex: '#f59e0b' },
      { name: 'Electric Pink', hex: '#ec4899' }
    ];

    container.innerHTML = `
      <!-- Appearance / Display Mode Section -->
      <div class="settings-section">
        <h2 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 6px;">Appearance / Display Mode</h2>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px;">
          Choose workspace background display mode. Light and Dark modes operate independently with your chosen accent color.
        </p>

        <div class="mode-segmented-control">
          <button id="btn-mode-light" class="mode-segment-btn ${!isDarkMode ? 'active' : ''}">
            ☀️ Light Mode
          </button>
          <button id="btn-mode-dark" class="mode-segment-btn ${isDarkMode ? 'active' : ''}">
            🌙 Dark Mode
          </button>
        </div>
      </div>

      <!-- Color Theme Customization Section -->
      <div class="settings-section">
        <h2 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 6px;">Accent Theme Color</h2>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px;">
          Select an accent color to customize the workspace identity. Updates buttons, sidebar highlights, rings, and icons.
        </p>

        <div class="theme-presets-row">
          ${themeSwatches.map(swatch => `
            <button class="color-preset-btn ${currentTheme.toLowerCase() === swatch.hex.toLowerCase() ? 'active' : ''}"
                    data-color="${swatch.hex}"
                    style="--swatch-color: ${swatch.hex};"
                    title="${swatch.name}"></button>
          `).join('')}

          <div class="custom-color-wrapper" title="Choose Custom Color">
            <input type="color" id="custom-theme-picker" value="${currentTheme}">
            <span>🎨</span>
          </div>
        </div>
      </div>

      <!-- App Preferences Section -->
      <div class="settings-section">
        <h2 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 16px;">App Preferences</h2>
        
        <div class="setting-row">
          <div>
            <div style="font-weight: 600;">Email Notifications</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Receive deadline reminders for pending tasks.</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="toggle-email-notif" ${settings.emailNotifications ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <div>
            <div style="font-weight: 600;">Sound Effects</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Play audio chime when checking off completed tasks.</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="toggle-sound" ${settings.soundEffects ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <div>
            <div style="font-weight: 600;">System Language</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Select primary workspace language.</div>
          </div>
          <select id="lang-select" class="form-input" style="width: auto;">
            <option value="English">English (US)</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
          </select>
        </div>
      </div>
    `;

    // Appearance Mode Buttons Handlers
    document.getElementById('btn-mode-light').addEventListener('click', () => {
      applyAppearanceMode(false);
      showToast('Light Mode activated!', 'info');
      renderSettingsView(container);
    });

    document.getElementById('btn-mode-dark').addEventListener('click', () => {
      applyAppearanceMode(true);
      showToast('Dark Mode activated!', 'info');
      renderSettingsView(container);
    });

    // Theme Preset Swatches Click Handlers
    container.querySelectorAll('.color-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const hex = btn.getAttribute('data-color');
        applyThemeColor(hex);
        showToast('Accent theme color updated!', 'success');
        renderSettingsView(container);
      });
    });

    // Custom Theme Color Picker Handler
    const customPicker = container.querySelector('#custom-theme-picker');
    if (customPicker) {
      customPicker.addEventListener('input', (e) => {
        applyThemeColor(e.target.value);
      });
      customPicker.addEventListener('change', (e) => {
        showToast('Custom theme color applied!', 'success');
        renderSettingsView(container);
      });
    }

    // Toggle switch listeners
    document.getElementById('toggle-email-notif').addEventListener('change', (e) => {
      DataManager.updateSettings({ emailNotifications: e.target.checked });
      showToast('Notification preference saved.', 'info');
    });

    document.getElementById('toggle-sound').addEventListener('change', (e) => {
      DataManager.updateSettings({ soundEffects: e.target.checked });
      showToast('Sound preference saved.', 'info');
    });
  }
})();
