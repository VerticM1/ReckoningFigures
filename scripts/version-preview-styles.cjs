// Version the stylesheet URL so iPhone caches cannot mix new artwork with old CSS.
const fs=require('fs'),crypto=require('crypto');
const version=crypto.createHash('sha256').update(fs.readFileSync('preview/styles.css')).digest('hex').slice(0,12);
for(const file of ['preview/index.html','preview/celebration-preview.html']){
 const html=fs.readFileSync(file,'utf8');
 fs.writeFileSync(file,html.replace(/href="styles\.css(?:\?v=[^" ]*)?"/g,`href="styles.css?v=${version}"`).replace(/src="app\.js(?:\?v=[^" ]*)?"/g,`src="app.js?v=${crypto.createHash('sha256').update(fs.readFileSync('preview/app.js')).digest('hex').slice(0,12)}"`));
}
console.log(`Preview stylesheet version: ${version}`);
// Educator workspace uses separate styles and logic; version every changing entry.
const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0,12);
const org='preview/organization/';
if(fs.existsSync(org+'index.html')){
 const script=fs.readFileSync(org+'organization.js','utf8').replace(/from '\.\/model\.js(?:\?v=[^']*)?'/,`from './model.js?v=${digest(org+'model.js')}'`);
 fs.writeFileSync(org+'organization.js',script);
 let html=fs.readFileSync(org+'index.html','utf8');
 html=html.replace(/href="\.\.\/styles\.css(?:\?v=[^"]*)?"/,`href="../styles.css?v=${version}"`)
  .replace(/href="organization\.css(?:\?v=[^"]*)?"/,`href="organization.css?v=${digest(org+'organization.css')}"`)
  .replace(/src="organization\.js(?:\?v=[^"]*)?"/,`src="organization.js?v=${digest(org+'organization.js')}"`);
 fs.writeFileSync(org+'index.html',html);
}
