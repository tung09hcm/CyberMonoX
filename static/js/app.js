function toggleCategory(header) {
  const list = header.nextElementSibling;
  const isOpening = !list.classList.contains('open');

  if (isOpening) {
    list.style.display = "block"; 
    requestAnimationFrame(() => {
      list.classList.add('open');
      const items = list.querySelectorAll('div');
      items.forEach((item, index) => {
        item.style.transitionDelay = `${index * 50}ms`;
      });
    });
  } else {
    const items = list.querySelectorAll('div');
    items.forEach((item) => {
      item.style.transitionDelay = `0ms`;
    });
    list.classList.remove('open');


    setTimeout(() => {
      if (!list.classList.contains('open')) {
        list.style.display = "none";
      }
    }, 400); 
  }
}



const mode = localStorage.getItem("mode");
const toggle = document.querySelector(".toggle");
const body = document.querySelector("body");
const listItemCategory = document.querySelector(".listItemCategory");
if (mode === "light") {
  body.classList.add("light");
}

toggle.addEventListener("click", () => {
  body.classList.toggle("light");

  if (body.classList.contains("light")) {
    localStorage.setItem("mode", "light");
  } else {
    localStorage.setItem("mode", "");
  }
});