# CyberMonoX Hugo Blog

Welcome to **CyberMonoX**, a highly customized [Hugo](https://gohugo.io/) blog theme designed and built from scratch. This project is more than just a theme — it's a secure, automated, and minimalistic publishing platform for developers.

![screenshot](background.png)

## ✨ Features

- 🎨 **Custom Hugo Theme** — Clean, modern layout inspired by cyber aesthetics. Built from scratch using only HTML/CSS.
- 🔒 **Password-protected Posts** — Individual posts can be encrypted with passwords (AES), requiring a reader to unlock the content.
- ⚙️ **GitHub Actions Workflow** — Automatically encrypts selected content and deploys the blog to GitHub Pages.
- 📚 **Table of Contents** — Automatic ToC generation for long-form posts.
- 🌓 **Dark Mode Support** — Fully compatible with dark/light mode toggle.
- ⚡ **Fast & Lightweight** — No JS frameworks. Loads instantly and works offline with minimal assets.

## 🔐 Post Encryption

Posts can be protected with a password. When the page loads, users will see a prompt to input the correct password. If it matches, the encrypted content is decrypted on the client side using AES.

This feature is ideal for keeping certain posts semi-private or only available to select readers — while still hosted publicly.

## 🚀 Deployment Workflow

This project includes a GitHub Actions workflow that automates:

1. Scanning and encrypting specific HTML blocks inside your Markdown files.
2. Building the site with Hugo.
3. Deploying the final static site to GitHub Pages (`gh-pages` branch).

You simply write and push — encryption + deployment are automatic.

## 🧑‍💻 Getting Started

Clone the repository:

```bash
git clone https://github.com/tung09hcm/CyberMonoX.git
cd CyberMonoX
```

🛠 Tech Stack
Hugo — Static Site Generator
CryptoJS — AES encryption
GitHub Actions — CI/CD pipeline

🙌 Author
Created and maintained by @tung09hcm