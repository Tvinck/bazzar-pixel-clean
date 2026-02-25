import { useEffect, useRef, MutableRefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

/**
 * GSAP-powered advanced animations
 * For complex, timeline-based animations
 */

// ========================================
// GSAP ANIMATION UTILITIES
// ========================================

/**
 * Magnetic button effect (like Telegram premium buttons)
 */
export const useMagneticButton = (strength: number = 0.3): MutableRefObject<HTMLElement | null> => {
    const buttonRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const button = buttonRef.current;
        if (!button) return;

        const handleMouseMove = (e: MouseEvent) => {
            const { left, top, width, height } = button.getBoundingClientRect();
            const centerX = left + width / 2;
            const centerY = top + height / 2;

            const deltaX = (e.clientX - centerX) * strength;
            const deltaY = (e.clientY - centerY) * strength;

            gsap.to(button, {
                x: deltaX,
                y: deltaY,
                duration: 0.3,
                ease: 'power2.out'
            });
        };

        const handleMouseLeave = () => {
            gsap.to(button, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
            });
        };

        button.addEventListener('mousemove', handleMouseMove);
        button.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            button.removeEventListener('mousemove', handleMouseMove);
            button.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [strength]);

    return buttonRef;
};

/**
 * Stagger animation for lists (like Telegram chat messages)
 */
export const useStaggerAnimation = (items: any[], delay: number = 0.1): MutableRefObject<HTMLElement | null> => {
    const containerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const children = containerRef.current.children;

        gsap.fromTo(
            children,
            {
                opacity: 0,
                y: 30,
                scale: 0.9
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.5,
                stagger: delay,
                ease: 'power3.out'
            }
        );
    }, [items, delay]);

    return containerRef;
};

/**
 * Parallax scroll effect
 */
export const useParallaxScroll = (speed: number = 0.5): MutableRefObject<HTMLElement | null> => {
    const elementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        gsap.to(elementRef.current, {
            yPercent: -50 * speed,
            ease: 'none',
            scrollTrigger: {
                trigger: elementRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    }, [speed]);

    return elementRef;
};

/**
 * Text reveal animation (like Telegram typing)
 */
export const useTextReveal = (text: string, duration: number = 1): MutableRefObject<HTMLElement | null> => {
    const textRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!textRef.current || !text) return;

        const chars = text.split('');
        textRef.current.innerHTML = chars
            .map((char) => `<span class="inline-block opacity-0">${char === ' ' ? '&nbsp;' : char}</span>`)
            .join('');

        const spans = textRef.current.querySelectorAll('span');

        gsap.to(spans, {
            opacity: 1,
            y: 0,
            duration: 0.05,
            stagger: duration / chars.length,
            ease: 'power2.out'
        });
    }, [text, duration]);

    return textRef;
};

/**
 * Morphing shape animation
 */
export const useMorphAnimation = () => {
    const shapeRef = useRef<SVGPathElement | null>(null);

    const morph = (path: string) => {
        if (!shapeRef.current) return;

        gsap.to(shapeRef.current, {
            attr: { d: path },
            duration: 0.8,
            ease: 'power2.inOut'
        });
    };

    return { shapeRef, morph };
};

/**
 * Liquid button effect
 */
export const useLiquidButton = () => {
    const buttonRef = useRef<HTMLElement | null>(null);
    const liquidRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const button = buttonRef.current;
        const liquid = liquidRef.current;
        if (!button || !liquid) return;

        const handleMouseEnter = () => {
            gsap.to(liquid, {
                scale: 1,
                duration: 0.6,
                ease: 'elastic.out(1, 0.3)'
            });
        };

        const handleMouseLeave = () => {
            gsap.to(liquid, {
                scale: 0,
                duration: 0.4,
                ease: 'power2.in'
            });
        };

        button.addEventListener('mouseenter', handleMouseEnter);
        button.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            button.removeEventListener('mouseenter', handleMouseEnter);
            button.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return { buttonRef, liquidRef };
};

/**
 * Glitch effect
 */
export const useGlitchEffect = (trigger: boolean = false): MutableRefObject<HTMLElement | null> => {
    const elementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!elementRef.current || !trigger) return;

        const tl = gsap.timeline();

        tl.to(elementRef.current, {
            x: -5,
            duration: 0.05,
            repeat: 3,
            yoyo: true
        })
            .to(elementRef.current, {
                x: 5,
                duration: 0.05,
                repeat: 3,
                yoyo: true
            })
            .to(elementRef.current, {
                x: 0,
                duration: 0.05
            });
    }, [trigger]);

    return elementRef;
};

/**
 * Elastic scale animation
 */
export const useElasticScale = (isActive: boolean): MutableRefObject<HTMLElement | null> => {
    const elementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        gsap.to(elementRef.current, {
            scale: isActive ? 1.1 : 1,
            duration: 0.6,
            ease: 'elastic.out(1, 0.3)'
        });
    }, [isActive]);

    return elementRef;
};

/**
 * Floating animation
 */
export const useFloatingAnimation = (distance: number = 10, duration: number = 2): MutableRefObject<HTMLElement | null> => {
    const elementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        gsap.to(elementRef.current, {
            y: distance,
            duration: duration,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }, [distance, duration]);

    return elementRef;
};

/**
 * Pulse animation
 */
export const usePulseAnimation = (scale: number = 1.05, duration: number = 1): MutableRefObject<HTMLElement | null> => {
    const elementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        gsap.to(elementRef.current, {
            scale: scale,
            duration: duration,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }, [scale, duration]);

    return elementRef;
};

/**
 * Rotate animation
 */
export const useRotateAnimation = (degrees: number = 360, duration: number = 2): MutableRefObject<HTMLElement | null> => {
    const elementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        gsap.to(elementRef.current, {
            rotation: degrees,
            duration: duration,
            repeat: -1,
            ease: 'linear'
        });
    }, [degrees, duration]);

    return elementRef;
};

/**
 * Fade in on scroll
 */
export const useFadeInScroll = (threshold: number = 0.5): MutableRefObject<HTMLElement | null> => {
    const elementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        gsap.fromTo(
            elementRef.current,
            {
                opacity: 0,
                y: 50
            },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: elementRef.current,
                    start: `top ${threshold * 100}%`,
                    toggleActions: 'play none none reverse'
                }
            }
        );
    }, [threshold]);

    return elementRef;
};

// ========================================
// TIMELINE ANIMATIONS
// ========================================

/**
 * Create success animation timeline
 */
export const createSuccessAnimation = (element: HTMLElement) => {
    const tl = gsap.timeline();

    tl.to(element, {
        scale: 1.2,
        duration: 0.2,
        ease: 'power2.out'
    })
        .to(element, {
            scale: 1,
            duration: 0.3,
            ease: 'elastic.out(1, 0.3)'
        })
        .to(element, {
            rotation: 360,
            duration: 0.5,
            ease: 'power2.inOut'
        }, '-=0.3');

    return tl;
};

/**
 * Create loading animation timeline
 */
export const createLoadingAnimation = (elements: HTMLElement[] | NodeList) => {
    const tl = gsap.timeline({ repeat: -1 });

    tl.to(elements, {
        opacity: 0.3,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power1.inOut'
    })
        .to(elements, {
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power1.inOut'
        });

    return tl;
};

/**
 * Create card flip animation
 */
export const createCardFlip = (element: HTMLElement, duration: number = 0.6) => {
    const tl = gsap.timeline();

    tl.to(element, {
        rotationY: 90,
        duration: duration / 2,
        ease: 'power2.in'
    })
        .to(element, {
            rotationY: 0,
            duration: duration / 2,
            ease: 'power2.out'
        });

    return tl;
};

const animations = {
    useMagneticButton,
    useStaggerAnimation,
    useParallaxScroll,
    useTextReveal,
    useMorphAnimation,
    useLiquidButton,
    useGlitchEffect,
    useElasticScale,
    useFloatingAnimation,
    usePulseAnimation,
    useRotateAnimation,
    useFadeInScroll,
    createSuccessAnimation,
    createLoadingAnimation,
    createCardFlip
};

export default animations;
