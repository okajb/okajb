(() => {
  const data = window.OKAJB;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  const navToggle = $('.nav-toggle');
  const nav = $('.main-nav');
  if (navToggle && nav) navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  if ($('#bioText')) $('#bioText').textContent = data.bio;

  const platforms = $('#platforms');
  if (platforms) {
    const marks={bandcamp:'▰',spotify:'◉',applemusic:'♪',youtubemusic:'▶',youtube:'▶',deezer:'≋',soundcloud:'☁',instagram:'◎',tiktok:'♪',facebook:'f',x:'𝕏'};
    platforms.innerHTML = data.socials.map((s, i) => `
      <a class="platform ${i===0?'priority':''}" href="${s.url}" target="_blank" rel="noopener">
        <span class="platform-mark ${s.slug}" aria-hidden="true">${marks[s.slug]||'•'}</span>
        <span>${s.name}</span>
      </a>`).join('');
  }

  const lyricsPreview = $('#lyricsPreview');
  if (lyricsPreview) {
    lyricsPreview.innerHTML = data.tracks.slice(0,6).map(t => `
      <a class="lyric-card" href="paroles.html#${t.slug}">
        <img src="${t.cover}" alt="${esc(t.title)}">
        <div><span>${t.explicit?'EXPLICIT · ':''}${t.duration}</span><h3>${esc(t.title)}</h3><b>VOIR LES PAROLES →</b></div>
      </a>`).join('');
  }

  const audio = $('#audioPlayer');
  if (audio) {
    const cover = $('#playerCover'), title = $('#playerTitle'), time = $('#playerTime'), progress = $('#progress');
    const playPause = $('#playPause'), trackList = $('#trackList');
    let current = 0;
    const load = (idx, autoplay=false) => {
      current = (idx + data.tracks.length) % data.tracks.length;
      const t = data.tracks[current];
      audio.src = t.audio;
      cover.src = t.cover;
      cover.alt = t.title;
      title.textContent = t.title;
      time.textContent = `0:00 / ${t.duration}`;
      trackList.querySelectorAll('.track-row').forEach((r,i)=>r.classList.toggle('active',i===current));
      if (autoplay) audio.play().catch(()=>{});
    };
    const fmt = s => { if(!isFinite(s)) return '0:00'; const m=Math.floor(s/60), sec=Math.floor(s%60).toString().padStart(2,'0'); return `${m}:${sec}`; };
    trackList.innerHTML = data.tracks.map((t,i)=>`
      <button class="track-row ${i===0?'active':''}" type="button" data-i="${i}">
        <span class="num">${String(i+1).padStart(2,'0')}</span>
        <img src="${t.cover}" alt="">
        <span class="track-meta"><strong>${esc(t.title)}</strong><small>${t.explicit?'EXPLICIT · ':''}${t.firstSingle?'1ER SINGLE · ':''}OKAJB</small></span>
        <span>${t.duration}</span><span class="row-play">▶</span>
      </button>`).join('');
    trackList.addEventListener('click', e => { const row=e.target.closest('.track-row'); if(row) load(+row.dataset.i,true); });
    playPause.addEventListener('click',()=> audio.paused ? audio.play() : audio.pause());
    $('#prevTrack').addEventListener('click',()=>load(current-1,true));
    $('#nextTrack').addEventListener('click',()=>load(current+1,true));
    audio.addEventListener('play',()=>playPause.textContent='Ⅱ');
    audio.addEventListener('pause',()=>playPause.textContent='▶');
    audio.addEventListener('ended',()=>load(current+1,true));
    audio.addEventListener('timeupdate',()=>{
      const pct = audio.duration ? audio.currentTime/audio.duration*1000 : 0;
      progress.value = pct;
      time.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
    });
    progress.addEventListener('input',()=>{ if(audio.duration) audio.currentTime = progress.value/1000*audio.duration; });
    load(0,false);
    const featureBtn = $('.js-play-feature');
    if (featureBtn) featureBtn.addEventListener('click',()=>{ load(0,true); document.querySelector('.radio-section').scrollIntoView({behavior:'smooth'}); });
  }

  const pBtn = $('#picassoLyricsBtn'), pPanel=$('#picassoLyrics');
  if (pBtn && pPanel) {
    pPanel.textContent=data.picasso.lyrics;
    pBtn.addEventListener('click',()=>{ pPanel.hidden=!pPanel.hidden; pBtn.textContent=pPanel.hidden?'LIRE LES PAROLES':'MASQUER LES PAROLES'; if(!pPanel.hidden) pPanel.scrollIntoView({behavior:'smooth',block:'nearest'}); });
  }

  const idx = $('#lyricsIndex'), full = $('#lyricsFull');
  if (idx && full) {
    const render = (filter='') => {
      const q=filter.trim().toLowerCase();
      const tracks=data.tracks.filter(t=>t.title.toLowerCase().includes(q));
      idx.innerHTML = tracks.map(t=>`<a class="lyrics-index-card" href="#${t.slug}"><img src="${t.cover}" alt=""><span><b>${esc(t.title)}</b><small>${t.duration}${t.firstSingle?' · premier single':''}</small></span><i>↓</i></a>`).join('');
      full.innerHTML = tracks.map(t=>`<article class="lyric-entry" id="${t.slug}"><div class="lyric-side"><img src="${t.cover}" alt="${esc(t.title)}"><div><span class="eyebrow">OKAJB · ${t.duration}</span><h2>${esc(t.title)}</h2>${t.bandcamp?`<a class="btn btn-primary" href="${t.bandcamp}" target="_blank" rel="noopener">BANDCAMP ↗</a>`:''}</div></div><pre>${esc(t.lyrics)}</pre></article>`).join('');
    };
    render();
    const search=$('#lyricsSearch'); if(search) search.addEventListener('input',()=>render(search.value));
    if(location.hash) setTimeout(()=>document.querySelector(location.hash)?.scrollIntoView({behavior:'smooth'}),150);
  }
  if ($('#picassoLyricsPage')) $('#picassoLyricsPage').textContent=data.picasso.lyrics;
})();

(() => {
  const modal = document.getElementById('zoomModal');
  const img = document.getElementById('zoomImage');
  const caption = document.getElementById('zoomCaption');
  const closeBtn = document.getElementById('zoomClose');
  if (!modal || !img || !caption || !closeBtn) return;
  const openModal = (src, title) => {
    img.src = src;
    img.alt = title;
    caption.textContent = title;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeModal = () => {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    img.src = '';
    document.body.style.overflow = '';
  };
  document.querySelectorAll('.zoomable-product').forEach(card => {
    const handler = () => openModal(card.dataset.image, card.dataset.title || 'Merch OKAJB');
    card.addEventListener('click', handler);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handler();
      }
    });
  });
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
})();