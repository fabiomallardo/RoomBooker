# 🏨 RoomBooker

**RoomBooker** è una piattaforma full-stack per la prenotazione di soggiorni, strutture turistiche e la gestione di recensioni.  
Progettata con un'interfaccia utente moderna, esperienze fluide e feature avanzate, RoomBooker si posiziona come una soluzione completa e scalabile per clienti e host, simile alle funzionalità offerte da Airbnb o Booking.com.

---

## ✨ Introduzione

RoomBooker offre due esperienze distinte:

- **Cliente**: può registrarsi, esplorare strutture, prenotare soggiorni, lasciare recensioni.
- **Host**: può registrare strutture, gestire prenotazioni.

Grazie all'integrazione con **Leaflet**, **Cloudinary**, **Google OAuth**, e **OpenCage Geocoding**, l'app offre funzionalità avanzate come:
- mappe interattive geolocalizzate
- caricamento immagini in cloud
- autenticazione sicura
- ricerca visiva delle strutture

---

## 🚀 Funzionalità principali

### 👥 Autenticazione
- Login e registrazione con email/password
- Login tramite **Google OAuth**
- Gestione ruolo utente: `customer` o `host`

### 🏠 Strutture
- Creazione di una struttura con:
  - nome, descrizione, tipo (hotel, B&B, etc.)
  - indirizzo completo (usato per la mappa)
  - immagini (caricate via Cloudinary)
- Modifica o eliminazione delle proprie strutture
- Galleria immagini **fullscreen** con swipe mobile-friendly

### 📍 Mappa interattiva
- Integrazione con **Leaflet.js** e **OpenCage API**
- Ogni struttura è visualizzata su mappa con marker
- Modal mappa fullscreen (con zoom e spostamenti)

### 📅 Prenotazioni
- Selezione date con **datepicker**
- Disabilitazione dinamica delle date già prenotate
- Calcolo automatico delle notti
- Storico prenotazioni con possibilità di annullamento

### ⭐ Recensioni
- Ogni cliente può lasciare una recensione dopo il soggiorno
- Voto (da 1 a 5 stelle) + commento
- Visualizzazione media voti
- Cancellazione recensione propria



### 🧑‍🎨 UI e UX
- Completamente responsive
- Animazioni fluide (Framer Motion + CSS)
- Notifiche toast per ogni evento (successo, errore, warning)
- Effetti hover su card, mappa, immagini
- Galleria immagini mobile con swipe e frecce

---



---

## ⚙️ Tech stack

### 🖥️ Frontend

| Tecnologia         | Descrizione                          |
|--------------------|--------------------------------------|
| React              | Framework UI principale              |
| React Router DOM   | Navigazione client-side              |
| React DatePicker   | Calendario con gestione date         |
| Framer Motion      | Animazioni fluide                    |
| Leaflet.js         | Mappe interattive                    |
| React Toastify     | Notifiche user-friendly              |

### 🛠️ Backend

| Tecnologia         | Descrizione                         |
|--------------------|-------------------------------------|
| Node.js / Express  | API REST                            |
| MongoDB / Mongoose | Database e modellazione dati        |
| JWT Auth           | Autenticazione sicura               |
| Google OAuth       | Login Google                        |
| Cloudinary         | Hosting immagini                    |
| OpenCage API       | Geocodifica per mappa strutture     |

---

## 📦 Setup locale

### 1. Clona il progetto

```bash
git clone https://github.com/fabiomallardo/RoomBooker.git
cd RoomBooker
