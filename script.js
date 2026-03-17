/**
 * Organic Oasis Wayfinding Logic
 * Handles interactive map, sidebar navigation, and route drawing.
 */

const storesData = [
    { id: "1", name: "Vans", category: "apparel", coords: { x: 225, y: 100 }, desc: "Action sports footwear, clothing and accessories." },
    { id: "2", name: "Sunglass Hut", category: "apparel", coords: { x: 400, y: 100 }, desc: "The premier shopping and inspiration destination for top brands, latest trends and exclusive styles of high quality fashion and performance sunglasses." },
    { id: "3", name: "Francesca's", category: "apparel", coords: { x: 600, y: 100 }, desc: "Offers an eclectic mix of carefully-curated clothing, bright baubles, bold accessories, and playful gifts." },
    { id: "4", name: "Food Court", category: "dining", coords: { x: 775, y: 100 }, desc: "A variety of quick-service dining options to fuel your shopping." },
    { id: "5", name: "Helzberg Diamonds", category: "jewelry", coords: { x: 275, y: 700 }, desc: "A wide selection of fine jewelry, including diamond engagement rings and wedding bands, watches, and more." },
    { id: "6", name: "Brighton", category: "jewelry", coords: { x: 475, y: 700 }, desc: "Accessories, jewelry, and leather goods designed with a signature whimsical style." },
    { id: "7", name: "Imagination Playground", category: "all", coords: { x: 700, y: 700 }, desc: "A creative, safe play space for children featuring loose parts to build, create, and explore." },
    { id: "8", name: "Wood Art", category: "all", coords: { x: 100, y: 275 }, desc: "Custom wooden crafts, decor, and artisanal pieces inspired by nature." },
    { id: "9", name: "Restrooms", category: "all", coords: { x: 900, y: 525 }, desc: "Public restrooms and family facilities located near the central corridor." }
];

// Fixed "You Are Here" position based on map layout
const youAreHere = { x: 500, y: 600 };

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const storeListEl = document.getElementById('storeList');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const catBtns = document.querySelectorAll('.cat-btn');

    const storeDetailsEl = document.getElementById('storeDetails');
    const backBtn = document.getElementById('backBtn');
    const routeBtn = document.getElementById('routeBtn');

    const pathLayer = document.getElementById('pathLayer');
    const mapStores = document.querySelectorAll('.store');
    const mapWrapper = document.getElementById('mapWrapper');

    // Initial Render
    renderStoreList();

    // 1. Sidebar Rendering & Filtering
    function renderStoreList(filterText = '', category = 'all') {
        storeListEl.innerHTML = '';

        const filtered = storesData.filter(store => {
            const matchSearch = store.name.toLowerCase().includes(filterText.toLowerCase());
            const matchCat = category === 'all' || store.category === category;
            return matchSearch && matchCat;
        });

        if (filtered.length === 0) {
            storeListEl.innerHTML = '<p style="padding: 20px; color: #fff;">No locations found.</p>';
            return;
        }

        filtered.forEach(store => {
            const el = document.createElement('div');
            el.className = 'store-item';

            // Format category name for display
            const catDisplay = store.category.charAt(0).toUpperCase() + store.category.slice(1);

            el.innerHTML = `
                <h3>${store.name}</h3>
                <p>${catDisplay}</p>
            `;

            // Interaction
            el.addEventListener('click', () => selectStore(store.id));
            storeListEl.appendChild(el);
        });
    }

    // 2. Event Listeners for Filtering
    searchInput.addEventListener('input', (e) => {
        const activeCat = document.querySelector('.cat-btn.active')?.dataset.cat || 'all';
        renderStoreList(e.target.value, activeCat);
    });

    catBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active state
            catBtns.forEach(b => b.classList.remove('active'));
            const targetBtn = e.target;
            targetBtn.classList.add('active');

            // Re-render
            renderStoreList(searchInput.value, targetBtn.dataset.cat);
        });
    });

    // 3. Selection Logic
    function selectStore(id) {
        const store = storesData.find(s => s.id === id);
        if (!store) return;

        // UI Updates: Sidebar
        storeListEl.classList.add('hidden');
        storeDetailsEl.classList.remove('hidden');

        document.getElementById('detailName').textContent = store.name;
        document.getElementById('detailCategory').textContent = store.category.charAt(0).toUpperCase() + store.category.slice(1);
        document.getElementById('detailDesc').textContent = store.desc;

        // UI Updates: Map
        clearMapSelection();
        const mapEl = document.getElementById(`store-${id}`);
        if(mapEl) mapEl.classList.add('selected');

        // Prepare Routing Button
        routeBtn.onclick = () => drawRoute(store);
    }

    function clearMapSelection() {
        mapStores.forEach(s => s.classList.remove('selected'));
        pathLayer.innerHTML = ''; // Clear existing routes
    }

    // Back to list
    backBtn.addEventListener('click', () => {
        storeListEl.classList.remove('hidden');
        storeDetailsEl.classList.add('hidden');
        clearMapSelection();
        // Reset zoom optionally
        resetZoom();
    });

    // Map Interactivity
    mapStores.forEach(mapStoreGroup => {
        mapStoreGroup.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            selectStore(id);
        });
    });

    // 4. Wayfinding / Routing Logic
    function drawRoute(store) {
        pathLayer.innerHTML = ''; // Clear previous

        const startX = youAreHere.x;
        const startY = youAreHere.y;
        const endX = store.coords.x;
        const endY = store.coords.y;

        // Calculate a control point to make a nice curve.
        // We want paths to generally route through the center (the 'Oasis')
        const cx = 500;
        const cy = 400; // Center of the mall

        // Create the Path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = `M ${startX} ${startY} Q ${cx} ${cy} ${endX} ${endY}`;

        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#FFC107'); // Bright amber/yellow
        path.setAttribute('stroke-width', '12');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('class', 'route-path');

        // Target Dot
        const targetDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        targetDot.setAttribute('cx', endX);
        targetDot.setAttribute('cy', endY);
        targetDot.setAttribute('r', '15');
        targetDot.setAttribute('fill', '#f44336'); // Red accent
        targetDot.setAttribute('stroke', '#fff');
        targetDot.setAttribute('stroke-width', '4');
        targetDot.setAttribute('class', 'route-dot');

        // Pulsing animation for the target dot
        const animateRadius = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animateRadius.setAttribute('attributeName', 'r');
        animateRadius.setAttribute('values', '15; 25; 15');
        animateRadius.setAttribute('dur', '1.5s');
        animateRadius.setAttribute('repeatCount', 'indefinite');

        targetDot.appendChild(animateRadius);

        // Animated walking dots along the path
        const walker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        walker.setAttribute('r', '8');
        walker.setAttribute('fill', '#ffffff');
        walker.setAttribute('stroke', '#558b2f');
        walker.setAttribute('stroke-width', '2');
        walker.style.opacity = '0';
        walker.style.animation = 'fadeInDot 0.5s 1s ease forwards';

        const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
        animateMotion.setAttribute('dur', '4s');
        animateMotion.setAttribute('repeatCount', 'indefinite');
        animateMotion.setAttribute('path', d);

        walker.appendChild(animateMotion);

        // Append to layer
        pathLayer.appendChild(path);
        pathLayer.appendChild(targetDot);
        pathLayer.appendChild(walker);

        // Optional: slight zoom to focus on route
        zoomToRoute(startX, startY, endX, endY);
    }

    // 5. Map Zoom & Pan Controls
    let currentScale = 1;
    // Base transform for the isometric view
    const baseTransform = "perspective(1200px) rotateX(45deg) rotateZ(-25deg)";

    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const resetMapBtn = document.getElementById('resetMap');

    function updateTransform() {
        mapWrapper.style.transform = `${baseTransform} scale(${currentScale})`;
    }

    function resetZoom() {
        currentScale = 1;
        updateTransform();
    }

    zoomInBtn.addEventListener('click', () => {
        if(currentScale < 1.8) {
            currentScale += 0.2;
            updateTransform();
        }
    });

    zoomOutBtn.addEventListener('click', () => {
        if(currentScale > 0.6) {
            currentScale -= 0.2;
            updateTransform();
        }
    });

    resetMapBtn.addEventListener('click', () => {
        resetZoom();
        // Clear selection if viewing details
        if (!storeDetailsEl.classList.contains('hidden')) {
            backBtn.click();
        }
    });

    // Optional: Auto zoom slightly to show full path
    function zoomToRoute(sx, sy, ex, ey) {
        // Just a simple visual bump to indicate action
        currentScale = 1.1;
        updateTransform();
    }

    // Auto-focus search on load for kiosk testing
    // searchInput.focus();
});