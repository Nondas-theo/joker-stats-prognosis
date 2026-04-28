import Chart from 'chart.js/auto';

class ChartView {
  // Επιλέγουμε τους "καμβάδες"
  _mainCanvas = document.getElementById('mainNumsChart');
  _bonusCanvas = document.getElementById('jokerNumsChart');

  // Εδώ θα αποθηκεύουμε το "ζωντανό" γράφημα για να μπορούμε να το καταστρέψουμε
  _mainChart;
  _bonusChart;

  renderCharts(mainData, bonusData) {
    // 1. Προετοιμασία Δεδομένων
    // Το mainData έρχεται ως [['17', 50], ['23', 48], ...]
    // Το Chart.js όμως θέλει ξεχωριστά τα labels (['17', '23']) και ξεχωριστά τα data ([50, 48])
    // Χρησιμοποιούμε τη μέθοδο map() για να τα χωρίσουμε!
    const mainLabels = mainData.map((item) => item[0]); // Ο αριθμός
    const mainFrequencies = mainData.map((item) => item[1]); // Η συχνότητα

    const bonusLabels = bonusData.map((item) => item[0]);
    const bonusFrequencies = bonusData.map((item) => item[1]);

    // 2. Καταστροφή παλιών γραφημάτων (αν υπάρχουν)
    if (this._mainChart) this._mainChart.destroy();
    if (this._bonusChart) this._bonusChart.destroy();

    // 3. Δημιουργία Γραφήματος Κύριων Αριθμών
    this._mainChart = new Chart(this._mainCanvas, {
      type: 'bar', // Θέλουμε μπάρες
      data: {
        labels: mainLabels, // Ο άξονας Χ
        datasets: [
          {
            label: 'Φορές που κληρώθηκε',
            data: mainFrequencies, // Ο άξονας Y
            backgroundColor: 'rgba(10, 72, 130, 0.8)', // Το μπλε σου χρώμα
            borderRadius: 4, // Κάνει τις μπάρες λίγο στρογγυλεμένες πάνω
          },
        ],
      },
      options: {
        // Προαιρετικό: κρύβουμε το μεγάλο υπόμνημα (legend) για πιο καθαρό look
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            // ticks: { autoSkip: false, maxRotation: 90, minRotation: 90 },
          },
        },
      },
    });

    // 4. Δημιουργία Γραφήματος Bonus Αριθμών
    this._bonusChart = new Chart(this._bonusCanvas, {
      type: 'bar',
      data: {
        labels: bonusLabels,
        datasets: [
          {
            label: 'Φορές που κληρώθηκε (Τζόκερ)',
            data: bonusFrequencies,
            backgroundColor: 'rgba(255, 165, 0, 0.8)', // Ένα πορτοκαλί/χρυσό
            borderRadius: 4,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false } } },
      },
    });
  }
}

export default new ChartView();
