const dateFrom = document.querySelector('input[name = from]');
const dateTo = document.querySelector('input[name = to]');
const btnDateRange = document.querySelector('.submit--date');
const btnPrognosis = document.querySelector('.give_prognosis');
const btnNewPrognosis = document.querySelector('.new_prognosi');
const modal = document.querySelector('.modal');
const closeModal = document.querySelector('.close-modal');

const appState = {
  mainPools: [],
  bonusPools: [],
};

// ==========================================================================
// ==========================================================================
btnDateRange.addEventListener('click', async () => {
  try {
    const fromVal = dateFrom.value;
    const toVal = dateTo.value;

    if (!fromVal || !toVal) {
      alert('Παρακαλώ συμπληρώστε και τις δύο ημερομηνίες.');
      return;
    }

    const fetchedNums = await getJokerResult(fromVal, toVal);
    const fetchedBonusNums = await getJokerBonusResult(fromVal, toVal);

    if (fetchedNums.length > 0) {
      const finalStoredData = processJokerNumbers(fetchedNums);
      appState.mainPools = splitStoredData(finalStoredData);
    }

    if (fetchedBonusNums.length > 0) {
      const finalStoredBonusData = processJokerBonusNumbers(fetchedBonusNums);
      appState.bonusPools = splitStoredBonusData(finalStoredBonusData);
    }

    console.log(appState);
    btnPrognosis.classList.remove('hidden');
  } catch (err) {
    console.log(err);
  }
});

// ==========================================================================
// ==========================================================================
// Callback (handler fumction) for prognosis AND new prognosis buttons
const handlerForPrognosis = function () {
  let finalProgno = [];
  let finalBonus = [];

  // Έλεγχος αν υπάρχουν δεδομένα στους κύριους αριθμούς
  if (appState.mainPools.length > 0) {
    // Βγάζουμε τα 3 pool από το State
    const [poolA, poolB, poolC] = appState.mainPools;
    // ΠΡΟΣΟΧΗ Βάζουμε τα [...] για να περάσουμε τα αντίγραφα του poolA κ.ο.κ διότι την πρώτη φορά που θα πατηθεί το "Πρόγνωση" θα δουλέψει τέλεια. Αν κλείσουμε το Modal και πατηθεί ξανά  το "Πρόγνωση" πιθανότατα θα μας βγάλει error ή άδεια αποτελέσματα, επειδή το poolA άδειασε από την πρώτη κλήση (λόγω της splice() που έχουμε μέσα).
    finalProgno = selectRandomFromGroups([...poolA], [...poolB], [...poolC]);
  }

  // Έλεγχος αν υπάρχουν δεδομένα στους αριθμούς Τζόκερ
  if (appState.bonusPools.length > 0) {
    const [poolA, poolB] = appState.bonusPools;
    finalBonus = selectRandomBonusFromGroups([...poolA], [...poolB]);
  }

  renderNumsPrognosis(finalProgno, finalBonus);
  modal.classList.remove('hidden');
};

btnPrognosis.addEventListener('click', handlerForPrognosis);
btnNewPrognosis.addEventListener('click', handlerForPrognosis);

// ==========================================================================
// ==========================================================================
closeModal.addEventListener('click', (e) => {
  modal.classList.add('hidden');
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') modal.classList.add('hidden');
});

//////////////////////////////////////////////////////////////////
// Πρώτα φτιάχνουμε μια απλή συνάρτηση που το μόνο που κάνει είναι να παράγει τα δίμηνα.
function generateDateChunks(fromDate, toDate) {
  const chunks = [];
  let currentStart = new Date(fromDate);
  const finalEnd = new Date(toDate);

  while (currentStart <= finalEnd) {
    let currentEnd = new Date(currentStart);
    currentEnd.setMonth(currentEnd.getMonth() + 2);
    if (currentEnd > finalEnd) currentEnd = finalEnd;

    chunks.push({
      start: currentStart.toISOString().split('T')[0],
      end: currentEnd.toISOString().split('T')[0],
    });

    currentStart = new Date(currentEnd);
    currentStart.setDate(currentStart.getDate() + 1);
  }

  return chunks; // Επιστρέφει ένα Array: [ {start: '2023-01-01', end: '2023-03-01'}, ... ]
}

////////////////////////////////////////////////////////////////
// Με Promise.all και .map() (Παράλληλη εκτέλεση - Αστραπιαία)
// ΣΥΛΛΟΓΗ ΟΛΩΝ ΤΩΝ ΑΡΙΘΜΩΝ ΠΟΥ ΒΓΗΚΑΝ ΑΠΟ ΤΟ ΠΕΔΙΟ 1-45 ΣΤΟ ΕΥΡΟΣ ΕΠΙΛΟΓΗΣ ΗΜΕΡΟΜΗΝΙΑΣ
async function getJokerResult(fromDate, toDate) {
  try {
    const chunks = generateDateChunks(fromDate, toDate);

    // 1. Μετατρέπουμε το κάθε chunk σε ένα "Υπόσχεση" (Promise) για δεδομένα
    const fetchPromises = chunks.map(async (chunk) => {
      const response = await fetch(
        `https://api.opap.gr/draws/v3.0/5104/draw-date/${chunk.start}/${chunk.end}?limit=200`,
      );
      if (!response.ok)
        throw new Error(
          '💥💥💥 Πρόβλημα στην άντληση δεδομένων απο τον διακομιστή, προσπάθησε ξανά!',
        );
      const data = await response.json();

      return data.content
        ? data.content.map((el) => el.winningNumbers.list).flat()
        : [];
    });

    // 2. Περιμένουμε να ολοκληρωθούν ΟΛΑ τα παράλληλα requests
    const resultsArray = await Promise.all(fetchPromises);
    // Το resultsArray είναι ένα Array από Arrays. Τα "ισιώνουμε" όλα μαζί.
    return resultsArray.flat();
  } catch (err) {
    console.log(err);
  }
}

// ΣΥΛΛΟΓΗ ΟΛΩΝ ΤΩΝ ΑΡΙΘΜΩΝ ΠΟΥ ΒΓΗΚΑΝ ΑΠΟ ΤΟ ΠΕΔΙΟ 1-20 ΣΤΟ ΕΥΡΟΣ ΕΠΙΛΟΓΗΣ ΗΜΕΡΟΜΗΝΙΑΣ
async function getJokerBonusResult(fromDate, toDate) {
  try {
    const chunks = generateDateChunks(fromDate, toDate);

    // 1. Μετατρέπουμε το κάθε chunk σε ένα "Υπόσχεση" (Promise) για δεδομένα
    const fetchPromises = chunks.map(async (chunk) => {
      const response = await fetch(
        `https://api.opap.gr/draws/v3.0/5104/draw-date/${chunk.start}/${chunk.end}?limit=200`,
      );
      if (!response.ok)
        throw new Error(
          '💥💥💥 Πρόβλημα στην άντληση δεδομένων απο τον διακομιστή, προσπάθησε ξανά!',
        );
      const data = await response.json();

      return data.content
        ? data.content.map((el) => el.winningNumbers.bonus).flat()
        : [];
    });

    // 2. Περιμένουμε να ολοκληρωθούν ΟΛΑ τα παράλληλα requests
    const resultsBonusArray = await Promise.all(fetchPromises);
    // Το resultsArray είναι ένα Array από Arrays. Τα "ισιώνουμε" όλα μαζί.
    return resultsBonusArray.flat();
  } catch (err) {
    console.log(err);
  }
}

////////////////////////////////////////////////
// Συχνότητα εμφάνισης αριθμών απο 1-45
function processJokerNumbers(numbersArray) {
  // console.log('Επιτυχία! Τα νούμερα είναι:', numbersArray);
  // Συχνότητα εμφάνισης των αριθμών απο το 1-45
  let frequencyMainNums = numbersArray.reduce(
    (acc, curr) => {
      acc[curr] += 1;
      return acc;
    },
    // Δημιουργεί απευθείας το {1: 0, 2: 0, ..., 45: 0}
    Object.fromEntries(Array.from({ length: 45 }, (_, i) => [i + 1, 0])),
  );
  console.log(frequencyMainNums);
  const frequencyMainNumsArr = Object.entries(frequencyMainNums);
  // console.log(frequencyMainNumsArr);
  const frequencyArrSorted = frequencyMainNumsArr.toSorted(
    (a, b) => b[1] - a[1],
  );
  // console.log(frequencyArrSorted);

  return frequencyArrSorted;
}

// Συχνότητα εμφάνισης αριθμών τζοκερ (bonus) (1-20)
function processJokerBonusNumbers(numbersArray) {
  // console.log('Επιτυχία! Τα νούμερα είναι:', numbersArray);
  // Συχνότητα εμφάνισης των αριθμών απο το 1-20
  let frequencyBonusNums = numbersArray.reduce(
    (acc, curr) => {
      acc[curr] += 1;
      return acc;
    },
    // Δημιουργεί απευθείας το {1: 0, 2: 0, ..., 45: 0}
    Object.fromEntries(Array.from({ length: 20 }, (_, i) => [i + 1, 0])),
  );

  const frequencyBonusNumsArr = Object.entries(frequencyBonusNums);
  // console.log(frequencyMainNumsArr);
  const frequencyArrBonusSorted = frequencyBonusNumsArr.toSorted(
    (a, b) => b[1] - a[1],
  );
  // console.log(frequencyArrBonusSorted);

  return frequencyArrBonusSorted;
}

///////////////////////////////////////////////////////////////////////////////////
const splitStoredData = function (sortedNums) {
  const firstGroup = sortedNums.slice(0, 23).map((el) => +el[0]);
  const secondGroup = sortedNums.slice(23, 35).map((el) => +el[0]);
  const thirdGroup = sortedNums.slice(35, 45).map((el) => +el[0]);
  return [firstGroup, secondGroup, thirdGroup];
};

const splitStoredBonusData = function (sortedNums) {
  const firstBonusGroup = sortedNums.slice(0, 10).map((el) => +el[0]);
  const secondBonusGroup = sortedNums.slice(10, 20).map((el) => +el[0]);
  return [firstBonusGroup, secondBonusGroup];
};

////////////////////////////////////////////////////////////////////////////////////////////
const getUniqueRandomNumbers = function (count, pool) {
  if (pool.length < count) return [];
  const selected = [];
  while (selected.length < count) {
    const randIndex = Math.floor(Math.random() * pool.length);
    const [num] = pool.splice(randIndex, 1);
    selected.push(num);
  }
  return selected;
};

const selectRandomFromGroups = function (group1, group2, group3) {
  // console.log(group1, group2, group3);
  const a = getUniqueRandomNumbers(3, group1);
  const b = getUniqueRandomNumbers(1, group2);
  const c = getUniqueRandomNumbers(1, group3);
  // console.log(a, b, c);

  // const final = [...a, ...b, ...c].sort((a, b) => a - b);
  const final = [...a, ...b, ...c];
  console.log(final);
  return final;
};

const selectRandomBonusFromGroups = function (group1, group2) {
  // console.log(group1, group2, group3);
  const a = getUniqueRandomNumbers(2, group1);
  const b = getUniqueRandomNumbers(1, group2);

  // const finalBonus = [...a, ...b].sort((a, b) => a - b);
  const finalBonus = [...a, ...b];
  console.log(finalBonus);
  return finalBonus;
};

// ==========================================================================
// ==========================================================================
const renderNumsPrognosis = function (main, bonus) {
  const htmlMain = main.map((num) => `<li>${num}</li>`).join('');
  const htmlBonus = bonus.map((num) => `<li>${num}</li>`).join('');
  document.querySelector('.main-numbers').innerHTML = htmlMain;
  document.querySelector('.bonus-numbers').innerHTML = htmlBonus;
};
