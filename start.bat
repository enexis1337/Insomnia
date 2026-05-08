@echo off
echo Запуск Minecraft бота...
echo.

if not exist "node_modules" (
  echo Установка зависимостей...
  npm install
  echo.
)

echo Запуск бота...
echo Для остановки введите "stop" в консоли
echo.

node bot.js

pause