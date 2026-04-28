import { getJSON } from './helpers.js';
import { API_URL } from './config.js';

// =====================================================================
// 1. ΤΟ STATE ΤΗΣ ΕΦΑΡΜΟΓΗΣ
// =====================================================================
export const state = {
  mainPools: [],
  bonusPools: [],
};

// =====================================================================
// Συνάρτηση που παράγει τα δίμηνα.
// =====================================================================
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

/* 
// =====================================================================
// Με Promise.all και .map() (Παράλληλη εκτέλεση - Αστραπιαία)
// =====================================================================
// ΣΥΛΛΟΓΗ ΟΛΩΝ ΤΩΝ ΑΡΙΘΜΩΝ ΠΟΥ ΒΓΗΚΑΝ ΑΠΟ ΤΟ ΠΕΔΙΟ 1-45 ΣΤΟ ΕΥΡΟΣ ΕΠΙΛΟΓΗΣ ΗΜΕΡΟΜΗΝΙΑΣ
// =====================================================================
export async function getJokerResult(fromDate, toDate) {
  try {
    const chunks = generateDateChunks(fromDate, toDate);

    // 1. Μετατρέπουμε το κάθε chunk σε "Υπόσχεση" (Promise) για δεδομένα
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
    throw err; // Το πετάμε στον controller για να το διαχειριστεί
  }
}

// =====================================================================
// ΣΥΛΛΟΓΗ ΟΛΩΝ ΤΩΝ ΑΡΙΘΜΩΝ ΠΟΥ ΒΓΗΚΑΝ ΑΠΟ ΤΟ ΠΕΔΙΟ 1-20 ΣΤΟ ΕΥΡΟΣ ΕΠΙΛΟΓΗΣ ΗΜΕΡΟΜΗΝΙΑΣ
// =====================================================================
export async function getJokerBonusResult(fromDate, toDate) {
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
    throw err; // Το πετάμε στον controller για να το διαχειριστεί
  }
}
*/

export async function fetchAllJokerData(fromDate, toDate) {
  try {
    const chunks = generateDateChunks(fromDate, toDate);
    // Φτιάχνουμε τα Promises χρησιμοποιώντας το getJSON
    const fetchPromises = chunks.map((chunk) => {
      return getJSON(
        `${API_URL}/5104/draw-date/${chunk.start}/${chunk.end}?limit=200`,
      );
    });

    // Περιμένουμε να κατέβουν όλα τα δεδομένα
    const resultsArray = await Promise.all(fetchPromises);

    // Εξαγωγή των κυρίων αριθμών και των bonus με μόνο μια κλήση
    const allMainNums = [];
    const allBonusNums = [];
    resultsArray.forEach((data) => {
      if (data.content) {
        data.content.forEach((draw) => {
          // Βάζουμε (push) τα νούμερα κατευθείαν στους τελικούς πίνακες
          allMainNums.push(...draw.winningNumbers.list);
          allBonusNums.push(...draw.winningNumbers.bonus);
        });
      }
    });

    // Επιστρέφουμε ΕΝΑ αντικείμενο που περιέχει και τους 2 πίνακες
    return { main: allMainNums, bonus: allBonusNums };
  } catch (err) {
    throw err;
  }
}

export async function fetchLastDrawData() {
  try {
    const data = await getJSON(`${API_URL}/5104/last-result-and-active`);
    const { last } = data;
    return last;
  } catch (err) {
    throw err;
  }
}

// =====================================================================
// ΕΠΕΞΕΡΓΑΣΙΑ & ΥΠΟΛΟΓΙΣΜΟΙ (BUSINESS LOGIC)
// =====================================================================

// =====================================================================
// Συχνότητα εμφάνισης αριθμών απο 1-45
// =====================================================================
export function processJokerNumbers(numbersArray) {
  let frequencyMainNums = numbersArray.reduce(
    (acc, curr) => {
      acc[curr] += 1;
      return acc;
    },
    // Δημιουργεί απευθείας το {1: 0, 2: 0, ..., 45: 0}
    Object.fromEntries(Array.from({ length: 45 }, (_, i) => [i + 1, 0])),
  );
  return Object.entries(frequencyMainNums).toSorted((a, b) => b[1] - a[1]);
}

// =====================================================================
// Συχνότητα εμφάνισης αριθμών τζοκερ (bonus) (1-20)
// =====================================================================
export function processJokerBonusNumbers(numbersArray) {
  let frequencyBonusNums = numbersArray.reduce(
    (acc, curr) => {
      acc[curr] += 1;
      return acc;
    },
    // Δημιουργεί απευθείας το {1: 0, 2: 0, ..., 45: 0}
    Object.fromEntries(Array.from({ length: 20 }, (_, i) => [i + 1, 0])),
  );
  return Object.entries(frequencyBonusNums).toSorted((a, b) => b[1] - a[1]);
}

// =====================================================================
// Διαχωρισμός συχνοτήτων εμφάνισης σε 3 ομάδες
// =====================================================================
export const splitStoredData = function (sortedNums) {
  const firstGroup = sortedNums.slice(0, 23).map((el) => +el[0]);
  const secondGroup = sortedNums.slice(23, 35).map((el) => +el[0]);
  const thirdGroup = sortedNums.slice(35, 45).map((el) => +el[0]);
  return [firstGroup, secondGroup, thirdGroup];
};

// =====================================================================
// Διαχωρισμός συχνοτήτων εμφάνισης σε 2 ομάδες
// =====================================================================
export const splitStoredBonusData = function (sortedNums) {
  const firstBonusGroup = sortedNums.slice(0, 10).map((el) => +el[0]);
  const secondBonusGroup = sortedNums.slice(10, 20).map((el) => +el[0]);
  return [firstBonusGroup, secondBonusGroup];
};

// =====================================================================
// H ΣΥΓΚΕΚΡΙΜΕΝΗ ΔΕΝ ΕΞΑΓΕΤΑΙ - ΧΡΗΣΙΜΟΠΟΙΕΙΤΑΙ ΜΟΝΟ ΜΕΣΑ ΕΔΩ...
// =====================================================================
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

// =====================================================================
// Διαχωρισμός συχνοτήτων εμφάνισης σε 3 ομάδες.
// Απο την 1η εξάγονται 3 τυχαίοι αριθμοί
// Απο την 2η εξάγεται 1 τυχαίος αριθμός
// Απο την 3η εξάγεται 1 τυχαίος αριθμός
// =====================================================================
export const selectRandomFromGroups = function (group1, group2, group3) {
  const a = getUniqueRandomNumbers(3, group1);
  const b = getUniqueRandomNumbers(1, group2);
  const c = getUniqueRandomNumbers(1, group3);

  const final = [...a, ...b, ...c];
  return final;
};

// =====================================================================
// Διαχωρισμός συχνοτήτων εμφάνισης σε 2 ομάδες.
// Απο την 1η εξάγονται 2τυχαίοι αριθμοί
// Απο την 2η εξάγεται 1 τυχαίος αριθμός
// =====================================================================
export const selectRandomBonusFromGroups = function (group1, group2) {
  const a = getUniqueRandomNumbers(2, group1);
  const b = getUniqueRandomNumbers(1, group2);

  const finalBonus = [...a, ...b];
  return finalBonus;
};
