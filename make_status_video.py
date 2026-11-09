import re, math, random, subprocess, textwrap
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H,FPS,DUR=720,1280,30,30
SCROLL_END=25.0
src=open('../index.html',encoding='utf-8').read().replace('\t','  ')
mono=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',20)
monob=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf',14)
bold=lambda s:ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',s)
reg=lambda s:ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',s)
CW=mono.getlength('M')
# wrap
rows=[]
for i,l in enumerate(src.split('\n'),1):
    ind=len(l)-len(l.lstrip())
    parts=textwrap.wrap(l,50,subsequent_indent=' '*(min(ind,8)+2),drop_whitespace=False,replace_whitespace=False) or ['']
    for j,p in enumerate(parts): rows.append((i if j==0 else None,p))
LH=27
TOP,BOT=200,1130; VIEW=BOT-TOP
BG=(12,10,10)
tall=Image.new('RGB',(W,len(rows)*LH+VIEW*2),BG)
d=ImageDraw.Draw(tall)
pat=re.compile(r'(?P<c>/\*.*?\*/|//.*)|(?P<s>"[^"]*"|\'[^\']*\'|`[^`]*`)|(?P<t></?[a-zA-Z][a-zA-Z0-9]*|/?>)|(?P<k>\b(?:const|let|function|return|if|else|new|forEach|var|true|false)\b)|(?P<n>#?\b\d[\w.%]*)|(?P<p>[a-z-]+(?=:))')
col={'c':(110,110,110),'s':(255,211,77),'t':(255,106,0),'k':(255,150,70),'n':(120,220,255),'p':(220,200,190)}
for r,(ln,txt) in enumerate(rows):
    y=VIEW+r*LH
    if ln: d.text((18,y+4),str(ln),font=monob,fill=(90,80,75))
    x=80;pos=0
    for m in pat.finditer(txt):
        if m.start()>pos: d.text((x,y),txt[pos:m.start()],font=mono,fill=(235,228,222)); x+=CW*(m.start()-pos)
        k=m.lastgroup;seg=m.group(0);d.text((x,y),seg,font=mono,fill=col[k]);x+=CW*len(seg);pos=m.end()
    if pos<len(txt): d.text((x,y),txt[pos:],font=mono,fill=(235,228,222))
total=tall.height-VIEW*2
print('rows',len(rows),'scroll px',total)
# fades
fade=Image.new('RGBA',(W,VIEW),(0,0,0,0));fp=fade.load()
for y in range(VIEW):
    a=0
    if y<90:a=int(255*(1-y/90))
    if y>VIEW-110:a=int(255*((y-(VIEW-110))/110))
    for x in range(W):fp[x,y]=BG+(a,)
# static frame parts
static=Image.new('RGB',(W,H),BG);sd=ImageDraw.Draw(static)
for i,c in enumerate([(255,95,86),(255,189,46),(39,201,63)]): sd.ellipse((24+i*28,24,40+i*28,40),fill=c)
sd.text((130,22),'vibecraft-frames.html',font=reg(18),fill=(150,140,135))
sd.line((0,TOP-2,W,TOP-2),fill=(50,42,38),width=2);sd.line((0,BOT+2,W,BOT+2),fill=(50,42,38),width=2)
sd.text((W//2,1205),'@vibecraft_frames',font=bold(34),fill=(255,150,60),anchor='mm')
sd.text((W//2,1250),'Owner: Happy Raj Gupta',font=reg(20),fill=(150,140,135),anchor='mm')
random.seed(4)
EM=[dict(x=random.random()*W,y0=random.random()*H,v=60+random.random()*160,r=1+random.random()*2.5,ph=random.random()*6) for _ in range(55)]
def fire_text(txt,size,cx,cy,t,img,glow=True):
    f=bold(size);layer=Image.new('L',(W,H),0);ImageDraw.Draw(layer).text((cx,cy),txt,font=f,fill=255,anchor='mm')
    bb=layer.getbbox()
    if not bb:return
    gr=Image.new('RGB',(W,H));gp=ImageDraw.Draw(gr)
    y0,y1=bb[1],bb[3];sh=int(12*math.sin(t*9))
    for y in range(y0-30,y1+30):
        u=1-((y-y0+sh)/max(1,(y1-y0)));u=min(1,max(0,u))
        c=(255,int(60+195*u**1.1),int(0+120*u**3))
        gp.line((0,y,W,y),fill=c)
    if glow:
        g=layer.filter(ImageFilter.GaussianBlur(14));fl=int(120+60*math.sin(t*13))
        glowc=Image.new('RGB',(W,H),(255,90,0));img.paste(glowc,(0,0),g.point(lambda v:min(255,v*fl//100)))
    img.paste(gr,(0,0),layer)
def ease(u):
    s=u*u*(3-2*u);return .7*u+.3*s
proc=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','20','-movflags','+faststart','vibecraft-status.mp4'],stdin=subprocess.PIPE)
for n in range(FPS*DUR):
    t=n/FPS
    u=min(1,t/SCROLL_END);off=int(total*ease(u))
    f=static.copy()
    f.paste(tall.crop((0,off,W,off+VIEW)),(0,TOP))
    f.paste(fade,(0,TOP),fade)
    # header title
    fire_text('VIBECRAFT FRAMES',40,W//2,112,t,f)
    # progress bar
    ImageDraw.Draw(f).rectangle((0,0,int(W*t/DUR),5),fill=(255,106,0))
    # embers
    lay=Image.new('RGBA',(W,H),(0,0,0,0));ld=ImageDraw.Draw(lay)
    for e in EM:
        y=(e['y0']-e['v']*t)%(H+40)-20;x=e['x']+14*math.sin(t*2+e['ph']);a=int(200*max(0,y/H)**0.7)+30
        ld.ellipse((x-e['r'],y-e['r'],x+e['r'],y+e['r']),fill=(255,int(120+e['r']*25),40,min(255,a)))
    f=Image.alpha_composite(f.convert('RGBA'),lay).convert('RGB')
    # end card
    if t>SCROLL_END-1.5:
        a=min(1,(t-(SCROLL_END-1.5))/1.8)
        ov=Image.new('RGB',(W,H),(8,6,6));f=Image.blend(f,ov,0.93*a) if a<1 else Image.blend(f,ov,0.93)
        card=f.copy()
        fire_text('VIBECRAFT',92,W//2,520,t,card);fire_text('FRAMES',92,W//2,640,t,card)
        cd=ImageDraw.Draw(card)
        cd.text((W//2,780),'Turning raw footage',font=reg(30),fill=(235,228,222),anchor='mm')
        cd.text((W//2,822),'into cinematic stories.',font=reg(30),fill=(235,228,222),anchor='mm')
        cd.text((W//2,930),'@vibecraft_frames',font=bold(36),fill=(255,150,60),anchor='mm')
        f=Image.blend(f,card,a)
    proc.stdin.write(f.tobytes())
proc.stdin.close();proc.wait()
print('done')
