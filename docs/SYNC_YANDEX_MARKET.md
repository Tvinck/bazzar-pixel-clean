# Yandex Market Sync Service

This service synchronizes Orders and Chats from Yandex Market Partner API to your Supabase database.

## Setup

1.  **Get Credentials**:
    *   **API Key**: Follow instructions at [Yandex Market Docs](https://yandex.ru/dev/market/partner-api/doc/ru/concepts/api-key) to generate an API Key.
    *   **Campaign ID**: Find your Business/Campaign ID in the Partner Interface.

2.  **Database Migration**:
    *   Run the SQL commands in `YANDEX_INTEGRATION.sql` in your Supabase SQL Editor. This creates the necessary `chats` table and adds columns to `orders`.

3.  **Environment Variables**:
    *   Create or update `.env` file in `bazzar-pixel/`:
        ```env
        YANDEX_MARKET_API_KEY=your_api_key_here
        YANDEX_MARKET_CAMPAIGN_ID=your_campaign_id_here
        ```

## Running the Service

The service is a standalone Node.js script `yandex-service.js`.

```bash
# Install dependencies if not already
npm install

# Run the sync service
node yandex-service.js
```

The service runs in a loop (every 60 seconds) fetching new orders and chats.

## Features

*   **Orders**: Fetches PROCESSING orders and saves them to `orders` table. It maps Yandex statuses to your app statuses (new, processing, completed, cancelled).
*   **Chats**: Fetches active chats and saves them to `chats` table.
*   **Deduplication**: Uses Upsert logic to prevent duplicates.
