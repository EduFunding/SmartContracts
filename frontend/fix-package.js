const fs = require('fs');
const path = require('path');

// Read the package.json file
const packageJsonPath = path.join(__dirname, 'package.json');
let packageJson;

try {
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  packageJson = JSON.parse(packageJsonContent);
} catch (error) {
  console.error('Error reading package.json:', error);
  process.exit(1);
}

// Update the devDependencies
packageJson.devDependencies = {
  ...packageJson.devDependencies,
  "autoprefixer": "^10.4.14",
  "postcss": "^8.4.24",
  "tailwindcss": "^3.3.2"
};

// Remove @tailwindcss/postcss if it exists
if (packageJson.devDependencies['@tailwindcss/postcss']) {
  delete packageJson.devDependencies['@tailwindcss/postcss'];
}

// Write the updated package.json
try {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Successfully updated package.json');
} catch (error) {
  console.error('Error writing package.json:', error);
  process.exit(1);
}

console.log('Now run:');
console.log('npm install');
console.log('npm run dev');
