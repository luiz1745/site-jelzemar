/* EkuliTech - Carrinho de compras (funciona em todas as páginas) */
(function () {
  var KEY = 'ekuli-cart';
  var fmt = function (n) { return new Intl.NumberFormat('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(n) + ' Kz'; };
  var esc = function (t) { var d = document.createElement('div'); d.textContent = t == null ? '' : t; return d.innerHTML; };
  function read() { try { var c = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(c) ? c : []; } catch (e) { return []; } }
  function write(c) { localStorage.setItem(KEY, JSON.stringify(c)); render(); }

  var Cart = window.Cart = {
    items: read,
    count: function () { return read().reduce(function (s, i) { return s + i.qty; }, 0); },
    total: function () { return read().reduce(function (s, i) { return s + i.price * i.qty; }, 0); },
    add: function (item) {
      var c = read(), f = c.find(function (i) { return i.id === item.id; });
      if (f) f.qty += 1; else c.push({id: item.id, name: item.name, color: item.color, storage: item.storage, price: item.price, image: item.image, qty: 1});
      write(c); bump();
    },
    setQty: function (id, q) { var c = read(); c.forEach(function (i) { if (i.id === id) i.qty = Math.max(1, Math.min(10, q)); }); write(c); },
    remove: function (id) { write(read().filter(function (i) { return i.id !== id; })); },
    clear: function () { write([]); },
    open: function () { document.getElementById('cart-drawer').classList.add('open'); document.body.style.overflow = 'hidden'; },
    close: function () { document.getElementById('cart-drawer').classList.remove('open'); document.body.style.overflow = ''; }
  };

  var css = '.cart-btn{position:relative;background:transparent;border:2px solid #FFD700;color:#FFD700;width:46px;height:46px;border-radius:50%;font-size:1.15rem;cursor:pointer;transition:.3s;margin-left:10px}' +
  '.cart-btn:hover{background:#FFD700;color:#000}.cart-btn.bump{animation:cbump .5s}@keyframes cbump{40%{transform:scale(1.25)}}' +
  '.cart-badge{position:absolute;top:-8px;right:-8px;background:#e53935;color:#fff;border-radius:50%;min-width:22px;height:22px;font-size:.75rem;font-weight:700;display:none;align-items:center;justify-content:center}' +
  '#cart-drawer{position:fixed;inset:0;z-index:3000;visibility:hidden}#cart-drawer.open{visibility:visible}' +
  '.cd-bg{position:absolute;inset:0;background:rgba(0,0,0,.65);opacity:0;transition:.3s}#cart-drawer.open .cd-bg{opacity:1}' +
  '.cd-panel{position:absolute;top:0;right:0;height:100%;width:min(420px,100%);background:#141414;border-left:2px solid #FFD700;display:flex;flex-direction:column;transform:translateX(100%);transition:.3s}#cart-drawer.open .cd-panel{transform:none}' +
  '.cd-head{display:flex;justify-content:space-between;align-items:center;padding:18px 20px;border-bottom:1px solid #333;font-size:1.2rem;font-weight:700}' +
  '.cd-head button{background:none;border:none;color:#fff;font-size:1.4rem;cursor:pointer}' +
  '.cd-list{flex:1;overflow-y:auto;padding:12px 20px}.cd-empty{text-align:center;color:#aaa;padding:60px 10px}.cd-empty i{font-size:3rem;color:#FFD700;margin-bottom:12px;display:block}' +
  '.cd-item{display:flex;gap:12px;padding:14px 0;border-bottom:1px solid #2a2a2a}.cd-item img{width:70px;height:70px;object-fit:contain;background:#fff;border-radius:8px;padding:4px}' +
  '.cd-info{flex:1;min-width:0}.cd-name{font-weight:600}.cd-var{font-size:.82rem;color:#aaa}.cd-price{color:#FFD700;font-weight:700;margin-top:4px}' +
  '.cd-qty{display:flex;align-items:center;gap:8px;margin-top:6px}.cd-qty button{width:28px;height:28px;border-radius:50%;border:1px solid #555;background:#222;color:#fff;cursor:pointer}.cd-qty button:hover{border-color:#FFD700}' +
  '.cd-rm{background:none;border:none;color:#e57373;cursor:pointer;align-self:flex-start;font-size:1rem}' +
  '.cd-foot{padding:18px 20px;border-top:1px solid #333}.cd-total{display:flex;justify-content:space-between;font-size:1.2rem;font-weight:700;margin-bottom:14px}.cd-total span:last-child{color:#FFD700}' +
  '.cd-go{display:block;width:100%;text-align:center;background:#FFD700;color:#000;padding:14px;border-radius:30px;font-weight:700;text-decoration:none;border:none;cursor:pointer;font-size:1rem}.cd-go:hover{background:#ffed4a}' +
  '.cd-clear{display:block;margin:12px auto 0;background:none;border:none;color:#aaa;cursor:pointer;text-decoration:underline}' +
  '.wa-float{position:fixed;left:20px;bottom:20px;z-index:2000;width:54px;height:54px;border-radius:50%;background:#25D366;color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.8rem;text-decoration:none;box-shadow:0 4px 15px rgba(0,0,0,.4);transition:.3s}.wa-float:hover{transform:scale(1.1)}' +
  '.price-from{color:#FFD700;font-weight:700;font-size:1.15rem;margin:6px 0}.price-from small{color:#aaa;font-weight:400;font-size:.8rem}' +
  '.btn-pay-hint{font-size:.85rem;color:#aaa;margin-top:8px}';

  function init() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var hc = document.querySelector('.header-content');
    if (hc) {
      var b = document.createElement('button'); b.className = 'cart-btn'; b.id = 'cart-btn'; b.setAttribute('aria-label', 'Abrir carrinho');
      b.innerHTML = '<i class="fas fa-shopping-cart"></i><span class="cart-badge" id="cart-badge">0</span>';
      b.onclick = Cart.open; hc.appendChild(b);
    }
    var d = document.createElement('div'); d.id = 'cart-drawer';
    d.innerHTML = '<div class="cd-bg"></div><aside class="cd-panel"><div class="cd-head"><span><i class="fas fa-shopping-cart"></i> Seu Carrinho</span><button aria-label="Fechar">&times;</button></div><div class="cd-list" id="cd-list"></div><div class="cd-foot" id="cd-foot"></div></aside>';
    document.body.appendChild(d);
    d.querySelector('.cd-bg').onclick = Cart.close; d.querySelector('.cd-head button').onclick = Cart.close;
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') Cart.close(); });
    d.addEventListener('click', function (e) {
      var t = e.target.closest('[data-act]'); if (!t) return;
      var id = t.getAttribute('data-id'), it = read().find(function (i) { return i.id === id; });
      if (t.dataset.act === 'plus') Cart.setQty(id, it.qty + 1);
      if (t.dataset.act === 'minus') Cart.setQty(id, it.qty - 1);
      if (t.dataset.act === 'rm') Cart.remove(id);
      if (t.dataset.act === 'clear') Cart.clear();
    });
    var wa = document.createElement('a'); wa.className = 'wa-float'; wa.href = 'https://wa.me/244943400675?text=' + encodeURIComponent('Olá! Vim pelo site da EkuliTech.');
    wa.target = '_blank'; wa.rel = 'noopener'; wa.setAttribute('aria-label', 'WhatsApp'); wa.innerHTML = '<i class="fab fa-whatsapp"></i>'; document.body.appendChild(wa);
    render();
  }
  function bump() { var b = document.getElementById('cart-btn'); if (b) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); } }
  function render() {
    var c = read(), n = Cart.count(), badge = document.getElementById('cart-badge'), list = document.getElementById('cd-list'), foot = document.getElementById('cd-foot');
    if (badge) { badge.textContent = n; badge.style.display = n ? 'flex' : 'none'; }
    if (!list) return;
    if (!c.length) { list.innerHTML = '<div class="cd-empty"><i class="fas fa-box-open"></i>Seu carrinho está vazio.<br>Escolha um iPhone e adicione aqui!</div>'; foot.innerHTML = '<a class="cd-go" href="iphones.html">Ver iPhones</a>'; return; }
    list.innerHTML = c.map(function (i) {
      return '<div class="cd-item"><img src="' + esc(i.image) + '" alt="" onerror="this.style.visibility=\'hidden\'"><div class="cd-info"><div class="cd-name">' + esc(i.name) + '</div><div class="cd-var">' + esc(i.color) + ' · ' + esc(i.storage) + '</div><div class="cd-price">' + fmt(i.price * i.qty) + '</div><div class="cd-qty"><button data-act="minus" data-id="' + esc(i.id) + '">−</button><span>' + i.qty + '</span><button data-act="plus" data-id="' + esc(i.id) + '">+</button></div></div><button class="cd-rm" data-act="rm" data-id="' + esc(i.id) + '" aria-label="Remover"><i class="fas fa-trash"></i></button></div>';
    }).join('');
    foot.innerHTML = '<div class="cd-total"><span>Total</span><span>' + fmt(Cart.total()) + '</span></div><a class="cd-go" href="pagamento.html?cart=1"><i class="fas fa-lock"></i> Finalizar Compra</a><button class="cd-clear" data-act="clear">Limpar carrinho</button>';
  }
  window.addEventListener('storage', render);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
