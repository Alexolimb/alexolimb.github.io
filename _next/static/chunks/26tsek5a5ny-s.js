(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,91135,e=>{"use strict";var t=e.i(94800),a=e.i(48546),o=e.i(71645),n=e.i(90072),i=e.i(31878);let l=`
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,u=`
  precision highp float;

  uniform float uTime;
  uniform vec2  uStorony;     // ширина/высота: без этого волны сплющивает
  uniform vec2  uMysh;
  uniform float uMyshSila;    // насколько круг под указателем ещё жив
  uniform float uProkrutka;   // как далеко человек ушёл вниз по странице
  uniform float uVoln;        // сколько волн складываем: цена качества
  uniform float uRazval;      // цветной развал нитей
  uniform vec3  uDno;
  uniform vec3  uVerh;
  uniform vec3  uTeplo;
  uniform vec3  uHolod;
  uniform vec3  uBlik;

  varying vec2 vUv;

  /**
   * Наклон стеклянной поверхности в точке.
   *
   * Складываем направленные волны. Возвращается НАКЛОН, а не высота:
   * преломлению нужен именно он, а считать высоту, чтобы потом взять от
   * неё производную, — лишняя работа. Производная синуса известна.
   *
   * Волны идут по золотому углу (2.39968 радиана): при любом их числе
   * направления ложатся ровно и ни одна пара не совпадает. Равномерный
   * шаг по кругу при пяти волнах дал бы почти правильный пятиугольник,
   * и рисунок стал бы заметно решётчатым.
   */
  vec2 naklon(vec2 p, float t) {
    vec2 g = vec2(0.0);

    // ЧАСТОТА — это масштаб рисунка, и только он.
    //
    // На первом заходе она была 2.2, то есть длина волны выходила почти
    // вдвое шире экрана: на весь кадр приходилось меньше одной волны, и
    // вместо сети нитей получалось одно расплывчатое зарево. Снято живьём.
    //
    // На силу самой каустики частота не влияет вовсе — это видно из
    // производной: наклон складывается как ves/f, а его производная даёт
    // множитель f обратно, и они сокращаются. Поэтому частоту можно
    // менять свободно, не трогая яркость.
    float chastota = 13.0;
    float ves = 1.0;
    for (int i = 0; i < 7; i++) {
      if (float(i) >= uVoln) break;
      float a = float(i) * 2.39968;
      vec2 napravlenie = vec2(cos(a), sin(a));
      float faza = dot(p, napravlenie) * chastota + t * (0.7 + 0.21 * float(i));
      g += napravlenie * cos(faza) * (ves / chastota);
      chastota *= 1.72;
      ves *= 0.78;
    }

    // Круг под указателем. Не \xabподсветка курсора\xbb: это настоящая волна
    // по той же поверхности — она так же преломляет свет, и каустика от
    // неё расходится кольцами сама, без единой отдельной строки.
    vec2 ot = p - uMysh * vec2(uStorony.x, 1.0) * 0.5;
    float r = length(ot);
    float volna = sin(r * 16.0 - uTime * 3.4) * exp(-r * 2.6) * uMyshSila;
    g += normalize(ot + 1e-5) * volna * 0.13;

    return g;
  }

  /** Куда луч, преломившись, придёт на дно. */
  vec2 nadno(vec2 p, float t, float sila) {
    return p + naklon(p, t) * sila;
  }

  /**
   * Яркость каустики: во сколько раз сжался кусочек поверхности.
   *
   * Три близкие точки, три переноса, отношение площадей. Обратная
   * величина и есть плотность света.
   *
   * ЯРКОСТЬ ОБЯЗАНА БЫТЬ ОГРАНИЧЕНА, и это не украшение расчёта. В узлах
   * каустики площадь обращается в ноль, обратная величина — в
   * бесконечность, и первый живой заход дал ровно это: экран в розовых и
   * зелёных пятнах вместо чернильной толщи. Здесь ответ загнан в
   * промежуток от нуля до единицы, и выше единицы не бывает никогда.
   */
  float kaustika(vec2 p, float t, float sila) {
    float e = 0.006;
    vec2 a = nadno(p, t, sila);
    vec2 b = nadno(p + vec2(e, 0.0), t, sila);
    vec2 c = nadno(p + vec2(0.0, e), t, sila);
    vec2 db = (b - a) / e;
    vec2 dc = (c - a) / e;
    float rastyazhenie = abs(db.x * dc.y - db.y * dc.x);
    float plotnost = 1.0 / (rastyazhenie + 0.15);

    // Два порога вместо степени.
    //
    // Степень пробовали первой, и она не годится: у неё нет порога, и
    // подобрать её так, чтобы ровное место было тёмным, а узел ярким,
    // не выходит — либо экран заливает светом, либо не видно ничего.
    // Оба крайних случая были сняты живьём.
    //
    // Порог отвечает ровно на тот вопрос, который здесь и стоит: с
    // какой плотности начинается нить. Ровное место даёт около 0.87 и
    // остаётся чёрным; узел даёт больше четырёх и горит в полную силу.
    float yarko = smoothstep(1.35, 3.4, plotnost);
    float myagko = smoothstep(0.95, 1.95, plotnost) * 0.18;
    return clamp(yarko + myagko, 0.0, 1.0);
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uStorony.x, 1.0);

    // Прокрутка уводит поверхность вбок и вглубь. Не \xabпараллакс фона\xbb:
    // человек, листающий длинную страницу, должен видеть, что вода под
    // ней та же самая, но он проплыл над ней дальше.
    float t = uTime * 0.42;
    p += vec2(uProkrutka * 0.16, -uProkrutka * 0.55);

    // Толща: сверху светлее, ко дну темнее. Тот же строй, что у воды на
    // обложке, — иначе переход между страницами читался бы как переход
    // на другой сайт.
    float glubina = smoothstep(-0.55, 0.62, uv.y - uProkrutka * 0.08);
    vec3 cvet = mix(uDno, uVerh, glubina * 0.82);

    // Две крупные тёплые пятна: свет, падающий сверху, никогда не бывает
    // ровным. Без них дно выглядит равномерно закрашенным.
    float ta = uTime * 0.05;
    cvet += mix(uVerh, uTeplo, 0.42) *
            exp(-7.0 * distance(uv, vec2(0.26 + sin(ta) * 0.06, 0.74))) * 0.26;
    cvet += mix(uVerh, uHolod, 0.6) *
            exp(-10.0 * distance(uv, vec2(0.8 + cos(ta * 0.8) * 0.05, 0.3))) * 0.2;

    // Два яруса нитей: крупный медленный и мелкий быстрый. Один ярус
    // выглядит нарисованным — у настоящей воды рябь всегда лежит поверх
    // волны.
    float k1 = kaustika(p, t, 0.52);
    float k2 = kaustika(p * 2.35 + vec2(11.3, 4.7), t * 1.45, 0.3);
    float niti = clamp(k1 * 0.72 + k2 * 0.42, 0.0, 1.0);

    // Цветной развал: три канала считаются с чуть разной силой
    // преломления — стекло разводит цвета, и по краям нитей идёт та же
    // радуга, что по кромке настоящего стекла.
    //
    // Разница между каналами нарочно КРОШЕЧНАЯ (четыре процента) и
    // вдобавок приглушена подмешиванием. В первом заходе она была
    // вдесятеро больше, и вместо радужной кромки экран покрылся
    // зелёными и розовыми пятнами: три сильно разных числа в трёх
    // каналах — это уже не стекло, это разноцветная краска.
    //
    // На слабой машине развала нет: это два лишних прохода по циклу.
    vec3 svet;
    if (uRazval > 0.5) {
      float kr = kaustika(p, t, 0.52 * (1.0 + 0.04 * uRazval));
      float ks = kaustika(p, t, 0.52 * (1.0 - 0.04 * uRazval));
      svet = mix(vec3(niti), vec3(kr * 0.72 + k2 * 0.42, niti, ks * 0.72 + k2 * 0.42), 0.5);
    } else {
      svet = vec3(niti);
    }

    // Нити тёплые внизу и холодные вверху: ближе к поверхности свет
    // ещё не потерял синеву, у дна остаётся только тёплая часть.
    vec3 tonNitey = mix(uTeplo, uHolod, smoothstep(0.15, 0.95, uv.y));
    cvet += tonNitey * svet * 0.62;
    cvet += uBlik * pow(niti, 2.4) * 0.2;

    // Затемнение по краям: держит взгляд в середине, где стоит текст.
    float vin = 1.0 - 0.36 * pow(length((uv - 0.5) * vec2(1.06, 1.0)) * 1.42, 2.3);
    cvet *= clamp(vin, 0.4, 1.0);

    gl_FragColor = vec4(cvet, 1.0);
  }
`,r={nizkoe:{voln:4,razval:0},srednee:{voln:6,razval:1},vysokoe:{voln:7,razval:1.4}},v=new n.Color("#080e20"),c=new n.Color("#1b2f57"),s=new n.Color("#e8a85c"),f=new n.Color("#8aa9d6"),d=new n.Color("#f6ead6");function h(){return{uTime:{value:0},uStorony:{value:new n.Vector2(1.6,1)},uMysh:{value:new n.Vector2(0,0)},uMyshSila:{value:0},uProkrutka:{value:0},uVoln:{value:r.srednee.voln},uRazval:{value:r.srednee.razval},uDno:{value:v.clone()},uVerh:{value:c.clone()},uTeplo:{value:s.clone()},uHolod:{value:f.clone()},uBlik:{value:d.clone()}}}e.s(["default",0,function({tiho:e}){let{scene:v,size:c}=(0,a.useThree)(),[s]=(0,o.useState)(h),[f]=(0,o.useState)(i.pervayaDogadka),d=(0,o.useRef)({t:0,dozhivaet:0,sila:0}),m=(0,o.useRef)(new n.Vector2(0,0)),p=(0,o.useRef)(new n.Vector2(0,0)),k=(0,o.useMemo)(()=>{let e=new n.RawShaderMaterial({vertexShader:l,fragmentShader:u,uniforms:s,depthTest:!1,depthWrite:!1}),t=new n.Mesh(new n.PlaneGeometry(2,2),e);return t.frustumCulled=!1,t.renderOrder=-1,t},[s]);return(0,o.useEffect)(()=>(v.add(k),()=>{v.remove(k),k.geometry.dispose(),k.material.dispose()}),[v,k]),(0,o.useEffect)(()=>{window.__ami={yavlenie:"kaustika",uroven:f,voln:r[f].voln,razval:r[f].razval}},[f]),(0,o.useEffect)(()=>{if(e)return;let t=(e,t)=>{m.current.set(e/window.innerWidth*2-1,-(t/window.innerHeight*2-1)),d.current.sila=1},a=e=>t(e.clientX,e.clientY),o=e=>{let a=e.touches[0];a&&t(a.clientX,a.clientY)};return window.addEventListener("pointermove",a,{passive:!0}),window.addEventListener("touchmove",o,{passive:!0}),()=>{window.removeEventListener("pointermove",a),window.removeEventListener("touchmove",o)}},[e]),(0,o.useEffect)(()=>{d.current.dozhivaet=1.4*!!e},[e,d]),(0,o.useEffect)(()=>{s.uStorony.value.set(Math.max(c.width,1)/Math.max(c.height,1),1),s.uVoln.value=r[f].voln,s.uRazval.value=r[f].razval},[c.width,c.height,f,s]),(0,t.useFrame)((t,a)=>{let o=Math.min(a,.05);(!e||d.current.dozhivaet>0)&&(e&&(d.current.dozhivaet-=o),d.current.t+=o),s.uTime.value=d.current.t,p.current.lerp(m.current,Math.min(1,2.4*o)),s.uMysh.value.copy(p.current),d.current.sila=Math.max(0,d.current.sila-1.1*o),s.uMyshSila.value=d.current.sila,s.uProkrutka.value=window.scrollY/Math.max(window.innerHeight,1)}),null}],91135)},46981,function(e){e.n(e.i(91135))}]);