// Version the stylesheet URL so iPhone caches cannot mix new artwork with old CSS.
const fs=require('fs'),crypto=require('crypto');
// Version shared curriculum dependencies before hashing their consuming entry files.
for(const file of ['preview/app.js','preview/homework.js','preview/school/classroom.js','preview/organization/organization.js']){
 let content=fs.readFileSync(file,'utf8');
 content=content.replace(/from '(\.\.?\/)(course|lesson-types)\.js(?:\?v=[^']*)?'/g,(_,prefix,name)=>`from '${prefix}${name}.js?v=${crypto.createHash('sha256').update(fs.readFileSync('preview/'+name+'.js')).digest('hex').slice(0,12)}'`);
 fs.writeFileSync(file,content);
}
if(fs.existsSync('preview/homework.js')){fs.writeFileSync('preview/homework.js',fs.readFileSync('preview/homework.js','utf8').replace(/import\('\.\/owner\/client\.js(?:\?v=[^']*)?'\)/,`import('./owner/client.js?v=${crypto.createHash('sha256').update(fs.readFileSync('preview/owner/client.js')).digest('hex').slice(0,12)}')`));const hash=crypto.createHash('sha256').update(fs.readFileSync('preview/homework.js')).digest('hex').slice(0,12);fs.writeFileSync('preview/app.js',fs.readFileSync('preview/app.js','utf8').replace(/from '\.\/homework\.js(?:\?v=[^']*)?'/,`from './homework.js?v=${hash}'`));}
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
// Owner workspace is shipped locked; database rules and trusted registration authorize access.
const owner='preview/owner/';
if(fs.existsSync(owner+'client.js')){
 fs.writeFileSync(owner+'owner.js',fs.readFileSync(owner+'owner.js','utf8').replace(/from '\.\/client\.js(?:\?v=[^']*)?'/,`from './client.js?v=${digest(owner+'client.js')}'`));
 let html=fs.readFileSync(owner+'index.html','utf8');
 for(const [url,file] of [['../styles.css','preview/styles.css'],['../organization/organization.css','preview/organization/organization.css'],['owner.css',owner+'owner.css'],['owner.js',owner+'owner.js']]){
  const escaped=url.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp('(["\\\'])'+escaped+'(?:\\?v=[^"\\\']*)?(["\\\'])','g'),`$1${url}?v=${digest(file)}$2`);
 }
 fs.writeFileSync(owner+'index.html',html);
}
const school='preview/school/';
if(fs.existsSync(school+'school.js')){
 fs.writeFileSync(school+'school.js',fs.readFileSync(school+'school.js','utf8').replace(/from '\.\.\/owner\/client\.js(?:\?v=[^']*)?'/,`from '../owner/client.js?v=${digest(owner+'client.js')}'`));
 let html=fs.readFileSync(school+'index.html','utf8');
 for(const [url,file] of [['../styles.css','preview/styles.css'],['../organization/organization.css',org+'organization.css'],['../owner/owner.css',owner+'owner.css'],['school.css',school+'school.css'],['school.js',school+'school.js']]){
  const escaped=url.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp('(["\\\'])'+escaped+'(?:\\?v=[^"\\\']*)?(["\\\'])','g'),`$1${url}?v=${digest(file)}$2`);
 }
 fs.writeFileSync(school+'index.html',html);
}

fs.writeFileSync(school+'classroom.js',fs.readFileSync(school+'classroom.js','utf8').replace(/from '\.\.\/owner\/client\.js(?:\?v=[^']*)?'/,`from '../owner/client.js?v=${digest(owner+'client.js')}'`));
let classroomHtml=fs.readFileSync(school+'classroom.html','utf8');
for(const [url,file] of [['../styles.css','preview/styles.css'],['../organization/organization.css',org+'organization.css'],['../owner/owner.css',owner+'owner.css'],['school.css',school+'school.css'],['classroom.js',school+'classroom.js']]){
 classroomHtml=classroomHtml.split('"'+url+'"').join('"'+url+'?v='+digest(file)+'"');
 const start='"'+url+'?v=';
 const idx=classroomHtml.indexOf(start);
 if(idx>=0){const end=classroomHtml.indexOf('"',idx+start.length);classroomHtml=classroomHtml.slice(0,idx)+start+digest(file)+classroomHtml.slice(end);}
}
fs.writeFileSync(school+'classroom.html',classroomHtml);

// Shared staff visual system and join entry assets.
for(const name of ['join','staff-join']){
 const js=school+name+'.js';fs.writeFileSync(js,fs.readFileSync(js,'utf8').replace(/from '\.\.\/owner\/client\.js(?:\?v=[^']*)?'/,`from '../owner/client.js?v=${digest(owner+'client.js')}'`));
}
for(const file of [school+'staff-join.html',school+'join.html',school+'classroom.html',school+'index.html',owner+'index.html',org+'index.html']){
 let html=fs.readFileSync(file,'utf8');
 html=html.replace(/href="\.\.\/workspace\.css(?:\?v=[^"]*)?"/,`href="../workspace.css?v=${digest('preview/workspace.css')}"`);
 if([school+'join.html',school+'staff-join.html'].includes(file))for(const [url,source] of [[file.includes('staff-join')?'staff-join.js':'join.js',file.replace('.html','.js')],['../styles.css','preview/styles.css'],['../organization/organization.css',org+'organization.css']]){
  const start='"'+url;const at=html.indexOf(start);if(at>=0){const end=html.indexOf('"',at+1);html=html.slice(0,at)+start+'?v='+digest(source)+html.slice(end);}
 }
 fs.writeFileSync(file,html);
}

// Privacy-preserving social entry and legacy authentication bridge.
fs.writeFileSync('preview/friends.js',fs.readFileSync('preview/friends.js','utf8').replace(/from '\.\/owner\/client\.js(?:\?v=[^']*)?'/,`from './owner/client.js?v=${digest(owner+'client.js')}'`));
let friendsHTML=fs.readFileSync('preview/friends.html','utf8');
for(const url of ['styles.css','organization/organization.css','workspace.css','friends.js']){
 const start='"'+url,at=friendsHTML.indexOf(start);if(at>=0){const end=friendsHTML.indexOf('"',at+1);friendsHTML=friendsHTML.slice(0,at)+start+'?v='+digest('preview/'+url)+friendsHTML.slice(end);}
}
fs.writeFileSync('preview/friends.html',friendsHTML);
fs.writeFileSync('auth.html',fs.readFileSync('auth.html','utf8').replace(/src="firebase-friends-system\.js(?:\?v=[^"]*)?"/,`src="firebase-friends-system.js?v=${digest('firebase-friends-system.js')}"`));

fs.writeFileSync('preview/support.js',fs.readFileSync('preview/support.js','utf8').replace(/from '\.\/owner\/client\.js(?:\?v=[^']*)?'/,`from './owner/client.js?v=${digest(owner+'client.js')}'`));
let supportHTML=fs.readFileSync('preview/support.html','utf8');
for(const url of ['styles.css','organization/organization.css','workspace.css','support.js']){
 const start='"'+url,at=supportHTML.indexOf(start);if(at>=0){const end=supportHTML.indexOf('"',at+1);supportHTML=supportHTML.slice(0,at)+start+'?v='+digest('preview/'+url)+supportHTML.slice(end);}
}
fs.writeFileSync('preview/support.html',supportHTML);
