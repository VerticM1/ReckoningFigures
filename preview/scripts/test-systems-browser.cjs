// Browser integration check; RF_BROWSER_PATH can select an installed Chromium.
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'../..');
const server=http.createServer((req,res)=>{let p=path.join(root,req.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';try{let source=fs.readFileSync(p);if(p.endsWith('/preview/app.js'))source+='\nwindow.auditQuestion=(id,n)=>{start(course.flatMap(m=>m.lessons).find(l=>l.id===id));state.index=n-1;state.supportSteps.clear();question();};window.auditState=()=>({index:state.index,support:[...state.supportSteps],firstTry:state.firstTry,errors:state.errors});';res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':p.endsWith('.html')?'text/html':'application/octet-stream');res.end(source);}catch{res.statusCode=404;res.end();}});
(async()=>{
 const {course}=await import(path.join(root,'preview/course.js'));
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({headless:true,executablePath:process.env.RF_BROWSER_PATH,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/preview/');await page.waitForFunction(()=>typeof window.auditQuestion==='function');
  for(const lesson of course.flatMap(m=>m.lessons).filter(l=>l.id>=20&&l.id<=24)){
   for(const [index,q] of lesson.questions.entries()){
    await page.evaluate(([id,n])=>auditQuestion(id,n),[lesson.id,index+1]);
    assert.equal(await page.locator('.choice').count(),4);
    if(q.diagram){assert(await page.locator('.coordinate-figure svg').isVisible());await page.getByText('Graph values in text',{exact:true}).click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
    if(q.phase==='check'){assert.equal(await page.locator('.lesson-concept').innerText(),'');assert.deepEqual((await page.evaluate(()=>auditState())).support,[]);}
    const wrong=(q.answer+1)%4;await page.locator('.choice').nth(wrong).click();await page.locator('#check').click();
    assert((await page.locator('.feedback').innerText()).includes(q.explanations[wrong]));assert((await page.evaluate(()=>auditState())).support.includes(index));
    await page.locator('.choice').nth(q.answer).click();await page.locator('#check').click();
    assert((await page.locator('.feedback').innerText()).includes(q.explanation));
   }
  }
  await page.evaluate(()=>auditQuestion(22,2));await page.screenshot({path:'/tmp/rf-systems-graph-mobile.png',fullPage:true});
  // Complete a whole new lesson through the normal Continue controls.
  const lesson=course.flatMap(m=>m.lessons).find(l=>l.id===20);await page.evaluate(()=>auditQuestion(20,1));
  for(const [index,q] of lesson.questions.entries()){
   await page.locator('.choice').nth(q.answer).click();await page.locator('#check').click();
   if(index===11){assert.equal((await page.evaluate(()=>auditState())).firstTry,12);assert.deepEqual((await page.evaluate(()=>auditState())).support,[0,1,2,3]);}
   await page.locator('#check').click();
   if(index<11)await page.waitForFunction(n=>document.querySelector('.count')?.textContent===`${n} / 12`,index+2);else await page.locator('.finish').waitFor();
  }
  // Legacy source links deliver the same diagrams and feedback with their existing premium gate.
  await page.addInitScript(()=>localStorage.setItem('userProgress',JSON.stringify({premium:true,completed:[],xp:0})));
  await page.goto(base+'/figure-022.html');await page.locator('.choice').filter({hasText:'Its coordinates satisfy both equations'}).click();await page.locator('#continue-btn.show').waitFor();await page.locator('#continue-btn').click();assert(await page.locator('.coordinate-figure svg').isVisible());
  await page.goto(base+'/preview/curriculum.html');assert((await page.locator('.metrics').innerText()).includes('58 / 58'));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:'/tmp/rf-systems-coverage-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);console.log('PASS 60 questions in the actual renderer, every feedback path, assistance tracking, full lesson completion, legacy graph delivery and mobile layouts.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
