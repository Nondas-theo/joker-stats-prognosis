import icons from 'url:../../img/icons.svg'; // parcel 2

class LastdrawView {
  // Επιλογή στοιχείων DOM
  _parentElement = document.querySelector('.second');

  renderSpinner() {
    // this.clearMessages();
    const markup = ` 
            <div class="spinner">
              <svg>
                <use href="${icons}#icon-spinner"></use>
              </svg>
            </div>
      `;
    this._parentElement.insertAdjacentHTML('beforeend', markup);
  }

  _clearSpinner() {
    const spinner = this._parentElement.querySelector('.spinner');
    if (spinner) spinner.remove();
  }

  renderLastDraw(draws) {
    const resultsArr = [
      ...draws.winningNumbers.list,
      ...draws.winningNumbers.bonus,
    ];
    const results = resultsArr.map((num) => `<li>${num}</li>`).join('');
    const dateOfDraw = new Date(draws.drawTime).toLocaleDateString('el-GR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const html = `
        <hr />
          <h3 class="last_draw">Αποτέλεσμα Κλήρωσης\n 
          <span>${draws.drawId}</span></h3>
          <p class="last_draw">${dateOfDraw}</p>
          <ul class="numbers_last_draw">
            ${results}
          </ul>
        
`;
    this._parentElement.insertAdjacentHTML('beforeend', html);
  }

  addHandlerLoad(handler) {
    window.addEventListener('load', handler);
  }
}

export default new LastdrawView();
