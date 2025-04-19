const fs = require('fs');
const path = require('path');

// Update postcss.config.js
const postcssConfigPath = path.join(__dirname, 'postcss.config.js');
const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

fs.writeFileSync(postcssConfigPath, postcssConfig);
console.log('Updated postcss.config.js');

// Update package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = require(packageJsonPath);

// Make sure we have the correct dependencies
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

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('Updated package.json');

console.log('Fix complete. Please run:');
console.log('npm install');
console.log('npm run dev');
