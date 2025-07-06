document.addEventListener("DOMContentLoaded", function () {
  const isEncrypted = document.querySelector(".hugo-encryptor-cipher-text") !== null;
  const toc = document.querySelector(".toc-fixed");

  if (isEncrypted && toc) {
    toc.style.display = "none";
  }
});