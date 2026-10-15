# BuildWithIF CMS – Master Context

Version: 1.0

Status: Active

Owner: BuildWithIF

Purpose:
Acest document reprezintă sursa oficială de adevăr pentru BuildWithIF CMS.

Toate deciziile de arhitectură, dezvoltare și design trebuie să respecte informațiile din acest document.

În cazul unui conflict între cod și documentație, documentația trebuie actualizată sau implementarea revizuită astfel încât cele două să rămână sincronizate.

---

# Product Vision

BuildWithIF CMS este o platformă modulară de administrare a website-urilor, creată pentru a oferi clienților o experiență simplă și intuitivă, iar dezvoltatorilor un sistem reutilizabil și ușor de extins.

Scopul platformei nu este doar administrarea conținutului, ci standardizarea modului în care sunt construite și gestionate toate proiectele BuildWithIF.

Fiecare website este livrat împreună cu un panou de administrare adaptat nevoilor clientului. Utilizatorii văd doar funcționalitățile de care au nevoie, reducând complexitatea și riscul de erori.

BuildWithIF CMS este dezvoltat ca un produs independent de website-urile pe care le administrează. Website-urile reprezintă doar prezentarea publică, în timp ce CMS-ul gestionează conținutul, utilizatorii și resursele.

Toate deciziile de arhitectură urmăresc patru obiective:

- Simplitate pentru utilizatorii finali.
- Reutilizare maximă a codului.
- Modularitate și scalabilitate.
- Mentenanță minimă pe termen lung.

Orice funcționalitate nouă trebuie proiectată astfel încât să poată fi reutilizată în orice proiect BuildWithIF, fără rescrierea codului existent.

# Product Philosophy

BuildWithIF CMS este construit pornind de la ideea că un CMS trebuie să fie simplu pentru client și puternic pentru dezvoltator.

Fiecare funcționalitate este evaluată înainte de implementare folosind următoarele principii:

## 1. Simplicity First

Interfața trebuie să fie intuitivă și ușor de utilizat.

Clientul trebuie să poată administra website-ul fără documentație sau instruire.

Dacă o funcționalitate complică experiența utilizatorului fără un beneficiu clar, aceasta nu va fi implementată.

---

## 2. Modular by Design

Toate funcționalitățile sunt dezvoltate ca module independente.

Modulele pot fi activate sau dezactivate în funcție de nevoile fiecărui proiect.

Niciun modul nu trebuie să depindă direct de alt modul.

---

## 3. Reusability Over Duplication

Codul reutilizabil este întotdeauna preferat în locul duplicării.

Orice componentă care poate fi folosită în două sau mai multe locuri trebuie extrasă într-o componentă comună.

---

## 4. Configuration Over Customization

Fiecare proiect trebuie configurat, nu rescris.

Diferențele dintre proiecte sunt controlate prin configurație, module active și permisiuni, nu prin modificarea codului sursă.

---

## 5. Client Safety

Utilizatorii au acces doar la funcționalitățile de care au nevoie.

Interfața trebuie să reducă posibilitatea de a face modificări greșite.

Acțiunile importante trebuie confirmate înainte de executare.

---

## 6. Long-Term Maintainability

Toate deciziile tehnice sunt luate având în vedere mentenanța pe termen lung.

Codul trebuie să fie ușor de citit, documentat și extins.

---

## 7. Consistency

Toate proiectele BuildWithIF folosesc aceeași arhitectură, același Design System și aceleași convenții de dezvoltare.

Experiența utilizatorului trebuie să fie consecventă indiferent de proiect.

# Technology Stack

BuildWithIF CMS este construit folosind tehnologii stabile, ușor de întreținut și potrivite pentru proiecte mici și medii.

## Frontend

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)

Nu sunt utilizate framework-uri frontend (React, Vue, Angular etc.) în versiunea 1.x a CMS-ului.

---

## Backend

BuildWithIF CMS nu utilizează un backend propriu.

Toate operațiile sunt realizate prin:

- Supabase Database
- Supabase Authentication
- Supabase Storage
- Supabase Row Level Security (RLS)

---

## Database

Supabase PostgreSQL

Toate datele sunt stocate în tabele relaționale.

Structura bazei de date trebuie să respecte DATABASE_STANDARD.md.

---

## File Storage

Toate fișierele media sunt stocate în Supabase Storage.

În baza de date se salvează doar calea fișierului.

Exemplu:

gallery/workshop-01.webp

Nu se salvează URL-uri complete.

---

## Hosting

Website:
Vercel

CMS:
Vercel

---

## Version Control

Git

GitHub

Toate modificările sunt versionate.

---

## Deployment

GitHub

↓

Vercel

↓

Website Online

↓

CMS Online

↓

Supabase

---

## Local Development

Editor recomandat:

Visual Studio Code

Browser:

Google Chrome

---

## External Services

În versiunea 1.0 sunt acceptate doar:

- Supabase
- Google Apps Script (formulare)
- WhatsApp Links
- Google Maps Embed

Orice serviciu nou trebuie documentat înainte de integrare.

---

## Philosophy

Se preferă întotdeauna soluțiile simple și ușor de întreținut.

Înainte de introducerea unei noi tehnologii trebuie analizate:

- beneficiile;
- impactul asupra mentenanței;
- compatibilitatea cu arhitectura existentă.

# Project Architecture

BuildWithIF CMS este organizat pe principiul separării responsabilităților.

Fiecare director are un scop bine definit și nu trebuie să conțină cod care aparține altui nivel al aplicației.

---

## Root Structure

BuildWithIF-CMS/

├── admin/
├── assets/
├── config/
├── core/
├── docs/
├── modules/
├── ui/
└── vendor/ (opțional)

---

## admin/

Conține paginile HTML ale CMS-ului.

Exemple:

- login.html
- dashboard.html
- gallery.html
- workshops.html
- faq.html
- users.html

Aceste pagini NU conțin logică complexă.

Rolul lor este doar să asambleze componentele UI și modulele.

---

## assets/

Conține resurse statice.

Structură recomandată:

assets/

css/

fonts/

icons/

images/

Nu se salvează imagini încărcate de utilizatori.

Acestea vor fi întotdeauna în Supabase Storage.

---

## config/

Conține toate fișierele de configurare.

Exemple:

project.js
theme.js
permissions.js

Nicio valoare configurabilă nu trebuie hardcodată în aplicație.

---

## core/

Reprezintă motorul CMS-ului.

Conține funcționalități reutilizabile pentru toate proiectele.

Exemple:

auth.js
database.js
crud.js
storage.js
permissions.js
router.js
eventBus.js
errorHandler.js
i18n.js
moduleLoader.js
form/ (Form Engine)
table/ (Table Engine)

Core-ul nu trebuie să conțină logică specifică unui client.

---

## docs/

Conține întreaga documentație oficială.

Orice decizie majoră trebuie documentată aici înainte de implementare.

---

## modules/

Conține toate modulele CMS.

Fiecare modul este complet independent.

Exemplu:

modules/

gallery/

workshops/

faq/

pages/

users/

settings/

Fiecare modul gestionează doar propria funcționalitate.

---

## ui/

Conține componente reutilizabile.

Exemple:

Button

Card

Input

Select

Textarea

Table

EmptyState

Sidebar

Topbar

Modal

Toast

Loader

Nicio componentă UI nu trebuie să conțină logică specifică unui modul.

---

## vendor/

Opțional.

Conține librării externe care nu sunt dezvoltate de BuildWithIF.

---

# Architectural Rule

Fluxul aplicației trebuie să respecte întotdeauna următoarea ordine:

UI

↓

Module

↓

Core

↓

Supabase

Componentele UI nu comunică direct cu baza de date.

Toate operațiile asupra datelor trec prin Core.

Acest lucru reduce duplicarea codului și face aplicația mai ușor de întreținut.

---

# Reusability

Orice funcționalitate reutilizabilă trebuie mutată în:

- ui/
- core/

Orice funcționalitate specifică unui client trebuie implementată într-un modul sau configurată prin fișierele din config/.

Nu este permisă duplicarea codului între module.

# Folder Structure

Toate proiectele BuildWithIF CMS respectă aceeași structură de directoare.

## Principii

- Fiecare folder are o singură responsabilitate.
- Codul reutilizabil este separat de codul specific proiectelor.
- Nu este permisă duplicarea fișierelor între module.
- Structura folderelor trebuie să fie identică în toate proiectele.

---

## Structura principală

BuildWithIF-CMS/

admin/
assets/
config/
core/
docs/
modules/
ui/

---

## Reguli

### admin/

Conține doar paginile HTML ale CMS-ului.

Nu conține logică de business.

---

### assets/

Conține doar resurse statice.

Nu se salvează fișiere generate de utilizatori.

---

### config/

Conține toate configurările proiectului.

Nu conține funcții.

---

### core/

Conține logica reutilizabilă a CMS-ului.

Nu conține logică specifică unui client.

---

### docs/

Conține documentația oficială.

Orice modificare majoră trebuie documentată.

---

### modules/

Conține funcționalitățile CMS.

Fiecare modul este independent.

---

### ui/

Conține toate componentele reutilizabile.

# CMS Architecture

BuildWithIF CMS este construit modular.

## Structură

Authentication

↓

Dashboard

↓

Modules

↓

Core Services

↓

Supabase

---

## Componente principale

Authentication

Dashboard

CRUD Engine

Media Manager

User Manager

Settings

Permissions

Notifications

---

## Fluxul aplicației

User

↓

Dashboard

↓

Module

↓

Core

↓

Supabase

---

Niciun modul nu comunică direct cu baza de date.

Toate operațiile trec prin Core.

# Module Architecture

Fiecare funcționalitate este dezvoltată ca modul independent.

Structură recomandată:

module/

index.html

module.js

module.css

README.md

---

Un modul trebuie să poată fi:

- activat
- dezactivat
- reutilizat

fără modificarea codului altor module.

---

Fiecare modul este responsabil doar pentru propria funcționalitate.

Exemple:

Gallery

Workshops

FAQ

Pages

Users

Settings

# Design System

Toate componentele UI respectă documentul:

02_DESIGN_SYSTEM.md

Principii:

- consistență
- spațiere generoasă
- interfață aerisită
- accesibilitate
- responsive

Componente standard:

Button

Card

Input

Select

Textarea

Modal

Table

EmptyState

Sidebar

Topbar

Toast

Badge

Loader

# User Roles & Permissions

BuildWithIF CMS funcționează pe baza permisiunilor.

Rolurile controlează accesul la module și acțiuni.

Rolurile standard:

Administrator

Editor

Client

---

Administrator

Acces complet.

---

Editor

Poate modifica modulele alocate.

Nu poate modifica utilizatori sau configurația sistemului.

---

Client

Are acces doar la modulele stabilite pentru proiect.

Exemplu HopTop:

✔ Galerie

✔ Ateliere

Nu vede:

Users

Settings

Permissions

Logs

---

Toate permisiunile trebuie configurate fără modificarea codului.

# Future Vision

BuildWithIF CMS este dezvoltat ca un produs software reutilizabil.

Obiective pe termen lung:

- utilizare în toate proiectele BuildWithIF
- instalare rapidă pentru proiecte noi
- sistem modular
- configurare fără modificarea codului
- actualizări centralizate
- management al utilizatorilor
- media manager avansat
- constructor de pagini
- sistem de backup
- jurnal de activitate
- marketplace de module

---

Scopul final este existența unui singur BuildWithIF CMS care poate administra orice website construit de BuildWithIF.
