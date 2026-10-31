const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve(__dirname,'../..'),server=http.createServer((req,res)=>{let p=path.join(root,decodeURIComponent(req.url.split('?')[0]));try{res.setHeader('Content-Type',p.endsWith('.css')?'text/css':p.endsWith('.js')?'application/javascript':'text/html');res.end(fs.readFileSync(p));}catch{res.statusCode=404;res.end();}});
 await new Promise(r=>server.listen(8774,'127.0.0.1',r));const browser=await chromium.launch({headless:true,executablePath:process.env.RF_BROWSER_PATH,args:['--no-sandbox']});
 try{const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,390,1440]){await page.setViewportSize({width,height:900});for(const name of ['terms','privacy','data-requests']){await page.goto(`http://127.0.0.1:8774/preview/${name}.html`);assert.equal(await page.locator('h1').count(),1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${name} overflow at ${width}`);for(const href of await page.locator('a[href]').evaluateAll(a=>a.map(x=>x.getAttribute('href')))){if(href.startsWith('mailto:'))continue;assert.ok(fs.existsSync(path.resolve(root,'preview',href)),href);}}}
 await page.goto('http://127.0.0.1:8774/preview/data-requests.html');assert.match(await page.locator('main').innerText(),/do not submit a request automatically/);assert.match(await page.getByRole('link',{name:'Open deletion request email'}).getAttribute('href'),/^mailto:support@reckoningfigures.com/);
 await page.getByRole('link',{name:'Open export request email'}).focus();assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Open export request email');
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/rf-account-data-mobile.png',fullPage:true});assert.deepEqual(errors,[]);
 console.log('PASS policy/data request pages: 320/390/1440 widths, local links, keyboard focus, mailto handoff, explicit manual-request status and no script errors.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});
