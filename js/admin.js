  const firebaseConfig = {
    apiKey: "AIzaSyDSpImHzUe5QsEnf3VpkjMSS3tIm0vc8ak",
    authDomain: "aet-technologie.firebaseapp.com",
    projectId: "aet-technologie",
    storageBucket: "aet-technologie.firebasestorage.app",
    messagingSenderId: "97917021410",
    appId: "1:97917021410:web:5efbb7b24dd29e5c7c82bb"
  };
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();

  const VIEW_TITLES = {
    dashboard: 'Dashboard',
    articles: 'Publications',
    editor: 'Créer un article',
    subs: 'Inscrits Premium',
    contacts: 'Demandes de contact',
    stats: 'Statistiques',
    settings: 'Paramètres'
  };

  function showView(name){
    document.querySelectorAll('.view').forEach(function(v){ v.classList.remove('active'); });
    const el = document.getElementById('view-' + name);
    if(el) el.classList.add('active');
    document.querySelectorAll('.sb-item').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-view') === name);
    });
    document.getElementById('viewTitle').textContent = VIEW_TITLES[name] || 'Dashboard';
    if(name === 'dashboard' || name === 'articles' || name === 'subs' || name === 'contacts'){ reloadData(); }
    toggleSidebar(false);
  }

  function toggleSidebar(open){
    var sb = document.getElementById('sidebar');
    var ov = document.getElementById('sbOverlay');
    if(open === undefined) open = !sb.classList.contains('open');
    sb.classList.toggle('open', open);
    ov.classList.toggle('show', open);
    if(open){ document.body.style.overflow = 'hidden'; } else { document.body.style.overflow = ''; }
  }
  // ESC : ferme la barre latérale mobile
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      var sb = document.getElementById('sidebar');
      if(sb && sb.classList.contains('open')){ toggleSidebar(false); }
    }
  });
  // Autofocus sur le champ email de login
  window.addEventListener('DOMContentLoaded', function(){
    var le = document.getElementById('loginEmail');
    if(le) le.focus();
  });

  auth.onAuthStateChanged(function(user){
    if(user){
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('appScreen').style.display = 'block';
      document.getElementById('logoutBtn').style.display = 'block';
      document.getElementById('whoami').textContent = 'Connecté — ' + (user.email || 'admin');
      reloadData();
    } else {
      document.getElementById('loginScreen').style.display = 'block';
      document.getElementById('appScreen').style.display = 'none';
      document.getElementById('logoutBtn').style.display = 'none';
    }
  });

  function doLogin(){
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPass').value;
    const msgEl = document.getElementById('loginMsg');
    msgEl.textContent = '';
    auth.signInWithEmailAndPassword(email, pass).catch(function(err){
      msgEl.textContent = "Connexion refusée : " + err.message;
    });
  }
  function doLogout(){ auth.signOut(); }

  function resetForm(){
    document.getElementById('articleId').value = '';
    document.getElementById('fTitle').value = '';
    document.getElementById('fCategory').value = '';
    document.getElementById('fDescription').value = '';
    document.getElementById('fLink').value = '';
    document.getElementById('fImage').value = '';
    document.getElementById('fPremium').checked = false;
    document.getElementById('fPublished').checked = true;
    document.getElementById('formTitle').textContent = 'Publier un article';
    document.getElementById('cancelEditBtn').style.display = 'none';
    document.getElementById('formMsg').textContent = '';
  }

  let isSaving = false;
  function saveArticle(){
    if(isSaving) return;
    const id = document.getElementById('articleId').value;
    const title = document.getElementById('fTitle').value.trim();
    const description = document.getElementById('fDescription').value.trim();
    const category = document.getElementById('fCategory').value.trim();
    const link = document.getElementById('fLink').value.trim();
    const image = document.getElementById('fImage').value.trim();
    const premium = document.getElementById('fPremium').checked;
    const published = document.getElementById('fPublished').checked;
    const msgEl = document.getElementById('formMsg');

    if(!title || !description){
      msgEl.textContent = "Titre et description sont obligatoires.";
      msgEl.className = 'msg err';
      return;
    }

    isSaving = true; msgEl.textContent = 'Enregistrement…'; msgEl.className = 'msg';
    const data = { title: title, description: description, category: category, link: link, image: image, premium: premium, published: published };

    let promise;
    if(id){
      promise = db.collection('articles').doc(id).update(data);
    } else {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      promise = db.collection('articles').add(data);
    }

    promise.then(function(){
      isSaving = false;
      msgEl.textContent = "Enregistré ✓";
      msgEl.className = 'msg ok';
      resetForm();
      reloadData();
    }).catch(function(err){
      isSaving = false;
      msgEl.textContent = "Erreur : " + err.message;
      msgEl.className = 'msg err';
    });
  }

  function editArticle(id, data){
    document.getElementById('articleId').value = id;
    document.getElementById('fTitle').value = data.title || '';
    document.getElementById('fCategory').value = data.category || '';
    document.getElementById('fDescription').value = data.description || '';
    document.getElementById('fLink').value = data.link || '';
    document.getElementById('fImage').value = data.image || '';
    document.getElementById('fPremium').checked = !!data.premium;
    document.getElementById('fPublished').checked = data.published !== false;
    document.getElementById('formTitle').textContent = 'Modifier l\'article';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';
    showView('editor');
    window.scrollTo({top:0, behavior:'smooth'});
  }

  function deleteArticle(id){
    if(!confirm('Supprimer définitivement cette publication ?')) return;
    db.collection('articles').doc(id).delete().then(reloadData);
  }

  function togglePublished(id, current){
    db.collection('articles').doc(id).update({ published: !current }).then(reloadData);
  }

  function escapeHtml(str){
    return (str || '').replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function rowHtml(doc, a){
    const dateStr = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate().toLocaleDateString('fr-FR') : '';
    var h = '<div class="art-row">';
    h += '<div><div class="badges">';
    h += '<span class="badge ' + (a.premium ? 'premium' : 'free') + '">' + (a.premium ? 'Premium' : 'Gratuit') + '</span>';
    h += '<span class="badge ' + (a.published !== false ? 'pub' : 'draft') + '">' + (a.published !== false ? 'Publié' : 'Brouillon') + '</span>';
    h += '</div><h4>' + escapeHtml(a.title) + '</h4>';
    h += '<p class="desc">' + escapeHtml(a.description) + '</p></div>';
    h += '<div class="cell-cat">' + (a.category ? escapeHtml(a.category) : '<span style="color:#8a958d;">—</span>') + '</div>';
    h += '<div class="cell-status"><span class="badge ' + (a.published !== false ? 'pub' : 'draft') + '">' + (a.published !== false ? 'Publié' : 'Brouillon') + '</span></div>';
    h += '<div><span class="badge ' + (a.premium ? 'premium' : 'free') + '">' + (a.premium ? 'Premium' : 'Gratuit') + '</span></div>';
    h += '<div class="cell-date">' + dateStr + '</div>';
    h += '<div class="row-actions">';
    h += '<button class="btn-ghost btn-small" onclick=\'editArticle("' + doc.id + '", ' + JSON.stringify(a).replace(/'/g, "&#39;") + ')\'>Modifier</button>';
    h += '<button class="btn-ghost btn-small" onclick="togglePublished(\'' + doc.id + '\', ' + (a.published !== false) + ')">' + (a.published !== false ? 'Dépublier' : 'Publier') + '</button>';
    h += '<button class="btn-ghost btn-small" onclick="deleteArticle(\'' + doc.id + '\')">Supprimer</button>';
    h += '</div></div>';
    return h;
  }

  function loadArticlesAdmin(){
    const list = document.getElementById('articlesList');
    const list2 = document.getElementById('articlesList2');
    db.collection('articles').orderBy('createdAt', 'desc').get().then(function(snap){
      let total = 0, published = 0, premium = 0;
      snap.forEach(function(doc){
        const a = doc.data();
        total++;
        if(a.published !== false) published++;
        if(a.premium) premium++;
      });
      document.getElementById('statTotal').textContent = total;
      document.getElementById('statPublished').textContent = published;
      document.getElementById('statPremium').textContent = premium;
      document.getElementById('statTotal2').textContent = total;
      document.getElementById('statPublished2').textContent = published;
      document.getElementById('statPremium2').textContent = premium;

      if(snap.empty){
        const empty = '<p class="sub">Aucune publication pour le moment.</p>';
        list.innerHTML = list2.innerHTML = empty;
        return;
      }
      let html = '';
      snap.forEach(function(doc){ html += rowHtml(doc.id, doc.data()); });
      list.innerHTML = html;
      list2.innerHTML = html;
    }).catch(function(err){
      list.innerHTML = list2.innerHTML = '<p class="msg err">Erreur : ' + err.message + '</p>';
    });
  }

  function loadSubscribers(){
    const list = document.getElementById('subsList');
    db.collection('subscribers').orderBy('createdAt', 'desc').get().then(function(snap){
      const n = snap.size;
      document.getElementById('subCount').textContent = n;
      document.getElementById('statSubs').textContent = n;
      document.getElementById('statSubs2').textContent = n;
      if(snap.empty){
        list.innerHTML = '<p class="sub">Aucun inscrit pour le moment.</p>';
        return;
      }
      let html = '';
      currentSubsEmails = [];
      snap.forEach(function(doc){
        const s = doc.data();
        const dateStr = s.createdAt && s.createdAt.toDate ? s.createdAt.toDate().toLocaleDateString('fr-FR') : '';
        currentSubsEmails.push({ email: s.email || '', date: dateStr });
        html += '<div><span class="sub-email">' + escapeHtml(s.email) + '</span><span class="sub-date">' + dateStr + '</span></div>';
      });
      list.innerHTML = html;
    }).catch(function(err){
      list.innerHTML = '<p class="msg err">Erreur : ' + err.message + '</p>';
    });
  }

  let currentSubsEmails = [];

  function exportSubsCSV(){
    if(!currentSubsEmails.length){ alert('Aucun inscrit à exporter.'); return; }
    let csv = 'email,date\n' + currentSubsEmails.map(function(r){ return r.email + ',' + r.date; }).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inscrits-aet-' + new Date().toISOString().slice(0,10) + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function loadContacts(){
    const list = document.getElementById('contactsList');
    if(!list) return;
    db.collection('contacts').orderBy('createdAt', 'desc').get().then(function(snap){
      const n = snap.size;
      document.getElementById('contactCount').textContent = n;
      if(snap.empty){
        list.innerHTML = '<p class="sub">Aucune demande pour le moment.</p>';
        return;
      }
      let html = '';
      snap.forEach(function(doc){
        const c = doc.data();
        const dateStr = c.createdAt && c.createdAt.toDate ? c.createdAt.toDate().toLocaleDateString('fr-FR') + ' ' + c.createdAt.toDate().toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'}) : '';
        html += '<div style="flex-direction:column; align-items:flex-start; gap:4px;">';
        html += '<div style="display:flex; justify-content:space-between; width:100%;"><b>' + escapeHtml(c.name || '—') + '</b><span class="sub-date">' + dateStr + '</span></div>';
        html += '<div style="font-size:0.84rem; color:#4a564e;">📞 ' + escapeHtml(c.phone || '—') + (c.email ? ' · ✉️ ' + escapeHtml(c.email) : '') + '</div>';
        html += '<div style="font-size:0.84rem; color:#4a564e;">Type : ' + escapeHtml(c.type || '—') + '</div>';
        if(c.message){ html += '<div style="font-size:0.84rem; color:#3f4a43;">' + escapeHtml(c.message) + '</div>'; }
        html += '</div>';
      });
      list.innerHTML = html;
    }).catch(function(err){
      list.innerHTML = '<p class="msg err">Erreur : ' + err.message + '</p>';
    });
  }

  function reloadData(){ loadArticlesAdmin(); loadSubscribers(); loadContacts(); }

  // Met à jour aria-expanded du bouton hamburger selon l'état de la sidebar
  var _origToggle = toggleSidebar;
  toggleSidebar = function(open){
    _origToggle(open);
    var t = document.getElementById('sbToggleBtn');
    var sb = document.getElementById('sidebar');
    if(t && sb) t.setAttribute('aria-expanded', sb.classList.contains('open') ? 'true' : 'false');
  };

  document.getElementById('loginPass').addEventListener('keydown', function(e){
    if(e.key === 'Enter') doLogin();
  });
