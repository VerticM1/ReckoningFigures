// Version the stylesheet URL so iPhone caches cannot mix new artwork with old CSS.
const fs=require('fs'),crypto=require('crypto');
const version=crypto.createHash('sha256').update(fs.readFileSync('preview/styles.css')).digest('hex').slice(0,12);
for(const file of ['preview/index.html','preview/celebration-preview.html']){
 const html=fs.readFileSync(file,'utf8');
 fs.writeFileSync(file,html.replace(/href="styles\.css(?:\?v=[^" ]*)?"/g,`href="styles.css?v=${version}"`).replace(/src="app\.js(?:\?v=[^" ]*)?"/g,`src="app.js?v=${crypto.createHash('sha256').update(fs.readFileSync('preview/app.js')).digest('hex').slice(0,12)}"`));
}
console.log(`Preview stylesheet version: ${version}`);
