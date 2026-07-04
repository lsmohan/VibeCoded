// Sundarakandam Parayana Planner JS
// Author: Antigravity Code Assistant
// Date: July 2026

(function() {
  // DOM Elements
  const btnSettingsToggle = document.getElementById('btn-settings-toggle');
  const btnSettingsClose = document.getElementById('btn-settings-close');
  const overlaySettings = document.getElementById('overlay-settings');
  
  const badgeDayNumber = document.getElementById('badge-day-number');
  const lblReadingHeader = document.getElementById('lbl-reading-header');
  const lblTodayDate = document.getElementById('lbl-today-date');
  const lblChaptersRange = document.getElementById('lbl-chapters-range');
  const lblChaptersDesc = document.getElementById('lbl-chapters-desc');
  const listSargasChecklist = document.getElementById('list-sargas-checklist');
  const btnCompleteDay = document.getElementById('btn-complete-day');
  
  const ringProgressBar = document.getElementById('ring-progress-bar');
  const lblProgressPercent = document.getElementById('lbl-progress-percent');
  const lblStatDaysComplete = document.getElementById('lbl-stat-days-complete');
  const lblStatChaptersRead = document.getElementById('lbl-stat-chapters-read');
  const lblStatCompletionDate = document.getElementById('lbl-stat-completion-date');
  
  const btnFilterAll = document.getElementById('btn-filter-all');
  const btnFilterPending = document.getElementById('btn-filter-pending');
  const btnFilterCompleted = document.getElementById('btn-filter-completed');
  const listScheduleDays = document.getElementById('list-schedule-days');
  
  const inputStartDate = document.getElementById('input-start-date');
  const inputAnchorDay = document.getElementById('input-anchor-day');
  const btnAlignSchedule = document.getElementById('btn-align-schedule');
  const btnResetCycle = document.getElementById('btn-reset-cycle');
  
  const overlayCompletion = document.getElementById('overlay-completion');
  const lblCompletedStartDate = document.getElementById('lbl-completed-start-date');
  const lblCompletedEndDate = document.getElementById('lbl-completed-end-date');
  const btnNewCycle = document.getElementById('btn-new-cycle');

  // Application State
  let state = {
    startDate: '', // YYYY-MM-DD
    completedDays: [], // Array of numbers (1-68)
    completedChapters: {}, // Map of dayNumber -> Array of chapterNumbers (1-68)
    selectedDay: 1, // Currently viewed day (1-68)
    currentFilter: 'all' // 'all', 'pending', 'completed'
  };

  // Sargas summary meanings / brief titles (adds depth and contextual feel to the app)
  // Sundarakandam chapters 1-68 have specific events. We can include short labels for the chapters.
  const sargaLabels = {
    1: "Hanuman's flight across the ocean",
    2: "Entering Lanka & search begins",
    3: "Hanuman defeats Lankini",
    4: "Observing Lanka at night",
    5: "Search in Ravana's palace",
    6: "Exploring Ravana's mansion",
    7: "Sight of the Pushpaka Vimana",
    8: "Pushpaka Vimana descriptions",
    9: "Ravana's inner chambers",
    10: "Beholding sleeping Ravana",
    11: "Searching among the women",
    12: "Hanuman's despondency",
    13: "Entering the Ashoka Vatika",
    14: "Ashoka Vatika beauty",
    15: "Sighting Seetha Devi",
    16: "Hanuman's grief for Seetha",
    17: "Seetha surrounded by demonesses",
    18: "Ravana enters Ashoka Vatika",
    19: "Seetha's extreme sorrow",
    20: "Ravana woos Seetha",
    21: "Seetha rejects Ravana",
    22: "Ravana's two-month warning",
    23: "Demonesses persuade Seetha",
    24: "Seetha stands firm",
    25: "Seetha laments her fate",
    26: "Seetha contemplates suicide",
    27: "Trijata's auspicious dream",
    28: "Seetha feels good omens",
    29: "Good omens manifest",
    30: "Hanuman decides to speak",
    31: "Hanuman narrates Rama's story",
    32: "Seetha sees Hanuman",
    33: "Hanuman queries Seetha",
    34: "Seetha doubts Hanuman",
    35: "Hanuman describes Rama's qualities",
    36: "Hanuman gives the Signet Ring",
    37: "Seetha refuses Hanuman's offer",
    38: "The story of the Crow (Kakashura)",
    39: "Seetha asks for urgent rescue",
    40: "Hanuman takes leave",
    41: "Hanuman destroys Ashoka Vatika",
    42: "Kinkaras (soldiers) defeated",
    43: "Chaitya temple destroyed",
    44: "Jambumali slain",
    45: "Seven sons of ministers killed",
    46: "Five commanders destroyed",
    47: "Aksha Kumar slain",
    48: "Indrajit captures Hanuman",
    49: "Hanuman in Ravana's court",
    50: "Prahasta questions Hanuman",
    51: "Hanuman advises Ravana",
    52: "Vibhishana saves Hanuman's life",
    53: "Hanuman's tail set on fire",
    54: "Hanuman burns Lanka",
    55: "Fear for Seetha's safety",
    56: "Hanuman bids farewell to Seetha",
    57: "Hanuman returns across ocean",
    58: "Hanuman narrates Lanka search",
    59: "Hanuman's speech to monkeys",
    60: "Angada proposes return",
    61: "Monkeys enter Madhuvana",
    62: "Destroying Madhuvana",
    63: "Sugreeva rejoices hearing news",
    64: "Monkeys reach Kishkindha",
    65: "Hanuman reports to Rama",
    66: "Rama grieves hearing of Seetha",
    67: "Rama asks for Seetha's message",
    68: "Hanuman describes Seetha's words"
  };

  // Helper: Format Date object to YYYY-MM-DD
  function formatDateString(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Helper: Get local Date object from YYYY-MM-DD string at midnight
  function parseDateString(dateStr) {
    const parts = dateStr.split('-');
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  // Helper: Format date for UI display
  function formatUIDate(date) {
    return date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // Helper: Format date compact
  function formatUIDateCompact(date) {
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // Calculate chapters for Day d (1-68)
  function getChaptersForDay(d) {
    const chapters = [];
    const startIdx = 7 * (d - 1) + 1;
    for (let i = startIdx; i < startIdx + 7; i++) {
      const chap = ((i - 1) % 68) + 1;
      chapters.push(chap);
    }
    return chapters;
  }

  // Calculate Day of Cycle based on target Date and start Date
  function getDayOfCycle(targetDateStr, startDateStr) {
    const target = parseDateString(targetDateStr);
    const start = parseDateString(startDateStr);
    
    // Clear times
    target.setHours(0,0,0,0);
    start.setHours(0,0,0,0);
    
    const diffTime = target.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays + 1; // 1-indexed
  }

  // Load state from localStorage
  function loadState() {
    const savedStart = localStorage.getItem('sundara_startDate');
    const savedDays = localStorage.getItem('sundara_completedDays');
    const savedChaps = localStorage.getItem('sundara_completedChapters');

    if (savedStart) {
      state.startDate = savedStart;
    } else {
      // Set to today
      const today = new Date();
      state.startDate = formatDateString(today);
      localStorage.setItem('sundara_startDate', state.startDate);
    }

    if (savedDays) {
      state.completedDays = JSON.parse(savedDays);
    } else {
      state.completedDays = [];
    }

    if (savedChaps) {
      state.completedChapters = JSON.parse(savedChaps);
    } else {
      state.completedChapters = {};
    }

    // Set selected day to today's day of cycle, capped at 1-68
    const todayStr = formatDateString(new Date());
    const todayDay = getDayOfCycle(todayStr, state.startDate);
    
    if (todayDay >= 1 && todayDay <= 68) {
      state.selectedDay = todayDay;
    } else if (todayDay > 68) {
      state.selectedDay = 68; // default to last day if cycle is over
    } else {
      state.selectedDay = 1; // default to day 1 if started in future
    }
  }

  // Save state to localStorage
  function saveState() {
    localStorage.setItem('sundara_completedDays', JSON.stringify(state.completedDays));
    localStorage.setItem('sundara_completedChapters', JSON.stringify(state.completedChapters));
    localStorage.setItem('sundara_startDate', state.startDate);
  }

  // Render application
  function render() {
    // 1. Update Settings input field value
    inputStartDate.value = state.startDate;

    const todayStr = formatDateString(new Date());
    const todayDay = getDayOfCycle(todayStr, state.startDate);
    
    // 2. Render Today's Reading Panel
    const day = state.selectedDay;
    const isToday = (day === todayDay);
    
    badgeDayNumber.textContent = `Day ${day} of 68`;
    
    if (isToday) {
      lblReadingHeader.textContent = "Today's Reading";
      lblReadingHeader.parentElement.classList.remove('viewing-other');
    } else {
      lblReadingHeader.textContent = `Viewing Day ${day}`;
      lblReadingHeader.parentElement.classList.add('viewing-other');
    }

    const start = parseDateString(state.startDate);
    const selectedDayDate = new Date(start);
    selectedDayDate.setDate(selectedDayDate.getDate() + (day - 1));
    lblTodayDate.textContent = formatUIDate(selectedDayDate) + (isToday ? " (Today)" : "");

    const chapters = getChaptersForDay(day);
    
    // Check if chapters wrap around
    let rangeText = "";
    if (chapters[0] <= chapters[6]) {
      rangeText = `Sargas ${chapters[0]} – ${chapters[6]}`;
    } else {
      // wraps around
      rangeText = `Sargas ${chapters[0]}–68 & 1–${chapters[6]}`;
    }
    lblChaptersRange.textContent = rangeText;

    // Fill the checklist
    listSargasChecklist.innerHTML = "";
    const dayCompletedChaps = state.completedChapters[day] || [];
    
    chapters.forEach(chapNum => {
      const isChecked = dayCompletedChaps.includes(chapNum);
      
      const li = document.createElement('li');
      li.className = `checklist-item ${isChecked ? 'checked' : ''}`;
      li.dataset.chapter = chapNum;
      
      li.innerHTML = `
        <div class="custom-checkbox">
          <svg class="custom-checkbox-check" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div class="checklist-item-text">Sarga ${chapNum}: ${sargaLabels[chapNum] || 'Sargas detail'}</div>
      `;
      
      li.addEventListener('click', () => toggleChapterComplete(day, chapNum));
      listSargasChecklist.appendChild(li);
    });

    // Update main complete button
    const isDayFullyComplete = state.completedDays.includes(day);
    if (isDayFullyComplete) {
      btnCompleteDay.classList.add('completed-btn');
      btnCompleteDay.querySelector('.btn-text').textContent = "Day Completed";
      btnCompleteDay.querySelector('svg').style.display = "block";
    } else {
      btnCompleteDay.classList.remove('completed-btn');
      btnCompleteDay.querySelector('.btn-text').textContent = "Mark Day Completed";
      btnCompleteDay.querySelector('svg').style.display = "none";
    }

    // 3. Render Progress Section
    const completedCount = state.completedDays.length;
    const progressPercent = Math.round((completedCount / 68) * 100);
    lblProgressPercent.textContent = `${progressPercent}%`;

    // Progress Ring offset calculation
    // Dasharray is 314.16 (2 * PI * 50)
    const strokeOffset = 314.16 - (314.16 * completedCount) / 68;
    ringProgressBar.style.strokeDashoffset = strokeOffset;

    lblStatDaysComplete.textContent = `${completedCount} / 68`;

    // Calculate total individual chapters read
    let totalChaptersRead = 0;
    // Each completed day = 7 chapters
    // For partially completed days, count the checked sargas
    for (let d = 1; d <= 68; d++) {
      if (state.completedDays.includes(d)) {
        totalChaptersRead += 7;
      } else {
        const partials = state.completedChapters[d] || [];
        totalChaptersRead += partials.length;
      }
    }
    lblStatChaptersRead.textContent = `${totalChaptersRead} / 476`;

    // Calculate estimated completion date
    const cycleEnd = new Date(start);
    cycleEnd.setDate(cycleEnd.getDate() + 67); // 68 days total
    lblStatCompletionDate.textContent = cycleEnd.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });

    // 4. Render 68-day schedule list
    listScheduleDays.innerHTML = "";
    
    for (let d = 1; d <= 68; d++) {
      const isDayComplete = state.completedDays.includes(d);
      
      // Filter logic
      if (state.currentFilter === 'pending' && isDayComplete) continue;
      if (state.currentFilter === 'completed' && !isDayComplete) continue;

      const cardDate = new Date(start);
      cardDate.setDate(cardDate.getDate() + (d - 1));
      
      const cardChapters = getChaptersForDay(d);
      let cardRange = "";
      if (cardChapters[0] <= cardChapters[6]) {
        cardRange = `Sargas ${cardChapters[0]} – ${cardChapters[6]}`;
      } else {
        cardRange = `Sargas ${cardChapters[0]}–68 & 1–${cardChapters[6]}`;
      }

      const isCardSelected = (d === state.selectedDay);
      const isCardToday = (d === todayDay);
      
      let statusText = "Pending";
      if (isDayComplete) statusText = "Completed";
      else if (isCardToday) statusText = "Today";

      const card = document.createElement('div');
      card.className = `day-card ${isDayComplete ? 'completed' : ''} ${isCardSelected ? 'active-day' : ''} ${isCardToday ? 'today-day' : ''}`;
      card.dataset.day = d;
      
      card.innerHTML = `
        <div class="day-card-left">
          <span class="day-card-num">Day ${d}</span>
          <span class="day-card-date">${formatUIDateCompact(cardDate)}</span>
        </div>
        <div class="day-card-mid">
          <span class="day-card-chaps">${cardRange}</span>
          <span class="day-card-status-text">${statusText}</span>
        </div>
        <div class="day-card-right">
          <div class="status-dot"></div>
          <svg class="day-card-check-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      `;

      card.addEventListener('click', () => {
        state.selectedDay = d;
        render();
      });

      listScheduleDays.appendChild(card);
    }

    // Scroll active/selected card into view on first load if it isn't visible
    // We only do this if it's the active day
    const activeCard = listScheduleDays.querySelector('.day-card.active-day');
    if (activeCard && !listScheduleDays.dataset.scrolled) {
      activeCard.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      listScheduleDays.dataset.scrolled = "true";
    }

    // 5. Check if cycle is completely completed
    // The cycle is completed if all 68 days are completed OR if today is past the end date
    // and we want to offer the user a celebration popup.
    const allCompleted = state.completedDays.length === 68;
    // Show completion screen once all are completed
    if (allCompleted) {
      lblCompletedStartDate.textContent = formatUIDate(parseDateString(state.startDate));
      
      const lastDate = new Date(start);
      lastDate.setDate(lastDate.getDate() + 67);
      lblCompletedEndDate.textContent = formatUIDate(lastDate);
      
      overlayCompletion.classList.add('open');
    } else {
      overlayCompletion.classList.remove('open');
    }
  }

  // Toggle chapter check/uncheck
  function toggleChapterComplete(dayNum, chapNum) {
    if (!state.completedChapters[dayNum]) {
      state.completedChapters[dayNum] = [];
    }

    const idx = state.completedChapters[dayNum].indexOf(chapNum);
    if (idx > -1) {
      // Remove it
      state.completedChapters[dayNum].splice(idx, 1);
    } else {
      // Add it
      state.completedChapters[dayNum].push(chapNum);
    }

    // Check if all 7 chapters of this day are now completed
    const dayChapters = getChaptersForDay(dayNum);
    const dayCompleted = state.completedChapters[dayNum] || [];
    
    const allChecked = dayChapters.every(c => dayCompleted.includes(c));
    const dayIndexInCompleted = state.completedDays.indexOf(dayNum);

    if (allChecked) {
      if (dayIndexInCompleted === -1) {
        state.completedDays.push(dayNum);
      }
    } else {
      if (dayIndexInCompleted > -1) {
        state.completedDays.splice(dayIndexInCompleted, 1);
      }
    }

    saveState();
    render();
  }

  // Toggle entire day completion
  function toggleDayComplete() {
    const dayNum = state.selectedDay;
    const chapters = getChaptersForDay(dayNum);
    const idx = state.completedDays.indexOf(dayNum);

    if (idx > -1) {
      // Mark as incomplete
      state.completedDays.splice(idx, 1);
      // Also uncheck all chapters for this day
      state.completedChapters[dayNum] = [];
    } else {
      // Mark as complete
      state.completedDays.push(dayNum);
      // Check all chapters for this day
      state.completedChapters[dayNum] = [...chapters];
    }

    saveState();
    render();
  }

  // Re-anchor schedule: Adjust start date so that a specific day index aligns with "Today"
  function alignSchedule() {
    const dayNum = parseInt(inputAnchorDay.value, 10);
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 68) {
      alert("Please enter a valid day number between 1 and 68.");
      return;
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    // If dayNum = X, then today = StartDate + (X - 1) days
    // So StartDate = today - (X - 1) days
    const newStart = new Date(today);
    newStart.setDate(newStart.getDate() - (dayNum - 1));

    state.startDate = formatDateString(newStart);
    state.selectedDay = dayNum;
    
    saveState();
    render();
    
    // Auto-scroll list to active day
    delete listScheduleDays.dataset.scrolled;
    
    // Close settings drawer
    overlaySettings.classList.remove('open');
  }

  // Change Start Date directly
  function handleStartDateChange(e) {
    const newDateStr = e.target.value;
    if (!newDateStr) return;
    
    state.startDate = newDateStr;
    saveState();
    render();
  }

  // Reset progress and start over
  function resetParayana() {
    if (!confirm("Are you sure you want to reset your parayana progress? This will clear all checked chapters and days, and set the start date to today.")) {
      return;
    }

    const today = new Date();
    state.startDate = formatDateString(today);
    state.completedDays = [];
    state.completedChapters = {};
    state.selectedDay = 1;
    state.currentFilter = 'all';
    
    // Clear filter buttons active state
    btnFilterAll.classList.add('active');
    btnFilterPending.classList.remove('active');
    btnFilterCompleted.classList.remove('active');

    saveState();
    render();
    
    // Close settings drawer
    overlaySettings.classList.remove('open');
  }

  // Set up event listeners
  function initEvents() {
    // Settings Drawer Open/Close
    btnSettingsToggle.addEventListener('click', () => {
      overlaySettings.classList.add('open');
    });

    btnSettingsClose.addEventListener('click', () => {
      overlaySettings.classList.remove('open');
    });

    // Close settings when clicking backdrop
    overlaySettings.addEventListener('click', (e) => {
      if (e.target === overlaySettings) {
        overlaySettings.classList.remove('open');
      }
    });

    // Start Date change listener
    inputStartDate.addEventListener('change', handleStartDateChange);

    // Schedule Alignment
    btnAlignSchedule.addEventListener('click', alignSchedule);

    // Complete/Incomplete Day Button
    btnCompleteDay.addEventListener('click', toggleDayComplete);

    // Reset Progress Button
    btnResetCycle.addEventListener('click', resetParayana);

    // Start a new cycle from completion overlay
    btnNewCycle.addEventListener('click', () => {
      overlayCompletion.classList.remove('open');
      // Set start date to today and clear everything
      const today = new Date();
      state.startDate = formatDateString(today);
      state.completedDays = [];
      state.completedChapters = {};
      state.selectedDay = 1;
      
      saveState();
      render();
    });

    // Filter Buttons
    btnFilterAll.addEventListener('click', () => {
      state.currentFilter = 'all';
      btnFilterAll.classList.add('active');
      btnFilterPending.classList.remove('active');
      btnFilterCompleted.classList.remove('active');
      render();
    });

    btnFilterPending.addEventListener('click', () => {
      state.currentFilter = 'pending';
      btnFilterAll.classList.remove('active');
      btnFilterPending.classList.add('active');
      btnFilterCompleted.classList.remove('active');
      render();
    });

    btnFilterCompleted.addEventListener('click', () => {
      state.currentFilter = 'completed';
      btnFilterAll.classList.remove('active');
      btnFilterPending.classList.remove('active');
      btnFilterCompleted.classList.add('active');
      render();
    });
  }

  // Initialize App
  document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initEvents();
    render();
    
    // Register Service Worker if supported (Offline PWA)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('Service Worker registered successfully', reg.scope))
        .catch(err => console.error('Service Worker registration failed', err));
    }
  });

})();
