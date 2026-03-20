const jsonStr = '{"name":"台北","weather":"晴天","temp":28}';

function parseWeather(json) {
  const data = JSON.parse(json);
  console.log(`城市：${data.name}`);
  console.log(`天氣：${data.weather}`);
  console.log(`氣溫：${data.temp}°C`);
}
parseWeather(jsonStr);
