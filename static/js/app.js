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