#!/bin/bash

# Универсальный скрипт запуска для Termux и Linux
# Автоматически определяет окружение

echo "========================================"
echo "   Minecraft Bot - Универсальный запуск"
echo "========================================"
echo ""

# Определение ОС
if [ -d "/data/data/com.termux/files/usr" ]; then
    echo "📱 Обнаружен Termux (Android)"
    OS="termux"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Обнаружен Linux"
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Обнаружен macOS"
    OS="macos"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo "🪟 Обнаружен Windows"
    OS="windows"
else
    echo "❓ Неизвестная ОС: $OSTYPE"
    OS="unknown"
fi

# Функция установки Node.js для Termux
install_nodejs_termux() {
    echo "📦 Установка Node.js для Termux..."
    pkg update -y
    pkg install nodejs -y
    if ! command -v node &> /dev/null; then
        echo "❌ Не удалось установить Node.js"
        exit 1
    fi
    echo "✅ Node.js установлен"
}

# Функция установки Node.js для Linux
install_nodejs_linux() {
    echo "❌ Node.js не установлен!"
    echo ""
    echo "Установите Node.js вручную:"
    echo "  Ubuntu/Debian: sudo apt install nodejs npm"
    echo "  Fedora: sudo dnf install nodejs npm"
    echo "  Arch: sudo pacman -S nodejs npm"
    echo "  macOS: brew install node"
    echo ""
    exit 1
}

# Проверка Node.js
if ! command -v node &> /dev/null; then
    case $OS in
        "termux")
            install_nodejs_termux
            ;;
        "linux"|"macos")
            install_nodejs_linux
            ;;
        "windows")
            echo "🪟 Для Windows используйте start.bat"
            exit 1
            ;;
        *)
            echo "❌ Не удалось определить ОС для установки Node.js"
            exit 1
            ;;
    esac
fi

# Проверка npm
if ! command -v npm &> /dev/null; then
    echo "📦 Установка npm..."
    case $OS in
        "termux")
            pkg install npm -y
            ;;
        "linux"|"macos")
            echo "❌ npm не установлен!"
            echo "Установите npm вместе с Node.js"
            exit 1
            ;;
    esac
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