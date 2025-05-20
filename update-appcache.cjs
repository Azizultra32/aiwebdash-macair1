const fs = require('fs');
const path = require('path');

const distDir = path.join(".", 'dist');
const appcachePath = path.join(distDir, 'sw.js');
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

// Read the contents of the dist directory
fs.readdir(distDir, {recursive: true}, (err, files) => {
  if (err) throw err;

  console.log(files.join('\n'))

  // Find the CSS and JS files
  const cssFile = files.find(file => file.startsWith('assets\\index-') && file.endsWith('.css'));
  const jsFiles = files.filter(file => file.startsWith('assets\\index-') && file.endsWith('.js'));

  // Update version first
  updateVersion();

  // Read the appcache file
  fs.readFile(appcachePath, 'utf8', (err, data) => {
    if (err) throw err;

    // Replace the placeholders with actual file names
    let updatedData = data.replace('assets/index-[hash].css', cssFile?.replace('\\', '/'));
    updatedData = updatedData.replace('assets/index-[hash].js', jsFiles.map(jsFile => jsFile?.replace('\\', '/')).join('\', \''));

    // Write the updated content back to the file
    fs.writeFile(appcachePath, updatedData, 'utf8', (err) => {
      if (err) throw err;
      console.log('AppCache manifest updated successfully.');
    });
  });
});