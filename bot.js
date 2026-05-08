const mineflayer = require('mineflayer');
const config = require('./config.js');

// Конфигурация бота
const botConfig = {
  host: config.server.host,
  port: config.server.port,
  username: config.bot.username || 'Bot_' + Math.floor(Math.random() * 1000),
  version: config.server.version,
  auth: config.bot.auth || 'offline'
};

// Переменные для управления ботом
let bot = null;
let reconnectInterval = null;
let actionIntervals = [];
let isConnected = false;

// Флаги для отладки (можно включить/выключить)
const DEBUG_ACTIONS = false; // false - убрать вывод действий, true - показывать

// Функция создания и подключения бота
function createBot() {
  console.log(`Попытка подключения к серверу ${botConfig.host}:${botConfig.port}...`);
  
  bot = mineflayer.createBot({
    host: botConfig.host,
    port: botConfig.port,
    username: botConfig.username,
    version: botConfig.version,
    auth: botConfig.auth
  });

  // Обработчики событий
  bot.on('login', () => {
    isConnected = true;
    console.log(`✅ Бот ${bot.username} успешно подключился к серверу`);
    
    // Останавливаем переподключение если оно было
    if (reconnectInterval) {
      clearInterval(reconnectInterval);
      reconnectInterval = null;
    }
    
    // Начинаем выполнять действия через 2 секунды после подключения
    setTimeout(() => {
      startBotActions();
    }, 2000);
  });

  bot.on('spawn', () => {
    if (DEBUG_ACTIONS) console.log('Бот появился в мире');
  });

  bot.on('death', () => {
    console.log('💀 Бот умер');
  });

  bot.on('kicked', (reason) => {
    console.log('🚫 Бот был кикнут:', reason);
    scheduleReconnect();
  });

  bot.on('end', () => {
    console.log('🔌 Соединение с сервером разорвано');
    isConnected = false;
    stopAllActions();
    scheduleReconnect();
  });

  bot.on('error', (err) => {
    if (isConnected) {
      console.error('❌ Ошибка бота:', err.message);
    } else {
      console.error(`❌ Не удалось подключиться к ${botConfig.host}:${botConfig.port}`);
    }
    scheduleReconnect();
  });

  // Обработка чата
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    console.log(`💬 ${username}: ${message}`);
    
    // Автоответ на приветствия
    if (message.toLowerCase().includes('привет') || message.toLowerCase().includes('hello')) {
      setTimeout(() => {
        bot.chat(`Привет, ${username}!`);
      }, 1000);
    }
  });
}

// Функция для переподключения
function scheduleReconnect() {
  if (reconnectInterval) return; // Уже запланировано переподключение
  
  console.log(`🔄 Повторная попытка подключения через 10 секунд...`);
  
  reconnectInterval = setInterval(() => {
    console.log('🔄 Попытка переподключения...');
    if (bot) {
      bot.end();
      bot = null;
    }
    createBot();
  }, 10000); // 10 секунд
}

// Функция для выполнения действий бота
function startBotActions() {
  if (DEBUG_ACTIONS) console.log('Начинаем выполнение действий...');
  
  // Очищаем предыдущие интервалы
  stopAllActions();
  
  // Запускаем циклические действия
  if (config.bot.actions.jumping.enabled) {
    actionIntervals.push(startJumping());
  }
  if (config.bot.actions.spinning.enabled) {
    actionIntervals.push(startSpinning());
  }
  if (config.bot.actions.attacking.enabled) {
    actionIntervals.push(startAttacking());
  }
}

// Функция для прыжков
function startJumping() {
  return setInterval(() => {
    if (bot && bot.entity && bot.entity.onGround) {
      bot.setControlState('jump', true);
      setTimeout(() => {
        bot.setControlState('jump', false);
      }, 200);
      if (DEBUG_ACTIONS) console.log('Прыжок!');
    }
  }, config.bot.actions.jumping.interval);
}

// Функция для вращения
function startSpinning() {
  let currentYaw = 0;
  const speedRad = config.bot.actions.spinning.speed * Math.PI / 180;
  
  return setInterval(() => {
    if (!bot) return;
    
    // Вращаемся на указанное количество градусов
    currentYaw += speedRad;
    
    // Нормализуем угол
    if (currentYaw > Math.PI * 2) {
      currentYaw -= Math.PI * 2;
    }
    
    // Устанавливаем направление взгляда
    bot.look(currentYaw, 0, false);
    if (DEBUG_ACTIONS) console.log(`Вращение: угол ${Math.round(currentYaw * 180 / Math.PI)}°`);
  }, config.bot.actions.spinning.interval);
}

// Функция для атаки (бить рукой)
function startAttacking() {
  return setInterval(() => {
    if (!bot) return;
    
    // Ищем ближайшую сущность для атаки
    const entity = bot.nearestEntity();
    
    if (entity && entity.type === 'mob' && entity.position.distanceTo(bot.entity.position) < config.bot.actions.attacking.range) {
      bot.attack(entity);
      if (DEBUG_ACTIONS) console.log(`Атакуем ${entity.name || 'сущность'}!`);
    } else {
      // Если нет сущностей рядом, просто бьем воздух
      bot.swingArm();
      if (DEBUG_ACTIONS) console.log('Бьем рукой');
    }
  }, config.bot.actions.attacking.interval);
}

// Остановка всех действий
function stopAllActions() {
  actionIntervals.forEach(interval => {
    clearInterval(interval);
  });
  actionIntervals = [];
}

// Обработка команд в консоли
process.stdin.on('data', (data) => {
  const input = data.toString().trim();
  
  if (input === 'stop' || input === 'exit') {
    console.log('🛑 Останавливаем бота...');
    stopAllActions();
    if (reconnectInterval) {
      clearInterval(reconnectInterval);
    }
    if (bot) {
      bot.end();
    }
    process.exit(0);
  } 
  else if (input === 'reconnect') {
    console.log('🔄 Принудительное переподключение...');
    if (bot) {
      bot.end();
    }
    scheduleReconnect();
  }
  else if (input === 'status') {
    console.log('📊 Статус бота:');
    console.log(`- Подключен: ${isConnected ? '✅' : '❌'}`);
    console.log(`- Имя: ${botConfig.username}`);
    console.log(`- Сервер: ${botConfig.host}:${botConfig.port}`);
    if (bot && bot.entity) {
      console.log(`- Позиция: x=${Math.round(bot.entity.position.x)}, y=${Math.round(bot.entity.position.y)}, z=${Math.round(bot.entity.position.z)}`);
      console.log(`- Здоровье: ${bot.health}`);
    }
  }
  else if (input.startsWith('say ')) {
    const message = input.substring(4);
    if (bot && isConnected) {
      bot.chat(message);
      console.log(`💬 Отправлено в чат: "${message}"`);
    } else {
      console.log('❌ Бот не подключен к серверу');
    }
  }
  else if (input === 'help') {
    showHelp();
  }
  else {
    console.log(`❌ Неизвестная команда: "${input}"`);
    console.log('Введите "help" для списка команд');
  }
});

// Функция показа помощи
function showHelp() {
  console.log('\n📋 Доступные команды:');
  console.log('  stop/exit     - остановить бота');
  console.log('  reconnect     - принудительное переподключение');
  console.log('  status        - показать статус бота');
  console.log('  say <текст>   - отправить сообщение в чат');
  console.log('  help          - показать эту справку');
  console.log('\n⚙️  Настройки отладки:');
  console.log('  В коде измените DEBUG_ACTIONS на true/false');
  console.log('  для включения/выключения вывода действий');
}

// Запуск бота
console.log('🚀 Запуск Minecraft бота');
console.log(`📡 Сервер: ${botConfig.host}:${botConfig.port}`);
console.log(`👤 Имя бота: ${botConfig.username}`);
console.log(`🔧 Версия: ${botConfig.version}`);
console.log('\n📝 Команды управления:');
console.log('  • Введите "help" для списка команд');
console.log('  • Автоматическое переподключение каждые 10 секунд');
console.log('  • Отправка сообщений: say <текст>');
console.log('  • Отладка действий: измените DEBUG_ACTIONS в коде\n');

// Начальное подключение
createBot();