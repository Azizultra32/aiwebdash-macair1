const fs = require('fs');
const path = require('path');

const distDir = path.join('.', 'dist');
const versionPath = path.join(distDir, 'version.json');

const publicDir = path.join(".", 'public');
const srcVersionPath = path.join(publicDir, 'version.json');

// Read and update version.json
const updateVersion = () => {
  const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
  const [major, minor, patch] = versionData.version.split('.').map(Number);
  versionData.version = `${major}.${minor}.${patch + 1}`;
  const versionJson = JSON.stringify(versionData, null, 2);
  fs.writeFileSync(versionPath, versionJson);
  fs.writeFileSync(srcVersionPath, versionJson);
  console.log('Version updated to:', versionData.version);
};


// Only update the application version number. Asset precaching is handled by Workbox.
updateVersion();
