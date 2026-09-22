(() => {
  const NS = 'okajb.github.io';

  const safe = value => String(value || 'inconnu')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'inconnu';

  const track = (action, key) => {
    const img = new Image(1, 1);
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.style.position = 'absolute';
    img.style.left = '-9999px';
    img.style.width = '1px';
    img.style.height = '1px';
    img.style.opacity = '0';
    img.src = 'https://counterapi.com/pixel.gif?ns=' + encodeURIComponent(NS)
      + '&action=' + encodeURIComponent(safe(action))
      + '&key=' + encodeURIComponent(safe(key))
      + '&_=' + Date.now();
    const cleanup = () => img.remove();
    img.addEventListener('load', cleanup, { once: true });
    img.addEventListener('error', cleanup, { once: true });
    document.body.appendChild(img);
  };

  const trackStart = (media, action, keyProvider) => {
    if (!media) return;
    let last = 0;
    media.addEventListener('play', () => {
      if (media.currentTime > 1.5) return;
      const now = Date.now();
      if (now - last < 2000) return;
      last = now;
      track(action, typeof keyProvider === 'function' ? keyProvider() : keyProvider);
    });
  };

  const platformFromHref = href => {
    try {
      const host = new URL(href, location.href).hostname.toLowerCase();
      if (host.includes('bandcamp.com')) return 'bandcamp';
      if (host.includes('spotify.com')) return 'spotify';
      if (host.includes('instagram.com')) return 'instagram';
      if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube';
      if (host.includes('music.apple.com')) return 'apple-music';
      if (host.includes('deezer.com')) return 'deezer';
      if (host.includes('soundcloud.com')) return 'soundcloud';
      if (host.includes('tiktok.com')) return 'tiktok';
      if (host.includes('facebook.com')) return 'facebook';
      if (host.includes('x.com') || host.includes('twitter.com')) return 'x';
    } catch (_) {}
    return null;
  };

  document.addEventListener('DOMContentLoaded', () => {
    track('view', 'site');
    track('page-view', location.pathname.includes('paroles') ? 'paroles' : 'accueil');

    const teaser = document.querySelector('#grand-dans-ma-tete video');
    trackStart(teaser, 'video-play', 'grand-dans-ma-tete');

    const radio = document.getElementById('audioPlayer');
    trackStart(radio, 'audio-play', () => {
      if (window.OKAJB && Array.isArray(window.OKAJB.tracks)) {
        const current = radio.currentSrc || radio.src;
        const found = window.OKAJB.tracks.find(t => {
          try { return new URL(t.audio, location.href).href === current; } catch (_) { return false; }
        });
        if (found && found.slug) return found.slug;
      }
      const title = document.getElementById('playerTitle');
      return title ? title.textContent : 'radio';
    });

    const picassoAudio = document.querySelector('.picasso-section audio');
    trackStart(picassoAudio, 'audio-play', 'picasso');

    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link) return;

      const label = (link.textContent || '').trim().toLowerCase();
      if (label.includes('soutenir okajb')) {
        track('support-click', 'grand-dans-ma-tete');
      }

      const platform = platformFromHref(link.href);
      if (platform) track('outbound-click', platform);
    }, true);
  });

  window.OKAJBAnalytics = { track };
})();
