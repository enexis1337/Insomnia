// Альтернативная конфигурация для локального сервера
module.exports = {
  // Настройки сервера для локального тестирования
  server: {
    host: 'localhost',    // Локальный сервер
    port: 25565,          // Стандартный порт Minecraft
    version: '1.21.11'    // Версия Minecraft
  },
  
  // Настройки бота
  bot: {
    username: 'TestBot_' + Math.floor(Math.random() * 1000),
    auth: 'offline',
    
    // Настройки действий
    actions: {
      jumping: {
        enabled: true,
        interval: 1000
      },
      spinning: {
        enabled: true,
        interval: 500,
        speed: 45
      },
      attacking: {
        enabled: true,
        interval: 1500,
        range: 4
      }
    }
  }
};