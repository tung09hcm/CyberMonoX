function showCustomAlert(message) {
    const overlay = document.getElementById('customAlertOverlay');
    const messageBox = document.getElementById('customAlertMessage');
    messageBox.textContent = message;
    overlay.classList.remove('hidden');
}

function closeCustomAlert() {
    const overlay = document.getElementById('customAlertOverlay');
    overlay.classList.add('hidden');
}

function buildTOCFromDecryptedContent() {
  const container = document.querySelector(".hugo-encryptor-cipher-text");
  const tocNav = document.querySelector(".toc-fixed");
  if (!container || !tocNav) return;

  const headings = container.querySelectorAll("h1[id], h2[id], h3[id], h4[id]");
  if (headings.length === 0) return;

  let currentLevel = 2;
  let tocStack = [document.createElement("ul")];

  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.substring(1)); 
    const text = heading.textContent;
    const id = heading.id;

    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${id}`;
    a.textContent = text;
    li.appendChild(a);

    if (level === currentLevel) {
      tocStack[tocStack.length - 1].appendChild(li);
    } else if (level > currentLevel) {
      const newUl = document.createElement("ul");
      newUl.appendChild(li);
      tocStack[tocStack.length - 1].lastElementChild.appendChild(newUl);
      tocStack.push(newUl);
      currentLevel = level;
    } else {
      while (currentLevel > level) {
        tocStack.pop();
        currentLevel--;
      }
      tocStack[tocStack.length - 1].appendChild(li);
    }
  });

  tocNav.innerHTML = "";
  const tocHeading = document.createElement("h2");
  tocHeading.textContent = "Table of Contents";
  tocNav.appendChild(tocHeading);
  tocNav.appendChild(document.createElement("br"));
  tocNav.appendChild(tocStack[0]);
}


function _click_handler(btn) {
  const container = btn.closest(".hugo-encryptor-container");
  const input = container.querySelector(".hugo-encryptor-input");
  const cipherTextDiv = container.querySelector(".hugo-encryptor-cipher-text");

  const password = input.value;
  const encrypted = cipherTextDiv.textContent.trim();

  const toc = document.querySelector(".toc-fixed");
  if (toc) {
    if (window.innerWidth >= 1024) {
      toc.style.display = "block";
    } else {
      toc.style.display = "none";
    }
  }

  try {
    const decryptedBytes = CryptoJS.AES.decrypt(encrypted, password);
    const decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      showCustomAlert("Incorrect password. Please try again with the correct one.");
      const isEncrypted = document.querySelector(".hugo-encryptor-cipher-text") !== null;
      const toc = document.querySelector(".toc-fixed");

      if (isEncrypted && toc) {
        toc.style.display = "none";
      }
      return;
    }

    cipherTextDiv.innerHTML = decrypted;
    
    cipherTextDiv.style.display = "block";
    input.style.display = "none";
    btn.style.display = "none";
    buildTOCFromDecryptedContent();
  } catch (err) {
    const isEncrypted = document.querySelector(".hugo-encryptor-cipher-text") !== null;
    const toc = document.querySelector(".toc-fixed");

    if (isEncrypted && toc) {
      toc.style.display = "none";
    }
  }
}