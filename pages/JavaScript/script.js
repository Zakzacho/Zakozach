document.addEventListener('DOMContentLoaded', () => {
    console.log('Page Loaded');
});
document.addEventListener('DOMContentLoaded', () => {
    // فتح صورة عند النقر عليها
    const zoomableImages = document.querySelectorAll('.zoomable');
    const popup = document.getElementById('imagePopup');
    const popupImage = document.getElementById('popupImage');
    const closeBtn = document.getElementById('closeBtn');

    // تحقق من وجود العناصر قبل استخدام الكود
    if (popup && popupImage && closeBtn) {
        // عند النقر على صورة
        zoomableImages.forEach(image => {
            image.addEventListener('click', () => {
                popupImage.src = image.src;
                popup.style.display = 'flex';
            });
        });

        // عند النقر على زر الإغلاق
        closeBtn.addEventListener('click', () => {
            popup.style.display = 'none';
        });

        // عند النقر خارج الصورة
        popup.addEventListener('click', (e) => {
            if (e.target !== popupImage) {
                popup.style.display = 'none';
            }
        });
    }
});
