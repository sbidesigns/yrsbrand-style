/**
 * admin.js — YRS Brand Admin Panel
 * Triple-click YRS logo → login (admin:nimda) → full CRUD for posts.
 * Persists to localStorage. Dispatches 'yrs:posts-changed' for ui.js to pick up.
 */

(function () {
  'use strict';

  var POSTS_KEY = 'yrs_posts';
  var AUTH_KEY = 'yrs_auth';
  var CREDENTIALS = { username: 'admin', password: 'nimda' };

  var clickCount = 0;
  var clickTimer = null;
  var authenticated = false;
  var editingId = null;

  /* ── Storage ─────────────────────────────────────────────── */

  function getPosts() {
    try {
      var raw = localStorage.getItem(POSTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function savePosts(posts) {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    document.dispatchEvent(new CustomEvent('yrs:posts-changed'));
  }

  function genId() {
    return 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  }

  /* ── Triple-click detection on YRS logo ──────────────────── */

  function initTripleClick() {
    var h1 = document.querySelector('#header h1');
    if (!h1) return;
    var parent = h1.closest('a') || h1;

    parent.addEventListener('click', function (e) {
      e.preventDefault();
      clickCount++;
      if (clickTimer) clearTimeout(clickTimer);
      clickTimer = setTimeout(function () { clickCount = 0; }, 500);
      if (clickCount >= 3) {
        clickCount = 0;
        if (authenticated) {
          openAdmin();
        } else {
          openLogin();
        }
      }
    });
  }

  /* ── Login Panel ─────────────────────────────────────────── */

  function openLogin() {
    var existing = document.getElementById('login-panel');
    if (existing) { existing.classList.add('open'); return; }

    var panel = document.createElement('div');
    panel.id = 'login-panel';
    panel.className = 'open';
    panel.innerHTML =
      '<div class="login-box">' +
        '<h2>Login</h2>' +
        '<form id="login-form">' +
          '<input type="text" placeholder="Username" autocomplete="off" autofocus />' +
          '<input type="password" placeholder="Password" />' +
          '<button type="submit" class="login-btn">Enter</button>' +
          '<div class="login-err" id="login-err"></div>' +
        '</form>' +
        '<div class="login-close" id="login-close">cancel</div>' +
      '</div>';

    document.body.appendChild(panel);

    panel.querySelector('#login-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var inputs = this.querySelectorAll('input');
      var u = inputs[0].value.trim();
      var p = inputs[1].value;
      if (u === CREDENTIALS.username && p === CREDENTIALS.password) {
        authenticated = true;
        sessionStorage.setItem(AUTH_KEY, '1');
        closeLogin();
        openAdmin();
      } else {
        document.getElementById('login-err').textContent = 'Invalid credentials';
      }
    });

    panel.querySelector('#login-close').addEventListener('click', closeLogin);
    panel.querySelector('input[type="text"]').focus();
  }

  function closeLogin() {
    var panel = document.getElementById('login-panel');
    if (panel) panel.remove();
  }

  /* ── Admin Panel ─────────────────────────────────────────── */

  function openAdmin() {
    var existing = document.getElementById('admin-panel');
    if (existing) { existing.classList.add('open'); renderAdminTable(); return; }

    var panel = document.createElement('div');
    panel.id = 'admin-panel';
    panel.className = 'open';

    panel.innerHTML =
      '<div id="admin-wrap">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<div><h1>Admin</h1><div class="sub">Manage YRS Brand posts</div></div>' +
          '<div>' +
            '<button class="btn" id="admin-new-btn">New Post</button> ' +
            '<button class="btn btn-outline" id="admin-close-btn">Close</button>' +
          '</div>' +
        '</div>' +
        '<div id="admin-table-wrap"></div>' +
        '<div id="admin-form-wrap"></div>' +
      '</div>';

    document.body.appendChild(panel);

    panel.querySelector('#admin-close-btn').addEventListener('click', closeAdmin);
    panel.querySelector('#admin-new-btn').addEventListener('click', function () { showForm(null); });

    renderAdminTable();
  }

  function closeAdmin() {
    var panel = document.getElementById('admin-panel');
    if (panel) panel.classList.remove('open');
    editingId = null;
    if (window.YRS_UI && window.YRS_UI.rebuild) window.YRS_UI.rebuild();
  }

  /* ── Table ───────────────────────────────────────────────── */

  function renderAdminTable() {
    var wrap = document.getElementById('admin-table-wrap');
    if (!wrap) return;
    var posts = getPosts();

    var html = '<table><thead><tr>' +
      '<th></th><th>Type</th><th>Date</th><th>Status</th><th>Order</th><th>Actions</th>' +
      '</tr></thead><tbody>';

    posts.forEach(function (p) {
      var thumb = '';
      if (p.type === 'photo' && p.img) {
        thumb = '<img src="' + escHtml(p.img) + '" alt="" />';
      } else if (p.type === 'video') {
        thumb = '<span style="color:#aaa;font-size:10px">VIDEO</span>';
      } else if (p.type === 'link') {
        thumb = '<span style="color:#aaa;font-size:10px">LINK</span>';
      } else {
        thumb = '<span style="color:#aaa;font-size:10px">REBLOG</span>';
      }

      var status = p.published !== false
        ? '<span class="badge badge-pub">published</span>'
        : '<span class="badge badge-draft">draft</span>';

      html += '<tr>' +
        '<td>' + thumb + '</td>' +
        '<td style="text-transform:uppercase;font-weight:bold">' + escHtml(p.type) + '</td>' +
        '<td>' + escHtml(p.date || '') + '</td>' +
        '<td>' + status + '</td>' +
        '<td>' + (p.sortOrder || 0) + '</td>' +
        '<td>' +
          '<button class="btn btn-outline" onclick="window._adminEdit(\'' + p._id + '\')">Edit</button> ' +
          '<button class="btn btn-danger" onclick="window._adminDelete(\'' + p._id + '\')">Delete</button>' +
        '</td>' +
        '</tr>';
    });

    html += '</tbody></table>';
    if (posts.length === 0) html += '<div style="padding:30px;text-align:center;color:#aaa">No posts yet.</div>';
    wrap.innerHTML = html;
  }

  /* ── Form ────────────────────────────────────────────────── */

  function showForm(id) {
    editingId = id;
    var wrap = document.getElementById('admin-form-wrap');
    if (!wrap) return;
    var posts = getPosts();
    var post = id ? posts.find(function (p) { return p._id === id; }) : {};

    var type = post.type || 'photo';
    var isPhoto = type === 'photo';
    var isVideo = type === 'video';
    var isLink = type === 'link';
    var isReblog = type === 'reblog';

    var html = '<div id="admin-form">' +
      '<div class="row"><div>' +
        '<label>Type</label>' +
        '<select id="af-type">' +
          '<option value="photo"' + (isPhoto ? ' selected' : '') + '>Photo</option>' +
          '<option value="video"' + (isVideo ? ' selected' : '') + '>Video</option>' +
          '<option value="link"' + (isLink ? ' selected' : '') + '>Link</option>' +
          '<option value="reblog"' + (isReblog ? ' selected' : '') + '>Reblog</option>' +
        '</select>' +
      '</div><div>' +
        '<label>Published</label>' +
        '<select id="af-published">' +
          '<option value="true"' + (post.published !== false ? ' selected' : '') + '>Yes</option>' +
          '<option value="false"' + (post.published === false ? ' selected' : '') + '>No (Draft)</option>' +
        '</select>' +
      '</div></div>' +
      '<div class="row"><div>' +
        '<label>Date Label</label>' +
        '<input id="af-date" type="text" placeholder="e.g. 21.Jul.26" value="' + escAttr(post.date || '') + '" />' +
      '</div><div>' +
        '<label>Sort Order (lower = first)</label>' +
        '<input id="af-order" type="number" value="' + (post.sortOrder || 0) + '" />' +
      '</div></div>';

    if (isPhoto) {
      html += '<label>Image URL</label>' +
        '<input id="af-img" type="text" placeholder="https://..." value="' + escAttr(post.img || '') + '" />' +
        '<div class="row"><div>' +
          '<label>Notes Count</label>' +
          '<input id="af-notes" type="number" value="' + (post.notes || 0) + '" />' +
        '</div><div>' +
          '<label>Reblog URL (optional)</label>' +
          '<input id="af-reblog" type="text" placeholder="https://..." value="' + escAttr(post.reblogUrl || '') + '" />' +
        '</div></div>';
    }

    if (isVideo) {
      html += '<label>YouTube Embed URL</label>' +
        '<input id="af-src" type="text" placeholder="https://www.youtube.com/embed/..." value="' + escAttr(post.src || '') + '" />' +
        '<label>Video Title</label>' +
        '<input id="af-vtitle" type="text" value="' + escAttr(post.title || '') + '" />';
    }

    if (isLink) {
      html += '<label>Link Title</label>' +
        '<input id="af-ltitle" type="text" value="' + escAttr(post.title || '') + '" />' +
        '<label>Link URL</label>' +
        '<input id="af-lhref" type="text" placeholder="https://..." value="' + escAttr(post.href || '') + '" />';
    }

    if (isReblog) {
      html += '<label>HTML Content</label>' +
        '<textarea id="af-html" placeholder="Paste reblog HTML here...">' + escHtml(post.html || '') + '</textarea>';
    }

    html += '<div class="actions">' +
        '<button class="btn" id="af-save">Save</button> ' +
        '<button class="btn btn-outline" id="af-cancel">Cancel</button>' +
      '</div></div>';

    wrap.innerHTML = html;

    // Type change handler
    wrap.querySelector('#af-type').addEventListener('change', function () {
      // Re-render form with new type but keep id
      var tempPost = gatherFormData();
      tempPost._id = editingId;
      tempPost.type = this.value;
      // Temporarily save and re-show
      var allPosts = getPosts();
      if (!editingId) {
        allPosts.push(tempPost);
        savePosts(allPosts);
        showForm(tempPost._id);
        // Remove the temp post since we're just editing
        allPosts = getPosts().filter(function (p) { return p._id !== tempPost._id; });
        savePosts(allPosts);
      } else {
        var idx = allPosts.findIndex(function (p) { return p._id === editingId; });
        if (idx >= 0) { allPosts[idx] = tempPost; savePosts(allPosts); }
        showForm(editingId);
        // Restore original
        allPosts[idx] = post;
        savePosts(allPosts);
      }
    });

    wrap.querySelector('#af-save').addEventListener('click', function () { saveForm(); });
    wrap.querySelector('#af-cancel').addEventListener('click', function () { editingId = null; wrap.innerHTML = ''; });
  }

  function gatherFormData() {
    var type = document.getElementById('af-type').value;
    var data = {
      _id: editingId || genId(),
      type: type,
      date: document.getElementById('af-date').value,
      published: document.getElementById('af-published').value === 'true',
      sortOrder: parseInt(document.getElementById('af-order').value, 10) || 0,
      timeAgo: '',
      url: ''
    };

    switch (type) {
      case 'photo':
        data.img = document.getElementById('af-img').value;
        data.notes = parseInt(document.getElementById('af-notes').value, 10) || 0;
        data.reblogUrl = document.getElementById('af-reblog').value;
        break;
      case 'video':
        data.src = document.getElementById('af-src').value;
        data.title = document.getElementById('af-vtitle').value;
        break;
      case 'link':
        data.title = document.getElementById('af-ltitle').value;
        data.href = document.getElementById('af-lhref').value;
        break;
      case 'reblog':
        data.html = document.getElementById('af-html').value;
        break;
    }

    return data;
  }

  function saveForm() {
    var posts = getPosts();
    var data = gatherFormData();

    if (editingId) {
      var idx = posts.findIndex(function (p) { return p._id === editingId; });
      if (idx >= 0) posts[idx] = data;
    } else {
      posts.push(data);
    }

    savePosts(posts);
    editingId = null;
    document.getElementById('admin-form-wrap').innerHTML = '';
    renderAdminTable();
  }

  /* ── Global edit/delete handlers (for table buttons) ─────── */

  window._adminEdit = function (id) { showForm(id); };

  window._adminDelete = function (id) {
    if (!window.confirm('Delete this post?')) return;
    var posts = getPosts().filter(function (p) { return p._id !== id; });
    savePosts(posts);
    renderAdminTable();
  };

  /* ── Helpers ─────────────────────────────────────────────── */

  function escHtml(s) { return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escAttr(s) { return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;'); }

  /* ── Boot ────────────────────────────────────────────────── */

  // Check session
  if (sessionStorage.getItem(AUTH_KEY) === '1') authenticated = true;

  // Listen for posts changed to re-render table if admin is open
  document.addEventListener('yrs:posts-changed', function () {
    if (document.getElementById('admin-panel') && document.getElementById('admin-panel').classList.contains('open')) {
      renderAdminTable();
    }
  });

  // Init triple-click after DOM ready
  function boot() {
    initTripleClick();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
