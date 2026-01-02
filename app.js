// ═══════════════════════════════════════════════════════════════
// 🎬 TV SHOW PLAYER - COMPLETE SCRIPT (OPTIMIZED & FIXED)
// ═══════════════════════════════════════════════════════════════

const API = "https://7jaafardarim.workers.dev";

// ═══════════════════════════════════════════════════════════════
// 📺 PLAYER VARIABLES
// ═══════════════════════════════════════════════════════════════
let player;
let currentVideo = 0;
let isPlaying = false;
let playerReady = false;
let playlist = [];
let currentVolume = 100;
let isMuted = false;
let isFullscreen = false;
let isUserSeeking = false;
let currentPlaybackRate = 1.0;
let playbackRates = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
let currentPlaybackRateIndex = 3;
let lastActiveTime = Date.now();
let isLightTheme = false;
let hideControlsTimeout;
let fullscreenApi;

// ═══════════════════════════════════════════════════════════════
// 💬 COMMENTS VARIABLES - OPTIMIZED
// ═══════════════════════════════════════════════════════════════
let comments = [];
let commentsLoadInterval = null;

// ═══════════════════════════════════════════════════════════════
// 🎯 DOM ELEMENTS
// ═══════════════════════════════════════════════════════════════
const playerContainer = document.getElementById('player-container');
const playerOverlay = document.getElementById('player-overlay');
const customControls = document.getElementById('custom-controls');
const playPauseButton = document.getElementById('play-pause');
const prevVideoButton = document.getElementById('prev-video');
const nextVideoButton = document.getElementById('next-video');
const rewindButton = document.getElementById('rewind');
const forwardButton = document.getElementById('forward');
const muteButton = document.getElementById('mute');
const volumeSlider = document.getElementById('volume-slider');
const volumeLevel = document.getElementById('volume-level');
const timeDisplay = document.getElementById('time-display');
const fullscreenButton = document.getElementById('fullscreen');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const progressHoverTime = document.getElementById('progress-hover-time');
const loader = document.getElementById('loader');
const playbackSpeedButton = document.getElementById('playback-speed');
const themeToggleButton = document.getElementById('theme-toggle');
const tvButton = document.getElementById('tv-button');

// ═══════════════════════════════════════════════════════════════
// 🚀 INITIALIZATION
// ═══════════════════════════════════════════════════════════════
function onYouTubeIframeAPIReady() {
    console.log('✅ YouTube API Ready');
    
    loadPlaylistFromStorage();
    setupFullscreenAPI();
    loadThemePreference();
    
    if (playlist.length > 0) {
        initializePlayer(playlist[0].videoId);
    } else {
        loader.style.display = 'none';
        showNotification('لا توجد فيديوهات في قائمة التشغيل. الرجاء إضافة بعض الفيديوهات.');
    }
    
    setupAutoHideControls();
    renderEpisodesList();
    
    // ✅ تحميل التعليقات فوراً
    loadCommentsFromAPI();
    
    // ✅ تحديث تلقائي كل 10 ثواني
    startCommentsAutoRefresh();
}

// ═══════════════════════════════════════════════════════════════
// 💬 COMMENTS API - FULLY FIXED & OPTIMIZED
// ═══════════════════════════════════════════════════════════════

/**
 * ✅ تحميل التعليقات من الـ API - محسّن ومُصلح
 */
async function loadCommentsFromAPI() {
    try {
        console.log(`🔄 Loading comments at ${new Date().toLocaleTimeString()}...`);
        
        const response = await fetch(`${API}/comments?t=${Date.now()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            },
            cache: 'no-store',
            signal: AbortSignal.timeout(10000)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const newComments = await response.json();
        
        // ✅ التحقق من صحة البيانات
        if (!Array.isArray(newComments)) {
            console.error('❌ Invalid data format:', newComments);
            return false;
        }
        
        // ✅ إزالة نظام الـ Hash - تحديث دائمًا
        const oldCount = comments.length;
        comments = newComments;
        
        console.log(`✅ Comments loaded: ${comments.length} items (was: ${oldCount})`);
        
        // ✅ إعادة الرسم دائمًا
        renderCommentsList();
        
        return true;
    } catch (error) {
        console.error('❌ Error loading comments:', error);
        
        // ✅ في حالة الخطأ، عرض رسالة للمستخدم
        const container = document.getElementById('comments-list');
        if (container && comments.length === 0) {
            container.innerHTML = `
                <div class="no-comments error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>خطأ في تحميل التعليقات</p>
                    <p style="font-size: 0.9em; opacity: 0.7;">${error.message}</p>
                    <button onclick="loadCommentsFromAPI()" style="
                        margin-top: 10px;
                        padding: 8px 16px;
                        background: #3b82f6;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-family: 'Cairo', sans-serif;
                    ">
                        <i class="fas fa-sync-alt"></i> إعادة المحاولة
                    </button>
                </div>
            `;
        }
        
        return false;
    }
}

/**
 * ✅ رسم قائمة التعليقات - محسّن
 */
function renderCommentsList() {
    const container = document.getElementById('comments-list');
    
    if (!container) {
        console.warn('⚠️ Comments container not found');
        return;
    }
    
    console.log(`🎨 Rendering ${comments.length} comments at ${new Date().toLocaleTimeString()}`);
    
    if (comments.length === 0) {
        container.innerHTML = `
            <div class="no-comments">
                <i class="fas fa-comments"></i>
                <p>لا توجد تعليقات بعد</p>
                <p>كن أول من يعلق على هذه الحلقات!</p>
            </div>
        `;
        return;
    }
    
    // ✅ ترتيب التعليقات (الأحدث أولاً) - مع التأكد من وجود time
    const sortedComments = [...comments].sort((a, b) => {
        const timeA = a.time || new Date(a.date).getTime() || 0;
        const timeB = b.time || new Date(b.date).getTime() || 0;
        return timeB - timeA;
    });
    
    const commentsHTML = sortedComments.map(comment => {
        const name = escapeHtml(comment.name || 'مجهول');
        const text = escapeHtml(comment.text || '');
        const date = formatCommentDate(comment.time || comment.date);
        
        return `
            <div class="comment-item" data-id="${comment.id || ''}" data-time="${comment.time || ''}">
                <div class="comment-header">
                    <div class="comment-author">
                        <i class="fas fa-user-circle"></i>
                        <span>${name}</span>
                    </div>
                    <div class="comment-date">
                        <i class="fas fa-clock"></i>
                        <span>${date}</span>
                    </div>
                </div>
                <div class="comment-text">${text}</div>
            </div>
        `;
    }).join('');
    
    // ✅ تحديث بتأثير سلس
    container.style.transition = 'opacity 0.3s ease';
    container.style.opacity = '0.7';
    container.innerHTML = commentsHTML;
    
    // ✅ إعادة الشفافية بعد 100ms
    setTimeout(() => {
        container.style.opacity = '1';
    }, 100);
    
    console.log(`✅ Comments rendered successfully (${sortedComments.length} items)`);
}

/**
 * ✅ تنسيق التاريخ - محسّن
 */
function formatCommentDate(timestamp) {
    try {
        let date;
        
        // معالجة أنواع مختلفة من التواريخ
        if (typeof timestamp === 'number') {
            date = new Date(timestamp);
        } else if (typeof timestamp === 'string') {
            date = new Date(timestamp);
        } else {
            return 'الآن';
        }
        
        // التحقق من صحة التاريخ
        if (isNaN(date.getTime())) {
            return 'الآن';
        }
        
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        // عرض نسبي للتواريخ الحديثة
        if (diffMins < 1) return 'الآن';
        if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
        if (diffHours < 24) return `منذ ${diffHours} ساعة`;
        if (diffDays < 7) return `منذ ${diffDays} يوم`;
        
        // عرض تاريخ كامل للتواريخ القديمة
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Date format error:', error);
        return 'تاريخ غير صحيح';
    }
}

/**
 * ✅ تنظيف HTML من الأكواد الخطرة
 */
function escapeHtml(text) {
    if (!text) return '';
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
        '/': '&#x2F;'
    };
    
    return String(text).replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * ✅ إرسال تعليق - محسّن بتحديثات متعددة
 */
async function submitComment(name, text) {
    try {
        console.log('📤 Submitting comment:', { name, text });
        
        const response = await fetch(`${API}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name.trim(),
                text: text.trim()
            })
        });

        const result = await response.json();
        console.log('📥 Submit response:', result);
        
        if (response.ok && result.success) {
            // ✅ تحديثات متعددة للتأكد من ظهور التعليق
            setTimeout(() => loadCommentsFromAPI(), 1000);  // بعد ثانية
            setTimeout(() => loadCommentsFromAPI(), 3000);  // بعد 3 ثواني
            setTimeout(() => loadCommentsFromAPI(), 6000);  // بعد 6 ثواني
            setTimeout(() => loadCommentsFromAPI(), 10000); // بعد 10 ثواني
            
            return {
                success: true,
                message: result.message || 'تم إرسال تعليقك بنجاح! سيظهر بعد موافقة المشرف.'
            };
        } else {
            return {
                success: false,
                message: result.error || 'حدث خطأ أثناء الإرسال. حاول مجدداً.'
            };
        }
    } catch (error) {
        console.error('❌ Submit error:', error);
        return {
            success: false,
            message: 'خطأ في الاتصال بالخادم. تحقق من اتصالك بالإنترنت.'
        };
    }
}

/**
 * ✅ بدء التحديث التلقائي - محسّن
 */
function startCommentsAutoRefresh() {
    // إيقاف الـ interval السابق
    if (commentsLoadInterval) {
        clearInterval(commentsLoadInterval);
    }
    
    // ✅ تحديث كل 10 ثواني (أسرع من 15)
    commentsLoadInterval = setInterval(() => {
        console.log(`🔄 Auto-refresh at ${new Date().toLocaleTimeString()}`);
        loadCommentsFromAPI();
    }, 10000); // 10 ثواني
    
    console.log('✅ Auto-refresh started (every 10s)');
}

/**
 * ✅ إيقاف التحديث التلقائي
 */
function stopCommentsAutoRefresh() {
    if (commentsLoadInterval) {
        clearInterval(commentsLoadInterval);
        commentsLoadInterval = null;
        console.log('⏸️ Auto-refresh stopped');
    }
}

/**
 * ✅ إعادة تحميل التعليقات يدوياً - محسّن
 */
async function refreshComments() {
    const btn = document.getElementById('refresh-comments-btn');
    
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جارٍ التحديث...';
    }
    
    try {
        const success = await loadCommentsFromAPI();
        
        if (success) {
            showNotification('✅ تم تحديث التعليقات', 'success');
        } else {
            showNotification('⚠️ فشل التحديث', 'warning');
        }
    } catch (error) {
        showNotification('❌ خطأ في التحديث', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> تحديث التعليقات';
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// 📺 PLAYER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function setupFullscreenAPI() {
    if (document.documentElement.requestFullscreen) {
        fullscreenApi = {
            requestFullscreen: 'requestFullscreen',
            exitFullscreen: 'exitFullscreen',
            fullscreenElement: 'fullscreenElement',
            fullscreenEnabled: 'fullscreenEnabled',
            fullscreenchange: 'fullscreenchange'
        };
    } else if (document.documentElement.webkitRequestFullscreen) {
        fullscreenApi = {
            requestFullscreen: 'webkitRequestFullscreen',
            exitFullscreen: 'webkitExitFullscreen',
            fullscreenElement: 'webkitFullscreenElement',
            fullscreenEnabled: 'webkitFullscreenEnabled',
            fullscreenchange: 'webkitfullscreenchange'
        };
    } else if (document.documentElement.mozRequestFullScreen) {
        fullscreenApi = {
            requestFullscreen: 'mozRequestFullScreen',
            exitFullscreen: 'mozCancelFullScreen',
            fullscreenElement: 'mozFullScreenElement',
            fullscreenEnabled: 'mozFullScreenEnabled',
            fullscreenchange: 'mozfullscreenchange'
        };
    } else if (document.documentElement.msRequestFullscreen) {
        fullscreenApi = {
            requestFullscreen: 'msRequestFullscreen',
            exitFullscreen: 'msExitFullscreen',
            fullscreenElement: 'msFullscreenElement',
            fullscreenEnabled: 'msFullscreenEnabled',
            fullscreenchange: 'MSFullscreenChange'
        };
    }

    if (fullscreenApi) {
        document.addEventListener(fullscreenApi.fullscreenchange, onFullscreenChange);
    }
}

function onFullscreenChange() {
    isFullscreen = !!document[fullscreenApi.fullscreenElement];
    updateFullscreenButton();
    
    if (isFullscreen) {
        playerContainer.classList.add('fullscreen-mode');
        if (window.screen && screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(e => console.error("Couldn't lock orientation", e));
        }
        scheduleHideControls();
    } else {
        playerContainer.classList.remove('fullscreen-mode');
        playerContainer.classList.remove('force-fullscreen');
        document.body.classList.remove('hide-ui');
        clearTimeout(hideControlsTimeout);
        if (window.screen && screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
        }
    }
}

function updateFullscreenButton() {
    if (isFullscreen) {
        fullscreenButton.innerHTML = '<i class="fas fa-compress"></i><span class="tooltiptext">إلغاء ملء الشاشة (F)</span>';
    } else {
        fullscreenButton.innerHTML = '<i class="fas fa-expand"></i><span class="tooltiptext">ملء الشاشة (F)</span>';
    }
}

function scheduleHideControls() {
    clearTimeout(hideControlsTimeout);
    if (isFullscreen && isPlaying) {
        hideControlsTimeout = setTimeout(() => {
            document.body.classList.add('hide-ui');
        }, 3000);
    }
}

function setupAutoHideControls() {
    document.addEventListener('mousemove', () => {
        lastActiveTime = Date.now();
        if (customControls.style.opacity === '0') {
            customControls.style.opacity = '1';
        }
        if (isFullscreen) {
            document.body.classList.remove('hide-ui');
            scheduleHideControls();
        }
    });
    
    setInterval(() => {
        if (Date.now() - lastActiveTime > 3000 && !playerContainer.matches(':hover') && isPlaying) {
            customControls.style.opacity = '0';
        }
    }, 1000);
}

function initializePlayer(videoId) {
    player = new YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'disablekb': 1,
            'enablejsapi': 1,
            'modestbranding': 1,
            'rel': 0,
            'showinfo': 0,
            'fs': 0,
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady(event) {
    playerReady = true;
    loader.style.display = 'none';
    player.setVolume(currentVolume);
    
    function updatePlayerInfo() {
        if (playerReady && !isUserSeeking) {
            updateProgressBar();
            updateTimeDisplay();
        }
        requestAnimationFrame(updatePlayerInfo);
    }
    requestAnimationFrame(updatePlayerInfo);
}

function onPlayerStateChange(event) {
    if (event.data === 0) {
        playNextVideo();
    } else if (event.data === 1) {
        isPlaying = true;
        playPauseButton.innerHTML = '<i class="fas fa-pause"></i><span class="tooltiptext">إيقاف (Space)</span>';
        loader.style.display = 'none';
        if (isFullscreen) {
            scheduleHideControls();
        }
    } else if (event.data === 2) {
        isPlaying = false;
        playPauseButton.innerHTML = '<i class="fas fa-play"></i><span class="tooltiptext">تشغيل (Space)</span>';
        clearTimeout(hideControlsTimeout);
        document.body.classList.remove('hide-ui');
    } else if (event.data === 3) {
        loader.style.display = 'block';
    }
}

function onPlayerError(event) {
    showNotification('حدث خطأ أثناء تشغيل الفيديو. الرجاء التحقق من الرابط.');
    loader.style.display = 'none';
    setTimeout(() => {
        playNextVideo();
    }, 2000);
}

function togglePlayPause() {
    if (!playerReady) return;
    
    if (isPlaying) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

function playNextVideo() {
    if (playlist.length === 0) return;
    
    let nextIndex = (currentVideo + 1) % playlist.length;
    loadVideo(nextIndex);
}

function playPrevVideo() {
    if (playlist.length === 0) return;
    
    if (playerReady && player.getCurrentTime() > 3) {
        player.seekTo(0, true);
        return;
    }
    
    let prevIndex = (currentVideo - 1 + playlist.length) % playlist.length;
    loadVideo(prevIndex);
}

function loadVideo(index) {
    if (!playerReady || index < 0 || index >= playlist.length) return;
    
    loader.style.display = 'block';
    currentVideo = index;
    
    playerContainer.classList.add('fade-out');
    
    setTimeout(() => {
        player.loadVideoById(playlist[index].videoId);
        player.setPlaybackRate(currentPlaybackRate);
        
        renderEpisodesList();
        
        setTimeout(() => {
            playerContainer.classList.remove('fade-out');
            playerContainer.classList.add('fade-in');
            
            setTimeout(() => {
                playerContainer.classList.remove('fade-in');
            }, 500);
        }, 500);
    }, 500);
}

function seekVideo(percent) {
    if (!playerReady) return;
    
    const duration = player.getDuration();
    if (duration && !isNaN(duration) && duration !== Infinity) {
        const seekToTime = duration * (percent / 100);
        player.seekTo(seekToTime, true);
    }
}

function updateProgressBar() {
    if (!playerReady) return;
    
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    if (duration && !isNaN(duration) && duration !== Infinity && currentTime !== undefined) {
        const percent = (currentTime / duration) * 100;
        progressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    }
}

function updateTimeDisplay() {
    if (!playerReady) return;
    
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    
    timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity || seconds === undefined) return "0:00";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    } else {
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
}

function toggleMute() {
    if (!playerReady) return;
    
    if (isMuted) {
        player.unMute();
        player.setVolume(currentVolume);
        volumeLevel.style.width = `${currentVolume}%`;
        muteButton.innerHTML = '<i class="fas fa-volume-up"></i><span class="tooltiptext">كتم الصوت (M)</span>';
    } else {
        player.mute();
        volumeLevel.style.width = '0%';
        muteButton.innerHTML = '<i class="fas fa-volume-mute"></i><span class="tooltiptext">إلغاء كتم الصوت (M)</span>';
    }
    
    isMuted = !isMuted;
}

function setVolume(percent) {
    if (!playerReady) return;
    
    currentVolume = Math.max(0, Math.min(100, percent));
    player.setVolume(currentVolume);
    volumeLevel.style.width = `${currentVolume}%`;
    
    if (currentVolume === 0) {
        muteButton.innerHTML = '<i class="fas fa-volume-mute"></i><span class="tooltiptext">إلغاء كتم الصوت (M)</span>';
        isMuted = true;
    } else {
        muteButton.innerHTML = '<i class="fas fa-volume-up"></i><span class="tooltiptext">كتم الصوت (M)</span>';
        isMuted = false;
        player.unMute();
    }
}

function toggleFullscreen() {
    if (isFullscreen) {
        exitFullscreen();
    } else {
        enterFullscreen();
    }
}

function enterFullscreen() {
    if (fullscreenApi && document[fullscreenApi.fullscreenEnabled]) {
        playerContainer[fullscreenApi.requestFullscreen]();
    } else {
        playerContainer.classList.add('force-fullscreen');
        document.body.style.overflow = 'hidden';
        isFullscreen = true;
        updateFullscreenButton();
        scheduleHideControls();
        
        document.addEventListener('keydown', exitFullscreenOnEsc);
    }
}

function exitFullscreen() {
    if (fullscreenApi && document[fullscreenApi.fullscreenElement]) {
        document[fullscreenApi.exitFullscreen]();
    } else {
        playerContainer.classList.remove('force-fullscreen');
        document.body.style.overflow = '';
        isFullscreen = false;
        updateFullscreenButton();
        document.body.classList.remove('hide-ui');
        clearTimeout(hideControlsTimeout);
        
        document.removeEventListener('keydown', exitFullscreenOnEsc);
    }
}

function exitFullscreenOnEsc(e) {
    if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
    }
}

function changePlaybackRate() {
    if (!playerReady) return;
    
    currentPlaybackRateIndex = (currentPlaybackRateIndex + 1) % playbackRates.length;
    currentPlaybackRate = playbackRates[currentPlaybackRateIndex];
    player.setPlaybackRate(currentPlaybackRate);
    
    playbackSpeedButton.innerHTML = `<i class="fas fa-tachometer-alt"></i><span class="tooltiptext">سرعة التشغيل: ${currentPlaybackRate}x (S)</span>`;
    showNotification(`سرعة التشغيل: ${currentPlaybackRate}x`);
}

function castToTV() {
    if (!playerReady || playlist.length === 0) return;
    
    const videoId = playlist[currentVideo].videoId;
    
    if (navigator.userAgent.indexOf('Android') !== -1 || navigator.userAgent.indexOf('iPhone') !== -1) {
        const currentTime = Math.floor(player.getCurrentTime());
        window.open(`https://www.youtube.com/watch?v=${videoId}&t=${currentTime}s`, '_blank');
        showNotification('تم فتح التطبيق للعرض على التلفاز');
    } else {
        window.open('https://www.youtube.com/tv/pair', '_blank');
        showNotification('يرجى إدخال الرمز المعروض على شاشة التلفاز');
    }
}

function toggleTheme() {
    isLightTheme = !isLightTheme;
    
    if (isLightTheme) {
        document.body.classList.add('light-theme');
        themeToggleButton.innerHTML = '<i class="fas fa-sun"></i><span class="tooltiptext">المظهر الداكن</span>';
    } else {
        document.body.classList.remove('light-theme');
        themeToggleButton.innerHTML = '<i class="fas fa-moon"></i><span class="tooltiptext">المظهر الفاتح</span>';
    }
    
    localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        isLightTheme = true;
        document.body.classList.add('light-theme');
        themeToggleButton.innerHTML = '<i class="fas fa-sun"></i><span class="tooltiptext">المظهر الداكن</span>';
    }
}

function addVideoToPlaylist(videoUrl, name, order) {
    let videoId = extractYoutubeId(videoUrl);
    
    if (!videoId) {
        showNotification('رابط الفيديو غير صالح');
        return false;
    }
    
    playlist.push({
        videoId: videoId,
        name: name || `فيديو ${playlist.length + 1}`,
        order: parseInt(order) || playlist.length + 1
    });
    
    playlist.sort((a, b) => a.order - b.order);
    
    if (playlist.length === 1 && !playerReady) {
        initializePlayer(videoId);
    }
    
    savePlaylistToStorage();
    renderEpisodesList();
    return true;
}

function extractYoutubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
        return match[2];
    }
    
    return null;
}

function clearPlaylist() {
    if (confirm('هل أنت متأكد من رغبتك في مسح قائمة التشغيل بالكامل؟')) {
        playlist = [];
        savePlaylistToStorage();
        if (playerReady) {
            player.stopVideo();
            isPlaying = false;
            playPauseButton.innerHTML = '<i class="fas fa-play"></i><span class="tooltiptext">تشغيل (Space)</span>';
        }
        renderEpisodesList();
        showNotification('تم مسح قائمة التشغيل');
    }
}

function removeEpisode(index) {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذه الحلقة؟')) {
        const isCurrentVideo = index === currentVideo;
        
        playlist.splice(index, 1);
        savePlaylistToStorage();
        
        if (isCurrentVideo) {
            if (playlist.length > 0) {
                currentVideo = Math.min(index, playlist.length - 1);
                loadVideo(currentVideo);
            } else {
                if (playerReady) {
                    player.stopVideo();
                    isPlaying = false;
                    playPauseButton.innerHTML = '<i class="fas fa-play"></i><span class="tooltiptext">تشغيل (Space)</span>';
                }
            }
        } else {
            if (index < currentVideo) {
                currentVideo--;
            }
        }
        
        renderEpisodesList();
        showNotification('تم حذف الحلقة بنجاح');
    }
}

function exportPlaylist() {
    try {
        const dataStr = JSON.stringify(playlist, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `playlist_${new Date().getTime()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('تم تصدير قائمة التشغيل بنجاح');
    } catch (e) {
        console.error('Export error:', e);
        showNotification('حدث خطأ أثناء التصدير');
    }
}

function importPlaylist(jsonData) {
    try {
        const importedPlaylist = JSON.parse(jsonData);
        
        if (Array.isArray(importedPlaylist) && importedPlaylist.length > 0) {
            const validPlaylist = importedPlaylist.filter(item => 
                item.videoId && typeof item.videoId === 'string' && item.videoId.length === 11
            );
            
            if (validPlaylist.length > 0) {
                playlist = validPlaylist;
                savePlaylistToStorage();
                
                if (!playerReady && playlist.length > 0) {
                    initializePlayer(playlist[0].videoId);
                }
                
                renderEpisodesList();
                showNotification(`تم استيراد ${validPlaylist.length} حلقة بنجاح`);
                
                document.getElementById('import-playlist').value = '';
                return true;
            } else {
                throw new Error('لا توجد حلقات صالحة في البيانات المستوردة');
            }
        } else {
            throw new Error('تنسيق البيانات غير صحيح');
        }
    } catch (e) {
        console.error('Import error:', e);
        showNotification('حدث خطأ أثناء الاستيراد: ' + e.message);
        return false;
    }
}

function savePlaylistToStorage() {
    localStorage.setItem('tvShowPlaylist', JSON.stringify(playlist));
}

function loadPlaylistFromStorage() {
    try {
        const savedPlaylist = localStorage.getItem('tvShowPlaylist');
        if (savedPlaylist) {
            playlist = JSON.parse(savedPlaylist);
            if (!Array.isArray(playlist)) {
                playlist = [];
            }
        }
    } catch (e) {
        console.error('Error loading playlist:', e);
        playlist = [];
    }
}

function renderEpisodesList() {
    const container = document.getElementById('episodes-container');
    
    if (playlist.length === 0) {
        container.innerHTML = '<div class="no-episodes">لا توجد حلقات في قائمة التشغيل</div>';
        return;
    }
    
    const episodesHTML = playlist.map((episode, index) => `
        <div class="episode-item ${index === currentVideo ? 'active' : ''}" 
             onclick="loadVideo(${index})">
            <div class="episode-info">
                <div class="episode-name">${episode.name}</div>
                <div class="episode-order">الحلقة رقم ${episode.order}</div>
            </div>
            <div class="episode-actions">
                <button class="episode-btn" onclick="event.stopPropagation(); removeEpisode(${index})" 
                        title="حذف الحلقة">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = episodesHTML;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function showMessage(text, type = 'info') {
    const msgDiv = document.getElementById('msg');
    if (msgDiv) {
        msgDiv.textContent = text;
        msgDiv.className = type === 'success' ? 'text-green-500 mb-4' : 'text-red-500 mb-4';
        msgDiv.style.display = 'block';
        
        setTimeout(() => {
            msgDiv.style.display = 'none';
        }, 5000);
    }
}

// ═══════════════════════════════════════════════════════════════
// 🎮 EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM Ready');
    
    // Player controls
    if (playPauseButton) playPauseButton.addEventListener('click', togglePlayPause);
    if (prevVideoButton) prevVideoButton.addEventListener('click', playPrevVideo);
    if (nextVideoButton) nextVideoButton.addEventListener('click', playNextVideo);
    if (rewindButton) rewindButton.addEventListener('click', () => {
        if (playerReady) {
            const currentTime = player.getCurrentTime();
            player.seekTo(Math.max(0, currentTime - 10), true);
        }
    });
    if (forwardButton) forwardButton.addEventListener('click', () => {
        if (playerReady) {
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            player.seekTo(Math.min(duration, currentTime + 10), true);
        }
    });
    if (muteButton) muteButton.addEventListener('click', toggleMute);
    if (fullscreenButton) fullscreenButton.addEventListener('click', toggleFullscreen);
    if (playbackSpeedButton) playbackSpeedButton.addEventListener('click', changePlaybackRate);
    if (themeToggleButton) themeToggleButton.addEventListener('click', toggleTheme);
    if (tvButton) tvButton.addEventListener('click', castToTV);

    // Progress bar
    if (progressContainer) {
        progressContainer.addEventListener('click', (e) => {
            if (!playerReady) return;
            
            const rect = progressContainer.getBoundingClientRect();
            const percent = ((e.clientX - rect.left) / rect.width) * 100;
            seekVideo(percent);
        });

        progressContainer.addEventListener('mousemove', (e) => {
            if (!playerReady) return;
            
            const rect = progressContainer.getBoundingClientRect();
            const percent = ((e.clientX - rect.left) / rect.width) * 100;
            const duration = player.getDuration();
            
            if (duration && !isNaN(duration) && duration !== Infinity) {
                const hoverTime = (duration * percent) / 100;
                progressHoverTime.textContent = formatTime(hoverTime);
                progressHoverTime.style.left = `${Math.max(0, Math.min(100, percent))}%`;
                progressHoverTime.style.display = 'block';
            }
        });

        progressContainer.addEventListener('mouseleave', () => {
            progressHoverTime.style.display = 'none';
        });
    }

    // Volume control
    if (volumeSlider) {
        volumeSlider.addEventListener('click', (e) => {
            if (!playerReady) return;
            
            const rect = volumeSlider.getBoundingClientRect();
            const percent = ((e.clientX - rect.left) / rect.width) * 100;
            setVolume(percent);
        });
    }

    // Playlist management
    const addEpisodeBtn = document.getElementById('add-episode');
    if (addEpisodeBtn) {
        addEpisodeBtn.addEventListener('click', () => {
            const videoUrl = document.getElementById('video-url').value.trim();
            const episodeName = document.getElementById('episode-name').value.trim();
            const episodeOrder = document.getElementById('episode-order').value.trim();
            
            if (!videoUrl) {
                showNotification('الرجاء إدخال رابط الفيديو');
                return;
            }
            
            if (addVideoToPlaylist(videoUrl, episodeName, episodeOrder)) {
                document.getElementById('video-url').value = '';
                document.getElementById('episode-name').value = '';
                document.getElementById('episode-order').value = '';
                showNotification('تم إضافة الحلقة بنجاح');
            }
        });
    }

    const clearPlaylistBtn = document.getElementById('clear-playlist');
    if (clearPlaylistBtn) {
        clearPlaylistBtn.addEventListener('click', clearPlaylist);
    }

    const exportPlaylistBtn = document.getElementById('export-playlist');
    if (exportPlaylistBtn) {
        exportPlaylistBtn.addEventListener('click', exportPlaylist);
    }

    const importBtn = document.getElementById('import-button');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            const jsonData = document.getElementById('import-playlist').value.trim();
            if (!jsonData) {
                showNotification('الرجاء إدخال بيانات للاستيراد');
                return;
            }
            importPlaylist(jsonData);
        });
    }

    // Toggle playlist form
    const toggleFormBtn = document.getElementById('toggle-playlist-form');
    const formContainer = document.getElementById('playlist-form-container');
    if (toggleFormBtn && formContainer) {
        toggleFormBtn.addEventListener('click', () => {
            const isCollapsed = formContainer.classList.contains('panel-collapsed');
            
            if (isCollapsed) {
                formContainer.classList.remove('panel-collapsed');
                toggleFormBtn.innerHTML = '<i class="fas fa-chevron-up"></i> إخفاء النموذج';
            } else {
                formContainer.classList.add('panel-collapsed');
                toggleFormBtn.innerHTML = '<i class="fas fa-chevron-down"></i> عرض النموذج';
            }
        });
    }

    // ✅ نموذج التعليقات - محسّن ومُصحح
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('name');
            const textInput = document.getElementById('text');
            const submitBtn = document.getElementById('submit-comment-btn');
            
            if (!nameInput || !textInput || !submitBtn) {
                console.error('❌ Comment form elements missing');
                return;
            }
            
            const name = nameInput.value.trim();
            const text = textInput.value.trim();
            
            // التحقق من المدخلات
            if (!name || name.length < 2) {
                showMessage('الاسم يجب أن يكون حرفين على الأقل', 'error');
                nameInput.focus();
                return;
            }
            
            if (!text || text.length < 3) {
                showMessage('التعليق يجب أن يكون 3 أحرف على الأقل', 'error');
                textInput.focus();
                return;
            }
            
            // تعطيل الزر والحقول
            submitBtn.disabled = true;
            nameInput.disabled = true;
            textInput.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جارٍ الإرسال...';
            
            try {
                const result = await submitComment(name, text);
                
                if (result.success) {
                    showMessage(result.message, 'success');
                    commentForm.reset();
                    
                    // ✅ تحديث فوري بعد 2 ثانية
                    setTimeout(() => {
                        console.log('🔄 Reloading comments after submission...');
                        loadCommentsFromAPI();
                    }, 2000);
                    
                    // ✅ تحديث إضافي بعد 5 ثواني
                    setTimeout(() => {
                        loadCommentsFromAPI();
                    }, 5000);
                } else {
                    showMessage(result.message, 'error');
                }
            } catch (error) {
                console.error('❌ Submit error:', error);
                showMessage('حدث خطأ غير متوقع. حاول مجدداً.', 'error');
            } finally {
                // إعادة تفعيل الزر والحقول
                submitBtn.disabled = false;
                nameInput.disabled = false;
                textInput.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال التعليق';
            }
        });
    }
    
    // ✅ زر التحديث اليدوي
    const refreshBtn = document.getElementById('refresh-comments-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshComments);
    }
});

// ═══════════════════════════════════════════════════════════════
// ⌨️ KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════════════════

document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.code) {
        case 'Space':
            e.preventDefault();
            togglePlayPause();
            break;
        case 'KeyF':
            e.preventDefault();
            toggleFullscreen();
            break;
        case 'KeyM':
            e.preventDefault();
            toggleMute();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            if (playerReady) {
                const currentTime = player.getCurrentTime();
                player.seekTo(Math.max(0, currentTime - 10), true);
            }
            break;
        case 'ArrowRight':
            e.preventDefault();
            if (playerReady) {
                const currentTime = player.getCurrentTime();
                const duration = player.getDuration();
                player.seekTo(Math.min(duration, currentTime + 10), true);
            }
            break;
        case 'KeyN':
            e.preventDefault();
            playNextVideo();
            break;
        case 'KeyP':
            e.preventDefault();
            playPrevVideo();
            break;
        case 'KeyS':
            e.preventDefault();
            changePlaybackRate();
            break;
        case 'Escape':
            if (isFullscreen) {
                exitFullscreen();
            }
            break;
    }
});

// ═══════════════════════════════════════════════════════════════
// 📱 TOUCH EVENTS FOR MOBILE
// ═══════════════════════════════════════════════════════════════

let touchStartX = 0;
let touchStartY = 0;

if (playerOverlay) {
    playerOverlay.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    playerOverlay.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
                // Swipe right - previous video
                playPrevVideo();
            } else {
                // Swipe left - next video
                playNextVideo();
            }
        } else if (Math.abs(deltaY) > 50) {
            if (deltaY > 0) {
                // Swipe down - decrease volume
                setVolume(currentVolume - 10);
            } else {
                // Swipe up - increase volume
                setVolume(currentVolume + 10);
            }
        }
    });

    // Double tap to play/pause
    let lastTap = 0;
    playerOverlay.addEventListener('touchend', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 500 && tapLength > 0) {
            togglePlayPause();
            e.preventDefault();
        }
        
        lastTap = currentTime;
    });
}

// ═══════════════════════════════════════════════════════════════
// 🔧 UTILITY FUNCTIONS - ENHANCED
// ═══════════════════════════════════════════════════════════════

/**
 * ✅ تحديث أداء الصفحة - محسّن
 */
function optimizePerformance() {
    // تحسين الذاكرة
    if (window.gc && typeof window.gc === 'function') {
        window.gc();
    }
    
    // تنظيف event listeners غير المستخدمة
    const unusedElements = document.querySelectorAll('.removed-element');
    unusedElements.forEach(el => el.remove());
}

/**
 * ✅ مراقبة حالة الاتصال
 */
function monitorConnection() {
    window.addEventListener('online', () => {
        showNotification('✅ تم استعادة الاتصال بالإنترنت', 'success');
        loadCommentsFromAPI(); // إعادة تحميل التعليقات
    });
    
    window.addEventListener('offline', () => {
        showNotification('⚠️ انقطع الاتصال بالإنترنت', 'warning');
        stopCommentsAutoRefresh(); // إيقاف التحديث التلقائي
    });
}

/**
 * ✅ حفظ حالة المشغل
 */
function savePlayerState() {
    if (playerReady && playlist.length > 0) {
        const state = {
            currentVideo: currentVideo,
            currentTime: player.getCurrentTime(),
            volume: currentVolume,
            playbackRate: currentPlaybackRate,
            timestamp: Date.now()
        };
        
        localStorage.setItem('playerState', JSON.stringify(state));
    }
}

/**
 * ✅ استعادة حالة المشغل
 */
function restorePlayerState() {
    try {
        const savedState = localStorage.getItem('playerState');
        if (savedState && playerReady) {
            const state = JSON.parse(savedState);
            
            // التحقق من أن الحالة حديثة (أقل من ساعة)
            if (Date.now() - state.timestamp < 3600000) {
                if (state.currentVideo !== undefined && state.currentVideo < playlist.length) {
                    currentVideo = state.currentVideo;
                }
                
                if (state.currentTime && state.currentTime > 0) {
                    player.seekTo(state.currentTime, true);
                }
                
                if (state.volume !== undefined) {
                    setVolume(state.volume);
                }
                
                if (state.playbackRate !== undefined) {
                    const rateIndex = playbackRates.indexOf(state.playbackRate);
                    if (rateIndex !== -1) {
                        currentPlaybackRateIndex = rateIndex;
                        currentPlaybackRate = state.playbackRate;
                        player.setPlaybackRate(currentPlaybackRate);
                    }
                }
                
                showNotification('✅ تم استعادة حالة المشغل السابقة', 'success');
            }
        }
    } catch (error) {
        console.error('Error restoring player state:', error);
    }
}

/**
 * ✅ تنظيف البيانات المؤقتة
 */
function cleanupTemporaryData() {
    // تنظيف البيانات القديمة من localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('temp_') || key.includes('cache_')) {
            const item = localStorage.getItem(key);
            try {
                const data = JSON.parse(item);
                if (data.timestamp && Date.now() - data.timestamp > 86400000) { // 24 ساعة
                    localStorage.removeItem(key);
                }
            } catch (e) {
                // البيانات تالفة، احذفها
                localStorage.removeItem(key);
            }
        }
    });
}

/**
 * ✅ معالج أخطاء شامل
 */
window.addEventListener('error', (event) => {
    console.error('❌ Global Error:', event.error);
    
    // تسجيل الخطأ
    const errorInfo = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    // حفظ تقرير الخطأ محلياً
    const errorReports = JSON.parse(localStorage.getItem('errorReports') || '[]');
    errorReports.push(errorInfo);
    
    // الاحتفاظ بآخر 10 أخطاء فقط
    if (errorReports.length > 10) {
        errorReports.shift();
    }
    
    localStorage.setItem('errorReports', JSON.stringify(errorReports));
    
    // إشعار للمستخدم في الأخطاء الحرجة
    if (event.message.includes('YouTube') || event.message.includes('player')) {
        showNotification('حدث خطأ في المشغل. جارٍ المحاولة مجدداً...', 'warning');
        
        // محاولة إعادة تحميل المشغل بعد 3 ثوانِ
        setTimeout(() => {
            if (playlist.length > 0) {
                loadVideo(currentVideo);
            }
        }, 3000);
    }
});

/**
 * ✅ مراقب أداء الصفحة
 */
function monitorPerformance() {
    // مراقبة استخدام الذاكرة
    if ('memory' in performance) {
        setInterval(() => {
            const memInfo = performance.memory;
            const usedMB = Math.round(memInfo.usedJSHeapSize / 1048576);
            const limitMB = Math.round(memInfo.jsHeapSizeLimit / 1048576);
            
            console.log(`💾 Memory Usage: ${usedMB}MB / ${limitMB}MB`);
            
            // تحذير عند ارتفاع استخدام الذاكرة
            if (usedMB > limitMB * 0.8) {
                console.warn('⚠️ High memory usage detected');
                optimizePerformance();
            }
        }, 30000); // كل 30 ثانية
    }
    
    // مراقبة سرعة الشبكة
    if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
            console.log(`🌐 Network: ${connection.effectiveType}, Speed: ${connection.downlink}Mbps`);
            
            connection.addEventListener('change', () => {
                console.log(`🔄 Network changed: ${connection.effectiveType}`);
                
                // تقليل جودة الفيديو في الاتصالات البطيئة
                if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                    if (playerReady) {
                        player.setPlaybackQuality('small');
                        showNotification('تم تقليل جودة الفيديو بسبب بطء الاتصال', 'info');
                    }
                }
            });
        }
    }
}

/**
 * ✅ نظام نسخ احتياطي للبيانات
 */
function createBackup() {
    const backupData = {
        playlist: playlist,
        settings: {
            theme: isLightTheme ? 'light' : 'dark',
            volume: currentVolume,
            playbackRate: currentPlaybackRate
        },
        timestamp: Date.now(),
        version: '2.0.0'
    };
    
    localStorage.setItem('tvshow_backup', JSON.stringify(backupData));
    console.log('✅ Backup created successfully');
}

function restoreFromBackup() {
    try {
        const backupData = JSON.parse(localStorage.getItem('tvshow_backup'));
        
        if (backupData && backupData.playlist) {
            if (confirm('هل تريد استعادة النسخة الاحتياطية؟ سيتم استبدال البيانات الحالية.')) {
                playlist = backupData.playlist;
                savePlaylistToStorage();
                
                if (backupData.settings) {
                    if (backupData.settings.theme === 'light' && !isLightTheme) {
                        toggleTheme();
                    }
                    if (backupData.settings.volume !== undefined) {
                        setVolume(backupData.settings.volume);
                    }
                }
                
                renderEpisodesList();
                showNotification('✅ تم استعادة النسخة الاحتياطية بنجاح', 'success');
                
                if (playlist.length > 0 && !playerReady) {
                    initializePlayer(playlist[0].videoId);
                }
                
                return true;
            }
        }
    } catch (error) {
        console.error('❌ Backup restore error:', error);
        showNotification('فشل في استعادة النسخة الاحتياطية', 'error');
    }
    
    return false;
}

// ═══════════════════════════════════════════════════════════════
// 🚀 ADVANCED INITIALIZATION - ENHANCED
// ═══════════════════════════════════════════════════════════════

/**
 * ✅ تهيئة متقدمة للتطبيق
 */
function initializeAdvancedFeatures() {
    console.log('🚀 Initializing advanced features...');
    
    // تنظيف البيانات القديمة
    cleanupTemporaryData();
    
    // مراقبة الاتصال
    monitorConnection();
    
    // مراقبة الأداء
    monitorPerformance();
    
    // حفظ حالة المشغل كل دقيقة
    setInterval(savePlayerState, 60000);
    
    // إنشاء نسخة احتياطية كل 5 دقائق
    setInterval(createBackup, 300000);
    
    // تحسين الأداء كل 10 دقائق
    setInterval(optimizePerformance, 600000);
    
    // إضافة زر الاستعادة إذا كانت هناك نسخة احتياطية
    if (localStorage.getItem('tvshow_backup')) {
        addRestoreButton();
    }
    
    console.log('✅ Advanced features initialized');
}

/**
 * ✅ إضافة زر الاستعادة
 */
function addRestoreButton() {
    const controlsContainer = document.querySelector('.controls-section');
    if (controlsContainer && !document.getElementById('restore-backup-btn')) {
        const restoreBtn = document.createElement('button');
        restoreBtn.id = 'restore-backup-btn';
        restoreBtn.className = 'restore-btn';
        restoreBtn.innerHTML = '<i class="fas fa-undo"></i> استعادة نسخة احتياطية';
        restoreBtn.onclick = restoreFromBackup;
        
        controlsContainer.appendChild(restoreBtn);
    }
}

// ═══════════════════════════════════════════════════════════════
// 🎯 FINAL INITIALIZATION
// ═══════════════════════════════════════════════════════════════

// تحميل YouTube API
if (!window.YT) {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// تهيئة المميزات المتقدمة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    initializeAdvancedFeatures();
    
    // استعادة حالة المشغل السابقة بعد 3 ثواني من التهيئة
    setTimeout(() => {
        if (playerReady) {
            restorePlayerState();
        }
    }, 3000);
});

// حفظ حالة المشغل قبل إغلاق الصفحة
window.addEventListener('beforeunload', () => {
    savePlayerState();
    createBackup();
});

// ═══════════════════════════════════════════════════════════════
// 🎬 END OF SCRIPT
// ═══════════════════════════════════════════════════════════════

console.log('🎬 TV Show Player Script Loaded Successfully! 🚀');
console.log('📱 Features: YouTube Player, Comments System, Playlist Management');
console.log('⚡ Version: 2.0.0 Enhanced');
console.log('🔧 Optimizations: Memory Management, Auto-refresh, Error Handling');

// ═══════════════════════════════════════════════════════════════
// 📊 PERFORMANCE METRICS
// ═══════════════════════════════════════════════════════════════

window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
            
            console.log(`⚡ Performance Metrics:`);
            console.log(`   📊 Page Load Time: ${loadTime}ms`);
            console.log(`   🎯 DOM Ready Time: ${domReady}ms`);
            console.log(`   💾 Memory Usage: ${performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB' : 'N/A'}`);
            
            // إرسال تقرير الأداء إذا كان بطيئاً
            if (loadTime > 5000) {
                console.warn('⚠️ Slow page load detected');
            }
        }
    }, 1000);
});

// ═══════════════════════════════════════════════════════════════
// 🔚 SCRIPT END
// ═══════════════════════════════════════════════════════════════
