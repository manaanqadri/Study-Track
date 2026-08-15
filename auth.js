/**
 * ========================================================
 * STUDY TRACK - MODULAR AUTHENTICATION ENGINE
 * ========================================================
 * Handles local user registry, session storage, protected
 * route guards, demo OAuth flows, and password recovery.
 */

(function () {
  const USERS_STORAGE_KEY = 'studytrack_users';
  const SESSION_STORAGE_KEY = 'studytrack_session';

  // Seed default demo user if missing
  function initializeDefaultUsers() {
    const existing = localStorage.getItem(USERS_STORAGE_KEY);
    if (!existing) {
      const defaultUsers = [
        {
          id: 'user-1',
          name: 'Manaan Qadri',
          email: 'student@university.edu',
          password: 'password123',
          major: 'Computer Science',
          university: 'State University',
          gpa: '3.8',
          credits: '42'
        }
      ];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
    }
  }

  initializeDefaultUsers();

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  const AuthEngine = {
    // Check if user has an active session
    isAuthenticated() {
      const session = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
      return !!session;
    },

    // Retrieve active logged in user profile
    getCurrentUser() {
      const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!sessionStr) return null;
      try {
        return JSON.parse(sessionStr);
      } catch (e) {
        return null;
      }
    },

    // Login logic
    login(email, password, rememberMe = false) {
      const users = getUsers();
      const normalizedEmail = (email || '').trim().toLowerCase();
      const user = users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === password);

      if (!user) {
        return { success: false, message: 'Invalid email or password. Try student@university.edu / password123' };
      }

      const sessionData = JSON.stringify(user);
      if (rememberMe) {
        localStorage.setItem(SESSION_STORAGE_KEY, sessionData);
      } else {
        sessionStorage.setItem(SESSION_STORAGE_KEY, sessionData);
      }

      return { success: true, user };
    },

    // Demo Google OAuth sign-in flow
    demoGoogleLogin() {
      const users = getUsers();
      let user = users.find(u => u.email === 'student@university.edu');
      if (!user) {
        user = {
          id: 'user-google-demo',
          name: 'Manaan Qadri',
          email: 'student@university.edu',
          password: 'password123',
          major: 'Computer Science',
          university: 'State University',
          gpa: '3.8',
          credits: '42'
        };
        users.push(user);
        saveUsers(users);
      }

      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      return { success: true, user };
    },

    // Registration logic
    register(name, email, password) {
      const users = getUsers();
      const normalizedEmail = (email || '').trim().toLowerCase();

      if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
        return { success: false, message: 'An account with this email already exists.' };
      }

      const newUser = {
        id: 'user-' + Date.now(),
        name: name.trim(),
        email: normalizedEmail,
        password: password,
        major: 'General Student',
        university: 'University Workspace',
        gpa: '4.0',
        credits: '12'
      };

      users.push(newUser);
      saveUsers(users);

      // Auto login
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));

      return { success: true, user: newUser };
    },

    // Password Recovery Simulation
    forgotPassword(email) {
      const users = getUsers();
      const normalizedEmail = (email || '').trim().toLowerCase();
      const exists = users.some(u => u.email.toLowerCase() === normalizedEmail);

      if (!exists && normalizedEmail !== 'student@university.edu') {
        return { success: false, message: 'No account found with this email address.' };
      }

      return {
        success: true,
        message: 'Password reset link sent! Check your inbox for instructions.'
      };
    },

    // Profile updates
    updateProfile(updatedFields) {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return false;

      const users = getUsers();
      const index = users.findIndex(u => u.id === currentUser.id);
      
      const updatedUser = { ...currentUser, ...updatedFields };
      if (index !== -1) {
        users[index] = updatedUser;
      } else {
        users.push(updatedUser);
      }
      saveUsers(users);

      if (localStorage.getItem(SESSION_STORAGE_KEY)) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
      } else {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
      }

      return updatedUser;
    },

    // Logout logic
    logout() {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return true;
    }
  };

  window.AuthEngine = AuthEngine;
})();
