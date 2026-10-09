  function openModal(){ document.getElementById('modalBg').classList.add('open'); }
  function closeModal(){ document.getElementById('modalBg').classList.remove('open'); }
  function openModalWith(prog){
    const sel = document.getElementById('fprog');
    for(let i=0;i<sel.options.length;i++){
      if(sel.options[i].text === prog){ sel.selectedIndex = i; break; }
    }
    openModal();
  }
  document.getElementById('modalBg').addEventListener('click', function(e){
    if(e.target === this) closeModal();
  });

  function sendToWhatsApp(e){
    e.preventDefault();
    const name = document.getElementById('fname').value.trim();
    const prog = document.getElementById('fprog').value;
    const phone = document.getElementById('fphone').value.trim();
    const msg = `Bonjour AET Technologie, je m'appelle ${name} (tél: ${phone}) et je souhaite m'inscrire à : ${prog}.`;
    window.open('https://wa.me/22899812072?text=' + encodeURIComponent(msg), '_blank');
    closeModal();
  }

  function sendContact(e){
    e.preventDefault();
    const name = document.getElementById('cName').value.trim();
    const phone = document.getElementById('cPhone').value.trim();
    const email = document.getElementById('cEmail').value.trim();
    const type = document.getElementById('cType').value;
    const message = document.getElementById('cMsg').value.trim();
    const msg = `Bonjour AET Technology, je m'appelle ${name} (tél: ${phone}${email ? ', email: '+email : ''}). Type de projet : ${type}. ${message}`;

    db.collection('contacts').add({
      name: name, phone: phone, email: email, type: type, message: message,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(function(err){ console.error('Erreur enregistrement contact:', err); });

    window.open('https://wa.me/22899812072?text=' + encodeURIComponent(msg), '_blank');
  }

  // Menu mobile
  const mmenu = document.getElementById('mmenu');
  const mToggle = document.getElementById('menuToggle');
  function openMenu(){
    mmenu.classList.add('open'); mmenu.setAttribute('aria-hidden','false');
    mToggle && mToggle.setAttribute('aria-expanded','true');
    document.body.style.overflow='hidden';
  }
  function closeMenu(){
    mmenu.classList.remove('open'); mmenu.setAttribute('aria-hidden','true');
    mToggle && mToggle.setAttribute('aria-expanded','false');
    document.body.style.overflow='';
  }
  mToggle && mToggle.addEventListener('click', openMenu);
  document.getElementById('mmenuClose').addEventListener('click', closeMenu);
  mmenu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMenu); });

  // Reveal on scroll
  const io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){ entry.target.classList.add('in'); io.unobserve(entry.target); }
    });
  }, {threshold: 0.12});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  // Filtres projets
  const filterBtns = document.querySelectorAll('#projFilters button');
  const projs = document.querySelectorAll('#projets .proj');
  filterBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      filterBtns.forEach(function(b){
        b.classList.remove('active'); b.setAttribute('aria-pressed','false');
      });
      btn.classList.add('active'); btn.setAttribute('aria-pressed','true');
      const f = btn.getAttribute('data-filter');
      projs.forEach(function(p){
        const cats = p.getAttribute('data-cat') || '';
        p.style.display = (f === 'all' || cats.indexOf(f) !== -1) ? '' : 'none';
      });
    });
  });

  // ESC ferme modales + focus premier champ
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      var mb = document.getElementById('modalBg');
      var pb = document.getElementById('premiumModalBg');
      if(mb && mb.classList.contains('open')){ closeModal(); }
      if(pb && pb.classList.contains('open')){ closePremiumModal(); }
      var sb = document.getElementById('mmenu');
      if(sb && sb.classList.contains('open')){ closeMenu(); }
    }
  });
  var _openModal = openModal;
  openModal = function(){ _openModal(); var f = document.getElementById('fname'); if(f) setTimeout(function(){ f.focus(); }, 30); };
  var _openPM = openPremiumModal;
  openPremiumModal = function(id){
    _openPM(id);
    var e = document.getElementById('pemail');
    if(e) setTimeout(function(){ e.focus(); }, 30);
  };

  // Bouton remonter
  const goTop = document.getElementById('goTop');
  window.addEventListener('scroll', function(){
    if(window.scrollY > 600){ goTop.classList.add('show'); } else { goTop.classList.remove('show'); }
  });
  goTop.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });

  // Header sticky intelligent (animations UI)
  const siteHeader = document.querySelector('.site-header');
  function handleHeaderScroll(){
    if(window.scrollY > 40){ siteHeader.classList.add('scrolled'); }
    else { siteHeader.classList.remove('scrolled'); }
  }
  window.addEventListener('scroll', handleHeaderScroll);
  handleHeaderScroll();
