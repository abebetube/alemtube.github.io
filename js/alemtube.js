/**
 * AlemTube - גרסה פשוטה בלי YouTube API
 * עובד רק עם קישורים ישירים - לא צריך מפתח API!
 */

// ===== משתנים גלובליים =====
let playlist = [];
let currentIndex = 0;

// ===== אתחול האפליקציה =====
window.addEventListener("load", () => {
  console.log("🎬 AlemTube מתחיל...");
  
  // הסתרת מסך התחלה
  setTimeout(() => {
    const splash = document.getElementById("splash");
    if (splash) {
      splash.style.display = "none";
      console.log("✅ מסך התחלה הוסתר");
    }
  }, 4000);
  
  // טעינת סרטון אחרון
  loadFromCache();
  
  // חיבור אירועים
  setupEventListeners();
});

// ===== חיבור אירועים =====
function setupEventListeners() {
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");
  
  if (searchBtn) {
    searchBtn.addEventListener("click", handleSearch);
    console.log("✅ כפתור חיפוש מחובר");
  }
  
  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    });
    console.log("✅ שדה חיפוש מחובר");
  }
  
  const fullscreenBtn = document.getElementById("fullscreen-btn");
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", toggleFullScreen);
  }
}

// ===== פונקציית חיפוש =====
function handleSearch() {
  const query = document.getElementById("searchInput").value.trim();
  
  if (!query) {
    alert("נא להזין קישור YouTube");
    return;
  }
  
  console.log("🔍 מחפש:", query);
  
  // איפוס נתונים
  playlist = [];
  currentIndex = 0;
  document.getElementById("results").innerHTML = "";
  
  // הודעת טעינה
  document.getElementById("player-container").innerHTML = 
    '<div style="text-align:center;padding:50px;color:#666;">🎬 מטעים סרטון...</div>';
  
  // חילוץ מזהה סרטון
  const videoId = extractVideoId(query);
  
  if (videoId) {
    // הוסף סרטון לפלייליסט
    playlist.push({
      videoId: videoId,
      title: "סרטון YouTube",
      thumb: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    });
    
    currentIndex = 0;
    saveToCache();
    playVideo(currentIndex);
  } else {
    // אם לא מזהה קישור
    showInstructions();
  }
}

// ===== חילוץ מזהה סרטון =====
function extractVideoId(url) {
  console.log("🔧 מנסה לחלץ מזהה מ:", url);
  
  // תבניות קישורים שונות
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      console.log("✅ נמצא מזהה:", match[1]);
      return match[1];
    }
  }
  
  console.log("❌ לא נמצא מזהה");
  return null;
}

// ===== נגינת סרטון =====
function playVideo(index) {
  if (!playlist[index]) return;
  
  const video = playlist[index];
  currentIndex = index;
  
  console.log("▶️ מנגן סרטון:", video.videoId);
  
  // יצירת נגן
  document.getElementById("player-container").innerHTML = `
    <iframe 
      id="ytplayer" 
      src="https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
      title="נגן YouTube">
    </iframe>
  `;
  
  saveToCache();
}

// ===== הצגת הוראות =====
function showInstructions() {
  const html = `
    <div style="text-align:center;padding:40px;color:#555;">
      <h3>❓ איך להשתמש</h3>
      <p>הדבק קישור YouTube באחת מהצורות:</p>
      <div style="background:#f5f5f5;padding:15px;border-radius:10px;margin:20px;text-align:left;">
        <p><strong>📝 דוגמאות:</strong></p>
        <p>1. <code>https://youtube.com/watch?v=dQw4w9WgXcQ</code></p>
        <p>2. <code>https://youtu.be/dQw4w9WgXcQ</code></p>
        <p>3. <code>dQw4w9WgXcQ</code> (רק המזהה)</p>
      </div>
      <p>נסה עם הקישור למעלה 👆</p>
    </div>
  `;
  
  document.getElementById("player-container").innerHTML = html;
}

// ===== מסך מלא =====
function toggleFullScreen() {
  const elem = document.documentElement;
  
  if (!document.fullscreenElement) {
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  }
}

// ===== ניהול מטמון =====
function saveToCache() {
  try {
    localStorage.setItem("alemtube_playlist", JSON.stringify(playlist));
    localStorage.setItem("alemtube_index", currentIndex.toString());
    console.log("💾 שמור במטמון");
  } catch (e) {
    console.error("❌ שגיאה בשמירת מטמון:", e);
  }
}

function loadFromCache() {
  try {
    const savedPlaylist = localStorage.getItem("alemtube_playlist");
    const savedIndex = localStorage.getItem("alemtube_index");
    
    if (savedPlaylist && savedIndex !== null) {
      playlist = JSON.parse(savedPlaylist);
      currentIndex = parseInt(savedIndex);
      
      if (playlist.length > 0 && currentIndex >= 0 && currentIndex < playlist.length) {
        console.log("📂 טען ממטמון");
        playVideo(currentIndex);
      }
    }
  } catch (e) {
    console.error("❌ שגיאה בטעינת מטמון:", e);
  }
}

// ===== זיקוקים =====
function launchFireworks() {
  const container = document.querySelector('.fireworks');
  if (!container) return;
  
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
  
  for (let i = 0; i < 5; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particle.style.cssText = `
      position: absolute;
      width: 6px;
      height: 6px;
      background: ${color};
      border-radius: 50%;
      left: ${x}%;
      top: ${y}%;
      animation: explode 1s ease-out forwards;
    `;
    
    container.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
  }
}

// ===== הסתרת פרסומות =====
setInterval(() => {
  const ads = document.querySelectorAll('.ad, .ads, .advertisement');
  ads.forEach(ad => {
    ad.style.display = 'none';
    ad.style.visibility = 'hidden';
  });
}, 2000);
