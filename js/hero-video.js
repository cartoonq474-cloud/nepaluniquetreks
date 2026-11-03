// Hero Section Multi-Video Background Crossfade Controller
// Seamlessly cycles through Clip Video First -> Fifth in an infinite loop

(function () {
  function initHeroVideo() {
    const video1 = document.getElementById('hero-bg-video-1');
    const video2 = document.getElementById('hero-bg-video-2');

    if (!video1 || !video2) return;

    const playlist = [
      'video/Clip%20Video%20First.mp4',
      'video/Clip%20Video%20Second.mp4',
      'video/Clip%20Video%20Third.mp4',
      'video/Clip%20Video%20Fourth.mp4',
      'video/Clip%20Video%20Fifth.mp4'
    ];

    let currentIndex = 0;
    let activeVideo = video1;
    let nextVideo = video2;
    let isTransitioning = false;
    let transitionLockTimer = null;
    const CROSSFADE_SEC = 1.2;

    // Initialize attributes for reliable autoplay
    [video1, video2].forEach(v => {
      v.muted = true;
      v.playsInline = true;
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
      v.autoplay = true;
    });

    // Set initial sources
    video1.src = playlist[0];
    video1.classList.add('active');
    video2.classList.remove('active');

    function safePlay(video) {
      const p = video.play();
      if (p !== undefined) {
        p.catch(() => {
          // If browser policy blocks autoplay, resume on first user interaction
          const resume = () => {
            if (activeVideo.paused) activeVideo.play();
            document.removeEventListener('click', resume);
            document.removeEventListener('touchstart', resume);
          };
          document.addEventListener('click', resume, { once: true });
          document.addEventListener('touchstart', resume, { once: true });
        });
      }
    }

    safePlay(video1);

    // Preload next clip into standby slot
    const firstPreloadIdx = (currentIndex + 1) % playlist.length;
    nextVideo.src = playlist[firstPreloadIdx];
    nextVideo.load();

    function transitionToNext() {
      if (isTransitioning) return;
      isTransitioning = true;

      currentIndex = (currentIndex + 1) % playlist.length;
      const upcomingVideo = nextVideo;
      const outgoingVideo = activeVideo;

      // Start playing the incoming video
      safePlay(upcomingVideo);

      // Perform the visual crossfade
      upcomingVideo.classList.add('active');
      outgoingVideo.classList.remove('active');

      // Swap active and next references
      activeVideo = upcomingVideo;
      nextVideo = outgoingVideo;

      // Reset transition lock after crossfade completes
      clearTimeout(transitionLockTimer);
      transitionLockTimer = setTimeout(() => {
        try {
          outgoingVideo.pause();
          outgoingVideo.currentTime = 0;
        } catch (e) {}

        // Preload the next upcoming clip in the background
        const nextPreloadIdx = (currentIndex + 1) % playlist.length;
        outgoingVideo.src = playlist[nextPreloadIdx];
        outgoingVideo.load();
        isTransitioning = false;
      }, (CROSSFADE_SEC * 1000) + 150);
    }

    function handleTimeUpdate(e) {
      const v = e.target;
      if (v !== activeVideo || isTransitioning) return;

      if (v.duration && v.duration > 0 && (v.duration - v.currentTime <= CROSSFADE_SEC)) {
        transitionToNext();
      }
    }

    function handleEnded(e) {
      if (e.target === activeVideo) {
        transitionToNext();
      }
    }

    // Attach listeners to both slots
    [video1, video2].forEach(v => {
      v.addEventListener('timeupdate', handleTimeUpdate);
      v.addEventListener('ended', handleEnded);
      v.addEventListener('error', (e) => {
        console.warn('Video slot warning, transitioning:', e);
        if (v === activeVideo) {
          setTimeout(transitionToNext, 500);
        }
      });
    });

    // Failsafe Watchdog: checks every 1.5 seconds so video never freezes
    let lastTime = 0;
    let stallCount = 0;
    setInterval(() => {
      if (!activeVideo || isTransitioning) return;

      // Ensure active video is playing
      if (activeVideo.paused && !document.hidden) {
        safePlay(activeVideo);
      }

      // Check if video is at or past end without triggering ended event
      if (activeVideo.duration && activeVideo.duration > 0) {
        if (activeVideo.currentTime >= activeVideo.duration - 0.5) {
          transitionToNext();
          return;
        }
      }

      // Check for freeze / stall
      if (Math.abs(activeVideo.currentTime - lastTime) < 0.1 && !activeVideo.paused) {
        stallCount++;
        if (stallCount >= 4) { // Stalled for ~6 seconds
          stallCount = 0;
          transitionToNext();
        }
      } else {
        stallCount = 0;
      }
      lastTime = activeVideo.currentTime;
    }, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroVideo);
  } else {
    initHeroVideo();
  }
})();
