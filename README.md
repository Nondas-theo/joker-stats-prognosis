# Joker Analytics & Prognosis Tool

Μια σύγχρονη Web εφαρμογή για την ανάλυση στατιστικών στοιχείων του Τζόκερ (Allwyn) και την παραγωγή τυχαίων προγνώσεων βασισμένων στη συχνότητα εμφάνισης των αριθμών.

## LIVE DEMO

live project on Netlify (https://joker-pro-stats.netlify.app)

## Χαρακτηριστικά

- **MVC Architecture:** Αυστηρός διαχωρισμός ευθυνών (Model-View-Controller) για εύκολη συντήρηση και επέκταση.
- **Real-time API Integration:** Άντληση δεδομένων σε πραγματικό χρόνο από το επίσημο API του ALLWYN.
- **Modular Design:** Πλήρης διαχείριση εξαρτήσεων μέσω NPM και bundling με Parcel.
- **Smart Date Splitting:** Αλγόριθμος που "σπάει" μεγάλα διαστήματα ημερομηνιών σε μικρότερα chunks για την παράκαμψη των ορίων του API.
- **Interactive Charts:** Οπτικοποίηση συχνότητας αριθμών με δυναμικά γραφήματα.
- **Smart Prognosis:** Παραγωγή τυχαίων αριθμών με βάση τη στατιστική βαρύτητα (High/Medium/Low frequency) των αποτελεσμάτων.
- **Professional UI:** Χρήση σύγχρονων εργαλείων για επιλογή ημερομηνιών και focus management για προσβασιμότητα (A11y).

## Τεχνολογίες & Πακέτα

Η εφαρμογή είναι χτισμένη με **Vanilla JavaScript (ES6+)** και η διαχείριση των πακέτων γίνεται μέσω **NPM**:

- **[Parcel](https://parceljs.org/):** Build tool για το bundling και τη βελτιστοποίηση του κώδικα.
- **[Chart.js](https://www.chartjs.org/):** Εγκατάσταση μέσω NPM για τη δημιουργία των στατιστικών γραφημάτων.
- **[Flatpickr](https://flatpickr.js.org/):** Εγκατάσταση μέσω NPM για την επιλογή ημερομηνιών με υποστήριξη ελληνικής γλώσσας.

## Εγκατάσταση & Εκτέλεση

Για να τρέξετε το project τοπικά, ακολουθήστε τα παρακάτω βήματα:
**Κλωνοποίηση του repository:**
git clone [https://github.com/Nondas-theo/joker_mine.git](https://github.com/Nondas-theo/joker_mine.git)

---

Εγκατάσταση των dependencies:
npm install

---

Εκκίνηση του development server:
npm start

---

Build για παραγωγή (Netlify/Vercel):
npm run build

---

Δομή Αρχείων
src/js/controller.js: Η "καρδιά" της εφαρμογής που συνδέει το Model με τα Views.
src/js/model.js: Διαχείριση δεδομένων και API calls.
src/js/views/: Φάκελος με όλα τα UI components (Charts, Dates, Modals, Last Draw).
src/js/helpers.js: Βοηθητικές συναρτήσεις (AJAX, Timeouts).
src/js/config.js: Ρυθμίσεις εφαρμογής (API URLs, Constants).

---

Δημιουργός: Επαμεινώνδας Θεοφανίδης
GitHub: @Nondas-theo
Email: nodas.theofanidis@gmail.com
