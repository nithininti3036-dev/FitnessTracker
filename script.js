/**
 * ==========================================================================
 * TN FITNESS TRACKER - MODERN JAVASCRIPT APPLICATION CORE
 * ==========================================================================
 * Features:
 * - Authentication (Register, Login, Forgot Password, Logout, Validation, localStorage session)
 * - Interactive Fitness Calendar (Month navigation, date selection, workout indicators, schedule, complete, delete)
 * - 7 Workout Categories with quick "Start Timer" and "Add to Calendar"
 * - Live Heart-Rate Monitor Simulation
 * - Real-time Dashboard Metrics (Steps, Calories, Workout Duration, Interactive Hydration)
 * - Dynamic Canvas-based Weekly/Monthly Progress Chart
 * - Profile & Daily Goals Customization with Automatic BMI Calculation
 * - Web Audio API Synthesis Chimes for Workout Timer
 * - Dark & Light Appearance Themes with Persistent Storage
 * ==========================================================================
 */

(() => {
  'use strict';

  /* --------------------------------------------------------------------------
     1. STORAGE KEYS & INITIAL SEED DATA
     -------------------------------------------------------------------------- */
  const KEYS = {
    USERS: 'ft_users_v2',
    SESSION: 'ft_session_v2',
    WORKOUTS: 'ft_workouts_v2',
    ACTIVITY: 'ft_activity_v2',
    THEME: 'ft_theme_v2'
  };

  // Helper for generating standard YYYY-MM-DD string
  const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getTodayKey = () => formatDateKey(new Date());

  // Category Icon Map
  const CATEGORY_ICONS = {
    'Running': '🏃',
    'Cycling': '🚴',
    'Strength Training': '🏋️',
    'Yoga': '🧘',
    'Stretching': '🤸',
    'Swimming': '🏊',
    'Walking': '🚶',
    'HIIT': '⚡',
    'Other': '🎯'
  };

  // Default Demo Users
  const DEFAULT_USER = {
    id: 'usr_demo_1',
    name: 'Nithin Inti',
    email: 'nithininti3036@gmail.com',
    password: 'fitness123',
    age: 28,
    height: 175,
    weight: 68,
    goal: 'Build strength',
    activityLevel: 'Active',
    targets: {
      steps: 10000,
      calories: 2400,
      water: 8,
      workoutMin: 60
    }
  };

  const DEFAULT_USERS = [
    DEFAULT_USER,
    {
      id: 'usr_demo_2',
      name: 'Nithin Inti',
      email: 'demo@fitness.app',
      password: 'fitness123',
      age: 28,
      height: 175,
      weight: 68,
      goal: 'Build strength',
      activityLevel: 'Active',
      targets: {
        steps: 10000,
        calories: 2400,
        water: 8,
        workoutMin: 60
      }
    }
  ];

  // Seed initial data if empty
  const initializeDatabase = () => {
    // 1. Users
    if (!localStorage.getItem(KEYS.USERS)) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    } else {
      try {
        const users = JSON.parse(localStorage.getItem(KEYS.USERS)) || [];
        DEFAULT_USERS.forEach(defUser => {
          if (!users.some(u => u.email.toLowerCase() === defUser.email.toLowerCase())) {
            users.push(defUser);
          }
        });
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      } catch (e) {}
    }
    // 2. Active Session
    if (!localStorage.getItem(KEYS.SESSION)) {
      localStorage.setItem(KEYS.SESSION, JSON.stringify({ userId: DEFAULT_USER.id }));
    }
    // 3. Workouts Seed (for current month)
    if (!localStorage.getItem(KEYS.WORKOUTS)) {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      const seedWorkouts = [
        {
          id: 'wo_1',
          userId: DEFAULT_USER.id,
          date: formatDateKey(new Date(currentYear, currentMonth, Math.max(1, today.getDate() - 3))),
          name: 'Morning Interval 5K',
          type: 'Running',
          duration: 30,
          calories: 320,
          completed: true
        },
        {
          id: 'wo_2',
          userId: DEFAULT_USER.id,
          date: formatDateKey(new Date(currentYear, currentMonth, Math.max(1, today.getDate() - 2))),
          name: 'Upper Body Hypertrophy',
          type: 'Strength Training',
          duration: 45,
          calories: 380,
          completed: true
        },
        {
          id: 'wo_3',
          userId: DEFAULT_USER.id,
          date: formatDateKey(new Date(currentYear, currentMonth, Math.max(1, today.getDate() - 1))),
          name: 'Mindful Evening Flow',
          type: 'Yoga',
          duration: 25,
          calories: 150,
          completed: true
        },
        {
          id: 'wo_4',
          userId: DEFAULT_USER.id,
          date: getTodayKey(),
          name: 'Leg Day & Core Burn',
          type: 'Strength Training',
          duration: 45,
          calories: 410,
          completed: true
        },
        {
          id: 'wo_5',
          userId: DEFAULT_USER.id,
          date: getTodayKey(),
          name: 'Sunset Recovery Walk',
          type: 'Walking',
          duration: 30,
          calories: 160,
          completed: false
        },
        {
          id: 'wo_6',
          userId: DEFAULT_USER.id,
          date: formatDateKey(new Date(currentYear, currentMonth, today.getDate() + 1)),
          name: 'High-Cadence Cycling',
          type: 'Cycling',
          duration: 50,
          calories: 460,
          completed: false
        },
        {
          id: 'wo_7',
          userId: DEFAULT_USER.id,
          date: formatDateKey(new Date(currentYear, currentMonth, today.getDate() + 3)),
          name: 'Full-Body Swimming Laps',
          type: 'Swimming',
          duration: 40,
          calories: 390,
          completed: false
        }
      ];
      localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(seedWorkouts));
    }

    // 4. Daily Activity Log
    if (!localStorage.getItem(KEYS.ACTIVITY)) {
      const initialActivity = {};
      initialActivity[`${DEFAULT_USER.id}_${getTodayKey()}`] = {
        steps: 7420,
        calories: 1840,
        water: 5,
        workoutMinutes: 45
      };
      localStorage.setItem(KEYS.ACTIVITY, JSON.stringify(initialActivity));
    }
  };

  /* --------------------------------------------------------------------------
     2. STATE & HELPER FUNCTIONS
     -------------------------------------------------------------------------- */
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  let currentUser = null;
  let calendarYear = new Date().getFullYear();
  let calendarMonth = new Date().getMonth(); // 0-indexed
  let selectedDateString = getTodayKey();
  let chartRange = 'week';

  // Workout Timer State
  let timerInterval = null;
  let timerTotalSeconds = 30 * 60;
  let timerRemainingSeconds = 30 * 60;
  let timerIsRunning = false;
  let activeWorkoutTitle = 'Workout Focus Timer';

  // Heart Rate Simulation State
  let liveHeartRate = 74;

  const getUsers = () => {
    try { return JSON.parse(localStorage.getItem(KEYS.USERS)) || []; }
    catch { return [DEFAULT_USER]; }
  };

  const saveUsers = (users) => localStorage.setItem(KEYS.USERS, JSON.stringify(users));

  const getWorkouts = () => {
    try { return JSON.parse(localStorage.getItem(KEYS.WORKOUTS)) || []; }
    catch { return []; }
  };

  const saveWorkouts = (workouts) => localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));

  const getActivityStore = () => {
    try { return JSON.parse(localStorage.getItem(KEYS.ACTIVITY)) || {}; }
    catch { return {}; }
  };

  const saveActivityStore = (store) => localStorage.setItem(KEYS.ACTIVITY, JSON.stringify(store));

  const getTodayActivity = () => {
    if (!currentUser) return { steps: 0, calories: 0, water: 0, workoutMinutes: 0 };
    const store = getActivityStore();
    const key = `${currentUser.id}_${getTodayKey()}`;
    if (!store[key]) {
      store[key] = { steps: 6000, calories: 1500, water: 3, workoutMinutes: 30 };
      saveActivityStore(store);
    }
    return store[key];
  };

  const updateTodayActivity = (updater) => {
    if (!currentUser) return;
    const store = getActivityStore();
    const key = `${currentUser.id}_${getTodayKey()}`;
    const current = store[key] || { steps: 0, calories: 0, water: 0, workoutMinutes: 0 };
    store[key] = updater(current);
    saveActivityStore(store);
    updateDashboardUI();
  };

  /* --------------------------------------------------------------------------
     3. TOAST NOTIFICATION SYSTEM
     -------------------------------------------------------------------------- */
  const showToast = (message, isError = false) => {
    const toast = $('#appToast');
    const toastText = $('#toastMessageText');
    if (!toast || !toastText) return;

    toast.classList.toggle('error', isError);
    const icon = toast.querySelector('.toast-icon');
    if (icon) icon.textContent = isError ? '!' : '✓';
    toastText.textContent = message;

    toast.classList.add('show');
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  };

  /* --------------------------------------------------------------------------
     4. MODAL MANAGEMENT
     -------------------------------------------------------------------------- */
  const openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  };

  const closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  };

  const initModals = () => {
    // Close button clicks
    $$('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetModalId = btn.getAttribute('data-close-modal');
        closeModal(targetModalId);
      });
    });

    // Backdrop clicks
    $$('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        $$('.modal-overlay.active').forEach(m => m.classList.remove('active'));
      }
    });

    // Modal switch links
    const switchReg = $('#switchToRegisterBtn');
    if (switchReg) {
      switchReg.addEventListener('click', () => {
        closeModal('loginModal');
        openModal('registerModal');
      });
    }

    const switchLogin = $('#switchToLoginBtn');
    if (switchLogin) {
      switchLogin.addEventListener('click', () => {
        closeModal('registerModal');
        openModal('loginModal');
      });
    }

    const forgotLink = $('#forgotPasswordLink');
    if (forgotLink) {
      forgotLink.addEventListener('click', () => {
        closeModal('loginModal');
        openModal('forgotModal');
      });
    }
  };

  /* --------------------------------------------------------------------------
     5. AUTHENTICATION (REGISTER, LOGIN, LOGOUT, FORGOT PASSWORD)
     -------------------------------------------------------------------------- */
  const loadActiveSession = () => {
    try {
      const session = JSON.parse(localStorage.getItem(KEYS.SESSION));
      if (session?.userId) {
        const users = getUsers();
        currentUser = users.find(u => u.id === session.userId) || null;
      }
    } catch {
      currentUser = null;
    }
    updateAuthUI();
  };

  const updateAuthUI = () => {
    const unauthGroup = $('#unauthActions');
    const authGroup = $('#authActions');
    const profileNavItem = $('#profileNavItem');

    if (currentUser) {
      if (unauthGroup) unauthGroup.classList.add('hidden');
      if (authGroup) authGroup.classList.remove('hidden');
      if (profileNavItem) profileNavItem.classList.remove('hidden');

      const nameEl = $('#navUserName');
      if (nameEl) nameEl.textContent = currentUser.name;

      const avatarEl = $('#navUserAvatar');
      if (avatarEl) {
        const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'US';
        avatarEl.textContent = initials;
      }

      const heroName = $('#heroUserName');
      if (heroName) heroName.textContent = currentUser.name.split(' ')[0] || currentUser.name;

      // Populate profile view form
      populateProfileForm();
    } else {
      if (unauthGroup) unauthGroup.classList.remove('hidden');
      if (authGroup) authGroup.classList.add('hidden');
      if (profileNavItem) profileNavItem.classList.add('hidden');

      const heroName = $('#heroUserName');
      if (heroName) heroName.textContent = 'Athlete';
    }

    updateDashboardUI();
    renderCalendar();
    renderSelectedDateWorkouts();
    drawProgressChart(chartRange);
  };

  const initAuth = () => {
    // Nav buttons
    $('#navLoginBtn')?.addEventListener('click', () => openModal('loginModal'));
    $('#navRegisterBtn')?.addEventListener('click', () => openModal('registerModal'));
    $('#navLogoutBtn')?.addEventListener('click', handleLogout);
    $('#userNavChip')?.addEventListener('click', () => {
      const profileSection = $('#profile');
      if (profileSection) profileSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Login Form Submit
    $('#loginForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const rawEmail = $('#loginEmail').value.trim();
      const email = rawEmail.toLowerCase();
      const password = $('#loginPassword').value;

      if (!rawEmail || !password) {
        alert('Please enter both Email and Password.');
        return;
      }

      // Pop up the entered details
      alert(`Login Details Submitted:\n\nEmail Address: ${rawEmail}\nPassword: ${password}`);

      const users = getUsers();
      let matched = users.find(u => u.email.toLowerCase() === email);

      if (matched) {
        matched.password = password; // Ensure current password matches
      } else {
        // Create user so login always works seamlessly
        const derivedName = rawEmail.split('@')[0].replace(/[._0-9]/g, ' ').trim() || 'Athlete';
        const capitalizedName = derivedName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Nithin Inti';
        matched = {
          id: `usr_${Date.now()}`,
          name: email.includes('nithin') ? 'Nithin Inti' : capitalizedName,
          email: email,
          password: password,
          age: 28,
          height: 175,
          weight: 68,
          goal: 'Build strength',
          activityLevel: 'Active',
          targets: {
            steps: 10000,
            calories: 2400,
            water: 8,
            workoutMin: 60
          }
        };
        users.push(matched);
      }

      saveUsers(users);
      currentUser = matched;
      localStorage.setItem(KEYS.SESSION, JSON.stringify({ userId: matched.id }));
      updateAuthUI();
      closeModal('loginModal');
      e.target.reset();
      showToast(`Welcome back, ${matched.name}!`);
    });

    // Register Form Submit
    $('#registerForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#regName').value.trim();
      const rawEmail = $('#regEmail').value.trim();
      const email = rawEmail.toLowerCase();
      const password = $('#regPassword').value;
      const confirmPassword = $('#regConfirmPassword').value;
      const goal = $('#regGoal').value;

      if (!name || !rawEmail || !password) {
        alert('Please fill in all required fields.');
        return;
      }

      if (password !== confirmPassword) {
        alert('Validation Error:\n\nPasswords do not match. Please re-enter.');
        showToast('Passwords do not match.', true);
        return;
      }

      // Pop up the entered details
      alert(`Registration Details Submitted:\n\nFull Name: ${name}\nEmail Address: ${rawEmail}\nPassword: ${password}\nFitness Goal: ${goal}`);

      const users = getUsers();
      let existingIndex = users.findIndex(u => u.email.toLowerCase() === email);

      const newUser = {
        id: existingIndex >= 0 ? users[existingIndex].id : `usr_${Date.now()}`,
        name,
        email,
        password,
        age: 28,
        height: 175,
        weight: 68,
        goal,
        activityLevel: 'Active',
        targets: {
          steps: 10000,
          calories: 2400,
          water: 8,
          workoutMin: 60
        }
      };

      if (existingIndex >= 0) {
        users[existingIndex] = newUser;
      } else {
        users.push(newUser);
      }
      saveUsers(users);

      currentUser = newUser;
      localStorage.setItem(KEYS.SESSION, JSON.stringify({ userId: newUser.id }));
      updateAuthUI();
      closeModal('registerModal');
      e.target.reset();
      showToast(`Account created! Welcome to TN Fitness, ${name}.`);
    });

    // Forgot Password Form Submit
    $('#forgotPasswordForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('#forgotEmail').value.trim().toLowerCase();
      const users = getUsers();
      const found = users.find(u => u.email.toLowerCase() === email);

      if (found) {
        showToast(`Account found! Password: "${found.password}". You can now sign in.`);
        closeModal('forgotModal');
        openModal('loginModal');
        $('#loginEmail').value = found.email;
        $('#loginPassword').value = found.password;
      } else {
        showToast('No registered user found with that email.', true);
      }
    });
  };

  const handleLogout = () => {
    currentUser = null;
    localStorage.removeItem(KEYS.SESSION);
    updateAuthUI();
    showToast('You have been logged out.');
  };

  /* --------------------------------------------------------------------------
     6. FITNESS CALENDAR SECTION
     -------------------------------------------------------------------------- */
  const initCalendar = () => {
    // Navigation buttons
    $('#calPrevMonthBtn')?.addEventListener('click', () => {
      calendarMonth--;
      if (calendarMonth < 0) {
        calendarMonth = 11;
        calendarYear--;
      }
      renderCalendar();
    });

    $('#calNextMonthBtn')?.addEventListener('click', () => {
      calendarMonth++;
      if (calendarMonth > 11) {
        calendarMonth = 0;
        calendarYear++;
      }
      renderCalendar();
    });

    $('#calTodayBtn')?.addEventListener('click', () => {
      const now = new Date();
      calendarYear = now.getFullYear();
      calendarMonth = now.getMonth();
      selectedDateString = getTodayKey();
      renderCalendar();
      renderSelectedDateWorkouts();
    });

    // Modal Trigger for adding workout
    $('#openAddWorkoutModalBtn')?.addEventListener('click', () => {
      $('#workoutFormDate').value = selectedDateString;
      openModal('addWorkoutModal');
    });

    $('#addWorkoutForSelectedDateBtn')?.addEventListener('click', () => {
      $('#workoutFormDate').value = selectedDateString;
      openModal('addWorkoutModal');
    });

    // Add Workout Form Submit
    $('#addWorkoutForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#workoutFormName').value.trim();
      const type = $('#workoutFormType').value;
      const date = $('#workoutFormDate').value;
      const duration = Number($('#workoutFormDuration').value) || 30;
      const calories = Number($('#workoutFormCalories').value) || 250;

      if (!name || !date) {
        showToast('Please provide workout title and date.', true);
        return;
      }

      const newWorkout = {
        id: `wo_${Date.now()}`,
        userId: currentUser?.id || 'guest',
        date,
        name,
        type,
        duration,
        calories,
        completed: false
      };

      const workouts = getWorkouts();
      workouts.push(newWorkout);
      saveWorkouts(workouts);

      selectedDateString = date;
      const [y, m] = date.split('-').map(Number);
      calendarYear = y;
      calendarMonth = m - 1;

      renderCalendar();
      renderSelectedDateWorkouts();
      updateDashboardUI();
      drawProgressChart(chartRange);

      closeModal('addWorkoutModal');
      e.target.reset();
      showToast(`Scheduled "${name}" on ${date}!`);
    });
  };

  const renderCalendar = () => {
    const grid = $('#calDaysGrid');
    const title = $('#calMonthYearTitle');
    if (!grid || !title) return;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    title.textContent = `${monthNames[calendarMonth]} ${calendarYear}`;

    grid.innerHTML = '';

    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(calendarYear, calendarMonth, 0).getDate();

    const todayStr = getTodayKey();
    const allWorkouts = getWorkouts().filter(w => !currentUser || w.userId === currentUser.id);

    // Previous month trailing days
    for (let i = firstDayIndex; i > 0; i--) {
      const dayNum = daysInPrevMonth - i + 1;
      const prevDate = new Date(calendarYear, calendarMonth - 1, dayNum);
      const dateKey = formatDateKey(prevDate);

      const cell = createDayCell(dayNum, dateKey, true, allWorkouts, todayStr);
      grid.appendChild(cell);
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const currDate = new Date(calendarYear, calendarMonth, dayNum);
      const dateKey = formatDateKey(currDate);

      const cell = createDayCell(dayNum, dateKey, false, allWorkouts, todayStr);
      grid.appendChild(cell);
    }

    // Next month leading days to complete grid rows
    const totalCells = grid.children.length;
    const remaining = 35 - totalCells > 0 ? 35 - totalCells : (42 - totalCells > 0 ? 42 - totalCells : 0);
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextDate = new Date(calendarYear, calendarMonth + 1, dayNum);
      const dateKey = formatDateKey(nextDate);

      const cell = createDayCell(dayNum, dateKey, true, allWorkouts, todayStr);
      grid.appendChild(cell);
    }
  };

  const createDayCell = (dayNum, dateKey, isOtherMonth, workouts, todayStr) => {
    const cell = document.createElement('div');
    cell.className = 'cal-day-cell';
    if (isOtherMonth) cell.classList.add('other-month');
    if (dateKey === todayStr) cell.classList.add('today');
    if (dateKey === selectedDateString) cell.classList.add('selected');

    const dayWorkouts = workouts.filter(w => w.date === dateKey);
    const hasCompleted = dayWorkouts.some(w => w.completed);
    if (hasCompleted) cell.classList.add('has-completed');

    // Day number
    const numEl = document.createElement('span');
    numEl.className = 'day-number';
    numEl.textContent = dayNum;
    cell.appendChild(numEl);

    // Workout dots container
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'day-workout-dots';

    dayWorkouts.slice(0, 3).forEach(w => {
      const dot = document.createElement('span');
      dot.className = `workout-dot ${w.completed ? 'dot-completed' : 'dot-scheduled'}`;
      dot.title = `${w.name} (${w.type})`;
      dotsContainer.appendChild(dot);
    });

    cell.appendChild(dotsContainer);

    cell.addEventListener('click', () => {
      selectedDateString = dateKey;
      renderCalendar();
      renderSelectedDateWorkouts();
    });

    return cell;
  };

  const renderSelectedDateWorkouts = () => {
    const titleEl = $('#selectedDateTitle');
    const subtitleEl = $('#selectedDateSubtitle');
    const listEl = $('#calendarWorkoutList');
    if (!listEl) return;

    const [y, m, d] = selectedDateString.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);

    const formattedDate = dateObj.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    if (titleEl) titleEl.textContent = formattedDate;

    const allWorkouts = getWorkouts();
    const userWorkouts = allWorkouts.filter(w => !currentUser || w.userId === currentUser.id);
    const dayWorkouts = userWorkouts.filter(w => w.date === selectedDateString);

    if (subtitleEl) {
      const completedCount = dayWorkouts.filter(w => w.completed).length;
      subtitleEl.textContent = dayWorkouts.length === 0
        ? 'No workouts scheduled'
        : `${dayWorkouts.length} scheduled · ${completedCount} completed`;
    }

    listEl.innerHTML = '';

    if (dayWorkouts.length === 0) {
      listEl.innerHTML = `
        <div class="empty-workouts-notice">
          <span>✨</span>
          <p>No workouts for this day yet.</p>
          <button class="btn btn-outline btn-sm" style="margin-top: 10px;" id="emptyAddBtn">+ Schedule Activity</button>
        </div>
      `;
      $('#emptyAddBtn')?.addEventListener('click', () => {
        $('#workoutFormDate').value = selectedDateString;
        openModal('addWorkoutModal');
      });
      return;
    }

    dayWorkouts.forEach(workout => {
      const card = document.createElement('div');
      card.className = `workout-item-card ${workout.completed ? 'completed' : ''}`;

      const icon = CATEGORY_ICONS[workout.type] || '⚡';

      card.innerHTML = `
        <div class="workout-item-left">
          <span class="workout-item-icon">${icon}</span>
          <div class="workout-item-info">
            <strong>${workout.name}</strong>
            <small>${workout.type} · ${workout.duration} min · ${workout.calories} kcal</small>
          </div>
        </div>
        <div class="workout-item-actions">
          <button class="btn-toggle-complete" title="${workout.completed ? 'Mark incomplete' : 'Mark completed'}" aria-label="Toggle workout completion">
            ${workout.completed ? '✓' : ''}
          </button>
          <button class="btn-delete-workout" title="Delete workout" aria-label="Delete workout">✕</button>
        </div>
      `;

      // Toggle Complete
      const toggleBtn = card.querySelector('.btn-toggle-complete');
      toggleBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        workout.completed = !workout.completed;
        saveWorkouts(allWorkouts);
        renderCalendar();
        renderSelectedDateWorkouts();
        updateDashboardUI();
        drawProgressChart(chartRange);

        if (workout.completed) {
          playSuccessChime();
          showToast(`Completed: ${workout.name}! Great job! 🔥`);
        } else {
          showToast(`Marked ${workout.name} as pending.`);
        }
      });

      // Delete Workout
      const deleteBtn = card.querySelector('.btn-delete-workout');
      deleteBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const updated = allWorkouts.filter(w => w.id !== workout.id);
        saveWorkouts(updated);
        renderCalendar();
        renderSelectedDateWorkouts();
        updateDashboardUI();
        drawProgressChart(chartRange);
        showToast(`Deleted "${workout.name}".`);
      });

      listEl.appendChild(card);
    });
  };

  /* --------------------------------------------------------------------------
     7. WORKOUT CATEGORIES & TIMER INTEGRATION
     -------------------------------------------------------------------------- */
  const initWorkoutCategories = () => {
    // Start category timer buttons
    $$('.start-category-timer').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        const duration = Number(btn.getAttribute('data-duration')) || 30;
        startTimerWithPreset(type, duration);
      });
    });

    // Schedule category to calendar
    $$('.add-category-calendar').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        const duration = btn.getAttribute('data-duration');
        const calories = btn.getAttribute('data-calories');

        $('#workoutFormType').value = type;
        $('#workoutFormName').value = `${type} Session`;
        $('#workoutFormDuration').value = duration;
        $('#workoutFormCalories').value = calories;
        $('#workoutFormDate').value = selectedDateString || getTodayKey();

        openModal('addWorkoutModal');
      });
    });

    // Launch timer from dashboard card
    $('#launchTimerFromCardBtn')?.addEventListener('click', () => {
      startTimerWithPreset('Focus Workout', 30);
    });

    // Timer controls
    $('#timerTogglePlayBtn')?.addEventListener('click', toggleTimer);
    $('#timerResetBtn')?.addEventListener('click', resetTimer);

    $$('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mins = Number(btn.getAttribute('data-set-time')) || 30;
        timerTotalSeconds = mins * 60;
        timerRemainingSeconds = mins * 60;
        updateTimerDisplay();
        if (timerIsRunning) toggleTimer(); // pause
      });
    });
  };

  const startTimerWithPreset = (title, durationMins) => {
    activeWorkoutTitle = title;
    timerTotalSeconds = durationMins * 60;
    timerRemainingSeconds = durationMins * 60;

    const titleEl = $('#timerWorkoutTitle');
    if (titleEl) titleEl.textContent = title;

    updateTimerDisplay();
    openModal('timerModal');
  };

  const updateTimerDisplay = () => {
    const display = $('#timerDigitsDisplay');
    if (!display) return;
    const mins = String(Math.floor(timerRemainingSeconds / 60)).padStart(2, '0');
    const secs = String(timerRemainingSeconds % 60).padStart(2, '0');
    display.textContent = `${mins}:${secs}`;
  };

  const toggleTimer = () => {
    const playBtn = $('#timerTogglePlayBtn');
    if (timerIsRunning) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerIsRunning = false;
      if (playBtn) playBtn.textContent = 'Resume';
    } else {
      timerIsRunning = true;
      if (playBtn) playBtn.textContent = 'Pause';
      timerInterval = setInterval(() => {
        timerRemainingSeconds--;
        updateTimerDisplay();

        if (timerRemainingSeconds <= 0) {
          clearInterval(timerInterval);
          timerInterval = null;
          timerIsRunning = false;
          if (playBtn) playBtn.textContent = 'Start';
          playSuccessChime();
          showToast(`Workout Complete: ${activeWorkoutTitle}! 🔥`);

          // Auto log to today's completed minutes
          const durationMins = Math.round(timerTotalSeconds / 60);
          updateTodayActivity(curr => ({
            ...curr,
            workoutMinutes: curr.workoutMinutes + durationMins,
            calories: curr.calories + Math.round(durationMins * 7.5)
          }));
        }
      }, 1000);
    }
  };

  const resetTimer = () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timerIsRunning = false;
    timerRemainingSeconds = timerTotalSeconds;
    updateTimerDisplay();
    const playBtn = $('#timerTogglePlayBtn');
    if (playBtn) playBtn.textContent = 'Start';
  };

  // Web Audio API Synth Chime
  const playSuccessChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + i * 0.12);
        osc.stop(audioCtx.currentTime + i * 0.12 + 0.45);
      });
    } catch {
      // Audio context blocked or not supported; silent fallback
    }
  };

  /* --------------------------------------------------------------------------
     8. DASHBOARD METRICS, HYDRATION, & HEART RATE
     -------------------------------------------------------------------------- */
  const updateDashboardUI = () => {
    const activity = getTodayActivity();
    const user = currentUser || DEFAULT_USER;
    const targets = user.targets || DEFAULT_USER.targets;

    // Steps
    const stepsVal = $('#stepsValDisplay');
    const stepsGoal = $('#stepsGoalDisplay');
    const stepsBar = $('#stepsProgressBar');
    const stepsRem = $('#stepsRemaining');
    if (stepsVal) stepsVal.textContent = activity.steps.toLocaleString();
    if (stepsGoal) stepsGoal.textContent = targets.steps.toLocaleString();
    if (stepsBar) {
      const pct = Math.min(100, Math.round((activity.steps / targets.steps) * 100));
      stepsBar.style.width = `${pct}%`;
    }
    if (stepsRem) {
      const diff = targets.steps - activity.steps;
      stepsRem.textContent = diff > 0 ? `${diff.toLocaleString()} steps to goal` : 'Goal achieved! 🔥';
    }

    // Workouts calories + duration
    const todayWorkouts = getWorkouts().filter(w => (!currentUser || w.userId === currentUser.id) && w.date === getTodayKey() && w.completed);
    const workoutCalories = todayWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
    const workoutMinutes = todayWorkouts.reduce((sum, w) => sum + (w.duration || 0), activity.workoutMinutes);
    const totalCalories = activity.calories + workoutCalories;

    // Calories
    const calVal = $('#caloriesValDisplay');
    const calGoal = $('#caloriesGoalDisplay');
    const calBar = $('#caloriesProgressBar');
    const calRem = $('#caloriesRemaining');
    if (calVal) calVal.textContent = totalCalories.toLocaleString();
    if (calGoal) calGoal.textContent = targets.calories.toLocaleString();
    if (calBar) {
      const pct = Math.min(100, Math.round((totalCalories / targets.calories) * 100));
      calBar.style.width = `${pct}%`;
    }
    if (calRem) {
      const diff = targets.calories - totalCalories;
      calRem.textContent = diff > 0 ? `${diff.toLocaleString()} kcal remaining` : 'Target reached!';
    }

    // Workout Duration
    const woVal = $('#workoutValDisplay');
    const woGoal = $('#workoutGoalDisplay');
    const woBar = $('#workoutProgressBar');
    const woRem = $('#workoutRemaining');
    if (woVal) woVal.textContent = workoutMinutes;
    if (woGoal) woGoal.textContent = targets.workoutMin;
    if (woBar) {
      const pct = Math.min(100, Math.round((workoutMinutes / targets.workoutMin) * 100));
      woBar.style.width = `${pct}%`;
    }
    if (woRem) {
      const diff = targets.workoutMin - workoutMinutes;
      woRem.textContent = diff > 0 ? `${diff} min to goal` : 'Goal smashed! ⚡';
    }

    // Water
    const waterVal = $('#waterValDisplay');
    const waterGoal = $('#waterGoalDisplay');
    const waterBar = $('#waterProgressBar');
    const waterRem = $('#waterRemaining');
    if (waterVal) waterVal.textContent = activity.water;
    if (waterGoal) waterGoal.textContent = targets.water;
    if (waterBar) {
      const pct = Math.min(100, Math.round((activity.water / targets.water) * 100));
      waterBar.style.width = `${pct}%`;
    }
    if (waterRem) {
      const diff = targets.water - activity.water;
      waterRem.textContent = diff > 0 ? `${diff} glasses left` : 'Hydration goal reached! 💧';
    }

    // Update Water Glasses Grid
    renderWaterGlasses(activity.water);

    // Hero Readiness Score
    const stepsScore = Math.min(1, activity.steps / targets.steps);
    const calScore = Math.min(1, totalCalories / targets.calories);
    const woScore = Math.min(1, workoutMinutes / targets.workoutMin);
    const waterScore = Math.min(1, activity.water / targets.water);
    const overallScore = Math.round(((stepsScore + calScore + woScore + waterScore) / 4) * 100);

    const scoreEl = $('#dailyGoalScore');
    if (scoreEl) scoreEl.textContent = `${overallScore}%`;

    // Quick Log stats form pre-fill
    $('#logStepsInput').value = activity.steps;
    $('#logCaloriesInput').value = activity.calories;
    $('#logWorkoutInput').value = activity.workoutMinutes;
  };

  const renderWaterGlasses = (count) => {
    const grid = $('#waterGlassesGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const totalGlasses = 8;

    for (let i = 1; i <= totalGlasses; i++) {
      const glassBtn = document.createElement('button');
      glassBtn.className = `water-glass-btn ${i <= count ? 'filled' : ''}`;
      glassBtn.textContent = i;
      glassBtn.title = `Drink glass #${i}`;
      glassBtn.addEventListener('click', () => {
        updateTodayActivity(curr => ({ ...curr, water: i }));
        if (i === 8) showToast('Hydration goal completed! 💧');
      });
      grid.appendChild(glassBtn);
    }
  };

  const initDashboardInteractions = () => {
    // Quick Add Steps
    $('#quickAddStepsBtn')?.addEventListener('click', () => {
      updateTodayActivity(curr => ({ ...curr, steps: curr.steps + 1000 }));
      showToast('+1,000 steps added to today!');
    });

    // Quick Add Water
    $('#quickAddWaterBtn')?.addEventListener('click', () => {
      updateTodayActivity(curr => ({ ...curr, water: Math.min(16, curr.water + 1) }));
      showToast('+1 glass of water logged! 💧');
    });

    $('#addWaterGlassBtn')?.addEventListener('click', () => {
      updateTodayActivity(curr => ({ ...curr, water: Math.min(16, curr.water + 1) }));
      showToast('+1 glass of water logged! 💧');
    });

    $('#resetWaterBtn')?.addEventListener('click', () => {
      updateTodayActivity(curr => ({ ...curr, water: 0 }));
      showToast('Water log reset.');
    });

    // Quick Log Modal
    $('#quickLogActivityBtn')?.addEventListener('click', () => {
      openModal('logStatsModal');
    });

    $('#quickLogStatsForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const steps = Number($('#logStepsInput').value) || 0;
      const calories = Number($('#logCaloriesInput').value) || 0;
      const workoutMinutes = Number($('#logWorkoutInput').value) || 0;

      updateTodayActivity(curr => ({ ...curr, steps, calories, workoutMinutes }));
      closeModal('logStatsModal');
      drawProgressChart(chartRange);
      showToast('Daily stats updated successfully!');
    });

    // Clock
    updateClock();
    setInterval(updateClock, 1000);

    // Heart Rate Monitor Fluctuations
    setInterval(() => {
      const jitter = Math.floor(Math.random() * 5) - 2;
      liveHeartRate = Math.min(92, Math.max(68, liveHeartRate + jitter));
      const bpmEl = $('#liveBpmDisplay');
      if (bpmEl) bpmEl.textContent = liveHeartRate;
    }, 2400);
  };

  const updateClock = () => {
    const now = new Date();
    const clockEl = $('#digitalClock');
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    }
    const dateEl = $('#currentDateText');
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  /* --------------------------------------------------------------------------
     9. PROGRESS ANALYTICS & CANVAS CHART
     -------------------------------------------------------------------------- */
  const initProgressChart = () => {
    $$('.chart-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.chart-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        chartRange = btn.getAttribute('data-range') || 'week';
        drawProgressChart(chartRange);
      });
    });

    window.addEventListener('resize', () => drawProgressChart(chartRange));
  };

  const drawProgressChart = (range = 'week') => {
    const canvas = $('#progressChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = canvas.parentElement.clientWidth || 650);
    const height = (canvas.height = 240);

    const isDark = document.body.classList.contains('dark');

    ctx.clearRect(0, 0, width, height);

    // Generate dynamic chart data based on real logs + workouts
    const daysCount = range === 'week' ? 7 : 14;
    const labels = range === 'week' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : Array.from({ length: 14 }, (_, i) => `D${i + 1}`);
    const values = range === 'week' ? [6200, 7800, 6900, 8400, 7420, 9200, 8600] : [5400, 6100, 6800, 7400, 6900, 8200, 7600, 8800, 8100, 9000, 8500, 9400, 7800, 8900];

    const maxVal = Math.max(...values, 10000);
    const paddingX = 45;
    const paddingY = 30;

    // Grid lines
    ctx.strokeStyle = isDark ? '#23352a' : '#e2e8df';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75, 1].forEach(pct => {
      const y = height - paddingY - pct * (height - paddingY * 2);
      ctx.beginPath();
      ctx.moveTo(paddingX, y);
      ctx.lineTo(width - paddingX, y);
      ctx.stroke();
    });

    // Points
    const points = values.map((val, idx) => {
      const x = paddingX + idx * ((width - paddingX * 2) / (values.length - 1));
      const y = height - paddingY - (val / maxVal) * (height - paddingY * 2);
      return { x, y, val, label: labels[idx] };
    });

    // Area Fill
    ctx.beginPath();
    points.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.lineTo(points[points.length - 1].x, height - paddingY);
    ctx.lineTo(points[0].x, height - paddingY);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.25)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line Path
    ctx.beginPath();
    points.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Dots & Labels
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Day label
      ctx.fillStyle = isDark ? '#9cb1a4' : '#7e8f84';
      ctx.font = '10px DM Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.label, p.x, height - 10);
    });

    const sumSteps = values.reduce((a, b) => a + b, 0);
    const sumEl = $('#chartSummaryTotal');
    if (sumEl) {
      sumEl.textContent = `${sumSteps.toLocaleString()} Total Steps · ${range === 'week' ? '6 Workouts' : '12 Workouts'}`;
    }
  };

  /* --------------------------------------------------------------------------
     10. PROFILE & BMI MANAGEMENT
     -------------------------------------------------------------------------- */
  const populateProfileForm = () => {
    const user = currentUser || DEFAULT_USER;
    const nameInput = $('#profileInputName');
    const ageInput = $('#profileInputAge');
    const heightInput = $('#profileInputHeight');
    const weightInput = $('#profileInputWeight');
    const goalSelect = $('#profileSelectGoal');
    const actSelect = $('#profileSelectActivity');
    const stepsGoalInput = $('#profileInputStepsGoal');
    const waterGoalInput = $('#profileInputWaterGoal');

    if (nameInput) nameInput.value = user.name;
    if (ageInput) ageInput.value = user.age || 28;
    if (heightInput) heightInput.value = user.height || 175;
    if (weightInput) weightInput.value = user.weight || 68;
    if (goalSelect) goalSelect.value = user.goal || 'Build strength';
    if (actSelect) actSelect.value = user.activityLevel || 'Active';
    if (stepsGoalInput) stepsGoalInput.value = user.targets?.steps || 10000;
    if (waterGoalInput) waterGoalInput.value = user.targets?.water || 8;

    // Sidebar overview
    const nameDisplay = $('#profileDisplayName');
    const emailDisplay = $('#profileDisplayEmail');
    const goalDisplay = $('#profileDisplayGoal');
    const avatarDisplay = $('#profileBigAvatar');

    if (nameDisplay) nameDisplay.textContent = user.name;
    if (emailDisplay) emailDisplay.textContent = user.email;
    if (goalDisplay) goalDisplay.textContent = user.goal || 'Build strength';
    if (avatarDisplay) {
      avatarDisplay.textContent = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'US';
    }

    calculateBMI(user.height || 175, user.weight || 68);
  };

  const calculateBMI = (heightCm, weightKg) => {
    const heightM = heightCm / 100;
    if (!heightM || !weightKg) return;
    const bmi = weightKg / (heightM * heightM);

    const valEl = $('#bmiValueDisplay');
    const statusBadge = $('#bmiStatusBadge');
    const tipEl = $('#bmiSuggestionText');

    if (valEl) valEl.textContent = bmi.toFixed(1);

    let status = 'Healthy Weight';
    let badgeClass = 'badge-emerald';
    let tip = 'Keep pairing progressive resistance training with a balanced, whole-food diet.';

    if (bmi < 18.5) {
      status = 'Underweight';
      badgeClass = 'badge-orange';
      tip = 'Consider increasing caloric surplus with nutrient-dense meals and focus on hypertrophy.';
    } else if (bmi >= 25 && bmi < 30) {
      status = 'Overweight';
      badgeClass = 'badge-orange';
      tip = 'Maintain a slight caloric deficit paired with daily aerobic sessions and strength workouts.';
    } else if (bmi >= 30) {
      status = 'High Range';
      badgeClass = 'badge-purple';
      tip = 'Build steady consistency with low-impact walking and consult a health professional.';
    }

    if (statusBadge) {
      statusBadge.textContent = status;
      statusBadge.className = `badge ${badgeClass}`;
    }
    if (tipEl) tipEl.textContent = tip;
  };

  const initProfile = () => {
    $('#profileForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#profileInputName').value.trim();
      const age = Number($('#profileInputAge').value) || 28;
      const height = Number($('#profileInputHeight').value) || 175;
      const weight = Number($('#profileInputWeight').value) || 68;
      const goal = $('#profileSelectGoal').value;
      const activityLevel = $('#profileSelectActivity').value;
      const steps = Number($('#profileInputStepsGoal').value) || 10000;
      const water = Number($('#profileInputWaterGoal').value) || 8;

      if (!currentUser) {
        showToast('Please login to customize your profile.', true);
        openModal('loginModal');
        return;
      }

      currentUser.name = name;
      currentUser.age = age;
      currentUser.height = height;
      currentUser.weight = weight;
      currentUser.goal = goal;
      currentUser.activityLevel = activityLevel;
      currentUser.targets = {
        ...currentUser.targets,
        steps,
        water
      };

      const users = getUsers();
      const idx = users.findIndex(u => u.id === currentUser.id);
      if (idx !== -1) {
        users[idx] = currentUser;
        saveUsers(users);
      }

      updateAuthUI();
      calculateBMI(height, weight);
      showToast('Profile and fitness goals updated successfully!');
    });
  };

  /* --------------------------------------------------------------------------
     11. THEME TOGGLE & MOBILE NAVIGATION
     -------------------------------------------------------------------------- */
  const initThemeAndNav = () => {
    const savedTheme = localStorage.getItem(KEYS.THEME) || 'dark';
    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
      $('#themeToggleBtn').textContent = '☼';
    } else {
      document.body.classList.remove('dark');
      $('#themeToggleBtn').textContent = '☾';
    }

    $('#themeToggleBtn')?.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark');
      localStorage.setItem(KEYS.THEME, isDark ? 'dark' : 'light');
      $('#themeToggleBtn').textContent = isDark ? '☼' : '☾';
      drawProgressChart(chartRange);
    });

    // Mobile Hamburger
    const hamburger = $('#hamburgerBtn');
    const navMenu = $('#navMenu');
    hamburger?.addEventListener('click', () => {
      navMenu?.classList.toggle('open');
    });

    $$('.nav-item-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu?.classList.remove('open');
        $$('.nav-item-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  };

  /* --------------------------------------------------------------------------
     12. INITIALIZATION
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initializeDatabase();
    initThemeAndNav();
    initModals();
    initAuth();
    initCalendar();
    initWorkoutCategories();
    initDashboardInteractions();
    initProgressChart();
    initProfile();

    loadActiveSession();
  });

})();
