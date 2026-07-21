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
  var _currentFilter = null; // null = all, 'video' = music & videos

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
    var base = stored ? stored.filter(function (p) { return p.published !== false; }) : SITE_DATA.posts;
    if (_currentFilter) {
      return base.filter(function (p) { return p.type === _currentFilter; });
    }
    return base;
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

    // Global click interceptor for photo posts — prevents link navigation, uses hash instead
    container.addEventListener('click', function (e) {
      var postEl = e.target.closest('.post.photo');
      if (!postEl) return;
      // Don't intercept reblog clicks
      if (e.target.closest('.reblog a') || e.target.closest('.reblog')) return;
      // Don't intercept if click is explicitly on an external link with target="_blank"
      var link = e.target.closest('a[href]');
      if (link && (link.target === '_blank' || link.getAttribute('target') === '_blank')) return;
      
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      var idx = postEl.getAttribute('data-post-index');
      if (idx !== null) {
        window.location.hash = '#post/' + idx;
      }
      return false;
    }, true); // capture phase

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

    var logoDiv = el('div', { id: 'logo' });
    var titleLink = el('a', { href: '/', title: 'Home' });
    var h1 = el('h1', {}, data.brand);
    titleLink.appendChild(h1);
    logoDiv.appendChild(titleLink);
    header.appendChild(logoDiv);

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

    // Navigation links
    linksDiv.appendChild(centerWrap);
    header.appendChild(linksDiv);
    
    // Social icons row — outside of .links div
    var socialWrap = el('div', { className: 'social-row' });
    data.social.forEach(function (s) {
      var iconA = el('a', { href: s.href, target: '_blank', title: s.label, 'aria-label': s.label });
      iconA.innerHTML = s.svg;
      socialWrap.appendChild(iconA);
    });
    header.appendChild(socialWrap);
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

    // "View More" text also opens detail
    dateSpan.style.cursor = 'pointer';
    dateSpan.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      window.location.hash = '#post/' + index;
    });

    var reblogDiv = el('div', { className: 'reblog' }, 'repost');
    if (post.reblogUrl) {
      var reblogA = el('a', { href: post.reblogUrl, target: '_blank', rel: 'noopener noreferrer', style: 'color:white;text-decoration:none;' });
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
    img.style.cursor = 'pointer';
    img.loading = 'lazy'; // Native lazy loading
    // Simple fade in when loaded
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';
    img.addEventListener('load', function () { this.style.opacity = '1'; });
    if (img.complete) img.style.opacity = '1';
    picture.appendChild(img);

    photo.appendChild(picture);

    // Click to open post detail — prevent any link navigation inside photo
    function openDetail(e) {
      // Don't intercept if clicking reblog link
      if (e.target.closest('.reblog a')) return;
      if (e.target.closest('.reblog')) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.location.hash = '#post/' + index;
      return false;
    }

    photo.style.cursor = 'pointer';
    photo.addEventListener('click', openDetail, true); // capture phase
    img.addEventListener('click', openDetail, true); // capture phase
    
    // Also prevent default on any <a> inside photo that isn't reblog
    photo.querySelectorAll('a:not(.reblog a)').forEach(function(a) {
      a.addEventListener('click', function(e) {
        e.preventDefault();
        openDetail(e);
      });
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

  /* ── Share Bar Builder ────────────────────────────────────── */

  var SHARE_SVGS = {
    facebook: '<svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    twitter: '<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    pinterest: '<svg viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.343c-.091.378-.294 1.189-.334 1.355-.053.218-.173.265-.4.159-1.492-.694-2.424-2.875-2.424-4.627 0-3.769 2.737-7.229 7.892-7.229 4.144 0 7.365 2.953 7.365 6.899 0 4.117-2.595 7.431-6.199 7.431-1.211 0-2.348-.63-2.738-1.373 0 0-.598 2.28-.744 2.84-.269 1.029-1 2.319-1.492 3.106 1.125.347 2.322.532 3.561.532 6.627 0 11.988-5.367 11.988-11.988C24.005 5.367 18.644 0 12.017 0z"/></svg>',
    reddit: '<svg viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>',
    tumblr: '<svg viewBox="0 0 24 24"><path d="M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.797H5.625V7.125c2.972-.98 3.716-3.42 3.891-6.048.007-.222.187-.405.41-.405h2.803v5.906h3.844v3.219h-3.844v7.188c0 .94.356 1.579 1.454 1.579h2.391V24h-2.511z"/></svg>',
    email: '<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
  };

  function buildShareBar(post) {
    var url = post.url || window.location.href;
    var title = 'YRS Brand';
    var desc = post.date ? 'Posted on ' + post.date : '';
    var img = post.img || '';

    var bar = el('div', { className: 'share-bar' });

    // Label
    bar.appendChild(el('span', { className: 'share-bar-label' }, 'Share'));

    // Facebook
    var fbBtn = el('a', { className: 'share-btn facebook', href: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), target: '_blank', rel: 'noopener noreferrer', title: 'Share on Facebook' });
    fbBtn.innerHTML = SHARE_SVGS.facebook + ' Share';
    bar.appendChild(fbBtn);

    // Twitter / X
    var twBtn = el('a', { className: 'share-btn twitter', href: 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(title) + (img ? '&via=yrsbrand' : ''), target: '_blank', rel: 'noopener noreferrer', title: 'Post on X' });
    twBtn.innerHTML = SHARE_SVGS.twitter + ' Post';
    bar.appendChild(twBtn);

    // Pinterest
    if (img) {
      var piBtn = el('a', { className: 'share-btn pinterest', href: 'https://pinterest.com/pin/create/button/?url=' + encodeURIComponent(url) + '&media=' + encodeURIComponent(img) + '&description=' + encodeURIComponent(desc), target: '_blank', rel: 'noopener noreferrer', title: 'Pin it' });
      piBtn.innerHTML = SHARE_SVGS.pinterest + ' Pin';
      bar.appendChild(piBtn);
    }

    // Reddit
    var rdBtn = el('a', { className: 'share-btn reddit', href: 'https://reddit.com/submit?url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title), target: '_blank', rel: 'noopener noreferrer', title: 'Submit to Reddit' });
    rdBtn.innerHTML = SHARE_SVGS.reddit + ' Submit';
    bar.appendChild(rdBtn);

    // Tumblr
    if (post.reblogUrl) {
      var tbBtn = el('a', { className: 'share-btn tumblr', href: post.reblogUrl, target: '_blank', rel: 'noopener noreferrer', title: 'Reblog on Tumblr' });
      tbBtn.innerHTML = SHARE_SVGS.tumblr + ' Reblog';
      bar.appendChild(tbBtn);
    }

    // Email
    var emBtn = el('a', { className: 'share-btn email', href: 'mailto:?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(desc + '\n\n' + url), title: 'Share via Email' });
    emBtn.innerHTML = SHARE_SVGS.email + ' Email';
    bar.appendChild(emBtn);

    // Copy Link wrapper
    var copyWrap = el('div', { className: 'copy-link-wrapper' });
    var input = el('input', { className: 'copy-link-input', type: 'text', readonly: 'readonly', value: url });
    var copyBtn = el('button', { className: 'copy-link-btn', type: 'button', title: 'Copy link' });
    copyBtn.innerHTML = '<span class="copy-text">' + SHARE_SVGS.copy + ' Copy</span>';
    copyWrap.appendChild(input);
    copyWrap.appendChild(copyBtn);
    bar.appendChild(copyWrap);

    // Copy click handler
    copyBtn.addEventListener('click', function () {
      input.select();
      input.setSelectionRange(0, 99999); // mobile support
      try {
        document.execCommand('copy');
        // Visual feedback
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = SHARE_SVGS.check + ' Copied!';
        setTimeout(function () {
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = '<span class="copy-text">' + SHARE_SVGS.copy + ' Copy</span>';
        }, 2200);
      } catch (e) {
        // Fallback for older browsers
        var temp = document.createElement('textarea');
        temp.value = url;
        temp.style.position = 'fixed';
        temp.style.left = '-9999px';
        document.body.appendChild(temp);
        temp.select();
        try { document.execCommand('copy'); } catch (e2) { /* ignore */ }
        document.body.removeChild(temp);
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = SHARE_SVGS.check + ' Copied!';
        setTimeout(function () {
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = '<span class="copy-text">' + SHARE_SVGS.copy + ' Copy</span>';
        }, 2200);
      }
    });

    return bar;
  }

  /* ── Hash Router (post detail) ───────────────────────────── */

  var _savedScrollY = 0;

  function initHashRouter() {
    function onHash() {
      var hash = window.location.hash;
      var match = hash.match(/^#post\/(\d+)$/);
      if (match) {
        // Save position BEFORE entering detail
        _savedScrollY = window.scrollY || window.pageYOffset || 0;
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
    
    // Make hovers full-width for post detail (override panel styling)
    var hoversEl = document.getElementById('hovers');
    if (hoversEl) {
      hoversEl.style.cssText = 'display:block!important;position:static;width:100%;min-height:100vh;background:#fff;padding:0;';
    }
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

    // Share Bar — professional multi-platform share + copy link
    detail.appendChild(buildShareBar(post));

    // Notes section (avatar grid style, matching original ol.notes)
    if (post.notes && post.notes > 0) {
      var notesWrap = el('div', { style: 'width:500px;margin:0 auto 30px;overflow:hidden;padding:22px 11px 0;border-top:1px dotted rgba(0,0,0,0.1);' });
      var notesLabel = el('div', { style: 'font-size:10px;font-weight:bold;line-height:20px;margin-bottom:15px;text-transform:uppercase;' });
      notesLabel.textContent = post.notes + ' notes';
      notesWrap.appendChild(notesLabel);
      // Placeholder note avatars — self-contained SVG data URI (no external dependency)
      var avatarGrid = el('ol', { className: 'notes' });
      // Self-contained 16x16 avatar as data URI (YRS "Y" monogram)
      var avatarDataUri = 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">' +
        '<rect width="16" height="16" rx="2" fill="#000000"/>' +
        '<text x="8" y="12.5" font-family="Arial,sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">Y</text>' +
        '</svg>'
      );
      for (var n = 0; n < Math.min(post.notes, 20); n++) {
        var li = el('li', { className: 'note' });
        var avatar = document.createElement('img');
        avatar.className = 'avatar';
        avatar.src = avatarDataUri;
        avatar.alt = 'YRS';
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
    // Reset hovers to original panel styling
    var hoversEl = document.getElementById('hovers');
    if (hoversEl) {
      hoversEl.style.cssText = '';
    }
    hide('#hovers');
    show('#container, #load_box, #yrs_credit');
    // Restore scroll position after content is visible
    setTimeout(function () {
      masonryLayout();
      window.scrollTo(0, _savedScrollY);
    }, 50);
  }

  /* ── Panel toggle ────────────────────────────────────────── */

  function setFilter(type) {
    _currentFilter = type;
    currentPage = 0;
    // Update active state on nav links
    var links = document.querySelectorAll('#header .links a');
    links.forEach(function (a) {
      var label = (a.textContent || '').toLowerCase();
      if (type === 'video' && (label.indexOf('music') !== -1 || label.indexOf('video') !== -1)) {
        a.style.fontWeight = '900';
        a.style.color = '#000';
      } else if (type === null && label.indexOf('lifestyle') !== -1) {
        a.style.fontWeight = 'bold';
        a.style.color = '#000';
      } else if (!a.getAttribute('data-panel')) {
        a.style.fontWeight = 'bold';
        a.style.color = '#000';
      }
    });
    // Re-render posts
    rebuildPosts();
  }

  function rebuildPosts() {
    var container = document.getElementById('container');
    if (!container) return;
    container.innerHTML = '';
    getVisiblePosts().forEach(function (post, i) {
      container.appendChild(buildPost(post, i));
    });
    container.appendChild(el('div', { className: 'clear' }));
    updateLoadButton();
    setTimeout(masonryLayout, 50);
  }

  function updateLoadButton() {
    var load = document.getElementById('load');
    if (!load) return;
    if (hasMorePosts()) {
      load.style.display = '';
      load.querySelector('a').textContent = 'Load More';
    } else {
      load.style.display = 'none';
    }
  }

  function attachPanelListeners(content) {
    var aboutBtn = content.querySelector('#header .description');
    var connectBtn = content.querySelector('#header a[data-panel="connect"]');
    var closeBtn = content.querySelector('#close');
    var goUpBtn = document.getElementById('up');

    // Nav link filter handlers
    var navLinks = content.querySelectorAll('#header .links a');
    navLinks.forEach(function (a) {
      var label = (a.textContent || '').toLowerCase();
      // Music & Videos → filter video posts
      if (label.indexOf('music') !== -1 || label.indexOf('video') !== -1) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          closePostDetail();
          hide('#hovers, #description_box, #connect_box, #blogroll_box, #twitter_box');
          show('#container, #load_box');
          setFilter('video');
        });
      }
      // Lifestyle → show all posts
      else if (label.indexOf('lifestyle') !== -1) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          closePostDetail();
          hide('#hovers, #description_box, #connect_box, #blogroll_box, #twitter_box');
          show('#container, #load_box');
          setFilter(null);
        });
      }
    });

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
  window.YRS_UI = { rebuild: rebuildPage, rebuildPosts: rebuildPosts, getAllPosts: getAllPosts };

  /* ── Boot ────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
