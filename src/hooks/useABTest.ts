import { useABTestContext } from '../context/ABTestContext';

export const useABTest = (experimentId: string) => {
    const { getVariant, activeVariants } = useABTestContext();

    return {
        variant: getVariant(experimentId),
        activeVariants
    };
};
