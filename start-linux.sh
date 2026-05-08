#!/bin/bash

# Скрипт запуска для Linux
# Требуется: Node.js, npm

echo "========================================"
echo "   Minecraft Bot для Linux"
echo "========================================"
echo ""

# Проверка ОС
if [[ "$OSTYPE" != "linux-gnu"* ]] && [[ "$OSTYPE" != "darwin"* ]]; then
    echo "⚠️  Предупреждение: Скрипт предназначен для Linux/macOS"
    echo "Для Windows используйте start.bat"
fi

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен!"
    echo ""
    echo "Установите Node.js:"
    echo "  Ubuntu/Debian: sudo apt install nodejs npm"
    echo "  Fedora: sudo dnf install nodejs npm"
    echo "  Arch: sudo pacman -S nodejs npm"
    echo "  macOS: brew install node"
    echo ""
    exit 1
fi

# Проверка версии Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
if [ $NODE_MAJOR -lt 16 ]; then
    echo "⚠️  Предупреждение: Node.js версии $NODE_VERSION"
    echo "Рекомендуется Node.js 16 или выше"
    read -p "Продолжить? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Проверка npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не установлен!"
    echo "Установите npm вместе с Node.js"
    exit 1
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