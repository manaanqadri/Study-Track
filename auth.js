/**
 * ========================================================
 * STUDY TRACK - MODULAR AUTHENTICATION ENGINE
 * ========================================================
 * Handles local user registry, user-specific profiles,
 * session storage, protected route guards, demo OAuth flows,
 * and password recovery.
 */

(function () {
  const USERS_STORAGE_KEY = 'studytrack_users';
  const SESSION_STORAGE_KEY = 'studytrack_session';

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

    // Retrieve active logged-in user profile dynamically from registry
    getCurrentUser() {
      const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!sessionStr) return null;
      try {
        const sessionUser = JSON.parse(sessionStr);
        if (!sessionUser) return null;
        const users = getUsers();
        // Lookup latest fresh user profile by id or email
        const freshUser = users.find(u =>
          (sessionUser.id && u.id === sessionUser.id) ||
          (sessionUser.email && u.email && u.email.toLowerCase() === sessionUser.email.toLowerCase())
        );
        return freshUser || sessionUser;
      } catch (e) {
        return null;
      }
    },

    // Login logic
    login(email, password, rememberMe = false) {
      const users = getUsers();
      const normalizedEmail = (email || '').trim().toLowerCase();
      const user = users.find(u => u.email && u.email.toLowerCase() === normalizedEmail && u.password === password);

      if (!user) {
        return { success: false, message: 'Invalid email or password. Please check your credentials or create an account.' };
      }

      const sessionData = JSON.stringify(user);
      if (rememberMe) {
        localStorage.setItem(SESSION_STORAGE_KEY, sessionData);
      } else {
        sessionStorage.setItem(SESSION_STORAGE_KEY, sessionData);
      }

      return { success: true, user };
    },

    // Dynamic Google OAuth sign-in flow
    demoGoogleLogin(providedName, providedEmail) {
      const users = getUsers();
      const normalizedEmail = (providedEmail || '').trim().toLowerCase();
      if (!normalizedEmail) {
        return { success: false, message: 'Please enter a valid Google email address.' };
      }

      const emailPrefix = normalizedEmail.split('@')[0];
      const fallbackName = emailPrefix ? (emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)) : 'Google User';
      const displayName = (providedName || '').trim() || fallbackName;
      const googleId = 'google_user_' + normalizedEmail.replace(/[^a-z0-9]/g, '_');

      let user = users.find(u =>
        (u.id === googleId) ||
        (u.email && u.email.toLowerCase() === normalizedEmail)
      );

      if (!user) {
        user = {
          id: googleId,
          name: displayName,
          email: normalizedEmail,
          password: 'google_oauth_session',
          isGoogleUser: true,
          course: '',
          major: '',
          university: '',
          semester: '',
          gpa: '0.0',
          credits: '0',
          studentId: 'STU-' + Math.floor(10000 + Math.random() * 90000),
          avatar: null
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

      if (users.some(u => u.email && u.email.toLowerCase() === normalizedEmail)) {
        return { success: false, message: 'An account with this email already exists.' };
      }

      const newUser = {
        id: 'user-' + Date.now(),
        name: name.trim(),
        email: normalizedEmail,
        password: password,
        course: '',
        major: '',
        university: '',
        semester: '',
        gpa: '0.0',
        credits: '0',
        studentId: 'STU-' + Math.floor(10000 + Math.random() * 90000),
        avatar: null
      };

      users.push(newUser);
      saveUsers(users);

      // Auto login after register
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));

      return { success: true, user: newUser };
    },

    // Password Recovery Simulation
    forgotPassword(email) {
      const users = getUsers();
      const normalizedEmail = (email || '').trim().toLowerCase();
      const exists = users.some(u => u.email && u.email.toLowerCase() === normalizedEmail);

      if (!exists) {
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
      const index = users.findIndex(u =>
        (currentUser.id && u.id === currentUser.id) ||
        (currentUser.email && u.email && u.email.toLowerCase() === currentUser.email.toLowerCase())
      );

      const updatedUser = { ...currentUser, ...updatedFields };
      if (index !== -1) {
        users[index] = updatedUser;
      } else {
        users.push(updatedUser);
      }
      saveUsers(users);

      const sessionData = JSON.stringify(updatedUser);
      let sessionUpdated = false;
      if (localStorage.getItem(SESSION_STORAGE_KEY)) {
        localStorage.setItem(SESSION_STORAGE_KEY, sessionData);
        sessionUpdated = true;
      }
      if (sessionStorage.getItem(SESSION_STORAGE_KEY)) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, sessionData);
        sessionUpdated = true;
      }
      if (!sessionUpdated) {
        localStorage.setItem(SESSION_STORAGE_KEY, sessionData);
      }

      return updatedUser;
    },

    // Logout logic: completely clear session keys from both localStorage and sessionStorage
    logout() {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return true;
    }
  };

  window.AuthEngine = AuthEngine;
})();


