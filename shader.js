/**
 * Fundo animado do hero, copiado do HeroShader do projeto Agendar-se: duas cores escorrendo uma sobre a outra, como
 * tinta na água, e o ponteiro puxando o fluxo e acendendo um brilho onde passa. WebGL puro, sem biblioteca: um único
 * triângulo cobrindo a tela e o desenho todo no fragment shader (ruído fractal com distorção de domínio).
 *
 * Desenha em resolução reduzida, para quando sai da tela ou a aba fica escondida, e com movimento reduzido desenha um
 * quadro só, parado.
 */
const HERO_SHADER_VERTEX = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() { v_uv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }`;

// Alguns celulares não têm precisão alta no fragment shader: caem para a média em vez de não desenhar.
const HERO_SHADER_FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_hover;
uniform vec3 u_a;
uniform vec3 u_b;
uniform vec3 u_deep;
uniform vec3 u_glow;
varying vec2 v_uv;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = r * p * 2.02; a *= 0.5; }
  return v;
}

void main() {
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(v_uv.x * aspect, v_uv.y);
  vec2 m = vec2(u_pointer.x * aspect, u_pointer.y);
  // O ponteiro puxa o fluido para perto dele, mais forte quanto mais perto.
  float d = distance(p, m);
  float pull = exp(-d * d * 5.0) * u_hover;
  p += (m - p) * pull * 0.3;

  float t = u_time * 0.045;
  vec2 q = vec2(fbm(p * 1.5 + t), fbm(p * 1.5 + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p * 1.5 + 3.0 * q + vec2(1.7, 9.2) + t * 1.4), fbm(p * 1.5 + 3.0 * q + vec2(8.3, 2.8) - t * 1.1));
  float f = fbm(p * 1.5 + 3.0 * r);

  // As duas cores disputam o espaço; o fundo aparece nas dobras.
  vec3 col = mix(u_b, u_a, smoothstep(0.25, 0.75, f));
  col = mix(col, u_deep, smoothstep(0.55, 1.05, length(r)) * 0.75);
  col = mix(col, u_a, smoothstep(0.6, 0.9, q.x) * 0.5);
  col = mix(col, u_glow, pull * 0.45 + smoothstep(0.78, 0.95, f) * 0.18);
  // Bordas um pouco mais escuras, para o texto do centro ficar firme.
  col = mix(col, u_deep, smoothstep(0.45, 1.1, length(v_uv - 0.5)) * 0.55);
  // Granulado leve: evita faixas no degradê.
  col += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * (3.0 / 255.0);
  gl_FragColor = vec4(col, 1.0);
}`;

const SHADER_PALETTES = {
    black: { a: [0.11, 0.11, 0.11], b: [0.025, 0.025, 0.025], deep: [0, 0, 0], glow: [0.24, 0.24, 0.24] },
    // Vermelho sem tons muito escuros: o título continua legível nas dobras do fluido.
    red: { a: [1, 0, 0], b: [0.8, 0, 0], deep: [0.66, 0, 0], glow: [1, 0.2, 0.14] },
};

function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

/**
 * Liga o shader no canvas. Devolve os controles, ou null se o aparelho não tiver WebGL.
 * `onTextFrame` recebe o canvas pintado com a paleta vermelha, antes do quadro preto que vai para a tela: precisa copiar
 * o desenho na hora, porque o buffer não é preservado.
 */
function startHeroShader(canvas, { onTextFrame } = {}) {
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
    if (!gl) return null;
    const vs = compileShader(gl, gl.VERTEX_SHADER, HERO_SHADER_VERTEX);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, HERO_SHADER_FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return null;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    gl.useProgram(program);

    // Um triângulo maior que a tela cobre tudo com três vértices.
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uniform = (name) => gl.getUniformLocation(program, name);
    const uRes = uniform('u_res'), uTime = uniform('u_time'), uPointer = uniform('u_pointer'), uHover = uniform('u_hover');
    const uColors = { a: uniform('u_a'), b: uniform('u_b'), deep: uniform('u_deep'), glow: uniform('u_glow') };
    const paint = (palette) => {
        Object.keys(uColors).forEach((key) => gl.uniform3fv(uColors[key], palette[key]));
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    // O ponteiro anda suave atrás do real; parado no meio até alguém mexer.
    const pointer = { x: 0.5, y: 0.55, tx: 0.5, ty: 0.55, hover: 0, thover: 0 };
    let frame = 0, visible = true, last = performance.now(), time = 7, speed = 1, textActive = false;

    const resize = () => {
        const scale = Math.min(window.devicePixelRatio || 1, 2) * 0.5;
        const w = Math.max(1, Math.round(canvas.clientWidth * scale)), h = Math.max(1, Math.round(canvas.clientHeight * scale));
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uRes, w, h);
    };
    const draw = () => {
        gl.uniform1f(uTime, time);
        gl.uniform2f(uPointer, pointer.x, pointer.y);
        gl.uniform1f(uHover, pointer.hover);
        if (textActive && onTextFrame) {
            paint(SHADER_PALETTES.red);
            onTextFrame(canvas);
        }
        paint(SHADER_PALETTES.black);
    };
    const tick = (now) => {
        // Passo de tempo limitado: voltar de outra aba não dá um salto no desenho.
        const dt = Math.min(now - last, 50) / 1000;
        last = now;
        time += dt * speed;
        const k = 1 - Math.exp(-dt * 4);
        pointer.x += (pointer.tx - pointer.x) * k;
        pointer.y += (pointer.ty - pointer.y) * k;
        pointer.hover += (pointer.thover - pointer.hover) * k;
        draw();
        frame = requestAnimationFrame(tick);
    };
    const play = () => {
        if (reduce || frame || !visible || document.hidden) return;
        last = performance.now();
        frame = requestAnimationFrame(tick);
    };
    const pause = () => { cancelAnimationFrame(frame); frame = 0; };

    const onPointer = (event) => {
        const rect = canvas.getBoundingClientRect();
        const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
        pointer.tx = (event.clientX - rect.left) / rect.width;
        pointer.ty = 1 - (event.clientY - rect.top) / rect.height;
        pointer.thover = inside ? 1 : 0;
    };

    resize();
    draw();
    new ResizeObserver(() => { resize(); if (!frame) draw(); }).observe(canvas);
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) play(); else pause(); }).observe(canvas);
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { pointer.thover = 0; });
    document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));
    play();

    return {
        setSpeed(value) { speed = value; },
        setTextActive(value) { textActive = value; if (!frame) draw(); },
        // Com a animação parada, nenhum quadro novo viria sozinho.
        redraw() { if (!frame) draw(); },
    };
}
