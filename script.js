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
    context.filter = 'invert(1)';
    context.drawImage(video, 0, 0, window.innerWidth, window.innerHeight);
    context.filter = 'none';
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
