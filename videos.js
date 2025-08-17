// YouTube API Configuration
// To get a YouTube API key:
// 1. Go to https://console.developers.google.com/
// 2. Create a new project or select existing one
// 3. Enable YouTube Data API v3
// 4. Create credentials (API key)
// 5. Replace 'YOUR_API_KEY_HERE' with your actual API key
const YOUTUBE_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with actual API key
const CHANNEL_HANDLE = '@Dr.VarunPaediatrican'; // YouTube channel handle
const MAX_RESULTS = 12;

let nextPageToken = '';
let isLoading = false;

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
    loadVideos();
    
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

// Load videos from YouTube API
async function loadVideos(pageToken = '') {
    if (isLoading) return;
    
    isLoading = true;
    showLoading();
    
    try {
        // Check if API key is configured
        if (YOUTUBE_API_KEY === 'YOUR_API_KEY_HERE') {
            throw new Error('YouTube API key not configured');
        }
        
        // First get the channel ID from the handle
        const channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?key=${YOUTUBE_API_KEY}&forHandle=${CHANNEL_HANDLE}&part=id`);
        
        if (!channelResponse.ok) {
            throw new Error(`Failed to get channel ID: ${channelResponse.status}`);
        }
        
        const channelData = await channelResponse.json();
        
        if (!channelData.items || channelData.items.length === 0) {
            throw new Error('Channel not found');
        }
        
        const channelId = channelData.items[0].id;
        
        // Now get the videos from the channel
        const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${channelId}&part=snippet,id&order=date&maxResults=${MAX_RESULTS}&type=video${pageToken ? `&pageToken=${pageToken}` : ''}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            // Get video details including duration
            const videoIds = data.items.map(item => item.id.videoId).join(',');
            const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&id=${videoIds}&part=contentDetails,statistics`;
            
            const detailsResponse = await fetch(detailsUrl);
            const detailsData = await detailsResponse.json();
            
            // Combine video data with details
            const videosWithDetails = data.items.map(video => {
                const details = detailsData.items.find(detail => detail.id === video.id.videoId);
                return {
                    ...video,
                    duration: details ? details.contentDetails.duration : 'PT0S',
                    viewCount: details ? details.statistics.viewCount : '0'
                };
            });
            
            displayVideos(videosWithDetails, pageToken !== '');
            nextPageToken = data.nextPageToken || '';
            
            // Show/hide load more button
            if (nextPageToken) {
                loadMoreContainer.style.display = 'block';
            } else {
                loadMoreContainer.style.display = 'none';
            }
            
            hideLoading();
        } else {
            throw new Error('No videos found');
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        showError();
    } finally {
        isLoading = false;
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
    
    const publishedDate = new Date(video.snippet.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const duration = formatDuration(video.duration);
    const thumbnail = video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url;
    
    card.innerHTML = `
        <div class="video-thumbnail">
            <img src="${thumbnail}" alt="${escapeHtml(video.snippet.title)}" loading="lazy">
            <div class="play-button">
                <i class="fas fa-play"></i>
            </div>
        </div>
        <div class="video-info">
            <h3 class="video-title">${escapeHtml(video.snippet.title)}</h3>
            <p class="video-description">${escapeHtml(video.snippet.description)}</p>
            <div class="video-meta">
                <span class="video-date">
                    <i class="fas fa-calendar"></i> ${publishedDate}
                </span>
                <span class="video-duration">${duration}</span>
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
    if (nextPageToken && !isLoading) {
        loadVideos(nextPageToken);
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

// Format video duration from ISO 8601 to readable format
function formatDuration(duration) {
    if (!duration || duration === 'PT0S') return '0:00';
    
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';
    
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

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

// Fallback: Display static content if API fails
function displayFallbackContent() {
    videosGrid.innerHTML = `
        <div class="video-card" data-aos="fade-up">
            <div class="video-thumbnail">
                <img src="https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg" alt="Sample Video" loading="lazy">
                <div class="play-button">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <div class="video-info">
                <h3 class="video-title">Pediatric Care Tips</h3>
                <p class="video-description">Essential tips for pediatric care and child health management.</p>
                <div class="video-meta">
                    <span class="video-date">
                        <i class="fas fa-calendar"></i> Jan 15, 2025
                    </span>
                    <span class="video-duration">5:30</span>
                </div>
            </div>
        </div>
        <div class="video-card" data-aos="fade-up" data-aos-delay="100">
            <div class="video-thumbnail">
                <img src="https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg" alt="Sample Video" loading="lazy">
                <div class="play-button">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <div class="video-info">
                <h3 class="video-title">Child Nutrition Guidelines</h3>
                <p class="video-description">Comprehensive guide to proper nutrition for growing children.</p>
                <div class="video-meta">
                    <span class="video-date">
                        <i class="fas fa-calendar"></i> Jan 10, 2025
                    </span>
                    <span class="video-duration">8:45</span>
                </div>
            </div>
        </div>
        <div class="video-card" data-aos="fade-up" data-aos-delay="200">
            <div class="video-thumbnail">
                <img src="https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg" alt="Sample Video" loading="lazy">
                <div class="play-button">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <div class="video-info">
                <h3 class="video-title">Emergency Pediatric Care</h3>
                <p class="video-description">What to do in pediatric emergency situations and when to seek help.</p>
                <div class="video-meta">
                    <span class="video-date">
                        <i class="fas fa-calendar"></i> Jan 5, 2025
                    </span>
                    <span class="video-duration">12:20</span>
                </div>
            </div>
        </div>
    `;
    
    videosGrid.style.display = 'grid';
    loadingContainer.style.display = 'none';
    
    // Add click events for fallback content
    const fallbackCards = videosGrid.querySelectorAll('.video-card');
    fallbackCards.forEach(card => {
        card.addEventListener('click', () => {
            // Redirect to YouTube channel
            window.open('https://www.youtube.com/@Dr.VarunPaediatrican', '_blank');
        });
    });
}