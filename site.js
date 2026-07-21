/**
 * site.js — YRS Brand content & data
 * All post content, brand info, navigation links live here.
 * Edit this file to update what the site shows.
 *
 * Tag system:
 *   "lifestyle"  — photo, link, reblog, quote, text posts
 *   "media"      — video, audio (music) posts
 *   Posts can have multiple tags; nav links filter by tag.
 */

var SITE_DATA = {
  "brand": "YRS",
  "description": "YRS\u00AE Brand. <br><br>We create apparel that motivates and inspires the individual to be great &amp; Enjoy life while you listen to your favorite music, skateboarding down the street, or in flight to your next destination, &amp; inspire people along the way. There's too much to be thankful for \u2014 If you're high, never come down &amp; Stay Fresh!<br><br>Shop The Official YRS\u00AE Brand Online Store for a wide range of exclusive apparel and custom footwear.  -everythingisYRS",
  "links": [
    {
      "label": "lifestyle",
      "href": "/",
      "title": "lifestyle",
      "filterTag": "lifestyle"
    },
    {
      "label": "music & videos",
      "href": "/tagged/media",
      "title": "music & videos",
      "filterTag": "media"
    },
    {
      "label": "[ shop ]",
      "href": "http://www.shopyrs.com",
      "title": "[ shop ]",
      "external": true
    },
    {
      "label": "connect",
      "href": "#connect",
      "title": "connect",
      "panel": "connect"
    }
  ],
  "social": [
    {
      "label": "Facebook",
      "href": "https://www.facebook.com/yrsbrand",
      "svg": '<svg width="20" height="20" viewBox="0 0 24 24" fill="#000"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>'
    },
    {
      "label": "Twitter",
      "href": "https://www.twitter.com/yrsbrand",
      "svg": '<svg width="20" height="20" viewBox="0 0 24 24" fill="#000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>'
    },
    {
      "label": "Instagram",
      "href": "https://www.instagram.com/yrsbrand",
      "svg": '<svg width="20" height="20" viewBox="0 0 24 24" fill="#000"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>'
    }
  ],
  "connectInfo": "Follow YRS\u00AE Brand across all platforms for updates, drops, and behind-the-scenes content.",
  "posts": [
    /* ─── Media: Video ─────────────────────────────── */
    {
      "type": "video",
      "src": "https://www.youtube.com/embed/5L4LvlJZhBs?feature=oembed&enablejsapi=1&wmode=opaque",
      "title": "Starr L.PRO - YRS Brand (Fly Shit Only)",
      "date": "23.Feb.14",
      "timeAgo": "12 years ago",
      "url": "https://yrsbrand.tumblr.com/post/77574370340",
      "tags": ["media", "video"],
      "thumbnail": "https://img.youtube.com/vi/5L4LvlJZhBs/hqdefault.jpg"
    },
    /* ─── Media: Audio / Music ─────────────────────── */
    {
      "type": "audio",
      "platform": "spotify",
      "embedUrl": "https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT?utm_source=generator",
      "title": "YRS Brand Playlist — Fly Shit Only",
      "artist": "Starr L.PRO",
      "date": "15.Jul.26",
      "timeAgo": "now",
      "url": "https://spotify.com",
      "tags": ["media", "audio", "music"]
    },
    {
      "type": "audio",
      "platform": "soundcloud",
      "embedUrl": "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/123456789&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true",
      "title": "YRS Exclusive Mixtape",
      "artist": "Various Artists",
      "date": "10.Jul.26",
      "timeAgo": "1 week ago",
      "url": "https://soundcloud.com/yrsbrand",
      "tags": ["media", "audio", "music"]
    },
    {
      "type": "audio",
      "platform": "apple",
      "embedUrl": "https://embed.music.apple.com/us/album/single/123456789?app=music",
      "title": "Stay Fresh — Single",
      "artist": "YRS Brand",
      "date": "01.Jul.26",
      "timeAgo": "2 weeks ago",
      "url": "https://music.apple.com",
      "tags": ["media", "audio", "music"]
    },
    /* ─── Lifestyle: Photos ────────────────────────── */
    {
      "type": "photo",
      "img": "https://64.media.tumblr.com/2e5059bcd013b03eca865b26c05bc4e1/6496aa7bc41b1825-46/s500x750/e4a8f7dd42a5d6e02ce57cbe2bcf6c605126f268.jpg",
      "notes": 12,
      "caption": "Green and Gold Hippie Tee. #GreenGoldBrand",
      "date": "25.Feb.21",
      "timeAgo": "5 years ago",
      "url": "https://yrsbrand.tumblr.com/post/644132596883898368",
      "reblogUrl": "https://www.tumblr.com/reblog/yrsbrand/644132596883898368/a0yOK1YU",
      "tags": ["lifestyle", "photo", "apparel"]
    },
    {
      "type": "photo",
      "img": "https://64.media.tumblr.com/8b3e84d66bf86a98239fdb0dfe471e49/tumblr_n3x5jdZ0Xt1ttyzz9o1_500.jpg",
      "notes": 5,
      "caption": "YSL Pro Restocked — Support The Growth.",
      "date": "29.May.14",
      "timeAgo": "12 years ago",
      "url": "https://yrsbrand.tumblr.com/post/87204718074",
      "reblogUrl": "https://www.tumblr.com/reblog/yrsbrand/87204718074/Cl3b407R",
      "tags": ["lifestyle", "photo", "apparel"]
    },
    {
      "type": "photo",
      "img": "https://64.media.tumblr.com/1957f9a3d9c890c951462481c08fc989/tumblr_n1u65utCFK1ttbukao1_500.png",
      "notes": 2,
      "caption": "Paradisimo Collection Drop.",
      "date": "02.Mar.14",
      "timeAgo": "12 years ago",
      "url": "https://yrsbrand.tumblr.com/post/78383765051",
      "reblogUrl": "https://www.tumblr.com/reblog/yrsbrand/78383765051/y8x4woKD",
      "tags": ["lifestyle", "photo"]
    },
    {
      "type": "photo",
      "img": "https://64.media.tumblr.com/8c952fe8c2c6acbe545d923b585b02f3/tumblr_n1u5z7uJVE1ttbukao1_500.jpg",
      "notes": 2,
      "caption": "100% Authentic Limited Edition Custom Jordans. Now Available.",
      "date": "02.Mar.14",
      "timeAgo": "12 years ago",
      "url": "https://yrsbrand.tumblr.com/post/78383365965",
      "reblogUrl": "https://www.tumblr.com/reblog/yrsbrand/78383365965/5ZJNSykh",
      "tags": ["lifestyle", "photo", "footwear"]
    },
    {
      "type": "photo",
      "img": "https://64.media.tumblr.com/12446b26fe34ec1d04998f295041e459/tumblr_n1m5b5XYQE1ttbukao1_500.jpg",
      "notes": 1,
      "caption": "YRS Brand Bimmer Edition.",
      "date": "26.Feb.14",
      "timeAgo": "12 years ago",
      "url": "https://yrsbrand.tumblr.com/post/77917837235",
      "reblogUrl": "https://www.tumblr.com/reblog/yrsbrand/77917837235/3uEz5Obv",
      "tags": ["lifestyle", "photo", "automotive"]
    },
    {
      "type": "photo",
      "img": "https://64.media.tumblr.com/249d6d5f8b65a14f193d3c852875050f/tumblr_n1gwvoOMeT1ttbukao1_500.png",
      "notes": 5,
      "caption": "New Season Loading...",
      "date": "23.Feb.14",
      "timeAgo": "12 years ago",
      "url": "https://yrsbrand.tumblr.com/post/77628704000",
      "reblogUrl": "https://www.tumblr.com/reblog/yrsbrand/77628704000/ZdaVOoyy",
      "tags": ["lifestyle", "photo"]
    },
    {
      "type": "photo",
      "img": "https://64.media.tumblr.com/b9aa0a309ce658604000954498dd1ef5/tumblr_n1f5ebYxTa1ttbukao1_500.jpg",
      "notes": 7,
      "caption": "Summer '14 Preview.",
      "date": "22.Feb.14",
      "timeAgo": "12 years ago",
      "url": "https://yrsbrand.tumblr.com/post/77520134567",
      "reblogUrl": "https://www.tumblr.com/reblog/yrsbrand/77520134567/sdn6LpOJ",
      "tags": ["lifestyle", "photo"]
    },
    /* ─── Lifestyle: Quote ─────────────────────────── */
    {
      "type": "quote",
      "text": "If you're high, never come down \u2014 Stay Fresh!",
      "source": "YRS Brand Manifesto",
      "date": "01.Jan.14",
      "timeAgo": "13 years ago",
      "url": "https://yrsbrand.tumblr.com",
      "tags": ["lifestyle", "quote"]
    },
    /* ─── Lifestyle: Link ──────────────────────────── */
    {
      "type": "link",
      "title": "Quote Of The Day — GOOD VIBES",
      "href": "https://www.goodvibes.ga/quote-of-the-day/",
      "desc": "Daily motivation to keep your energy aligned and your mindset right.",
      "date": "21.Jan.21",
      "timeAgo": "5 years ago",
      "url": "https://yrsbrand.tumblr.com/post/640897384951496704",
      "tags": ["lifestyle", "link"]
    },
    /* ─── Lifestyle: Text ──────────────────────────── */
    {
      "type": "text",
      "title": "The YRS Philosophy",
      "body": "<p>We create apparel that motivates and inspires the individual to be great. Enjoy life while you listen to your favorite music, skateboarding down the street, or in flight to your next destination.</p><p>Inspire people along the way. There's too much to be thankful for.</p><p><em>If you're high, never come down &mdash; Stay Fresh!</em></p>",
      "date": "15.Dec.13",
      "timeAgo": "13 years ago",
      "url": "https://yrsbrand.tumblr.com",
      "tags": ["lifestyle", "text"]
    },
    /* ─── Lifestyle: Reblog ───────────────────────── */
    {
      "type": "reblog",
      "html": "<p><a href=\"https://supportthehomegrown.tumblr.com\" class=\"tumblr_blog\">supportthehomegrown</a>:</p><blockquote><figure class=\"tmblr-full\" data-orig-height=\"1000\" data-orig-width=\"1000\"><a href=\"https://supportthehomegrown.bigcartel.com/product/support-dark-green-white\"><img src=\"https://64.media.tumblr.com/6cb29173bbd144ebe18af62b31fa303c/ce558bb518e63301-aa/s500x750/a820392b788a9e24199ded58f34ccfac0c0784f8.png\" data-orig-height=\"1000\" data-orig-width=\"1000\" width=\"500\" height=\"500\" alt=\"Support Dark Green White\"></a></figure><a href=\"https://supportthehomegrown.bigcartel.com/product/support-light-green-black\"><img src=\"https://64.media.tumblr.com/8470101cd471b2f437110c47887482a4/ce558bb518e63301-b0/s500x750/abbe186977612ec72ff52a3b01224381e8601932.png\" width=\"500\" height=\"500\" alt=\"Support Light Green Black\"></a></blockquote>",
      "date": "25.Feb.21",
      "timeAgo": "5 years ago",
      "url": "https://yrsbrand.tumblr.com/post/644132651600609280",
      "tags": ["lifestyle", "reblog"]
    }
  ],
  "footer": "<font style=\"font-family:Serif; font-size: 50px;letter-spacing:-1px;font-weight:600\">YRS\u00AE</font><br>\u00A9 2010-2026 YRS Brand"
};
