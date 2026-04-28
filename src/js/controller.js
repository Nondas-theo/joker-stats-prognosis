import * as model from './model.js'; // Φέρνουμε ΟΛΟ το model
import dateView from './views/dateView.js'; // Φέρνουμε το View
import prognosisView from './views/prognosisView.js';
import chartView from './views/chartView.js';
import lastdrawView from './views/lastdrawView.js';

// console.log('Ο Controller φορτώθηκε!😊😊😊');

const controlLastDraw = async function () {
  lastdrawView.renderSpinner();
  const data = await model.fetchLastDrawData();
  // console.log(data);
  lastdrawView.renderLastDraw(data);
  lastdrawView._clearSpinner();
};

const controlSearchResults = async function () {
  try {
    // Παίρνουμε απο το View τις ημερομηνίες
    const { fromVal, toVal } = dateView.getDates();

    // DEBUG: για να δούμε τι στέλνει το Flatpickr!
    // console.log('Ημερομηνίες που πάνε στο API:', fromVal, toVal);

    // 1. Έλεγχος κενών πεδίων
    if (!fromVal || !toVal) {
      dateView.renderError('Παρακαλώ συμπληρώστε και τις δύο ημερομηνίες.');
      return;
    }
    // console.log(`Έναρξη αναζήτησης από ${fromVal} έως ${toVal}...`);

    // 2. Εμφάνιση Spinner ΠΡΙΝ το API call
    dateView.renderSpinner();

    // 3. Ζητάμε από το Model να κατεβάσει τα δεδομένα (API calls)
    const { main: fetchedNums, bonus: fetchedBonusNums } =
      await model.fetchAllJokerData(fromVal, toVal);

    // 4. Ζητάμε από το Model να κάνει την ανάλυση και να αποθηκεύσει στο State του
    let finalStoredData = [];
    let finalStoredBonusData = [];

    if (fetchedNums.length > 0) {
      finalStoredData = model.processJokerNumbers(fetchedNums);
      model.state.mainPools = model.splitStoredData(finalStoredData);
    }

    if (fetchedBonusNums.length > 0) {
      finalStoredBonusData = model.processJokerBonusNumbers(fetchedBonusNums);
      model.state.bonusPools = model.splitStoredBonusData(finalStoredBonusData);
    }

    // console.log('Επιτυχία! Το State ενημερώθηκε:', model.state);

    // 5. Εμφάνιση γραφημάτων
    // Αν έχουμε δεδομένα, τα στέλνουμε στο chartView!
    if (finalStoredData.length > 0 || finalStoredBonusData.length > 0) {
      const finalStoredDataSorted = finalStoredData.toSorted(
        (a, b) => a[0] - b[0],
      );
      const finalStoredBonusDataSorted = finalStoredBonusData.toSorted(
        (a, b) => a[0] - b[0],
      );
      chartView.renderCharts(finalStoredDataSorted, finalStoredBonusDataSorted);
    }
    // --------------------------------

    // 6. Λέμε στο View να εμφανίσει το κουμπί
    prognosisView.showPrognosisButton();
    dateView._clearSpinner();
  } catch (err) {
    console.error('Σφάλμα στον Controller:', err);
    dateView.renderError('Πρόβλημα σύνδεσης. Δοκιμάστε ξανά αργότερα.');
  }
};

const controlPrognosis = function () {
  let finalProgno = [];
  let finalBonus = [];
  // 1. Παράγουμε τους αριθμούς ζητώντας τους από το Model
  // Έλεγχος αν υπάρχουν δεδομένα στους κύριους αριθμούς
  if (model.state.mainPools.length > 0) {
    // Βγάζουμε τα 3 pool από το State
    const [poolA, poolB, poolC] = model.state.mainPools;
    // ΠΡΟΣΟΧΗ Βάζουμε τα [...] για να περάσουμε τα αντίγραφα του poolA κ.ο.κ διότι την πρώτη φορά που θα πατηθεί το "Πρόγνωση" θα δουλέψει τέλεια. Αν κλείσουμε το Modal και πατηθεί ξανά  το "Πρόγνωση" πιθανότατα θα μας βγάλει error ή άδεια αποτελέσματα, επειδή το poolA άδειασε από την πρώτη κλήση (λόγω της splice() που έχουμε μέσα).
    finalProgno = model.selectRandomFromGroups(
      [...poolA],
      [...poolB],
      [...poolC],
    );
  }
  // Έλεγχος αν υπάρχουν δεδομένα στους αριθμούς Τζόκερ
  if (model.state.bonusPools.length > 0) {
    const [poolA, poolB] = model.state.bonusPools;
    finalBonus = model.selectRandomBonusFromGroups([...poolA], [...poolB]);
  }

  // 2. Στέλνουμε τους παραγόμενους αριθμούς στο View για να τους τυπώσει
  prognosisView.renderNumsPrognosis(finalProgno, finalBonus);
  // 3. Ανοίγουμε το Modal
  prognosisView.openModal();
};

// =====================================================================
// Συνάρτηση ΑΡΧΙΚΟΠΟΙΗΣΗΣ
// =====================================================================
const init = function () {
  dateView.addHandlerSearch(controlSearchResults);
  prognosisView.addHandlerGenerate(controlPrognosis);
  lastdrawView.addHandlerLoad(controlLastDraw);
};

init();
