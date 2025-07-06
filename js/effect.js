document.addEventListener("DOMContentLoaded", function () {
  const tocLinks = document.querySelectorAll(".toc-fixed a");
  const headings = Array.from(document.querySelectorAll("h2[id], h3[id], h4[id], h5[id], h6[id]"));

  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -60% 0px",
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        tocLinks.forEach(link => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      }
    });
  }, observerOptions);

  headings.forEach((heading) => observer.observe(heading));
});