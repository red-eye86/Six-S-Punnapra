import { readFileSync, writeFileSync } from 'node:fs';

const files = [
  'src/pages/index.html',
  'src/pages/sports.html',
  'src/pages/officials.html',
  'src/pages/tournaments.html',
  'src/pages/legacy-teams.html',
  'src/pages/infrastructure.html',
  'src/partials/navbar.html',
  'src/partials/footer.html',
];

const en = {};
const ml = {};

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const matches = content.matchAll(/data-en="([^"]+)"\s+data-ml="([^"]+)"/g);
  for (const match of matches) {
    const key = match[1];
    en[key] = match[1];
    ml[key] = match[2];
  }

  // Also check placeholder / title matches
  const placeholders = content.matchAll(/placeholder="([^"]+)"\s+data-placeholder-ml="([^"]+)"/g);
  for (const match of placeholders) {
    en[match[1]] = match[1];
    ml[match[1]] = match[2];
  }
}

// Additional UI tokens
en['Parent Registration'] = "Parent's Registration";
ml['Parent Registration'] = 'രക്ഷിതാക്കളുടെ രജിസ്ട്രേഷൻ';

writeFileSync('public/locales/en.json', JSON.stringify(en, null, 2) + '\n');
writeFileSync('public/locales/ml.json', JSON.stringify(ml, null, 2) + '\n');
console.log('Successfully wrote', Object.keys(en).length, 'translations to en.json & ml.json');

