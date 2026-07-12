const fs = require('fs');

let file = fs.readFileSync('app/visitor/visitor-history.tsx', 'utf8');
file = file.replace(
  'empty: { textAlign: "center", color: t.textSecondary, marginTop: 40 },',
  'empty: { textAlign: "center", color: t.textTertiary, marginTop: 40 },'
);
// I also need to restore FlatList props because I git checkout'd it.
const propsToAdd = '\n        initialNumToRender={10}\n        windowSize={5}\n        removeClippedSubviews={true}';
file = file.replace(/<FlatList/, '<FlatList' + propsToAdd);
fs.writeFileSync('app/visitor/visitor-history.tsx', file, 'utf8');
console.log('patched visitor-history');
