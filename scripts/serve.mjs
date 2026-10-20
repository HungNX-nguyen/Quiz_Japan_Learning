import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const names=['1-7.pdf','KANJI-7.txt','KANJI-8.txt','KANJI-9.txt','KANJI-10.txt'];
const port=Number(process.env.PORT||4173);
const server=createServer(async(req,res)=>{
  try{
    const path=new URL(req.url,'http://localhost').pathname;
    if(path==='/favicon.ico'){res.writeHead(204);res.end();return;}
    const source=names.find(name=>path===`/sources/${name}`);
    if(!source && !['/','/index.html'].includes(path)){res.writeHead(404);res.end('Not found');return;}
    const url=source?new URL(`../../${source}`,import.meta.url):new URL('../dist/index.html',import.meta.url);
    const data=await readFile(url);
    res.writeHead(200,{'Content-Type':source?.endsWith('.pdf')?'application/pdf':source?'text/plain; charset=utf-8':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(data);
  }catch{res.writeHead(500);res.end('Run npm run build first.');}
});
server.on('error',error=>{console.error(error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
