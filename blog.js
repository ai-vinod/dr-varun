// Blog page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Category filtering
    const categoryButtons = document.querySelectorAll('.category-btn');
    const blogCards = document.querySelectorAll('.blog-card');

    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter blog cards
            blogCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.5s ease-in-out';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('a[href^="index.html#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Let the browser handle the navigation to index.html with hash
            // This will work when the user clicks on navigation links
        });
    });

    // Add fade-in animation for blog cards on load
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all blog cards
    blogCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Accessibility: Keyboard navigation for category buttons
    categoryButtons.forEach(button => {
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    // Add ARIA labels for better accessibility
    blogCards.forEach((card, index) => {
        card.setAttribute('aria-label', `Blog post ${index + 1}`);
        card.setAttribute('tabindex', '0');
    });

    // Enhanced keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Skip to main content with Alt+M
        if (e.altKey && e.key === 'm') {
            e.preventDefault();
            document.querySelector('.blog-posts').focus();
        }
    });
});

// CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .blog-card:focus {
        outline: 2px solid #2ECC71;
        outline-offset: 2px;
    }
    
    .category-btn:focus {
        outline: 2px solid #2ECC71;
        outline-offset: 2px;
    }
`;
document.head.appendChild(style);