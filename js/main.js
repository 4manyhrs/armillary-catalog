


  const showConstruction = true; // set to false to disable

  if (!showConstruction) {
    document.getElementById("underConstruction").style.display = "none";
  }

// Svg Construct 

 const SVGs = {

  /* PANEL + GLOW */
  panel: `<img src="https://4manyhrs.github.io/armillary-catalog/Beat%20Panel.svg" class="svg-panel">`,
  glow: `<img src="https://4manyhrs.github.io/armillary-catalog/Beat%20Panel%20Glow.svg" class="svg-glow">`,

  /* BIG ICONS (48×48) */
  play: `<img src="https://4manyhrs.github.io/armillary-catalog/Play.svg" class="svg-icon big-icon">`,
  pause: `<img src="https://4manyhrs.github.io/armillary-catalog/Pause.svg" class="svg-icon big-icon">`,
  fav: `<img src="https://4manyhrs.github.io/armillary-catalog/Favorite.svg" class="svg-icon big-icon">`,
  unfav: `<img src="https://4manyhrs.github.io/armillary-catalog/Unfavorite.svg" class="svg-icon big-icon">`,

  /* STANDARD ICONS (40×40) */
  eye: `<img src="https://4manyhrs.github.io/armillary-catalog/Eye.svg" class="svg-icon">`,
  flame: `<img src="https://4manyhrs.github.io/armillary-catalog/Flame.svg" class="svg-icon">`,
  send: `<img src="https://4manyhrs.github.io/armillary-catalog/Send.svg" class="svg-icon">`,
  download: `<img src="https://4manyhrs.github.io/armillary-catalog/Download.svg" class="svg-icon">`,
  cart: `<img src="https://4manyhrs.github.io/armillary-catalog/Cart.svg" class="svg-icon">`,
  delete: `<img src="https://4manyhrs.github.io/armillary-catalog/Delete.svg" class="svg-icon">`,
  edit: `<img src="https://4manyhrs.github.io/armillary-catalog/Edit.svg" class="svg-icon">`,
  files: `<img src="https://4manyhrs.github.io/armillary-catalog/Files.svg" class="svg-icon">`,
  filter: `<img src="https://4manyhrs.github.io/armillary-catalog/Filter.svg" class="svg-icon">`,
  headphones: `<img src="https://4manyhrs.github.io/armillary-catalog/Headphones.svg" class="svg-icon">`,
  inorder: `<img src="https://4manyhrs.github.io/armillary-catalog/InOrder.svg" class="svg-icon">`,
  locked: `<img src="https://4manyhrs.github.io/armillary-catalog/Locked.svg" class="svg-icon">`,
  loop: `<img src="https://4manyhrs.github.io/armillary-catalog/Loop.svg" class="svg-icon">`,
  metronome: `<img src="https://4manyhrs.github.io/armillary-catalog/Metronome.svg" class="svg-icon">`,
  mute: `<img src="https://4manyhrs.github.io/armillary-catalog/Mute.svg" class="svg-icon">`,
  random: `<img src="https://4manyhrs.github.io/armillary-catalog/Random.svg" class="svg-icon">`,
  search: `<img src="https://4manyhrs.github.io/armillary-catalog/Search.svg" class="svg-icon">`,
  settings: `<img src="https://4manyhrs.github.io/armillary-catalog/Settings.svg" class="svg-icon">`,
  songkey: `<img src="https://4manyhrs.github.io/armillary-catalog/SongKey.svg" class="svg-icon">`,
  tags: `<img src="https://4manyhrs.github.io/armillary-catalog/Tags.svg" class="svg-icon">`,
  unlocked: `<img src="https://4manyhrs.github.io/armillary-catalog/Unlocked.svg" class="svg-icon">`,
  upload: `<img src="https://4manyhrs.github.io/armillary-catalog/Upload.svg" class="svg-icon">`,
  volume: `<img src="https://4manyhrs.github.io/armillary-catalog/Volume.svg" class="svg-icon">`
};


// FIXED: Variable renamed to supabaseClient to prevent "Cannot access before initialization" errors
const SUPABASE_URL = "https://purkgjbpvathnxuiultl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cmtnamJwdmF0aG54dWl1bHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NzUxNDUsImV4cCI6MjA5NTA1MTE0NX0.p1yMsIQUnPrvzO42mla1qpJQOVYDS2cvB5m0r0BQOmA";

// FIXED: Uses the explicit window object reference to guarantee the CDN library maps correctly
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function submitBeat() {
  const pass = prompt("Enter upload password:");
  if (pass !== "444four") {
    alert("Access denied");
    return; // stops the upload
  }
  const fileInput = document.getElementById('beatFile');
  const file = fileInput.files[0]; // Ensure index 0 is targeted correctly

  if (!file) {
    document.getElementById("uploadStatus").innerText = "Please select an audio file first.";
    return;
  }

  const title = document.getElementById("title").value;
  const artist = document.getElementById("artist").value;
  const mood = document.getElementById("mood").value;
  const genre = document.getElementById("genre").value;

  if (!title || !artist) {
    document.getElementById("uploadStatus").innerText = "Title and Artist are required.";
    return;
  }

  document.getElementById("uploadStatus").innerText = "Uploading audio file...";

  const fileExtension = file.name.split('.').pop();
  const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;

  try {
    // Uses the corrected global client instance wrapper
    const { data: storageData, error: storageError } = await supabaseClient.storage
      .from('beats')
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (storageError) {
      document.getElementById("uploadStatus").innerText = "Audio upload failed. Check console.";
      console.error("Storage Error:", storageError.message);
      return;
    }

    const { data: urlData } = supabaseClient.storage.from('beats').getPublicUrl(uniqueFileName);
    const publicFileUrl = urlData.publicUrl;

    document.getElementById("uploadStatus").innerText = "Saving metadata...";

    const { error: dbError } = await supabaseClient
      .from('beats')
      .insert([
        { title, artist, mood, genre, file_url: publicFileUrl, uploader_name: artist }
      ]);

    if (!dbError) {
      document.getElementById("uploadStatus").innerText = "Beat uploaded successfully!";
      fileInput.value = "";
      document.getElementById("title").value = "";
      document.getElementById("artist").value = "";
      document.getElementById("mood").value = "";
      document.getElementById("genre").value = "";
      fetchAndDisplayBeats(); // Refresh the grid view
    } else {
      console.error("Database Error:", dbError.message);
      document.getElementById("uploadStatus").innerText = "Database save failed. Check console.";
    }

  } catch (err) {
    console.error("System Error:", err);
    document.getElementById("uploadStatus").innerText = "Network error. Check console.";
  }
}

function downloadNote() {
  const text = document.getElementById("noteArea").value;
  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "armillary-note.txt";
  link.click();
}

let currentNoteSlot = "1";

function switchNoteSlot() {
  currentNoteSlot = document.getElementById("noteSlot").value;

  const saved = localStorage.getItem("armillary_notes_" + currentNoteSlot);
  document.getElementById("noteArea").value = saved || "";
}

// 🔥 Auto-save notes every second (per slot)
setInterval(() => {
  const text = document.getElementById("noteArea").value;
  localStorage.setItem("armillary_notes_" + currentNoteSlot, text);
}, 1000);

async function shareNote() {
  const text = document.getElementById("noteArea").value;

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Armillary Notes",
        text: text
      });
    } catch (err) {
      console.error("Share canceled or failed:", err);
    }
  } else {
    alert("Sharing not supported on this device.");
  }
}

function clearNotes() {
  if (confirm("Clear all notes? This cannot be undone.")) {
    document.getElementById("noteArea").value = "";
    localStorage.removeItem("armillary_notes_" + currentNoteSlot); // ✅ FIXED
  }
}

// 🔥 Load Note 1 on startup
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("armillary_notes_1");
  if (saved) document.getElementById("noteArea").value = saved;
});





// Automatically load the catalog when the page initializes
window.addEventListener('DOMContentLoaded', fetchAndDisplayBeats);

 async function fetchAndDisplayBeats() {
  try {
    const start = (currentPage - 1) * beatsPerPage;
    const end = start + beatsPerPage - 1;
    
    // 🔥 Server-side pagination
    const { data: beats, error, count } = await supabaseClient
      .from('beats')
      .select('*', { count: 'exact' })
      .order(currentSortColumn, { ascending: currentSortAscending })
      .range(start, end);

    if (error) throw error;

    allBeats = beats;      // only this page's beats
    totalBeats = count;    // store total count for pagination UI

    renderPage();

  } catch (err) {
    console.error("Error loading catalog:", err.message || err);
  }
}



 let currentAudio = null;
    let currentPlayBtn = null;

function initCustomPlayers() {
  document.querySelectorAll(".audio-player").forEach(player => {
    const audio = new Audio(player.dataset.src);

    const playBtn = player.querySelector(".play-btn");
    const seek = player.querySelector(".seek");
    const volume = player.querySelector(".volume");
    const currentTimeEl = player.querySelector(".current");
    const durationEl = player.querySelector(".duration");
    const backBtn = player.querySelector(".back");
    const forwardBtn = player.querySelector(".forward");

    playBtn.addEventListener("click", () => {

  // 🔥 Stop previously playing audio
  if (currentAudio && currentAudio !== audio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    if (currentPlayBtn) currentPlayBtn.textContent = "▶";
  }

  // 🔥 Toggle this audio
  if (audio.paused) {
    audio.play();
    playBtn.textContent = "⏸";

// MARK BEAT AS VIEWED
    const beatId = player.dataset.id;
    localStorage.setItem("viewed_" + beatId, "true");

    const parentCard = player.closest(".beat-card");
    const icon = parentCard.querySelector(".new-icon");
    if (icon) icon.style.display = "none";

    currentAudio = audio;
    currentPlayBtn = playBtn;
    
  } else {
    audio.pause();
    playBtn.textContent = "▶";
  }
});


    audio.addEventListener("loadedmetadata", () => {
      durationEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      audio.addEventListener("ended", () => {
  handleTrackEnd(player);
});

      seek.value = (audio.currentTime / audio.duration) * 100;
      currentTimeEl.textContent = formatTime(audio.currentTime);
    });

    seek.addEventListener("input", () => {
      audio.currentTime = (seek.value / 100) * audio.duration;
    });

    volume.addEventListener("input", () => {
      audio.volume = volume.value;
    });

    backBtn.addEventListener("click", () => {
      audio.currentTime = Math.max(0, audio.currentTime - 10);
    });

    forwardBtn.addEventListener("click", () => {
      audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
    });
  });
}
    
function handleTrackEnd(player) {
  const beatId = player.dataset.id;

  if (playMode === "loop") {
    // Replay same beat
    player.querySelector(".play-btn").click();
    return;
  }

  const players = [...document.querySelectorAll(".audio-player")];
  const index = players.indexOf(player);

  let nextIndex;

  if (playMode === "random") {
    nextIndex = Math.floor(Math.random() * players.length);
  } else {
    // ORDER MODE
    nextIndex = index + 1;
    if (nextIndex >= players.length) return; // stop at end
  }

  const nextPlayer = players[nextIndex];
  if (!nextPlayer) return;

  nextPlayer.querySelector(".play-btn").click();
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

    let currentPage = 1;
    const beatsPerPage = 7;
    let allBeats = [];
    let totalBeats = 0;
    let currentSortColumn = "id";
    let currentSortAscending = false;
    let playMode = "order"; // "order", "loop", "random"

function changePlayMode() {
  playMode = document.getElementById("playMode").value;
}


   async function applySorting() {
  const mode = document.getElementById("sortSelect").value;

  if (mode === "newest") {
    currentSortColumn = "id";
    currentSortAscending = false;
  }
  else if (mode === "oldest") {
    currentSortColumn = "id";
    currentSortAscending = true;
  }
  else if (mode === "az") {
    currentSortColumn = "title";
    currentSortAscending = true;
  }
  else if (mode === "za") {
    currentSortColumn = "title";
    currentSortAscending = false;
  }

  currentPage = 1;
  fetchAndDisplayBeats();
}


function renderPage() {
  const list = document.getElementById("beatList");
  list.innerHTML = "";

  const pageBeats = allBeats;

  pageBeats.forEach(beat => {

    /* -------------------------
       GENRE COLOR SYSTEM
    ------------------------- */
    const genreColors = {
      "Trap": "#3a0000",
      "Boom Bap": "#2b1a00",
      "R&B": "#2b0030",
      "Drill": "#1a1a1a",
      "Lo-Fi": "#003333",
      "Pop": "#330033",
      "EDM": "#001a33",
      "Hyper-Hop": "#1a0033",
      "Kingdom": "#332200"
    };

    const panelColor = genreColors[beat.genre] || "#000000";

    /* -------------------------
       TAGS (TEMPORARY STATIC)
    ------------------------- */
    const tags = [
      beat.genre || "Hip-Hop",
      beat.mood || "Vibes",
      "Hip-Hop"
    ];

    const tagsHTML = tags
      .map(t => `<span class="tag">#${t.replace(/\s+/g, '')}</span>`)
      .join("");

    /* -------------------------
       FAVORITE STATE
    ------------------------- */
    const beatIsFav = localStorage.getItem("favorite_" + beat.id) === "true";

    /* -------------------------
       BUILD CARD
    ------------------------- */
    const card = document.createElement("div");
    card.className = "beat-card";
    card.style.setProperty("--panel-color", panelColor);
    card.dataset.id = beat.id;

    card.innerHTML = `
      <!-- Background Panel -->
      <div class="panel-bg">${SVGs.panel}</div>

      <!-- Glow Layer -->
      <div class="panel-glow">${SVGs.glow}</div>

      <!-- NEW badge -->
      <span class="new-icon"><b><i>NEW!</i></b></span>

      <!-- Favorite Star -->
      <div class="favorite-toggle icon-fav" data-id="${beat.id}">
        ${beatIsFav ? SVGs.fav : SVGs.unfav}
      </div>

      <!-- LEFT SIDE -->
      <div class="beat-left">
        <h3 class="beat-title">${beat.title}</h3>
        <p class="beat-artist">${beat.artist}</p>
        <p class="beat-meta">${beat.genre || ''} • ${beat.mood || ''}</p>

        <div class="beat-tags">${tagsHTML}</div>

        <div class="beat-files">
          <a href="#" class="file-link">FREE</a> |
          <a href="#" class="file-link">.MP3</a> |
          <a href="#" class="file-link">.WAV</a> |
          <a href="#" class="file-link">STEMS</a>
        </div>

        <div class="waveform-row">
          <div class="play-button icon-play" data-id="${beat.id}">
            ${SVGs.play}
          </div>
          <div class="waveform" data-id="${beat.id}"></div>
        </div>
      </div>

      <!-- RIGHT SIDE -->
      <div class="beat-right">
        <div class="stat">
          <div class="icon-eye">${SVGs.eye}</div>
          <span class="stat-number">1000</span>
        </div>

        <div class="stat">
          <div class="icon-flame">${SVGs.flame}</div>
          <span class="stat-number">23</span>
        </div>

        <div class="stat">
          <div class="icon-send">${SVGs.send}</div>
          <span class="stat-number">1</span>
        </div>
      </div>

      <!-- Hidden audio element (keeps your JS working) -->
      <audio class="audio-player" data-src="${beat.file_url}" data-id="${beat.id}"></audio>
    `;

    /* -------------------------
       VIEWED LOGIC
    ------------------------- */
    const viewed = localStorage.getItem("viewed_" + beat.id);
    if (viewed === "true") {
      card.querySelector(".new-icon").style.display = "none";
    }

    list.appendChild(card);
  });

  /* -------------------------
     FAVORITE STAR LOGIC
  ------------------------- */
  document.querySelectorAll(".favorite-toggle").forEach(star => {
    const id = star.dataset.id;

    star.addEventListener("click", () => {
      const isFav = localStorage.getItem("favorite_" + id) === "true";

      if (isFav) {
        localStorage.removeItem("favorite_" + id);
        star.innerHTML = SVGs.unfav;
      } else {
        localStorage.setItem("favorite_" + id, "true");
        star.innerHTML = SVGs.fav;
      }
    });
  });

  /* -------------------------
     AUDIO PLAYER LOGIC
     (your existing system)
  ------------------------- */
  initCustomPlayers();

  /* -------------------------
     PAGINATION
  ------------------------- */
  updatePaginationUI();
}

    function updatePaginationUI() {
  const totalPages = Math.ceil(totalBeats / beatsPerPage);


  document.getElementById("pageInfo").textContent =
    `Page ${currentPage} of ${totalPages}`;

  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;
}

document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchAndDisplayBeats();
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  const totalPages = Math.ceil(totalBeats / beatsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    fetchAndDisplayBeats();
  }
});






  function startLoader() {
  scrollEl.classList.add("loading");

  loaderInterval = setInterval(() => {
    dots = (dots + 1) % 4;
    scrollEl.textContent = "Loading daily scriptures" + ".".repeat(dots);
  }, 500);
}

const scrollEl = document.getElementById("dailyVerseScroll");
scrollEl.textContent = "Loading daily scriptures…";

/*FULL BIBLE DIRECTORY REFERENCE FOR SCROLL RANDOMIZER*/

let bible = {}; // global Bible object

async function loadKJV() {
  const res = await fetch('/armillary-catalog/KJV.txt');
  const text = await res.text();

  const bibleObj = {};
  const lines = text.split('\n');

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    const match = line.match(/^([1-3]?\s?[A-Za-z]+)\s+(\d+):(\d+)\s+(.*)$/);
    if (!match) continue;

    const [, book, chapter, verse, content] = match;

    if (!bibleObj[book]) bibleObj[book] = {};
    if (!bibleObj[book][chapter]) bibleObj[book][chapter] = {};

    bibleObj[book][chapter][verse] = content;
  }

  return bibleObj;
}

const psalmsOnly = ["Psalms"];
const proverbsOnly = ["Proverbs"];

// Fetch a random verse from text list
function getRandomFromBooks(bookList) {
  if (!bookList || bookList.length === 0) return null;

  const book = bookList[Math.floor(Math.random() * bookList.length)];

  const chapters = Object.keys(bible[book] || {});
  if (chapters.length === 0) return null;

  const chapter = chapters[Math.floor(Math.random() * chapters.length)];

  const verses = Object.keys(bible[book][chapter] || {});
  if (verses.length === 0) return null;

  const verse = verses[Math.floor(Math.random() * verses.length)];

  return {
    ref: `${book} ${chapter}:${verse}`,
    english: bible[book][chapter][verse]
  };
}


/* === INSERT: 6AM DAILY KEY LOGIC === */
function getDailyKey() {
  const now = new Date();
  const hour = now.getHours();

  // Before 6 AM → treat as previous day
  if (hour < 6) {
    now.setDate(now.getDate() - 1);
  }

  // YYYY-MM-DD
  return now.toISOString().split("T")[0];
}


// Daily caching logic
async function loadDailyVerses() {

  /* === REPLACE WITH DAILY KEY CHECK === */
  const saved = JSON.parse(localStorage.getItem("dailyVerses"));
  const key = getDailyKey();

  if (saved && saved.key === key) {
    displayVerses(saved.verses);
    return;
  }

  const verses = [
    getRandomFromBooks(allBooks),
  ];

  /* === REPLACE WITH DAILY KEY SAVE === */
  const store = { key, verses };
  localStorage.setItem("dailyVerses", JSON.stringify(store));

  displayVerses(verses);
}

function hideLoader() {
  clearInterval(loaderInterval);
}

// Display in scroll bar
function displayVerses(list) {

  hideLoader(); // correct placement
  scrollEl.style.animation = "none";
  scrollEl.classList.remove("loading");

  let combined = "";

  list.forEach(v => {
    let text = v.english;
    if (useKingdomNames) text = applyKingdomNames(text);

    combined += `${v.ref} │ "${text}"     `;
  });

  /* === FIX: This line must be INSIDE the function === */
  scrollEl.textContent = combined + "            " + combined;

  
  void scrollEl.offsetWidth; // force reflow (required for Safari)
scrollEl.style.animation = ""; // restart animation

}


// Modal click logic (unchanged)
document.getElementById("dailyVerseBar").addEventListener("click", () => {
  const saved = JSON.parse(localStorage.getItem("dailyVerses"));
  if (!saved) return;

  const modalText = saved.verses
    .map(v => `${v.ref}\n"${v.english}"\n`)
    .join("\n");

  document.getElementById("verseModalRef").textContent = "Today's Verses";
  document.getElementById("verseModalText").innerHTML =
    modalText.replace(/\n/g, "<br>");

  document.getElementById("verseModal").style.display = "flex";
});

document.getElementById("closeVerseBtn").addEventListener("click", () => {
  document.getElementById("verseModal").style.display = "none";
});

document.getElementById("verseModalContent").addEventListener("click", (e) => {
  e.stopPropagation();
});

/* === INSERT: TAP OUTSIDE TO CLOSE MODAL === */
window.addEventListener("click", (e) => {
  const modal = document.getElementById("verseModal");
  if (e.target === modal) {
    modal.style.display = "none";
  }
});


function cleanText(str) {
  if (!str) return "";
  return str.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function applyKingdomNames(text) {
  return text
    .replace(/\bThe LORD\b/g, "YHWH")
    .replace(/\bLORD\b/g, "YHWH")
    .replace(/\bLord\b/g, "Adonai")
    .replace(/\bMy Lord\b/g, "Adonai")
    .replace(/\bGod\b/g, "Elohim");
}

let useKingdomNames = false;

document.getElementById("toggleNamesBtn").addEventListener("click", () => {
  useKingdomNames = !useKingdomNames;

  const saved = JSON.parse(localStorage.getItem("dailyVerses"));
  if (saved) displayVerses(saved.verses);
});

async function initBible() {
  startLoader();
  bible = await loadKJV();
  window.allBooks = Object.keys(bible);

  loadDailyVerses();
}

initBible();





let fvPlayers = {};
let fvIndex = 0; // which card is center
let readyCount = 0;

// YOUTUBE API READY → CREATE PLAYERS
function onYouTubeIframeAPIReady() {
  const cards = document.querySelectorAll(".video-card");

  cards.forEach((card, i) => {
    const vid = card.dataset.videoId;
    const frameId = "fv-player-" + (i + 1);

    fvPlayers[frameId] = new YT.Player(frameId, {
      videoId: vid,
      playerVars: {
        autoplay: 1,
        mute: 1,
        controls: 1,
        playsinline: 1
      },
      events: {
        onReady: checkAllReady
      }
    });
  });
}

// WHEN ALL PLAYERS ARE READY → START CAROUSEL
function checkAllReady() {
  readyCount++;

  if (readyCount === document.querySelectorAll(".video-card").length) {

    // 1️⃣ Assign card positions FIRST
    updateFVPositions();

    // 2️⃣ NOW autoplay the center card (after updateFVPositions pauses others)
    const first = fvPlayers["fv-player-1"];
    first.mute();
    first.playVideo();

    // 3️⃣ Hide loader + show carousel
    document.getElementById("featured-loader").style.display = "none";
    document.querySelector(".video-3d-carousel").style.opacity = "1";

    // 4️⃣ Start rotation AFTER autoplay is confirmed
    setTimeout(() => {
      setInterval(() => rotateFV(), 28000);
    }, 1000);
  }
}

// POSITION CARDS + CONTROL WHICH VIDEO PLAYS
function updateFVPositions() {
  const cards = document.querySelectorAll(".video-card");
  cards.forEach(card => card.className = "video-card");

  const total = cards.length;

  const center = fvIndex % total;
  const right = (fvIndex + 1) % total;
  const back = (fvIndex + 2) % total;
  const left = (fvIndex + 3) % total;

  cards[center].classList.add("center");
  cards[right].classList.add("right");
  cards[back].classList.add("back");
  cards[left].classList.add("left");

  // Pause all except center
  Object.keys(fvPlayers).forEach((id, i) => {
    if (i === center) {
      fvPlayers[id].mute();
      fvPlayers[id].playVideo();
    } else {
      fvPlayers[id].pauseVideo();
    }
  });
}

// ROTATE CAROUSEL
function rotateFV() {
  fvIndex++;
  updateFVPositions();
}


// LEFT ARROW
document.querySelector(".fv-left").addEventListener("click", () => {
  const total = document.querySelectorAll(".video-card").length;
  fvIndex = (fvIndex - 1 + total) % total;
  updateFVPositions();
});

// RIGHT ARROW
document.querySelector(".fv-right").addEventListener("click", () => {
  rotateFV();
});

let startX = 0;

const fvContainer = document.querySelector(".video-carousel-wrapper");

fvContainer.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

fvContainer.addEventListener("touchend", e => {
  const endX = e.changedTouches[0].clientX;
  const diff = startX - endX;

  if (Math.abs(diff) > 50) {
    const total = document.querySelectorAll(".video-card").length;

    if (diff > 0) {
      // swipe left → next
      rotateFV();
    } else {
      // swipe right → previous
      fvIndex = (fvIndex - 1 + total) % total;
      updateFVPositions();
    }
  }
});
