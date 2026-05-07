import icons from 'url:../../img/icons.svg'; // parcel 2

class LastdrawView {
  // Επιλογή στοιχείων DOM
  _parentElement = document.querySelector('.second');

  renderSpinner() {
    this._parentElement.innerHTML = '';
    const markup = ` 
            <div class="spinner">
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 150'>
                <path fill='none' stroke='rgb(80, 80, 80)' stroke-width='20' stroke-linecap='round' stroke-dasharray='300 385' stroke-dashoffset='0' d='M275 75c0 31-27 50-50 50-58 0-92-100-150-100-28 0-50 22-50 50s23 50 50 50c58 0 92-100 150-100 24 0 50 19 50 50Z'>
                  <animate attributeName='stroke-dashoffset' calcMode='spline' dur='3' values='685;-685' keySplines='0 0 1 1' repeatCount='indefinite'></animate>
                </path>
              </svg>
            </div>
      `;
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
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
