window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("splash").style.display = "none";
  }, 4000);
});

const API_KEY = "AIzaSyCKWg2Po9gpQTx2-SSadDOouTB04jBFAAU";
let playlist = [];
let currentIndex = 0;

window.onload = () => loadFromCache();

document.getElementById("searchInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchVideos();
  }
});

async function searchVideos() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return;

  playlist = [];
  currentIndex = 0;
  document.getElementById("results").innerHTML = "";
  document.getElementById("player-container").innerHTML = "";

  const isURL = query.includes("youtube.com") || query.includes("youtu.be");
  if (isURL) {
    const match = query.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    const videoId = match ? match[1] : "";
    if (videoId && await checkEmbeddable(videoId)) {
      playlist = [{ videoId, title: "סרטון שהוזן", thumb: "" }];
      currentIndex = 0;
      saveToCache();
      playVideo(currentIndex);
    }
    return;
  }

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
    query)}&type=video&key=${API_KEY}&maxResults=30`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    for (const item of data.items) {
      const vid = item.id.videoId;
      if (await checkEmbeddable(vid)) {
        playlist.push({
          videoId: vid,
          title: item.snippet.title,
          thumb: item.snippet.thumbnails.medium.url,
        });
      }
    }

    if (playlist.length === 0) return alert("לא נמצאו סרטונים ניתנים לניגון");

    currentIndex = 0;
    saveToCache();
    playVideo(currentIndex);
  } catch (e) {
    console.error("שגיאת חיפוש:", e);
  }
}

function playVideo(index) {
  const video = playlist[index];
  if (!video) return;

  document.getElementById("player-container").innerHTML =
    `<iframe id="ytplayer" src="https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1" allowfullscreen allow="autoplay"></iframe>`;

  setTimeout(() => {
    document.getElementById("player-container").scrollIntoView({ behavior: "smooth" });
  }, 500);

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  playlist.forEach((v, i) => {
    if (i === index) return;
    const div = document.createElement("div");
    div.className = "video-item";
    div.onclick = () => {
      currentIndex = i;
      saveToCache();
      playVideo(i);
    };
    div.innerHTML = `<img src="${v.thumb}" alt="${v.title}"><div class="video-title">${v.title}</div>`;
    resultsDiv.appendChild(div);
  });

  setTimeout(() => setupPlayerEvents(), 1000);
}

function toggleFullScreen() {
  const elem = document
