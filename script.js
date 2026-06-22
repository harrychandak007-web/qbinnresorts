// ── MOBILE NAV ──
const hamburger = document.getElementById('hamburger');
const mobileDrawer = document.getElementById('mobileDrawer');
const mobileBackdrop = document.getElementById('mobileBackdrop');

const focusableSelectors = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

function openMenu() {
  mobileDrawer.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  const firstFocusable = mobileDrawer.querySelector(focusableSelectors);
  if (firstFocusable) firstFocusable.focus();
}
function closeMenu() {
  mobileDrawer.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  hamburger.focus();
}

// Focus trap — cycle Tab/Shift-Tab within open drawer
mobileDrawer.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const focusable = [...mobileDrawer.querySelectorAll(focusableSelectors)];
  if (!focusable.length) return;
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
  } else {
    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

hamburger.addEventListener('click', () => {
  hamburger.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
});
hamburger.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hamburger.click(); }
});
mobileBackdrop.addEventListener('click', closeMenu);
mobileDrawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

// ── AVAILABILITY CALENDAR ──
// Replace this URL with your Airbnb iCal export link:
// Airbnb → Manage Listing → Availability → Export Calendar
const ICAL_URL = 'https://www.airbnb.co.in/calendar/ical/1522245296750708243.ics?t=b5332c9a477e4a388b0aa4fbd428da1d';
const AIRBNB_LISTING_URL = 'https://www.airbnb.co.in/rooms/1522245296750708243';

const CORS_PROXY = 'https://corsproxy.io/?';
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

let bookedRanges = [];
let calOffset = 0; // 0 = show current + next month

function parseIcalDate(str) {
  const s = str.replace(/[TZ]/g, '');
  const y = +s.slice(0,4), m = +s.slice(4,6)-1, d = +s.slice(6,8);
  return new Date(y, m, d);
}

function parseIcal(text) {
  const ranges = [];
  const events = text.split('BEGIN:VEVENT');
  events.shift();
  for (const ev of events) {
    const startMatch = ev.match(/DTSTART[^:]*:(\d{8})/);
    const endMatch   = ev.match(/DTEND[^:]*:(\d{8})/);
    if (startMatch && endMatch) {
      ranges.push({ start: parseIcalDate(startMatch[1]), end: parseIcalDate(endMatch[1]) });
    }
  }
  return ranges;
}

function isBooked(date) {
  const t = date.getTime();
  return bookedRanges.some(r => t >= r.start.getTime() && t < r.end.getTime());
}

function isPast(date) {
  const today = new Date(); today.setHours(0,0,0,0);
  return date < today;
}

function isToday(date) {
  const today = new Date();
  return date.getFullYear() === today.getFullYear() &&
         date.getMonth() === today.getMonth() &&
         date.getDate() === today.getDate();
}

function renderMonth(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let html = `<div class="cal-month">
    <div class="cal-month-title">${MONTHS[month]} ${year}</div>
    <div class="cal-days-header">${DAY_LABELS.map(d => `<div class="cal-day-label">${d}</div>`).join('')}</div>
    <div class="cal-grid-days">`;
  for (let i = 0; i < firstDay; i++) html += `<div class="cal-cell empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    let cls = 'cal-cell';
    if (isPast(date))      cls += ' past';
    else if (isBooked(date)) cls += ' booked';
    else                   cls += ' available';
    if (isToday(date))     cls += ' today';
    html += `<div class="${cls}">${d}</div>`;
  }
  html += `</div></div>`;
  return html;
}

function renderCalendar() {
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth() + calOffset, 1);
  const m1y = base.getFullYear(), m1m = base.getMonth();
  const m2 = new Date(m1y, m1m + 1, 1);
  document.getElementById('calNavTitle').textContent = `${MONTHS[m1m]} – ${MONTHS[m2.getMonth()]} ${m2.getFullYear()}`;
  document.getElementById('calMonths').innerHTML = renderMonth(m1y, m1m) + renderMonth(m2.getFullYear(), m2.getMonth());
  document.getElementById('calPrev').disabled = calOffset <= 0;
  document.getElementById('calPrev').style.opacity = calOffset <= 0 ? '0.3' : '1';
}

async function loadCalendar() {
  const status = document.getElementById('calStatus');
  if (ICAL_URL === 'YOUR_AIRBNB_ICAL_URL_HERE') {
    status.textContent = 'Add your Airbnb iCal URL to activate live availability.';
    status.className = 'cal-status error';
    renderCalendar();
    return;
  }
  try {
    status.textContent = 'Loading availability...';
    status.className = 'cal-status loading';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(CORS_PROXY + encodeURIComponent(ICAL_URL), { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('fetch failed');
    const text = await res.text();
    bookedRanges = parseIcal(text);
    status.textContent = bookedRanges.length
      ? `Calendar synced — ${bookedRanges.length} bookings loaded.`
      : 'All dates currently available.';
    status.className = 'cal-status';
  } catch (e) {
    const isTimeout = e.name === 'AbortError';
    status.textContent = isTimeout
      ? 'Calendar is taking too long to load. Message us on WhatsApp to confirm availability.'
      : 'Could not load live availability — check back on Airbnb for confirmed dates.';
    status.className = 'cal-status error';
  }
  renderCalendar();
}

document.getElementById('calPrev').addEventListener('click', () => { if (calOffset > 0) { calOffset--; renderCalendar(); } });
document.getElementById('calNext').addEventListener('click', () => { calOffset++; renderCalendar(); });

// Defer iCal fetch until availability section is near the viewport
const calSection = document.getElementById('availability');
const calObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadCalendar();
    calObserver.disconnect();
  }
}, { rootMargin: '200px' });
calObserver.observe(calSection);

// Nav scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });


// Scroll-triggered entrance animations (progressive enhancement)
document.body.classList.add('js-animate');
const fadeEls = document.querySelectorAll('.fade-up, .fade-left, .fade-right');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.1 });
fadeEls.forEach(el => observer.observe(el));

// ── GALLERY FILTERS ──
const filterBtns = document.querySelectorAll('.gallery-filter-btn');
const masonryItems = document.querySelectorAll('.gallery-masonry .gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    filterBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    masonryItems.forEach(item => {
      const show = filter === 'all' || item.dataset.category === filter;
      item.style.display = show ? '' : 'none';
    });
  });
});

// ── GALLERY LIGHTBOX ──
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCount = document.getElementById('lightboxCount');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

// Featured image + all masonry images in order
const featuredEl = document.getElementById('galleryFeatured');
const featuredImgEl = featuredEl.querySelector('img');
const masonryImgEls = [...document.querySelectorAll('.gallery-masonry .gallery-item img')];
const galleryItems = [featuredImgEl, ...masonryImgEls];
let currentIndex = 0;

function openLightbox(index) {
  currentIndex = index;
  const img = galleryItems[currentIndex];
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCount.textContent = `${currentIndex + 1} / ${galleryItems.length}`;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function showNext() {
  currentIndex = (currentIndex + 1) % galleryItems.length;
  openLightbox(currentIndex);
}

function showPrev() {
  currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
  openLightbox(currentIndex);
}

// Featured click
featuredEl.addEventListener('click', () => openLightbox(0));
featuredEl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(0); } });

// Masonry item clicks
masonryImgEls.forEach((img, i) => {
  img.parentElement.addEventListener('click', () => openLightbox(i + 1));
  img.parentElement.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i + 1); }
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', e => { e.stopPropagation(); showPrev(); });
lightboxNext.addEventListener('click', e => { e.stopPropagation(); showNext(); });
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

// Keyboard nav
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') showNext();
  if (e.key === 'ArrowLeft') showPrev();
});

// Touch swipe
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) diff > 0 ? showNext() : showPrev();
});

// Mark selects as touched on change for validation styling
document.querySelectorAll('.contact-form select').forEach(sel => {
  sel.addEventListener('change', () => sel.classList.add('touched'));
});

// ── Lead notification (Web3Forms) ──────────────────────────────────────
// Get a free access key at https://web3forms.com — enter sanika@qbinnresorts.com
// Paste the key below. Leave as-is until then; WhatsApp still works without it.
const WEB3FORMS_KEY = '0170768a-789a-4c88-8e43-080bad0520c7';

async function notifyByEmail(fields) {
  if (WEB3FORMS_KEY === 'YOUR_WEB3FORMS_ACCESS_KEY') return; // not yet configured
  try {
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        from_name: 'Qbinn Tusker Website',
        subject: `New enquiry from ${fields.name}`,
        ...fields,
      }),
    });
  } catch (_) { /* silent — WhatsApp is the primary channel */ }
}

// Form → email notification + WhatsApp
async function handleSubmit(e) {
  e.preventDefault();
  const f = e.target;
  const name = `${f.fname.value} ${f.lname.value}`;
  const phone = f.phone.value;
  const checkin = f.checkin.value;
  const checkout = f.checkout.value;
  const guests = f.guests.value;
  const message = f.message.value;

  // Fire email notification (non-blocking)
  notifyByEmail({
    name,
    phone,
    'Check-in': checkin,
    'Check-out': checkout,
    Guests: guests,
    Message: message || '—',
  });

  // Open WhatsApp as before
  const text = `Hi, I'd like to enquire about a stay at Qbinn Tusker.%0A%0AName: ${encodeURIComponent(name)}%0APhone: ${encodeURIComponent(phone)}%0ACheck-in: ${checkin}%0ACheck-out: ${checkout}%0AGuests: ${guests}${message ? `%0ARequest: ${encodeURIComponent(message)}` : ''}`;
  window.open(`https://wa.me/917676617129?text=${text}`, '_blank');
}