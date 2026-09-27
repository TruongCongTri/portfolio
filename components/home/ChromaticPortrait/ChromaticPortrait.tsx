'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import styles from './ChromaticPortrait.module.css';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
`;

/** Tuning for the cursor effect — raise/lower these to make it stronger/subtler. */
const EFFECT = {
  /** Reach of the effect around the cursor (0–1 of the portrait's height). */
  radius: 0.5,
  /** Lens bulge pushing the image away from the cursor. */
  bulge: 0.05,
  /** Resting RGB split, even when the cursor is still. */
  split: 0.025,
  /** Extra RGB split per unit of pointer speed. */
  speedSplit: 2.6,
  /** How far the image is dragged along the direction of travel. */
  drag: 0.6,
  /** Cap on pointer speed so fast flicks can't tear the image apart. */
  maxSpeed: 0.06,
};

// RGB channels are sampled at offsets that grow near the cursor and with pointer speed, the image
// bulges away from the cursor and is dragged along its path, plus animated film grain.
const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform vec2 uVelocity;
  uniform float uHover;
  uniform float uTime;
  uniform float uAspect;
  uniform float uRadius;
  uniform float uBulge;
  uniform float uSplit;
  uniform float uSpeedSplit;
  uniform float uDrag;
  varying vec2 vUv;

  // Luminance: the portrait renders in greyscale, while the offset R/G/B samples still fringe in colour.
  float luma(vec4 c) {
    return dot(c.rgb, vec3(0.299, 0.587, 0.114));
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 uv = vUv;
    vec2 delta = uv - uMouse;
    delta.x *= uAspect;
    float dist = length(delta);
    float falloff = smoothstep(uRadius, 0.0, dist) * uHover;

    vec2 dir = dist > 0.0001 ? normalize(delta) : vec2(0.0);
    uv -= dir * falloff * uBulge;
    uv -= uVelocity * falloff * uDrag;

    vec2 shift = (uVelocity * uSpeedSplit + dir * uSplit) * falloff;
    vec4 r = texture2D(uTexture, uv + shift);
    vec4 g = texture2D(uTexture, uv);
    vec4 b = texture2D(uTexture, uv - shift);

    float alpha = max(max(r.a, g.a), b.a);
    vec3 color = vec3(luma(r), luma(g), luma(b));
    color += (hash(vUv * 900.0 + uTime) - 0.5) * 0.06 * alpha;

    gl_FragColor = vec4(color, alpha);
  }
`;

type ChromaticPortraitProps = {
  src: string;
  alt: string;
  /** Called once the texture has loaded and the first frame is on screen. */
  onReady?: () => void;
};

/**
 * Greyscale cut-out portrait with a chromatic-aberration distortion that follows the cursor.
 * Fills its parent, which sets the size (and must match the image's aspect ratio).
 */
export default function ChromaticPortrait({ src, alt, onReady }: ChromaticPortraitProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Left in NoColorSpace: this ShaderMaterial outputs sampled values as-is, so no decode/encode round trip.
    let loaded = false;
    let reported = false;
    const texture = new THREE.TextureLoader().load(src, () => (loaded = true));
    texture.minFilter = THREE.LinearFilter;

    const uniforms = {
      uTexture: { value: texture },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uVelocity: { value: new THREE.Vector2() },
      uHover: { value: 0 },
      uTime: { value: 0 },
      uAspect: { value: container.clientWidth / container.clientHeight },
      uRadius: { value: EFFECT.radius },
      uBulge: { value: EFFECT.bulge },
      uSplit: { value: EFFECT.split },
      uSpeedSplit: { value: EFFECT.speedSplit },
      uDrag: { value: EFFECT.drag },
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true });
    scene.add(new THREE.Mesh(geometry, material));

    const target = new THREE.Vector2(0.5, 0.5);
    const previous = new THREE.Vector2(0.5, 0.5);
    let hoverTarget = 0;

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      target.set((e.clientX - rect.left) / rect.width, 1 - (e.clientY - rect.top) / rect.height);
      const inside = target.x >= 0 && target.x <= 1 && target.y >= 0 && target.y <= 1;
      hoverTarget = inside ? 1 : 0;
    };
    const onResize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      uniforms.uAspect.value = container.clientWidth / container.clientHeight;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('resize', onResize);

    let frame = 0;
    const animate = (time: number) => {
      const mouse = uniforms.uMouse.value;
      mouse.lerp(target, 0.12);
      // Velocity = how far the smoothed pointer moved this frame (capped), eased back toward zero.
      const step = mouse.clone().sub(previous).multiplyScalar(5).clampLength(0, EFFECT.maxSpeed);
      uniforms.uVelocity.value.lerp(step, 0.2);
      previous.copy(mouse);
      uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * 0.08;
      uniforms.uTime.value = time * 0.001;
      renderer.render(scene, camera);
      if (loaded && !reported) {
        reported = true;
        onReady?.();
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      container.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
    // onReady is only read once, when the first frame lands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return <div ref={containerRef} className={styles.portrait} role="img" aria-label={alt} />;
}
