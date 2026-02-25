import React, { createContext, useContext, useMemo } from 'react';
import { useUser } from './UserContext';

/**
 * Experiment Configuration
 * bucketRange: [start, end] inclusive (0-99)
 */
export interface Experiment {
    id: string;
    variants: {
        [variantId: string]: {
            weight: number; // Percentage of users (sum should be 100)
            bucketRange: [number, number];
        };
    };
    active: boolean;
}

const EXPERIMENTS: Experiment[] = [
    {
        id: 'home_hero_text',
        active: true,
        variants: {
            'control': { weight: 50, bucketRange: [0, 49] },
            'variant_a': { weight: 50, bucketRange: [50, 99] }
        }
    },
    {
        id: 'gen_button_gradient',
        active: true,
        variants: {
            'solid': { weight: 50, bucketRange: [0, 49] },
            'glow': { weight: 50, bucketRange: [50, 99] }
        }
    }
];

interface ABTestContextType {
    bucket: number;
    getVariant: (experimentId: string) => string;
    activeVariants: Record<string, string>;
}

const ABTestContext = createContext<ABTestContextType | undefined>(undefined);

export const ABTestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useUser();

    // Stable bucket assignment based on Telegram ID
    const bucket = useMemo(() => {
        const tgId = user?.telegram_id || 0;
        if (!tgId) return 0; // Default to bucket 0 for guests
        return Number(tgId) % 100;
    }, [user]);

    const activeVariants = useMemo(() => {
        const variants: Record<string, string> = {};
        EXPERIMENTS.forEach(exp => {
            if (!exp.active) {
                variants[exp.id] = 'control';
                return;
            }
            const variantId = Object.keys(exp.variants).find(vId => {
                const range = exp.variants[vId].bucketRange;
                return bucket >= range[0] && bucket <= range[1];
            });
            variants[exp.id] = variantId || 'control';
        });
        return variants;
    }, [bucket]);

    const getVariant = (experimentId: string) => activeVariants[experimentId] || 'control';

    return (
        <ABTestContext.Provider value={{ bucket, getVariant, activeVariants }}>
            {children}
        </ABTestContext.Provider>
    );
};

export const useABTestContext = () => {
    const context = useContext(ABTestContext);
    if (!context) throw new Error('useABTestContext must be used within ABTestProvider');
    return context;
};
