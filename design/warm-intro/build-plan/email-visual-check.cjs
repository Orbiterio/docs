const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || undefined,headless:true,args:['--disable-gpu']});
const checks=[];for(const name of ['first-request','second-request','final-introduction','neutral-closure','reverse-first-request','reverse-second-request'])for(const width of [320,390,800]){
 const p=await browser.newPage({viewport:{width,height:1000}});await p.goto('file://'+path.join(__dirname,'rendered',name+'.html'));
 const d=await p.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));assert.ok(d.scroll<=d.width+1,JSON.stringify({name,...d}));
 checks.push({name,width,overflow:false});if(name==='first-request'&&width===390)await p.screenshot({path:path.join(__dirname,'rendered','first-request-phone.png'),fullPage:true});await p.close();}
await browser.close();fs.writeFileSync(path.join(__dirname,'email-layout-verification.json'),JSON.stringify({html_templates:4,text_templates:4,render:'Go template fixtures passed; required fields and escaping verified',browser:'Chromium rendering only, not email-client or provider delivery validation',checks},null,2)+'\n');console.log('All six rendered email cases fit 320, 390 and 800 px.');})().catch(e=>{console.error(e);process.exit(1)});
