const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.devDependencies = pkg.devDependencies || {};
pkg.devDependencies['@expo/ngrok'] = pkg.dependencies['@expo/ngrok'];
delete pkg.dependencies['@expo/ngrok'];

pkg.devDependencies['expo-dev-client'] = pkg.dependencies['expo-dev-client'];
delete pkg.dependencies['expo-dev-client'];

delete pkg.dependencies['expo-av'];
delete pkg.dependencies['expo-image'];
delete pkg.dependencies['react-native-google-places-autocomplete'];

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2), 'utf8');
console.log('package.json updated');
