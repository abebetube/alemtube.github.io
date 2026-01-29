/**
 * AlemTube - גרסה פשוטה ללא YouTube API
 * עובד רק עם קישורי YouTube ישירים
 */

window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("splash").style.display = "none";
  }, 4000);
});

let playlist = [];
let currentIndex = 0;

// שמות משתנים לשמירה ב-localStorage
const STORAGE_KEYS = {
  PLAYLIST: 'alemtube_playlist',
  INDEX: 'alemtube_index'
};

window.onload = () => {
  console.log("🎬 AlemTube נטען");
  loadFromCache();
  
  // בדיקת פוקוס על שדה החיפוש
  setTimeout(() => {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.focus();
      searchInput.placeholder = "הדבק קישור YouTube (למשל: youtube.com/watch?v=...)";
    }
  }, 100);
};

// חיבור אירועים
document.getElementById("searchInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchVideos();
  }
});

document.getElementById("searchBtn").addEventListener("click", searchVideos);

async function searchVideos() {
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
    '<div style="text-align: center; padding: 40px; color: #666;">🎬 מטעים סרטון...</div>';

  // חילוץ מזהה סרטון מה-URL
  let videoId = extractVideoId(query);
  
  if (videoId) {
    // אם יש מזהה סרטון - נגן אותו ישירות
    playlist = [{ 
      videoId: videoId, 
      title: "סרטון YouTube", 
      thumb: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` 
    }];
    currentIndex = 0;
    saveToCache();
    playVideo(currentIndex);
  } else {
    // אם לא נמצא מזהה - הצג הוראות
    alert("לא נמצא מזהה סרטון תקין.\n\n" +
          "דוגמאות לקישורים תקינים:\n" +
          "• https://youtube.com/watch?v=dQw4w9WgXcQ\n" +
          "• https://youtu.be/dQw4w9WgXcQ\n" +
          "• dQw4w9WgXcQ\n\n" +
          "העתק קישור מיוטיוב והדבק כאן.");
    
    // ניקוי שדה החיפוש
    document.getElementById("player-container").innerHTML = 
      '<div style="text-align: center; padding: 40px; color: #999;">👆 הזן קישור YouTube למעלה</div>';
  }
}

// פונקציה לחילוץ מזהה סרטון
function extractVideoId(url) {
  // תבניות שונות של קישורי YouTube
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

function playVideo(index) {
  if (!playlist[index]) return;
  
  const video = playlist[index];
  currentIndex = index;
  
  // יצירת iframe עם פרמטרים אופטימליים
  document.getElementById("player-container").innerHTML =
    `<iframe 
      id="ytplayer" 
      src="https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1&controls=1"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
      title="נגן YouTube">
    </iframe>`;
  
  // גלילה חלקה לנגן
  setTimeout(() => {
    document.getElementById("player-container").scrollIntoView({ 
      behavior: "smooth",
      block: "start"
    });
  }, 300);
  
  saveToCache();
  console.log("▶️ מנגן סרטון:", video.videoId);
}

function toggleFullScreen() {
  const elem = document.documentElement;
  
  if (!document.fullscreenElement) {
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
    else if (elem.msRequestFullscreen) elem.msRequestfullscreen();
    
    document.getElementById("fullscreen-btn").textContent = "יציאה ממסך מלא";
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
    
    document.getElementById("fullscreen-btn").textContent = "מעבר למסך מלא";
  }
}

function saveToCache() {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYLIST, JSON.stringify(playlist));
    localStorage.setItem(STORAGE_KEYS.INDEX, currentIndex.toString());
    console.log("💾 שמור במטמון");
  } catch (e) {
    console.error("❌ שגיאה בשמירת מטמון:", e);
  }
}

function loadFromCache() {
  try {
    const savedPlaylist = localStorage.getItem(STORAGE_KEYS.PLAYLIST);
    const savedIndex = localStorage.getItem(STORAGE_KEYS.INDEX);
    
    if (savedPlaylist && savedIndex !== null) {
      playlist = JSON.parse(savedPlaylist);
      currentIndex = parseInt(savedIndex);
      
      if (playlist.length > 0 && currentIndex >= 0 && currentIndex < playlist.length) {
        console.log("📂 טען ממטמון:", playlist.length, "סרטונים");
        playVideo(currentIndex);
      }
    }
  } catch (e) {
    console.error("❌ שגיאה בטעינת מטמון:", e);
  }
}

// הסתרת פרסומות
function hideAds() {
  const adSelectors = ['.ad', '.ads', '.advertisement', '[class*="ad-"]', '[id*="ad-"]'];
  adSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(ad => {
      ad.style.display = 'none';
      ad.style.visibility = 'hidden';
    });
  });
  
  // דילוג על פרסומות
  document.querySelectorAll('.skip-ad, .skip-button, .ytp-ad-skip-button').forEach(btn => {
    if (btn.click) btn.click();
  });
}

// הפעלת הסתרת פרסומות כל 2 שניות
setInterval(hideAds, 2000);

// זיקוקים בהתחלה
function launchFireworks(count = 3) {
  const container = document.querySelector('.fireworks');
  if (!container) return;
  
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;

      for (let j = 0; j < 25; j++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const angle = (Math.PI * 2 * j) / 25;
        const distance = 60 + Math.random() * 40;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        particle.style.setProperty('--x', `${dx}px`);
        particle.style.setProperty('--y', `${dy}px`);
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.background = `hsl(${Math.random() * 360}, 100%, 60%)`;

        container.appendChild(particle);
        setTimeout(() => particle.remove(), 1200);
      }
    }, i * 300);
  }
}

// הפעלת זיקוקים
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  
  // זיקוקים בהתחלה
  let count = 0;
  const interval = setInterval(() => {
    launchFireworks(2);
    count++;
    if (count >= 3) clearInterval(interval);
  }, 800);

  // הסתרת מסך התחלה
  setTimeout(() => {
    if (splash) {
      splash.style.display = "none";
      console.log("🎉 מסך התחלה הוסתר");
    }
  }, 3500);
});
