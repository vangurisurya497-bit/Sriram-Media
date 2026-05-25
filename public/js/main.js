// Sriram Media Main Application Logic

let scene, camera, renderer, particleSystem;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let scrollPercent = 0;

// Initialize Three.js 3D Particles
function initThree() {
  const container = document.getElementById('three-container');
  if (!container) return;

  scene = new THREE.Scene();
  
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 240;

  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];

  const numX = 55;
  const numZ = 55;
  const separation = 16;

  for (let i = 0; i < numX; i++) {
    for (let j = 0; j < numZ; j++) {
      const x = (i * separation) - ((numX * separation) / 2);
      const z = (j * separation) - ((numZ * separation) / 2);
      const y = (Math.sin((i / numX) * Math.PI * 4) * 40) + (Math.cos((j / numZ) * Math.PI * 4) * 40);

      positions.push(x, y, z);

      // Gradient color matching #FF4D00 theme
      // Mix vibrant orange (1.0, 0.3, 0.0) with subtle deeper fire tones
      const r = 1.0;
      const g = 0.25 + (Math.sin(i / numX) * 0.12) + (Math.cos(j / numZ) * 0.08);
      const b = 0.0;
      colors.push(r, g, b);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  // Custom circular particle look
  const material = new THREE.PointsMaterial({
    size: 4.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  document.addEventListener('mousemove', onDocumentMouseMove);
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('scroll', onWindowScroll);

  animate();
}

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) * 0.15;
  mouseY = (event.clientY - windowHalfY) * 0.15;
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onWindowScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollPercent = docHeight > 0 ? (scrollTop / docHeight) : 0;
}

function animate() {
  requestAnimationFrame(animate);

  // Smooth mouse linear interpolation (lerp)
  targetX += (mouseX - targetX) * 0.04;
  targetY += (mouseY - targetY) * 0.04;

  particleSystem.rotation.y = targetX * 0.0018 + Date.now() * 0.00008;
  particleSystem.rotation.x = targetY * 0.0015;
  
  // Parallax scrolling vertical shifts
  particleSystem.position.y = -scrollPercent * 130;

  // Wave ripple math simulation
  const positions = particleSystem.geometry.attributes.position.array;
  let index = 0;
  const time = Date.now() * 0.0008;

  const numX = 55;
  const numZ = 55;

  for (let i = 0; i < numX; i++) {
    for (let j = 0; j < numZ; j++) {
      const yIndex = index * 3 + 1;
      // Combine double wave calculations for gravity-defying dynamics
      positions[yIndex] = (Math.sin((i / numX) * Math.PI * 4.5 + time) * 32) + 
                          (Math.cos((j / numZ) * Math.PI * 3.5 + time) * 32);
      index++;
    }
  }
  
  particleSystem.geometry.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
}

// Navigation & Hamburger Menu
function initNavigation() {
  const header = document.querySelector('header');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');
  const navLinks = document.querySelectorAll('nav a');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Dynamic Navigation Highlighting
    let current = '';
    const sections = document.querySelectorAll('section');
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollPosition >= (sectionTop - 180)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('open');
    nav.classList.toggle('open');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('open');
      nav.classList.remove('open');
    });
  });
}

// Stats counter animation when scrolled into viewport
function initStatsCounter() {
  const stats = document.querySelectorAll('.stat-number');
  const statsSection = document.getElementById('about');
  let counted = false;

  const countUp = () => {
    stats.forEach(stat => {
      const target = +stat.getAttribute('data-target');
      const suffix = stat.getAttribute('data-suffix') || '';
      let count = 0;
      const duration = 1500; // milliseconds
      const frames = 60;
      const increment = target / (duration / (1000 / frames));

      const updateCount = () => {
        count += increment;
        if (count < target) {
          stat.innerText = Math.floor(count) + suffix;
          setTimeout(updateCount, 1000 / frames);
        } else {
          stat.innerText = target + suffix;
        }
      };
      updateCount();
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counted) {
        countUp();
        counted = true;
      }
    });
  }, { threshold: 0.25 });

  if (statsSection) observer.observe(statsSection);
}

// Portfolio Grid filter and lightbox module
function initPortfolio() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('img');
  const lightboxClose = lightbox.querySelector('.lightbox-close');
  const lightboxTitle = lightbox.querySelector('.lightbox-caption h4');
  const lightboxCategory = lightbox.querySelector('.lightbox-caption p');
  const prevBtn = lightbox.querySelector('.lightbox-arrow.prev');
  const nextBtn = lightbox.querySelector('.lightbox-arrow.next');

  let currentItemIndex = 0;
  let activeFilteredItems = [];

  // Filter click actions
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      portfolioItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filterValue === 'all' || itemCategory === filterValue) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
      
      updateFilteredList();
    });
  });

  const updateFilteredList = () => {
    activeFilteredItems = Array.from(portfolioItems).filter(item => item.style.display !== 'none');
  };
  
  updateFilteredList();

  // Show Lightbox on item click
  portfolioItems.forEach((item) => {
    item.addEventListener('click', () => {
      updateFilteredList();
      currentItemIndex = activeFilteredItems.indexOf(item);
      openLightbox(item);
    });
  });

  function openLightbox(item) {
    const imgUrl = item.querySelector('img').src;
    const title = item.querySelector('.portfolio-info h4').innerText;
    const category = item.querySelector('.portfolio-info span').innerText;

    lightboxImg.src = imgUrl;
    lightboxTitle.innerText = title;
    lightboxCategory.innerText = category;
    lightbox.classList.add('open');
  }

  lightboxClose.addEventListener('click', () => {
    lightbox.classList.remove('open');
  });

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activeFilteredItems.length === 0) return;
    currentItemIndex = (currentItemIndex - 1 + activeFilteredItems.length) % activeFilteredItems.length;
    openLightbox(activeFilteredItems[currentItemIndex]);
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activeFilteredItems.length === 0) return;
    currentItemIndex = (currentItemIndex + 1) % activeFilteredItems.length;
    openLightbox(activeFilteredItems[currentItemIndex]);
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('open');
    }
  });
}

// Quote Estimator math logic
function initQuoteCalculator() {
  const postsRange = document.getElementById('posts-range');
  const postsVal = document.getElementById('posts-val');
  const reelsRange = document.getElementById('reels-range');
  const reelsVal = document.getElementById('reels-val');
  const toggleCards = document.querySelectorAll('.toggle-card');
  const totalDisplay = document.getElementById('calc-total');
  const breakdownContainer = document.getElementById('calc-breakdown-rows');
  const calcBtn = document.getElementById('calc-submit-btn');

  if (!postsRange || !reelsRange || !totalDisplay) return;

  const RATE_POST = 499;
  const RATE_REEL = 2499;
  const SERVICES_RATES = {
    'logo': 6999,
    'cgi': 9999,
    'web': 14999
  };

  function calculateQuote() {
    const posts = parseInt(postsRange.value);
    const reels = parseInt(reelsRange.value);
    
    postsVal.innerText = posts;
    reelsVal.innerText = reels;

    let total = 0;
    let breakdownHtml = '';

    if (posts > 0) {
      const postsCost = posts * RATE_POST;
      total += postsCost;
      breakdownHtml += `
        <div class="breakdown-row">
          <span>Social Media Creatives (${posts} posts)</span>
          <span>₹${postsCost.toLocaleString('en-IN')}</span>
        </div>
      `;
    }

    if (reels > 0) {
      const reelsCost = reels * RATE_REEL;
      total += reelsCost;
      breakdownHtml += `
        <div class="breakdown-row">
          <span>Reels / Short Video Editing (${reels} reels)</span>
          <span>₹${reelsCost.toLocaleString('en-IN')}</span>
        </div>
      `;
    }

    toggleCards.forEach(card => {
      if (card.classList.contains('selected')) {
        const serviceId = card.getAttribute('data-service');
        const serviceName = card.querySelector('.toggle-title').innerText;
        const rate = SERVICES_RATES[serviceId];
        total += rate;
        breakdownHtml += `
          <div class="breakdown-row">
            <span>${serviceName}</span>
            <span>₹${rate.toLocaleString('en-IN')}</span>
          </div>
        `;
      }
    });

    if (total === 0) {
      totalDisplay.innerText = '₹0';
      breakdownContainer.innerHTML = '<div class="breakdown-row"><span>Select services above to calculate quote</span><span>₹0</span></div>';
      return;
    }

    totalDisplay.innerText = `₹${total.toLocaleString('en-IN')}`;
    breakdownContainer.innerHTML = breakdownHtml;
  }

  postsRange.addEventListener('input', calculateQuote);
  reelsRange.addEventListener('input', calculateQuote);

  toggleCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('selected');
      calculateQuote();
    });
  });

  // Calculate default quote on start
  calculateQuote();

  // Custom WhatsApp request compiler
  calcBtn.addEventListener('click', () => {
    const posts = parseInt(postsRange.value);
    const reels = parseInt(reelsRange.value);
    const totalVal = totalDisplay.innerText;
    
    let text = `Hi Sriram Media! 👋 I calculated a custom estimate for my project on your website:\n\n`;
    if (posts > 0) text += `📌 Social Media Posts: ${posts} (₹${(posts * RATE_POST).toLocaleString('en-IN')})\n`;
    if (reels > 0) text += `📌 Reels + 3D Effects: ${reels} (₹${(reels * RATE_REEL).toLocaleString('en-IN')})\n`;
    
    let servicesCount = 0;
    toggleCards.forEach(card => {
      if (card.classList.contains('selected')) {
        servicesCount++;
        const serviceId = card.getAttribute('data-service');
        const serviceName = card.querySelector('.toggle-title').innerText;
        const rate = SERVICES_RATES[serviceId];
        text += `📌 ${serviceName}: ₹${rate.toLocaleString('en-IN')}\n`;
      }
    });
    
    if (posts === 0 && reels === 0 && servicesCount === 0) {
      alert("Please select at least one creative service or customize quantities first!");
      return;
    }

    text += `\n💰 Estimated Total Investment: ${totalVal}\n\n`;
    text += `I would like to consult with a designer and start this project. Let me know when you are available!`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/919876543210?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  });
}

// Contact form validations and UI toast popups
function initContactForm() {
  const contactForm = document.getElementById('agency-contact-form');
  const toastContainer = document.getElementById('toast-container');

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-success-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    
    // Force layout repaint
    toast.offsetHeight;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const message = document.getElementById('form-message').value.trim();

      if (!name || !email || !message) {
        alert('Please fill in all the required form fields.');
        return;
      }

      // Simulated HTTP post request
      const submitBtn = contactForm.querySelector('.form-btn');
      const originalText = submitBtn.innerText;
      submitBtn.innerText = 'SENDING DETAILS...';
      submitBtn.disabled = true;

      setTimeout(() => {
        showToast('Message submitted! Our team will contact you shortly.');
        contactForm.reset();
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
      }, 1200);
    });
  }
}

// Run initializers on DOM content loaded
window.addEventListener('DOMContentLoaded', () => {
  initThree();
  initNavigation();
  initStatsCounter();
  initPortfolio();
  initQuoteCalculator();
  initContactForm();
});
