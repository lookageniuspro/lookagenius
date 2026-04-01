/**
 * app.js - Restoration of 3D Network & Typewriter Engines
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. AOS Init
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 700, once: true, offset: 60 });
    }

    // 2. Custom Cursor Logic
    const dot = document.querySelector('[data-cursor-dot]');
    const outline = document.querySelector('[data-cursor-outline]');
    const triggers = document.querySelectorAll('a, button, .hover-trigger');
    
    window.addEventListener('mousemove', (e) => {
        if(dot) { dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px'; }
        if(outline) { outline.animate({ left: e.clientX + 'px', top: e.clientY + 'px' }, { duration: 500, fill: "forwards" }); }
    });

    triggers.forEach(el => {
        el.addEventListener('mouseenter', () => outline && outline.classList.add('hovered'));
        el.addEventListener('mouseleave', () => outline && outline.classList.remove('hovered'));
    });

    // 3. Three.js Network Background (Restored)
    if (document.getElementById('canvas-container')) initNetworkBackground();

    // 4. Typewriter Effects (Restored Engines)
    setupTypewriter('typewriter', ["التعليم هو جواز السفر للمستقبل 🌍", "استثمر في نفسك اليوم 🚀", "طريقك للجامعات العالمية 🏆", "منح دراسية وإرشاد أكاديمي 🌟"], 2500, 35, 15);
    setupTypewriter('quotes-typewriter', ["تعلم الإنجليزية بطلاقة 📚", "احصل على شهادة معتمدة في البرمجة 💻", "اكتشف أسرار الفيزياء 🌌", "منح دراسية تنتظرك 🎓", "تطوير مهاراتك بلا حدود 🔥"], 2200, 30, 15);
    
    // Card Typewriter
    document.querySelectorAll('.card-typewriter').forEach((el, index) => {
        const quotesStr = el.getAttribute('data-quotes');
        if(!quotesStr) return;
        const quotes = JSON.parse(quotesStr);
        setupCardTypewriter(el, quotes, index);
    });
});

/**
 * Three.js Network Background (Cyan & Violet)
 */
function initNetworkBackground() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 24);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const particlesCount = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) positions[i] = (Math.random() - 0.5) * 42;
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({ color: 0x00D4FF, size: 0.2, transparent: true, opacity: 0.7 });
    const pointsMesh = new THREE.Points(geometry, particleMaterial);
    scene.add(pointsMesh);

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xA855F7, transparent: true, opacity: 0.2 });
    const linesGeometry = new THREE.BufferGeometry();
    let lineSegments = new THREE.LineSegments(linesGeometry, lineMaterial);
    scene.add(lineSegments);

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    });

    const clock = new THREE.Clock();

    function updateLines() {
        const posAttr = pointsMesh.geometry.attributes.position.array;
        const worldPos = [];
        const vec = new THREE.Vector3();
        for (let i = 0; i < particlesCount; i++) {
            vec.set(posAttr[i*3], posAttr[i*3+1], posAttr[i*3+2]);
            vec.applyMatrix4(pointsMesh.matrixWorld);
            worldPos.push(vec.clone());
        }
        const linePositions = [];
        for (let i = 0; i < particlesCount; i++) {
            for (let j = i+1; j < particlesCount; j++) {
                if (worldPos[i].distanceTo(worldPos[j]) < 5.8) {
                    linePositions.push(posAttr[i*3], posAttr[i*3+1], posAttr[i*3+2], posAttr[j*3], posAttr[j*3+1], posAttr[j*3+2]);
                }
            }
        }
        lineSegments.geometry.dispose();
        const newGeo = new THREE.BufferGeometry();
        newGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
        lineSegments.geometry = newGeo;
    }

    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();
        pointsMesh.rotation.y = time * 0.05;
        pointsMesh.rotation.x = Math.sin(time * 0.2) * 0.1;
        pointsMesh.rotation.x += mouseY * 0.15;
        pointsMesh.rotation.y += mouseX * 0.15;
        lineSegments.rotation.copy(pointsMesh.rotation);
        updateLines();
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

/**
 * Typewriter Engine (Restored)
 */
function setupTypewriter(elementId, phrases, pauseTime, typeSpeedBase, delSpeedBase) {
    const el = document.getElementById(elementId);
    if (!el) return;
    let i = 0, j = 0, current = [], isDeleting = false, isEnd = false;
    
    function loop() {
        const targetEl = document.getElementById(elementId);
        if (!targetEl) return;
        targetEl.innerHTML = current.join('') + '<span class="tw-cursor">|</span>';
        
        if (i < phrases.length) {
            if (!isDeleting && j <= phrases[i].length) { 
                if(phrases[i][j]) current.push(phrases[i][j]); 
                j++; 
            }
            if (isDeleting && j > 0) { 
                current.pop(); 
                j--; 
            }
            
            if (j === phrases[i].length + 1) { 
                isEnd = true; 
                isDeleting = true; 
            }
            if (isDeleting && j === 0) { 
                current = []; 
                isDeleting = false; 
                i++; 
                if (i === phrases.length) i = 0; 
            }
        }
        
        let speed = isDeleting ? delSpeedBase + Math.random() * 10 : typeSpeedBase + Math.random() * 25;
        if (isEnd) { speed = pauseTime; isEnd = false; }
        setTimeout(loop, speed);
    }
    setTimeout(loop, 500);
}

function setupCardTypewriter(el, quotes, index) {
    let idx = 0, pos = 0, cur = [], delMode = false, endFlag = false;
    function writeCard(){
        if(!el.isConnected) return;
        el.innerHTML = cur.join('') + '<span class="tw-cursor" style="opacity:0.6;">|</span>';
        if(idx < quotes.length){
            if(!delMode && pos <= quotes[idx].length) { 
                if(quotes[idx][pos]) cur.push(quotes[idx][pos]); 
                pos++; 
            }
            if(delMode && pos > 0) { 
                cur.pop(); 
                pos--; 
            }
            if(pos === quotes[idx].length + 1) { 
                endFlag = true; 
                delMode = true; 
            }
            if(delMode && pos === 0) { 
                cur = []; 
                delMode = false; 
                idx++; 
                if(idx === quotes.length) idx = 0; 
            }
        }
        let speed = delMode ? 15 + Math.random() * 8 : 25 + Math.random() * 20;
        if (endFlag) { speed = 2500; endFlag = false; }
        setTimeout(writeCard, speed);
    }
    setTimeout(writeCard, Math.random() * 1000 + (index * 150));
}
