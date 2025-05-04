import fs from 'fs';

// Загружаем файл с добавленными датами
const tournaments = JSON.parse(fs.readFileSync('tournaments_with_dates.json', 'utf-8'));

const gamesWithoutDate = [];

for (const tournament of tournaments) {
  for (const session of tournament.sessions) {
    for (const game of session.games) {
      if (!game.date) {
        gamesWithoutDate.push({
          tournament: tournament.tournament_name,
          session: session.title,
          gameTitle: game.title,
          gameId: game.gameId,
          gameUrl: game.gameUrl
        });
      }
    }
  }
}

// Сохраняем результат
fs.writeFileSync('games_without_date.json', JSON.stringify(gamesWithoutDate, null, 2), 'utf-8');

console.log(`❓ Найдено ${gamesWithoutDate.length} игр без даты.`);
console.log('📝 Список сохранён в games_without_date.json');
