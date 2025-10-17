(function(){
  // script.js — Interactividad: carousel, catálogo, carrito, modal, WA, menús

  const PRODUCTS = [
    {id:1,name:'Camiseta Estampada',price:30000,img:'img 1.png',desc:'Camiseta cotton con estampado urbano fit oversize.'},
    {id:2,name:'Short Denim',price:55000,img:'IMG 5.png',desc:'Short jean tiro alto, desgastado sutil.'},
    {id:3,name:'Camiseta Acid Wash',price:50000,img:'b1.png',desc:'Efecto acid wash, look vintage.'},
    {id:4,name:'Blusa Elegante',price:30000,img:'b2.png',desc:'Blusa ligera con detalles fruncidos.'},
    {id:5,name:'Body Street',price:45000,img:'product5.png',desc:'Body ajustado de algodon con breteles.'},
    {id:6,name:'Bolso Tote',price:65000,img:'product6.png',desc:'Bolso grande para todo el día.'}
  ];

  const money = v => v.toLocaleString('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0});

  // RENDER PRODUCTOS (no sobrescribe tarjetas manuales si no existe grid)
  const grid = document.getElementById('product-grid');
  function renderProducts(){
    if(!grid) return;
    grid.innerHTML = '';
    PRODUCTS.forEach(p => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="imgwrap"><img src="${p.img}" alt="${p.name}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'600\\' height=\\'420\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'%230b0b0c\\'/><text x=\\'50%\\' y=\\'50%\\' fill=\\'%23fff\\' font-size=\\'16\\' font-family=\\'Arial\\' text-anchor=\\'middle\\'>${encodeURIComponent(p.name)}<\\/text><\\/svg>'"></div>
        <h3>${p.name}</h3>
        <div class="price">${money(p.price)}</div>
        <div class="actions">
          <button class="small-btn" data-id="${p.id}" aria-label="Ver ${p.name}">Ver</button>
          <button class="small-btn add-btn" data-id="${p.id}" aria-label="Agregar ${p.name}">Agregar</button>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // Carousel (if present)
  (function carouselInit(){
    const slidesEl = document.getElementById('slides');
    if(!slidesEl) return;
    const slides = Array.from(slidesEl.children);
    const nav = document.getElementById('carousel-nav');
    let idx = 0;
    slides.forEach((s,i)=>{
      const dot = document.createElement('div'); dot.className='dot'+(i===0?' active':'');
      dot.addEventListener('click', ()=>{ idx=i; update(); restartInterval(); });
      if(nav) nav.appendChild(dot);
    });
    const dots = nav ? nav.querySelectorAll('.dot') : [];
    function update(){ slidesEl.style.transition='transform 0.6s ease-in-out'; slidesEl.style.transform = `translateX(-${idx*100}%)`; dots.forEach((d,i)=>d.classList.toggle('active', i===idx)); }
    let interval = setInterval(nextSlide, 4000);
    function nextSlide(){ idx=(idx+1)%slides.length; update(); }
    function restartInterval(){ clearInterval(interval); interval = setInterval(nextSlide, 4000); }
    slidesEl.addEventListener('mouseenter', ()=>clearInterval(interval));
    slidesEl.addEventListener('mouseleave', restartInterval);
    window.addEventListener('resize', update);
  })();

  // Mobile menu
  const openMenu = document.getElementById('open-menu');
  const mobileMenu = document.getElementById('mobile-menu');
  if(openMenu && mobileMenu){
    openMenu.addEventListener('click', ()=>{
      const shown = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden', shown);
      openMenu.setAttribute('aria-expanded', String(!shown));
    });
  }

  // Smooth scroll anchors
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const href = a.getAttribute('href');
      if(href && href.length>1){ e.preventDefault(); const el = document.querySelector(href); if(el) el.scrollIntoView({behavior:'smooth',block:'start'}); if(mobileMenu && !mobileMenu.classList.contains('hidden')) mobileMenu.classList.add('hidden'); }
    });
  });

  // Cart (scoped)
  let CART = JSON.parse(localStorage.getItem('swag_cart') || '[]');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartList = document.getElementById('cart-list');
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');

  function saveCart(){ localStorage.setItem('swag_cart', JSON.stringify(CART)); renderCart(); }
  function renderCart(){ if(!cartList) return; cartList.innerHTML=''; let total=0; CART.forEach(item=>{ const p = PRODUCTS.find(x=>x.id===item.id) || {name:'Producto',price:0,img:''}; total += (p.price||0)*item.qty; const el=document.createElement('div'); el.className='cart-item'; el.innerHTML = `<img src="${p.img}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'120\\' height=\\'120\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'%230b0b0c\\'/><text x=\\'50%\\' y=\\'50%\\' fill=\\'%23fff\\' font-size=\\'12\\' font-family=\\'Arial\\' text-anchor=\\'middle\\'>${encodeURIComponent(p.name)}<\\/text><\\/svg>'" /><div class="meta"><p>${p.name}</p><small class="muted">${money(p.price)} x ${item.qty}</small></div><div><button class="small-btn" data-id="${p.id}" data-action="minus">-</button><button class="small-btn" data-id="${p.id}" data-action="plus">+</button></div>`; cartList.appendChild(el); }); if(cartCount) cartCount.textContent = CART.reduce((s,i)=>s+i.qty,0); if(cartTotal) cartTotal.textContent = money(total); }

  function addToCart(id, qty=1){ const found = CART.find(x=>x.id===id); if(found) found.qty += qty; else CART.push({id,qty}); saveCart(); const btn=document.getElementById('open-cart'); if(btn) btn.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:350}); if(cartDrawer) openCart(); }

  function openCart(){ if(cartDrawer){ cartDrawer.classList.add('open'); cartDrawer.setAttribute('aria-hidden','false'); } }
  function closeCart(){ if(cartDrawer){ cartDrawer.classList.remove('open'); cartDrawer.setAttribute('aria-hidden','true'); } }

  const openCartBtn = document.getElementById('open-cart'); if(openCartBtn) openCartBtn.addEventListener('click', ()=>{ if(cartDrawer) cartDrawer.classList.toggle('open'); });

  // Events: delegation
  document.addEventListener('click', (e)=>{
    const t = e.target;
    if(t.matches && t.matches('.add-btn')){ addToCart(Number(t.dataset.id)); }
    if(t.matches && t.matches('.small-btn') && t.dataset.id && !t.classList.contains('add-btn')){ const id = Number(t.dataset.id); const p = PRODUCTS.find(x=>x.id===id); if(p) showProductModal(p); }
    if(t.dataset && t.dataset.action){ const id = Number(t.dataset.id); const action = t.dataset.action; const it = CART.find(x=>x.id===id); if(!it) return; if(action==='plus') it.qty++; else if(action==='minus') it.qty = Math.max(0,it.qty-1); CART = CART.filter(x=>x.qty>0); saveCart(); }
  });

  // Product modal (simple)
  function showProductModal(p){
    const overlay = document.createElement('div'); overlay.style.position='fixed'; overlay.style.inset=0; overlay.style.background='rgba(0,0,0,0.7)'; overlay.style.zIndex=9999; overlay.style.display='flex'; overlay.style.alignItems='center'; overlay.style.justifyContent='center';
    const box = document.createElement('div'); box.style.width='92%'; box.style.maxWidth='880px'; box.style.background='#070707'; box.style.borderRadius='12px'; box.style.padding='16px'; box.style.boxShadow='0 30px 80px rgba(0,0,0,0.8)';
    box.innerHTML = `<div style="display:flex;gap:16px;flex-wrap:wrap"><div style="flex:1 1 360px"><img src="${p.img}" style="width:100%;height:360px;object-fit:contain" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'360\\' height=\\'360\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'%230b0b0c\\'/><text x=\\'50%\\' y=\\'50%\\' fill=\\'%23fff\\' font-size=\\'14\\' font-family=\\'Arial\\' text-anchor=\\'middle\\'>${encodeURIComponent(p.name)}<\\/text><\\/svg>'"></div><div style="flex:1 1 320px"><h3 style="margin-top:0">${p.name}</h3><p class="muted">${p.desc || ''}</p><div style="margin:14px 0;font-weight:700;font-size:18px">${money(p.price)}</div><div style="display:flex;gap:8px"><button class="btn" id="modal-add">Agregar</button><button class="btn ghost" id="modal-close">Cerrar</button></div></div></div>`;
    overlay.appendChild(box); document.body.appendChild(overlay);
    const modalAdd = document.getElementById('modal-add'); const modalClose = document.getElementById('modal-close');
    if(modalAdd) modalAdd.addEventListener('click', ()=>{ addToCart(p.id); document.body.removeChild(overlay); });
    if(modalClose) modalClose.addEventListener('click', ()=>{ document.body.removeChild(overlay); });
    overlay.addEventListener('click', (ev)=>{ if(ev.target===overlay) document.body.removeChild(overlay); });
  }

  // Init
  renderProducts();
  renderCart();

  // Quick buttons
  const verCatalogo = document.getElementById('ver-catalogo'); if(verCatalogo) verCatalogo.addEventListener('click', ()=>{ const el = document.querySelector('#productos'); if(el) el.scrollIntoView({behavior:'smooth'}); });
  const verOfertas = document.getElementById('ver-ofertas'); if(verOfertas) verOfertas.addEventListener('click', ()=>{ const el = document.querySelector('#ofertas'); if(el) el.scrollIntoView({behavior:'smooth'}); });

  // WhatsApp FAB
  const wa = document.getElementById('wa-fab'); const waNumber = '573200000000'; const waMsg = encodeURIComponent('Hola! Estoy interesada en sus productos. ¿Me ayudan con más información?'); if(wa) wa.href = `https://wa.me/${waNumber.replace(/\\s+/g,'')}?text=${waMsg}`;

  // Checkout demo
  const checkoutBtn = document.getElementById('checkout'); if(checkoutBtn) checkoutBtn.addEventListener('click', ()=>{ if(CART.length===0){ alert('Tu carrito está vacío'); return; } const summary = CART.map(i=>{ const p = PRODUCTS.find(x=>x.id===i.id) || {name:'Producto',price:0}; return `${p.name} x ${i.qty} - ${money((p.price||0)*i.qty)}`; }).join('\n'); alert('Resumen de pedido:\n\n'+summary+'\n\nTotal: '+(cartTotal?cartTotal.textContent:'')+'\n\n(En producción: integrar pasarela de pago)'); });

  // Email link
  const emailLink = document.getElementById('email-link'); if(emailLink) emailLink.addEventListener('click', (e)=>{ e.preventDefault(); window.location.href = 'mailto:info@swagqueens.co?subject=Consulta'; });

  // Footer year
  const yearEl = document.getElementById('year'); if(yearEl) yearEl.textContent = new Date().getFullYear();

})();
    

    // CAROUSEL SIMPLE (puntos + autoplay)
    (function carouselInit(){
      const slidesEl = document.getElementById('slides');
      if(!slidesEl) return;

      const slides = Array.from(slidesEl.children);
      const nav = document.getElementById('carousel-nav');
      let idx = 0;

      slides.forEach((s, i) => {
        const dot = document.createElement('div');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => {
          idx = i;
          update();
          restartInterval();
        });
        nav.appendChild(dot);
      });

      const dots = nav.querySelectorAll('.dot');

      function update() {
        slidesEl.style.transition = 'transform 0.6s ease-in-out';
        slidesEl.style.transform = `translateX(-${idx * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      }

      let interval = setInterval(nextSlide, 4000);

      function nextSlide() {
        idx = (idx + 1) % slides.length;
        update();
      }

      function restartInterval() {
        clearInterval(interval);
        interval = setInterval(nextSlide, 4000);
      }

      slidesEl.addEventListener('mouseenter', () => clearInterval(interval));
      slidesEl.addEventListener('mouseleave', restartInterval);
      window.addEventListener('resize', update);
    })();

    // MOBILE MENU
    const openMenu = document.getElementById('open-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    if(openMenu){
      openMenu.addEventListener('click', ()=>{
        const shown = !mobileMenu.classList.contains('hidden');
        mobileMenu.classList.toggle('hidden', shown);
        openMenu.setAttribute('aria-expanded', String(!shown));
      });
    }

    // SMOOTH SCROLL LINKS
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click', e=>{
        const href = a.getAttribute('href');
        if(href.length>1){
          e.preventDefault();
          const el = document.querySelector(href);
          if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
          if(mobileMenu && !mobileMenu.classList.contains('hidden')) mobileMenu.classList.add('hidden');
        }
      });
    });

    // CARRITO (localStorage)
    let CART = JSON.parse(localStorage.getItem('swag_cart') || '[]');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartList = document.getElementById('cart-list');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');

    function saveCart(){ localStorage.setItem('swag_cart', JSON.stringify(CART)); renderCart(); }
    function renderCart(){
      if(!cartList) return;
      cartList.innerHTML='';
      let total = 0;
      CART.forEach(item=>{
        const p = PRODUCTS.find(x=>x.id===item.id) || {name:'Producto',price:0,img:''};
        total += (p.price||0)*item.qty;
        const el = document.createElement('div'); el.className='cart-item';
        el.innerHTML = `<img src="${p.img}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'120\\' height=\\'120\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'%230b0b0c\\'/><text x=\\'50%\\' y=\\'50%\\' fill=\\'%23fff\\' font-size=\\'12\\' font-family=\\'Arial\\' text-anchor=\\'middle\\'>${encodeURIComponent(p.name)}<\\/text><\\/svg>'" /><div class="meta"><p>${p.name}</p><small class="muted">${money(p.price)} x ${item.qty}</small></div><div><button class="small-btn" data-id="${p.id}" data-action="minus">-</button><button class="small-btn" data-id="${p.id}" data-action="plus">+</button></div>`;
        cartList.appendChild(el);
      });
      if(cartCount) cartCount.textContent = CART.reduce((s,i)=>s+i.qty,0);
      if(cartTotal) cartTotal.textContent = money(total);
    }

    function addToCart(id, qty=1){
      const found = CART.find(x=>x.id===id);
      if(found) found.qty += qty; else CART.push({id,qty});
      saveCart();
      const btn = document.getElementById('open-cart');
      if(btn) btn.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:350});
      if(cartDrawer) openCart();
    }

    function openCart(){ if(cartDrawer) { cartDrawer.classList.add('open'); cartDrawer.setAttribute('aria-hidden','false'); } }
    function closeCart(){ if(cartDrawer) { cartDrawer.classList.remove('open'); cartDrawer.setAttribute('aria-hidden','true'); } }

    const openCartBtn = document.getElementById('open-cart');
    if(openCartBtn) openCartBtn.addEventListener('click', ()=>{ if(cartDrawer) cartDrawer.classList.toggle('open'); });

    // Delegate actions: add / view / cart +-
    document.addEventListener('click', (e)=>{
      const t = e.target;
      if(t.matches('.add-btn')){ addToCart(Number(t.dataset.id)); }
      if(t.matches('.small-btn') && t.dataset.id && !t.classList.contains('add-btn')){
        const id = Number(t.dataset.id);
        const p = PRODUCTS.find(x=>x.id===id);
        if(p) showProductModal(p);
      }
      if(t.dataset && t.dataset.action){
        const id = Number(t.dataset.id);
        // script.js — Interactividad: carousel, catálogo, carrito, modal, WA, menús

        // Datos de ejemplo para el catálogo (reemplaza imágenes/rutas por las tuyas)
        const PRODUCTS = [
          {id:1,name:'Camiseta Estampada',price:30000,img:'img 1.png',desc:'Camiseta cotton con estampado urbano fit oversize.'},
          {id:2,name:'Short Denim',price:55000,img:'IMG 5.png',desc:'Short jean tiro alto, desgastado sutil.'},
          {id:3,name:'Camiseta Acid Wash',price:50000,img:'b1.png',desc:'Efecto acid wash, look vintage.'},
          {id:4,name:'Blusa Elegante',price:30000,img:'b2.png',desc:'Blusa ligera con detalles fruncidos.'},
          {id:5,name:'Body Street',price:45000,img:'product5.png',desc:'Body ajustado de algodon con breteles.'},
          {id:6,name:'Bolso Tote',price:65000,img:'product6.png',desc:'Bolso grande para todo el día.'}
        ];

        const money = v => v.toLocaleString('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0});

        // RENDER PRODUCTOS
        const grid = document.getElementById('product-grid');
        function renderProducts(){
          if(!grid) return;
          grid.innerHTML = '';
          PRODUCTS.forEach(p => {
            const card = document.createElement('article');
            card.className = 'card';
            card.innerHTML = `
              <div class="imgwrap"><img src="${p.img}" alt="${p.name}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'600\\' height=\\'420\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'%230b0b0c\\'/><text x=\\'50%\\' y=\\'50%\\' fill=\\'%23fff\\' font-size=\\'16\\' font-family=\\'Arial\\' text-anchor=\\'middle\\'>${encodeURIComponent(p.name)}<\\/text><\\/svg>'"></div>
              <h3>${p.name}</h3>
              <div class="price">${money(p.price)}</div>
              <div class="actions">
                <button class="small-btn" data-id="${p.id}" aria-label="Ver ${p.name}">Ver</button>
                <button class="small-btn add-btn" data-id="${p.id}" aria-label="Agregar ${p.name}">Agregar</button>
              </div>
            `;
            grid.appendChild(card);
          });
        }

        // CAROUSEL SIMPLE (puntos + autoplay)
        (function carouselInit(){
          const slidesEl = document.getElementById('slides');
          if(!slidesEl) return;

          const slides = Array.from(slidesEl.children);
          const nav = document.getElementById('carousel-nav');
          let idx = 0;

          slides.forEach((s, i) => {
            const dot = document.createElement('div');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => {
              idx = i;
              update();
              restartInterval();
            });
            nav.appendChild(dot);
          });

          const dots = nav.querySelectorAll('.dot');

          function update() {
            slidesEl.style.transition = 'transform 0.6s ease-in-out';
            slidesEl.style.transform = `translateX(-${idx * 100}%)`;
            dots.forEach((d, i) => d.classList.toggle('active', i === idx));
          }

          let interval = setInterval(nextSlide, 4000);

          function nextSlide() {
            idx = (idx + 1) % slides.length;
            update();
          }

          function restartInterval() {
            clearInterval(interval);
            interval = setInterval(nextSlide, 4000);
          }

          slidesEl.addEventListener('mouseenter', () => clearInterval(interval));
          slidesEl.addEventListener('mouseleave', restartInterval);
          window.addEventListener('resize', update);
        })();

        // MOBILE MENU
        const openMenu = document.getElementById('open-menu');
        const mobileMenu = document.getElementById('mobile-menu');
        if(openMenu){
          openMenu.addEventListener('click', ()=>{
            const shown = !mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden', shown);
            openMenu.setAttribute('aria-expanded', String(!shown));
          });
        }

        // SMOOTH SCROLL LINKS
        document.querySelectorAll('a[href^="#"]').forEach(a=>{
          a.addEventListener('click', e=>{
            const href = a.getAttribute('href');
            if(href.length>1){
              e.preventDefault();
              const el = document.querySelector(href);
              if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
              if(mobileMenu && !mobileMenu.classList.contains('hidden')) mobileMenu.classList.add('hidden');
            }
          });
        });

        // CARRITO (localStorage)
        let CART = JSON.parse(localStorage.getItem('swag_cart') || '[]');
        const cartDrawer = document.getElementById('cart-drawer');
        const cartList = document.getElementById('cart-list');
        const cartCount = document.getElementById('cart-count');
        const cartTotal = document.getElementById('cart-total');

        function saveCart(){ localStorage.setItem('swag_cart', JSON.stringify(CART)); renderCart(); }
        function renderCart(){
          if(!cartList) return;
          cartList.innerHTML='';
          let total = 0;
          CART.forEach(item=>{
            const p = PRODUCTS.find(x=>x.id===item.id) || {name:'Producto',price:0,img:''};
            total += (p.price||0)*item.qty;
            const el = document.createElement('div'); el.className='cart-item';
            el.innerHTML = `<img src="${p.img}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'120\\' height=\\'120\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'%230b0b0c\\'/><text x=\\'50%\\' y=\\'50%\\' fill=\\'%23fff\\' font-size=\\'12\\' font-family=\\'Arial\\' text-anchor=\\'middle\\'>${encodeURIComponent(p.name)}<\\/text><\\/svg>'" /><div class="meta"><p>${p.name}</p><small class="muted">${money(p.price)} x ${item.qty}</small></div><div><button class="small-btn" data-id="${p.id}" data-action="minus">-</button><button class="small-btn" data-id="${p.id}" data-action="plus">+</button></div>`;
            cartList.appendChild(el);
          });
          if(cartCount) cartCount.textContent = CART.reduce((s,i)=>s+i.qty,0);
          if(cartTotal) cartTotal.textContent = money(total);
        }

        function addToCart(id, qty=1){
          const found = CART.find(x=>x.id===id);
          if(found) found.qty += qty; else CART.push({id,qty});
          saveCart();
          const btn = document.getElementById('open-cart');
          if(btn) btn.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:350});
          if(cartDrawer) openCart();
        }

        function openCart(){ if(cartDrawer) { cartDrawer.classList.add('open'); cartDrawer.setAttribute('aria-hidden','false'); } }
        function closeCart(){ if(cartDrawer) { cartDrawer.classList.remove('open'); cartDrawer.setAttribute('aria-hidden','true'); } }

        const openCartBtn = document.getElementById('open-cart');
        if(openCartBtn) openCartBtn.addEventListener('click', ()=>{ if(cartDrawer) cartDrawer.classList.toggle('open'); });

        // Delegate actions: add / view / cart +-
        document.addEventListener('click', (e)=>{
          const t = e.target;
          if(t.matches('.add-btn')){ addToCart(Number(t.dataset.id)); }
          if(t.matches('.small-btn') && t.dataset.id && !t.classList.contains('add-btn')){
            const id = Number(t.dataset.id);
            const p = PRODUCTS.find(x=>x.id===id);
            if(p) showProductModal(p);
          }
          if(t.dataset && t.dataset.action){
            const id = Number(t.dataset.id);
            const action = t.dataset.action;
            const it = CART.find(x=>x.id===id);
            if(!it) return;
            if(action==='plus') it.qty++; else if(action==='minus') it.qty = Math.max(0,it.qty-1);
            CART = CART.filter(x=>x.qty>0);
            saveCart();
          }
        });

        // PRODUCT MODAL (simple)
        function showProductModal(p){
          const overlay = document.createElement('div');
          overlay.style.position='fixed'; overlay.style.inset=0; overlay.style.background='rgba(0,0,0,0.7)'; overlay.style.zIndex=999; overlay.style.display='flex'; overlay.style.alignItems='center'; overlay.style.justifyContent='center';
          const box = document.createElement('div');
          box.style.width='92%'; box.style.maxWidth='880px'; box.style.background='#070707'; box.style.borderRadius='12px'; box.style.padding='16px'; box.style.boxShadow='0 30px 80px rgba(0,0,0,0.8)';
          box.innerHTML = `<div style="display:flex;gap:16px;flex-wrap:wrap"><div style="flex:1 1 360px"><img src="${p.img}" style="width:100%;height=360px;object-fit:contain" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'360\\' height=\\'360\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'%230b0b0c\\'/><text x=\\'50%\\' y=\\'50%\\' fill=\\'%23fff\\' font-size=\\'14\\' font-family=\\'Arial\\' text-anchor=\\'middle\\'>${encodeURIComponent(p.name)}<\\/text><\\/svg>'"></div><div style="flex:1 1 320px"><h3 style="margin-top:0">${p.name}</h3><p class="muted">${p.desc}</p><div style="margin:14px 0;font-weight:700;font-size:18px">${money(p.price)}</div><div style="display:flex;gap:8px"><button class="btn" id="modal-add">Agregar</button><button class="btn ghost" id="modal-close">Cerrar</button></div></div></div>`;
          overlay.appendChild(box); document.body.appendChild(overlay);
          const modalAdd = document.getElementById('modal-add');
          const modalClose = document.getElementById('modal-close');
          if(modalAdd) modalAdd.addEventListener('click', ()=>{ addToCart(p.id); document.body.removeChild(overlay); });
          if(modalClose) modalClose.addEventListener('click', ()=>{ document.body.removeChild(overlay); });
          overlay.addEventListener('click', (ev)=>{ if(ev.target===overlay) document.body.removeChild(overlay); });
        }

        // INIT
        renderProducts();
        renderCart();

        // Quick actions buttons
        const verCatalogo = document.getElementById('ver-catalogo');
        const verOfertas = document.getElementById('ver-ofertas');
        if(verCatalogo) verCatalogo.addEventListener('click', ()=>{ const el = document.querySelector('#productos'); if(el) el.scrollIntoView({behavior:'smooth'}); });
        if(verOfertas) verOfertas.addEventListener('click', ()=>{ const el = document.querySelector('#ofertas'); if(el) el.scrollIntoView({behavior:'smooth'}); });

        // WhatsApp FAB
        const wa = document.getElementById('wa-fab');
        const waNumber = '573200000000'; // <-- REEMPLAZA por tu número (ej: 573201234567)
        const waMsg = encodeURIComponent('Hola! Estoy interesada en sus productos. ¿Me ayudan con más información?');
        if(wa){
          wa.href = `https://wa.me/${waNumber.replace(/\\s+/g,'')}?text=${waMsg}`;
        }

        // Checkout demo
        const checkoutBtn = document.getElementById('checkout');
        if(checkoutBtn) checkoutBtn.addEventListener('click', ()=>{
          if(CART.length===0){ alert('Tu carrito está vacío'); return; }
          const summary = CART.map(i=>{
            const p = PRODUCTS.find(x=>x.id===i.id) || {name:'Producto',price:0};
            return `${p.name} x ${i.qty} - ${money((p.price||0)*i.qty)}`;
          }).join('\n');
          alert('Resumen de pedido:\n\n'+summary+'\n\nTotal: '+(cartTotal?cartTotal.textContent:'')+'\n\n(En producción: integrar pasarela de pago)');
        });

        // Email link
        const emailLink = document.getElementById('email-link');
        if(emailLink) emailLink.addEventListener('click', (e)=>{ e.preventDefault(); window.location.href = 'mailto:info@swagqueens.co?subject=Consulta'; });

        // Set footer year
        const yearEl = document.getElementById('year');
        if(yearEl) yearEl.textContent = new Date().getFullYear();
      }
    }); 
