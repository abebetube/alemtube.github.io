/***********************
 * GLOBALS & CONFIG
 ***********************/
const API_KEY = "AIzaSyCKWg2Po9gpQTx2-SSadDOouTB04jBFAAU";
let playlist = [];
let currentIndex = 0;
let player;

/***********************
 * INIT
 ***********************/
window.addEventListener("load", () => {
  console.log("🎬 AlemTube מתחיל...");
  initSplash();
  loadFromCache();
});

document.getElementById("searchInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchVideos();
  }
});

/***********************
 * SEARCH (KEYWORDS ONLY)
 ***********************/
async function searchVideos() {
  const query = document.getElementById("searchInput").value.trim();
  console.log("🔍 מחפש:", query);

  if (!query) return;

  playlist = [];
  currentIndex = 0;
  document.getElementById("results").innerHTML = "";
  document.getElementById("player-container").innerHTML = "";

  const url =
    `https://www.googleapis.com/youtube/v3/search?` +
    `part=snippet&type=video&maxResults=20` +
    `&q=${encodeURIComponent(query)}` +
    `&key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      alert("לא נמצאו תוצאות");
      return;
    }

    data.items.forEach(item => {
      playlist.push({
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumb: item.snippet.thumbnails.medium.url
      });
    });

    console.log(`✅ נמצאו ${playlist.length} סרטונים`);
    saveToCache();
    playVideo(0);

  } catch (err) {
    console.error("❌ שגיאת חיפוש:", err);
  }
}

/***********************
 * PLAYER
 ***********************/
function playVideo(index) {
  const video = playlist[index];
  if (!video) return;

  currentIndex = index;

  document.getElementById("player-container").innerHTML = `
    <iframe
      id="ytplayer"
      src="https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1"
      allow="autoplay; fullscreen"
      allowfullscreen>
    </iframe>
  `;

  setTimeout(() => {
    document
      .getElementById("player-container")
      .scrollIntoView({ behavior: "smooth" });
  }, 400);

  renderResults();
  saveToCache();

  setTimeout(setupPlayerEvents, 800);
}

function renderResults() {
  const results = document.getElementById("results");
  results.innerHTML = "";

  playlist.forEach((v, i) => {
    if (i === currentIndex) return;

    const div = document.createElement("div");
    div.className = "video-item";
    div.onclick = () => playVideo(i);

    div.innerHTML = `
      <img src="${v.thumb}" alt="${v.title}">
      <div class="video-title">${v.title}</div>
    `;

    results.appendChild(div);
  });
}

/***********************
 * YOUTUBE EVENTS
 ***********************/
function setupPlayerEvents() {
  if (typeof YT === "undefined" || !YT.Player) return;

  player = new YT.Player("ytplayer", {
    events: {
      onStateChange: (e) => {
        if (
          e.data === YT.PlayerState.ENDED &&
          currentIndex + 1 < playlist.length
        ) {
          playVideo(currentIndex + 1);
        }
      }
    }
  });
}

/***********************
 * CACHE
 ***********************/
function saveToCache() {
  localStorage.setItem("abe_playlist", JSON.stringify(playlist));
  localStorage.setItem("abe_index", currentIndex);
}

function loadFromCache() {
  const list = localStorage.getItem("abe_playlist");
  const idx = localStorage.getItem("abe_index");

  if (list && idx !== null) {
    playlist = JSON.parse(list);
    currentIndex = parseInt(idx, 10);
    playVideo(currentIndex);
  }
}

/***********************
 * SPLASH & FIREWORKS
 ***********************/
function initSplash() {
  const splash = document.getElementById("splash");
  let count = 0;

  const interval = setInterval(() => {
    launchFireworks();
    if (++count >= 4) clearInterval(interval);
  }, 700);

  setTimeout(() => {
    splash.style.display = "none";
    console.log("✅ מסך התחלה הוסתר");
  }, 4000);
}

function launchFireworks(count = 5) {
  const container = document.querySelector(".fireworks");
  if (!container) return;

  for (let i = 0; i < count; i++) {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;

    for (let j = 0; j < 30; j++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      p.style.background =
        `hsl(${Math.random() * 360},100%,60%)`;

      container.appendChild(p);
      setTimeout(() => p.remove(), 1500);
    }
  }
}

/***********************
 * ADS (ויזואלי בלבד)
 ***********************/
function skipAds() {
  document
    .querySelectorAll(".ad,.ads,.advertisement,#ad-container")
    .forEach(el => el.style.display = "none");

  const skip = document.querySelector(".skip-ad,.skip-button");
  if (skip) skip.click();
}

setInterval(skipAds, 3000);

/***********************
 * YOUTUBE API LOAD
 ***********************/
const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);
