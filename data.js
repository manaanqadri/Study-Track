/**
 * ========================================================
 * STUDY TRACK - DATA MANAGEMENT ENGINE
 * ========================================================
 * Manages assignments, subjects, calendar events, and
 * persistent user-isolated storage via LocalStorage.
 */

(function () {
  function getUserKey() {
    if (window.AuthEngine && typeof window.AuthEngine.getCurrentUser === 'function') {
      const user = window.AuthEngine.getCurrentUser();
      if (user && user.id) return user.id;
      if (user && user.email) return user.email.replace(/[^a-zA-Z0-9]/g, '_');
    }
    return 'anon_guest';
  }

  function getTasksStorageKey() {
    return 'studytrack_tasks_' + getUserKey();
  }

  function getSettingsStorageKey() {
    return 'studytrack_settings_' + getUserKey();
  }

  function getNotifsStorageKey() {
    return 'studytrack_notifications_' + getUserKey();
  }

  const defaultInitialTasks = [
    {
      id: 'task-1',
      title: 'Data Structures Assignment',
      subject: 'Computer Science',
      type: 'Assignment',
      dueDate: '2026-08-16',
      status: 'pending',
      completed: false,
      description: 'Implement binary search trees and heap sort in Java.'
    },
    {
      id: 'task-2',
      title: 'Math Quiz',
      subject: 'Mathematics',
      type: 'Quiz',
      dueDate: '2026-08-18',
      status: 'pending',
      completed: false,
      description: 'Linear algebra and matrix transformation formulas.'
    },
    {
      id: 'task-3',
      title: 'Project Lab Report',
      subject: 'Physics',
      type: 'Lab Report',
      dueDate: '2026-08-13',
      status: 'overdue',
      completed: false,
      description: 'Electromagnetism wave length calculations.'
    },
    {
      id: 'task-4',
      title: 'Database Architecture Exam',
      subject: 'Computer Science',
      type: 'Assignment',
      dueDate: '2026-08-20',
      status: 'pending',
      completed: false,
      description: 'SQL queries, normalization and ER diagrams.'
    }
  ];

  const defaultSubjects = [
    { id: 'sub-1', name: 'Computer Science', code: 'CS-301', color: '#0052cc', instructor: 'Dr. Alan Turing', totalTasks: 12 },
    { id: 'sub-2', name: 'Mathematics', code: 'MATH-202', color: '#8b5cf6', instructor: 'Prof. Katherine Johnson', totalTasks: 8 },
    { id: 'sub-3', name: 'Physics', code: 'PHYS-104', color: '#ec4899', instructor: 'Dr. Richard Feynman', totalTasks: 5 },
    { id: 'sub-4', name: 'Data Structures', code: 'CS-205', color: '#10b981', instructor: 'Prof. Donald Knuth', totalTasks: 3 }
  ];

  const defaultSettings = {
    darkMode: false,
    emailNotifications: true,
    soundEffects: true,
    language: 'English',
    themeColor: '#0052cc'
  };

  const defaultNotifications = [
    { id: 'notif-1', title: 'Assignment Reminder', message: 'Upcoming deadlines in your workspace.', time: '10 mins ago', read: false, type: 'info' },
    { id: 'notif-2', title: 'Welcome to Study Track', message: 'Your personalized academic account is ready.', time: '1 hour ago', read: false, type: 'success' }
  ];

  const DataManager = {
    getTasks() {
      const key = getTasksStorageKey();
      try {
        const stored = localStorage.getItem(key);
        if (stored !== null) return JSON.parse(stored);
        
        const initialTasks = [];
        localStorage.setItem(key, JSON.stringify(initialTasks));
        return initialTasks;
      } catch (e) {
        return [];
      }
    },

    saveTasks(tasks) {
      localStorage.setItem(getTasksStorageKey(), JSON.stringify(tasks));
    },

    addTask(taskData) {
      const tasks = this.getTasks();
      const newTask = {
        id: 'task-' + Date.now(),
        title: taskData.title,
        subject: taskData.subject || 'General',
        type: taskData.type || 'Assignment',
        dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
        status: 'pending',
        completed: false,
        description: taskData.description || ''
      };
      tasks.unshift(newTask);
      this.saveTasks(tasks);
      this.addNotification('New Task Added', `"${newTask.title}" (${newTask.subject}) has been added to your workspace.`, 'info');
      return newTask;
    },

    updateTask(id, updatedFields) {
      const tasks = this.getTasks();
      const index = tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updatedFields };
        this.saveTasks(tasks);
        return tasks[index];
      }
      return null;
    },

    toggleTaskCompletion(id) {
      const tasks = this.getTasks();
      const task = tasks.find(t => t.id === id);
      if (task) {
        task.completed = !task.completed;
        task.status = task.completed ? 'completed' : 'pending';
        this.saveTasks(tasks);
        if (task.completed) {
          this.addNotification('Task Completed', `Great job! "${task.title}" was marked as completed.`, 'success');
        }
        return task;
      }
      return null;
    },

    deleteTask(id) {
      let tasks = this.getTasks();
      const task = tasks.find(t => t.id === id);
      tasks = tasks.filter(t => t.id !== id);
      this.saveTasks(tasks);
      if (task) {
        this.addNotification('Task Deleted', `"${task.title}" was removed.`, 'info');
      }
      return true;
    },

    getSubjects() {
      return defaultSubjects;
    },

    getStatsSummary() {
      const tasks = this.getTasks();
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed).length;
      const pending = tasks.filter(t => !t.completed && t.status !== 'overdue').length;
      const overdue = tasks.filter(t => t.status === 'overdue' && !t.completed).length;
      const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 100;

      return {
        total,
        completed,
        pending,
        overdue,
        progressPercent
      };
    },

    getSettings() {
      const key = getSettingsStorageKey();
      try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
        localStorage.setItem(key, JSON.stringify(defaultSettings));
        return defaultSettings;
      } catch (e) {
        return defaultSettings;
      }
    },

    getDarkMode() {
      const settings = this.getSettings();
      return !!settings.darkMode;
    },

    setDarkMode(isDark) {
      return this.updateSettings({ darkMode: !!isDark });
    },

    getThemeColor() {
      const settings = this.getSettings();
      return settings.themeColor || '#0052cc';
    },

    setThemeColor(color) {
      return this.updateSettings({ themeColor: color });
    },

    updateSettings(updatedFields) {
      const settings = { ...this.getSettings(), ...updatedFields };
      localStorage.setItem(getSettingsStorageKey(), JSON.stringify(settings));
      return settings;
    },

    getNotifications() {
      const key = getNotifsStorageKey();
      try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
        localStorage.setItem(key, JSON.stringify(defaultNotifications));
        return defaultNotifications;
      } catch (e) {
        return defaultNotifications;
      }
    },

    saveNotifications(notifs) {
      localStorage.setItem(getNotifsStorageKey(), JSON.stringify(notifs));
    },

    addNotification(title, message, type = 'info') {
      const notifs = this.getNotifications();
      const newNotif = {
        id: 'notif-' + Date.now(),
        title,
        message,
        time: 'Just now',
        read: false,
        type
      };
      notifs.unshift(newNotif);
      this.saveNotifications(notifs);
      return newNotif;
    },

    deleteNotification(id) {
      let notifs = this.getNotifications();
      notifs = notifs.filter(n => n.id !== id);
      this.saveNotifications(notifs);
      return notifs;
    },

    markNotificationRead(id) {
      const notifs = this.getNotifications();
      const item = notifs.find(n => n.id === id);
      if (item) {
        item.read = true;
        this.saveNotifications(notifs);
      }
      return notifs;
    },

    markAllNotificationsRead() {
      const notifs = this.getNotifications();
      notifs.forEach(n => n.read = true);
      this.saveNotifications(notifs);
      return notifs;
    },

    getUnreadNotificationCount() {
      const notifs = this.getNotifications();
      return notifs.filter(n => !n.read).length;
    }
  };

  window.DataManager = DataManager;
})();


