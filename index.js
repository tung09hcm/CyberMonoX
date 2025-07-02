const fs = require("fs");
const path = require("path");
const CryptoJS = require("crypto-js");
const cheerio = require("cheerio");

const rootDir = path.resolve(__dirname, "./public/post"); // Thay bằng thư mục gốc bạn muốn quét

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function encryptHtmlFile(filePath) {
  const html = fs.readFileSync(filePath, "utf-8");
  const $ = cheerio.load(html, { decodeEntities: false });

  const targets = $(".hugo-encryptor-cipher-text");

  if (targets.length === 0) return;

  let changed = false;

  targets.each((_, el) => {
    const $el = $(el);
    const password = $el.attr("data-password");
    if (!password) return;

    const content = $el.html();
    const encrypted = CryptoJS.AES.encrypt(content, password).toString();

    const newDiv = `
<div class="hugo-encryptor-cipher-text" style="display: none;">
  ${encrypted}
</div>`;

    $el.replaceWith(newDiv);
    changed = true;
  });

  if (changed) {
    fs.writeFileSync(filePath, $.html(), "utf-8");
    console.log(`Encrypted and updated: ${filePath}`);
  }
}

walkDir(rootDir, (filePath) => {
  if (filePath.endsWith(".html")) {
    encryptHtmlFile(filePath);
  }
});
