/**
 * Hidol 追星生活新聞專題網站 - JavaScript Utilities
 */

// =============================================================================
// Time Formatting Utilities
// =============================================================================

/**
 * Format time ago based on minutes
 * - Under 60 minutes: show as "X mins"
 * - 60 minutes and above: show as "X hr"
 * - 24 hours and above: show as "X 天前"
 * @param {number} minutesAgo - The number of minutes since the event
 * @returns {string} Formatted time string
 */
function formatTimeAgo(minutesAgo) {
  if (minutesAgo < 60) {
    return `${minutesAgo} mins`;
  } else if (minutesAgo < 1440) { // Less than 24 hours
    const hours = Math.floor(minutesAgo / 60);
    return `${hours} hr`;
  } else {
    const days = Math.floor(minutesAgo / 1440);
    return `${days} 天前`;
  }
}

/**
 * Calculate minutes ago from a timestamp
 * @param {Date|string} timestamp - The event timestamp
 * @returns {number} Minutes since the event
 */
function getMinutesAgo(timestamp) {
  const now = new Date();
  const eventTime = new Date(timestamp);
  const diffMs = now - eventTime;
  return Math.floor(diffMs / 60000);
}

/**
 * Update all time displays on the page
 */
function updateAllTimeDisplays() {
  const timeElements = document.querySelectorAll('[data-timestamp]');
  timeElements.forEach(el => {
    const timestamp = el.getAttribute('data-timestamp');
    const minutesAgo = getMinutesAgo(timestamp);
    el.textContent = formatTimeAgo(minutesAgo);
  });
}

// =============================================================================
// Floating Sidebar Behavior
// =============================================================================

/**
 * Initialize the floating sidebar scroll behavior
 */
function initFloatingSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  const header = document.querySelector('.header');
  const headerHeight = header ? header.offsetHeight : 64;
  
  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateSidebar() {
    const scrollY = window.scrollY;
    
    // Add shadow when scrolled
    if (scrollY > 100) {
      sidebar.classList.add('sidebar--scrolled');
    } else {
      sidebar.classList.remove('sidebar--scrolled');
    }
    
    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateSidebar);
      ticking = true;
    }
  });
}

// =============================================================================
// Image Lazy Loading
// =============================================================================

/**
 * Initialize lazy loading for images
 */
function initLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
          }
          
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.getAttribute('data-src');
      img.removeAttribute('data-src');
    });
  }
}

// =============================================================================
// Share Functionality
// =============================================================================

/**
 * Share the current page
 * @param {string} platform - The platform to share to (twitter, facebook, line, copy)
 */
function sharePage(platform) {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);
  
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    line: `https://social-plugins.line.me/lineit/share?url=${url}`,
  };

  if (platform === 'copy') {
    copyToClipboard(window.location.href);
    showToast('已複製連結！');
    return;
  }

  if (shareUrls[platform]) {
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

/**
 * Show a toast notification
 * @param {string} message - The message to show
 */
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #ff6b9d 0%, #b968ff 100%);
    color: white;
    padding: 12px 24px;
    border-radius: 50px;
    font-size: 14px;
    font-weight: 500;
    z-index: 9999;
    animation: fadeInUp 0.3s ease forwards;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// =============================================================================
// Bookmark/Save Functionality
// =============================================================================

/**
 * Toggle bookmark status
 * @param {string} articleId - The article identifier
 */
function toggleBookmark(articleId) {
  const bookmarks = JSON.parse(localStorage.getItem('hidol_bookmarks') || '[]');
  const btn = document.querySelector(`[data-bookmark="${articleId}"]`);
  
  const index = bookmarks.indexOf(articleId);
  if (index > -1) {
    bookmarks.splice(index, 1);
    if (btn) btn.classList.remove('active');
    showToast('已取消收藏');
  } else {
    bookmarks.push(articleId);
    if (btn) btn.classList.add('active');
    showToast('已加入收藏');
  }
  
  localStorage.setItem('hidol_bookmarks', JSON.stringify(bookmarks));
}

/**
 * Check and restore bookmark states
 */
function restoreBookmarkStates() {
  const bookmarks = JSON.parse(localStorage.getItem('hidol_bookmarks') || '[]');
  bookmarks.forEach(articleId => {
    const btn = document.querySelector(`[data-bookmark="${articleId}"]`);
    if (btn) btn.classList.add('active');
  });
}

// =============================================================================
// Moment Card Interactions
// =============================================================================

/**
 * Handle Moment card click - navigate to source
 * @param {string} momentUrl - The URL to the original Moment
 */
function openMoment(momentUrl) {
  // In production, this would open the actual Moment
  // For demo, show a toast
  showToast('將前往 Hidol 查看完整 Moment');
  
  // Uncomment for production:
  // window.open(momentUrl, '_blank');
}

/**
 * Initialize Moment card interactions
 */
function initMomentCards() {
  const cards = document.querySelectorAll('.moment-card');
  
  cards.forEach(card => {
    card.addEventListener('click', function(e) {
      const url = this.getAttribute('data-moment-url');
      if (url) {
        openMoment(url);
      }
    });
    
    // Add hover effect sound (optional)
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-4px)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });
}

// =============================================================================
// Smooth Scroll
// =============================================================================

/**
 * Scroll to an element smoothly
 * @param {string} selector - CSS selector for the target element
 */
function scrollToElement(selector) {
  const element = document.querySelector(selector);
  if (element) {
    const headerHeight = document.querySelector('.header')?.offsetHeight || 64;
    const targetPosition = element.offsetTop - headerHeight - 20;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
}

// =============================================================================
// Animation on Scroll
// =============================================================================

/**
 * Initialize scroll-triggered animations
 */
function initScrollAnimations() {
  if ('IntersectionObserver' in window) {
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          animationObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      el.style.opacity = '0';
      animationObserver.observe(el);
    });
  }
}

// =============================================================================
// Mobile Menu
// =============================================================================

/**
 * Toggle mobile navigation menu
 */
function toggleMobileMenu() {
  const nav = document.querySelector('.header__nav');
  const menuBtn = document.querySelector('.header__menu-btn');
  
  if (nav) {
    nav.classList.toggle('header__nav--open');
    menuBtn?.classList.toggle('active');
  }
}

// =============================================================================
// Sample Data for Demo
// =============================================================================

const sampleMoments = [
  {
    id: 1,
    tag: '追星紀錄',
    tagType: 'record',
    image: 'https://picsum.photos/400/500?random=1',
    title: '第一次去韓國遇見JOGAMA',
    username: 'stem9m77',
    likes: 1,
    minutesAgo: 35,
    url: 'https://hidol.app/moment/1'
  },
  {
    id: 2,
    tag: '追星紀錄',
    tagType: 'record',
    image: 'https://picsum.photos/400/500?random=2',
    title: '一眼就愛上這顆豆芙的無辜表情，像極了我 Monday Blue 的樣子（苦笑）😢...',
    username: 'stem9m77',
    likes: 1,
    minutesAgo: 120,
    url: 'https://hidol.app/moment/2'
  },
  {
    id: 3,
    tag: '聖地巡禮',
    tagType: 'pilgrimage',
    image: 'https://picsum.photos/400/500?random=3',
    title: '第一次去韓國遇見JOGAMA',
    username: 'stem9m77',
    likes: 1,
    minutesAgo: 180,
    url: 'https://hidol.app/moment/3'
  },
  {
    id: 4,
    tag: '聖地巡禮',
    tagType: 'pilgrimage',
    image: 'https://picsum.photos/400/500?random=4',
    title: '第一次去韓國遇見JOGAMA',
    username: 'stem9m77',
    likes: 1,
    minutesAgo: 0,
    url: 'https://hidol.app/moment/4'
  },
  {
    id: 5,
    tag: '演唱會OOTD',
    tagType: 'concert',
    image: 'https://picsum.photos/400/500?random=5',
    title: 'BLACKPINK BORN PINK 演唱會穿搭分享 ✨',
    username: 'blink_tw',
    likes: 28,
    minutesAgo: 45,
    url: 'https://hidol.app/moment/5'
  },
  {
    id: 6,
    tag: '演唱會OOTD',
    tagType: 'concert',
    image: 'https://picsum.photos/400/500?random=6',
    title: '粉墨女孩們太美了！我的全黑穿搭',
    username: 'jennie_lover',
    likes: 15,
    minutesAgo: 90,
    url: 'https://hidol.app/moment/6'
  }
];

/**
 * Render Moment cards dynamically
 * @param {HTMLElement} container - The container to render cards into
 * @param {Array} moments - Array of moment data
 */
function renderMomentCards(container, moments) {
  if (!container) return;
  
  container.innerHTML = moments.map(moment => `
    <article class="moment-card" data-moment-url="${moment.url}">
      <span class="moment-card__tag moment-card__tag--${moment.tagType}">${moment.tag}</span>
      <div class="moment-card__image-wrapper">
        <img class="moment-card__image" src="${moment.image}" alt="${moment.title}" loading="lazy">
        <div class="moment-card__overlay">
          <div class="moment-card__title-wrapper">
            <h3 class="moment-card__title">${moment.title}</h3>
          </div>
        </div>
      </div>
      <div class="moment-card__footer">
        <div class="moment-card__user">
          <span class="moment-card__avatar">👤</span>
          <span class="moment-card__username">${moment.username}</span>
        </div>
        <div class="moment-card__meta">
          <span class="moment-card__likes">
            <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            ${moment.likes}
          </span>
          <span class="moment-card__time" data-minutes="${moment.minutesAgo}">${formatTimeAgo(moment.minutesAgo)}</span>
        </div>
      </div>
    </article>
  `).join('');
  
  // Re-initialize card interactions
  initMomentCards();
}

// =============================================================================
// Initialization
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all features
  initFloatingSidebar();
  initLazyLoading();
  initMomentCards();
  initScrollAnimations();
  restoreBookmarkStates();
  
  // Update time displays every minute
  updateAllTimeDisplays();
  setInterval(updateAllTimeDisplays, 60000);
  
  // Render demo Moment cards if container exists
  const momentsContainer = document.querySelector('.moments-grid');
  if (momentsContainer && momentsContainer.children.length === 0) {
    renderMomentCards(momentsContainer, sampleMoments);
  }
  
  console.log('✨ Hidol 追星生活專題網站 initialized');
});

// Add CSS for fadeOut animation dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; transform: translateX(-50%) translateY(0); }
    to { opacity: 0; transform: translateX(-50%) translateY(10px); }
  }
`;
document.head.appendChild(style);
