(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,13222,e=>{"use strict";var t=e.i(43476),a=e.i(94800),r=e.i(48546),o=e.i(71645),i=e.i(90072),n=e.i(31878);let u=`
  vec3 mesto(vec3 baza, float semya, float t) {
    float a = t * 0.09 + semya * 6.28318;
    return (baza + vec3(
      sin(a * 1.13 + semya * 3.10) * 0.075,
      cos(a * 0.97 + semya * 1.70) * 0.062,
      sin(a * 0.71 + semya * 5.30) * 0.070
    )) * uRazmah;
  }
`,l=`
  precision highp float;

  uniform float uTime;
  uniform vec3 uRazmah;
  uniform float uDpr;
  uniform vec2 uMysh;
  uniform float uSila;

  attribute float aSemya;
  attribute float aVes;

  varying float vZhar;
  varying float vVes;

  ${u}

  void main() {
    vec3 p = mesto(position, aSemya, uTime);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 ekran = projectionMatrix * mv;

    // Узел под курсором разгорается. Не \xabподсветка при наведении\xbb:
    // разгорается плавно и не один, а весь ближний круг — так видно,
    // что сеть связная, а не набор отдельных точек.
    vec2 vNdc = ekran.xy / max(ekran.w, 0.0001);
    float blizko = 1.0 - smoothstep(0.0, 0.55, distance(vNdc, uMysh));
    vZhar = blizko * uSila;
    vVes = aVes;

    gl_PointSize = (5.0 + aVes * 7.0) * (1.0 + vZhar * 1.4) * (2.6 / max(-mv.z, 0.2)) * uDpr;
    gl_Position = ekran;
  }
`,s=`
  precision highp float;

  uniform vec3 uHolod;
  uniform vec3 uTeplo;

  varying float vZhar;
  varying float vVes;

  void main() {
    vec2 k = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(k, k);
    if (r2 > 1.0) discard;

    // Мягкое ядро с длинным хвостом: точка должна читаться как
    // светящаяся, а не как наклеенный кружок.
    float yadro = pow(1.0 - r2, 2.6);
    float oreol = pow(1.0 - r2, 0.85) * 0.28;

    vec3 cvet = mix(uHolod, uTeplo, clamp(vZhar, 0.0, 1.0));
    float a = (yadro + oreol) * (0.36 + vVes * 0.42 + vZhar * 0.55);
    gl_FragColor = vec4(cvet * (0.75 + vZhar * 0.9), a);
  }
`,v=`
  precision highp float;

  uniform float uTime;
  uniform vec3 uRazmah;
  uniform vec2 uMysh;
  uniform float uSila;

  attribute float aSemya;
  attribute float aSila;

  varying float vSila;
  varying float vZhar;

  ${u}

  void main() {
    vec3 p = mesto(position, aSemya, uTime);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 ekran = projectionMatrix * mv;

    vec2 vNdc = ekran.xy / max(ekran.w, 0.0001);
    vZhar = (1.0 - smoothstep(0.0, 0.6, distance(vNdc, uMysh))) * uSila;
    vSila = aSila;

    gl_Position = ekran;
  }
`,f=`
  precision highp float;

  uniform vec3 uHolod;
  uniform vec3 uTeplo;

  varying float vSila;
  varying float vZhar;

  void main() {
    // Связи стали ЗАМЕТНО ярче: было 0.17 в основании, стало 0.32.
    //
    // Причина — прямое слово Алексея про эту страницу: \xabзадний фон,
    // просто статистическая картинка\xbb. Сеть на ней жила и жила
    // по-настоящему — узлы дышали, пакеты бежали, — но на чернильном
    // фоне стальные линии в семнадцать сотых видно только если знать,
    // что они там есть. Живое, которого не видно, ничем не отличается
    // от нарисованного.
    //
    // Под указателем связь ещё и теплеет: холодная линия у самой руки
    // читается как чужая, а тёплая — как отозвавшаяся.
    vec3 cvet = mix(uHolod, uTeplo, clamp(vZhar * 0.7, 0.0, 1.0));
    gl_FragColor = vec4(cvet, vSila * (0.32 + vZhar * 0.78));
  }
`,m=`
  precision highp float;

  uniform float uTime;
  uniform vec3 uRazmah;
  uniform float uDpr;

  /** Куда летит: вторая точка связи и её семя. */
  attribute vec3 aKuda;
  attribute float aSemyaOt;
  attribute float aSemyaDo;
  attribute float aFaza;
  attribute float aSkorost;

  varying float vYarko;

  ${u}

  void main() {
    float hod = fract(uTime * aSkorost + aFaza);

    vec3 ot = mesto(position, aSemyaOt, uTime);
    vec3 kuda = mesto(aKuda, aSemyaDo, uTime);
    vec3 p = mix(ot, kuda, hod);

    // Пакет вспыхивает на старте и гаснет у цели — иначе он мигал бы
    // в момент перескока обратно к началу, и вся сеть дёргалась бы
    // разом, как гирлянда.
    vYarko = smoothstep(0.0, 0.08, hod) * (1.0 - smoothstep(0.72, 1.0, hod));

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    // Пакет крупнее прежнего в полтора раза. Он и есть главное
    // доказательство, что сеть работает, а не нарисована, — а в семь с
    // половиной точек его на большом экране просто не замечали.
    gl_PointSize = 11.0 * vYarko * (2.6 / max(-mv.z, 0.2)) * uDpr;
    gl_Position = projectionMatrix * mv;
  }
`,c=`
  precision highp float;

  uniform vec3 uTeplo;
  uniform vec3 uBlik;

  varying float vYarko;

  void main() {
    vec2 k = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(k, k);
    if (r2 > 1.0) discard;

    float yadro = pow(1.0 - r2, 3.2);
    float oreol = pow(1.0 - r2, 0.7) * 0.34;
    vec3 cvet = mix(uTeplo, uBlik, yadro * 0.75);
    gl_FragColor = vec4(cvet, (yadro + oreol) * vYarko * 0.95);
  }
`,d=`
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,h=`
  precision highp float;

  uniform float uTime;
  uniform vec3 uDno;
  uniform vec3 uVerh;

  varying vec2 vUv;

  void main() {
    // Не плоская заливка: толща светлеет кверху, и по ней ходят два
    // медленных пятна света. Плоский фон под светящейся сетью читается
    // как чёрный прямоугольник, и вся глубина пропадает.
    float glubina = smoothstep(0.0, 1.0, vUv.y);
    vec3 c = mix(uDno, uVerh, glubina * 0.85);

    float t = uTime * 0.055;
    float a = exp(-9.0 * distance(vUv, vec2(0.26 + sin(t) * 0.08, 0.72 + cos(t * 0.8) * 0.06)));
    float b = exp(-13.0 * distance(vUv, vec2(0.78 + cos(t * 0.7) * 0.07, 0.30 + sin(t * 1.1) * 0.05)));

    c += uVerh * (a * 0.26 + b * 0.16);
    gl_FragColor = vec4(c, 1.0);
  }
`,p={nizkoe:46,srednee:84,vysokoe:124},y=new i.Color("#8aa9d6"),w=new i.Color("#e8a85c"),g=new i.Color("#f6ead6"),b=new i.Color("#0a1024"),A=new i.Color("#1b2f57");function S(){return{uTime:{value:0},uRazmah:{value:new i.Vector3(1,1,1)},uDpr:{value:1},uMysh:{value:new i.Vector2(0,0)},uSila:{value:0},uHolod:{value:y},uTeplo:{value:w},uBlik:{value:g}}}function x(){return{uTime:{value:0},uDno:{value:b},uVerh:{value:A}}}e.s(["default",0,function({tiho:e}){let u=(0,r.useThree)(e=>e.size),y=(0,r.useThree)(e=>e.viewport.dpr),w=(0,r.useThree)(e=>e.viewport),g=(0,r.useThree)(e=>e.scene),b=(0,o.useMemo)(()=>(0,n.pervayaDogadka)(),[]),A=(0,o.useMemo)(()=>(function(e,t=7){let a,r=(a=t>>>0,()=>(a=1664525*a+0x3c6ef35f>>>0)/0x100000000),o=new Float32Array(3*e),n=new Float32Array(e),u=new Float32Array(e),l=[],s=Math.PI*(3-Math.sqrt(5));for(let t=0;t<e;t++){let a=Math.sqrt((t+.5)/e),v=t*s,f=Math.cos(v)*a+(r()-.5)*.14,m=Math.sin(v)*a*.72+(r()-.5)*.12,c=(r()-.5)*1.6;o[3*t]=f,o[3*t+1]=m,o[3*t+2]=c,n[t]=r(),u[t]=.16>r()?.7+.3*r():.42*r(),l.push(new i.Vector3(f,m,c))}let v=new i.BufferGeometry;v.setAttribute("position",new i.BufferAttribute(o,3)),v.setAttribute("aSemya",new i.BufferAttribute(n,1)),v.setAttribute("aVes",new i.BufferAttribute(u,1));let f=new Set,m=[];for(let t=0;t<e;t++)for(let{j:e,d:a}of l.map((e,a)=>({j:a,d:a===t?1/0:l[t].distanceTo(e)})).sort((e,t)=>e.d-t.d).slice(0,2)){let r=t<e?`${t}-${e}`:`${e}-${t}`;f.has(r)||(f.add(r),m.push([t,e,a]))}let c=new Float32Array(2*m.length*3),d=new Float32Array(2*m.length),h=new Float32Array(2*m.length);m.forEach(([e,t,a],r)=>{let i=Math.max(.18,1-1.35*a);for(let[a,u]of[[0,e],[1,t]]){let e=(2*r+a)*3;c[e]=o[3*u],c[e+1]=o[3*u+1],c[e+2]=o[3*u+2],d[2*r+a]=n[u],h[2*r+a]=i}});let p=new i.BufferGeometry;p.setAttribute("position",new i.BufferAttribute(c,3)),p.setAttribute("aSemya",new i.BufferAttribute(d,1)),p.setAttribute("aSila",new i.BufferAttribute(h,1));let y=Math.max(12,Math.round(.44*m.length)),w=new Float32Array(3*y),g=new Float32Array(3*y),b=new Float32Array(y),A=new Float32Array(y),S=new Float32Array(y),x=new Float32Array(y);for(let e=0;e<y;e++){let[t,a]=m[Math.floor(r()*m.length)],[i,u]=.5>r()?[t,a]:[a,t];w.set([o[3*i],o[3*i+1],o[3*i+2]],3*e),g.set([o[3*u],o[3*u+1],o[3*u+2]],3*e),b[e]=n[i],A[e]=n[u],S[e]=r(),x[e]=.055+.085*r()}let k=new i.BufferGeometry;return k.setAttribute("position",new i.BufferAttribute(w,3)),k.setAttribute("aKuda",new i.BufferAttribute(g,3)),k.setAttribute("aSemyaOt",new i.BufferAttribute(b,1)),k.setAttribute("aSemyaDo",new i.BufferAttribute(A,1)),k.setAttribute("aFaza",new i.BufferAttribute(S,1)),k.setAttribute("aSkorost",new i.BufferAttribute(x,1)),{uzly:v,svyazi:p,pakety:k}})(p[b]),[b]);(0,o.useEffect)(()=>(window.__ami={yavlenie:"svyazi",uzlov:A.uzly.getAttribute("position").count,svyazey:A.svyazi.getAttribute("position").count/2,paketov:A.pakety.getAttribute("position").count},()=>{A.uzly.dispose(),A.svyazi.dispose(),A.pakety.dispose()}),[A]);let k=(0,o.useRef)(0),M=(0,o.useRef)(0),T=(0,o.useRef)(new i.Vector2(0,0)),z=(0,o.useRef)(0),[B]=(0,o.useState)(S),[F]=(0,o.useState)(x),V=(0,o.useMemo)(()=>{let e=new i.RawShaderMaterial({vertexShader:d,fragmentShader:h,uniforms:F,depthTest:!1,depthWrite:!1}),t=new i.Mesh(new i.PlaneGeometry(2,2),e);return t.frustumCulled=!1,t.renderOrder=-1,t},[F]);return(0,o.useEffect)(()=>(g.add(V),()=>{g.remove(V),V.geometry.dispose(),V.material.dispose()}),[g,V]),(0,o.useEffect)(()=>{B.uRazmah.value.set(Math.max(1.5,.62*w.width),Math.max(1.4,.66*w.height),1.1),B.uDpr.value=y},[w.width,w.height,y,B]),(0,o.useEffect)(()=>{if(e)return;let t=(e,t)=>{T.current.set(e/window.innerWidth*2-1,-(2*(t/window.innerHeight))+1),z.current=1},a=e=>t(e.clientX,e.clientY),r=e=>{let a=e.touches[0];a&&t(a.clientX,a.clientY)},o=()=>{z.current=0};return window.addEventListener("pointermove",a,{passive:!0}),window.addEventListener("touchmove",r,{passive:!0}),window.addEventListener("pointerleave",o),()=>{window.removeEventListener("pointermove",a),window.removeEventListener("touchmove",r),window.removeEventListener("pointerleave",o)}},[e]),(0,o.useEffect)(()=>{M.current=1.8*!!e},[e]),(0,a.useFrame)((t,a)=>{let r=Math.min(a,.05);(!e||M.current>0)&&(e&&(M.current-=r),k.current+=r),B.uTime.value=k.current,F.uTime.value=k.current,z.current=Math.max(0,z.current-.55*r),B.uSila.value=z.current,B.uMysh.value.lerp(T.current,Math.min(1,6*r))}),(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("lineSegments",{geometry:A.svyazi,frustumCulled:!1,children:(0,t.jsx)("shaderMaterial",{vertexShader:v,fragmentShader:f,uniforms:B,transparent:!0,depthTest:!1,depthWrite:!1,blending:i.AdditiveBlending})}),(0,t.jsx)("points",{geometry:A.uzly,frustumCulled:!1,children:(0,t.jsx)("shaderMaterial",{vertexShader:l,fragmentShader:s,uniforms:B,transparent:!0,depthTest:!1,depthWrite:!1,blending:i.AdditiveBlending})}),(0,t.jsx)("points",{geometry:A.pakety,frustumCulled:!1,children:(0,t.jsx)("shaderMaterial",{vertexShader:m,fragmentShader:c,uniforms:B,transparent:!0,depthTest:!1,depthWrite:!1,blending:i.AdditiveBlending})}),(0,t.jsx)("group",{visible:!1,scale:[u.width,u.height,1]})]})}],13222)},88322,function(e){e.n(e.i(13222))}]);