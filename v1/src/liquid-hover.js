import { gsap } from 'gsap';

// Liquid image swap (Archline-style): the two photos melt through a flowing noise field.
// The canvas renders only while a transition runs; without WebGL the CSS crossfade stays in charge.

const VERTEX = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * .5 + .5;
  gl_Position = vec4(aPosition, 0., 1.);
}`;

const FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform vec2 uFromScale;
uniform vec2 uToScale;
uniform float uProgress;
uniform float uTime;
uniform float uAspect;

vec3 mod289(vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec4 mod289(vec4 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec4 permute(vec4 x) { return mod289(((x * 34.) + 1.) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - .85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1. / 6., 1. / 3.);
  const vec4 D = vec4(0., .5, 1., 2.);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1. - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0., i1.z, i2.z, 1.)) + i.y + vec4(0., i1.y, i2.y, 1.)) + i.x + vec4(0., i1.x, i2.x, 1.));
  float n_ = .142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49. * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7. * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1. - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2. + 1.;
  vec4 s1 = floor(b1) * 2. + 1.;
  vec4 sh = -step(h, vec4(0.));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.);
  m = m * m;
  return 42. * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
float fbm(vec3 p) {
  return snoise(p) * .6 + snoise(p * 2.1 + 3.7) * .28 + snoise(p * 4.3 + 9.1) * .12;
}
vec2 cover(vec2 uv, vec2 scale) { return (uv - .5) * scale + .5; }

void main() {
  vec2 uv = vUv;
  vec2 p = vec2(uv.x * uAspect, uv.y);
  float t = uTime * .22;

  // Two offset noise fields give the flow a direction; folding them adds the contour-like ripples.
  float n1 = fbm(vec3(p * 1.7, t));
  float n2 = fbm(vec3(p * 1.7 + 11.3, t + 4.1));
  float ripple = sin(n1 * 7. + uProgress * 6.2831) * .5;
  float wave = sin(uProgress * 3.14159265);
  vec2 flow = vec2(n1, n2) + vec2(ripple) * .22;

  vec2 fromUv = uv + flow * wave * .07 * (.6 + uProgress);
  vec2 toUv = uv - flow * wave * .07 * (1.6 - uProgress);

  // The new photo pours in wherever the noise falls below the advancing threshold.
  float field = smoothstep(-.55, .55, n1 * .8 + n2 * .35);
  float edge = mix(-.18, 1.18, uProgress);
  float mask = smoothstep(field - .12, field + .12, edge);

  vec4 fromColor = texture2D(uFrom, clamp(cover(fromUv, uFromScale), 0., 1.));
  vec4 toColor = texture2D(uTo, clamp(cover(toUv, uToScale), 0., 1.));
  gl_FragColor = mix(fromColor, toColor, mask);
}`;

const loadImage = img => (img.complete && img.naturalWidth
  ? Promise.resolve(img)
  : new Promise((resolve, reject) => {
    img.addEventListener('load', () => resolve(img), { once: true });
    img.addEventListener('error', reject, { once: true });
  })
).then(() => (img.decode ? img.decode().catch(() => {}) : null)).then(() => img);

const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
};

const createTexture = (gl, image) => {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  return texture;
};

// object-fit: cover, expressed as a UV scale around the centre.
const coverScale = (image, width, height) => {
  const box = width / height;
  const photo = image.naturalWidth / image.naturalHeight;
  return photo > box ? [box / photo, 1] : [1, photo / box];
};

async function mountLiquid(media) {
  const [baseImage, altImage] = media.querySelectorAll('img');
  const canvas = document.createElement('canvas');
  canvas.className = 'liquid-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'low-power' });
  if (!gl) return null;

  await Promise.all([loadImage(baseImage), loadImage(altImage)]);

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniform = name => gl.getUniformLocation(program, name);
  const u = {
    from: uniform('uFrom'), to: uniform('uTo'), fromScale: uniform('uFromScale'), toScale: uniform('uToScale'),
    progress: uniform('uProgress'), time: uniform('uTime'), aspect: uniform('uAspect')
  };
  gl.activeTexture(gl.TEXTURE0);
  createTexture(gl, baseImage);
  gl.activeTexture(gl.TEXTURE1);
  createTexture(gl, altImage);
  gl.uniform1i(u.from, 0);
  gl.uniform1i(u.to, 1);

  const state = { progress: 0, time: 0 };
  const render = () => {
    gl.uniform1f(u.progress, state.progress);
    gl.uniform1f(u.time, state.time);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  const resize = () => {
    const { width, height } = media.getBoundingClientRect();
    if (!width || !height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2fv(u.fromScale, coverScale(baseImage, width, height));
    gl.uniform2fv(u.toScale, coverScale(altImage, width, height));
    gl.uniform1f(u.aspect, width / height);
    render();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(media);

  media.append(canvas);
  resize();
  media.classList.add('has-liquid');

  let tween;
  const to = target => {
    tween?.kill();
    tween = gsap.to(state, {
      progress: target,
      time: state.time + 1.6,
      duration: 1.35,
      ease: 'power2.inOut',
      onUpdate: render
    });
  };

  return {
    show: () => to(1),
    hide: () => to(0),
    toggle: () => to(state.progress > .5 ? 0 : 1),
    destroy: () => {
      tween?.kill();
      resizeObserver.disconnect();
      canvas.remove();
      media.classList.remove('has-liquid');
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  };
}

// Each venue swaps its photo when the venue (image or card) is hovered or focused.
// Touch screens have no hover, so the swap plays on its own while the venue is on screen.
export function initLiquidHover(venues, { reducedMotion }) {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  const cleanups = [];

  venues.forEach(venue => {
    const media = venue.querySelector('.venue-media');
    const setCssState = on => venue.classList.toggle('is-swapped', on);
    let liquid = null;
    let autoTimer = 0;
    let visible = false;

    const show = () => { setCssState(true); liquid?.show(); };
    const hide = () => { setCssState(false); liquid?.hide(); };
    const autoplay = () => {
      window.clearInterval(autoTimer);
      if (!visible || canHover.matches || reducedMotion.matches) return;
      autoTimer = window.setInterval(() => {
        const on = !venue.classList.contains('is-swapped');
        setCssState(on);
        if (liquid) on ? liquid.show() : liquid.hide();
      }, 3600);
    };

    venue.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') show(); });
    venue.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') hide(); });
    venue.addEventListener('focusin', show);
    venue.addEventListener('focusout', event => { if (!venue.contains(event.relatedTarget)) hide(); });

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !liquid && !reducedMotion.matches && !media.dataset.liquidPending) {
        media.dataset.liquidPending = 'true';
        mountLiquid(media)
          .then(instance => {
            liquid = instance;
            if (liquid && venue.classList.contains('is-swapped')) liquid.show();
          })
          .catch(() => {});
      }
      autoplay();
    }, { rootMargin: '25% 0px' });
    observer.observe(venue);

    cleanups.push(() => {
      observer.disconnect();
      window.clearInterval(autoTimer);
      liquid?.destroy();
    });
  });

  return () => cleanups.forEach(cleanup => cleanup());
}
