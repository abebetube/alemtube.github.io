/**
 * AlemTube - נגן יוטיוב
 * קובץ JavaScript נפרד
 */

// ===== פונקציות עזר =====

/**
 * מחלץ מזהה סרטון מ-URL של יוטיוב
 * @param {string} url - קישור יוטיוב
 * @returns {string|null} - מזהה הסרטון או null
 */
function extractVideoId(url) {
    // תבניות URL שונות של יוטיוב
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    // אם זה כבר מזהה סרטון ישיר (11 תווים)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
        return url;
    }
    
    return null;
}

/**
 * יוצרת URL הטבעה נכון לפי מזהה סרטון
 * @param {string} videoId - מזהה סרטון
 * @returns {string} - URL הטבעה
 */
function createEmbedUrl(videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
}

// ===== פונקציות נגינה =====

/**
 * מטבעת סרטון יוטיוב בנגן
 * @param {string} videoId - מזהה הסרטון להטבעה
 */
function embedVideo(videoId) {
    const playerContainer = document.getElementById('player');
    
    if (!playerContainer) {
        console.error('לא נמצא נגן');
        return;
    }
    
    // מנקה את הנגן הקודם
    playerContainer.innerHTML = '';
    
    // יוצר iframe חדש
    const iframe = document.createElement('iframe');
    iframe.id = 'youtubePlayer';
    iframe.src = createEmbedUrl(videoId);
    iframe.title = 'נגן יוטיוב';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';
    
    playerContainer.appendChild(iframe);
    
    // מראה את כפתור מסך מלא
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.style.display = 'inline-flex';
    }
    
    // שומר בהיסטוריה (אופציונלי)
    saveToHistory(videoId);
}

/**
 * מפעילה סרטון מקישור שהוזן
 * @param {string} input - קלט מהמשתמש
 */
function playFromInput(input) {
    if (!input.trim()) {
        showMessage('נא להזין קישור יוטיוב', 'error');
        return;
    }
    
    const videoId = extractVideoId(input.trim());
    
    if (videoId) {
        embedVideo(videoId);
        showMessage('מטעים סרטון...', 'success');
    } else {
        showMessage('קישור לא תקין. נא להזין קישור יוטיוב תקין.', 'error');
    }
}

// ===== פונקציות מסך מלא =====

/**
 * עוברת למסך מלא
 */
function goFullscreen() {
    const player = document.getElementById('youtubePlayer');
    
    if (!player) {
        showMessage('אין סרטון נגן', 'error');
        return;
    }
    
    if (player.requestFullscreen) {
        player.requestFullscreen();
    } else if (player.webkitRequestFullscreen) {
        player.webkitRequestFullscreen();
    } else if (player.mozRequestFullScreen) {
        player.mozRequestFullScreen();
    } else if (player.msRequestFullscreen) {
        player.msRequestFullscreen();
    }
}

// ===== פונקציות עזר נוספות =====

/**
 * מציגה הודעת מערכת
 * @param {string} text - טקסט ההודעה
 * @param {string} type - סוג ההודעה ('success' או 'error')
 */
function showMessage(text, type = 'info') {
    // הסר הודעות קודמות
    const existingMsg = document.querySelector('.system-message');
    if (existingMsg) {
        existingMsg.remove();
    }
    
    // צור הודעה חדשה
    const message = document.createElement('div');
    message.className = `system-message ${type}`;
    message.textContent = text;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        message.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
    } else if (type === 'error') {
        message.style.background = 'linear-gradient(45deg, #f44336, #d32f2f)';
    } else {
        message.style.background = 'linear-gradient(45deg, #2196F3, #1976D2)';
    }
    
    document.body.appendChild(message);
    
    // הסר אחרי 3 שניות
    setTimeout(() => {
        message.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

/**
 * שומר סרטון בהיסטוריה (LocalStorage)
 * @param {string} videoId - מזהה הסרטון
 */
function saveToHistory(videoId) {
    try {
        let history = JSON.parse(localStorage.getItem('alemtube_history')) || [];
        history = history.filter(id => id !== videoId); // הסר כפילויות
        history.unshift(videoId); // הוסף להתחלה
        history = history.slice(0, 10); // שמור רק 10 האחרונים
        localStorage.setItem('alemtube_history', JSON.stringify(history));
    } catch (e) {
        console.log('לא ניתן לשמור היסטוריה:', e);
    }
}

// ===== אנימציות CSS =====

/**
 * מוסיפה אנימציות CSS
 */
function addAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(-50%) translateY(-30px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(-50%) translateY(0); opacity: 1; }
            to { transform: translateX(-50%) translateY(-30px); opacity: 0; }
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        .pulse {
            animation: pulse 2s infinite;
        }
    `;
    document.head.appendChild(style);
}

// ===== אתחול האפליקציה =====

/**
 * מאתחלת את כל הפונקציונליות
 */
function setupAlemTube() {
    console.log('AlemTube מתחיל...');
    
    // הוסף אנימציות
    addAnimations();
    
    // מצא אלמנטים
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    if (!searchInput || !searchBtn) {
        console.error('לא נמצאו אלמנטים נחוצים');
        return;
    }
    
    // הגדר אירועי חיפוש
    searchBtn.addEventListener('click', () => {
        playFromInput(searchInput.value);
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            playFromInput(searchInput.value);
        }
    });
    
    // הגדר מסך מלא
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', goFullscreen);
        fullscreenBtn.style.display = 'none'; // הסתר בהתחלה
    }
    
    // בדוק אם יש קישור ב-URL
    checkUrlForVideo();
    
    // פוקוס על תיבת החיפוש
    setTimeout(() => {
        if (searchInput) {
            searchInput.focus();
        }
    }, 500);
    
    console.log('AlemTube מוכן לשימוש!');
}

/**
 * בודקת אם יש קישור סרטון ב-URL
 */
function checkUrlForVideo() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoParam = urlParams.get('v');
    
    if (videoParam) {
        const videoId = extractVideoId(videoParam) || videoParam;
        document.getElementById('searchInput').value = videoParam;
        setTimeout(() => embedVideo(videoId), 100);
    }
}

// ===== הפעלה אוטומטית =====

// הפעל את הכל כשהדף נטען
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAlemTube);
} else {
    setupAlemTube();
}
