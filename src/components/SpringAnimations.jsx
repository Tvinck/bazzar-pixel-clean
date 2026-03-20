import { useSpring, config, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { useState, useEffect } from 'react';

/**
 * React Spring physics-based animations
 * For natural, spring-based motion
 */

// ========================================
// SPRING ANIMATION COMPONENTS
// ========================================

/**
 * Bouncy Card with spring physics
 */
export const SpringCard = ({ children, onClick, className = '' }) => {
    const [isHovered, setIsHovered] = useState(false);

    const springProps = useSpring({
        scale: isHovered ? 1.05 : 1,
        rotateZ: isHovered ? 2 : 0,
        config: config.wobbly
    });

    return (
        <animated.div
            style={springProps}
            className={className}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            {children}
        </animated.div>
    );
};

/**
 * Draggable Card with spring physics
 */
export const DraggableCard = ({ children, onDismiss, className = '' }) => {
    const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }));

    const bind = useDrag(({ down, movement: [mx, my] }) => {
        api.start({
            x: down ? mx : 0,
            y: down ? my : 0,
            immediate: down,
            config: config.stiff
        });

        // Dismiss if dragged far enough
        if (!down && Math.abs(mx) > 200) {
            onDismiss?.();
        }
    });

    return (
        <animated.div
            {...bind()}
            style={{ x, y, touchAction: 'none' }}
            className={className}
        >
            {children}
        </animated.div>
    );
};

/**
 * Elastic Button with spring feedback
 */
export const ElasticButton = ({ children, onClick, className = '' }) => {
    const [isPressed, setIsPressed] = useState(false);

    const springProps = useSpring({
        scale: isPressed ? 0.9 : 1,
        config: config.wobbly
    });

    return (
        <animated.button
            style={springProps}
            className={className}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            onClick={onClick}
        >
            {children}
        </animated.button>
    );
};

/**
 * Number counter with spring animation
 */
export const SpringCounter = ({ value, className = '' }) => {
    const { number } = useSpring({
        from: { number: 0 },
        number: value,
        config: config.molasses
    });

    return (
        <animated.span className={className}>
            {number.to((n) => Math.floor(n).toLocaleString())}
        </animated.span>
    );
};

/**
 * Progress bar with spring animation
 */
export const SpringProgress = ({ progress, className = '' }) => {
    const springProps = useSpring({
        width: `${progress}%`,
        config: config.slow
    });

    return (
        <div className={`w-full h-2 bg-white/10 rounded-full overflow-hidden ${className}`}>
            <animated.div
                style={springProps}
                className="h-full bg-accent-blue rounded-full"
            />
        </div>
    );
};

/**
 * Floating element with spring physics
 */
export const FloatingElement = ({ children, className = '' }) => {
    const springProps = useSpring({
        from: { y: 0 },
        to: async (next) => {
            while (true) {
                await next({ y: -10 });
                await next({ y: 0 });
            }
        },
        config: { duration: 2000 }
    });

    return (
        <animated.div style={springProps} className={className}>
            {children}
        </animated.div>
    );
};

/**
 * Pulsing dot indicator
 */
export const PulsingDot = ({ color = '#3390ec', size = 12, className = '' }) => {
    const springProps = useSpring({
        from: { scale: 1, opacity: 1 },
        to: async (next) => {
            while (true) {
                await next({ scale: 1.3, opacity: 0.5 });
                await next({ scale: 1, opacity: 1 });
            }
        },
        config: config.molasses
    });

    return (
        <animated.div
            style={{
                ...springProps,
                width: size,
                height: size,
                backgroundColor: color,
                borderRadius: '50%'
            }}
            className={className}
        />
    );
};

/**
 * Shake animation for errors
 */
export const ShakeElement = ({ trigger, children, className = '' }) => {
    const springProps = useSpring({
        from: { x: 0 },
        to: trigger
            ? [
                { x: -10 },
                { x: 10 },
                { x: -10 },
                { x: 10 },
                { x: 0 }
            ]
            : { x: 0 },
        config: config.wobbly
    });

    return (
        <animated.div style={springProps} className={className}>
            {children}
        </animated.div>
    );
};

/**
 * Accordion with spring animation
 */
export const SpringAccordion = ({ isOpen, children, className = '' }) => {
    const springProps = useSpring({
        height: isOpen ? 'auto' : 0,
        opacity: isOpen ? 1 : 0,
        config: config.gentle
    });

    return (
        <animated.div style={springProps} className={`overflow-hidden ${className}`}>
            {children}
        </animated.div>
    );
};

/**
 * Flip card with spring physics
 */
export const FlipCard = ({ front, back, className = '' }) => {
    const [flipped, setFlipped] = useState(false);

    const { transform, opacity } = useSpring({
        opacity: flipped ? 1 : 0,
        transform: `perspective(600px) rotateY(${flipped ? 180 : 0}deg)`,
        config: config.slow
    });

    return (
        <div className={`relative ${className}`} onClick={() => setFlipped(!flipped)}>
            <animated.div
                style={{
                    opacity: opacity.to((o) => 1 - o),
                    transform
                }}
                className="absolute inset-0"
            >
                {front}
            </animated.div>
            <animated.div
                style={{
                    opacity,
                    transform: transform.to((t) => `${t} rotateY(180deg)`)
                }}
                className="absolute inset-0"
            >
                {back}
            </animated.div>
        </div>
    );
};

/**
 * Slide in notification
 */
export const SlideNotification = ({ isVisible, children, className = '' }) => {
    const springProps = useSpring({
        transform: isVisible ? 'translateY(0%)' : 'translateY(-150%)',
        opacity: isVisible ? 1 : 0,
        config: config.wobbly
    });

    return (
        <animated.div
            style={springProps}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 ${className}`}
        >
            {children}
        </animated.div>
    );
};

/**
 * Morphing blob background
 */
export const MorphingBlob = ({ className = '' }) => {
    const springProps = useSpring({
        from: { borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' },
        to: async (next) => {
            while (true) {
                await next({ borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%' });
                await next({ borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' });
            }
        },
        config: { duration: 3000 }
    });

    return (
        <animated.div
            style={springProps}
            className={`w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-600 ${className}`}
        />
    );
};

/**
 * Parallax scroll effect
 */
export const ParallaxScroll = ({ children, speed = 0.5, className = '' }) => {
    const [scrollY, setScrollY] = useState(0);

    const springProps = useSpring({
        transform: `translateY(${scrollY * speed}px)`,
        config: config.slow
    });

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <animated.div style={springProps} className={className}>
            {children}
        </animated.div>
    );
};

export default {
    SpringCard,
    DraggableCard,
    ElasticButton,
    SpringCounter,
    SpringProgress,
    FloatingElement,
    PulsingDot,
    ShakeElement,
    SpringAccordion,
    FlipCard,
    SlideNotification,
    MorphingBlob,
    ParallaxScroll
};
