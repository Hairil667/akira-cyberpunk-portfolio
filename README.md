# AKIRA // Cyberpunk Tactical Portfolio & Mecha Arsenal

Sebuah web portofolio bertema **Cyberpunk Gold** dengan identitas **Akira** (Mecha Pilot & Cybernetic Engineer).

---

## ⚡ Fitur Utama

1. **Tema Cyberpunk & Gold Matrix Background ("Background Mas")**:
   - Skema warna emas murni (`#FFB703`, `#FFD000`), carbon obsidian (`#07070A`), dan aksen neon cyan (`#00F0FF`).
   - Partikel mesh emas dinamis berbasis HTML5 Canvas yang responsif.
   - Scanline & glitch effect khas dunia masa depan.

2. **Cinematic Intro Masuk (Neural Link Initialization)**:
   - Animasi boot terminal saat pertama kali membuka website.
   - Progress bar sinkronisasi kuantum, suara boot synth, dan tombol *Bypass Intro* / *Initialize System*.

3. **Efek Tactical Map Radar Interaktif**:
   - Peta radar taktis Neo-Tokyo dengan sapuan radar dinamis 360°.
   - Sektor interaktif (*Sector 07 Akira Hangar*, *Sector 01 Citadel*, *Sector 04 Spaceport*, *Sector 11 Data Vault*, *Sector 19 Proving Grounds*).
   - Real-time mouse coordinate tracking HUD `[Latitude / Longitude / Grid Coordinates]`.

4. **Mecha Hangar Bay (Tema Meca)**:
   - Tampilan frame mecha: **RX-09 Ronin**, **Type-88 Goliath**, dan **VX-03 Valkyrie**.
   - Pengukur statistik interaktif (Armor Integrity, Agility, Firepower, Reactor Core Stability).
   - Spesifikasi teknis dinamis.

5. **Weapons Arsenal (Tema Senjata)**:
   - **HF-09 Murasama Plasma Katana** (Melee High-Frequency).
   - **Apex-9000 Heavy Railgun** (Ballistic Electromagnetic).
   - **Viper-PDW Smart SMG** (Kinetic Smart Homing).
   - Tombol **TEST FIRE SFX** dengan efek suara sintesis Web Audio API prosedural (suara pedang plasma, ledakan railgun, burst SMG).

6. **Cyber Hamburger Menu**:
   - Tombol hamburger bergaya laser crosshair animasi.
   - Fullscreen HUD navigation drawer dengan status diagnostik dan jam telemetry real-time.

7. **Aset Gambar SVG Terpisah**:
   - Seluruh vektor mecha, senjata, avatar oni mask, peta taktis, dan ikon dipisahkan secara rapi di dalam folder `assets/svg/`.

---

## 📂 Struktur Proyek

```
/
├── index.html                  # File utama aplikasi
├── README.md                   # Dokumentasi
├── styles/
│   └── main.css               # Desain sistem Cyberpunk Gold
├── scripts/
│   ├── audio.js               # Web Audio API Sound Synthesizer
│   ├── intro.js               # Cinematic boot sequence
│   ├── map.js                 # Radar scanner & tactical map controller
│   ├── arsenal.js             # Mecha switcher & weapon fire tester
│   └── main.js                # Hamburger menu, canvas gold matrix, form comms
└── assets/
    └── svg/
        ├── mecha-ronin.svg    # Vector RX-09 Ronin Mecha
        ├── mecha-goliath.svg  # Vector Type-88 Goliath Heavy Mecha
        ├── mecha-valkyrie.svg # Vector VX-03 Valkyrie Interceptor
        ├── weapon-katana.svg  # Vector HF-09 Murasama Katana
        ├── weapon-railgun.svg # Vector Apex-9000 Heavy Railgun
        ├── weapon-smg.svg     # Vector Viper-PDW Smart SMG
        ├── drone-sentinel.svg # Vector Combat Drone
        ├── cyber-avatar.svg   # Vector Akira Oni Helmet Avatar
        ├── map-sectors.svg    # Vector Tactical Sector Overlay
        └── tactical-icons.svg # Tactical SVG symbols
```

---

## 🚀 Penggunaan Lokal

Buka file `index.html` langsung di browser Anda, atau jalankan menggunakan live server statis:

```bash
# Menggunakan python http server
python3 -m http.server 8080

# Menggunakan npx serve
npx serve .
```
