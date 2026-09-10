import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { isReducedMotionPreferred, isWebGLSupported, isMobileOrTouch } from '../utils/motion';

interface CoutureHero3DProps {
  scrollProgress?: number;
}

export const CoutureHero3D: React.FC<CoutureHero3DProps> = ({ scrollProgress = 0 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    // Check WebGL and Reduced Motion
    if (!isWebGLSupported()) {
      setHasWebGL(false);
      return;
    }

    if (isReducedMotionPreferred()) {
      setIsReducedMotion(true);
    }

    const container = containerRef.current;
    if (!container) return;

    let isDisposed = false;
    let animationFrameId: number;
    let isVisible = true;

    // Dimensions
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 650;
    const isMobile = isMobileOrTouch();

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x141210, 0.045);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 8.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });

    const pixelRatio = Math.min(window.devicePixelRatio || 1, isMobile ? 1.2 : 1.75);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = false; // Keep lightweight
    container.appendChild(renderer.domElement);

    // -------------------------------------------------------------
    // 1. LIGHTING (Haute Couture Atelier Lighting Setup)
    // -------------------------------------------------------------
    // Ambient fill
    const ambientLight = new THREE.AmbientLight(0x2d2621, 0.9);
    scene.add(ambientLight);

    // Main Studio Key Light (Warm editorial daylight)
    const keyLight = new THREE.DirectionalLight(0xfff3e0, 2.2);
    keyLight.position.set(-4, 6, 5);
    scene.add(keyLight);

    // Royal Zardozi Gold Rim Light (Accents the crests of fabric folds)
    const rimLight = new THREE.DirectionalLight(0xd4af37, 2.8);
    rimLight.position.set(5, -2, -1);
    scene.add(rimLight);

    // Interactive Pointer Light (Warm champagne highlight following mouse)
    const interactiveLight = new THREE.PointLight(0xf8e3b6, 2.0, 15, 1.2);
    interactiveLight.position.set(0, 0, 4);
    scene.add(interactiveLight);

    // -------------------------------------------------------------
    // 2. FLOWING ROYAL SILK DRAPE GEOMETRY & PHYSICAL MATERIAL
    // -------------------------------------------------------------
    const gridRes = isMobile ? 36 : 64;
    const silkGeometry = new THREE.PlaneGeometry(9.5, 7.5, gridRes, gridRes);

    // Store base vertices to calculate procedural cloth waves
    const posAttr = silkGeometry.attributes.position;
    const basePositions = new Float32Array(posAttr.array);

    // Custom Physical Material for Heavy Pakistani Raw Silk / Brocade
    const silkMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x191614), // Deep espresso-twilight base
      metalness: 0.35,
      roughness: 0.42,
      clearcoat: 0.4,
      clearcoatRoughness: 0.3,
      sheen: 0.9,
      sheenColor: new THREE.Color(0xd4af37), // Subtle golden silk micro-sheen
      sheenRoughness: 0.35,
      side: THREE.DoubleSide,
    });

    const silkMesh = new THREE.Mesh(silkGeometry, silkMaterial);
    silkMesh.position.set(0.8, -0.2, 0);
    silkMesh.rotation.set(-0.25, 0.15, -0.12);
    scene.add(silkMesh);

    // -------------------------------------------------------------
    // 3. EMBROIDERED METALLIC TILLA ACCENTS (Zardozi Ribbon Wave)
    // -------------------------------------------------------------
    // Creates undulating metallic zardozi threads weaving along the drape
    const ribbonCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.5, -2.5, 0.5),
      new THREE.Vector3(-2.2, -0.8, 1.0),
      new THREE.Vector3(0.0, 0.5, 0.6),
      new THREE.Vector3(2.5, -0.2, 1.2),
      new THREE.Vector3(4.8, 1.5, 0.4),
    ]);

    const ribbonGeometry = new THREE.TubeGeometry(ribbonCurve, isMobile ? 32 : 64, 0.045, 8, false);
    const zardoziGoldMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xd4af37), // Restrained antique gold
      metalness: 0.88,
      roughness: 0.26,
      emissive: new THREE.Color(0x281f08),
      emissiveIntensity: 0.4,
    });

    const ribbonMesh = new THREE.Mesh(ribbonGeometry, zardoziGoldMaterial);
    silkMesh.add(ribbonMesh);

    // Second complementary subtle thread
    const ribbonCurve2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.8, 1.8, 0.2),
      new THREE.Vector3(-1.2, 1.2, 0.8),
      new THREE.Vector3(1.2, -1.2, 0.9),
      new THREE.Vector3(3.6, -1.8, 0.3),
    ]);
    const ribbonGeometry2 = new THREE.TubeGeometry(ribbonCurve2, isMobile ? 24 : 48, 0.03, 6, false);
    const ribbonMesh2 = new THREE.Mesh(ribbonGeometry2, zardoziGoldMaterial);
    silkMesh.add(ribbonMesh2);

    // -------------------------------------------------------------
    // 4. OLD LAHORE ARCHITECTURAL ARCH SILHOUETTE (Mehrab / Cusped Arch)
    // -------------------------------------------------------------
    const archShape = new THREE.Shape();
    // Exterior bounding frame
    archShape.moveTo(-5.5, -4.5);
    archShape.lineTo(-5.5, 4.5);
    archShape.lineTo(5.5, 4.5);
    archShape.lineTo(5.5, -4.5);
    archShape.closePath();

    // Interior Mughal Cusped Arch cutout (Hole)
    const archHole = new THREE.Path();
    archHole.moveTo(-3.2, -4.5);
    archHole.lineTo(-3.2, 0.5);
    // Left cusp
    archHole.quadraticCurveTo(-3.2, 2.0, -1.8, 2.6);
    // Center pinnacle apex (typical of Badshahi / Wazir Khan architecture)
    archHole.quadraticCurveTo(-0.8, 3.2, 0.0, 3.8);
    archHole.quadraticCurveTo(0.8, 3.2, 1.8, 2.6);
    // Right cusp
    archHole.quadraticCurveTo(3.2, 2.0, 3.2, 0.5);
    archHole.lineTo(3.2, -4.5);
    archHole.closePath();
    archShape.holes.push(archHole);

    const archExtrudeSettings = {
      depth: 0.35,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    };

    const archGeometry = new THREE.ExtrudeGeometry(archShape, archExtrudeSettings);
    const archMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x13110f), // Deep antique charcoal sandstone
      metalness: 0.2,
      roughness: 0.75,
    });

    const archMesh = new THREE.Mesh(archGeometry, archMaterial);
    archMesh.position.set(0, 0, -1.5);
    archMesh.scale.set(1.15, 1.15, 1.15);
    scene.add(archMesh);

    // -------------------------------------------------------------
    // 5. INTERACTION & CINEMATIC MOTION STATE
    // -------------------------------------------------------------
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const rect = container.getBoundingClientRect();
      const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);

      mouse.targetX = THREE.MathUtils.clamp(normX, -1, 1);
      mouse.targetY = THREE.MathUtils.clamp(normY, -1, 1);
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    // Intersection Observer to stop render loop when not in view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Resize Handler
    const handleResize = () => {
      if (!container || isDisposed) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || 650;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    setIsLoaded(true);

    // -------------------------------------------------------------
    // 6. RENDER LOOP (Physics-damped slow regal fabric undulating)
    // -------------------------------------------------------------
    let clock = new THREE.Clock();

    const animate = () => {
      if (isDisposed) return;
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse interpolation (LERP with damping)
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      // 1. Gentle camera parallax (restrained, never rotating aggressively)
      const baseCamX = mouse.x * 0.35;
      const baseCamY = 0.2 + mouse.y * 0.25;
      const scrollCamZ = 8.5 + scrollProgress * 1.5;
      camera.position.x += (baseCamX - camera.position.x) * 0.05;
      camera.position.y += (baseCamY - camera.position.y) * 0.05;
      camera.position.z += (scrollCamZ - camera.position.z) * 0.08;
      camera.lookAt(0.3, 0, 0);

      // 2. Interactive light position
      interactiveLight.position.x = mouse.x * 3.5;
      interactiveLight.position.y = mouse.y * 2.5 + 0.5;
      interactiveLight.position.z = 2.5 + Math.sin(elapsedTime * 0.8) * 0.3;

      // 3. Procedural Silk Drape Deformation
      // Slow, heavy raw silk wave computation
      const speed = isReducedMotion ? 0 : 0.65;
      const t = elapsedTime * speed;
      const positions = silkGeometry.attributes.position.array as Float32Array;

      for (let i = 0; i < posAttr.count; i++) {
        const u = basePositions[i * 3];
        const v = basePositions[i * 3 + 1];

        // Complex physical wave interference simulating cloth folds & drape
        const wave1 = Math.sin(u * 0.45 + t * 0.8) * 0.42;
        const wave2 = Math.cos(v * 0.6 + t * 0.6) * 0.35;
        const diagonalHarmonic = Math.sin((u + v) * 0.3 + t * 0.4) * 0.25;
        const microFold = Math.cos(u * 1.2 - v * 0.8 + t * 0.5) * 0.12;

        positions[i * 3 + 2] = wave1 + wave2 + diagonalHarmonic + microFold;
      }
      silkGeometry.attributes.position.needsUpdate = true;
      silkGeometry.computeVertexNormals();

      // Subtle mesh tilt responding gently to mouse
      const targetMeshRotX = -0.25 + mouse.y * 0.04;
      const targetMeshRotY = 0.15 + mouse.x * 0.06;
      silkMesh.rotation.x += (targetMeshRotX - silkMesh.rotation.x) * 0.03;
      silkMesh.rotation.y += (targetMeshRotY - silkMesh.rotation.y) * 0.03;

      // Subtle architectural arch parallax depth
      archMesh.position.x = -mouse.x * 0.15;
      archMesh.position.y = -mouse.y * 0.12;

      renderer.render(scene, camera);
    };

    animate();

    // -------------------------------------------------------------
    // 7. DISPOSAL & CLEANUP
    // -------------------------------------------------------------
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('resize', handleResize);

      // Clean Three.js memory
      silkGeometry.dispose();
      silkMaterial.dispose();
      ribbonGeometry.dispose();
      ribbonGeometry2.dispose();
      zardoziGoldMaterial.dispose();
      archGeometry.dispose();
      archMaterial.dispose();
      renderer.dispose();

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [scrollProgress]);

  // Fallback for non-WebGL devices or static preference
  if (!hasWebGL) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-gradient-to-r from-[#1c1917] via-[#241f1c] to-[#161311]">
        <div
          className="absolute inset-0 opacity-45 mix-blend-luminosity bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=2000&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917] via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
};
