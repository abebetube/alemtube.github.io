const API_KEY = "AIzaSyCKWg2Po9gpQTx2-SSadDOouTB04jBFAAU";
let playlist = [];
let currentIndex = 0;

/* Load cache */
window.onload = () => loadFromCache();

/* Enter key */
document.getElementById("searchInput")
  .addEventListener("keydown", e => e.key === "Enter" && searchVideos());

async function searchVideos() {
  const query = searchInput.value.trim();
  if (!query) return;

  playlist = [];
  results.innerHTML = "";
  playerContainer.innerHTML = "";

  if (query.includes("youtu")) {
    const id = query.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1];
    if (id && await checkEmbeddable(id)) {
      playlist = [{ videoId: id, title: "וידאו שהוזן", thumb: "" }];
      playVideo(0);
      saveToCache();
    }
    return;
  }

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=30&q=${encodeURIComponent(query)}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  for (const item of data.items) {
    if (await checkEmbeddable(item.id.videoId)) {
      playlist.push({
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumb: item.snippet.thumbnails.medium.url
      });
    }
  }

  if (playlist.length) {
    playVideo(0);
    saveToCache();
  }
}

function playVideo(i) {
  const v = playlist[i];
  playerContainer.innerHTML =
    `<iframe id="ytplayer" src="https://www.youtube-nocookie.com/embed/${v.videoId}?autoplay=1" allowfullscreen></iframe>`;

  results.innerHTML = "";
  playlist.forEach((vid, idx) => {
    if (idx === i) return;
    const div = document.createElement("div");
    div.className = "video-item";
    div.onclick = () => playVideo(idx);
    div.innerHTML = `<img src="${vid.thumb}"><div class="video-title">${vid.title}</div>`;
    results.appendChild(div);
  });
}

async function checkEmbeddable(id) {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=status&id=${id}&key=${API_KEY}`);
  const data = await res.json();
  return data.items?.[0]?.status?.embeddable;
}

function saveToCache() {
  localStorage.setItem("abe_playlist", JSON.stringify(playlist));
  localStorage.setItem("abe_index", currentIndex);
}

function loadFromCache() {
  const list = localStorage.getItem("abe_playlist");
  if (list) {
    playlist = JSON.parse(list);
    playVideo(0);
  }
}
