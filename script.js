// Configuration & Constants
const academicStartDate = new Date("2025-02-09T10:00:00");
const academicTargetDate = new Date("2026-12-02T14:00:00");
const PLStart = new Date("2026-10-14T00:00:00");
const excursionDate = new Date("2026-09-04T07:00:00");
const vacationEndDate = new Date("2026-09-19T23:59:59");

const backgroundGradients = {
  morning: 'from-[#FF8C00] via-[#FFD700] to-[#43E8D8]',
  day: 'from-[#00F2FE] via-[#4FACFE] to-[#00F2FE]',
  evening: 'from-[#FF4500] via-[#FF8C00] to-[#4B0082]',
  night: 'from-[#000428] via-[#004e92] to-[#000428]'
};

function isWeeklyHoliday(d) {
  return d.getDay() === 5 || d.getDay() === 6; // Friday/Saturday
}

function isExcursionVacation(d) {
  return d >= excursionDate && d <= vacationEndDate;
}

function getWorkingDaysRemaining(now) {
  if (now >= PLStart) return 0;
  let d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let count = 0;
  while (d < PLStart) {
    if (!isWeeklyHoliday(d) && !isExcursionVacation(d)) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

function getTimeOfDay(hour) {
  if (hour >= 5 && hour < 10) return { id: 'morning', icon: '🌅' };
  if (hour >= 10 && hour < 17) return { id: 'day', icon: '🌞' };
  if (hour >= 17 && hour < 21) return { id: 'evening', icon: '🌇' };
  return { id: 'night', icon: '🌙' };
}

// DOM Elements
const body = document.getElementById('body');
const timeIcon = document.getElementById('time-icon');
const mainTitle = document.getElementById('main-title');
const valDays = document.getElementById('val-days');
const valHours = document.getElementById('val-hours');
const valMins = document.getElementById('val-mins');
const valSecs = document.getElementById('val-secs');
const progressBar = document.getElementById('progress-bar');
const progressEmoji = document.getElementById('progress-emoji');
const progressText = document.getElementById('progress-text');
const statTotal = document.getElementById('stat-total');
const statCompleted = document.getElementById('stat-completed');
const statWorking = document.getElementById('stat-working');

// Check Widget Mode
const urlParams = new URLSearchParams(window.location.search);
const isWidgetMode = urlParams.get('widget') === 'true';

if (isWidgetMode) {
  body.classList.add('widget-mode');
}

let lastBgClass = '';

function update() {
  const now = new Date();
  
  // Update background and icon
  const tod = getTimeOfDay(now.getHours());
  const newBgClass = backgroundGradients[tod.id];
  
  if (!isWidgetMode && lastBgClass !== newBgClass) {
    if (lastBgClass) body.classList.remove(...lastBgClass.split(' '));
    body.classList.add(...newBgClass.split(' '));
    lastBgClass = newBgClass;
    timeIcon.innerText = tod.icon;
  }

  // Calculations
  const totalDuration = academicTargetDate.getTime() - academicStartDate.getTime();
  const elapsed = now.getTime() - academicStartDate.getTime();
  const remaining = Math.max(0, academicTargetDate.getTime() - now.getTime());
  
  const totalDays = Math.ceil(totalDuration / (1000 * 60 * 60 * 24));
  let completedDays = Math.floor(elapsed / (1000 * 60 * 60 * 24));
  completedDays = Math.max(0, Math.min(completedDays, totalDays));

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  const progress = Math.max(0, Math.min(1, elapsed / totalDuration));
  const percentage = (progress * 100).toFixed(2);
  const isComplete = remaining === 0;

  // Update DOM
  valDays.innerText = days.toString().padStart(2, '0');
  valHours.innerText = hours.toString().padStart(2, '0');
  valMins.innerText = minutes.toString().padStart(2, '0');
  valSecs.innerText = seconds.toString().padStart(2, '0');

  if (!isWidgetMode) {
    progressBar.style.width = `${percentage}%`;
    progressEmoji.style.left = `${percentage}%`;
    progressText.innerText = `${percentage}%`;
    
    statTotal.innerText = totalDays;
    statCompleted.innerText = completedDays;
    statWorking.innerText = getWorkingDaysRemaining(now);

    if (isComplete) {
      mainTitle.innerText = 'Academic Journey Completed!';
      progressText.classList.remove('text-[#eaffff]', 'drop-shadow-[0_0_12px_rgba(0,255,230,0.8)]');
      progressText.classList.add('text-[#f9d423]', 'drop-shadow-[0_0_15px_#ffaa33]');
    }
  }
}

// PWA Install Logic
let deferredPrompt;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Detect standalone mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  
  if (!isWidgetMode && !isStandalone) {
    installBtn.classList.remove('hidden');
  }
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    installBtn.classList.add('hidden');
  }
  deferredPrompt = null;
});

window.addEventListener('appinstalled', () => {
  installBtn.classList.add('hidden');
});

// Detect iOS devices for PWA manual prompt
const isIOS = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
if (isIOS && !isStandalone && !isWidgetMode) {
  installBtn.innerHTML = '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg> Install on iOS';
  installBtn.classList.remove('hidden');
  installBtn.addEventListener('click', () => {
    alert("To install on iOS:\n1. Tap the Share button in Safari.\n2. Tap 'Add to Home Screen'.");
  });
}

// Start loop
update();
setInterval(update, 1000);
