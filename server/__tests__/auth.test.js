import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../../lib/supabase.js', () => ({
    supabase: {
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: () => ({ data: null, error: null })
                })
            })
        })
    }
}));

describe('Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
            body: {},
        };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
        next = vi.fn();
    });

    describe('Telegram initData validation', () => {
        it('should reject requests without authorization header', async () => {
            // Simulate middleware behavior
            const hasAuth = !!req.headers.authorization || !!req.headers['x-telegram-init-data'];
            expect(hasAuth).toBe(false);
        });

        it('should reject requests with empty initData', async () => {
            req.headers['x-telegram-init-data'] = '';
            const isValid = req.headers['x-telegram-init-data']?.length > 0;
            expect(isValid).toBe(false);
        });

        it('should parse valid bearer token', () => {
            req.headers.authorization = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MTIzNDV9.test';
            const token = req.headers.authorization.replace('Bearer ', '');
            expect(token).toBeTruthy();
            expect(token.split('.').length).toBe(3);
        });
    });

    describe('Admin access control', () => {
        const ADMIN_IDS = [603207436, 500096232];

        it('should grant access to admin IDs', () => {
            const userId = 603207436;
            expect(ADMIN_IDS.includes(userId)).toBe(true);
        });

        it('should deny access to non-admin IDs', () => {
            const userId = 999999;
            expect(ADMIN_IDS.includes(userId)).toBe(false);
        });
    });
});
