const {JSDOM}=require('jsdom'),fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const wait=()=>new Promise(r=>setTimeout(r,30));
(async()=>{
 const {course}=await import(root+'/course.js');
 const dom=new JSDOM('<main id="classroom-app"></main>',{url:'https://example.org/preview/school/classroom.html?school=a&class=c',runScripts:'outside-only'});
 let assignment,removed=false;
 const api={observe:fn=>{queueMicrotask(()=>fn({uid:'teacher'}));return ()=>{};},logout:async()=>{},schoolContext:async()=>({school:{name:'School'},member:{role:'teacher'}}),classroom:{classInfo:async()=>({name:'Class'}),assignments:async()=>assignment?[{id:'hw',...assignment}]:[],classRoster:async()=>removed?[]:[{id:'student',label:'Test student'}],enroll:async()=>{},unenroll:async()=>{removed=true;},createAssignment:async(s,c,v)=>{assignment=v;},results:async()=>[{uid:'student',lessonId:1,questions:9,firstTry:8,supportSteps:1}]}};
 let source=fs.readFileSync(root+'/school/classroom.js','utf8').replace(/^import .*;\n/gm,'');
 dom.window.Function('api','course',source)(api,course);await wait();
 const doc=dom.window.document;
 assert(doc.querySelector('summary').textContent.includes('How to'));
 doc.querySelector('#select-unit').click();const first=doc.querySelector('#selected-count').textContent;
 doc.querySelector('#unit').value='1';doc.querySelector('#unit').dispatchEvent(new dom.window.Event('change'));assert.equal(doc.querySelector('#selected-count').textContent,first);
 doc.querySelector('#select-unit').click();
 const form=doc.querySelector('#assignment');form.elements.title.value='Test practice';form.elements.due.value='2026-12-01';form.dispatchEvent(new dom.window.Event('submit',{cancelable:true}));await wait();assert(assignment.lessonIds.length>1);assert(new Set(assignment.lessonIds).size===assignment.lessonIds.length);
 doc.querySelector('[data-report]').click();await wait();assert(doc.body.textContent.includes('1 steps with app support'));
 doc.querySelector('[data-remove]').click();await wait();assert(removed);dom.window.close();
 console.log('PASS class controls, cross-unit selection, assignment save, report and roster removal');
 // Execute the actual lesson modules in a DOM with only the Firebase transport mocked.
 const lessonDom=new JSDOM('<main id="app"></main>',{url:'https://example.org/preview/?schoolHomework=hw&school=a&class=c',runScripts:'outside-only',pretendToBeVisual:true});
 const w=lessonDom.window;w.structuredClone=structuredClone;w.matchMedia=()=>({matches:true,addEventListener(){}});w.scrollTo=()=>{};w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 let saved=null,fail=true;const cloud={observe:fn=>{queueMicrotask(()=>fn({uid:'student'}));return ()=>{};},currentUid:()=> 'student',schoolContext:async()=>({member:{role:'student',state:'active'},school:{status:'pilot',license:{startsOn:{toMillis:()=>0},endsOn:{toMillis:()=>Date.now()+86400000}}}}),classroom:{assignment:async()=>({id:'hw',title:'Practice',lessonIds:[1],due:'2026-12-01'}),results:async()=>saved?[saved]:[],submit:async(s,c,a,p)=>{if(fail)throw Error('Test offline failure');saved=p;}}};
 const context=lessonDom.getInternalVMContext(),cache=new Map();
 async function get(file){file=file.split('?')[0];if(cache.has(file))return cache.get(file);let mod;if(file.endsWith('/owner/client.js')){mod=new vm.SyntheticModule(Object.keys(cloud),function(){for(const [k,v] of Object.entries(cloud))this.setExport(k,v);},{context});}else mod=new vm.SourceTextModule(fs.readFileSync(file,'utf8'),{context,identifier:file,importModuleDynamically:async(spec,ref)=>{const m=await get(path.resolve(path.dirname(ref.identifier),spec));if(m.status==='unlinked')await m.link(link);if(m.status==='linked')await m.evaluate();return m;}});cache.set(file,mod);return mod;}
 const link=(spec,ref)=>get(path.resolve(path.dirname(ref.identifier),spec));const entry=await get(root+'/app.js');await entry.link(link);await entry.evaluate();await wait();
 w.document.querySelector('[data-cloud-lesson]').click();
 for(let i=0;i<course[0].lessons[0].questions.length;i++){
 const q=course[0].lessons[0].questions[i];if(q.type==='fill-blank'){const input=w.document.querySelector('.answer');input.value=String(q.answer);input.dispatchEvent(new w.Event('input'));}else{w.document.querySelectorAll('.choice')[q.type==='true-false'?(q.answer?0:1):q.answer].click();}
 w.document.querySelector('#check').click();if([2,4,6].includes(i))assert(w.document.querySelector('.milestone-'+(i+1)),'Missing milestone');w.document.querySelector('#check').click();await wait();
 }
 assert(w.document.querySelector('.celebration-screen'),'Finish celebration absent');
 w.document.querySelector('#claim').click();await wait();assert(w.document.querySelector('#save-status').textContent.includes('Result not saved'));assert(!w.document.querySelector('#claim').disabled);
 fail=false;w.document.querySelector('#claim').click();await wait();assert(saved);assert.equal(saved.lessonId,1);assert.equal(saved.firstTry,course[0].lessons[0].questions.length);assert(w.document.body.textContent.includes('Completion saved to your class'));
 lessonDom.window.close();console.log('PASS complete connected lesson, 3/5/7 milestones, finish celebration, failed-save retry and saved homework display');
})().catch(e=>{console.error(e);process.exit(1);});
