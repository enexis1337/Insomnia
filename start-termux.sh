#!/bin/bash

# Скрипт запуска для Android Termux
# Установите Termux из Google Play Store

echo "========================================"
echo "   Minecraft Bot для Termux"
echo "========================================"
echo ""

# Проверка Termux
if [ ! -d "/data/data/com.termux/files/usr" ]; then
    echo "❌ Ошибка: Скрипт должен запускаться в Termux!"
    echo "Установите Termux из Google Play Store"
    exit 1
fi

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "📦 Установка Node.js..."
    pkg update -y
    pkg install nodejs -y
    echo "✅ Node.js установлен"
fi

# Проверка npm
if ! command -v npm &> /dev/null; then
    echo "📦 Установка npm..."
    pkg install npm -y
    echo "✅ npm установлен"
fi

# Проверка зависимостей
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Ошибка установки зависимостей"
        exit 1
    fi
    echo "✅ Зависимости установлены"
else
    echo "✅ Зависимости уже установлены"
fi

# Проверка конфигурации
if [ ! -f "config.js" ]; then
    echo "❌ Файл config.js не найден!"
    echo "Создайте config.js с настройками сервера"
    exit 1
fi

echo ""
echo "📋 Конфигурация:"
echo "----------------"
node -e "
const config = require('./config.js');
console.log('Сервер:', config.server.host + ':' + config.server.port);
console.log('Имя бота:', config.bot.username);
console.log('Версия:', config.server.version);
"

echo ""
echo "🚀 Запуск бота..."
echo "----------------"
echo "Команды управления:"
echo "  • help    - справка по командам"
echo "  • status  - статус бота"
echo "  • say     - отправить сообщение в чат"
echo "  • stop    - остановить бота"
echo ""
echo "📝 Для отправки команд введите их в эту консоль"
echo ""

# Запуск бота
node bot.js