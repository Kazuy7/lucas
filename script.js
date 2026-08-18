const parallaxItems = document.querySelectorAll('[data-parallax]');
const video = document.querySelector('#video-background');
const canvas = document.querySelector('#text-video');
const context = canvas.getContext('2d');
const mask = document.createElement('canvas');
const maskContext = mask.getContext('2d');
const title = document.querySelector('.container-name h1');
const subtitle = document.querySelector('.hero-title p');
const scrollHint = document.querySelector('.scroll-hint');
const aboutSection = document.querySelector('#sobre');
const customCursor = document.querySelector('#custom-cursor');
const interactiveElements = document.querySelectorAll('a, button, video');
let cursorX = 0;
let cursorY = 0;
let cursorRenderX = 0;
let cursorRenderY = 0;

function animateCursor() {
    cursorRenderX = cursorX;
    cursorRenderY = cursorY;
    customCursor.style.left = `${cursorRenderX}px`;
    customCursor.style.top = `${cursorRenderY}px`;
    requestAnimationFrame(animateCursor);
}

window.addEventListener('mousemove', (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
    cursorRenderX = cursorX;
    cursorRenderY = cursorY;
    customCursor.style.left = `${cursorX}px`;
    customCursor.style.top = `${cursorY}px`;
    customCursor.classList.add('is-visible');
});
window.addEventListener('mouseleave', () => customCursor.classList.remove('is-visible'));
interactiveElements.forEach((element) => {
    element.addEventListener('mouseenter', () => customCursor.classList.add('is-hovering'));
    element.addEventListener('mouseleave', () => customCursor.classList.remove('is-hovering'));
});
animateCursor();
const scrollDots = [...document.querySelectorAll('.scroll-dots span')];
let scrollTarget = 0;
let scrollVelocity = 0;
let previousScroll = window.scrollY;
const dotOffsets = scrollDots.map(() => 0);
let videoScrollSpeed = 0;
const baseVideoRate = 1;
const maxVideoRate = 2.5;
video.playbackRate = baseVideoRate;

function updateScrollDots() {
    scrollTarget = window.scrollY;
    scrollVelocity = window.scrollY - previousScroll;
    previousScroll = window.scrollY;
}

function animateScrollDots() {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = scrollTarget / scrollable;
    const dotsContainer = document.querySelector('.scroll-dots');
    const availableSpace = Math.max(0, window.innerHeight - 48 - dotsContainer.offsetHeight);
    dotsContainer.style.transform = `translateY(${progress * availableSpace}px)`;
    const separation = Math.min(48, Math.abs(scrollVelocity) * .8);

    scrollDots.forEach((dot, index) => {
        const follow = index / (scrollDots.length - 1);
        const targetOffset = separation * follow;
        dotOffsets[index] += (targetOffset - dotOffsets[index]) * .14;
        dot.style.transform = `translateY(${dotOffsets[index]}px)`;
    });

    scrollVelocity *= .88;

    // O vídeo sempre avança; a intensidade do scroll controla a aceleração.
    videoScrollSpeed += (scrollVelocity - videoScrollSpeed) * .16;
    if (Math.abs(videoScrollSpeed) < 0.02) videoScrollSpeed = 0;
    if (video.readyState >= 2 && Number.isFinite(video.duration)) {
        video.playbackRate = Math.min(maxVideoRate, baseVideoRate + Math.abs(videoScrollSpeed) * .035);
        if (video.paused) video.play().catch(() => {});
    }
    requestAnimationFrame(animateScrollDots);
}

window.addEventListener('scroll', updateScrollDots, { passive: true });
window.addEventListener('resize', updateScrollDots);
animateScrollDots();
const translations = {
    pt: { role: 'DESENVOLVEDOR FULL STACK', scrollHint: 'role para explorar ↓', aboutLabel: '01 — Sobre mim', aboutTitle: 'Construo experiências', aboutTitleEm: 'digitais com propósito.', aboutText: 'Sou formado em Gestão da Tecnologia da Informação e atuo há mais de 3 anos no mercado como programador. Sou apaixonado por tecnologia e criação, transformando ideias em soluções digitais funcionais, bonitas e focadas em pessoas. Ao longo da minha jornada, venho desenvolvendo experiências que unem código, usabilidade e criatividade.', projectsLabel: '02 — Projetos', projectsTitle: 'Trabalhos selecionados', stackLabel: '03 — Minha stack', stackTitle: 'Código que transforma ideias.', stackText: 'Tecnologias que uso para criar produtos digitais funcionais, rápidos e preparados para evoluir.', stackFrontend: 'Front-end', stackBackend: 'Back-end', stackData: 'Dados', stackTools: 'Ferramentas', contactLabel: '04 — Meus contatos', contactTitle: 'Vamos criar algo', contactTitleEm: 'juntos?' },
    en: { role: 'FULL STACK DEVELOPER', scrollHint: 'scroll to explore ↓', aboutLabel: '01 — About me', aboutTitle: 'I build experiences', aboutTitleEm: 'with purpose.', aboutText: 'I have a degree in Information Technology Management and have been working as a programmer for over 3 years. I am passionate about technology and creation, turning ideas into functional, beautiful digital solutions focused on people. Throughout my journey, I have developed experiences that bring together code, usability, and creativity.', projectsLabel: '02 — Projects', projectsTitle: 'Selected work', stackLabel: '03 — My stack', stackTitle: 'Code that turns ideas into reality.', stackText: 'Technologies I use to create functional, fast, and scalable digital products.', stackFrontend: 'Front-end', stackBackend: 'Back-end', stackData: 'Data', stackTools: 'Tools', contactLabel: '04 — Get in touch', contactTitle: 'Let’s create something', contactTitleEm: 'together?' }
};
function setLanguage(language) {
    document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = translations[language][element.dataset.i18n]; });
    document.querySelectorAll('.language-button').forEach((button) => button.classList.toggle('active', button.dataset.language === language));
    document.documentElement.lang = language === 'en' ? 'en' : 'pt-br';
}
document.querySelectorAll('.language-button').forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.language)));

const stackIcons = document.querySelector('.stack-icons');
if (stackIcons) {
    stackIcons.querySelectorAll('img').forEach((icon) => {
        const wrapper = document.createElement('span');
        wrapper.className = 'stack-icon';
        wrapper.dataset.label = icon.alt;
        icon.replaceWith(wrapper);
        wrapper.appendChild(icon);
    });
    const fallbackIcon = (icon) => {
        const mark = icon.alt.slice(0, 2).toUpperCase();
        icon.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='10' fill='white'/%3E%3Ctext x='32' y='39' text-anchor='middle' font-family='Arial' font-size='20' font-weight='bold' fill='black'%3E${mark}%3C/text%3E%3C/svg%3E`;
        icon.removeAttribute('data-fallback');
    };
    const duplicate = stackIcons.cloneNode(true);
    stackIcons.parentElement.appendChild(duplicate).setAttribute('aria-hidden', 'true');
    stackIcons.parentElement.querySelectorAll('img').forEach((icon) => {
        icon.addEventListener('error', () => {
            if (!icon.hasAttribute('data-fallback')) {
                icon.setAttribute('data-fallback', 'true');
                fallbackIcon(icon);
            }
        });
    });
}

const aboutObserver = new IntersectionObserver(([entry]) => {
    scrollHint.classList.toggle('is-hidden', entry.isIntersecting);
}, { threshold: 0.12 });

aboutObserver.observe(aboutSection);

const animatedContent = document.querySelectorAll('.reveal-side, .reveal-fade');
const contentObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
    });
}, { threshold: 0.18 });

animatedContent.forEach((element) => contentObserver.observe(element));

const carouselCards = [...document.querySelectorAll('.project-card')];
let carouselIndex = 0;
const previousButton = document.querySelector('#carousel-prev');
const nextButton = document.querySelector('#carousel-next');
const dotsContainer = document.querySelector('.carousel-dots');

function updateCarousel() {
    carouselCards.forEach((card, index) => {
        card.classList.remove('carousel-active', 'carousel-left', 'carousel-right');
        if (index === carouselIndex) card.classList.add('carousel-active');
        else if (index === (carouselIndex - 1 + carouselCards.length) % carouselCards.length) card.classList.add('carousel-left');
        else if (index === (carouselIndex + 1) % carouselCards.length) card.classList.add('carousel-right');
        else card.classList.add(index < carouselIndex ? 'carousel-left' : 'carousel-right');
    });
    dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, index) => dot.classList.toggle('active', index === carouselIndex));
}

if (carouselCards.length) {
    carouselCards.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', `Ir para o projeto ${index + 1}`);
        dot.addEventListener('click', () => { carouselIndex = index; updateCarousel(); });
        dotsContainer.appendChild(dot);
    });
    previousButton.addEventListener('click', () => {
        carouselIndex = (carouselIndex - 1 + carouselCards.length) % carouselCards.length;
        updateCarousel();
    });
    nextButton.addEventListener('click', () => {
        carouselIndex = (carouselIndex + 1) % carouselCards.length;
        updateCarousel();
    });
    updateCarousel();
}

document.querySelectorAll('.watch-video').forEach((button) => {
    button.addEventListener('click', (event) => {
        event.preventDefault();
        const projectVideo = button.closest('.project-card').querySelector('video');
        projectVideo.controls = true;
        projectVideo.muted = false;
        const fullscreen = projectVideo.requestFullscreen || projectVideo.webkitRequestFullscreen;
        if (fullscreen) fullscreen.call(projectVideo);
        projectVideo.play();
    });
});

function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    mask.width = canvas.width;
    mask.height = canvas.height;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    maskContext.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawTextMask(element) {
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    maskContext.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    maskContext.textAlign = element === subtitle ? 'right' : 'center';
    maskContext.textBaseline = 'alphabetic';
    const x = element === subtitle ? box.right : box.left + box.width / 2;
    maskContext.fillText(element.textContent, x, box.top + box.height * .78);
}

function drawVideoInText() {
    if (video.readyState < 2) {
        requestAnimationFrame(drawVideoInText);
        return;
    }
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    maskContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    drawTextMask(title);
    drawTextMask(subtitle);
    context.drawImage(video, 0, 0, window.innerWidth, window.innerHeight);
    context.globalCompositeOperation = 'destination-in';
    context.drawImage(mask, 0, 0, window.innerWidth, window.innerHeight);
    context.globalCompositeOperation = 'source-over';
    requestAnimationFrame(drawVideoInText);
}
function updateParallax() {
    parallaxItems.forEach((item) => {
        const offset = (window.innerHeight / 2 - item.getBoundingClientRect().top) * Number(item.dataset.parallax);
        item.style.setProperty('--parallax', `${offset}px`);
    });
}
window.addEventListener('scroll', updateParallax, { passive: true });
window.addEventListener('resize', updateParallax);
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
updateParallax();
drawVideoInText();
