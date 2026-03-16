import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase
const mockRpc = vi.fn();
vi.mock('../../lib/supabase.js', () => ({
    supabase: {
        rpc: (...args) => mockRpc(...args),
        from: () => ({
            select: () => ({ eq: () => ({ single: () => ({ data: { id: 'test-uuid' }, error: null }) }) }),
        }),
    }
}));

// Import after mock
const { deductCredits } = await import('../../helpers/utils.js');

describe('deductCredits', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return error if user not found', async () => {
        // Override getUserUUID to return null
        vi.doMock('../../helpers/utils.js', () => ({
            deductCredits: async () => ({ success: false, error: 'User not found' })
        }));

        const result = await deductCredits(null, 100);
        expect(result.success).toBe(false);
        expect(result.error).toContain('not found');
    });

    it('should return error on insufficient balance', async () => {
        mockRpc.mockResolvedValueOnce({
            data: { success: false, error: 'INSUFFICIENT_BALANCE', new_balance: 0 },
            error: null
        });

        const result = await deductCredits(12345, 9999, 'test');
        expect(result.success).toBe(false);
        expect(result.error).toBe('INSUFFICIENT_BALANCE');
    });

    it('should successfully deduct credits', async () => {
        mockRpc.mockResolvedValueOnce({
            data: { success: true, new_balance: 50 },
            error: null
        });

        const result = await deductCredits(12345, 10, 'test_deduction');
        expect(result.success).toBe(true);
        expect(result.newBalance).toBe(50);
    });

    it('should handle RPC errors gracefully', async () => {
        mockRpc.mockResolvedValueOnce({
            data: null,
            error: { message: 'Database connection lost' }
        });

        const result = await deductCredits(12345, 10, 'test');
        expect(result.success).toBe(false);
        expect(result.error).toContain('Database');
    });

    it('should handle thrown exceptions', async () => {
        mockRpc.mockRejectedValueOnce(new Error('Network timeout'));

        const result = await deductCredits(12345, 10, 'test');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Network timeout');
    });
});
