/* EkuliTech - Contas, pedidos e chat (Firebase) */
(function () {
  var V = '10.12.2', B = 'https://www.gstatic.com/firebasejs/' + V + '/firebase-';
  var E = window.Ekuli = { configured: false, user: null, admin: false, db: null, auth: null, _cbs: [], _known: false };
  var esc = E.esc = function (t) { var d = document.createElement('div'); d.textContent = t == null ? '' : t; return d.innerHTML; };
  function load(src) { return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }

  E.ready = load('firebase-config.js').catch(function () {}).then(function () {
    var c = window.EKULI_FIREBASE || {};
    E.configured = !!(c.apiKey && c.apiKey.indexOf('COLE') < 0);
    if (!E.configured) { renderHeader(); return; }
    return load(B + 'app-compat.js').then(function () { return load(B + 'auth-compat.js'); }).then(function () { return load(B + 'firestore-compat.js'); }).then(function () {
      firebase.initializeApp(c); E.auth = firebase.auth(); E.db = firebase.firestore();
      return new Promise(function (res) {
        E.auth.onAuthStateChanged(function (u) {
          E.user = u; E.admin = E.isAdmin(u); E._known = true; renderHeader();
          E._cbs.forEach(function (cb) { cb(u); }); res();
        });
      });
    }).catch(function (e) { console.error('Firebase falhou:', e); E.configured = false; renderHeader(); });
  });

  E.isAdmin = function (u) {
    var a = (window.EKULI_ADMINS || []).map(function (x) { return x.toLowerCase(); });
    return !!(u && u.email && u.emailVerified && a.indexOf(u.email.toLowerCase()) > -1);
  };
  E.onUser = function (cb) { E._cbs.push(cb); if (E._known) cb(E.user); };
  E.login = function (e, p) { return E.auth.signInWithEmailAndPassword(e, p); };
  E.register = function (name, e, p) {
    return E.auth.createUserWithEmailAndPassword(e, p).then(function (c) {
      return c.user.updateProfile({ displayName: name }).then(function () { return c.user.sendEmailVerification().catch(function () {}); }).then(function () { return c; });
    });
  };
  E.google = function () { return E.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); };
  E.reset = function (e) { return E.auth.sendPasswordResetEmail(e); };
  E.logout = function () { return E.auth.signOut().then(function () { location.href = 'index.html'; }); };
  E.errMsg = function (e) {
    var m = { 'auth/invalid-credential': 'E-mail ou senha incorretos.', 'auth/wrong-password': 'E-mail ou senha incorretos.', 'auth/user-not-found': 'E-mail ou senha incorretos.', 'auth/email-already-in-use': 'Este e-mail já tem conta. Faça login.', 'auth/weak-password': 'Use uma senha com pelo menos 6 caracteres.', 'auth/invalid-email': 'E-mail inválido.', 'auth/popup-closed-by-user': 'Login cancelado.', 'auth/too-many-requests': 'Muitas tentativas. Espere um pouco.', 'auth/network-request-failed': 'Sem conexão com a internet.', 'permission-denied': 'Sem permissão.' };
    return m[e && (e.code || '')] || 'Algo deu errado. Tente novamente.';
  };

  /* ----- pedidos ----- */
  function snap(s) { return Object.assign({ id: s.id }, s.data()); }
  E.createOrder = function (o) {
    var ref = E.db.collection('orders').doc(), now = Date.now();
    var data = { uid: E.user.uid, email: E.user.email, num: o.num, customerName: o.name, customerPhone: o.phone, address: o.address, city: o.city,
      items: o.items, totalText: o.totalText, total: o.total, status: 0, createdAt: now, updatedAt: now, lastMsg: 'Pedido criado', unreadAdmin: true, unreadUser: false };
    return ref.set(data).then(function () {
      return ref.collection('messages').add({ from: 'sys', text: 'Pedido #' + o.num + ' criado ✅\nFaça a transferência de ' + o.totalText + ' Kz para o IBAN indicado e envie o comprovante aqui no chat. Assim que confirmarmos, preparamos o envio.', t: now });
    }).then(function () { return ref.id; });
  };
  E.watchOrder = function (id, cb) { return E.db.collection('orders').doc(id).onSnapshot(function (s) { cb(s.exists ? snap(s) : null); }, function () { cb(null, true); }); };
  E.watchMessages = function (id, cb) { return E.db.collection('orders').doc(id).collection('messages').orderBy('t').onSnapshot(function (q) { cb(q.docs.map(function (d) { return d.data(); })); }); };
  E.send = function (id, msg, patch) {
    var ref = E.db.collection('orders').doc(id), now = Date.now(), b = E.db.batch(); msg.t = now;
    b.set(ref.collection('messages').doc(), msg); b.update(ref, Object.assign({ updatedAt: now }, patch || {})); return b.commit();
  };
  E.patch = function (id, p) { return E.db.collection('orders').doc(id).update(p); };
  E.myOrders = function (cb) { return E.db.collection('orders').where('uid', '==', E.user.uid).onSnapshot(function (q) { cb(q.docs.map(snap).sort(function (a, b) { return b.updatedAt - a.updatedAt; })); }); };
  E.allOrders = function (cb) { return E.db.collection('orders').onSnapshot(function (q) { cb(q.docs.map(snap)); }); };
  E.statusLabels = ['Aguardando comprovante', 'Comprovante enviado', 'Pagamento confirmado', 'Produto enviado'];
  E.bubbles = function (msgs, asAdmin) {
    return msgs.map(function (m) {
      var mine = asAdmin ? m.from === 'seller' : m.from === 'buyer', cls = m.from === 'sys' ? 'sys' : (mine ? 'buyer' : 'seller');
      var time = new Date(m.t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return '<div class="bubble ' + cls + '">' + (m.img ? '<img src="' + m.img + '" alt="Imagem">' : '') + (m.file ? '📄 ' + esc(m.file) + '<br>' : '') + esc(m.text) + (cls === 'sys' ? '' : '<time>' + time + '</time>') + '</div>';
    }).join('');
  };
  E.compress = function (file, cb) {
    var r = new FileReader(); r.onload = function () { var im = new Image(); im.onload = function () {
      var s = Math.min(1, 900 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL('image/jpeg', .7)); }; im.src = r.result; }; r.readAsDataURL(file);
  };
  E.notify = function (subject, message) {
    var f = new FormData(); f.append('access_key', 'cde1a611-c383-4221-ace4-8e147703ad6f'); f.append('name', 'EkuliTech Site'); f.append('email', 'ekulicompany@gmail.com');
    f.append('subject', subject); f.append('message', message); fetch('https://api.web3forms.com/submit', { method: 'POST', body: f }).catch(function () {});
  };

  /* ----- botão de conta no topo ----- */
  var css = '.auth-box{position:relative;margin-left:12px}.auth-link{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:999px;border:1.5px solid #FFD700;color:#FFD700;text-decoration:none;font-weight:700;font-size:.9rem;white-space:nowrap;transition:.3s}.auth-link:hover{background:#FFD700;color:#000}' +
    '.auth-av{width:46px;height:46px;border-radius:50%;border:0;background:linear-gradient(135deg,#FFD700,#FFB800);color:#000;font-weight:800;font-size:1.1rem;cursor:pointer}' +
    '.auth-menu{display:none;position:absolute;right:0;top:56px;min-width:220px;background:#141414;border:1px solid #333;border-radius:14px;padding:8px;z-index:3500;box-shadow:0 10px 30px rgba(0,0,0,.6)}.auth-menu.open{display:block}' +
    '.auth-menu small{display:block;padding:8px 12px;color:#a1a1aa;border-bottom:1px solid #2a2a2a;margin-bottom:6px;word-break:break-all}.auth-menu a,.auth-menu button{display:block;width:100%;text-align:left;padding:10px 12px;border-radius:8px;color:#fff;text-decoration:none;background:none;border:0;cursor:pointer;font-size:.92rem}.auth-menu a:hover,.auth-menu button:hover{background:#222;color:#FFD700}';
  function renderHeader() {
    if (!document.getElementById('auth-css')) { var st = document.createElement('style'); st.id = 'auth-css'; st.textContent = css; document.head.appendChild(st); }
    function go() {
      var hc = document.querySelector('.header-content'); if (!hc) return;
      var old = document.getElementById('auth-box'); if (old) old.remove();
      var box = document.createElement('div'); box.className = 'auth-box'; box.id = 'auth-box'; var u = E.user;
      if (!u) { box.innerHTML = '<a class="auth-link" href="login.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search) + '"><i class="far fa-user"></i> Entrar</a>'; }
      else {
        var ini = ((u.displayName || u.email || '?')[0] || '?').toUpperCase();
        box.innerHTML = '<button class="auth-av" aria-label="Minha conta">' + esc(ini) + '</button><div class="auth-menu"><small>' + esc(u.displayName || '') + '<br>' + esc(u.email) + '</small><a href="meus-pedidos.html"><i class="fas fa-box"></i> Meus pedidos</a>' + (E.admin ? '<a href="admin.html"><i class="fas fa-user-shield"></i> Painel do dono</a>' : '') + '<button id="auth-out"><i class="fas fa-sign-out-alt"></i> Sair</button></div>';
        box.querySelector('.auth-av').onclick = function (e) { e.stopPropagation(); box.querySelector('.auth-menu').classList.toggle('open'); };
        box.querySelector('#auth-out').onclick = E.logout;
        document.addEventListener('click', function () { var m = box.querySelector('.auth-menu'); if (m) m.classList.remove('open'); });
      }
      var cart = document.getElementById('cart-btn'); hc.insertBefore(box, cart || null);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  }
})();
