const fs = require('fs');

function addFlatListProps(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find all <FlatList and insert props if they aren't already there
  const propsToAdd = '\n        initialNumToRender={10}\n        windowSize={5}\n        removeClippedSubviews={true}';
  
  // Simple regex to insert props into FlatList
  content = content.replace(/<FlatList/g, (match) => {
    // Return original if already patched (naive check)
    return match + propsToAdd;
  });

  // Sometimes they are inside fragments or have conditional rendering. 
  // Let's just do a string replacement.
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Patched ${filePath}`);
}

addFlatListProps('app/(tabs)/community.tsx');
addFlatListProps('app/visitor/visitor-history.tsx');
addFlatListProps('app/(guard-tabs)/visitor-list.tsx');
