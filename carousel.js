// Reviews Carousel Functionality
class ReviewsCarousel {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = this.calculateTotalSlides();
        this.autoRotateInterval = null;
        this.init();
    }

    calculateTotalSlides() {
        const cards = document.querySelectorAll('.review-card');
        const isMobile = window.innerWidth <= 768;
        return isMobile ? cards.length : Math.ceil(cards.length / 2);
    }

    init() {
        this.setupEventListeners();
        this.startAutoRotate();
        this.updateCarousel();
    }

    setupEventListeners() {
        // Navigation buttons
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevSlide());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // Indicator dots
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // Pause auto-rotate on hover
        const carousel = document.querySelector('.reviews-carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', () => this.stopAutoRotate());
            carousel.addEventListener('mouseleave', () => this.startAutoRotate());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.totalSlides = this.calculateTotalSlides();
            // Reset to first slide if current slide is out of bounds
            if (this.currentSlide >= this.totalSlides) {
                this.currentSlide = 0;
            }
            this.updateCarousel();
        });
    }

    updateCarousel() {
        const container = document.querySelector('.reviews-container');
        const indicators = document.querySelectorAll('.indicator');
        const cards = document.querySelectorAll('.review-card');

        if (container) {
            // Check if we're on mobile (768px or less)
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile) {
                // Mobile: show one review at a time using percentage
                const offset = -(this.currentSlide * 100);
                container.style.transform = `translateX(${offset}%)`;
            } else {
                // Desktop: show two reviews at a time
                const cardWidth = 400; // min-width + gap
                const gap = 32; // 2rem = 32px
                const offset = -(this.currentSlide * 2 * (cardWidth + gap));
                container.style.transform = `translateX(${offset}px)`;
            }
        }

        // Update active states
        cards.forEach((card, index) => {
            const isMobile = window.innerWidth <= 768;
            const isActive = isMobile ? 
                index === this.currentSlide : 
                (index === this.currentSlide * 2 || index === this.currentSlide * 2 + 1);
            card.classList.toggle('active', isActive);
        });

        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });

        // Update button states
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentSlide === 0;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
        }
    }

    nextSlide() {
        // Recalculate total slides in case of screen size change
        this.totalSlides = this.calculateTotalSlides();
        
        if (this.currentSlide < this.totalSlides - 1) {
            this.currentSlide++;
        } else {
            this.currentSlide = 0; // Loop back to first slide
        }
        this.updateCarousel();
        this.resetAutoRotate();
    }

    prevSlide() {
        // Recalculate total slides in case of screen size change
        this.totalSlides = this.calculateTotalSlides();
        
        if (this.currentSlide > 0) {
            this.currentSlide--;
        } else {
            this.currentSlide = this.totalSlides - 1; // Loop to last slide
        }
        this.updateCarousel();
        this.resetAutoRotate();
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.updateCarousel();
        this.resetAutoRotate();
    }

    startAutoRotate() {
        this.autoRotateInterval = setInterval(() => {
            this.nextSlide();
        }, 3000); // Rotate every 3 seconds
    }

    stopAutoRotate() {
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
        }
    }

    resetAutoRotate() {
        this.stopAutoRotate();
        this.startAutoRotate();
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ReviewsCarousel();
});

// Handle visibility change to pause/resume auto-rotation
document.addEventListener('visibilitychange', () => {
    const carousel = window.reviewsCarousel;
    if (carousel) {
        if (document.hidden) {
            carousel.stopAutoRotate();
        } else {
            carousel.startAutoRotate();
        }
    }
});