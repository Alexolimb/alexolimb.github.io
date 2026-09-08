(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,82296,e=>{"use strict";var o=e.i(94800),t=e.i(48546),r=e.i(71645),u=e.i(90072),a=e.i(31878);let n=`
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
  uniform vec2  uStorony;
  uniform vec2  uMysh;
  uniform float uProkrutka;
  uniform float uShagov;     // сколько шагов делает луч: цена качества
  uniform vec3  uDno;
  uniform vec3  uVerh;
  uniform vec3  uTeplo;
  uniform vec3  uHolod;
  uniform vec3  uBlik;

  varying vec2 vUv;

  /** Поворот вокруг оси Y — камера медленно обходит решётку. */
  mat2 povorot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
  }

  /**
   * Расстояние до решётки.
   *
   * Гироид плюс мягкое утолщение: \xababs(...) минус толщина\xbb превращает
   * бесконечно тонкую поверхность в стенку, у которой есть толща. Без
   * этого решётка просвечивала бы насквозь и читалась как сетка линий.
   *
   * Масштаб делится обратно: гироид задан в единицах, где период равен
   * 2π, и без деления шаг луча оказался бы больше самой ячейки.
   */
  float reshyotka(vec3 p) {
    float m = 7.0;
    vec3 q = p * m;

    // Медленное \xabдыхание\xbb: толщина стенки гуляет во времени. Решётка от
    // этого перестаёт быть неподвижной декорацией — она живёт, даже
    // когда камера стоит.
    //
    // ТОНКАЯ. В первом заходе стенка была вчетверо толще (0.42), и
    // камера оказывалась ВНУТРИ вещества: на снимке вместо решётки
    // вышло одно расплывчатое пятно во весь экран. Пустоты должно быть
    // больше, чем стенок, иначе сквозь решётку не на что смотреть.
    float tolshchina = 0.10 + 0.05 * sin(uTime * 0.35 + p.z * 0.35);

    float g = dot(sin(q), cos(q.zxy));

    // Делитель — не подгонка \xabна глаз\xbb, а условие Липшица: наклон
    // гироида ограничен, и умножается он ещё на масштаб. Делитель
    // меньше — луч перепрыгивает стенку; больше — луч ползёт и не
    // успевает уйти вглубь за отведённые шаги.
    return (abs(g) - tolshchina) / (m * 1.7);
  }

  /** Нормаль поверхности: четыре пробы вместо шести — вдвое дешевле. */
  vec3 normal(vec3 p) {
    vec2 e = vec2(1.0, -1.0) * 0.0025;
    return normalize(
      e.xyy * reshyotka(p + e.xyy) +
      e.yyx * reshyotka(p + e.yyx) +
      e.yxy * reshyotka(p + e.yxy) +
      e.xxx * reshyotka(p + e.xxx)
    );
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uStorony.x, 1.0);

    // Камера. Летит вперёд сама, а прокрутка добавляет ходу: страницу
    // листают — решётка проносится мимо.
    //
    // ГДЕ ИМЕННО она летит — не вкусовое решение, а единственный
    // работающий выбор. В точке (0,0,0) гироид РАВЕН НУЛЮ, то есть это
    // сама поверхность: камера стояла внутри вещества, луч отчитывался о
    // попадании на нулевом шаге, и весь экран занимало одно расплывчатое
    // пятно. Так и было снято живьём с первого захода.
    //
    // Прямая x = 0, y = π/(2m) целиком лежит в пустоте: на ней гироид
    // тождественно равен единице при любом z. Проверяется подстановкой —
    // sin(0)\xb7cos(z) + sin(π/2)\xb7cos(0) + sin(z)\xb7cos(π/2) = 1. Поэтому
    // лететь можно сколько угодно далеко и никогда не оказаться внутри
    // стенки. Разброс держим маленьким, чтобы с этой прямой не сойти.
    float hod = uTime * 0.16 + uProkrutka * 1.5;
    vec3 gde = vec3(
      sin(uTime * 0.05) * 0.05,
      0.2244 + cos(uTime * 0.04) * 0.03,
      hod
    );

    // Взгляд НЕ вдоль полёта, а вбок и вниз — на 49 и на 20 градусов.
    //
    // Прямо по ходу лететь нельзя: та самая пустая прямая, по которой
    // идёт камера, — это прямой канал в решётке, и, глядя вдоль него,
    // видишь один сплошной тоннель. Красиво, но читается как пятно;
    // снято живьём дважды. Стоит развернуть взгляд поперёк — и в кадр
    // попадают стенки на разной глубине, то есть сама решётка.
    //
    // Указатель доворачивает взгляд, а не двигает камеру: сдвиг камеры
    // на тёмном объёме почти не виден, а поворот виден сразу.
    vec3 luch = normalize(vec3(p * 2.0, 1.0));
    luch.xz = povorot(0.86 + uMysh.x * 0.28 + uTime * 0.03) * luch.xz;
    luch.yz = povorot(-0.35 + uMysh.y * -0.2) * luch.yz;

    float put = 0.0;
    float dist = 1e9;
    bool popal = false;

    // Луч идёт вперёд, пока не упрётся. Дальше 18 единиц не смотрим:
    // туда всё равно не доходит свет, а шаги стоят денег.
    for (int i = 0; i < 96; i++) {
      if (float(i) >= uShagov) break;
      vec3 tochka = gde + luch * put;
      dist = reshyotka(tochka);
      if (dist < 0.0016) { popal = true; break; }
      if (put > 18.0) break;
      put += dist * 0.7;
    }

    // Толща позади решётки — та же, что на остальных страницах, иначе
    // переход между разделами читался бы как переход на другой сайт.
    vec3 cvet = mix(uDno, uVerh, smoothstep(-0.2, 1.15, uv.y) * 0.72);

    if (popal) {
      vec3 tochka = gde + luch * put;
      vec3 n = normal(tochka);

      // Два источника, как во всём этом мире: тёплый ведёт, холодный
      // подсвечивает с другой стороны.
      vec3 kTeplu = normalize(vec3(-0.45, 0.8, -0.35));
      vec3 kHolodu = normalize(vec3(0.7, -0.3, -0.5));
      float teplo = max(dot(n, kTeplu), 0.0);
      float holod = max(dot(n, kHolodu), 0.0);

      // Свечение по краю: там, где нормаль уходит от нас, поверхность
      // видна вскользь. Без этого решётка выглядит вырезанной из
      // картона.
      float kray = pow(1.0 - max(dot(n, -luch), 0.0), 2.6);

      // Приглушено на треть против первого расчёта. Замерено на живой
      // странице: поверх решётки идёт белый заголовок и серый текст, и
      // при прежней яркости у левого верхнего угла они спорили с фоном.
      // Фон, из-за которого хуже читается заголовок, — это испорченная
      // страница, а не украшенная.
      vec3 poverhnost =
        uVerh * 0.26 +
        uTeplo * teplo * 0.34 +
        uHolod * holod * 0.18 +
        uBlik * kray * 0.26;

      // Мгла с расстоянием. Она же прячет край мира: без неё на дальней
      // границе видно, где луч перестал считаться.
      float mgla = 1.0 - exp(-put * put * 0.16);
      cvet = mix(poverhnost, cvet, mgla);
    }

    // Сияние вокруг решётки: сколько шагов луч шёл рядом с поверхностью,
    // не задев её. Даёт мягкий свет в проёмах — то, чего не бывает у
    // \xabнарисованной\xbb глубины.
    float blizost = exp(-abs(dist) * 5.0);
    cvet += mix(uHolod, uTeplo, 0.35) * blizost * 0.055;

    float vin = 1.0 - 0.38 * pow(length((uv - 0.5) * vec2(1.05, 1.0)) * 1.4, 2.2);
    cvet *= clamp(vin, 0.36, 1.0);

    gl_FragColor = vec4(cvet, 1.0);
  }
`,l={nizkoe:40,srednee:64,vysokoe:88},c=new u.Color("#080e20"),v=new u.Color("#18294c"),s=new u.Color("#e8a85c"),h=new u.Color("#8aa9d6"),m=new u.Color("#f6ead6");function p(){return{uTime:{value:0},uStorony:{value:new u.Vector2(1.6,1)},uMysh:{value:new u.Vector2(0,0)},uProkrutka:{value:0},uShagov:{value:l.srednee},uDno:{value:c.clone()},uVerh:{value:v.clone()},uTeplo:{value:s.clone()},uHolod:{value:h.clone()},uBlik:{value:m.clone()}}}e.s(["default",0,function({tiho:e}){let{scene:c,size:v}=(0,t.useThree)(),[s]=(0,r.useState)(p),[h]=(0,r.useState)(a.pervayaDogadka),m=(0,r.useRef)({t:0,dozhivaet:0,prokrutka:0}),d=(0,r.useRef)(new u.Vector2(0,0)),f=(0,r.useRef)(new u.Vector2(0,0)),y=(0,r.useMemo)(()=>{let e=new u.RawShaderMaterial({vertexShader:n,fragmentShader:i,uniforms:s,depthTest:!1,depthWrite:!1}),o=new u.Mesh(new u.PlaneGeometry(2,2),e);return o.frustumCulled=!1,o.renderOrder=-1,o},[s]);return(0,r.useEffect)(()=>(c.add(y),()=>{c.remove(y),y.geometry.dispose(),y.material.dispose()}),[c,y]),(0,r.useEffect)(()=>{window.__ami={yavlenie:"reshyotka",uroven:h,shagov:l[h]}},[h]),(0,r.useEffect)(()=>{if(e)return;let o=(e,o)=>{d.current.set(e/window.innerWidth*2-1,-(o/window.innerHeight*2-1))},t=e=>o(e.clientX,e.clientY),r=e=>{let t=e.touches[0];t&&o(t.clientX,t.clientY)};return window.addEventListener("pointermove",t,{passive:!0}),window.addEventListener("touchmove",r,{passive:!0}),()=>{window.removeEventListener("pointermove",t),window.removeEventListener("touchmove",r)}},[e]),(0,r.useEffect)(()=>{m.current.dozhivaet=1.4*!!e},[e,m]),(0,r.useEffect)(()=>{s.uStorony.value.set(Math.max(v.width,1)/Math.max(v.height,1),1),s.uShagov.value=l[h]},[v.width,v.height,h,s]),(0,o.useFrame)((o,t)=>{let r=Math.min(t,.05);(!e||m.current.dozhivaet>0)&&(e&&(m.current.dozhivaet-=r),m.current.t+=r),s.uTime.value=m.current.t,f.current.lerp(d.current,Math.min(1,2*r)),s.uMysh.value.copy(f.current);let u=window.scrollY/Math.max(window.innerHeight,1);m.current.prokrutka+=(u-m.current.prokrutka)*Math.min(1,3.2*r),s.uProkrutka.value=m.current.prokrutka}),null}],82296)},98440,function(e){e.n(e.i(82296))}]);