import fetch from 'node-fetch';
import { supabase } from '../lib/supabase.js';

/* eslint-env node */

// Configuration
// Ensure these are set in your environment or .env file
const API_KEY = process.env.YANDEX_MARKET_API_KEY || 'YOUR_API_KEY';
const CAMPAIGN_ID = process.env.YANDEX_MARKET_CAMPAIGN_ID || 'YOUR_CAMPAIGN_ID';
const SYNC_INTERVAL_MS = 60000; // 1 minute

const BASE_URL = 'https://api.partner.market.yandex.ru/v2';

const headers = {
    'Api-Key': API_KEY,
    'Content-Type': 'application/json',
};

// --- API Helpers ---

async function fetchYandexOrders() {
    try {
        console.log('📦 Fetching Yandex Orders...');
        const url = `${BASE_URL}/campaigns/${CAMPAIGN_ID}/orders.json?status=PROCESSING&limit=50`;

        const res = await fetch(url, { headers });
        if (!res.ok) {
            throw new Error(`Yandex API Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        return data.orders || [];
    } catch (error) {
        console.error('Error fetching orders:', error.message);
        return [];
    }
}

async function fetchYandexChats() {
    try {
        console.log('💬 Fetching Yandex Chats...');
        const url = `${BASE_URL}/campaigns/${CAMPAIGN_ID}/chats.json`;

        const res = await fetch(url, { headers });
        if (!res.ok) {
            if (res.status === 404) return [];
            throw new Error(`Yandex API Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        return data.result?.chats || [];
    } catch (error) {
        console.error('Error fetching chats:', error.message);
        return [];
    }
}

async function sendYandexMessage(chatId, text) {
    try {
        console.log(`📤 Sending message to chat ${chatId}...`);
        const url = `${BASE_URL}/campaigns/${CAMPAIGN_ID}/chats/${chatId}/messages.json`;

        const res = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ message: { text } })
        });

        if (!res.ok) {
            throw new Error(`Yandex Send Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        return data.result?.message?.id || 'sent_unknown_id';
    } catch (error) {
        console.error('Error sending message:', error.message);
        return null;
    }
}

// --- Sync Logic ---

async function syncOrders() {
    const orders = await fetchYandexOrders();
    if (orders.length === 0) return;

    console.log(`Processing ${orders.length} orders...`);

    for (const yOrder of orders) {
        const orderPayload = {
            id: `yandex_${yOrder.id}`,
            external_id: String(yOrder.id),
            platform: 'yandex',
            status: mapYandexStatus(yOrder.status),
            price: yOrder.total,
            total_amount: yOrder.total,
            created_at: yOrder.creationDate,
            metadata: {
                platform: 'yandex',
                customer_name: `${yOrder.buyer?.firstName || ''} ${yOrder.buyer?.lastName || ''}`.trim() || 'Гость',
                yandex_status: yOrder.status,
                buyer: yOrder.buyer,
                delivery: yOrder.delivery
            },
            product_name: yOrder.items?.[0]?.offerName || 'Товар с Яндекс Маркета',
            items: yOrder.items?.map(i => ({
                id: i.offerId,
                name: i.offerName,
                count: i.count,
                price: i.price
            }))
        };

        const { error } = await supabase
            .from('orders')
            .upsert(orderPayload, { onConflict: 'id' });

        if (error) console.error(`Failed to sync order ${yOrder.id}:`, error.message);
    }
}

async function syncChats() {
    const chats = await fetchYandexChats();
    console.log(`Processing ${chats.length} chats...`);

    for (const yChat of chats) {
        const chatId = `yandex_${yChat.chatId}`;

        const chatPayload = {
            id: chatId,
            platform: 'yandex',
            external_id: String(yChat.chatId),
            client_name: yChat.client?.name || `Yandex Customer ${yChat.chatId}`,
            last_message: yChat.lastMessage?.text || '',
            unread_count: yChat.unreadCount || 0,
            updated_at: new Date().toISOString(),
            metadata: {
                order_id: yChat.orderId,
                status: yChat.status
            }
        };

        const { error: chatError } = await supabase
            .from('chats')
            .upsert(chatPayload, { onConflict: 'id' });

        if (chatError) {
            console.error(`Failed to sync chat ${yChat.chatId}:`, chatError.message);
            continue;
        }
    }
}

async function processOutboundMessages() {
    // Fetch pending shop messages
    const { data: pendingMessages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('sender', 'shop')
        .is('external_message_id', null)
        .limit(10);

    if (error || !pendingMessages || pendingMessages.length === 0) return;

    console.log(`Processing ${pendingMessages.length} outbound messages...`);

    for (const msg of pendingMessages) {
        const { data: chat } = await supabase.from('chats').select('external_id, platform').eq('id', msg.chat_id).single();

        if (!chat || chat.platform !== 'yandex') continue;

        const yandexChatId = chat.external_id;
        const sentId = await sendYandexMessage(yandexChatId, msg.text);

        if (sentId) {
            await supabase
                .from('chat_messages')
                .update({ external_message_id: String(sentId) })
                .eq('id', msg.id);
            console.log(`✅ Message ${msg.id} sent to Yandex!`);
        }
    }
}

function mapYandexStatus(yStatus) {
    const map = {
        'PROCESSING': 'processing',
        'DELIVERY': 'processing',
        'PICKUP': 'processing',
        'DELIVERED': 'completed',
        'CANCELLED': 'cancelled',
        'UNPAID': 'new',
        'PENDING': 'new'
    };
    return map[yStatus] || 'processing';
}

// --- Main Loop ---

console.log('🚀 Yandex Market Sync Service Started');
console.log(`API Key: ${API_KEY ? 'Set' : 'Missing'}`);
console.log(`Campaign ID: ${CAMPAIGN_ID}`);

async function runSync() {
    await syncOrders();
    await syncChats();
    await processOutboundMessages();
    console.log(`✅ Sync cycle complete. Waiting ${SYNC_INTERVAL_MS / 1000}s...`);
}

runSync();
setInterval(runSync, SYNC_INTERVAL_MS);
