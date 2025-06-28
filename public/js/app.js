function toggleCategory(header) {
  const list = header.nextElementSibling;
  if (list.style.display === "none") {
    list.style.display = "block";
    header.innerText = header.innerText.replace("▶", "▼");
  } else {
    list.style.display = "none";
    header.innerText = header.innerText.replace("▼", "▶");
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