/**
 * Responsive Design Utilities
 * Provides mobile-first responsive design helpers and breakpoints
 */

// Breakpoint definitions (mobile-first)
export const BREAKPOINTS = {
  sm: 640,   // Small devices (phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (desktops)
  xl: 1280,  // Extra large devices
  '2xl': 1536 // 2x large devices
};

// Media query helpers
export const mediaQueries = {
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,
  '2xl': `(min-width: ${BREAKPOINTS['2xl']}px)`
};

// Touch-friendly sizing
export const TOUCH_TARGETS = {
  minimum: 44, // Minimum touch target size (Apple HIG)
  small: 48,
  medium: 56,
  large: 64
};

// Spacing scale (mobile-first)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48
};

// Typography scale (mobile-first)
export const TYPOGRAPHY = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60
};

// Color accessibility helpers
export const ACCESSIBILITY = {
  // WCAG AA contrast ratio minimums
  normalText: 4.5,
  largeText: 3.0,
  uiComponents: 3.0,
  
  // High contrast mode detection
  isHighContrast: () => {
    if (typeof window === 'undefined') return false;
    
    // Check for high contrast mode
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    return mediaQuery.matches;
  },
  
  // Reduced motion preference
  prefersReducedMotion: () => {
    if (typeof window === 'undefined') return false;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    return mediaQuery.matches;
  }
};

// Gesture detection
export const GESTURES = {
  // Swipe detection
  detectSwipe: (element, callback) => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    };
    
    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;
      const threshold = 50; // Minimum swipe distance
      
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > threshold) {
          callback(diffX > 0 ? 'left' : 'right');
        }
      } else {
        if (Math.abs(diffY) > threshold) {
          callback(diffY > 0 ? 'up' : 'down');
        }
      }
    };
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  },
  
  // Long press detection
  detectLongPress: (element, duration = 500, callback) => {
    let pressTimer;
    
    const handleMouseDown = () => {
      pressTimer = setTimeout(() => {
        callback();
      }, duration);
    };
    
    const handleMouseUp = () => {
      clearTimeout(pressTimer);
    };
    
    const handleTouchStart = () => {
      pressTimer = setTimeout(() => {
        callback();
      }, duration);
    };
    
    const handleTouchEnd = () => {
      clearTimeout(pressTimer);
    };
    
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }
};

// Screen size detection
export const SCREEN_SIZE = {
  isMobile: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < BREAKPOINTS.md;
  },
  
  isTablet: () => {
    if (typeof window === 'undefined') return false;
    const width = window.innerWidth;
    return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
  },
  
  isDesktop: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= BREAKPOINTS.lg;
  },
  
  getDeviceType: () => {
    if (SCREEN_SIZE.isMobile()) return 'mobile';
    if (SCREEN_SIZE.isTablet()) return 'tablet';
    return 'desktop';
  }
};

// Orientation detection
export const ORIENTATION = {
  isPortrait: () => {
    if (typeof window === 'undefined') return true;
    return window.innerHeight > window.innerWidth;
  },
  
  isLandscape: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth > window.innerHeight;
  }
};

// Performance helpers for mobile
export const PERFORMANCE = {
  // Debounce function for scroll/resize events
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Throttle function for high-frequency events
  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // Lazy load images
  lazyLoadImages: () => {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });
      
      document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }
};

// Accessibility helpers
export const A11Y = {
  // Focus management
  trapFocus: (container) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  },
  
  // Screen reader announcements
  announce: (message, priority = 'polite') => {
    if (typeof document === 'undefined') return;
    
    let announcer = document.getElementById('screen-reader-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'screen-reader-announcer';
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);
    }
    
    announcer.textContent = message;
  },
  
  // Skip link functionality
  addSkipLink: (targetId, text = 'Skip to main content') => {
    if (typeof document === 'undefined') return;
    
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = text;
    skipLink.className = 'skip-link';
    skipLink.style.position = 'absolute';
    skipLink.style.left = '-9999px';
    skipLink.style.top = 'auto';
    skipLink.style.width = '1px';
    skipLink.style.height = '1px';
    skipLink.style.overflow = 'hidden';
    skipLink.style.zIndex = '9999';
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.left = '10px';
      skipLink.style.width = 'auto';
      skipLink.style.height = 'auto';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.left = '-9999px';
      skipLink.style.width = '1px';
      skipLink.style.height = '1px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
  }
};

// Export default responsive config
export const RESPONSIVE_CONFIG = {
  breakpoints: BREAKPOINTS,
  mediaQueries,
  touchTargets: TOUCH_TARGETS,
  spacing: SPACING,
  typography: TYPOGRAPHY,
  accessibility: ACCESSIBILITY,
  gestures: GESTURES,
  screenSize: SCREEN_SIZE,
  orientation: ORIENTATION,
  performance: PERFORMANCE,
  a11y: A11Y
};

export default RESPONSIVE_CONFIG;