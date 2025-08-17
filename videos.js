// Static video data - no API key required
// Add your YouTube video IDs and details here
const STATIC_VIDEOS = [
    {
        id: 'zOps9XmBTO0', // Replace with actual video ID
        title: 'My baby is 1 year old… still asking for breastmilk. Should I continue?”',
        description: 'Yes! Breastfeeding after 1 year is still super useful.🍽️ But solids are also important for full nutrition.🌙 At night, breastmilk is better than cow’s milk – boosts immunity & bonding!🍼 Breastfeed + give solids = best combo!',
        publishedAt: '2024-01-15T10:00:00Z',
        thumbnail: 'https://img.youtube.com/vi/zOps9XmBTO0/maxresdefault.jpg'
    },
    {
        id: 'xVLB4S257vE', // Replace with actual video ID
        title: '👶 Sometimes, when babies sleep, you hear a "Gor Gor" sound.Is it normal or abnormal?🩺',
        description: 'Most of the time, it’s normal — babies have narrow airways, and even a little mucus or fast breathing can cause turbulence, leading to that sound.⚠️ But if it comes with fever, fast breathing, poor feeding, or the baby seems very drowsy — that’s abnormal.In such cases, it’s best to consult a pediatrician.',
        publishedAt: '2024-01-10T14:30:00Z',
        thumbnail: 'https://img.youtube.com/vi/xVLB4S257vE/maxresdefault.jpg'
    },
    {
        id: 'i9uzRu_a1Dc', // Replace with actual video ID
        title: 'When should you start solid foods for your baby?',
        description: 'Is your baby ready for complementary feeding? Many parents are confused about the right time to introduce solid foods.',
        publishedAt: '2024-01-05T09:15:00Z',
        thumbnail: 'https://img.youtube.com/vi/i9uzRu_a1Dc/maxresdefault.jpg'
    },
    {
        id: 'w2LP-7z0a48', // Replace with actual video ID
        title: 'Did you know newborns should NOT be given honey or water? 🚫',
        description: 'reastmilk has enough water to keep them hydrated, and honey can cause botulism! 🍼❌ Keep your little one safe—no honey until they turn 1! 👶❤️',
        publishedAt: '2023-12-28T16:45:00Z',
        thumbnail: 'https://img.youtube.com/vi/w2LP-7z0a48/maxresdefault.jpg'
    },
    {
        id: 'mzJo5pGlLB0', // Replace with actual video ID
        title: 'Egg white or yolk first? 🥚 Many parents are unsure about introducing eggs to their babies!',
        description: 'The right way and timing matter to ensure easy digestion and avoid allergies. Ready to make mealtime nutritious and safe for your little one? 🍳👶',
        publishedAt: '2023-12-20T11:20:00Z',
        thumbnail: 'https://img.youtube.com/vi/mzJo5pGlLB0/maxresdefault.jpg'
    },
    {
        id: 'b-UPTVfYuxA', // Replace with actual video ID
        title: 'Foods to avoid till 1 year! 🚫🍯🥛🌰🍇🍿',
        description: 'Giving certain foods before 1 year can be dangerous. Listen carefully!👶 First – Honey: Risk of botulism (a type of food poisoning).👶 Second – Cow’s Milk: Protein mismatch can cause digestion issues.👶 Third – Choking hazards: Avoid nuts, grapes, popcorn, puffed rice, etc. If giving nuts, make it into a fine paste or porridge.Feed safe foods and feed them safely! 🍼❤️',
        publishedAt: '2023-12-15T13:10:00Z',
        thumbnail: 'https://img.youtube.com/vi/b-UPTVfYuxA/maxresdefault.jpg'
    }
];

let currentVideoIndex = 0;
const VIDEOS_PER_LOAD = 3;

// DOM Elements
const loadingContainer = document.getElementById('loading');
const errorContainer = document.getElementById('error');
const videosGrid = document.getElementById('videos-grid');
const loadMoreContainer = document.querySelector('.load-more-container');
const loadMoreBtn = document.getElementById('load-more');
const videoModal = document.getElementById('video-modal');
const modalClose = document.querySelector('.modal-close');
const modalVideo = document.getElementById('modal-video');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalDate = document.getElementById('modal-date');
const modalYouTubeLink = document.getElementById('modal-youtube-link');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS animations
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100
        });
    }
    
    // Load initial videos
    loadStaticVideos();
    
    // Event listeners
    loadMoreBtn.addEventListener('click', loadMoreVideos);
    modalClose.addEventListener('click', closeModal);
    videoModal.addEventListener('click', function(e) {
        if (e.target === videoModal) {
            closeModal();
        }
    });
    
    // Keyboard navigation for modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && videoModal.classList.contains('show')) {
            closeModal();
        }
    });
});

// Load static videos (no API required)
function loadStaticVideos() {
    hideLoading();
    errorContainer.style.display = 'none';
    
    // Load initial videos
    const initialVideos = STATIC_VIDEOS.slice(0, VIDEOS_PER_LOAD);
    displayVideos(initialVideos, false);
    currentVideoIndex = VIDEOS_PER_LOAD;
    
    // Show/hide load more button
    if (currentVideoIndex < STATIC_VIDEOS.length) {
        loadMoreContainer.style.display = 'block';
    } else {
        loadMoreContainer.style.display = 'none';
    }
}

// Display videos in the grid
function displayVideos(videos, append = false) {
    if (!append) {
        videosGrid.innerHTML = '';
    }
    
    videos.forEach(video => {
        const videoCard = createVideoCard(video);
        videosGrid.appendChild(videoCard);
    });
    
    videosGrid.style.display = 'grid';
}

// Create individual video card
function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.setAttribute('data-aos', 'fade-up');
    
    const publishedDate = new Date(video.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    card.innerHTML = `
        <div class="video-thumbnail">
            <img src="${video.thumbnail}" alt="${escapeHtml(video.title)}" loading="lazy">
            <div class="play-button">
                <i class="fas fa-play"></i>
            </div>
        </div>
        <div class="video-info">
            <h3 class="video-title">${escapeHtml(video.title)}</h3>
            <p class="video-description">${escapeHtml(video.description)}</p>
            <div class="video-meta">
                <span class="video-date">
                    <i class="fas fa-calendar"></i> ${publishedDate}
                </span>
            </div>
        </div>
    `;
    
    // Add click event to open modal
    card.addEventListener('click', () => {
        openVideoModal(video);
    });
    
    return card;
}

// Open video modal
function openVideoModal(video) {
    const videoId = video.id.videoId;
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    
    modalVideo.src = embedUrl;
    modalTitle.textContent = video.snippet.title;
    modalDescription.textContent = video.snippet.description;
    
    const publishedDate = new Date(video.snippet.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    modalDate.textContent = publishedDate;
    modalYouTubeLink.href = `https://www.youtube.com/watch?v=${videoId}`;
    
    videoModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Close video modal
function closeModal() {
    videoModal.classList.remove('show');
    modalVideo.src = '';
    document.body.style.overflow = 'auto';
}

// Load more videos
function loadMoreVideos() {
    if (currentVideoIndex < STATIC_VIDEOS.length) {
        const nextVideos = STATIC_VIDEOS.slice(currentVideoIndex, currentVideoIndex + VIDEOS_PER_LOAD);
        displayVideos(nextVideos, true);
        currentVideoIndex += VIDEOS_PER_LOAD;
        
        // Hide load more button if no more videos
        if (currentVideoIndex >= STATIC_VIDEOS.length) {
            loadMoreContainer.style.display = 'none';
        }
    }
}

// Show loading state
function showLoading() {
    loadingContainer.style.display = 'block';
    errorContainer.style.display = 'none';
    if (loadMoreBtn) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    }
}

// Hide loading state
function hideLoading() {
    loadingContainer.style.display = 'none';
    if (loadMoreBtn) {
        loadMoreBtn.disabled = false;
        loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Load More Videos';
    }
}

// Show error state
function showError() {
    loadingContainer.style.display = 'none';
    errorContainer.style.display = 'block';
    videosGrid.style.display = 'none';
    loadMoreContainer.style.display = 'none';
}

// Duration formatting removed - not needed for static videos

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Fallback content function removed - not needed for static videos