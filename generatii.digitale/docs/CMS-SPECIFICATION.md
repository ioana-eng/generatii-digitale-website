# BuildWithIF CMS Specification

Version: 1.0

---

## Vision

BuildWithIF CMS este un sistem modular de administrare a website-urilor.

Scopul lui nu este să administreze un singur website, ci să poată fi reutilizat în orice proiect construit de BuildWithIF.

Fiecare proiect activează doar modulele necesare, iar fiecare utilizator vede doar funcțiile pentru care are permisiuni.

CMS-ul trebuie să fie simplu pentru client și ușor de extins pentru dezvoltator.

---

# Core Principles

## 1. One CMS

Există un singur BuildWithIF CMS.

Nu există versiuni diferite pentru fiecare client.

---

## 2. Modular Architecture

Toate funcționalitățile sunt dezvoltate ca module independente.

Exemple:

Gallery

Events

FAQ

Blog

Pages

Testimonials

Forms

Bookings

Shop

News

Team

Partners

Orice modul poate fi activat sau dezactivat fără modificarea Core-ului.

---

## 3. Core Never Changes

Core-ul conține doar funcționalități comune.

Authentication

Permissions

CRUD Engine

Upload Engine

Dashboard

Notifications

Database

Settings

Core-ul nu conține logică specifică unui client.

---

## 4. Project Configuration

Fiecare website are propriul fișier de configurare.

Acesta definește:

- numele proiectului
- conexiunea Supabase
- modulele active
- storage
- branding

---

## 5. Permissions

Accesul este controlat pe două niveluri.

### Project Level

Definește ce module sunt disponibile pentru proiect.

Exemplu:

Gallery

Events

FAQ

Settings

---

### User Level

Definește ce poate face fiecare utilizator.

Exemplu:

Administrator

Editor

Gallery Manager

Workshop Manager

---

## 6. Client Simplicity

Clientul vede doar funcțiile pe care le folosește.

Nu există meniuri inutile.

Nu există opțiuni ascunse.

Nu există acces la baza de date.

---

## 7. Reusable Components

Toate componentele sunt reutilizabile.

Buttons

Tables

Forms

Cards

Modals

Notifications

Upload

Search

Pagination

---

## 8. Single Source of Truth

Toate informațiile provin din Supabase.

Nu există date duplicate.

Nu există fișiere JSON locale.

Nu există fallback-uri în producție.

---

## 9. Storage

Toate imaginile sunt stocate în Supabase Storage.

În baza de date se salvează doar calea fișierului.

Exemplu:

gallery/image.webp

Nu se salvează URL-uri complete.

---

## 10. CRUD First

Toate modulele folosesc același CRUD Engine.

Nu există cod duplicat.

---

## 11. Security

Niciun secret nu este salvat în codul public.

Toate operațiile sunt controlate prin autentificare și politici RLS.

---

## 12. Consistent UI

Toate modulele respectă același design.

Aceleași butoane.

Aceleași formulare.

Aceleași tabele.

Aceleași culori.

---

## 13. Future Ready

CMS-ul trebuie să permită adăugarea de module noi fără modificarea Core-ului.

Exemple:

Newsletter

Appointments

Courses

Membership

Analytics

Marketplace

---

# Development Philosophy

Nu dezvoltăm pentru clientul actual.

Dezvoltăm pentru următorii 100 de clienți.

Fiecare linie de cod trebuie să poată fi reutilizată.

Orice funcționalitate nouă trebuie să respecte această specificație.
