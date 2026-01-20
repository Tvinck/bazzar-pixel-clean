import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
    test.beforeEach(async ({ page }) => {
        // Mock Telegram WebApp and LocalStorage for Onboarding
        await page.addInitScript(() => {
            window.localStorage.setItem('pixel_onboarding_complete', 'true');
            window.localStorage.setItem('onboardingSeen', 'true');

            // Mock Telegram WebApp
            window.Telegram = {
                WebApp: {
                    initDataUnsafe: {
                        user: {
                            id: 123456789,
                            username: 'test_user',
                            first_name: 'Test',
                            last_name: 'User'
                        }
                    },
                    ready: () => { },
                    expand: () => { },
                    HapticFeedback: {
                        impactOccurred: () => { },
                        notificationOccurred: () => { },
                        selectionChanged: () => { }
                    },
                    colorScheme: 'light',
                    onEvent: () => { },
                    offEvent: () => { },
                    sendData: () => { },
                }
            };
        });

        await page.goto('/');
    });

    test('should display the main title', async ({ page }) => {
        // Check for the "PIXEL" title in header
        await expect(page.getByText('PIXEL', { exact: true })).toBeVisible();
        await expect(page.getByText('Vision', { exact: true })).toBeVisible();
    });

    test('should display bottom navigation', async ({ page }) => {
        // Check for navigation items
        await expect(page.getByText('Home')).toBeVisible();
        await expect(page.getByText('Gallery')).toBeVisible();
        await expect(page.getByText('History')).toBeVisible();
        await expect(page.getByText('Profile')).toBeVisible();
    });

    test('should allow navigation to Gallery', async ({ page }) => {
        await page.getByText('Gallery').click();
        // Check if URL changes or content updates (Gallery title)
        // Since it's client-side routing or state, URL might not change if hash router isn't used, 
        // but the content "Gallery" header should appear.
        await expect(page.getByRole('heading', { name: 'Gallery' })).toBeVisible();
    });

    test('should open Creation Drawer', async ({ page }) => {
        // Click the plus button (center)
        // It's a bit hard to select by text, so we use the icon or a specific class/attribute if available.
        // We can select by the accessible role if the button has "PlusCircle" or similar.
        // Or we can use a locator for the middle button.

        // The button has PlusCircle inside.
        // Let's rely on the aria-label if we added one, or just the 3rd button in nav?
        // It's the button with the gradient background.

        // Let's add test-id to App.jsx later for robustness. For now, try finding by SVG logic or structure.
        // The button is inside the nav, roughly the middle one.

        // Easier: click the element that contains the PlusCircle icon.
        // Or just look for the button with the gradient classes.
        const createButton = page.locator('button').filter({ has: page.locator('svg.text-white') });
        await createButton.click();

        // Drawer should open. It has "Quick Gen" or "New Creation" text.
        await expect(page.getByText('Quick Gen')).toBeVisible();
    });
});
