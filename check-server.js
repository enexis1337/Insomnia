const dns = require('dns');
const net = require('net');
const config = require('./config.js');

console.log('Проверка доступности сервера Aternos...');
console.log('Сервер:', config.server.host);
console.log('Порт:', config.server.port);

// Проверка DNS
dns.lookup(config.server.host, (err, address) => {
  if (err) {
    console.error('❌ Ошибка DNS:', err.message);
    console.error('Сервер не найден или недоступен.');
    return;
  }
  
  console.log('✅ DNS разрешен успешно');
  console.log('IP адрес:', address);
  
  // Проверка подключения к порту
  const socket = new net.Socket();
  const timeout = 5000; // 5 секунд
  
  socket.setTimeout(timeout);
  
  socket.on('connect', () => {
    console.log('✅ Порт ' + config.server.port + ' открыт и доступен');
    socket.destroy();
    process.exit(0);
  });
  
  socket.on('timeout', () => {
    console.error('❌ Таймаут подключения к порту ' + config.server.port);
    console.error('Сервер не отвечает на подключение.');
    socket.destroy();
    process.exit(1);
  });
  
  socket.on('error', (err) => {
    console.error('❌ Ошибка подключения к порту:', err.message);
    console.error('Порт может быть закрыт или сервер не принимает подключения.');
    socket.destroy();
    process.exit(1);
  });
  
  socket.connect(config.server.port, config.server.host);
});

// Также проверим типичные порты для серверов Aternos
console.log('\nПримечание: Серверы Aternos часто используют динамические порты.');
console.log('Убедитесь, что:');
console.log('1. Сервер запущен в панели управления Aternos');
console.log('2. Вы используете правильный порт (обычно отображается в панели)');
console.log('3. Сервер не находится в спящем режиме');