/* ============================================================
   UNDANGAN ONLINE — app.js
   Vanilla JavaScript, tanpa framework, Local Storage only
   ============================================================ */

'use strict';

/* ── Konstanta Storage Keys ── */
const KEY_THEME    = 'uol_theme';
const KEY_NAME     = 'uol_name';
const KEY_POM_DUR  = 'uol_pom_duration';
const KEY_TODOS    = 'uol_todos';
const KEY_LINKS    = 'uol_links';
const KEY_ORDERS   = 'uol_orders';

/* ── Katalog Data ── */
const CATALOG = [
  {
    id: 1, category: 'pernikahan',
    emoji: '💍', name: 'Elegant Rose',
    desc: 'Desain elegan dengan sentuhan bunga mawar, cocok untuk pernikahan mewah.',
    price: 150000
  },
  {
    id: 2, category: 'pernikahan',
    emoji: '🌸', name: 'Sakura Bliss',
    desc: 'Tema sakura Jepang yang romantis dan minimalis.',
    price: 125000
  },
  {
    id: 3, category: 'pernikahan',
    emoji: '🕊️', name: 'Classic White',
    desc: 'Undangan pernikahan klasik putih bersih dengan tipografi serif.',
    price: 100000
  },
  {
    id: 4, category: 'ulang-tahun',
    emoji: '🎂', name: 'Birthday Blast',
    desc: 'Penuh warna dan ceria, sempurna untuk pesta ulang tahun anak.',
    price: 75000
  },
  {
    id: 5, category: 'ulang-tahun',
    emoji: '🎈', name: 'Pastel Party',
    desc: 'Warna pastel lembut untuk ulang tahun yang manis dan estetik.',
    price: 85000
  },
  {
    id: 6, category: 'khitanan',
    emoji: '🌙', name: 'Islami Gold',
    desc: 'Desain islami dengan ornamen emas yang anggun dan bermakna.',
    price: 90000
  },
  {
    id: 7, category: 'khitanan',
    emoji: '⭐', name: 'Bintang Kecil',
    desc: 'Tema bintang yang ceria dan penuh semangat untuk si kecil.',
    price: 70000
  },
  {
    id: 8, category: 'wisuda',
    emoji: '🎓', name: 'Academic Pride',
    desc: 'Desain formal dan profesional untuk merayakan kelulusan.',
    price: 80000
  },
  {
    id: 9, category: 'wisuda',
    emoji: '📜', name: 'Golden Graduate',
    desc: 'Sentuhan emas mewah untuk momen wisuda yang tak terlupakan.',
    price: 95000
  },
  {
    id: 10, category: 'pernikahan',
    emoji: '🌺', name: 'Tropical Dream',
    desc: 'Nuansa tropis yang segar dan modern untuk pasangan muda.',
    price: 110000
  },
];

/* ── Helpers ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const ls = {
  get: (k, def = null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

/* ============================================================
   MODULE: Theme
   ============================================================ */
const Theme = (() => {
  const html = document.documentElement;
  const btn  = $('#btnTheme');

  function apply(theme) {
    html.setAttribute('data-theme', theme);
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.title = theme === 'dark' ? 'Mode Terang' : 'Mode Gelap';
  }

  function init() {
    const saved = ls.get(KEY_THEME, 'light');
    apply(saved);
    btn.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      ls.set(KEY_THEME, next);
    });
  }

  return { init };
})();

/* ============================================================
   MODULE: Greeting (clock + name)
   ============================================================ */
const Greeting = (() => {
  const elText = $('#greetingText');
  const elName = $('#greetingName');
  const elDate = $('#greetingDate');
  const elTime = $('#greetingTime');

  const DAYS   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni',
                  'Juli','Agustus','September','Oktober','November','Desember'];

  function getGreeting(h) {
    if (h >= 5  && h < 12) return 'Selamat Pagi ☀️';
    if (h >= 12 && h < 15) return 'Selamat Siang 🌤️';
    if (h >= 15 && h < 19) return 'Selamat Sore 🌇';
    return 'Selamat Malam 🌙';
  }

  function tick() {
    const now = new Date();
    const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
    elText.textContent = getGreeting(h);
    elDate.textContent = `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    elTime.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function setName(name) {
    elName.textContent = name || 'Pengguna';
  }

  function init() {
    setName(ls.get(KEY_NAME, 'Pengguna'));
    tick();
    setInterval(tick, 1000);

    // Edit name modal
    $('#btnEditName').addEventListener('click', () => {
      $('#inputName').value = ls.get(KEY_NAME, '');
      Modal.open('modalName');
    });

    $('#btnSaveName').addEventListener('click', () => {
      const val = $('#inputName').value.trim();
      if (!val) return;
      ls.set(KEY_NAME, val);
      setName(val);
      Modal.close('modalName');
    });

    $('#inputName').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') $('#btnSaveName').click();
    });
  }

  return { init };
})();

/* ============================================================
   MODULE: Pomodoro
   ============================================================ */
const Pomodoro = (() => {
  const display = $('#pomodoroDisplay');
  const status  = $('#pomodoroStatus');
  const btnStart = $('#btnPomStart');
  const btnStop  = $('#btnPomStop');
  const btnReset = $('#btnPomReset');

  let duration = ls.get(KEY_POM_DUR, 25); // menit
  let remaining = duration * 60;
  let timer = null;
  let running = false;

  function fmt(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function render() {
    display.textContent = fmt(remaining);
  }

  function setRunning(val) {
    running = val;
    btnStart.disabled = val;
    btnStop.disabled  = !val;
  }

  function start() {
    if (running) return;
    setRunning(true);
    status.textContent = '🔥 Sesi fokus sedang berjalan…';
    timer = setInterval(() => {
      remaining--;
      render();
      if (remaining <= 0) {
        clearInterval(timer);
        setRunning(false);
        status.textContent = '🎉 Sesi selesai! Waktunya istirahat.';
        display.textContent = '00:00';
        // Notifikasi browser jika diizinkan
        if (Notification.permission === 'granted') {
          new Notification('Pomodoro Selesai!', { body: 'Waktunya istirahat sejenak 😊' });
        }
      }
    }, 1000);
  }

  function stop() {
    clearInterval(timer);
    setRunning(false);
    status.textContent = '⏸ Timer dijeda.';
  }

  function reset() {
    clearInterval(timer);
    setRunning(false);
    remaining = duration * 60;
    render();
    status.textContent = 'Siap memulai sesi fokus';
  }

  function init() {
    render();
    btnStart.addEventListener('click', start);
    btnStop.addEventListener('click', stop);
    btnReset.addEventListener('click', reset);

    // Edit durasi
    $('#btnEditPomodoro').addEventListener('click', () => {
      $('#inputPomDuration').value = duration;
      Modal.open('modalPomodoro');
    });

    $('#btnSavePomodoro').addEventListener('click', () => {
      const val = parseInt($('#inputPomDuration').value, 10);
      if (!val || val < 1 || val > 120) return;
      duration = val;
      ls.set(KEY_POM_DUR, duration);
      reset();
      Modal.close('modalPomodoro');
    });

    // Minta izin notifikasi
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  return { init };
})();

/* ============================================================
   MODULE: To-Do List
   ============================================================ */
const Todo = (() => {
  const list  = $('#todoList');
  const empty = $('#todoEmpty');
  const form  = $('#todoForm');
  const input = $('#todoInput');

  let todos = ls.get(KEY_TODOS, []);
  let editId = null;

  function save() { ls.set(KEY_TODOS, todos); }

  function render() {
    list.innerHTML = '';
    const visible = todos;
    empty.classList.toggle('hidden', visible.length > 0);

    visible.forEach(todo => {
      const li = document.createElement('li');
      li.className = 'todo__item';
      li.innerHTML = `
        <input type="checkbox" class="todo__check" ${todo.done ? 'checked' : ''} aria-label="Tandai selesai" />
        <span class="todo__text ${todo.done ? 'todo__text--done' : ''}">${escHtml(todo.text)}</span>
        <div class="todo__actions">
          <button class="btn btn--ghost btn--sm" data-action="edit" title="Edit">✏️</button>
          <button class="btn btn--danger btn--sm" data-action="delete" title="Hapus">🗑️</button>
        </div>
      `;

      const cb = li.querySelector('.todo__check');
      cb.addEventListener('change', () => {
        todo.done = cb.checked;
        save();
        render();
      });

      li.querySelector('[data-action="edit"]').addEventListener('click', () => {
        editId = todo.id;
        $('#inputTodoEdit').value = todo.text;
        Modal.open('modalTodo');
      });

      li.querySelector('[data-action="delete"]').addEventListener('click', () => {
        todos = todos.filter(t => t.id !== todo.id);
        save();
        render();
      });

      list.appendChild(li);
    });
  }

  function init() {
    render();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      todos.push({ id: Date.now(), text, done: false });
      save();
      render();
      input.value = '';
      input.focus();
    });

    $('#btnSaveTodo').addEventListener('click', () => {
      const text = $('#inputTodoEdit').value.trim();
      if (!text) return;
      const todo = todos.find(t => t.id === editId);
      if (todo) { todo.text = text; save(); render(); }
      Modal.close('modalTodo');
    });

    $('#inputTodoEdit').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') $('#btnSaveTodo').click();
    });
  }

  return { init };
})();

/* ============================================================
   MODULE: Quick Links
   ============================================================ */
const Links = (() => {
  const container = $('#linkList');
  const empty     = $('#linkEmpty');
  const form      = $('#linkForm');

  let links = ls.get(KEY_LINKS, []);

  function save() { ls.set(KEY_LINKS, links); }

  function getFavicon(url) {
    try {
      const u = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=16`;
    } catch { return ''; }
  }

  function render() {
    container.innerHTML = '';
    empty.classList.toggle('hidden', links.length > 0);

    links.forEach(link => {
      const div = document.createElement('div');
      div.className = 'link__item';
      const favicon = getFavicon(link.url);
      div.innerHTML = `
        ${favicon ? `<img src="${favicon}" width="16" height="16" alt="" onerror="this.style.display='none'" />` : '🔗'}
        <a href="${escAttr(link.url)}" target="_blank" rel="noopener noreferrer" title="${escAttr(link.name)}">${escHtml(link.name)}</a>
        <button class="link__delete" title="Hapus link" aria-label="Hapus ${escAttr(link.name)}">✕</button>
      `;
      div.querySelector('.link__delete').addEventListener('click', () => {
        links = links.filter(l => l.id !== link.id);
        save();
        render();
      });
      container.appendChild(div);
    });
  }

  function init() {
    render();
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#linkName').value.trim();
      const url  = $('#linkUrl').value.trim();
      if (!name || !url) return;
      links.push({ id: Date.now(), name, url });
      save();
      render();
      $('#linkName').value = '';
      $('#linkUrl').value  = '';
      $('#linkName').focus();
    });
  }

  return { init };
})();

/* ============================================================
   MODULE: Catalog
   ============================================================ */
const Catalog = (() => {
  const grid = $('#catalogGrid');
  let activeFilter = 'all';
  let selectedItem = null;

  function filtered() {
    return activeFilter === 'all' ? CATALOG : CATALOG.filter(c => c.category === activeFilter);
  }

  function render() {
    grid.innerHTML = '';
    filtered().forEach(item => {
      const div = document.createElement('div');
      div.className = 'catalog__item';
      div.innerHTML = `
        <div class="catalog__thumb catalog__thumb--placeholder" aria-hidden="true">${item.emoji}</div>
        <div class="catalog__body">
          <span class="catalog__badge">${item.category.replace('-', ' ')}</span>
          <p class="catalog__name">${escHtml(item.name)}</p>
          <p class="catalog__desc">${escHtml(item.desc)}</p>
          <p class="catalog__price">${fmt(item.price)}</p>
        </div>
        <div class="catalog__footer">
          <button class="btn btn--primary" style="width:100%" data-id="${item.id}">📩 Pesan Sekarang</button>
        </div>
      `;
      div.querySelector('button').addEventListener('click', () => openOrder(item));
      grid.appendChild(div);
    });
  }

  function openOrder(item) {
    selectedItem = item;
    $('#orderPreview').innerHTML = `
      <div class="order__preview-emoji">${item.emoji}</div>
      <div class="order__preview-info">
        <p class="order__preview-name">${escHtml(item.name)}</p>
        <p class="order__preview-price">${fmt(item.price)}</p>
      </div>
    `;
    $('#orderForm').reset();
    Modal.open('modalOrder');
  }

  function init() {
    render();

    // Filter buttons
    $$('.btn--filter').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.btn--filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        render();
      });
    });

    // Order form submit
    $('#orderForm').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!selectedItem) return;

      const order = {
        id:        Date.now(),
        itemId:    selectedItem.id,
        itemName:  selectedItem.name,
        itemPrice: selectedItem.price,
        name:      $('#orderName').value.trim(),
        phone:     $('#orderPhone').value.trim(),
        event:     $('#orderEvent').value.trim(),
        date:      $('#orderDate').value,
        notes:     $('#orderNotes').value.trim(),
        createdAt: new Date().toISOString(),
      };

      const orders = ls.get(KEY_ORDERS, []);
      orders.push(order);
      ls.set(KEY_ORDERS, orders);

      Modal.close('modalOrder');

      // Tampilkan sukses
      $('#successMsg').innerHTML = `
        Pesanan <strong>${escHtml(order.itemName)}</strong> untuk acara
        <strong>${escHtml(order.event)}</strong> telah diterima.<br/>
        Kami akan menghubungi <strong>${escHtml(order.name)}</strong>
        di nomor <strong>${escHtml(order.phone)}</strong> segera.
      `;
      Modal.open('modalSuccess');
    });
  }

  return { init };
})();

/* ============================================================
   MODULE: Modal
   ============================================================ */
const Modal = (() => {
  const overlay = $('#overlay');

  function open(id) {
    const modal = $(`#${id}`);
    if (!modal) return;
    modal.classList.add('active');
    overlay.classList.add('active');
    // Fokus ke input pertama jika ada
    const firstInput = modal.querySelector('input, textarea');
    if (firstInput) setTimeout(() => firstInput.focus(), 50);
  }

  function close(id) {
    const modal = $(`#${id}`);
    if (!modal) return;
    modal.classList.remove('active');
    // Tutup overlay hanya jika tidak ada modal lain yang aktif
    if (!$$('.modal.active').length) overlay.classList.remove('active');
  }

  function closeAll() {
    $$('.modal.active').forEach(m => m.classList.remove('active'));
    overlay.classList.remove('active');
  }

  function init() {
    // Tombol dengan data-close
    $$('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => close(btn.dataset.close));
    });

    // Klik overlay tutup semua
    overlay.addEventListener('click', closeAll);

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAll();
    });
  }

  return { open, close, init };
})();

/* ============================================================
   Helpers: XSS prevention
   ============================================================ */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escAttr(str) { return escHtml(str); }

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  Greeting.init();
  Pomodoro.init();
  Todo.init();
  Links.init();
  Catalog.init();
  Modal.init();
});
