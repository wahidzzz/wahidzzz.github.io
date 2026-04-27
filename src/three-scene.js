import * as THREE from 'three';

export function initThreeScene() {
  // Cleanup existing renderer if any
  if (window._threeRenderer) {
    window._threeRenderer.dispose();
    const gl = window._threeRenderer.getContext();
    if (gl) gl.getExtension('WEBGL_lose_context')?.loseContext();
  }

  let canvas = document.getElementById('three-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'three-canvas';
    document.body.prepend(canvas);
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    window._threeRenderer = renderer;
  } catch (e) {
    console.error("WebGL context creation failed:", e);
    canvas.style.display = 'none';
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 10);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  // Small Floating Elements
  const geometries = [
    new THREE.BoxGeometry(1.2, 1.2, 1.2), // Architecture / Server Block
    new THREE.CylinderGeometry(0.8, 0.8, 1.5, 16), // Database
    new THREE.DodecahedronGeometry(1, 0) // Complex Node / Agent
  ];

  const material = new THREE.MeshBasicMaterial({
    color: 0xff2d55,
    wireframe: true,
    transparent: true,
    opacity: 0.04
  });

  const shapes = [];
  const numShapes = 6; // Scatter 6 subtle shapes across the scroll height

  for (let i = 0; i < numShapes; i++) {
    const geo = geometries[Math.floor(Math.random() * geometries.length)];
    const mesh = new THREE.Mesh(geo, material);

    // Randomize position. Push them to the edges mostly so they don't block text.
    const x = (Math.random() - 0.5) * 20; // -10 to 10
    // Keep them away from the center X axis
    if (x > -3 && x < 3) {
      mesh.position.x = x > 0 ? x + 3 : x - 3;
    } else {
      mesh.position.x = x;
    }

    // Spread them across a large Y range to cover scrolling
    // Let's assume the page is roughly 5-6 viewports tall. 
    mesh.position.y = 5 - Math.random() * 40; 
    
    mesh.position.z = (Math.random() - 0.5) * 5; // -2.5 to 2.5

    // Random rotation speed
    mesh.userData = {
      rx: (Math.random() - 0.5) * 0.02,
      ry: (Math.random() - 0.5) * 0.02,
      rz: (Math.random() - 0.5) * 0.02,
      floatSpeed: Math.random() * 0.02 + 0.01,
      initialY: mesh.position.y
    };

    scene.add(mesh);
    shapes.push(mesh);
  }

  // --- MOUSE & SCROLL ---
  const mouse = { x: 0, y: 0 };
  const targetMouse = { x: 0, y: 0 };
  let scrollY = 0;

  document.addEventListener('mousemove', (e) => {
    targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('scroll', () => {
    // Map scroll percentage to camera Y position
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    scrollY = window.scrollY / maxScroll;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    mouse.x += (targetMouse.x - mouse.x) * 0.05;
    mouse.y += (targetMouse.y - mouse.y) * 0.05;

    // Rotate and float shapes
    shapes.forEach(shape => {
      shape.rotation.x += shape.userData.rx;
      shape.rotation.y += shape.userData.ry;
      shape.rotation.z += shape.userData.rz;
      // Gentle floating up and down
      shape.position.y = shape.userData.initialY + Math.sin(time + shape.userData.rx * 100) * 0.5;
    });

    // Move camera down based on scroll
    // The shapes are spread from Y=5 to Y=-35. Camera starts at 0, moves down to roughly -40.
    camera.position.y = -scrollY * 40 + mouse.y * 0.5;
    camera.position.x = mouse.x * 0.5;

    renderer.render(scene, camera);
  }

  animate();
}
