/* ============================================================
   PIXEL NAMES
   The website converts names into approximate sound spellings
   and displays them as pixel art.
   ============================================================ */

// 1. PIXEL LETTERS
const F={
A:[14,17,17,31,17,17,17],B:[30,17,17,30,17,17,30],
C:[14,17,16,16,16,17,14],D:[30,17,17,17,17,17,30],
E:[31,16,16,30,16,16,31],F:[31,16,16,30,16,16,16],
G:[14,17,16,23,17,17,15],H:[17,17,17,31,17,17,17],
I:[14,4,4,4,4,4,14],J:[7,2,2,2,2,18,12],
K:[17,18,20,24,20,18,17],L:[16,16,16,16,16,16,31],
M:[17,27,21,21,17,17,17],N:[17,17,25,21,19,17,17],
O:[14,17,17,17,17,17,14],P:[30,17,17,30,16,16,16],
Q:[14,17,17,17,21,18,13],R:[30,17,17,30,20,18,17],
S:[15,16,16,14,1,1,30],T:[31,4,4,4,4,4,4],
U:[17,17,17,17,17,17,14],V:[17,17,17,17,17,10,4],
W:[17,17,17,21,21,21,10],X:[17,17,10,4,10,17,17],
Y:[17,17,10,4,4,4,4],Z:[31,1,2,4,8,16,31],
'-':[0,0,0,31,0,0,0],"'":[4,4,8,0,0,0,0],
'.':[0,0,0,0,0,12,12]
};

const MK={
'\u0301':[2,4],'\u0300':[8,4],'\u0302':[4,10],
'\u0308':[10,0],'\u0303':[12,3],'\u030a':[12,12],
'\u030c':[10,4]
};

// 2. MAKE PIXEL GRIDS FOR LATIN LETTERS
function latinGrid(str){
  const T=[];

  for(const ch of str.toUpperCase().normalize('NFD')){
    if(/[\u0300-\u036f]/.test(ch)){
      if(!T.length)return null;
      T[T.length-1].m.push(ch);
    }else{
      T.push({c:ch,m:[]});
    }
  }

  if(!T.length)return null;

  for(const t of T){
    if(t.c!==' '&&!F[t.c])return null;

    for(const m of t.m){
      if(!MK[m]&&m!=='\u0327'&&m!=='\u0328')return null;
    }
  }

  const top=T.some(t=>t.m.some(m=>MK[m]));
  const bot=T.some(t=>t.m.some(m=>m==='\u0327'||m==='\u0328'));
  const o=top?2:0;
  const h=o+7+(bot?1:0);
  const w=T.reduce((s,t)=>s+(t.c===' '?3:5)+1,-1);

  const cells=Array.from({length:h},()=>new Uint8Array(w));
  let x=0;

  for(const t of T){
    if(t.c===' '){
      x+=4;
      continue;
    }

    for(let r=0;r<7;r++){
      for(let b=0;b<5;b++){
        if((F[t.c][r]>>(4-b))&1){
          cells[o+r][x+b]=1;
        }
      }
    }

    for(const m of t.m){
      if(MK[m]){
        MK[m].forEach((bits,r)=>{
          for(let b=0;b<5;b++){
            if((bits>>(4-b))&1)cells[r][x+b]=1;
          }
        });
      }else{
        cells[o+7][x+2]=1;
      }
    }

    x+=6;
  }

  return {w,h,cells};
}

// 3. TURN WRITING INTO PIXELS
function raster(text,size,font,rtl,wt){
  const c=document.createElement('canvas');
  const g=c.getContext('2d',{willReadFrequently:true});
  const f=(wt||700)+' '+size+'px '+font;

  g.font=f;

  const W=Math.ceil(g.measureText(text).width)+size*2;
  const H=size*3;

  c.width=W;
  c.height=H;

  g.font=f;
  g.direction=rtl?'rtl':'ltr';
  g.textAlign='center';
  g.textBaseline='middle';
  g.fillStyle='#000';
  g.fillText(text,W/2,H/2);

  const d=g.getImageData(0,0,W,H).data;
  let x0=W,x1=-1,y0=H,y1=-1;

  for(let y=0;y<H;y++){
    for(let x=0;x<W;x++){
      if(d[(y*W+x)*4+3]>120){
        if(x<x0)x0=x;
        if(x>x1)x1=x;
        if(y<y0)y0=y;
        if(y>y1)y1=y;
      }
    }
  }

  if(x1<0)return null;

  const w=x1-x0+1;
  const h=y1-y0+1;
  const cells=Array.from({length:h},()=>new Uint8Array(w));

  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){
      if(d[((y+y0)*W+x+x0)*4+3]>120){
        cells[y][x]=1;
      }
    }
  }

  return {w,h,cells};
}

// Prepare names for the language rules.
const clean=n=>n.normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .toLowerCase()
  .replace(/[^a-z\s'-]/g,'')
  .replace(/['-]/g,' ')
  .trim()
  .split(/\s+/)
  .filter(Boolean);

// 4. JAPANESE
const K={
'':'アイウエオ',k:'カキクケコ',g:'ガギグゲゴ',
s:'サシスセソ',z:'ザジズゼゾ',n:'ナニヌネノ',
h:'ハヒフヘホ',b:'バビブベボ',p:'パピプペポ',
m:'マミムメモ',r:'ラリルレロ',
y:['ヤ','イ','ユ','イェ','ヨ'],
w:['ワ','ウィ','ウ','ウェ','ウォ'],
f:['ファ','フィ','フ','フェ','フォ'],
v:['ヴァ','ヴィ','ヴ','ヴェ','ヴォ'],
t:['タ','ティ','トゥ','テ','ト'],
d:['ダ','ディ','ドゥ','デ','ド'],
sh:['シャ','シ','シュ','シェ','ショ'],
ch:['チャ','チ','チュ','チェ','チョ'],
j:['ジャ','ジ','ジュ','ジェ','ジョ']
};

const KD={t:'ト',d:'ド',sh:'シュ',ch:'チ',j:'ジ',h:'ハ'};

function kana(w){
  w=w.replace(/ph/g,'f').replace(/th/g,'t')
    .replace(/kh/g,'k').replace(/gh/g,'g')
    .replace(/ck/g,'k').replace(/qu/g,'kw')
    .replace(/x/g,'ks').replace(/q/g,'k')
    .replace(/c(?=[eiy])/g,'s').replace(/c/g,'k')
    .replace(/l/g,'r');

  const V='aeiou';
  let o='',i=0;

  while(i<w.length){
    const c=w[i];

    if(V.includes(c)){
      o+=(i>0&&w[i-1]===c)?'ー':K[''][V.indexOf(c)];
      i++;
      continue;
    }

    let con=c;
    const two=w.substr(i,2);

    if(two==='sh'||two==='ch')con=two;

    const nx=w[i+con.length];

    if(con==='n'&&!(nx&&V.includes(nx))){
      o+='ン';
      i++;
      continue;
    }

    if(con.length===1&&nx===c&&c!=='n'&&c!=='m'){
      o+='ッ';
      i++;
      continue;
    }

    const T=K[con];

    if(!T){
      i++;
      continue;
    }

    if(nx&&V.includes(nx)){
      o+=T[V.indexOf(nx)];
      i+=con.length+1;
    }else{
      o+=KD[con]||T[2];
      i+=con.length;
    }
  }

  return o;
}

// 5. ARABIC
const AC={
b:'ب',d:'د',f:'ف',h:'ه',j:'ج',k:'ك',l:'ل',
m:'م',n:'ن',p:'ب',q:'ق',r:'ر',s:'س',t:'ت',
v:'ف',w:'و',y:'ي',z:'ز',sh:'ش',ch:'تش',
th:'ث',kh:'خ',gh:'غ',ph:'ف',dh:'ذ',ck:'ك'
};

function arabic(w){
  const V='aeiou';
  const cc=(w.match(/[^aeiou]/g)||[]).length;
  let o='',i=0,vc=0,prev='';

  while(i<w.length){
    const c=w[i],t=w.substr(i,2),nx=w[i+1];

    if(V.includes(c)){
      const first=i===0,last=i===w.length-1;
      let r;

      if(nx===c){
        r={a:'ا',e:'ي',i:'ي',o:'و',u:'و'}[c];
        i+=2;
      }else{
        if(first)r={a:'أ',e:'إ',i:'إ',o:'أو',u:'أو'}[c];
        else if(last)r={a:'ا',e:'',i:'ي',o:'و',u:'و'}[c];
        else r={a:(vc>0||cc<3)?'ا':'',e:'',i:'ي',o:'و',u:'و'}[c];
        i++;
      }

      o+=r;
      vc++;
      prev='';
      continue;
    }

    if(AC[t]){
      o+=AC[t];
      i+=2;
      prev=t;
      continue;
    }

    let r=AC[c];

    if(c==='c')r=/[eiy]/.test(nx||'')?'س':'ك';
    if(c==='g')r=/[eiy]/.test(nx||'')?'ج':'غ';
    if(c==='x')r='كس';

    if(r&&c!==prev)o+=r;

    prev=c;
    i++;
  }

  return o;
}

// 6. KOREAN
const KR='Apple SD Gothic Neo,Malgun Gothic,Noto Sans CJK KR,Noto Sans KR,sans-serif';

const prep=w=>w.replace(/ph/g,'f').replace(/th/g,'t')
  .replace(/kh/g,'k').replace(/gh/g,'g')
  .replace(/ck/g,'k').replace(/qu/g,'kw')
  .replace(/x/g,'ks').replace(/q/g,'k')
  .replace(/c(?=[eiy])/g,'s').replace(/c/g,'k')
  .replace(/([^aeiou])\1/g,'$1');

function hangul(w){
  w=prep(w).replace(/er$/,'ə')
    .replace(/([aeiou])r$/,'$1')
    .replace(/y(?![aeiou])/g,'i')
    .replace(/w(?![aeiou])/g,'u');

  const V='aeiouə';

  const ON={
    g:0,n:2,d:3,r:5,l:5,m:6,b:7,s:9,j:12,z:12,
    ch:14,k:15,t:16,p:17,f:17,v:7,h:18,sh:9
  };

  const VW={a:0,e:5,i:20,o:8,u:13,'ə':4};
  const VY={a:2,e:7,i:20,o:12,u:17,'ə':6};
  const VX={a:9,e:15,i:16,o:14,u:13,'ə':14};
  const CD={n:4,m:16,l:8,ng:21};

  const S=[];
  let i=0;

  while(i<w.length){
    const c=w[i],two=w.substr(i,2),n1=w[i+1]||'';

    if(!/[a-zə]/.test(c)){
      i++;
      continue;
    }

    if(V.includes(c)){
      S.push({o:11,v:VW[c],c:0});
      i++;
      continue;
    }

    if((c==='y'||c==='w')&&V.includes(n1)){
      S.push({o:11,v:(c==='y'?VY:VX)[n1],c:0});
      i+=2;
      continue;
    }

    const key=(two==='sh'||two==='ch'||(two==='ng'&&!V.includes(w[i+2]||'')))?two:c;
    const n=key.length;
    const nx=w[i+n]||'';

    if(V.includes(nx)){
      S.push({o:ON[key]??11,v:(key==='sh'?VY:VW)[nx],c:0});
      i+=n+1;
      continue;
    }

    const pv=S[S.length-1];

    if(pv&&!pv.c&&CD[key]&&pv.v!==18){
      pv.c=CD[key];
    }else{
      S.push({o:ON[key]??11,v:18,c:0});
    }

    i+=n;
  }

  return S.map(s=>String.fromCharCode(0xAC00+(s.o*21+s.v)*28+s.c)).join('');
}

// 7. CHINESE
const ZH='PingFang SC,Microsoft YaHei,Noto Sans CJK SC,Noto Sans SC,sans-serif';

const CH={
'':'阿埃伊奥乌',b:'巴贝比博布',c:'卡塞西科库',
d:'达德迪多杜',f:'法费菲福富',g:'加格吉戈古',
h:'哈赫希霍胡',j:'贾杰吉乔朱',k:'卡凯基科库',
l:'拉勒利洛卢',m:'马梅米莫穆',n:'娜内尼诺努',
p:'帕佩皮波普',r:'拉雷里洛鲁',s:'萨塞西索苏',
t:'塔特蒂托图',v:'瓦维维沃武',w:'瓦韦威沃乌',
y:'雅耶伊约尤',z:'扎泽兹佐祖',
sh:'沙谢希肖舒',ch:'查切奇乔楚'
};

const CZ={
b:'布',c:'克',d:'德',f:'夫',g:'格',h:'赫',j:'吉',
k:'克',l:'尔',m:'姆',n:'恩',p:'普',r:'尔',s:'斯',
t:'特',v:'夫',w:'夫',y:'伊',z:'兹',sh:'什',ch:'奇'
};

function hanzi(w){
  w=prep(w).replace(/ng(?![aeiou])/g,'n');

  const V='aeiou';
  let o='',i=0;

  while(i<w.length){
    const c=w[i];

    if(!/[a-z]/.test(c)){
      i++;
      continue;
    }

    if(V.includes(c)){
      o+=CH[''][V.indexOf(c)];
      i++;
      continue;
    }

    const two=w.substr(i,2);
    const key=(two==='sh'||two==='ch')?two:c;
    const nx=w[i+key.length];

    if(CH[key]&&nx&&V.includes(nx)){
      o+=CH[key][V.indexOf(nx)];
      i+=key.length+1;
    }else{
      o+=CZ[key]||'';
      i+=key.length;
    }
  }

  return o;
}

// 8. RUSSIAN
const RU={
a:'а',b:'б',d:'д',e:'е',f:'ф',g:'г',h:'х',
i:'и',j:'дж',k:'к',l:'л',m:'м',n:'н',o:'о',
p:'п',r:'р',s:'с',t:'т',u:'у',v:'в',w:'в',z:'з'
};

const RT={
sh:'ш',ch:'ч',zh:'ж',kh:'х',ts:'ц',ph:'ф',
th:'т',ck:'к',ya:'я',yu:'ю',yo:'ё',ye:'е',
ee:'и',oo:'у'
};

function russian(w){
  let o='',i=0;

  while(i<w.length){
    const t=w.substr(i,2),c=w[i],nx=w[i+1]||'';

    if(RT[t]){
      o+=RT[t];
      i+=2;
      continue;
    }

    let r;

    if(c==='c')r=/[eiy]/.test(nx)?'с':'к';
    else if(c==='x')r='кс';
    else if(c==='q')r='к';
    else if(c==='y')r=(i>0&&'aeiou'.includes(w[i-1]))?'й':'и';
    else if(c==='e'&&i===0)r='э';
    else r=RU[c];

    o+=r||'';
    i++;
  }

  return o;
}

// 9. THAI
const TH='Thonburi,Leelawadee UI,Tahoma,Noto Sans Thai,sans-serif';

const TC={
b:'บ',d:'ด',f:'ฟ',g:'ก',h:'ฮ',j:'จ',k:'ค',
l:'ล',m:'ม',n:'น',p:'พ',r:'ร',s:'ส',t:'ท',
v:'ว',w:'ว',y:'ย',z:'ซ',sh:'ช',ch:'ช'
};

function thai(w){
  w=prep(w).replace(/ee/g,'i').replace(/oo/g,'u')
    .replace(/a([^aeiou])e$/,'e$1')
    .replace(/e$/,'')
    .replace(/y(?![aeiou])/g,'i');

  const V='aeiou';
  const mk=(c,v)=>v==='e'?'เ'+c:
    v==='o'?'โ'+c:
    v==='a'?c+'า':
    v==='i'?c+'ิ':c+'ู';

  let o='',i=0;

  while(i<w.length){
    const c=w[i];

    if(!/[a-z]/.test(c)){
      i++;
      continue;
    }

    if(V.includes(c)){
      o+={a:'อา',e:'เอ',i:'อิ',o:'โอ',u:'อู'}[c];
      i++;
      continue;
    }

    const two=w.substr(i,2);
    const key=(two==='sh'||two==='ch')?two:c;
    const nx=w[i+key.length]||'';
    const t=TC[key]||'';

    if(V.includes(nx)){
      o+=mk(t,nx);
      i+=key.length+1;
    }else{
      o+=t+((key==='r'&&i>0&&V.includes(w[i-1]))?'์':'');
      i+=key.length;
    }
  }

  return o;
}

// 10. SPANISH
// Approximate Spanish-style spelling.
function spanish(w){
  return w
    .replace(/ph/g,'f')
    .replace(/th/g,'t')
    .replace(/sh/g,'ch')
    .replace(/ck/g,'k')
    .replace(/qu/g,'k')
    .replace(/c(?=[eiy])/g,'s')
    .replace(/g(?=[eiy])/g,'j')
    .replace(/j/g,'j')
    .replace(/w/g,'gu')
    .replace(/x/g,'ks')
    .replace(/z/g,'s')
    .replace(/h/g,'');
}

// 11. PORTUGUESE
// Approximate Portuguese-style spelling.
function portuguese(w){
  return w
    .replace(/ph/g,'f')
    .replace(/th/g,'t')
    .replace(/sh/g,'ch')
    .replace(/ck/g,'k')
    .replace(/qu/g,'k')
    .replace(/c(?=[eiy])/g,'s')
    .replace(/g(?=[eiy])/g,'j')
    .replace(/j/g,'j')
    .replace(/w/g,'u')
    .replace(/y/g,'i')
    .replace(/x/g,'ks')
    .replace(/k/g,'c')
    .replace(/h/g,'');
}

// 12. LANGUAGE LIST
const JP='"Hiragino Sans","Yu Gothic","Noto Sans CJK JP","Noto Sans JP",Meiryo,sans-serif';
const AR='"Noto Naskh Arabic","Geeza Pro","Segoe UI",Tahoma,Arial,sans-serif';
const SS='system-ui,"Segoe UI",Arial,sans-serif';

const LANGS=[
  {id:'english',name:'English',nat:'English',col:'#e2574c',k:'l'},
  {id:'arabic',name:'Arabic',nat:'العربية',col:'#e8963a',k:'a'},
  {id:'japanese',name:'Japanese',nat:'日本語',col:'#3d9a6b',k:'j'},
  {id:'korean',name:'Korean',nat:'한국어',col:'#3b82c4',k:'k'},
  {id:'chinese',name:'Chinese (Mandarin)',nat:'中文',col:'#8a5cc7',k:'z'},
  {id:'russian',name:'Russian',nat:'Русский',col:'#d1478a',k:'r'},
  {id:'thai',name:'Thai',nat:'ไทย',col:'#2aa6a6',k:'t'},
  {id:'spanish',name:'Spanish',nat:'Español',col:'#e0a12e',k:'s'},
  {id:'portuguese',name:'Portuguese',nat:'Português',col:'#269b70',k:'p'}
];

// 13. BUILD THE NINE LANGUAGE RESULTS
function build(name){
  const hasAr=/[\u0600-\u06FF]/.test(name);
  const hasJP=/[\u3040-\u30ff\u4e00-\u9fff]/.test(name);
  const hasTH=/[\u0E00-\u0E7F]/.test(name);
  const hasKR=/[가-힣]/.test(name);
  const hasZH=/[一-鿿]/.test(name);
  const hasCY=/[Ѐ-ӿ]/.test(name);

  const words=clean(name);

  return LANGS.map(L=>{
    let text='',grid=null,note='';

    if(L.k==='l'){
      text=name;
      grid=latinGrid(name)||raster(name,22,SS,false);
      note='Original spelling';

    }else if(L.k==='a'){
      text=hasAr?name:words.map(arabic).join(' ');
      grid=text?raster(text,26,AR,true):null;
      note=hasAr?'As typed':'Sound-based spelling · right to left';

    }else if(L.k==='j'){
      text=hasJP?name:words.map(kana).join('・');
      grid=text?raster(text,20,JP,false):null;
      note=hasJP?'As typed':'Katakana · sound-based';

    }else if(L.k==='k'){
      text=hasKR?name:words.map(hangul).join(' ');
      grid=text?raster(text,26,KR,false,600):null;
      note=hasKR?'As typed':'Hangul · sound-based';

    }else if(L.k==='z'){
      text=hasZH?name:words.map(hanzi).join('·');
      grid=text?raster(text,28,ZH,false,500):null;
      note=hasZH?'As typed':'Characters chosen by sound';

    }else if(L.k==='t'){
      text=hasTH?name:words.map(thai).join(' ');
      grid=text?raster(text,26,TH,false,600):null;
      note=hasTH?'As typed':'Thai script · sound-based';

    }else if(L.k==='r'){
      text=hasCY?name:words.map(russian).join(' ');
      grid=text?raster(text,22,SS,false):null;
      note=hasCY?'As typed':'Cyrillic · sound-based';

    }else if(L.k==='s'){
      text=words.map(spanish).join(' ');
      grid=text?latinGrid(text):null;
      note='Spanish-style · approximate';

    }else if(L.k==='p'){
      text=words.map(portuguese).join(' ');
      grid=text?latinGrid(text):null;
      note='Portuguese-style · approximate';
    }

    if(!grid){
      text='';
      note='This name can’t be written in '+L.name+' script.';
    }

    return {...L,text,grid,note};
  });
}

// 14. DRAW PIXEL ART
function draw(cv,g,col,cell,o={}){
  const pad=o.pad??8;
  const dpr=o.dpr??(window.devicePixelRatio||1);
  const gap=Math.max(1,Math.round(cell*.12));

  const W=g.w*cell+pad*2;
  const H=g.h*cell+pad*2;

  cv.width=Math.round(W*dpr);
  cv.height=Math.round(H*dpr);
  cv.style.width=W+'px';
  cv.style.height=H+'px';

  const x=cv.getContext('2d');
  x.setTransform(dpr,0,0,dpr,0,0);
  x.clearRect(0,0,W,H);

  if(o.bg){
    x.fillStyle=o.bg;
    x.fillRect(0,0,W,H);
  }

  for(let y=0;y<g.h;y++){
    for(let i=0;i<g.w;i++){
      if(!g.cells[y][i])continue;

      const px=pad+i*cell+gap/2;
      const py=pad+y*cell+gap/2;
      const s=cell-gap;

      x.fillStyle=typeof col==='function'?col(i,g.w):col;
      x.fillRect(px,py,s,s);

      x.fillStyle='rgba(255,255,255,.3)';
      x.fillRect(px,py,s,Math.max(1,s*.22));
    }
  }
}

// 15. TITLE COLOURS AND ANIMATION
const PAL=LANGS.map(l=>l.col);
const VIV=[
  '#ff3b3b','#ff9f1a','#2ee66b','#2f9bff',
  '#a855ff','#ff3dac','#14d9c5'
];

const RGB=VIV.flatMap(h=>{
  const c=[1,3,5].map(k=>parseInt(h.substr(k,2),16));
  const m=(t,a)=>c.map(v=>Math.round(v+(t-v)*a));
  return [c,m(255,.38),c,m(0,.42)];
});

function pc(p){
  p=(((p%1)+1)%1)*RGB.length;
  const a=Math.floor(p),f=p-a;
  const A=RGB[a%RGB.length],B=RGB[(a+1)%RGB.length];
  const s=f*f*(3-2*f);

  return 'rgb('+A.map((v,k)=>
    Math.round(v+(B[k]-v)*s)
  ).join(',')+')';
}

let TG=null,TCELL=8;

function paintTitle(now){
  draw(
    document.getElementById('title'),
    TG,
    (i,w)=>pc(i/w*.4-now/15000),
    TCELL,
    {pad:4}
  );
}

function drawTitle(){
  TG=latinGrid('PIXEL NAMES');
  TCELL=Math.max(
    3,
    Math.min(9,Math.floor(Math.min(innerWidth-48,720)/TG.w))
  );
  paintTitle(performance.now());
}

// 16. PAGE ELEMENTS
const $=id=>document.getElementById(id);

let R=[],DL=null,NAME='';

try{
  window.claude&&claude.use('downloads')
    .then(d=>DL=d).catch(()=>{});
}catch(e){}

function toast(m){
  const t=$('toast');
  t.textContent=m;
  t.classList.add('on');
  clearTimeout(toast.t);
  toast.t=setTimeout(()=>t.classList.remove('on'),2400);
}

// 17. SAVE IMAGES
async function save(blob,fn){
  if(DL){
    try{
      await DL.save({filename:fn,data:blob});
      toast('Saved '+fn);
    }catch(e){
      if(e&&e.code==='declined')return;
      toast('Could not save the file here.');
    }
    return;
  }

  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=fn;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(()=>URL.revokeObjectURL(a.href),4000);
}

const toBlob=cv=>new Promise(r=>cv.toBlob(r,'image/png'));

const slug=s=>s.toLowerCase()
  .normalize('NFD')
  .replace(/[^a-z0-9]+/g,'-')
  .replace(/^-|-$/g,'')||'name';

// Download one card.
async function dlOne(r){
  const cv=document.createElement('canvas');
  const cell=Math.min(24,Math.floor(2400/r.grid.w));

  draw(cv,r.grid,r.col,cell,{
    pad:cell*3,
    bg:'#f8f5ef',
    dpr:1
  });

  save(
    await toBlob(cv),
    'pixel-name-'+slug(NAME)+'-'+r.id+'.png'
  );
}

// Download all cards together.
async function dlAll(){
  const items=R.filter(r=>r.grid);
  const W=1400,rowPad=70;
  let H=130;

  const cells=items.map(r=>{
    const c=Math.min(14,Math.floor((W-160)/r.grid.w));
    H+=r.grid.h*c+rowPad+30;
    return c;
  });

  const cv=document.createElement('canvas');
  cv.width=W;
  cv.height=H;

  const x=cv.getContext('2d');

  x.fillStyle='#f8f5ef';
  x.fillRect(0,0,W,H);

  x.fillStyle='#2a2830';
  x.font='700 38px '+SS;
  x.textBaseline='top';
  x.fillText('Pixel Names · '+NAME,60,40);

  let y=120;

  items.forEach((r,i)=>{
    x.fillStyle=r.col;
    x.fillRect(60,y+6,16,16);

    x.fillStyle='#2a2830';
    x.font='700 24px '+SS;
    x.fillText(r.name+' · '+r.nat,88,y);

    const t=document.createElement('canvas');

    draw(t,r.grid,r.col,cells[i],{
      pad:0,
      dpr:1
    });

    x.drawImage(t,80,y+46);
    y+=r.grid.h*cells[i]+rowPad+30;
  });

  save(
    await toBlob(cv),
    'pixel-name-'+slug(NAME)+'-all.png'
  );
}

// Fit the pixel pictures inside their cards.
function layout(){
  R.forEach(r=>{
    if(!r.grid)return;

    const aw=r.art.clientWidth-12;
    const cell=Math.max(
      2,
      Math.min(14,Math.floor((aw-16)/r.grid.w))
    );

    draw(r.cv,r.grid,r.col,cell);
  });
}

// 18. GENERATE THE RESULTS
function generate(){
  const inp=$('name');
  const name=inp.value.replace(/\s+/g,' ').trim().slice(0,24);

  if(!name){
    inp.classList.remove('shake');
    void inp.offsetWidth;
    inp.classList.add('shake');

    $('hint').textContent='Please type your name first 🙂';
    inp.focus();
    return;
  }

  $('hint').textContent='';
  NAME=name;

  const grid=$('grid');
  grid.innerHTML='';

  R=build(name);

  R.forEach(r=>{
    const c=document.createElement('article');
    c.className='card';

    c.innerHTML=
      '<div class="ch"><span class="dot"></span>'+
      '<span class="ln"></span><span class="nat"></span></div>'+
      '<div class="art"></div><div class="txt"></div>'+
      '<div class="note"></div>';

    c.querySelector('.dot').style.background=r.col;
    c.querySelector('.ln').textContent=r.name;
    c.querySelector('.nat').textContent=r.nat;
    c.querySelector('.txt').textContent=r.text||'—';
    c.querySelector('.note').textContent=r.note;

    if(r.k==='a'){
      c.querySelector('.txt').dir='rtl';
    }

    r.art=c.querySelector('.art');

    if(r.grid){
      r.cv=document.createElement('canvas');
      r.art.appendChild(r.cv);

      const b=document.createElement('button');
      b.className='dl';
      b.textContent='⬇ Download PNG';
      b.onclick=()=>dlOne(r);

      c.appendChild(b);
    }

    grid.appendChild(c);
  });

  $('rt').textContent='Results for “'+name+'”';
  $('results').style.display='block';

  layout();

  setTimeout(()=>{
    $('results').scrollIntoView({
      behavior:'smooth',
      block:'start'
    });
  },80);
}

// 19. BUTTONS AND KEYBOARD
$('go').onclick=generate;
$('all').onclick=dlAll;

$('name').addEventListener('keydown',e=>{
  if(e.key==='Enter')generate();
});

// Resize the title and cards when the browser changes size.
let rt;

addEventListener('resize',()=>{
  clearTimeout(rt);

  rt=setTimeout(()=>{
    drawTitle();
    if(R.length)layout();
  },150);
});

// 20. START THE WEBSITE
drawTitle();

(function flow(t){
  if(!matchMedia('(prefers-reduced-motion:reduce)').matches){
    paintTitle(t);
  }

  requestAnimationFrame(flow);
})(0);

// Floating background decorations.
for(let i=0;i<16;i++){
  const d=document.createElement('div');
  const s=6+Math.floor(Math.random()*3)*4;

  d.className='deco';

  d.style.cssText=
    'width:'+s+'px;height:'+s+'px;'+
    'left:'+Math.random()*100+'%;'+
    'top:'+Math.random()*100+'%;'+
    'background:'+PAL[i%PAL.length]+';'+
    'animation-delay:-'+Math.random()*3+'s;'+
    'opacity:'+(.18+Math.random()*.25);

  document.body.appendChild(d);
}
