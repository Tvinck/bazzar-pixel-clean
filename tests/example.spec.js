import { test, expect } from '@playwright/test';

test('homepage loads and shows title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Vite \+ React/);
});

test('check for generate buttons', async ({ page }) => {
    await page.goto('/');

    // Check if "Создать изображение" button works (or is present)
    // Note: Texts might differ based on actual render, adjusting to what was seen in HomeView.jsx
    await expect(page.getByText('Создать изображение')).toBeVisible();
    await expect(page.getByText('Создать видео')).toBeVisible();
});
