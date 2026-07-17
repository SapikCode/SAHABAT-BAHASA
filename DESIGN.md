---
version: beta
name: Tolaki-chatbot-design-system
description: Sistem desain web edukasi bahasa Tolaki dengan kanvas putih, UI minimal seperti chatbot modern, dan palet lokal: primary amber #de990e, secondary green #73a920, tertiary blue #1376ba. Warna dipakai hemat agar aplikasi tetap bersih, ringan, dan fokus pada percakapan.

colors:
  primary: "#de990e"
  primary-active: "#bd7d08"
  primary-soft: "#f5ead7"
  secondary: "#73a920"
  secondary-soft: "#edf6df"
  tertiary: "#1376ba"
  tertiary-soft: "#e5f0f9"
  ink: "#0a0b0d"
  body: "#5b616e"
  body-strong: "#0a0b0d"
  muted: "#7c828a"
  muted-soft: "#a8acb3"
  hairline: "#dee1e6"
  hairline-soft: "#eef0f3"
  canvas: "#ffffff"
  surface-soft: "#f7f7f7"
  surface-card: "#ffffff"
  surface-strong: "#eef0f3"
  surface-dark: "#0a0b0d"
  on-primary: "#ffffff"
  on-dark: "#ffffff"

typography:
  display:
    fontFamily: "Inter, Nunito, -apple-system, system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontWeight: 400
    letterSpacing: 0
  body:
    fontFamily: "Inter, Nunito, -apple-system, system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontWeight: 400
    letterSpacing: 0
  button:
    fontFamily: "Inter, Nunito, -apple-system, system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: 14px
    fontWeight: 600
    letterSpacing: 0

rounded:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  pill: 9999px

components:
  app-shell:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
  sidebar:
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.hairline-soft}"
    width: 280px
  mobile-drawer:
    backgroundColor: "{colors.canvas}"
    overlay: "rgba(0, 0, 0, 0.45)"
    transition: "300ms ease-out"
  brand-mark:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
  button-primary:
    backgroundColor: "{colors.primary}"
    hoverBackgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    height: 44px
  quick-prompt:
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.hairline}"
    hoverBorderColor: "{colors.secondary}"
    hoverTextColor: "{colors.tertiary}"
    rounded: "{rounded.lg}"
  nav-icon-badge:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.tertiary}"
    rounded: "{rounded.pill}"
  composer:
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.xl}"
    shadow: "0 4px 12px rgba(0, 0, 0, 0.04)"
---

## Overview

Desain Sahabat Bahasa Tolaki memakai kanvas putih sebagai dasar utama. Aplikasi harus terasa seperti chatbot sederhana: ruang percakapan lega, sidebar riwayat di kiri untuk desktop, drawer mobile dengan overlay gelap, dan input bar yang selalu mudah ditemukan.

Palet lokal dipakai sebagai aksen, bukan sebagai background besar. `primary` amber `#de990e` menjadi warna aksi utama untuk tombol, logo, dan fokus penting. `secondary` green `#73a920` dipakai untuk hover, status belajar, atau aksen positif. `tertiary` blue `#1376ba` dipakai sebagai aksen informatif, link, dan badge kecil.

## Color Rules

- Primary `#de990e`: tombol utama, logo mark, CTA login, tombol kirim.
- Primary active `#bd7d08`: hover/pressed state untuk tombol utama.
- Primary soft `#f5ead7`: latar badge kecil atau aksen yang perlu hangat tapi ringan.
- Secondary `#73a920`: hover border, indikator kemajuan, status benar pada kuis.
- Tertiary `#1376ba`: teks aksen informatif, badge menu, link non-CTA.
- Canvas tetap `#ffffff`; jangan membuat halaman terasa kuning, hijau, atau biru penuh.

## Layout

- Route utama langsung menampilkan chatbot, bukan landing page.
- Desktop memakai sidebar kiri untuk riwayat chat. Riwayat hanya tersimpan setelah login.
- Mobile memakai drawer dari kanan dengan animasi dan overlay gelap; overlay bisa diklik untuk menutup.
- Chat area bersih, tanpa card besar di tengah. Logo, title, dan quick prompts boleh tampil sebagai empty state.
- Composer berada di bawah, berbentuk pill/card ringan dengan border halus.

## Typography

Gunakan Inter atau Nunito sebagai pengganti nuansa edukatif ala Quizizz/Kahoot yang tetap profesional. Heading tidak perlu terlalu tebal; body copy harus mudah dibaca. Letter spacing tetap 0 agar teks Indonesia/Tolaki aman di mobile.

## Interaction

- Semua tombol utama berbentuk pill.
- Hover quick prompt memakai border `secondary` dan teks `tertiary`.
- Ikon/badge menu mobile memakai latar soft dan teks aksen, bukan blok warna berat.
- Hindari glassmorphism, gradient besar, dan shadow tebal.

## Do

- Jaga halaman dominan putih.
- Pakai palet lokal secara hemat dan konsisten.
- Pisahkan UI ke komponen kecil agar page utama tidak menumpuk.
- Prioritaskan pengalaman chatbot yang langsung bisa dipakai.

## Don't

- Jangan memakai Coinbase Blue lama `#0052ff`.
- Jangan membuat background utama biru, hijau, atau kuning.
- Jangan membuat card bertumpuk di halaman chatbot utama.
- Jangan menaruh teks instruksi terlalu banyak di layar utama.
