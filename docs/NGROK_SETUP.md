# Инструкция по установке ngrok

## Способ 1: Скачать вручную
1. Перейдите на https://ngrok.com/download
2. Скачайте версию для macOS
3. Распакуйте в любую папку
4. Запустите: ./ngrok http 5174

## Способ 2: Через npm (если не работает brew)
npm install -g ngrok

## Использование:
ngrok http 5174

## После запуска:
Скопируйте HTTPS URL (например: https://abc123.ngrok.io)
И используйте его в BotFather для Mini App
