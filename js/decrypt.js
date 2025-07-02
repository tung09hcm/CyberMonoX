function _click_handler(btn) {
  const container = btn.closest(".hugo-encryptor-container");
  const input = container.querySelector(".hugo-encryptor-input");
  const cipherTextDiv = container.querySelector(".hugo-encryptor-cipher-text");

  const password = input.value;
  const encrypted = cipherTextDiv.textContent.trim();

  try {
    const decryptedBytes = CryptoJS.AES.decrypt(encrypted, password);
    const decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      alert("Sai mật khẩu hoặc nội dung không hợp lệ.");
      return;
    }

    cipherTextDiv.innerHTML = decrypted;
    cipherTextDiv.style.display = "block";
    input.style.display = "none";
    btn.style.display = "none";
  } catch (err) {
    alert("Giải mã thất bại.");
    console.error(err);
  }
}