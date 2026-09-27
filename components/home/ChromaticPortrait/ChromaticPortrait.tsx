'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import styles from './ChromaticPortrait.module.css';

/** Tuning for the cursor trail — raise/lower these to make it stronger/subtler. */
const EFFECT = {
  /** Side (px) of the flowmap texture the trail is painted into. */
  flowSize: 128,
  /** Brush radius of the trail (0–1 of the portrait's height). */
  falloff: 0.15,
  /** How strongly each frame's stroke replaces what's already painted. */
  alpha: 0.5,
  /** Share of the trail kept per 60 Hz frame (lower = shorter trail); scaled to the real frame time. */
  dissipation: 0.92,
  /** How far the image is pushed along the trail. */
  distortion: 0.3,
  /** RGB split along the trail. */
  aberration: 0.12,
  /** Frames stop being drawn this long (ms) after the pointer goes still. */
  idleMs: 1200,
  /**
   * The strengths above are tuned for a landscape (width/height 1.375) image, where they're relative
   * to its width. Scaling by this keeps the trail the same size in pixels on a narrower portrait.
   */
  referenceAspect: 1.375,
};

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
`;

// Flowmap pass: fades the previous trail, then stamps the pointer's velocity (xy) and speed (z)
// under a soft round brush at the pointer.
const flowShader = /* glsl */ `
  uniform sampler2D uPrevious;
  uniform vec2 uMouse;
  uniform vec2 uVelocity;
  uniform float uAspect;
  uniform float uFalloff;
  uniform float uAlpha;
  uniform float uDissipation;
  varying vec2 vUv;

  void main() {
    vec4 color = texture2D(uPrevious, vUv) * uDissipation;
    vec2 cursor = vUv - uMouse;
    cursor.x *= uAspect;
    vec3 stamp = vec3(uVelocity * vec2(1.0, -1.0), 1.0 - pow(1.0 - min(1.0, length(uVelocity)), 3.0));
    float falloff = smoothstep(uFalloff, 0.0, length(cursor)) * uAlpha;
    color.rgb = mix(color.rgb, stamp, vec3(falloff));
    gl_FragColor = color;
  }
`;

// Image pass: the portrait is pushed along the painted trail, with its R and B channels offset in
// opposite directions along it. Channels are read as luminance, so the portrait stays greyscale and
// only the split fringes in colour.
const imageShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform sampler2D uFlow;
  uniform vec2 uScale;
  uniform float uDistortion;
  uniform float uAberration;
  varying vec2 vUv;

  float luma(vec4 c) {
    return dot(c.rgb, vec3(0.299, 0.587, 0.114));
  }

  void main() {
    vec2 flow = texture2D(uFlow, vUv).xy * uScale;
    vec2 uv = vUv - flow * uDistortion;
    vec2 offset = flow * uAberration;
    vec4 r = texture2D(uTexture, uv + offset);
    vec4 g = texture2D(uTexture, uv);
    vec4 b = texture2D(uTexture, uv - offset);
    gl_FragColor = vec4(luma(r), luma(g), luma(b), g.a);
  }
`;

type ChromaticPortraitProps = {
  src: string;
  alt: string;
  /** Called once the texture has loaded and the first frame is on screen. */
  onReady?: () => void;
};

/**
 * Greyscale cut-out portrait that smears and splits into RGB along the cursor's trail (a fading
 * flowmap of pointer velocity), settling back once the pointer stops.
 * Fills its parent, which sets the size (and must match the image's aspect ratio).
 */
export default function ChromaticPortrait({ src, alt, onReady }: ChromaticPortraitProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, premultipliedAlpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    // Ping-pong pair: each frame reads the last trail and writes the next.
    const targetOptions = {
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
    };
    let read = new THREE.WebGLRenderTarget(EFFECT.flowSize, EFFECT.flowSize, targetOptions);
    let write = new THREE.WebGLRenderTarget(EFFECT.flowSize, EFFECT.flowSize, targetOptions);

    const flowUniforms = {
      uPrevious: { value: read.texture },
      uMouse: { value: new THREE.Vector2(-1, -1) },
      uVelocity: { value: new THREE.Vector2() },
      uAspect: { value: 1 },
      uFalloff: { value: EFFECT.falloff },
      uAlpha: { value: EFFECT.alpha },
      uDissipation: { value: EFFECT.dissipation },
    };
    const flowMaterial = new THREE.ShaderMaterial({ vertexShader, fragmentShader: flowShader, uniforms: flowUniforms });
    const flowScene = new THREE.Scene();
    flowScene.add(new THREE.Mesh(geometry, flowMaterial));

    // Left in NoColorSpace: this ShaderMaterial outputs sampled values as-is, so no decode/encode round trip.
    let loaded = false;
    const texture = new THREE.TextureLoader().load(src, () => {
      loaded = true;
      wake();
    });
    texture.minFilter = THREE.LinearFilter;

    const imageUniforms = {
      uTexture: { value: texture },
      uFlow: { value: write.texture },
      uScale: { value: new THREE.Vector2(1, 1) },
      uDistortion: { value: EFFECT.distortion },
      uAberration: { value: EFFECT.aberration },
    };
    const imageMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: imageShader,
      uniforms: imageUniforms,
      transparent: true,
    });
    const imageScene = new THREE.Scene();
    imageScene.add(new THREE.Mesh(geometry, imageMaterial));

    // Pointer state, in the portrait's UV space; velocity in px/ms (y down), as it's stamped.
    const pointer = new THREE.Vector2(-1, -1);
    const velocity = new THREE.Vector2();
    let moved = false;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let lastActive = 0;
    let lastFrame = 0;
    let frame = 0;
    let reported = false;

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        lastTime = 0;
        return;
      }
      const now = performance.now();
      pointer.set((e.clientX - rect.left) / rect.width, 1 - (e.clientY - rect.top) / rect.height);
      if (!lastTime) {
        lastTime = now;
        lastX = e.clientX;
        lastY = e.clientY;
      }
      const dt = Math.max(14, now - lastTime);
      velocity.set((e.clientX - lastX) / dt, (e.clientY - lastY) / dt);
      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = now;
      moved = true;
      wake();
    };

    const fit = () => {
      const aspect = container.clientWidth / container.clientHeight;
      flowUniforms.uAspect.value = aspect / EFFECT.referenceAspect;
      imageUniforms.uScale.value.set(EFFECT.referenceAspect / aspect, 1);
    };
    const onResize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      fit();
      wake();
    };

    const render = (time: number) => {
      frame = 0;
      // Fade per elapsed time rather than per frame, so the trail is as long on 120 Hz screens as on 60 Hz.
      const elapsed = lastFrame ? Math.min(time - lastFrame, 100) : 1000 / 60;
      lastFrame = time;
      flowUniforms.uDissipation.value = Math.pow(EFFECT.dissipation, elapsed / (1000 / 60));
      // No pointer event since the last frame: stop stamping and let the trail fade out.
      if (!moved) {
        pointer.set(-1, -1);
        velocity.set(0, 0);
      }
      moved = false;
      const speed = velocity.length();
      flowUniforms.uVelocity.value.lerp(velocity, speed > 0 ? 0.15 : 0.1);
      flowUniforms.uMouse.value.copy(pointer);

      flowUniforms.uPrevious.value = read.texture;
      renderer.setRenderTarget(write);
      renderer.render(flowScene, camera);
      renderer.setRenderTarget(null);
      imageUniforms.uFlow.value = write.texture;
      renderer.render(imageScene, camera);
      [read, write] = [write, read];

      if (loaded && !reported) {
        reported = true;
        onReady?.();
      }
      const now = performance.now();
      if (speed > 0.001) lastActive = now;
      if (!loaded || now - lastActive < EFFECT.idleMs) frame = requestAnimationFrame(render);
      else lastFrame = 0;
    };

    // Frames only run while there's something to draw: after load, and while the trail is alive.
    function wake() {
      lastActive = performance.now();
      if (!frame) frame = requestAnimationFrame(render);
    }

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('resize', onResize);
    fit();
    wake();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      container.removeChild(renderer.domElement);
      geometry.dispose();
      flowMaterial.dispose();
      imageMaterial.dispose();
      read.dispose();
      write.dispose();
      texture.dispose();
      renderer.dispose();
    };
    // onReady is only read once, when the first frame lands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return <div ref={containerRef} className={styles.portrait} role="img" aria-label={alt} />;
}
