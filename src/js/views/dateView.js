import icons from 'url:../../img/icons.svg'; // parcel 2
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import 'flatpickr/dist/themes/dark.css';
// Εισαγωγή της Ελληνικής γλώσσας
import { Greek } from 'flatpickr/dist/l10n/gr.js';

class DateView {
  // Επιλογή στοιχείων DOM
  _parentElement = document.querySelector('.range_date');
  _dateFromInput = document.querySelector('#date-from');
  _dateToInput = document.querySelector('#date-to');

  _fpFrom;
  _fpTo;

  constructor() {
    this._initFlatpickr();
  }

  _initFlatpickr() {
    // Φτιάχνουμε ένα αντικείμενο με τις ρυθμίσεις που είναι ίδιες και για τα 2
    const commonOptions = {
      altInput: true,
      altFormat: 'd-m-Y',
      dateFormat: 'Y-m-d',
      maxDate: 'today',
      locale: Greek,
    };

    // 1. Αρχικοποιούμε το "Από"
    this._fpFrom = flatpickr(this._dateFromInput, {
      ...commonOptions,
      onChange: (selectedDates, dateStr) => {
        // Όταν ο χρήστης διαλέγει το "Από", λέμε στο "Έως" ότι δεν μπορεί
        // να επιλέξει ημερομηνία ΠΡΙΝ από αυτήν που μόλις διαλέξαμε!
        if (this._fpTo) {
          this._fpTo.set('minDate', dateStr);
        }
      },
    });

    // 2. Αρχικοποιούμε το "Έως"
    this._fpTo = flatpickr(this._dateToInput, {
      ...commonOptions,
      onChange: (selectedDates, dateStr) => {
        // Αντίστοιχα, όταν διαλέγει το "Έως", το "Από" δεν μπορεί να πάει πιο μετά!
        if (this._fpFrom) {
          this._fpFrom.set('maxDate', dateStr);
        }
      },
    });
  }

  // Διάβασμα ημερομηνιών απο την φόρμα
  getDates() {
    // Παίρνουμε τις ημερομηνίες με απόλυτη ασφάλεια κατευθείαν από τα objects
    const fromDate = this._fpFrom.selectedDates[0];
    const toDate = this._fpTo.selectedDates[0];

    // Αν κάποιο από τα δύο είναι άδειο, επιστρέφουμε κενά strings
    if (!fromDate || !toDate) {
      return { fromVal: '', toVal: '' };
    }

    // Τα μορφοποιούμε καθαρά σε Y-m-d
    return {
      fromVal: this._fpFrom.formatDate(fromDate, 'Y-m-d'),
      toVal: this._fpTo.formatDate(toDate, 'Y-m-d'),
    };
  }

  // --- ΝΕΕΣ ΜΕΘΟΔΟΙ ΓΙΑ UI FEEDBACK ---
  _clearSpinner() {
    const spinner = this._parentElement
      .closest('.left--side')
      .querySelector('.spinner');
    if (spinner) spinner.remove();
  }

  renderSpinner() {
    this.clearMessages();
    const markup = ` 
            <div class="spinner">
              <svg>
                <use href="${icons}#icon-spinner"></use>
              </svg>
            </div>
      `;
    this._parentElement
      .closest('.left--side')
      .insertAdjacentHTML('beforeend', markup);
  }

  renderError(message) {
    const markup = `<p class="error-message">💥 ${message}</p>`;
    this.clearMessages();
    this._parentElement
      .closest('.left--side')
      .insertAdjacentHTML('beforeend', markup);
  }

  clearMessages() {
    // Σβήνει το error αν υπάρχει
    const error = this._parentElement
      .closest('.left--side')
      .querySelector('.error-message');
    if (error) error.remove();
  }
  // ---------------------------------------------------------

  // Publisher-Subscriber Pattern: Το View "ακούει" το κλικ
  // και καλεί τη συνάρτηση (handler) που θα του δώσει ο Controller!
  addHandlerSearch(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      /* console.log('Το submit δούλεψε!'); //check submit */
      handler();
    });
  }
}

export default new DateView();
