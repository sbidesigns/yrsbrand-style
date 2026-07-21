/**
 * ui.js — YRS Brand structure & template rendering
 * Reads SITE_DATA from site.js and builds the DOM.
 * Supports localStorage overrides (admin-managed posts).
 */

(function () {
  'use strict';

  /* ── Storage helpers ── */
  var POSTS_KEY = 'yrs_posts';
  var PER_PAGE = 10;
  var currentPage = 0;

  function getStoredPosts() {
    try {
      var raw = localStorage.getItem(POSTS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return null;
  }

  function seedStorage() {
    if (!getStoredPosts()) {
      var posts = SITE_DATA.posts.map(function (p, i) {
        return Object.assign({}, p, { _id: 'seed_' + i, published: true, sortOrder: i });
      });
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    }
  }

  function getAllPosts() {
    var stored = getStoredPosts();
    if (stored) return stored.filter(function (p) { return p.published !== false; });
    return SITE_DATA.posts;
  }

  function getVisiblePosts() {
    var all = getAllPosts();
    return all.slice(0, (currentPage + 1) * PER_PAGE);
  }

  function hasMorePosts() {
    return getVisiblePosts().length < getAllPosts().length;
  }

  /* ── Init ──────────────────────────────────────────────────── */

  function init() {
    seedStorage();
    var data = SITE_DATA;
    buildPage(data);
    hideLoader();
    initScrollEffects();
    initHashRouter();
  }

  /* ── Page Builder ────────────────────────────────────────── */

  function buildPage(data) {
    var center = document.getElementById('center');
    center.innerHTML = '';

    center.appendChild(buildHeader(data));
    center.appendChild(buildSidebar(data));

    var content = el('div', { id: 'content' });
    content.appendChild(buildHovers(data));

    var container = el('div', { id: 'container' });
    getVisiblePosts().forEach(function (post, i) {
      container.appendChild(buildPost(post, i));
    });
    container.appendChild(el('div', { className: 'clear' }));
    content.appendChild(container);

    var loadBox = el('div', { id: 'load_box' });
    var loadA = el('a', { href: '#', id: 'load' }, 'Load next page');
    loadA.addEventListener('click', function (e) {
      e.preventDefault();
      loadNextPage(container);
    });
    loadBox.appendChild(loadA);
    if (!hasMorePosts()) loadBox.style.display = 'none';
    content.appendChild(loadBox);

    var credit = el('div', { id: 'yrs_credit' });
    credit.innerHTML = data.footer;
    content.appendChild(credit);

    center.appendChild(content);
    attachPanelListeners(content);

    setTimeout(masonryLayout, 50);
  }

  function loadNextPage(container) {
    currentPage++;
    var existing = container.querySelectorAll('.post');
    var startIdx = existing.length;
    var all = getAllPosts();
    var newPosts = all.slice(startIdx, (currentPage + 1) * PER_PAGE);
    if (newPosts.length === 0) return;
    newPosts.forEach(function (post, i) {
      container.insertBefore(buildPost(post, startIdx + i), container.querySelector('.clear'));
    });
    var loadBox = document.getElementById('load_box');
    if (loadBox && !hasMorePosts()) loadBox.style.display = 'none';
    setTimeout(masonryLayout, 50);
  }

  function rebuildPage() {
    currentPage = 0;
    seedStorage();
    buildPage(SITE_DATA);
  }

  /* ── Header ──────────────────────────────────────────────── */

  function buildHeader(data) {
    var header = el('div', { id: 'header' });

    var titleLink = el('a', { href: '/', title: 'Home' });
    var h1 = el('h1', {}, data.brand);
    titleLink.appendChild(h1);
    header.appendChild(titleLink);

    var linksDiv = el('div', { className: 'links' });
    var centerWrap = el('center');

    var aboutA = el('a', { href: '#description', className: 'description' });
    aboutA.textContent = 'About';
    centerWrap.appendChild(aboutA);

    data.links.forEach(function (l) {
      var a = el('a', { href: l.href, title: l.title });
      if (l.external) a.target = '_top';
      if (l.panel) a.setAttribute('data-panel', l.panel);
      a.textContent = l.label;
      centerWrap.appendChild(a);
    });

    // SVG social icons row
    var socialWrap = el('div', { className: 'social-row' });
    data.social.forEach(function (s, i) {
      var iconA = el('a', { href: s.href, target: '_blank', title: s.label, 'aria-label': s.label });
      iconA.innerHTML = s.svg;
      socialWrap.appendChild(iconA);
      if (i < data.social.length - 1) {
        socialWrap.appendChild(el('span', { className: 'social-spacer' }));
      }
    });
    centerWrap.appendChild(socialWrap);

    linksDiv.appendChild(centerWrap);
    header.appendChild(linksDiv);
    header.appendChild(el('div', { className: 'clear' }));

    return header;
  }

  /* ── Sidebar ─────────────────────────────────────────────── */

  function buildSidebar(data) {
    var sidebar = el('div', { id: 'sidebar' });

    var titleLink = el('a', { href: '/', title: 'Home' });
    titleLink.appendChild(el('h1', {}, data.brand));
    sidebar.appendChild(titleLink);

    var desc = el('div', { className: 'description' });
    desc.innerHTML = data.description;
    sidebar.appendChild(desc);

    var linksDiv = el('div', { className: 'links' });
    data.links.forEach(function (l) {
      var a = el('a', { href: l.href, title: l.title });
      if (l.external) a.target = '_top';
      a.textContent = l.label;
      linksDiv.appendChild(a);
    });
    sidebar.appendChild(linksDiv);

    var goUp = el('div', { id: 'go_up' });
    goUp.appendChild(el('a', { href: '#home', id: 'up' }, 'Go up'));
    sidebar.appendChild(goUp);

    return sidebar;
  }

  /* ── Hovers (panels) ─────────────────────────────────────── */

  function buildHovers(data) {
    var hovers = el('div', { id: 'hovers' });

    var descBox = el('div', { id: 'description_box' });
    descBox.innerHTML = data.description;
    hovers.appendChild(descBox);

    // Connect panel
    var connectBox = el('div', { id: 'connect_box' });
    var connectTitle = el('div', { style: 'font-weight:bold;text-transform:uppercase;font-size:11px;margin-bottom:15px;padding-bottom:11px;border-bottom:1px dotted rgba(0,0,0,0.1)' });
    connectTitle.textContent = 'Connect';
    connectBox.appendChild(connectTitle);
    if (data.connectInfo) {
      var infoP = el('p', { style: 'margin:0 0 15px;line-height:1.6' });
      infoP.innerHTML = data.connectInfo;
      connectBox.appendChild(infoP);
    }
    data.social.forEach(function (s) {
      var row = el('div', { style: 'padding:8px 0;border-top:1px dotted rgba(0,0,0,0.1)' });
      var a = el('a', { href: s.href, target: '_blank', style: 'font-weight:bold;text-transform:uppercase;display:inline-flex;align-items:center;gap:8px;text-decoration:none;color:#000' });
      a.innerHTML = s.svg.replace('width="16" height="16"', 'width="14" height="14"') + ' ' + s.label;
      row.appendChild(a);
      connectBox.appendChild(row);
    });
    hovers.appendChild(connectBox);

    var blogroll = el('div', { id: 'blogroll_box' });
    blogroll.appendChild(el('ul'));
    hovers.appendChild(blogroll);

    hovers.appendChild(el('div', { id: 'twitter_box' }));
    hovers.appendChild(el('div', { id: 'close' }, 'Close'));

    return hovers;
  }

  /* ── Post Builder ────────────────────────────────────────── */

  function buildPost(post, index) {
    var idx = (index !== undefined) ? index : getAllPosts().indexOf(post);
    var div = el('div', { className: 'post' + (post.type === 'photo' ? ' photo' : '') });
    div.setAttribute('data-post-index', String(idx));

    switch (post.type) {
      case 'photo': div.appendChild(buildPhotoPost(post, idx)); break;
      case 'video': div.appendChild(buildVideoPost(post)); break;
      case 'link':  div.appendChild(buildLinkPost(post));  break;
      case 'reblog': div.innerHTML = post.html; break;
    }

    var perma = el('div', { id: 'post_perma' + (post.type === 'photo' ? ' invisible' : '') });
    perma.appendChild(el('a', { href: post.url || '#', className: 'd' }, post.date || ''));
    perma.appendChild(el('a', { href: post.url || '#', className: 't' }, post.timeAgo || ''));
    div.appendChild(perma);

    return div;
  }

  function buildPhotoPost(post, index) {
    var photo = el('div', { id: 'photo' });
    var picture = el('div', { id: 'picture' });

    var info = el('div', { id: 'info' });
    var holder = el('div', { id: 'holder' });

    var note = el('div', { className: 'note' });
    var noteSpan = el('span', {}, String(post.notes || 0));
    note.appendChild(noteSpan);

    var floatDiv = el('div', { id: 'float' });
    var dateDiv = el('div', { className: 'date' });
    var dateSpan = el('span', {}, 'View More');
    dateDiv.appendChild(dateSpan);
    floatDiv.appendChild(dateDiv);

    var reblogDiv = el('div', { className: 'reblog' }, 'repost');
    if (post.reblogUrl) {
      var reblogA = el('a', { href: post.reblogUrl, target: '_blank', style: 'color:white;text-decoration:none;' });
      reblogA.appendChild(reblogDiv);
      floatDiv.appendChild(reblogA);
    } else {
      floatDiv.appendChild(reblogDiv);
    }

    holder.appendChild(note);
    holder.appendChild(floatDiv);
    info.appendChild(holder);
    picture.appendChild(info);

    var img = document.createElement('img');
    img.src = post.img;
    img.alt = 'YRS Brand';
    picture.appendChild(img);

    photo.appendChild(picture);

    // Click to open post detail
    photo.style.cursor = 'pointer';
    photo.addEventListener('click', function (e) {
      if (e.target.closest('.reblog a')) return; // let reblog link work
      window.location.hash = '#post/' + index;
    });

    return photo;
  }

  function buildVideoPost(post) {
    var wrapper = el('div', { className: 'video' });
    var iframe = document.createElement('iframe');
    iframe.width = '300'; iframe.height = '200';
    iframe.src = post.src;
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.setAttribute('allowfullscreen', '');
    iframe.title = post.title || 'YRS Video';
    wrapper.appendChild(iframe);
    return wrapper;
  }

  function buildLinkPost(post) {
    var a = el('a', { href: post.href, className: 'link' });
    a.appendChild(el('h3', {}, post.title));
    return a;
  }

  /* ── Hash Router (post detail) ───────────────────────────── */

  function initHashRouter() {
    function onHash() {
      var hash = window.location.hash;
      var match = hash.match(/^#post\/(\d+)$/);
      if (match) {
        showPostDetail(parseInt(match[1], 10));
      } else if (hash === '#description') {
        closePostDetail();
        var aboutBtn = document.querySelector('#header .description');
        if (aboutBtn) aboutBtn.click();
      } else {
        closePostDetail();
      }
    }
    window.addEventListener('hashchange', onHash);
    onHash();
  }

  function showPostDetail(index) {
    var allPosts = getAllPosts();
    var post = allPosts[index];
    if (!post) return;

    // Hide main content
    hide('#container, #load_box, #page_navigation_if_header, #yrs_credit');

    // Build detail panel inside #hovers
    var hovers = document.getElementById('hovers');
    if (!hovers) return;

    // Remove existing detail
    var old = document.getElementById('post_detail_box');
    if (old) old.remove();

    // Hide other panels
    hide('#description_box, #connect_box, #blogroll_box, #twitter_box');
    show('#hovers');

    var detail = el('div', { id: 'post_detail_box' });

    // Back link (top-right, matches original close button style)
    var backLink = el('a', { href: '#', style: 'cursor:pointer;font-weight:bold;height:9px;padding:11px;position:absolute;right:0;text-transform:uppercase;top:0;border-top:1px dotted rgba(0,0,0,0.1);' });
    backLink.innerHTML = '&larr; Back';
    backLink.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.hash = '#';
    });
    detail.appendChild(backLink);

    // Post wrapper — mirrors the original .post in #container but at 500px
    var postDiv = el('div', { className: 'post' + (post.type === 'photo' ? ' photo' : ''), style: 'width:500px;margin:30px auto 0;position:relative;float:none;' });

    // Content by type
    switch (post.type) {
      case 'photo': {
        // Full-width photo at 500px, no hover overlay on permalink
        var img = document.createElement('img');
        img.src = post.img;
        img.alt = 'YRS Brand';
        img.style.width = '500px';
        img.style.height = 'auto';
        img.style.display = 'block';
        postDiv.appendChild(img);
        break;
      }
      case 'video': {
        var wrapper = el('div', { className: 'video' });
        var iframe = document.createElement('iframe');
        iframe.width = '500'; iframe.height = '281';
        iframe.src = post.src;
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.setAttribute('allowfullscreen', '');
        iframe.title = post.title || 'YRS Video';
        wrapper.appendChild(iframe);
        postDiv.appendChild(wrapper);
        break;
      }
      case 'link': {
        var linkA = el('a', { href: post.href, target: '_blank', className: 'link' });
        linkA.appendChild(el('h3', {}, post.title));
        postDiv.appendChild(linkA);
        break;
      }
      case 'reblog': {
        postDiv.innerHTML = post.html;
        break;
      }
    }

    // Permalink footer — same style as grid posts
    var perma = el('div', { id: 'post_perma' });
    var permaA = el('a', { href: post.url || '#', className: 'd' }, post.date || '');
    var permaB = el('a', { href: post.url || '#', className: 't' }, post.timeAgo || '');
    perma.appendChild(permaA);
    perma.appendChild(permaB);
    postDiv.appendChild(perma);

    detail.appendChild(postDiv);

    // Notes section (avatar grid style, matching original ol.notes)
    if (post.notes && post.notes > 0) {
      var notesWrap = el('div', { style: 'width:500px;margin:0 auto 30px;overflow:hidden;padding:22px 11px 0;border-top:1px dotted rgba(0,0,0,0.1);' });
      var notesLabel = el('div', { style: 'font-size:10px;font-weight:bold;line-height:20px;margin-bottom:15px;text-transform:uppercase;' });
      notesLabel.textContent = post.notes + ' notes';
      notesWrap.appendChild(notesLabel);
      // Placeholder note avatars
      var avatarGrid = el('ol', { className: 'notes' });
      for (var n = 0; n < Math.min(post.notes, 20); n++) {
        var li = el('li', { className: 'note' });
        var avatar = document.createElement('img');
        avatar.className = 'avatar';
        avatar.src = 'https://64.media.tumblr.com/avatar_6db2c24da6e1_16.pnj';
        avatar.alt = '';
        li.appendChild(avatar);
        avatarGrid.appendChild(li);
      }
      notesWrap.appendChild(avatarGrid);
      detail.appendChild(notesWrap);
    }

    hovers.appendChild(detail);

    // Scroll to top so user sees the detail
    window.scrollTo(0, 0);
  }

  function closePostDetail() {
    var detail = document.getElementById('post_detail_box');
    if (detail) detail.remove();
    hide('#hovers');
    show('#container, #load_box, #yrs_credit');
    setTimeout(masonryLayout, 50);
  }

  /* ── Panel toggle ────────────────────────────────────────── */

  function attachPanelListeners(content) {
    var aboutBtn = content.querySelector('#header .description');
    var connectBtn = content.querySelector('#header a[data-panel="connect"]');
    var closeBtn = content.querySelector('#close');
    var goUpBtn = document.getElementById('up');

    if (aboutBtn) {
      aboutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.hash = '#description';
        closePostDetail();
        show('#description_box, #hovers');
        hide('#container, #load_box, #connect_box, #blogroll_box, #twitter_box, #post_detail_box');
      });
    }

    if (connectBtn) {
      connectBtn.addEventListener('click', function (e) {
        e.preventDefault();
        closePostDetail();
        show('#connect_box, #hovers');
        hide('#container, #load_box, #description_box, #blogroll_box, #twitter_box, #post_detail_box');
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        window.location.hash = '#';
        hide('#hovers, #ask_box, #submit_box, #twitter_box, #blogroll_box, #disclaimer_box, #state_box, #karmaloop_box, #description_box, #connect_box, #post_detail_box');
        show('#container, #load_box, #page_navigation_if_header');
        setTimeout(masonryLayout, 50);
      });
    }

    if (goUpBtn) {
      goUpBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /* ── Scroll ──────────────────────────────────────────────── */

  function initScrollEffects() {
    var goUp = document.getElementById('go_up');
    if (!goUp) return;
    window.addEventListener('scroll', function () {
      goUp.style.display = window.scrollY !== 0 ? 'block' : 'none';
    });
  }

  /* ── Loader ──────────────────────────────────────────────── */

  function hideLoader() {
    var loader = document.getElementById('site-loader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(function () { loader.remove(); }, 600);
    }
  }

  /* ── Helpers ─────────────────────────────────────────────── */

  function el(tag, attrs, textOrChildren) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'className') e.className = attrs[k];
        else if (k === 'style' && typeof attrs[k] === 'object') Object.assign(e.style, attrs[k]);
        else e.setAttribute(k, attrs[k]);
      });
    }
    if (Array.isArray(textOrChildren)) {
      textOrChildren.forEach(function (c) { e.appendChild(c); });
    } else if (textOrChildren !== undefined) {
      e.textContent = textOrChildren;
    }
    return e;
  }

  function show(sel)  { document.querySelectorAll(sel).forEach(function (e) { e.style.display = ''; }); }
  function hide(sel)  { document.querySelectorAll(sel).forEach(function (e) { e.style.display = 'none'; }); }

  /* ── Expose rebuild for admin.js ─────────────────────────── */
  window.YRS_UI = { rebuild: rebuildPage, getAllPosts: getAllPosts };

  /* ── Boot ────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
