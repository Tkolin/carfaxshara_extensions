const slides = document.querySelectorAll(".slide");
const dotsContainer = document.getElementById("dots");
let currentIndex = 0;

function createDots() {
  dotsContainer.innerHTML = "";
  for (let i = 0; i < slides.length; i++) {
    const el = document.createElement("div");
    if (i === currentIndex) {
      el.className = "dash"; // белая линия
    } else {
      el.className = "dot"; // серый кружок
    }
    dotsContainer.appendChild(el);
  }
}

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });
  currentIndex = index;
  createDots();
}

function nextSlide() {
  let nextIndex = (currentIndex + 1) % slides.length;
  showSlide(nextIndex);
}

slides.forEach((slide) => {
  slide.addEventListener("click", () => {
    nextSlide();
  });
});

setInterval(() => {
  nextSlide();
}, 3000);

createDots();
