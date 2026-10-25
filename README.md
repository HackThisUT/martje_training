# Martje Home Workout PWA

Eine schlanke Progressive Web App (PWA) für ein 4‑wöchiges Home‑Workout‑Programm — komplett offlinefähig, optimiert für das iPhone (Dynamic Island & Safe Area) und installierbar direkt aus Safari auf den Home‑Bildschirm.

## 1. Was ist die App?

**Martje Home Workout PWA** ist eine mobile Trainings-App für zu Hause. Sie bietet:

- Einen kompletten **4‑Wochen‑Trainingsplan** (Anfänger bis Fortgeschrittene) mit täglichen Übungen.
- **Timer‑Funktionen** für Übungs‑ und Pausenphasen.
- **Fortschritts‑Tracking** über LocalStorage (kein Server, keine Anmeldung, keine Datenkrümel).
- **Offline‑Modus** dank Service Worker — funktioniert auch ohne Internet, z. B. im Keller, Park oder Fitnessstudio.
- **Vollbild‑Standalone‑Modus** nach Installation auf dem iPhone‑Home‑Bildschirm — keine Safari‑URL‑Leiste, keine Ablenkung.
- Optimiert für **iPhone mit Dynamic Island**, Notch und abgerundeten Ecken via `viewport-fit=cover` und `env(safe-area-inset-*)`.

Die App ist eine reine statische Webseite — **kein Backend, keine Build‑Tools, keine Abhängigkeiten**. Sie besteht aus HTML, einem Web App Manifest, einem Service Worker und PNG‑Icons.

## 2. Struktur der Dateien

```
home-workout-pwa/
├── index.html                # Hauptdatei – komplette App-Oberfläche (HTML + CSS + JS inline)
├── manifest.webmanifest      # PWA-Manifest (Name, Icons, Start-URL, display=standalone, theme)
├── service-worker.js         # Offline-Cache (Cache-first für Assets, Network-fallback für Navigation)
├── icon-180.png              # iOS Home-Screen Icon (iPhone @3x, 180×180)
├── icon-192.png              # PWA-Icon Android/Chrome (192×192)
├── icon-512.png              # PWA-Icon Android/Chrome + Maskable (512×512)
├── icon-1024.png             # Großes Icon für App Store / Splash (1024×1024)
├── apple-touch-icon.png      # Fallback iOS Home-Screen Icon (Standard)
├── apple-touch-icon-152.png  # iPad Home-Screen Icon (152×152)
├── apple-touch-icon-167.png  # iPad Pro Home-Screen Icon (167×167)
└── README.md                 # Diese Datei
```

### Was macht jede Datei?

| Datei | Zweck |
|---|---|
| `index.html` | UI, Logik, Timer, Übungspläne. Verknüpft Manifest, registriert Service Worker. Enthält iOS-Meta-Tags (`apple-mobile-web-app-capable`, `viewport-fit=cover`). |
| `manifest.webmanifest` | Definiert Installierbarkeit, App-Name, Theme-Color (#27ae60), Icons, `display: standalone`. |
| `service-worker.js` | Cacht alle Kern-Assets in `hwp-v1`. Cache-first-Strategie für statische Assets, Network-fallback für Navigation. Räumt alte Caches in `activate` auf. |
| `icon-*.png` / `apple-touch-icon-*.png` | Icons für Home-Screen, Splash-Screen, Manifest, Android-Chrome. |

**Hinweis:** Es gibt keinen Build‑Schritt. Die App ist sofort lauffähig — einfach alle Dateien in ein Verzeichnis kopieren und hosten.

## 3. Hosting — wie und wo?

Die App ist **rein statisch**. Du brauchst keinen Node‑Server, keine Datenbank, keine PHP. Jeder statische Web‑Host funktioniert. **HTTPS ist Pflicht** (siehe unten).

### Option A: GitHub Pages (kostenlos, einfach)

1. Neues Repository anlegen, z. B. `martje-home-workout`.
2. Alle Dateien aus diesem Verzeichnis in den **Root** (oder `/docs`) des Repos committen und pushen.
3. In den Repo‑Settings → **Pages** → Source: `main` branch, `/ (root)` auswählen.
4. Nach ~1 Minute ist die App erreichbar unter `https://<dein-user>.github.io/martje-home-workout/`.

### Option B: Netlify (kostenlos, Drag & Drop)

1. Auf [app.netlify.com/drop](https://app.netlify.com/drop) das gesamte Verzeichnis per Drag & Drop ablegen.
2. Netlify vergibt sofort eine Subdomain (`https://random-name.netlify.app`).
3. Optional: Custom Domain verbinden.

### Option C: Vercel (kostenlos, Git-Integration)

1. Projekt in Vercel importieren (GitHub/GitLab/Bitbucket).
2. Framework Preset: **„Other"** (kein Build‑Schritt nötig).
3. Output‑Verzeichnis: Root.
4. Vercel liefert sofort HTTPS + CDN.

### Option D: Eigener Webserver (VPS, NAS, Raspberry Pi)

Apache oder nginx reichen. Beispiel **nginx**:

```nginx
server {
    listen 443 ssl http2;
    server_name workout.example.com;

    ssl_certificate     /etc/letsencrypt/live/workout.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/workout.example.com/privkey.pem;

    root /var/www/martje-home-workout;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Service Worker: kein Cache durch Browser (App-eigener Cache übernimmt)
    location = /service-worker.js {
        add_header Cache-Control "no-store";
        add_header Service-Worker-Worker "/service-worker.js" always;
    }
}
```

Letsencrypt (`certbot`) liefert kostenlose HTTPS‑Zertifikate.

### ⚠️ HTTPS ist Pflicht — insbesondere für iOS

**Warum HTTPS zwingend nötig ist:**

- **Service Worker** registrieren sich nur über `https://` oder `http://localhost`. Ohne HTTPS → keine Offline‑Funktion.
- **iOS PWA‑Installation** verlangt eine sichere Verbindung. Ohne HTTPS erscheint in Safari kein „Zum Home‑Bildschirm hinzufügen" als vollwertige PWA.
- **Web App Manifest**, **Push‑API**, **Background Sync** und viele moderne Browser‑Features sind an „secure context" gebunden.

**Ausnahme:** Auf `http://localhost` funktioniert es während der Entwicklung auch ohne TLS — aber nur auf dem Entwicklungsrechner, nicht auf dem iPhone.

## 4. Installation auf dem iPhone (iOS / Safari)

So bekommst du die App auf den Home‑Bildschirm:

1. **Safari öffnen** auf dem iPhone und die gehostete URL aufrufen, z. B. `https://workout.example.com`.
2. Unten in der **Aktionsleiste** auf das **Teilen‑Symbol** (Quadrat mit Pfeil nach oben) tippen.
3. Im Teilen‑Menü nach unten scrollen und **„Zum Home‑Bildschirm"** antippen.
4. Name bestätigen (Standard: *Workout*) und **„Hinzufügen"** tippen.
5. Das **Workout‑Icon** erscheint auf dem Home‑Bildschirm.
6. App über das Icon starten → sie öffnet sich im **Vollbild‑Standalone‑Modus** ohne Safari‑URL‑Leiste.

> **Tipp:** Verwende **immer Safari**. Andere Browser (Chrome, Firefox) bieten auf iOS nur eingeschränkten PWA‑Support.

> **Tipp:** Das Icon taucht erst nach dem Schließen aller Safari‑Tabs oder einem Neustart zuverlässig als PWA‑Kandidat auf. Bei Problemen: Safari-Cache leeren (Einstellungen → Safari → Verlauf & Website-Daten löschen).

## 5. iOS-spezifische Features

Die App nutzt moderne iOS‑Web‑Features für ein nativ‑ähnliches Erlebnis.

### 🏝 Dynamic Island / Notch / Safe Area

iPhones mit Dynamic Island (14 Pro/15/16/17) oder älterer Notch haben oben und unten einen Bereich, in dem keine UI‑Elemente platziert werden dürfen. Die App respektiert das über:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no">
```

```css
.container {
  padding-top:    max(20px, env(safe-area-inset-top));
  padding-bottom: max(20px, env(safe-area-inset-bottom));
  padding-left:   env(safe-area-inset-left);
  padding-right:  env(safe-area-inset-right);
}
```

`viewport-fit=cover` erlaubt der App, den **gesamten Bildschirm** zu nutzen (inkl. der Bereiche unter der Dynamic Island). `env(safe-area-inset-*)` liefert die exakten Abstände, die iOS für Statusleiste und Home‑Indicator reserviert.

### 📱 Standalone-Vollbild

```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

- `apple-mobile-web-app-capable` aktiviert den Standalone‑Modus nach Installation.
- `apple-mobile-web-app-status-bar-style: black-translucent` lässt die Statusleiste transparent über dem App‑Inhalt schweben — passend zur grünen Theme‑Color (#27ae60).

Zusätzlich im Manifest:

```json
"display": "standalone",
"theme_color": "#27ae60",
"background_color": "#f0f2f5"
```

### 🌐 Offline Service Worker

```js
// service-worker.js – Cache-first Strategie
const CACHE_VERSION = "hwp-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-1024.png",
  "./apple-touch-icon.png",
  "./apple-touch-icon-152.png",
  "./apple-touch-icon-167.png",
];
```

- Beim ersten Aufruf werden alle Assets in `hwp-v1` gecacht.
- Folgeaufrufe liefert der Service Worker aus dem Cache → **die App funktioniert ohne Netz**.
- Neue Versionen erhöhen `CACHE_VERSION` (z. B. `hwp-v2`) → alte Caches werden in `activate` gelöscht.

### 🎨 Theme & Splash

Die `theme_color` (#27ae60) färbt:

- Die **Adressleiste** in Safari.
- Den **Splash‑Screen** beim Start der installierten App.
- Die **Statusleiste** (in Kombination mit `black-translucent`).

### 🧠 Lokale Daten

Trainings‑Fortschritt wird in `localStorage` gespeichert — bleibt auf dem Gerät, geht nicht über die Leitung, kein Tracking.

---

## Schnellstart — 3 Schritte

```bash
# 1. ZIP entpacken
unzip home-workout-pwa.zip -d martje-home-workout
cd martje-home-workout

# 2. (Optional) lokal mit HTTPS testen – empfohlen, weil Service Worker HTTPS braucht
python3 -m http.server 8080   # nur HTTP, kein voller PWA-Test auf iPhone

# 3. Hochladen (z. B. zu Netlify Drop) und auf dem iPhone in Safari öffnen
```

## Lizenz & Mitwirkende

Privates Workout‑Projekt — frei verwendbar, kein Tracking, keine Werbung, keine externen Abhängigkeiten.

**Viel Spaß beim Training!** 💪

## iOS-Audio Fix (Standalone-PWA, iPhone 17 / iOS 17+/18)

In der als Home-Bildschirm-PWA installierten Variante wurde Audio nicht
abgespielt. Ursachen und Fixes:

1. **DOCTYPE fehlte** – Datei startete mit bare `<head>` → Safari riet in
   den Quirks-Modus und behandelte `<audio>`/AudioContext anders. Behoben
   durch Voranstellen von `<!DOCTYPE html>` und `<html lang="de">`.
2. **Priming war nicht stumm** – Der erste `play()/pause()`-Trick spielte
   das echte 880 Hz-WAV und erzeugte einen hörbaren Klick, reaktivierte
   aber die Audio-Session. Auf iOS 17+/18 reicht das nicht mehr — das
   priming muss vor dem ersten Timer-getriebenen `play()` abgeschlossen
   sein. Fix: `await AudioManager.unlock()` in `startWorkout()`.
3. **Clone noch nicht dekodiert** – `beep()` klonierte den `<audio>` und
   rief sofort `.play()` auf. iOS verwirft play()-Aufrufe auf
   nicht-bereiten data:-Audio-Elementen stillschweigend. Fix:
   `await canplay/loadeddata` (Timeout 600 ms) vor `.play()`.
4. **Wake-Lock-Video belegt die HTMLMediaElement-Slot** – Das
   `<video id="wakelock-video">` (NoSleep-Trick) und das canvas-stream
   `<video>` werden iOS-seitig als „aktives Medienelement" behandelt
   und konkurrieren mit den Beep-Klonen. Fix: beim Start des Workouts
   beide Videos pausieren und WakeLock-Fallbacks stoppen.
5. **Service-Worker-Cache** – Cache-Version von `hwp-v1` auf `hwp-v2`
   erhöht, damit iOS beim nächsten App-Start das gefixte `index.html`
   ausliefert.

Betroffene Dateien: `index.html`, `service-worker.js`.
