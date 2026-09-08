(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,92919,e=>{e.v({holst:"fon3d-module__N-FP-q__holst",ozhivit:"fon3d-module__N-FP-q__ozhivit",tochka:"fon3d-module__N-FP-q__tochka"})},36735,e=>{"use strict";var t=e.i(43476),o=e.i(71645),a=e.i(15031);let r=`
  precision highp float;

  uniform float uTime;
  uniform vec2  uStorony;
  uniform float uProkrutka;
  uniform vec2  uMysh;

  varying vec2 vUv;

  /** Число из точки. Одно и то же место — всегда одно и то же число. */
  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  /** Плавный шум: четыре угла клетки и сглаженная доля между ними. */
  float shum(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  /** Шум с ярусами: крупные волны и мелкая рябь поверх них. */
  float yarusy(vec2 p) {
    float s = 0.0, v = 0.5;
    for (int i = 0; i < 5; i++) {
      s += shum(p) * v;
      p *= 2.03;
      v *= 0.5;
    }
    return s;
  }
`,i={ugli:`
  ${r}

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uStorony.x, 1.0);

    // Ночь зала. Не чёрная: чёрный фон под тёплой едой выглядит дёшево,
    // а тёмно-бурый — как стена, освещённая огнём.
    vec3 cvet = mix(vec3(0.045, 0.028, 0.024), vec3(0.10, 0.055, 0.038),
                    smoothstep(-0.2, 1.0, uv.y));

    // Жар снизу. Прокрутка его РАЗДУВАЕТ: человек листает вниз, к
    // блюдам с углей, и жар растёт вместе с ним. Ограничение сверху
    // обязательно — без него на длинной странице низ экрана выгорает в
    // белое и текст поверх него читать нельзя.
    float razduv = 1.0 + min(uProkrutka, 2.2) * 0.42;

    float volny = yarusy(vec2(p.x * 2.6, p.y * 3.4 - uTime * 0.55));
    float niz = smoothstep(0.62, -0.12, uv.y);
    // ПОТОЛОК СТОИТ НА САМОМ ЖАРЕ, а не только на раздуве от прокрутки.
    //
    // Раньше ограничен был лишь раздув, а zhar доходил до 2,5 — и
    // слагаемое pow(zhar, 2.6) выносило цвет далеко за единицу. Нижняя
    // треть КАЖДОГО экрана превращалась в оранжево-белое пламя, а холст
    // прибит к окну, значит эта полоса шла под любым текстом, который
    // в тот момент внизу оказался. Замер живьём: цена блюда \xab13,00 €\xbb
    // давала 1,26 к одному, строка \xabресторан выдуман\xbb в подвале — 1,05,
    // то есть не читалась вовсе. Комментарий выше предупреждал ровно об
    // этом, но лечил не там.
    float zhar = clamp(pow(niz, 1.7) * (0.55 + volny * 0.75) * razduv, 0.0, 1.0);

    // Веса тоже убавлены: жар должен светиться, а не выжигать. Разница
    // видна только рядом с текстом — самого огня меньше не стало.
    cvet += vec3(1.0, 0.36, 0.09) * zhar * 0.34;
    cvet += vec3(1.0, 0.72, 0.34) * pow(zhar, 2.6) * 0.2;

    // Дым: тот же шум, но выше, медленнее и холоднее. Он не светит, он
    // ГАСИТ — настоящий дым над огнём именно затемняет, а не подсвечивает.
    float dym = yarusy(vec2(p.x * 1.5 + uTime * 0.05, p.y * 1.9 - uTime * 0.17));
    cvet *= 1.0 - smoothstep(0.35, 1.0, uv.y) * dym * 0.42;

    // Искры. Экран разбит на клетки, в каждой не больше одной искры;
    // так их можно посчитать без единого списка и без единой частицы в
    // памяти браузера. Клетка знает свою искру по своему же номеру.
    vec2 setka = vec2(14.0, 9.0);
    for (int sloy = 0; sloy < 3; sloy++) {
      float n = float(sloy);
      vec2 k = p * setka * (1.0 + n * 0.6) + vec2(n * 31.7, 0.0);

      // Полёт: клетка едет вниз, значит искра — вверх. Скорость своя у
      // каждого яруса, иначе три слоя идут строем.
      k.y += uTime * (0.9 + n * 0.55);

      vec2 kletka = floor(k);
      vec2 vnutri = fract(k) - 0.5;

      float semya = hash21(kletka + n * 17.3);
      // Больше девяти десятых клеток пустые: искры над углями редки, и
      // ровный дождь искр читается как салют, а не как жар.
      if (semya > 0.09) continue;

      // Своё место внутри клетки и своё покачивание вбок.
      vec2 gde = vec2(
        (hash21(kletka + 3.1) - 0.5) * 0.7 + sin(uTime * 2.1 + semya * 60.0) * 0.12,
        (hash21(kletka + 7.7) - 0.5) * 0.7
      );

      float r = length((vnutri - gde) * vec2(1.0, 1.0));
      float mercanie = 0.55 + 0.45 * sin(uTime * (7.0 + semya * 90.0) + semya * 30.0);

      // Искра гаснет по мере подъёма: чем выше на экране, тем слабее.
      float vysoko = smoothstep(0.95, 0.1, uv.y);
      float iskra = exp(-r * 42.0) * mercanie * vysoko;

      cvet += vec3(1.0, 0.55, 0.2) * iskra * 0.9;
      cvet += vec3(1.0, 0.85, 0.6) * exp(-r * 120.0) * mercanie * vysoko;
    }

    // Тёплое пятно идёт за указателем: как будто в зале двинули свечу.
    float ot = distance(p, uMysh * vec2(uStorony.x, 1.0) * 0.5);
    cvet += vec3(1.0, 0.5, 0.18) * exp(-ot * 3.4) * 0.07;

    float vin = 1.0 - 0.45 * pow(length((uv - 0.5) * vec2(1.05, 1.0)) * 1.4, 2.0);
    cvet *= clamp(vin, 0.35, 1.0);

    gl_FragColor = vec4(cvet, 1.0);
  }
`,gorod:`
  ${r}

  /**
   * Высота застройки в точке.
   *
   * Квартал разбит на клетки по одной единице. В середине клетки стоит
   * дом, между домами улица. Высота дома — число самой клетки, поэтому
   * квартал одинаков при каждой отрисовке и не мерцает при движении
   * камеры.
   */
  float vysota(vec2 xz) {
    vec2 kletka = floor(xz);
    vec2 f = fract(xz) - 0.5;

    float semya = hash21(kletka);

    // Каждая седьмая клетка пустая: сплошная застройка без единого
    // просвета читается как штриховка, а не как квартал.
    if (hash21(kletka + 41.7) > 0.86) return 0.0;

    // Ширина дома тоже своя: одинаковые кубики выдают решётку.
    float shirina = 0.28 + semya * 0.1;
    float dom = step(max(abs(f.x), abs(f.y)), shirina);

    return dom * (0.28 + semya * semya * 2.3);
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uStorony.x, 1.0);

    // Камера смотрит на квартал сверху и сбоку — как на макет из
    // белого картона на столе. Прокрутка ведёт её вперёд: страницу
    // листают, квартал проплывает под ней.
    float hod = uTime * 0.09 + uProkrutka * 2.6;
    vec3 gde = vec3(hod * 0.55 + uMysh.x * 0.25, 3.1, -6.0 + hod);
    vec3 luch = normalize(vec3(p.x, p.y - 0.34 + uMysh.y * 0.05, 1.0));

    // Ход по высотному полю с постоянным шагом. Для домов, стоящих на
    // земле, это точнее и вчетверо дешевле, чем считать расстояние до
    // тела: сравнивать надо только высоту.
    float t = 0.0;
    bool popal = false;
    float vys = 0.0;
    for (int i = 0; i < 96; i++) {
      vec3 tochka = gde + luch * t;
      if (tochka.y < -0.02) break;
      vys = vysota(tochka.xz);
      if (tochka.y < vys) { popal = true; break; }
      t += 0.115 + t * 0.012;
      if (t > 26.0) break;
    }

    // Бумага, а не небо: образец светлый, и фон обязан остаться бумагой.
    vec3 cvet = mix(vec3(0.97, 0.965, 0.95), vec3(0.90, 0.90, 0.89),
                    smoothstep(0.15, 1.0, uv.y));

    if (popal) {
      vec3 tochka = gde + luch * t;

      // Какая грань: крыша или стена. Отличаем по тому, насколько точка
      // близка к своей высоте — у крыши она ровно на ней.
      float krysha = step(vys - 0.03, tochka.y);

      // Сторона стены: та, что смотрит к свету, светлее. Считаем по
      // тому, из какой клетки мы вышли.
      vec2 f = fract(tochka.xz) - 0.5;
      float storona = abs(f.x) > abs(f.y) ? sign(f.x) : 0.0;
      float bok = abs(f.x) > abs(f.y) ? 0.0 : sign(f.y);

      float svet = 0.80
        + krysha * 0.16
        + (1.0 - krysha) * (storona * 0.07 + bok * 0.045);

      // Тень: смотрим, не закрывает ли соседний дом свет. Восемь шагов
      // в сторону источника — этого хватает, чтобы улицы между домами
      // получили настоящие полосы тени.
      float ten = 1.0;
      vec3 kSvetu = normalize(vec3(-0.55, 0.75, -0.35));
      for (int j = 1; j < 9; j++) {
        vec3 sh = tochka + kSvetu * float(j) * 0.22;
        if (sh.y < vysota(sh.xz)) { ten = 0.72; break; }
      }

      // Тонкая тёмная линия по низу здания — то, чем макет из картона
      // отличается от набора белых пятен.
      float osnovanie = smoothstep(0.0, 0.06, tochka.y);

      cvet = vec3(svet * ten) * mix(vec3(0.86, 0.87, 0.9), vec3(1.0), osnovanie);

      // Дальние дома растворяются в бумаге. Без этого у горизонта видна
      // ровная граница, на которой луч перестал считаться.
      cvet = mix(cvet, vec3(0.95, 0.95, 0.94), smoothstep(3.5, 13.0, t));
    }

    // Едва заметная тёплая нота: чистый серый макет выглядит мёртвым.
    cvet *= vec3(1.0, 0.995, 0.982);

    // И ГЛАВНОЕ: почти весь макет уходит обратно в бумагу.
    //
    // Первый живой заход был снят без этой строки, и его пришлось
    // выбросить: квартал получился в полную силу, серые грани домов
    // встали ровно под чёрным текстом, и вводный абзац на первом экране
    // читался с трудом. Красивый фон, из-за которого не читается текст,
    // — это испорченная страница.
    //
    // Остаётся ровно столько, чтобы глаз заметил движение и объём, и ни
    // на четверть больше. Мышью по экрану это видно сразу, а читать не
    // мешает вовсе.
    cvet = mix(vec3(0.965, 0.962, 0.952), cvet, 0.3);

    gl_FragColor = vec4(cvet, 1.0);
  }
`,chertyozh:`
  ${r}

  /** Толщина линии в долях экрана: одинаковая при любом размере окна. */
  float liniya(float d, float tolshchina) {
    return 1.0 - smoothstep(0.0, tolshchina, abs(d));
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uStorony.x, 1.0);

    // Миллиметровка. Тот же лист, что у самого образца, только здесь он
    // уходит в перспективу и едет при прокрутке — как чертёж, который
    // тянут по столу.
    vec3 cvet = vec3(0.976, 0.973, 0.961);

    vec2 list = p * 22.0 + vec2(uProkrutka * 3.0, -uProkrutka * 5.0);
    vec2 melko = abs(fract(list) - 0.5);
    vec2 krupno = abs(fract(list * 0.2) - 0.5);
    float setkaMelko = 1.0 - smoothstep(0.0, 0.035, min(melko.x, melko.y));
    float setkaKrupno = 1.0 - smoothstep(0.0, 0.012, min(krupno.x, krupno.y));
    cvet -= vec3(0.05, 0.06, 0.07) * setkaMelko * 0.5;
    cvet -= vec3(0.07, 0.09, 0.11) * setkaKrupno * 0.75;

    // Колесо. Вычерчено тонкой линией, стоит в перспективе и
    // проворачивается при прокрутке — ровно как колесо, которое катят.
    //
    // Перспектива честная: круг, наклонённый к взгляду, — это эллипс, и
    // здесь он получается сжатием по вертикали, а не нарисован овалом.
    float ugol = uTime * 0.14 + uProkrutka * 2.4;

    // КОЛЕСО ПОДСТРАИВАЕТСЯ ПОД ШИРИНУ ОКНА, и без этого на телефоне
    // его не было вовсе.
    //
    // Экранная мера по горизонтали считается от ВЫСОТЫ окна: на
    // ноутбуке она доходит до 0,8, на телефоне 390\xd7844 — до 0,231. Колесо
    // стояло на жёстких 0,34, то есть у телефона его центр уезжал за
    // правый край, и на экране оставались две толстые дуги, идущие
    // прямо по вводному абзацу. Читалось это не как чертёж, а как
    // разводы поверх текста — ровно то, от чего этот файл сам себя
    // предостерегает. На широком экране беда не видна.
    //
    // Теперь колесо и стоит ближе к середине, и уменьшается вместе с
    // окном. На ноутбуке множитель равен единице — там всё как было.
    float polShiriny = uStorony.x * 0.5;
    float mash = clamp(polShiriny / 0.8, 0.5, 1.0);
    float gdeX = min(0.34, polShiriny * 0.52);

    vec2 c = (p - vec2(gdeX, -0.02)) * vec2(1.0, 1.0 / 0.62) / mash;
    float r = length(c);
    float a = atan(c.y, c.x) + ugol;

    vec3 chernila = vec3(0.09, 0.16, 0.26);
    float risunok = 0.0;

    // Обод, покрышка и втулка.
    risunok += liniya(r - 0.40, 0.0035);
    risunok += liniya(r - 0.435, 0.0045) * 0.85;
    risunok += liniya(r - 0.055, 0.003);
    risunok += liniya(r - 0.026, 0.0028) * 0.8;

    // Спицы. Шестнадцать, как у настоящего колеса; считаются углом, а не
    // перечислены по одной.
    float spicy = abs(sin(a * 8.0));
    float vnutri = step(r, 0.40) * step(0.055, r);
    risunok += (1.0 - smoothstep(0.0, 0.045, spicy)) * vnutri * 0.55;

    // Выносная линия с размером — примета настоящего чертежа, а не
    // картинки \xabпод чертёж\xbb.
    // Выносная линия идёт по краям КОЛЕСА, а не по вписанным числам:
    // иначе при уменьшении колеса она осталась бы прежней длины и на
    // телефоне превратилась бы в прямую через весь экран.
    float levo = gdeX - 0.40 * mash;
    float pravo = gdeX + 0.40 * mash;
    float nizhe = -0.02 - 0.34 * mash;

    float razmer = liniya(p.y - nizhe, 0.0025) * step(levo, p.x) * step(p.x, pravo);
    risunok += razmer * 0.7;
    risunok += liniya(p.x - pravo, 0.0022) * step(nizhe - 0.04, p.y) * step(p.y, nizhe + 0.04) * 0.7;
    risunok += liniya(p.x - levo, 0.0022) * step(nizhe - 0.04, p.y) * step(p.y, nizhe + 0.04) * 0.7;

    cvet = mix(cvet, chernila, clamp(risunok, 0.0, 1.0) * 0.34);

    // Круг под указателем — как лупа над чертежом: линии под ней темнее.
    float lupa = exp(-distance(p, uMysh * vec2(uStorony.x, 1.0) * 0.5) * 3.0);
    cvet = mix(cvet, chernila, clamp(risunok, 0.0, 1.0) * lupa * 0.3);

    gl_FragColor = vec4(cvet, 1.0);
  }
`,kapli:`
  ${r}

  /**
   * Мягкое объединение. Там, где два тела сблизились, между ними
   * вырастает перемычка — так ведёт себя вода, и именно этим капля
   * отличается от шарика.
   */
  float slit(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  /** Расстояние до ближайшей капли из точки. */
  float tela(vec3 t) {
    float hod = uTime * 0.28 + uProkrutka * 1.35;
    float d = 1e9;
    for (int i = 0; i < 5; i++) {
      float n = float(i);
      // Две несовпадающие частоты вместо круга: путь не повторяется на
      // глаз, и капли не ходят строем.
      vec3 c = vec3(
        sin(hod * (0.31 + n * 0.07) + n * 2.1) * (1.05 + n * 0.08),
        cos(hod * (0.27 + n * 0.05) + n * 1.3) * 0.62,
        sin(hod * (0.19 + n * 0.04) + n * 3.7) * 0.7
      );
      d = slit(d, length(t - c) - (0.36 + 0.07 * sin(n * 5.3)), 0.42);
    }
    return d;
  }

  /** Наклон поля — он же нормаль поверхности. */
  vec3 naklon(vec3 t) {
    vec2 e = vec2(0.0022, 0.0);
    return normalize(vec3(
      tela(t + e.xyy) - tela(t - e.xyy),
      tela(t + e.yxy) - tela(t - e.yxy),
      tela(t + e.yyx) - tela(t - e.yyx)
    ));
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uStorony.x, 1.0);

    // Бумага с еле уловимой мятной нотой. Чисто белый фон под белой
    // страницей — это не фон, а дырка.
    vec3 cvet = mix(vec3(1.0, 1.0, 0.998), vec3(0.972, 0.992, 0.986),
                    smoothstep(-0.1, 1.0, uv.y));

    vec3 gde = vec3(uMysh.x * 0.16, uMysh.y * 0.1, -3.7);
    vec3 luch = normalize(vec3(p.x, p.y, 1.25));

    // Оболочка. Луч, который не попал в шар вокруг всех капель, не
    // попадёт и в каплю — и считать его дальше незачем. Это снимает с
    // видеокарты почти весь экран: капли занимают его меньшую часть.
    float b = dot(gde, luch);
    float c0 = dot(gde, gde) - 2.35 * 2.35;
    float razlichitel = b * b - c0;

    if (razlichitel > 0.0) {
      float koren = sqrt(razlichitel);
      float t = max(-b - koren, 0.0);
      float konec = -b + koren;

      bool popal = false;
      for (int i = 0; i < 44; i++) {
        float d = tela(gde + luch * t);
        if (d < 0.0035) { popal = true; break; }
        t += d;
        if (t > konec) break;
      }

      if (popal) {
        vec3 tochka = gde + luch * t;
        vec3 n = naklon(tochka);

        vec3 kSvetu = normalize(vec3(-0.45, 0.8, -0.4));
        float svet = 0.5 + 0.5 * dot(n, kSvetu);

        // Кромка. У воды край всегда светлее середины: свет уходит по
        // касательной. Без этого капля читается как матовый шар.
        float kromka = pow(1.0 - max(dot(n, -luch), 0.0), 2.6);

        // Блик — маленький и один. Два блика на капле выдают рисунок.
        float blik = pow(max(dot(reflect(luch, n), kSvetu), 0.0), 26.0);

        vec3 myata = vec3(0.29, 0.62, 0.56);
        vec3 telo = mix(myata, vec3(0.93, 0.99, 0.97), svet * 0.85);
        telo = mix(telo, vec3(0.55, 0.85, 0.78), kromka * 0.7);
        telo += vec3(1.0) * blik * 0.5;

        // Дальние капли растворяются — иначе задняя стоит вырезанной.
        cvet = mix(telo, cvet, smoothstep(3.2, 5.6, t));
      }
    }

    // И почти всё уходит обратно в бумагу. Здесь это не осторожность, а
    // правило: поверх фона идёт цена лечения, и она обязана читаться.
    cvet = mix(vec3(0.997, 1.0, 0.998), cvet, 0.3);

    gl_FragColor = vec4(cvet, 1.0);
  }
`,zvuk:`
  ${r}

  /** Громкость столбика: номер полосы и номер ряда дают своё число. */
  float gromkost(float polosa, float ryad) {
    float a = shum(vec2(polosa * 0.35, ryad * 0.21));
    float b = shum(vec2(polosa * 1.10 + 31.7, ryad * 0.62 + 11.3));
    // Низкие частоты громче высоких — так выглядит любая настоящая
    // спектрограмма речи, и ровный забор её бы выдал.
    float spad = exp(-abs(polosa) * 0.09);
    return clamp((a * 0.75 + b * 0.35) * (0.45 + spad), 0.0, 1.0);
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uStorony.x, 1.0);

    vec3 bumaga = vec3(1.0, 1.0, 1.0);
    vec3 cvet = bumaga;

    vec3 tok = vec3(0.184, 0.294, 1.0);

    // Высота глаза над полом и место горизонта на экране.
    float H = 0.68;
    float gorizont = 0.18 + uMysh.y * 0.03;

    float hod = uTime * 0.5 + uProkrutka * 3.4;
    float shag = 0.30;

    for (int i = 0; i < 18; i++) {
      // Дальний ряд — первым. Порядок здесь и есть глубина.
      float nomer = float(17 - i);
      float z = 1.0 + (nomer + fract(hod)) * shag;

      // Мир на этой глубине: экранная точка умножается на расстояние.
      float X = p.x * z + uMysh.x * 0.35;

      float krok = 0.14;
      float polosa = floor(X / krok);
      float vnutri = abs(X - (polosa + 0.5) * krok);
      if (vnutri > 0.05) continue;

      float g = gromkost(polosa, nomer + floor(hod));
      float vys = 0.04 + g * 0.30;

      float niz = -H / z + gorizont;
      float verhPeredniy = (-H + vys) / z + gorizont;
      float verhZadniy = (-H + vys) / (z + 0.16) + gorizont;

      // Даль растворяется. Без этого у горизонта столбики становятся
      // тоньше точки и начинают дрожать рябью.
      float dal = 1.0 - smoothstep(3.2, 5.6, z);
      if (dal <= 0.001) continue;

      float kray = 0.0028 + 0.0016 * z;

      // Передняя грань.
      float perednyaya = smoothstep(niz - kray, niz + kray, p.y)
                       * (1.0 - smoothstep(verhPeredniy - kray, verhPeredniy + kray, p.y));
      // Верхняя грань: её видно, потому что глаз выше столбиков.
      float verhnyaya = smoothstep(verhPeredniy - kray, verhPeredniy + kray, p.y)
                      * (1.0 - smoothstep(verhZadniy - kray, verhZadniy + kray, p.y));

      vec3 cvetPeredney = mix(bumaga, tok, 0.34 + g * 0.3);
      vec3 cvetVerhney = mix(bumaga, tok, 0.14 + g * 0.12);

      cvet = mix(cvet, cvetPeredney, perednyaya * dal);
      cvet = mix(cvet, cvetVerhney, verhnyaya * dal);
    }

    // Пол под столбиками — тончайшая линия горизонта, чтобы ряды не
    // висели в пустоте.
    cvet = mix(cvet, mix(bumaga, tok, 0.5),
               (1.0 - smoothstep(0.0, 0.0035, abs(p.y - gorizont))) * 0.16);

    // Поверх фона стоит чёрный текст огромного кегля. Синего остаётся
    // ровно столько, чтобы глаз увидел движение.
    cvet = mix(bumaga, cvet, 0.28);

    gl_FragColor = vec4(cvet, 1.0);
  }
`,sutki:`
  ${r}

  /** Волна \xabсейчас\xbb идёт по полю наискось и возвращается. */
  float volna(vec2 kletka, float hod) {
    float u = (kletka.x + kletka.y * 0.45) * 0.5 - hod;
    float d = mod(u, 7.0) - 3.5;
    return exp(-d * d * 0.85);
  }

  /**
   * Высота ячейки. Между ячейками — щель, и в ней видно дно.
   *
   * Ячейки нарочно ПРОДОЛГОВАТЫЕ, а не квадратные: это получасовые
   * окна расписания, а в расписании время идёт полосой. Квадраты
   * читались бы обоями, а не сеткой дня.
   */
  float vysota(vec2 xz, float hod) {
    vec2 q = xz * vec2(0.75, 1.35);
    vec2 kletka = floor(q);
    vec2 f = fract(q) - 0.5;
    if (max(abs(f.x), abs(f.y)) > 0.4) return 0.0;
    // Каждая ячейка чуть приподнята всегда: поле должно читаться и
    // тогда, когда волна ушла в другой конец.
    return 0.025 + volna(kletka, hod) * 0.34;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uStorony.x, 1.0);

    vec3 fon = vec3(0.949, 0.961, 0.973);
    vec3 chernila = vec3(0.075, 0.102, 0.149);
    vec3 akcent = vec3(0.298, 0.227, 0.831);

    float hod = uTime * 0.34 + uProkrutka * 1.9;

    // Взгляд сверху и сбоку, как на разложенную по столу схему.
    vec3 luch = normalize(vec3(-0.52, -0.78, 0.60));
    vec3 pravo = normalize(cross(vec3(0.0, 1.0, 0.0), luch));
    vec3 verh = cross(luch, pravo);

    float mashtab = 9.5;

    // Глаз поднимается вместе с охватом. Иначе у нижнего края экрана
    // луч начинается НИЖЕ поля: слой он проходит ещё до первого шага,
    // и низ экрана остаётся пустым — при совершенно исправном коде.
    vec3 gde = (p.x * mashtab + uMysh.x * 0.5) * pravo
             + (p.y * mashtab + uMysh.y * 0.3) * verh
             + vec3(0.0, mashtab * 0.62, 0.0);

    // Слой, в котором вообще может оказаться ячейка. Взгляд
    // параллельный, значит вход и выход считаются один раз, точно.
    float vhod = (0.4 - gde.y) / luch.y;
    float vyhod = (0.0 - gde.y) / luch.y;
    float t = max(vhod, 0.0);
    float dt = (vyhod - t) / 46.0;

    vec3 cvet = fon;

    if (dt > 0.0) {
      bool popal = false;
      float vys = 0.0;
      vec3 tochka = vec3(0.0);

      for (int i = 0; i < 46; i++) {
        tochka = gde + luch * t;
        vys = vysota(tochka.xz, hod);
        if (tochka.y < vys) { popal = true; break; }
        t += dt;
      }

      if (popal) {
        vec2 f = fract(tochka.xz * vec2(0.75, 1.35)) - 0.5;
        float krysha = step(vys - 0.015, tochka.y);

        // Насколько эта ячейка поднята — столько в ней и цвета.
        float podnyata = clamp((vys - 0.025) / 0.34, 0.0, 1.0);

        float svet = krysha > 0.5
          ? 0.97
          : (abs(f.x) > abs(f.y) ? 0.86 : 0.78);

        vec3 telo = mix(vec3(svet), mix(vec3(svet), akcent, 0.5), podnyata);

        // Тонкая линия по краю крыши: без неё поле ячеек сливается в
        // пятно, а вся суть в том, что ячеек МНОГО и они отдельные.
        float ramka = krysha * smoothstep(0.34, 0.4, max(abs(f.x), abs(f.y)));
        telo = mix(telo, mix(telo, chernila, 0.35), ramka);

        cvet = telo;
      }
    }

    // Здесь работают весь день. Фону оставлено ровно столько, чтобы
    // поля панели получили глубину, и ни на четверть больше.
    cvet = mix(fon, cvet, 0.3);

    gl_FragColor = vec4(cvet, 1.0);
  }
`,lenty:`
  ${r}

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uStorony.x, 1.0);

    vec3 bumaga = vec3(1.0, 0.988, 0.949);
    vec3 cvet = bumaga;

    float hod = uTime * 0.32 + uProkrutka * 1.5;

    // Дальность ближайшей уже нарисованной ленты в этой точке экрана.
    // Она и решает, кто кого закрывает.
    float blizhe = 1e9;

    for (int i = 0; i < 3; i++) {
      float n = float(i);

      vec3 kraska = i == 0 ? vec3(0.961, 0.882, 0.294)   // лимон
                  : i == 1 ? vec3(1.0, 0.42, 0.29)       // коралл
                           : vec3(0.557, 0.878, 0.753);  // мята

      float chastota = 1.15 + n * 0.55;
      float faza = n * 2.4 + hod * (0.85 + n * 0.22);

      // Дальность гуляет вдоль ленты: то ближе к глазу, то дальше.
      float z = 2.1 + 0.95 * sin(p.x * 1.35 + faza * 0.8 + n * 1.9);
      float k = 1.7 / z;

      float os = (0.34 - n * 0.09) * sin(p.x * chastota + faza) * k
               + (n - 1.0) * 0.16 + uMysh.y * 0.04;

      // Перекрут: там, где лента повёрнута ребром, от неё остаётся нить.
      float rebro = abs(cos(p.x * 1.9 + faza * 1.15 + n * 2.2));
      float tolshchina = 0.075 * k * (0.18 + 0.82 * rebro);

      float otOsi = (p.y - os) / max(tolshchina, 0.0006);
      float maska = 1.0 - smoothstep(0.72, 1.0, abs(otOsi));
      if (maska <= 0.002) continue;
      if (z >= blizhe) continue;

      // Свет поперёк ленты: край темнее середины — так плоская полоса
      // становится выгнутой.
      float poperyok = 1.0 - 0.42 * otOsi * otOsi + 0.16 * otOsi;
      vec3 telo = kraska * clamp(poperyok, 0.5, 1.12);

      // Даль выцветает в бумагу.
      telo = mix(telo, bumaga, smoothstep(1.6, 3.3, z) * 0.55);

      cvet = mix(cvet, telo, maska);
      if (maska > 0.5) blizhe = z;
    }

    // Мир Charla и без того громкий: полосы, лимон, коралл. Фон обязан
    // остаться подкладкой, иначе на странице станет нечего читать.
    cvet = mix(bumaga, cvet, 0.4);

    gl_FragColor = vec4(cvet, 1.0);
  }
`};var n=e.i(92919);let l={en:{ozhivit:"Turn the background on",pochemu:"Your system asks for less motion, so the background is showing a single still frame. This is the live version — it can be switched off again at any time."},es:{ozhivit:"Activar el fondo",pochemu:"Tu sistema pide menos movimiento, así que el fondo muestra un solo fotograma fijo. Esta es la versión viva — se puede desactivar cuando quieras."}};function v({yazyk:e}){let r=(0,o.useSyncExternalStore)(()=>()=>{},()=>!0,()=>!1),i=(0,o.useSyncExternalStore)(a.podpisatsya,a.dvizhenieZhivoe,()=>!0),c=(0,o.useSyncExternalStore)(a.podpisatsya,a.zamerliIz_zaSistemy,()=>!1);if(!r||i||!c)return null;let s=l[e]??l.en;return(0,t.jsxs)("button",{type:"button",className:n.default.ozhivit,onClick:()=>(0,a.ustanovit)("zhivoe"),title:s.pochemu,"data-knopka":"dvizhenie",children:[(0,t.jsx)("span",{className:n.default.tochka,"aria-hidden":"true"}),s.ozhivit]})}e.s(["default",0,function({yavlenie:e,yazyk:r="en"}){let l=(0,o.useRef)(null),[c,s]=(0,o.useState)(0);return(0,o.useEffect)(()=>{let t=l.current;if(!t)return;let o=t.getContext("webgl",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!o)return;let r=(e,t)=>{let a=o.createShader(e);return a?(o.shaderSource(a,t),o.compileShader(a),o.getShaderParameter(a,o.COMPILE_STATUS))?a:(console.error("Shader failed to compile:",o.getShaderInfoLog(a)),o.deleteShader(a),null):null},n=r(o.VERTEX_SHADER,"attribute vec2 a;varying vec2 vUv;void main(){vUv=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}"),v=r(o.FRAGMENT_SHADER,i[e]);if(!n||!v)return;let c=o.createProgram();if(!c)return;if(o.attachShader(c,n),o.attachShader(c,v),o.linkProgram(c),!o.getProgramParameter(c,o.LINK_STATUS))return void console.error("Program failed to link:",o.getProgramInfoLog(c));o.useProgram(c);let f=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,f),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),o.STATIC_DRAW);let h=o.getAttribLocation(c,"a");o.enableVertexAttribArray(h),o.vertexAttribPointer(h,2,o.FLOAT,!1,0,0);let u=o.getUniformLocation(c,"uTime"),m=o.getUniformLocation(c,"uStorony"),y=o.getUniformLocation(c,"uProkrutka"),d=o.getUniformLocation(c,"uMysh"),p={x:0,y:0},k={est:0,plavno:0},x=!0;function g(e){p.x=e.clientX/window.innerWidth*2-1,p.y=-(e.clientY/window.innerHeight*2-1),x=!0}function b(){if(!t||!o)return;let e=Math.min(window.devicePixelRatio||1,1.5),a=Math.max(1,Math.round(window.innerWidth*e)),r=Math.max(1,Math.round(window.innerHeight*e));(t.width!==a||t.height!==r)&&(t.width=a,t.height=r,o.viewport(0,0,a,r),x=!0),o.uniform2f(m,a/r,1)}window.addEventListener("pointermove",g,{passive:!0}),b(),window.addEventListener("resize",b);let z=(0,a.dvizhenieZhivoe)(),w=(0,a.podpisatsya)(e=>{z=e,x=!0}),S=!0,P=0,M=0,_=0,T=0;function A(){o&&(o.uniform1f(u,_),o.uniform1f(y,k.plavno),o.uniform2f(d,p.x,p.y),o.drawArrays(o.TRIANGLES,0,3),T++)}function E(e){e.preventDefault(),S=!1}function U(){s(e=>e+1)}requestAnimationFrame(function e(t){if(!S||!o||o.isContextLost())return;P||(P=t);let a=Math.min((t-M)/1e3||0,.05);M=t,z&&(_+=a),k.est=window.scrollY/Math.max(window.innerHeight,1);let r=k.est-k.plavno;Math.abs(r)>4e-4&&(x=!0),k.plavno+=r*Math.min(1,3.4*a),(z||x)&&(A(),x=!1),requestAnimationFrame(e)}),t.addEventListener("webglcontextlost",E),t.addEventListener("webglcontextrestored",U);let L={yavlenie:e,kadrov:()=>T,tiho:()=>!z,tochka:(e,a)=>{if(!o||!t)return null;A();let r=t.width/Math.max(window.innerWidth,1),i=new Uint8Array(4);return o.readPixels(Math.max(0,Math.min(t.width-1,Math.round(e*r))),Math.max(0,Math.min(t.height-1,Math.round(t.height-a*r))),1,1,o.RGBA,o.UNSIGNED_BYTE,i),[i[0],i[1],i[2]]},snyat:e=>{if(!o||!t)return[];"number"==typeof e?(o.uniform1f(u,e),o.uniform1f(y,0),o.uniform2f(d,0,0),o.drawArrays(o.TRIANGLES,0,3),x=!0):A();let a=[];for(let e=1;e<=40;e++){let r=Math.floor(.6180339887*e%1*(t.width-1)),i=Math.floor(.7548776662*e%1*(t.height-1)),n=new Uint8Array(4);o.readPixels(r,i,1,1,o.RGBA,o.UNSIGNED_BYTE,n),a.push(n[0],n[1],n[2])}return a},skolkoCvetov:e=>{if(!o||!t)return 0;"number"==typeof e?(o.uniform1f(u,e),o.uniform1f(y,0),o.uniform2f(d,0,0),o.drawArrays(o.TRIANGLES,0,3),x=!0):A();let a=new Uint8Array(t.width*t.height*4);o.readPixels(0,0,t.width,t.height,o.RGBA,o.UNSIGNED_BYTE,a);let r=new Set;for(let e=0;e<64;e++)for(let o=0;o<64;o++){let i=Math.floor((e+.5)/64*t.width),n=(Math.floor((o+.5)/64*t.height)*t.width+i)*4;r.add(a[n]>>3<<10|a[n+1]>>3<<5|a[n+2]>>3)}return r.size}};return window.__demo3d=L,()=>{S=!1,window.__demo3d===L&&delete window.__demo3d,window.removeEventListener("pointermove",g),window.removeEventListener("resize",b),w(),t.removeEventListener("webglcontextlost",E),t.removeEventListener("webglcontextrestored",U),o.deleteBuffer(f),o.deleteProgram(c),o.deleteShader(n),o.deleteShader(v)}},[e,c]),(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("canvas",{ref:l,className:n.default.holst,"aria-hidden":"true"}),(0,t.jsx)(v,{yazyk:r})]})}],36735)}]);