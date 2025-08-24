
document.addEventListener('DOMContentLoaded', () => {
  const carrusel = document.querySelector('.carrusel');
  const track = document.querySelector('.carrusel-contenedor');
  const slides = Array.from(document.querySelectorAll('.carrusel-contenedor .slide'));
  const prev = document.querySelector('.prev');
  const next = document.querySelector('.next');

  if (!carrusel || !track || !slides.length || !prev || !next) return;

  let index = 0;

  function setSlideSizes() {
    const width = carrusel.clientWidth;
    slides.forEach(s => (s.style.width = `${width}px`)); 
    track.style.transform = `translateX(-${index * width}px)`; 
  }

  function goTo(i) {
    const total = slides.length;
    index = (i + total) % total; 
    const width = carrusel.clientWidth;
    track.style.transform = `translateX(-${index * width}px)`;
  }

  prev.addEventListener('click', () => goTo(index - 1));
  next.addEventListener('click', () => goTo(index + 1));

  let timer = setInterval(() => goTo(index + 1), 5000);


  [prev, next, carrusel].forEach(el => {
    el.addEventListener('mouseenter', () => clearInterval(timer));
    el.addEventListener('mouseleave', () => {
      clearInterval(timer);
      timer = setInterval(() => goTo(index + 1), 5000);
    });
  });


  setSlideSizes();
  window.addEventListener('resize', setSlideSizes);
});
