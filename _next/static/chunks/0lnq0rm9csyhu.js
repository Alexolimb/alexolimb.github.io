(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,81474,e=>{"use strict";var t=e.i(43476),r=e.i(94800),a=e.i(48546),i=e.i(71645),o=e.i(90072),n=e.i(32822);let u=`
  varying vec3 vNormal;
  varying vec3 vVzglyad;
  varying vec4 vEkran;
  varying float vDyhanie;

  uniform float uTime;
  uniform float uAmplituda;

  // Дешёвый шум Перлина-подобного вида. Полноценный симплекс здесь
  // избыточен: форма дышит медленно, глазу хватает трёх октав.
  vec3 hash3(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float shum(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(dot(hash3(i + vec3(0,0,0)), f - vec3(0,0,0)),
              dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
          mix(dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0)),
              dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x), u.y),
      mix(mix(dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1)),
              dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
          mix(dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1)),
              dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x), u.y),
      u.z);
  }

  void main() {
    vec3 p = position;

    // Дыхание: три волны разной частоты. Одна читалась бы как пульс
    // насоса — ровный и механический; три никогда не совпадают фазами,
    // и движение перестаёт быть предсказуемым.
    float d =
      shum(normal * 1.6 + vec3(0.0, uTime * 0.13, 0.0)) * 1.0 +
      shum(normal * 3.4 - vec3(uTime * 0.09, 0.0, 0.0)) * 0.45 +
      shum(normal * 7.1 + vec3(0.0, 0.0, uTime * 0.16)) * 0.18;

    vDyhanie = d;
    p += normal * d * uAmplituda;

    // Нормаль оставляем исходной: точная после деформации потребовала бы
    // соседних вершин, а при таком мягком шуме разница на глаз не видна.
    // Производных (dFdx) в вершинном шейдере не существует — они только
    // во фрагментном.
    vNormal = normalize(normalMatrix * normal);

    vec4 mirovaya = modelMatrix * vec4(p, 1.0);
    vVzglyad = normalize(cameraPosition - mirovaya.xyz);

    vec4 poz = projectionMatrix * viewMatrix * mirovaya;
    vEkran = poz;
    gl_Position = poz;
  }
`,l=`
  precision highp float;

  varying vec3 vNormal;
  varying vec3 vVzglyad;
  varying vec4 vEkran;
  varying float vDyhanie;

  uniform sampler2D uFon;
  uniform vec3 uTeplyy;
  uniform vec3 uHolodnyy;
  uniform vec3 uBlik;
  uniform float uSila;
  uniform float uMatovost;
  uniform float uProyavlen;

  void main() {
    // Куда смотреть на фоне: экранные координаты этого пикселя,
    // сдвинутые по нормали. Это и есть преломление.
    vec2 ekran = (vEkran.xy / vEkran.w) * 0.5 + 0.5;
    vec2 sdvig = vNormal.xy * uSila;

    // Матовость: несколько сэмплов по кругу вместо честного размытия.
    vec3 za = vec3(0.0);
    const int N = 5;
    for (int i = 0; i < N; i++) {
      float a = float(i) / float(N) * 6.2831853;
      vec2 k = vec2(cos(a), sin(a)) * uMatovost;
      za += texture2D(uFon, clamp(ekran + sdvig + k, 0.001, 0.999)).rgb;
    }
    za /= float(N);

    // Френель: у края взгляд скользит по поверхности, и стекло там
    // почти зеркало. В середине смотрим насквозь.
    float f = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vVzglyad)), 0.0, 1.0), 4.2);

    // Блик от той же лампы, что светит воде — иначе форма выглядит
    // вырезанной из другой картинки.
    vec3 svet = normalize(vec3(0.35, 0.75, 0.55));
    float spec = pow(max(dot(reflect(-svet, normalize(vNormal)), normalize(vVzglyad)), 0.0), 42.0);

    // Толща самого стекла: там, где форма выпятилась дыханием, она
    // гуще и заметно теплее.
    vec3 tolshcha = mix(uHolodnyy * 0.22, uTeplyy * 0.26, clamp(vDyhanie * 0.9 + 0.42, 0.0, 1.0));

    // Стекло почти не гасит то, что за ним: гасит только у самого края,
    // где взгляд скользит по поверхности. Мутный шар получается ровно
    // тогда, когда толща подмешана в середину, а не в кромку.
    vec3 cvet = za * (1.0 - f * 0.34) + tolshcha * (0.05 + f * 0.62) + uBlik * spec * 1.5;

    // Кромка: тонкая тёплая линия по самому краю. Без неё форма
    // сливается с водой и читается как пятно, а не как предмет.
    float kromka = smoothstep(0.42, 0.98, f);
    cvet += mix(uHolodnyy, uBlik, 0.4) * kromka * 0.52;

    gl_FragColor = vec4(cvet, uProyavlen);
  }
`;var s=e.i(32700);function v({fon:e,detalnost:n,zamerlo:c}){let d=(0,i.useRef)(null),h=(0,a.useThree)(e=>e.size),m=(0,i.useRef)(new o.Vector2(0,0)),f=(0,i.useRef)(new o.Vector2(0,0)),y=(0,i.useRef)(0),[p,g]=(0,i.useState)(()=>s.rezhim.vnutri);(0,i.useEffect)(()=>s.rezhim.podpisatsya(g),[]);let w=(0,i.useRef)(+!!s.rezhim.vnutri),z=(0,i.useMemo)(()=>new o.ShaderMaterial({vertexShader:u,fragmentShader:l,transparent:!0,depthWrite:!1,uniforms:{uFon:{value:e},uTime:{value:0},uAmplituda:{value:.115},uSila:{value:.105},uMatovost:{value:.0035},uProyavlen:{value:0},uTeplyy:{value:new o.Color("#e8a85c")},uHolodnyy:{value:new o.Color("#8aa9d6")},uBlik:{value:new o.Color("#f6ead6")}}}),[]),x=(0,i.useMemo)(()=>new o.IcosahedronGeometry(1,n),[n]);return(0,r.useFrame)((t,r)=>{let a=d.current;if(!a)return;let i=a.material.uniforms;if(i.uFon.value=e,c||(i.uTime.value=t.clock.elapsedTime),y.current+=(1-y.current)*Math.min(1,2.4*r),i.uProyavlen.value=y.current,a.visible=y.current>.01&&w.current<.72,!a.visible)return;let o=t.pointer;m.current.set(o.x,o.y),f.current.lerp(m.current,Math.min(1,1.1*r)),w.current+=(!!p-w.current)*Math.min(1,2.2*r);let n=w.current,u=h.width<900;a.position.set((u?.15:1.55)+n*(u?1.6:1.5)+.16*f.current.x*(1-.7*n),(u?1.05:.72)+.95*n+.12*f.current.y*(1-.7*n),-(2.2*n)),a.scale.setScalar((u?.6:.78)*(1-.55*n)),i.uProyavlen.value=y.current*Math.max(0,1-1.35*n),c||(a.rotation.y+=.12*r,a.rotation.x=.34*f.current.y,a.rotation.z=-(.16*f.current.x))}),(0,t.jsx)("mesh",{ref:d,geometry:x,material:z,frustumCulled:!1})}var c=e.i(31878);let d={vysokoe:44,srednee:30,nizkoe:18},h=`
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,m=`
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uKartinka;
  void main() {
    gl_FragColor = vec4(texture2D(uKartinka, vUv).rgb, 1.0);
  }
`;e.s(["default",0,function({tiho:e}){let u=(0,a.useThree)(e=>e.gl),l=(0,a.useThree)(e=>e.scene),f=(0,a.useThree)(e=>e.camera),y=(0,a.useThree)(e=>e.size),p=(0,a.useThree)(e=>e.viewport.dpr),g=(0,i.useRef)(null),w=(0,i.useRef)(null),[z,x]=(0,i.useState)(c.pervayaDogadka),M=(0,i.useRef)(z),k=(0,i.useRef)({x:.5,y:.5,dx:0,dy:0,bylo:!1,dvigalsya:!1}),T=(0,i.useRef)({faza:.37,sleduyushchiy:0,vdohov:0}),S=(0,i.useRef)(0),[R,E]=(0,i.useState)(!1),b=(0,i.useMemo)(()=>new o.WebGLRenderTarget(2,2,{depthBuffer:!1,stencilBuffer:!1,generateMipmaps:!1,minFilter:o.LinearFilter,magFilter:o.LinearFilter}),[]),P=(0,i.useMemo)(()=>{let e=new o.RawShaderMaterial({vertexShader:h,fragmentShader:m,depthTest:!1,depthWrite:!1,uniforms:{uKartinka:{value:b.texture}}}),t=new o.Mesh(new o.PlaneGeometry(2,2),e);return t.frustumCulled=!1,t.renderOrder=-1,t},[b]);return(0,i.useEffect)(()=>(l.add(P),()=>{l.remove(P),P.geometry.dispose(),P.material.dispose()}),[l,P]),(0,i.useEffect)(()=>{let e=M.current;w.current=new c.NablyudatelKadrov(e);let t=new n.FluidSim(u,n.KACHESTVO[e]);t.resize(y.width,y.height),g.current=t,new URLSearchParams(window.location.search).has("syro")&&t.syroyRezhim(!0),window.__ami={yavlenie:"voda",diagnoz:t.diagnoz,schet:()=>({...t.schet}),uroven:()=>w.current?.tekushchiy};let r=(e,r,a,i,o)=>{for(let n=0;n<e;n++){let e=Math.random()*Math.PI*2,n=r*(.25+.75*Math.random()),u=.5+Math.cos(e)*n*1.55,l=.5+Math.sin(e)*n,s=e+Math.PI/2*o+(Math.random()-.5)*.8,v=(.5+.7*Math.random())*620;t.splat(u,l,Math.cos(s)*v,Math.sin(s)*v,a*(.65+.6*Math.random()),i*(.55+1.2*Math.random()))}};r(4,.42,1.2,9e-4,1);for(let e=0;e<30;e++)t.step(1/60);r(6,.6,.8,35e-5,-1);for(let e=0;e<26;e++)t.step(1/60);r(8,.72,.5,14e-5,1);for(let e=0;e<20;e++)t.step(1/60);return()=>{t.dispose(),g.current=null}},[u]),(0,i.useEffect)(()=>{g.current?.resize(y.width,y.height),b.setSize(Math.max(2,Math.round(y.width*p)),Math.max(2,Math.round(y.height*p)))},[y.width,y.height,p,b]),(0,i.useEffect)(()=>{if(e)return;let t=(e,t)=>{let r=k.current,a=e/window.innerWidth,i=1-t/window.innerHeight;r.bylo&&(r.dx+=(a-r.x)*window.innerWidth,r.dy+=(i-r.y)*window.innerHeight,r.dvigalsya=!0),r.x=a,r.y=i,r.bylo=!0},r=e=>t(e.clientX,e.clientY),a=e=>{let r=e.touches[0];r&&t(r.clientX,r.clientY)},i=()=>{k.current.bylo=!1};return window.addEventListener("pointermove",r,{passive:!0}),window.addEventListener("touchmove",a,{passive:!0}),window.addEventListener("pointerleave",i),()=>{window.removeEventListener("pointermove",r),window.removeEventListener("touchmove",a),window.removeEventListener("pointerleave",i)}},[e]),(0,i.useEffect)(()=>{S.current=2.6*!!e},[e]),(0,r.useFrame)((t,r)=>{let a=g.current;if(!a)return;if(e&&S.current>0?(S.current-=r,S.current<=0&&E(!0)):!e&&R&&E(!1),!e||S.current>0){let e=s.rezhim.ruchki;a.nastroit(e.curl,e.zatuhanie);let t=k.current;if(t.dvigalsya){let r=Math.min(1.4,.35+Math.hypot(t.dx,t.dy)/260)*e.sila;a.splat(t.x,t.y,5.5*t.dx*e.sila,5.5*t.dy*e.sila,r,e.radius),t.dx=0,t.dy=0,t.dvigalsya=!1}let i=T.current;if(i.faza+=r,i.faza>i.sleduyushchiy){let e=1+3.5*s.rezhim.ruchki.zatuhanie;i.sleduyushchiy=i.faza+(.34+.5*Math.random())/e,i.vdohov++;let t=i.vdohov%5==0,r=Math.random()*Math.PI*2,o=.5+.3*Math.cos(.23*i.faza)+(Math.random()-.5)*.62,n=.52+.22*Math.sin(.17*i.faza)+(Math.random()-.5)*.5,u=t?260:520;a.splat(o,n,Math.cos(r)*u,Math.sin(r)*u,t?.8:.52,s.rezhim.ruchki.radius*(t?3.4:1))}a.step(r)}if(a.pokazat(b),u.setRenderTarget(null),u.render(l,f),e)return;let i=w.current,o=i?.kadr(r,1e3*t.clock.elapsedTime);o&&i&&(a.perestroit(i.nastroyki),x(o))},1),(0,t.jsx)(v,{fon:b.texture,detalnost:d[z],zamerlo:e&&R})}],81474)},73327,function(e){e.n(e.i(81474))},32700,e=>{"use strict";let t={curl:22,zatuhanie:.19,radius:42e-5,sila:1},r={...t},a=new Set,i=!1,o=new Set;e.s(["rezhim",0,{get vnutri(){return i},ustanovit(e){if(e!==i)for(let t of(i=e,o))t(e)},get ruchki(){return r},krutit(e){for(let t of(r={...r,...e},a))t(r)},sbrosit(){for(let e of(r={...t},a))e(r)},podpisatsyaNaRuchki:e=>(a.add(e),e(r),()=>{a.delete(e)}),podpisatsya:e=>(o.add(e),e(i),()=>{o.delete(e)})}])}]);