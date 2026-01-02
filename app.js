const API_URL = "https://watch-vip.onrender.com";

/* =========================
   قائمة الفيديوهات
========================= */
const videos = [
  {
    id: 1,
    title: "مقدمة في البرمجة",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg"
  },
  {
    id: 2,
    title: "تعلم JavaScript",
    youtubeId: "W6NZfCO5SIk",
    thumbnail: "https://img.youtube.com/vi/W6NZfCO5SIk/mqdefault.jpg"
  },
  {
    id: 3,
    title: "أساسيات HTML و CSS",
    youtubeId: "UB1O30fR-EE",
    thumbnail: "https://img.youtube.com/vi/UB1O30fR-EE/mqdefault.jpg"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  loadVideos();
});

/* =========================
   عرض الفيديوهات
========================= */
function loadVideos() {
  const videoList = document.getElementById("videoList");
  const videoCount = document.getElementById("videoCount");

  videoCount.textContent = videos.length;
  videoList.innerHTML = "";

  videos.forEach(video => {
    const card = document.createElement("div");
    card.className = "video-card";
    card.onclick = () => playVideo(video);

    card.innerHTML = `
      <img src="${video.thumbnail}" alt="${video.title}">
      <div class="video-info">
        <h3>${video.title}</h3>
        <button class="play-btn">▶ تشغيل</button>
      </div>
    `;

    videoList.appendChild(card);
  });
}

function playVideo(video) {
  const playerSection = document.getElementById("playerSection");
  const youtubePlayer = document.getElementById("youtubePlayer");
  const currentVideoTitle = document.getElementById("currentVideoTitle");

  currentVideoTitle.textContent = video.title;
  youtubePlayer.src = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`;

  playerSection.style.display = "block";
  playerSection.scrollIntoView({ behavior: "smooth" });
}

function closePlayer() {
  document.getElementById("youtubePlayer").src = "";
  document.getElementById("playerSection").style.display = "none";
}

/* =========================
   إرسال التعليق إلى البوت
========================= */
function submitComment() {
  const nameInput = document.getElementById("userName");
  const commentInput = document.getElementById("commentText");

  const name = nameInput.value.trim() || "مستخدم";
  const comment = commentInput.value.trim();

  if (!comment) {
    alert("الرجاء كتابة تعليق أولاً");
    return;
  }

  fetch(API_URL + "/submit-comment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name,
      comment
    })
  }).then(() => {
    alert("تم إرسال تعليقك بنجاح وسيصل إلى الإدارة");
    nameInput.value = "";
    commentInput.value = "";
  }).catch(() => {
    alert("حدث خطأ أثناء إرسال التعليق");
  });
}
