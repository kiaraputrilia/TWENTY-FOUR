// ======================================
// PAGE 9 — PHYSICALLY SIMULATED WATER RIPPLES
// (WebGL2, double-buffer wave equation)
// Ripples only appear on click/drag — no ambient auto-ripples
// ======================================

const canvas = document.getElementById("waterCanvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    console.warn("WebGL2 is not supported in this browser — the ripple effect can't run.");
}

const floatExt = gl && gl.getExtension("EXT_color_buffer_float");

if (gl && !floatExt) {
    console.warn("EXT_color_buffer_float not supported — the ripple effect can't run.");
}


// ======================================
// SHADERS
// ======================================

const VERTEX_SRC = `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const SIM_FRAG_SRC = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;

uniform sampler2D u_previous;
uniform sampler2D u_beforePrevious;
uniform vec2 u_texel;

uniform bool u_injectActive;
uniform vec2 u_injectPos;
uniform float u_injectRadius;
uniform float u_injectStrength;

uniform float u_damping;

void main() {

    float hUp    = texture(u_previous, v_uv + vec2(0.0, u_texel.y)).r;
    float hDown  = texture(u_previous, v_uv - vec2(0.0, u_texel.y)).r;
    float hLeft  = texture(u_previous, v_uv - vec2(u_texel.x, 0.0)).r;
    float hRight = texture(u_previous, v_uv + vec2(u_texel.x, 0.0)).r;

    float hBefore = texture(u_beforePrevious, v_uv).r;

    float newHeight = (hUp + hDown + hLeft + hRight) * 0.5 - hBefore;
    newHeight *= u_damping;

    if (u_injectActive) {
        float dist = distance(v_uv, u_injectPos);
        if (dist < u_injectRadius) {
            float falloff = 1.0 - (dist / u_injectRadius);
            newHeight += u_injectStrength * falloff * falloff;
        }
    }

    outColor = vec4(newHeight, 0.0, 0.0, 1.0);
}
`;

// render pass: still water renders as the base blue color;
// ripple edges (high slope) blend toward white as highlights
const RENDER_FRAG_SRC = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;

uniform sampler2D u_height;
uniform vec2 u_texel;
uniform float u_brightness;
uniform vec3 u_baseColor;

void main() {

    float hL = texture(u_height, v_uv - vec2(u_texel.x, 0.0)).r;
    float hR = texture(u_height, v_uv + vec2(u_texel.x, 0.0)).r;
    float hD = texture(u_height, v_uv - vec2(0.0, u_texel.y)).r;
    float hU = texture(u_height, v_uv + vec2(0.0, u_texel.y)).r;

    vec2 gradient = vec2(hL - hR, hD - hU);
    float slope = length(gradient) * u_brightness;

    float highlight = clamp(slope, 0.0, 1.0);

    vec3 color = mix(u_baseColor, vec3(1.0), highlight);

    outColor = vec4(color, 1.0);
}
`;


// ======================================
// GL HELPERS
// ======================================

function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function createProgram(vsSource, fsSource) {
    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return null;
    }

    return program;
}

function createHeightBuffer(width, height) {

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.R32F,
        width, height, 0,
        gl.RED, gl.FLOAT, null
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D, texture, 0
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return { texture, framebuffer };
}


// ======================================
// SETUP (only runs if WebGL2 + float extension are available)
// ======================================

let simProgram, renderProgram;
let quadBuffer;
let simWidth, simHeight;
let buffers = []; // 3 ping-ponged height buffers
let order = [0, 1, 2]; // [target, previous, beforePrevious]

let pointerPos = { x: 0.5, y: 0.5 };
let pointerActive = false;

const DAMPING = 0.985;
const INJECT_RADIUS = 0.025;
const CLICK_STRENGTH = -0.6;
const RENDER_BRIGHTNESS = 45.0;

// #002FA7 → normalized RGB
const BASE_COLOR = [0.0, 0.1843, 0.6549];

if (gl && floatExt) {

    simProgram = createProgram(VERTEX_SRC, SIM_FRAG_SRC);
    renderProgram = createProgram(VERTEX_SRC, RENDER_FRAG_SRC);

    quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
    );

    setupBuffers();

    window.addEventListener("resize", () => {
        resizeCanvas();
        setupBuffers();
    });

    canvas.addEventListener("pointerdown", (e) => {
        updatePointer(e);
        pointerActive = true;
        inject(pointerPos.x, pointerPos.y, CLICK_STRENGTH);
    });

    canvas.addEventListener("pointermove", (e) => {
        updatePointer(e);
        if (pointerActive) {
            inject(pointerPos.x, pointerPos.y, CLICK_STRENGTH * 0.4);
        }
    });

    canvas.addEventListener("pointerup", () => {
        pointerActive = false;
    });

    canvas.addEventListener("pointercancel", () => {
        pointerActive = false;
    });

    resizeCanvas();
    requestAnimationFrame(animate);

}


// ======================================
// SETUP HELPERS
// ======================================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function setupBuffers() {

    const maxDim = 420;
    const aspect = window.innerWidth / window.innerHeight;

    if (aspect >= 1) {
        simWidth = maxDim;
        simHeight = Math.round(maxDim / aspect);
    } else {
        simHeight = maxDim;
        simWidth = Math.round(maxDim * aspect);
    }

    buffers.forEach(b => {
        gl.deleteTexture(b.texture);
        gl.deleteFramebuffer(b.framebuffer);
    });

    buffers = [
        createHeightBuffer(simWidth, simHeight),
        createHeightBuffer(simWidth, simHeight),
        createHeightBuffer(simWidth, simHeight)
    ];

    order = [0, 1, 2];

}

function updatePointer(e) {
    const rect = canvas.getBoundingClientRect();
    pointerPos.x = (e.clientX - rect.left) / rect.width;
    pointerPos.y = 1.0 - (e.clientY - rect.top) / rect.height;
}


// ======================================
// INJECT A RIPPLE INTO THE SIMULATION
// ======================================

function inject(x, y, strength) {

    const targetIdx = order[0];
    const previousIdx = order[1];
    const beforeIdx = order[2];

    gl.bindFramebuffer(gl.FRAMEBUFFER, buffers[targetIdx].framebuffer);
    gl.viewport(0, 0, simWidth, simHeight);

    gl.useProgram(simProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    const posLoc = gl.getAttribLocation(simProgram, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, buffers[previousIdx].texture);
    gl.uniform1i(gl.getUniformLocation(simProgram, "u_previous"), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, buffers[beforeIdx].texture);
    gl.uniform1i(gl.getUniformLocation(simProgram, "u_beforePrevious"), 1);

    gl.uniform2f(gl.getUniformLocation(simProgram, "u_texel"), 1 / simWidth, 1 / simHeight);
    gl.uniform1f(gl.getUniformLocation(simProgram, "u_damping"), DAMPING);

    gl.uniform1i(gl.getUniformLocation(simProgram, "u_injectActive"), true);
    gl.uniform2f(gl.getUniformLocation(simProgram, "u_injectPos"), x, y);
    gl.uniform1f(gl.getUniformLocation(simProgram, "u_injectRadius"), INJECT_RADIUS);
    gl.uniform1f(gl.getUniformLocation(simProgram, "u_injectStrength"), strength);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    order = [order[2], order[0], order[1]];

}


// ======================================
// STEP THE SIMULATION (no new ripple this frame)
// ======================================

function step() {

    const targetIdx = order[0];
    const previousIdx = order[1];
    const beforeIdx = order[2];

    gl.bindFramebuffer(gl.FRAMEBUFFER, buffers[targetIdx].framebuffer);
    gl.viewport(0, 0, simWidth, simHeight);

    gl.useProgram(simProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    const posLoc = gl.getAttribLocation(simProgram, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, buffers[previousIdx].texture);
    gl.uniform1i(gl.getUniformLocation(simProgram, "u_previous"), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, buffers[beforeIdx].texture);
    gl.uniform1i(gl.getUniformLocation(simProgram, "u_beforePrevious"), 1);

    gl.uniform2f(gl.getUniformLocation(simProgram, "u_texel"), 1 / simWidth, 1 / simHeight);
    gl.uniform1f(gl.getUniformLocation(simProgram, "u_damping"), DAMPING);
    gl.uniform1i(gl.getUniformLocation(simProgram, "u_injectActive"), false);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    order = [order[2], order[0], order[1]];

}


// ======================================
// RENDER TO SCREEN
// ======================================

function render() {

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.useProgram(renderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    const posLoc = gl.getAttribLocation(renderProgram, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, buffers[order[1]].texture);
    gl.uniform1i(gl.getUniformLocation(renderProgram, "u_height"), 0);

    gl.uniform2f(gl.getUniformLocation(renderProgram, "u_texel"), 1 / simWidth, 1 / simHeight);
    gl.uniform1f(gl.getUniformLocation(renderProgram, "u_brightness"), RENDER_BRIGHTNESS);
    gl.uniform3f(gl.getUniformLocation(renderProgram, "u_baseColor"), BASE_COLOR[0], BASE_COLOR[1], BASE_COLOR[2]);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

}


// ======================================
// ANIMATION LOOP
// ======================================

function animate() {

    step();
    render();

    requestAnimationFrame(animate);

}