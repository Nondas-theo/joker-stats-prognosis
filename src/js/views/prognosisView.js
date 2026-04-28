class PrognosisView {
  // Επιλογή στοιχείων DOM
  _btnPrognosis = document.querySelector('.give_prognosis');
  _btnNewPrognosis = document.querySelector('.new_prognosi');
  _closeModalBtn = document.querySelector('.close-modal');
  _modal = document.querySelector('.modal');
  _prognosisContainer = document.querySelector('.prognosis');

  _mainNumbersContainer = document.querySelector('.main-numbers');
  _bonusNumbersContainer = document.querySelector('.bonus-numbers');

  constructor() {
    // Το κλείσιμο του modal αφορά αποκλειστικά το UI (δεν χρειάζεται δεδομένα)
    // Άρα το διαχειριζόμαστε κατευθείαν εδώ, χωρίς να ενοχλούμε τον Controller!
    // Ωστε η εφαρμογή να αρχίσει να "ακούει" με το που φορτώσει
    this._closeModalBtn.addEventListener('click', this.closeModal.bind(this));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }

  showPrognosisButton() {
    this._btnPrognosis.classList.remove('none');
  }

  openModal() {
    this._modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Κρύβει την μπάρα κύλισης και "κλειδώνει" τη σελίδα

    setTimeout(() => {
      this._prognosisContainer.focus(); // Δίνει focus στο container με την πρόγνωση για να ενεργοποιηθεί το scroll με τα βελάκια
    }, 100); // Μικρή καθυστέρηση για να διασφαλίσουμε ότι το modal είναι ορατό πριν δοθεί το focus
  }

  closeModal() {
    this._modal.classList.add('hidden');
    this._btnPrognosis.blur(); // Αφαιρεί το focus απο το button
    document.body.style.overflow = ''; // Επαναφέρει το scroll στην κανονική του κατάσταση
  }

  renderNumsPrognosis(main, bonus) {
    const htmlMain = main.map((num) => `<li>${num}</li>`).join('');
    const htmlBonus = bonus.map((num) => `<li>${num}</li>`).join('');
    this._mainNumbersContainer.innerHTML = htmlMain;
    this._bonusNumbersContainer.innerHTML = htmlBonus;
  }

  // Publisher-Subscriber: Ακούμε και τα 2 κουμπιά πρόγνωσης
  // (και το κεντρικό, και αυτό μέσα στο modal για τη "Νέα Πρόγνωση")
  addHandlerGenerate(handler) {
    this._btnPrognosis.addEventListener('click', handler);
    this._btnNewPrognosis.addEventListener('click', handler);
  }
}

export default new PrognosisView();
