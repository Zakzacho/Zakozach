// قائمة الفيديوهات - أضف روابط اليوتيوب هنا
const videos = [
    {
        id: 1,
        title: "مقدمة في البرمجة",
        youtubeId: "dQw4w9WgXcQ", // غيّر هذا بمعرف الفيديو الحقيقي
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
    // أضف المزيد من الفيديوهات هنا
];

// تحميل الفيديوهات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadVideos();
    loadComments();
});

// عرض قائمة الفيديوهات
function loadVideos() {
    const videoList = document.getElementById('videoList');
    const videoCount = document.getElementById('videoCount');
    
    videoCount.textContent = videos.length;
    videoList.innerHTML = '';

    videos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        videoCard.onclick = () => playVideo(video);
        
        videoCard.innerHTML = `
            <img src="${video.thumbnail}" alt="${video.title}">
            <div class="video-info">
                <h3>${video.title}</h3>
                <button class="play-btn">▶ تشغيل</button>
            </div>
        `;
        
        videoList.appendChild(videoCard);
    });
}

// تشغيل الفيديو
function playVideo(video) {
    const playerSection = document.getElementById('playerSection');
    const youtubePlayer = document.getElementById('youtubePlayer');
    const currentVideoTitle = document.getElementById('currentVideoTitle');
    
    currentVideoTitle.textContent = video.title;
    youtubePlayer.src = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`;
    
    playerSection.style.display = 'block';
    playerSection.scrollIntoView({ behavior: 'smooth' });
}

// إغلاق المشغل
function closePlayer() {
    const playerSection = document.getElementById('playerSection');
    const youtubePlayer = document.getElementById('youtubePlayer');
    
    youtubePlayer.src = '';
    playerSection.style.display = 'none';
}

// نظام التعليقات
let comments = [];

// تحميل التعليقات من localStorage
function loadComments() {
    const savedComments = localStorage.getItem('darnafullComments');
    if (savedComments) {
        comments = JSON.parse(savedComments);
        displayComments();
    }
}

// حفظ التعليقات
function saveComments() {
    localStorage.setItem('darnafullComments', JSON.stringify(comments));
}

// إضافة تعليق جديد
function addComment() {
    const userName = document.getElementById('userName').value.trim() || 'مستخدم';
    const commentText = document.getElementById('commentText').value.trim();
    
    if (!commentText) {
        alert('الرجاء كتابة تعليق أولاً');
        return;
    }
    
    const newComment = {
        id: Date.now(),
        userName: userName,
        text: commentText,
        date: new Date().toLocaleString('ar-SA')
    };
    
    comments.unshift(newComment);
    saveComments();
    displayComments();
    
    // مسح النموذج
    document.getElementById('userName').value = '';
    document.getElementById('commentText').value = '';
    
    alert('تم إضافة تعليقك بنجاح!');
}

// عرض التعليقات
function displayComments() {
    const commentsList = document.getElementById('commentsList');
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="no-comments">لا توجد تعليقات بعد. كن أول من يعلق!</p>';
        return;
    }
    
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment-card">
            <div class="comment-header">
                <span class="comment-user">👤 ${comment.userName}</span>
                <span class="comment-date">${comment.date}</span>
            </div>
            <p class="comment-text">${comment.text}</p>
            <button onclick="deleteComment(${comment.id})" class="delete-btn">🗑️ حذف</button>
        </div>
    `).join('');
}

// حذف تعليق
function deleteComment(id) {
    if (confirm('هل أنت متأكد من حذف هذا التعليق؟')) {
        comments = comments.filter(comment => comment.id !== id);
        saveComments();
        displayComments();
    }
}
