document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("pre").forEach((block) => {
    const button = document.createElement("button");
    button.innerText = "Copy";
    button.className = "copy-btn";

    block.style.position = "relative";
    block.appendChild(button);

    button.addEventListener("click", () => {
      const code = block.querySelector("code").innerText;
      navigator.clipboard.writeText(code);

      button.innerText = "Copied!";
      setTimeout(() => (button.innerText = "Copy"), 1500);
    });
  });
});
