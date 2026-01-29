/**
 * AbeTube - נגן יוטיוב
 * קובץ JavaScript ראשי
 */

// הגדרות קבועות
const API_KEY = window.YOUTUBE_API_KEY || "";
const YT_EMBED_URL = "https://www.youtube-nocookie.com/embed/";
const YT_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const YT_VIDEO_URL = "https://www.googleapis.com/youtube/v3/videos";

// משתנים גלובליים
let playlist = [];
let currentIndex = 0;
let ytPlayer = null;

// ===== פונקציות עזר לבדיקת API =====

/**
 * בדיקת תקינות מפתח API
 */
function validateApiKey() {
  if (!API_KEY || API_KEY === "" || API_KEY === "xxxx") {
    return {
      valid: false,
      message: "❌ מפתח API חסר",
      details: "אנא צור קובץ js/config.js עם המפתח שלך"
    };
  }
  
  if (API_KEY.length < 30) {
    return {
      valid: false,
      message: "❌ מפתח API לא תקין",
      details: "מפתח API צריך להיות ארוך יותר"
    };
  }
  
  if (API_KEY.startsWith("AIza")) {
    return {
      valid: true,
      message: "✅ מפתח API תקין",
      details: `מפתח באורך ${API_KEY.length} תווים`
    };
  }
  
  return {
    valid: false,
    message: "❌ פורמט מפתח API לא תקין",
    details: "מפתח API אמור להתחיל ב-AIza"
  };
}

// ===== פונקציות אתחול =====

/**
 * אתחול האפליקציה
 */
function initApp() {
  console.log("AlemTube מתחיל...");
  
  // בדיקת מפתח API
  const apiCheck = validateApiKey();
  console.log("בדיקת API:", apiCheck);
  
  if (!apiCheck.valid) {
    console.error("❌ מפתח API לא תקין:", apiCheck.message);
    showAlert(`❌ ${apiCheck.message}: ${apiCheck.details}`, "error");
    
    // השבתת פונקציונליות
    document.getElementById("searchBtn").disabled = true;
    document.getElementById("searchInput").placeholder = apiCheck.message;
    document.getElementById("searchInput").disabled = true;
    
    // הצגת הוראות
    document.getElementById("player-container").innerHTML = `
      <div style="text-align: center; padding: 40px; background: #f8d7da; border-radius: 10px; color: #721c24;">
        <h3>❌ מפתח API חסר</h3>
        <p>להפעלת האפליקציה, אנא:</p>
        <ol style="text-align: right; direction: rtl; margin: 20px;">
          <li>צור קובץ <strong>js/config.js</strong></li>
          <li>הוסף את התוכן הבא:</li>
          <pre style="background: #fff; padding: 10px; border-radius: 5px; direction: ltr;">
const YOUTUBE_API_KEY = "המפתח_שלך_כאן";
window.YOUTUBE_API_KEY = YOUTUBE_API_KEY;</pre>
          <li>החלף "המפתח_שלך_כאן" במפתח ה-YouTube API שלך</li>
        </ol>
        <p><a href="https://console.cloud.google.com/apis/credentials" target="_blank" style="color: #155724;">➡️ קבל מפתח API כאן</a></p>
      </div>
    `;
    return;
  }
  
  // הגדרת אירועים
  setupEventListeners();
  
  // בדיקת זיקוקים
  setupSplashScreen();
  
  // טעינת מטמון
  loadFromCache();
  
  // הפעלת זיקוקים בעתיד
  setTimeout(() => {
    launchFireworks();
  }, 10000);
}

/**
 * הגדרת מאזיני אירועים
 */
function setupEventListeners() {
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");
  const fullscreenBtn = document.getElementById("fullscreen-btn");
  
  if (searchBtn) {
    searchBtn.addEventListener("click", searchVideos);
  }
  
  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        searchVideos();
      }
    });
  }
  
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", toggleFullScreen);
  }
  
  // מאזין לשינוי גודל מסך
  document.addEventListener("fullscreenchange", updateFullscreenButton);
  document.addEventListener("webkitfullscreenchange", updateFullscreenButton);
  document.addEventListener("mozfullscreenchange", updateFullscreenButton);
  document.addEventListener("MSFullscreenChange", updateFullscreenButton);
}

/**
 * הגדרת מסך התחלה עם זיקוקים
 */
function setupSplashScreen() {
  const splash = document.getElementById("splash");
  if (!splash) return;
  
  // הפעלת זיקוקים
  let count = 0;
  const interval = setInterval(() => {
    launchFireworks(3);
    count++;
    if (count >= 4) clearInterval(interval);
  }, 700);
  
  // הסתרת מסך התחלה
  setTimeout(() => {
    splash.style.display = "none";
  }, 4000);
}

// ===== פונקציות חיפוש ונגינה =====

/**
 * חיפוש סרטונים
 */
async function searchVideos() {
  // בדיקת מפתח API
  const apiCheck = validateApiKey();
  if (!apiCheck.valid) {
    showAlert(`❌ ${apiCheck.message}`, "error");
    return;
  }
  
  const query = document.getElementById("searchInput").value.trim();
  if (!query) {
    showAlert("נא להזין מילת חיפוש או קישור", "error");
    return;
  }
  
  // איפוס נתונים
  playlist = [];
  currentIndex = 0;
  document.getElementById("results").innerHTML = "";
  document.getElementById("player-container").innerHTML = "";
  
  // בדיקה אם הקלט הוא קישור YouTube
  const isURL = query.includes("youtube.com") || query.includes("youtu.be");
  if (isURL) {
    await handleYouTubeURL(query);
    return;
  }
  
  // חיפוש רגיל
  await searchYouTube(query);
}

/**
 * טיפול בקישור YouTube ישיר
 */
async function handleYouTubeURL(url) {
  // בדיקת מפתח API
  if (!API_KEY || API_KEY === "xxxx") {
    showAlert("❌ מפתח API חסר - לא ניתן לחפש", "error");
    return;
  }
  
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  const videoId = match ? match[1] : "";
  
  if (!videoId) {
    showAlert("קישור YouTube לא תקין", "error");
    return;
  }
  
  // בדיקת אפשרות הטבעה
  if (await checkEmbeddable(videoId)) {
    playlist = [{
      videoId: videoId,
      title: "סרטון שהוזן",
      thumb: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    }];
    currentIndex = 0;
    saveToCache();
    playVideo(currentIndex);
    showAlert("סרטון נטען בהצלחה", "success");
  } else {
    showAlert("סרטון זה לא ניתן להטמעה", "error");
  }
}

/**
 * חיפוש ב-YouTube API
 */
async function searchYouTube(query) {
  // בדיקת מפתח API
  if (!API_KEY || API_KEY === "xxxx") {
    showAlert("❌ מפתח API חסר - לא ניתן לחפש", "error");
    return;
  }
  
  showAlert("מחפש סרטונים...", "success");
  
  const url = `${YT_SEARCH_URL}?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}&maxResults=30&relevanceLanguage=he`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    
    const data = await response.json();
    
    // עיבוד התוצאות
    const videoPromises = data.items.map(async (item) => {
      const videoId = item.id.videoId;
      if (await checkEmbeddable(videoId)) {
        return {
          videoId: videoId,
          title: item.snippet.title,
          thumb: item.snippet.thumbnails.medium.url
        };
      }
      return null;
    });
    
    const results = await Promise.all(videoPromises);
    playlist = results.filter(item => item !== null);
    
    if (playlist.length === 0) {
      showAlert("לא נמצאו סרטונים ניתנים לניגון", "error");
      return;
    }
    
    currentIndex = 0;
    saveToCache();
    playVideo(currentIndex);
    showAlert(`נמצאו ${playlist.length} סרטונים`, "success");
    
  } catch (error) {
    console.error("שגיאת חיפוש:", error);
    showAlert("שגיאה בחיפוש סרטונים", "error");
  }
}

/**
 * ניגון סרטון לפי אינדקס
 */
function playVideo(index) {
  if (index < 0 || index >= playlist.length) return;
  
  const video = playlist[index];
  currentIndex = index;
  
  // עדכון נגן
  const playerContainer = document.getElementById("player-container");
  playerContainer.innerHTML = `
    <iframe 
      id="ytplayer" 
      src="${YT_EMBED_URL}${video.videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&controls=1"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen>
    </iframe>
  `;
  
  // גלילה לנגן
  setTimeout(() => {
    playerContainer.scrollIntoView({ behavior: "smooth" });
  }, 500);
  
  // הצגת תוצאות אחרות
  displayOtherVideos();
  
  // שמירה במטמון
  saveToCache();
  
  // התחלת מעקב אחר הסרטון
  setTimeout(setupPlayerEvents, 1000);
}

/**
 * הצגת סרטונים אחרים מהפלייליסט
 */
function displayOtherVideos() {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";
  
  playlist.forEach((video, index) => {
    if (index === currentIndex) return;
    
    const videoItem = document.createElement("div");
    videoItem.className = "video-item";
    videoItem.onclick = () => {
      currentIndex = index;
      playVideo(index);
    };
    
    videoItem.innerHTML = `
      <img src="${video.thumb}" alt="${video.title}" loading="lazy">
      <div class="video-title">${video.title}</div>
    `;
    
    resultsDiv.appendChild(videoItem);
  });
}

// ===== פונקציות YouTube API =====

/**
 * בדיקת אפשרות הטבעה של סרטון
 */
async function checkEmbeddable(videoId) {
  // בדיקת מפתח API
  if (!API_KEY || API_KEY === "xxxx") {
    console.error("מפתח API חסר בבדיקת הטבעה");
    return false;
  }
  
  const url = `${YT_VIDEO_URL}?part=status&id=${videoId}&key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.items?.[0]?.status?.embeddable ?? false;
  } catch (error) {
    console.error("שגיאה בבדיקת הטבעה:", error);
    return false;
  }
}

/**
 * הגדרת אירועי נגן YouTube
 */
function setupPlayerEvents() {
  if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
    setTimeout(setupPlayerEvents, 500);
    return;
  }
  
  if (ytPlayer) {
    ytPlayer.destroy();
  }
  
  ytPlayer = new YT.Player('ytplayer', {
    events: {
      onStateChange: onPlayerStateChange,
      onError: onPlayerError
    }
  });
}

/**
 * טיפול בשינוי מצב הנגן
 */
function onPlayerStateChange(event) {
  // ניגון אוטומטי לסרטון הבא בסיום
  if (event.data === YT.PlayerState.ENDED && currentIndex + 1 < playlist.length) {
    currentIndex++;
    playVideo(currentIndex);
  }
}

/**
 * טיפול בשגיאות נגן
 */
function onPlayerError(error) {
  console.error("שגיאת נגן YouTube:", error);
  showAlert("שגיאה בנגינת הסרטון", "error");
}


// ===== פונקציות עזר =====

/**
 * הצגת הודעה
 */
function showAlert(message, type = "info") {
  // הסרת התראות קודמות
  const existingAlerts = document.querySelectorAll(".alert");
  existingAlerts.forEach(alert => alert.remove());
  
  // יצירת התראה חדשה
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert ${type}`;
  alertDiv.textContent = message;
  
  document.body.appendChild(alertDiv);
  
  // הסרת ההתראה אחרי 3 שניות
  setTimeout(() => {
    alertDiv.style.opacity = "0";
    setTimeout(() => alertDiv.remove(), 300);
  }, 3000);
}

/**
 * הפעלת זיקוקים
 */
function launchFireworks(count = 5) {
  const container = document.querySelector('.fireworks');
  if (!container) return;
  
  for (let i = 0; i < count; i++) {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    
    for (let j = 0; j < 30; j++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      const angle = (Math.PI * 2 * j) / 30;
      const distance = 80 + Math.random() * 50;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      
      particle.style.setProperty('--x', `${dx}px`);
      particle.style.setProperty('--y', `${dy}px`);
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.background = `hsl(${Math.random() * 360}, 100%, 60%)`;
      
      container.appendChild(particle);
      
      setTimeout(() => particle.remove(), 1500);
    }
  }
}

/**
 * הסתרת פרסומות
 */
function hideAds() {
  const adSelectors = [
    '.ad', '.ads', '.advertisement', 
    '[class*="ad-"]', '[id*="ad-"]',
    '.video-ads', '.ytp-ad-module'
  ];
  
  adSelectors.forEach(selector => {
    const ads = document.querySelectorAll(selector);
    ads.forEach(ad => {
      if (ad && ad.style) {
        ad.style.display = 'none';
        ad.style.visibility = 'hidden';
        ad.style.opacity = '0';
        ad.style.height = '0';
        ad.style.width = '0';
        ad.style.overflow = 'hidden';
      }
    });
  });
  
  // ניסיון לדלג על פרסומות
  const skipButtons = document.querySelectorAll('.skip-ad, .skip-button, .ytp-ad-skip-button');
  skipButtons.forEach(btn => {
    if (btn && btn.click) {
      btn.click();
    }
  });
}

// ===== ניהול מטמון =====

/**
 * שמירת נתונים במטמון
 */
function saveToCache() {
  try {
    localStorage.setItem("abe_playlist", JSON.stringify(playlist));
    localStorage.setItem("abe_index", currentIndex.toString());
  } catch (error) {
    console.error("שגיאה בשמירת מטמון:", error);
  }
}

/**
 * טעינת נתונים ממטמון
 */
function loadFromCache() {
  try {
    const savedPlaylist = localStorage.getItem("abe_playlist");
    const savedIndex = localStorage.getItem("abe_index");
    
    if (savedPlaylist && savedIndex !== null) {
      playlist = JSON.parse(savedPlaylist);
      currentIndex = parseInt(savedIndex);
      
      if (playlist.length > 0 && currentIndex >= 0 && currentIndex < playlist.length) {
        playVideo(currentIndex);
      }
    }
  } catch (error) {
    console.error("שגיאה בטעינת מטמון:", error);
  }
}

// ===== אתחול אוטומטי =====

// הפעלת האפליקציה כשהדף נטען
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// הפעלת הסתרת פרסומות כל 2 שניות
setInterval(hideAds, 2000);
