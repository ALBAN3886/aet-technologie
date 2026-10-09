  const firebaseConfig = {
    apiKey: "AIzaSyDSpImHzUe5QsEnf3VpkjMSS3tIm0vc8ak",
    authDomain: "aet-technologie.firebaseapp.com",
    projectId: "aet-technologie",
    storageBucket: "aet-technologie.firebasestorage.app",
    messagingSenderId: "97917021410",
    appId: "1:97917021410:web:5efbb7b24dd29e5c7c82bb"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  const PREMIUM_KEY = 'aet_premium_unlocked';
  function isPremiumUnlocked(){ return localStorage.getItem(PREMIUM_KEY) === 'yes'; }

  let pendingArticleId = null;
  function openPremiumModal(articleId){
    pendingArticleId = articleId || null;
    document.getElementById('premiumModalBg').classList.add('open');
  }
  function closePremiumModal(){ document.getElementById('premiumModalBg').classList.remove('open'); }
  document.getElementById('premiumModalBg').addEventListener('click', function(e){
    if(e.target === this) closePremiumModal();
  });

  function submitPremiumEmail(e){
    e.preventDefault();
    const email = document.getElementById('pemail').value.trim();
    const msgEl = document.getElementById('premiumMsg');
    db.collection('subscribers').add({
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function(){
      localStorage.setItem(PREMIUM_KEY, 'yes');
      msgEl.textContent = "Accès débloqué ✓";
      msgEl.style.color = 'var(--forest)';
      setTimeout(function(){
        closePremiumModal();
        loadArticles();
      }, 700);
    }).catch(function(err){
      msgEl.textContent = "Erreur, réessaie.";
      msgEl.style.color = 'var(--clay)';
      console.error(err);
    });
  }

  function escapeHtml(str){
    return (str || '').replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function linkify(str){
    return escapeHtml(str).replace(/(https?:\/\/[^\s<]+)/g, function(url){
      return '<a href="' + url + '" target="_blank" rel="noopener" style="color:var(--forest); font-weight:600; text-decoration:underline; word-break:break-all;">' + url + '</a>';
    });
  }

  function loadArticles(){
    const grid = document.getElementById('artGrid');
    db.collection('articles')
      .where('published', '==', true)
      .orderBy('createdAt', 'desc')
      .get()
      .then(function(snap){
        if(snap.empty){
          grid.innerHTML = '<p class="art-empty">Aucune publication pour le moment. Reviens bientôt !</p>';
          return;
        }
        const unlocked = isPremiumUnlocked();
        let html = '';
        snap.forEach(function(doc){
          const a = doc.data();
          const dateStr = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate().toLocaleDateString('fr-FR') : '';
          html += '<article class="art-card">';
          html += '<div class="art-img">' + (a.image ? '<img src="' + escapeHtml(a.image) + '" alt="' + escapeHtml(a.title) + '" loading="lazy">' : '<span class="lock-big">' + (a.premium ? '🔒' : '📄') + '</span>') + '</div>';
          html += '<div class="art-body">';
          html += '<div class="art-top">';
          html += '<span class="art-badge ' + (a.premium ? 'premium' : 'free') + '">' + (a.premium ? 'Premium' : 'Gratuit') + '</span>';
          html += '<span class="art-date">' + dateStr + '</span>';
          html += '</div>';
          if(a.category){ html += '<div class="art-cat">' + escapeHtml(a.category) + '</div>'; }
          html += '<h3>' + escapeHtml(a.title) + '</h3>';
          html += '<p class="art-desc" style="white-space:pre-line;">' + linkify(a.description) + '</p>';
          if(a.premium && !unlocked){
            html += '<div class="art-locked" onclick="openPremiumModal(\'' + doc.id + '\')">🔒 Inscris-toi (gratuit) pour lire &amp; accéder au lien</div>';
          } else if(a.link){
            html += '<a class="art-link" href="' + escapeHtml(a.link) + '" target="_blank" rel="noopener">Voir le lien →</a>';
          }
          html += '</div></article>';
        });
        grid.innerHTML = html;
      })
      .catch(function(err){
        console.error(err);
        grid.innerHTML = '<p class="art-empty">Impossible de charger les publications pour le moment.<br><small style="color:var(--clay);">Détail technique : ' + escapeHtml(err.message || String(err)) + '</small></p>';
      });
  }
  loadArticles();
