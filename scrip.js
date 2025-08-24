// script.js
document.addEventListener('DOMContentLoaded', () => {
  const carrusel = document.querySelector('.carrusel');
  const track = document.querySelector('.carrusel-contenedor');
  const slides = Array.from(document.querySelectorAll('.carrusel-contenedor .slide'));
  const prev = document.querySelector('.prev');
  const next = document.querySelector('.next');

  // Si algo no se encuentra, no seguimos (evita errores silenciosos)
  if (!carrusel || !track || !slides.length || !prev || !next) return;

  let index = 0;

  function setSlideSizes() {
    const width = carrusel.clientWidth;
    slides.forEach(s => (s.style.width = `${width}px`)); // cada slide = ancho del carrusel
    track.style.transform = `translateX(-${index * width}px)`; // recolocar al redimensionar
  }

  function goTo(i) {
    const total = slides.length;
    index = (i + total) % total; // loop infinito
    const width = carrusel.clientWidth;
    track.style.transform = `translateX(-${index * width}px)`;
  }

  // Eventos flechas
  prev.addEventListener('click', () => goTo(index - 1));
  next.addEventListener('click', () => goTo(index + 1));

  // Auto-rotación
  let timer = setInterval(() => goTo(index + 1), 5000);

  // Pausar al interactuar
  [prev, next, carrusel].forEach(el => {
    el.addEventListener('mouseenter', () => clearInterval(timer));
    el.addEventListener('mouseleave', () => {
      clearInterval(timer);
      timer = setInterval(() => goTo(index + 1), 5000);
    });
  });

  // Inicializar tamaños y escuchar resize
  setSlideSizes();
  window.addEventListener('resize', setSlideSizes);
});
