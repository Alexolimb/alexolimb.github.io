(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,85463,e=>{"use strict";var t=e.i(94800),o=e.i(48546),r=e.i(71645),u=e.i(90072),n=e.i(31878);let a=`
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,i=`
  precision highp float;

  uniform float uTime;
  uniform vec2  uStorony;   // ширина/высота, чтобы кольца были круглыми
  uniform vec2  uGost;      // где сейчас гость, в тех же координатах
  uniform float uSila;      // насколько гость здесь: 0 — его нет
  uniform float uChastota;  // сколько колец умещается: зависит от качества
  uniform vec3  uDno;
  uniform vec3  uVerh;
  uniform vec3  uTeplo;
  uniform vec3  uHolod;
  uniform vec3  uBlik;

  varying vec2 vUv;

  void main() {
    // Координаты с поправкой на стороны экрана: без неё кольца
    // превращаются в эллипсы, и физика перестаёт быть похожей на правду.
    vec2 p = (vUv - 0.5) * uStorony;

    // Хозяин стоит слева и внизу — там, где на странице его имя. Он
    // никуда не уходит и звонит всегда.
    vec2 hozyain = vec2(-0.34, -0.16) * uStorony;

    float r1 = length(p - hozyain);
    float r2 = length(p - uGost);

    // Кольца затухают с расстоянием — иначе экран превращается в
    // равномерную рябь, в которой не видно, откуда что идёт.
    float a1 = sin(r1 * uChastota - uTime * 1.15) * exp(-r1 * 1.05);
    float a2 = sin(r2 * uChastota - uTime * 1.15) * exp(-r2 * 1.05) * uSila;

    // Вот она, интерференция: складываются АМПЛИТУДЫ, а не картинки.
    // Где горб встречает горб — светло, где горб встречает впадину —
    // гаснет. Такого рисунка нет ни у одного источника отдельно.
    float summa = a1 + a2;

    // Гребни: показываем не всю волну, а её вершины. Полная волна даёт
    // мыльную рябь, вершины — чёткий рисунок.
    // Порог поднят, а не опущен: на \xabРаботать со мной\xbb больше всего
    // текста из всех шести страниц, и рисунок обязан уступать ему.
    float greben = smoothstep(0.42, 1.05, abs(summa));

    // Чей это гребень — считаем по близости. У хозяина тёплый цвет, у
    // гостя холодный, между ними честная смесь.
    float chey = clamp(r1 / max(r1 + r2, 0.0001), 0.0, 1.0);
    vec3 cvetGrebnya = mix(uTeplo, uHolod, chey);

    // --- сборка --------------------------------------------------------
    vec3 cvet = mix(uDno, uVerh, smoothstep(0.0, 1.0, vUv.y) * 0.7);
    cvet += cvetGrebnya * greben * 0.155;

    // Сами источники: мягкие пятна света. Гость появляется вместе со
    // своей силой и исчезает вместе с ней.
    cvet += uTeplo * exp(-7.0 * r1) * 0.16;
    cvet += uHolod * exp(-9.0 * r2) * 0.16 * uSila;
    cvet += uBlik * exp(-30.0 * r1) * 0.10;
    cvet += uBlik * exp(-34.0 * r2) * 0.10 * uSila;

    // Виньетка, как на всех остальных страницах: свет собирается к
    // середине, а по углам толща темнеет.
    float vin = 1.0 - 0.36 * pow(length((vUv - 0.5) * vec2(1.05, 1.0)) * 1.42, 2.4);
    cvet *= clamp(vin, 0.4, 1.0);

    gl_FragColor = vec4(cvet, 1.0);
  }
`,l={nizkoe:26,srednee:38,vysokoe:48},v=new u.Color("#0a1024"),c=new u.Color("#1b2f57"),s=new u.Color("#e8a85c"),h=new u.Color("#8aa9d6"),m=new u.Color("#f6ead6");function d(){return{uTime:{value:0},uStorony:{value:new u.Vector2(1.6,1)},uGost:{value:new u.Vector2(.3,.2)},uSila:{value:0},uChastota:{value:l.srednee},uDno:{value:v.clone()},uVerh:{value:c.clone()},uTeplo:{value:s.clone()},uHolod:{value:h.clone()},uBlik:{value:m.clone()}}}e.s(["default",0,function({tiho:e}){let{scene:v,size:c}=(0,o.useThree)(),[s]=(0,r.useState)(d),[h]=(0,r.useState)(n.pervayaDogadka),m=(0,r.useRef)({t:0,dozhivaet:0}),f=(0,r.useRef)(new u.Vector2(.3,.2)),p=(0,r.useRef)(0),w=(0,r.useMemo)(()=>{let e=new u.RawShaderMaterial({vertexShader:a,fragmentShader:i,uniforms:s,depthTest:!1,depthWrite:!1}),t=new u.Mesh(new u.PlaneGeometry(2,2),e);return t.frustumCulled=!1,t.renderOrder=-1,t},[s]);return(0,r.useEffect)(()=>(v.add(w),()=>{v.remove(w),w.geometry.dispose(),w.material.dispose()}),[v,w]),(0,r.useEffect)(()=>{window.__ami={yavlenie:"volny",uroven:h,kolec:l[h],silaGostya:()=>Number(p.current.toFixed(3))}},[h]),(0,r.useEffect)(()=>{if(e)return;let t=Math.max(c.width,1)/Math.max(c.height,1),o=(e,o)=>{f.current.set((e/window.innerWidth-.5)*t,-(o/window.innerHeight-.5)),p.current=1},r=e=>o(e.clientX,e.clientY),u=e=>{let t=e.touches[0];t&&o(t.clientX,t.clientY)};return window.addEventListener("pointermove",r,{passive:!0}),window.addEventListener("touchmove",u,{passive:!0}),()=>{window.removeEventListener("pointermove",r),window.removeEventListener("touchmove",u)}},[e,c.width,c.height]),(0,r.useEffect)(()=>{m.current.dozhivaet=1.6*!!e},[e,m]),(0,r.useEffect)(()=>{s.uStorony.value.set(Math.max(c.width,1)/Math.max(c.height,1),1),s.uChastota.value=l[h]},[c.width,c.height,h,s]),(0,t.useFrame)((t,o)=>{let r=Math.min(o,.05);(!e||m.current.dozhivaet>0)&&(e&&(m.current.dozhivaet-=r),m.current.t+=r),s.uTime.value=m.current.t,p.current=Math.max(0,p.current-r/2.6),s.uSila.value=p.current,s.uGost.value.lerp(f.current,Math.min(1,3.2*r))}),null}],85463)},27446,function(e){e.n(e.i(85463))}]);