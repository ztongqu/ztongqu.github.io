const palette={sky:'#547c79',mount:'#365959',pine:'#183c32',leaf:'#45783e',light:'#85aa51',grass:'#81a84d',soil:'#5d4936'};
function setup(canvas,w,h){canvas.width=w;canvas.height=h;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;return c}
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h)}
function tree(c,x,y,s=1){rect(c,x-2*s,y,4*s,35*s,'#65553a');for(let i=0;i<5;i++){let width=(6+i*5)*s;rect(c,x-width/2,y-25*s+i*8*s,width,10*s,i%2?'#315e39':'#3f7040');rect(c,x-width/2,y-25*s+i*8*s,3*s,8*s,'#527f45')}}
function landscape(canvas,night=false){const w=480,h=245,c=setup(canvas,w,h);rect(c,0,0,w,h,night?'#192a3c':palette.sky);rect(c,0,130,w,115,night?'#253644':'#3d6255');
 if(night){rect(c,366,27,20,20,'#e4e6bf');rect(c,361,32,30,10,'#e4e6bf');for(let i=0;i<65;i++){let x=(i*73+25)%480,y=(i*29)%120;rect(c,x,y,1+i%2,1,'#a3b8c7')}}else{rect(c,369,31,28,28,'#e6d8a4');rect(c,365,36,36,18,'#e6d8a4');for(let i=0;i<5;i++){let x=i*109-25;rect(c,x,31+i%3*14,40,5,'#abc1ac');rect(c,x+8,26+i%3*14,25,7,'#abc1ac')}}
 for(let layer=0;layer<3;layer++){c.fillStyle=night?['#2e4651','#29454b','#203e3d'][layer]:['#66887b','#476c64','#31574e'][layer];c.beginPath();c.moveTo(0,180);for(let x=0;x<=w;x+=9)c.lineTo(x,100+layer*20-Math.sin(x/65+layer*2)*30-Math.sin(x/27+layer)*12);c.lineTo(w,190);c.lineTo(0,190);c.fill()}
 for(let i=0;i<20;i++)tree(c,i*28+5,153+(i%3)*4,.8+(i%4)*.15);
 const ground=174;rect(c,0,ground,w,h-ground,'#433b31');rect(c,0,ground,w,5,'#779b49');rect(c,0,ground+5,w,4,'#506d37');for(let i=0;i<390;i++){let x=(i*79)%w,y=ground+12+(i*31)%60;rect(c,x,y,3,2,i%3?'#564838':'#332e29')}
 // A small cabin and a lantern create a destination in the world.
 rect(c,326,140,50,32,'#946d42');for(let i=0;i<4;i++)rect(c,326,145+i*7,50,1,'#6c4b34');for(let i=0;i<7;i++)rect(c,322+i*3,137-i*3,58-i*6,3,'#473b35');rect(c,347,151,10,21,'#423c2d');rect(c,330,149,10,9,'#edc96d');rect(c,362,149,10,9,'#edc96d');rect(c,329,153,12,1,'#8c683b');rect(c,367,109,6,17,'#6c4b3d');rect(c,370,101,5,4,'#a5b5a3');rect(c,373,91,7,5,'#a5b5a3');
 // Open cavern, stone shelves and mineral veins.
 c.fillStyle='#1c292a';c.beginPath();c.moveTo(250,191);c.lineTo(277,180);c.lineTo(307,191);c.lineTo(338,195);c.lineTo(370,186);c.lineTo(426,199);c.lineTo(480,188);c.lineTo(480,245);c.lineTo(234,245);c.fill();for(let i=0;i<18;i++){let x=260+i*13,y=206+(i*17)%33;rect(c,x,y,3,8,i%3?'#63a9a0':'#aac17e');rect(c,x-2,y+5,7,3,'#447a77')}rect(c,220,183,5,55,'#8d7651');rect(c,235,183,5,55,'#8d7651');for(let y=187;y<240;y+=7)rect(c,220,y,20,2,'#a18a60');
 for(let i=0;i<35;i++){let x=(i*43+7)%480;rect(c,x,170,2,4,'#a7bf64')}return c}
if(document.querySelector("#world")) landscape(document.querySelector("#world"));
if(document.querySelector("#avatar")){const avatar=setup(document.querySelector('#avatar'),80,80);rect(avatar,0,0,80,80,'#253e2c');rect(avatar,22,68,37,3,'#1b3021');rect(avatar,31,20,21,8,'#6a4630');rect(avatar,28,26,27,13,'#6a4630');rect(avatar,32,29,20,19,'#dab282');rect(avatar,47,33,3,3,'#203426');rect(avatar,29,48,25,16,'#95b861');rect(avatar,26,51,5,13,'#dab282');rect(avatar,54,51,5,13,'#dab282');rect(avatar,32,64,8,10,'#536a69');rect(avatar,45,64,8,10,'#536a69');rect(avatar,30,74,11,4,'#bdab79');rect(avatar,44,74,11,4,'#bdab79');
}
