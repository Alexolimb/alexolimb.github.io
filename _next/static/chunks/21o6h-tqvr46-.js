(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,54604,e=>{"use strict";var t=e.i(94800),o=e.i(48546),a=e.i(71645),r=e.i(90072),u=e.i(31878);let v=`
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
  uniform vec2  uRazmer;      // ширина и высота холста в точках
  uniform float uZerno;       // сила зерна: 0 — нет, 1 — грубая плёнка
  uniform float uSryv;        // насколько сейчас сорвана рамка, 0..1
  uniform vec3  uDno;
  uniform vec3  uVerh;
  uniform vec3  uTeplo;
  uniform vec3  uBlik;

  varying vec2 vUv;

  /**
   * Хеш, который НЕ разваливается на больших координатах.
   *
   * Привычный fract(sin(dot(p, ...)) * 43758.5) годится только для
   * маленьких p. Зерно считается в точках экрана, то есть p доходит до
   * полутора тысяч; dot тогда переваливает за 400 000, у float остаётся
   * один значащий знак после запятой, sin становится ступенчатым — и
   * зерно вырождается в крупные прямоугольники во весь экран. Ровно так
   * это и выглядело на первом снимке. Здесь sin нет вовсе.
   */
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float shum(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  /** Прямоугольник со скруглением. Возвращает расстояние до края в точках. */
  float skruglyonnyy(vec2 p, vec2 polovina, float r) {
    vec2 d = abs(p) - polovina + r;
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
  }

  void main() {
    vec2 tochka = vUv * uRazmer;

    // --- ход плёнки ---------------------------------------------------
    // Одно число на всё явление. Из него считаются и дырки, и граница
    // кадра, поэтому разъехаться они не могут в принципе.
    float hod = uTime * 62.0 + uSryv * 520.0;

    // Дрожь в рамке: настоящий проектор не держит плёнку неподвижно.
    // Полторы точки по каждой оси — глазу этого хватает.
    vec2 drozh = vec2(
      shum(vec2(uTime * 0.9, 3.7)) - 0.5,
      shum(vec2(7.1, uTime * 0.75)) - 0.5
    ) * 1.6;
    vec2 p = tochka + drozh;

    // --- размеры плёнки, в точках -------------------------------------
    float SHAG_PERF = 76.0;            // шаг перфорации
    float KADR = SHAG_PERF * 4.0;      // четыре дырки на кадр — как в 35 мм
    float OT_KRAYA = 23.0;             // центр полосы перфорации
    float POLU_SHIR = 8.0;             // половина ширины дырки
    float POLU_VYS = 11.0;             // половина высоты дырки

    // --- фон ------------------------------------------------------------
    vec3 cvet = mix(uDno, uVerh, smoothstep(0.0, 1.0, vUv.y) * 0.72);

    // Свет лампы: одно тёплое пятно сверху, медленно дышит. Оно и есть
    // \xabпроектор\xbb — рисовать сам кадр за текстом нельзя, он туда лезет.
    float lampa = exp(-3.4 * distance(vUv, vec2(0.5, 1.02)));
    cvet += uTeplo * lampa * (0.10 + 0.02 * sin(uTime * 0.5));

    // --- перфорация -----------------------------------------------------
    float otKraya = min(p.x, uRazmer.x - p.x);
    float yp = mod(p.y + hod, SHAG_PERF) - SHAG_PERF * 0.5;
    float d = skruglyonnyy(vec2(otKraya - OT_KRAYA, yp), vec2(POLU_SHIR, POLU_VYS), 3.5);

    // Тёмная лента самой плёнки — рисуется ПЕРВОЙ, под дырками. Без неё
    // дырки висят в пустоте и читаются как случайные точки.
    float lenta = 1.0 - smoothstep(30.0, 38.0, abs(otKraya - OT_KRAYA));
    cvet = mix(cvet, cvet * 0.60, lenta * 0.6);

    // Дырка — это СВЕТ: сквозь неё проходит лампа. Поэтому она светлая,
    // а не тёмная, и вокруг неё едва заметное свечение.
    float dyra = 1.0 - smoothstep(-1.0, 1.0, d);
    float oreol = exp(-0.10 * max(d, 0.0));
    cvet += uBlik * dyra * 0.34;
    cvet += uTeplo * oreol * 0.05;

    // --- граница кадра ---------------------------------------------------
    // Едет с той же скоростью, что дырки, и приходит ровно раз в четыре
    // дырки. Тонкая тёмная черта через всё поле.
    float yk = mod(p.y + hod, KADR);
    float chertaKadra = 1.0 - smoothstep(0.0, 2.5, abs(yk - 1.0));
    cvet = mix(cvet, cvet * 0.72, chertaKadra * 0.5);

    // --- зерно -----------------------------------------------------------
    // Двадцать четыре раза в секунду. Номер кадра закольцован: иначе он
    // за минуту вырастает до тысяч и точность опять теряется.
    float nomerKadra = mod(floor(uTime * 24.0), 512.0);
    float z = hash(mod(tochka, 1024.0) + nomerKadra * 17.13) - 0.5;
    // В тенях зерна почти не видно, в полутонах оно сильнее всего —
    // так работает настоящая эмульсия.
    float yarkost = dot(cvet, vec3(0.299, 0.587, 0.114));
    cvet += z * uZerno * (0.30 + 1.5 * yarkost * (1.0 - yarkost)) * 0.085;

    // --- виньетка ---------------------------------------------------------
    float vin = 1.0 - 0.34 * pow(length((vUv - 0.5) * vec2(1.05, 1.0)) * 1.42, 2.4);
    cvet *= clamp(vin, 0.42, 1.0);

    gl_FragColor = vec4(cvet, 1.0);
  }
`,n={nizkoe:.55,srednee:.85,vysokoe:1},l=new r.Color("#0a1024"),c=new r.Color("#1b2f57"),f=new r.Color("#e8a85c"),m=new r.Color("#f6ead6");function s(){return{uTime:{value:0},uRazmer:{value:new r.Vector2(1440,900)},uZerno:{value:n.srednee},uSryv:{value:0},uDno:{value:l.clone()},uVerh:{value:c.clone()},uTeplo:{value:f.clone()},uBlik:{value:m.clone()}}}e.s(["default",0,function({tiho:e}){let{scene:l,size:c,viewport:f}=(0,o.useThree)(),[m]=(0,a.useState)(s),h=(0,a.useRef)({t:0,dozhivaet:0}),[d]=(0,a.useState)(u.pervayaDogadka),p=(0,a.useMemo)(()=>{let e=new r.RawShaderMaterial({vertexShader:v,fragmentShader:i,uniforms:m,depthTest:!1,depthWrite:!1}),t=new r.Mesh(new r.PlaneGeometry(2,2),e);return t.frustumCulled=!1,t.renderOrder=-1,t},[m]);return(0,a.useEffect)(()=>(l.add(p),()=>{l.remove(p),p.geometry.dispose(),p.material.dispose()}),[l,p]),(0,a.useEffect)(()=>{window.__ami={yavlenie:"plyonka",uroven:d,zerno:n[d],kadrovVSekundu:24}},[d]),(0,a.useEffect)(()=>{m.uRazmer.value.set(Math.max(1,c.width*f.dpr),Math.max(1,c.height*f.dpr)),m.uZerno.value=n[d]},[c.width,c.height,f.dpr,d,m]),(0,a.useEffect)(()=>{h.current.dozhivaet=1.2*!!e},[e,h]),(0,t.useFrame)((t,o)=>{let a=Math.min(o,.05);(!e||h.current.dozhivaet>0)&&(e&&(h.current.dozhivaet-=a),h.current.t+=a),m.uTime.value=h.current.t;let r=h.current.t%43;m.uSryv.value=r<.55?Math.sin(r/.55*Math.PI):0}),null}],54604)},62243,function(e){e.n(e.i(54604))}]);