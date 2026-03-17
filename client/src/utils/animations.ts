import { gsap } from 'gsap';

// Using GSAP only for reliable animations
// Anime.js module structure is causing TypeScript issues

// GSAP Animations
export const gsapAnimations = {
  // Hero section entrance animation
  heroEntrance: (elements: HTMLElement[]) => {
    gsap.fromTo(elements, 
      { 
        opacity: 0, 
        y: 50, 
        scale: 0.95 
      },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.2
      }
    );
  },

  // Product card hover effects
  productCardHover: (card: HTMLElement) => {
    const tl = gsap.timeline({ paused: true });
    
    tl.to(card, {
      scale: 1.05,
      y: -10,
      duration: 0.4,
      ease: "power2.out"
    })
    .to(card.querySelector('img'), {
      scale: 1.1,
      duration: 0.4,
      ease: "power2.out"
    }, 0);

    card.addEventListener('mouseenter', () => tl.play());
    card.addEventListener('mouseleave', () => tl.reverse());
  },

  // Button ripple effect
  buttonRipple: (button: HTMLElement) => {
    button.addEventListener('click', (e) => {
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple');
      
      button.appendChild(ripple);
      
      gsap.fromTo(ripple,
        { scale: 0, opacity: 1 },
        { 
          scale: 4, 
          opacity: 0, 
          duration: 0.6,
          ease: "power2.out",
          onComplete: () => ripple.remove()
        }
      );
    });
  },

  // Pulse animation for badges (GSAP version)
  pulseAnimation: (elements: NodeListOf<Element>) => {
    gsap.to(elements, {
      scale: 1.1,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
      stagger: 0.2
    });
  },

  // Floating animation (GSAP version)
  floatingAnimation: (elements: NodeListOf<Element>) => {
    gsap.to(elements, {
      y: -10,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
      stagger: 0.3
    });
  },

  // Page transition
  pageTransition: () => {
    gsap.fromTo('body',
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 0.8,
        ease: "power2.inOut"
      }
    );
  }
};

// Animation utilities using GSAP only
export const animations = {
  // Initialize all animations on page load
  init: () => {
    // GSAP animations
    gsapAnimations.pageTransition();
    
    // Pulse animations for badges
    const pulseElements = document.querySelectorAll('.pulse-element');
    if (pulseElements.length > 0) {
      gsapAnimations.pulseAnimation(pulseElements);
    }
    
    // Floating animations
    const floatingElements = document.querySelectorAll('.floating-element');
    if (floatingElements.length > 0) {
      gsapAnimations.floatingAnimation(floatingElements);
    }
    
    // Product cards hover effects
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
      gsapAnimations.productCardHover(card as HTMLElement);
    });
    
    // Button ripple effects
    const buttons = document.querySelectorAll('.ripple-button');
    buttons.forEach(button => {
      gsapAnimations.buttonRipple(button as HTMLElement);
    });
  }
};

export default animations;
