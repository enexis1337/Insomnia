// Конфигурация для бота Minecraft
module.exports = {
  // Настройки сервера (ЗАХАРДКОЖЕНЫ)
  server: {
    host: 'zuboklyak.aternos.me',    // Адрес сервера Minecraft (без порта)
    port: 58899,                     // Порт сервера Aternos (обычно динамический)
    version: '1.21.11'               // Версия Minecraft
    // Примечание: для серверов Aternos порт может меняться
  },
  
  // Настройки бота
  bot: {
    username: 'negroid',  // Имя бота (можно оставить или сгенерировать случайное)
    auth: 'offline',      // Тип аутентификации (offline для cracked-серверов)
    
    // Настройки действий
    actions: {
      jumping: {
        enabled: true,
        interval: 1000    // Интервал прыжков в миллисекундах
      },
      spinning: {
        enabled: true,
        interval: 500,    // Интервал вращения в миллисекундах
        speed: 45         // Скорость вращения в градусах за интервал
      },
      attacking: {
        enabled: true,
        interval: 1500,   // Интервал атак в миллисекундах
        range: 4          // Дистанция атаки в блоках
      }
    }
  }
};
