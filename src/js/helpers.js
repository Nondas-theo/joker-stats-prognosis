import { TIMEOUT_SEC } from './config.js';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(
        new Error(
          `Το αίτημα πήρε πάρα πολύ χρόνο! Έληξε μετά από ${s} δευτερόλεπτα`,
        ),
      );
    }, s * 1000);
  });
};

export const getJSON = async function (url) {
  try {
    const res = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`💥 Πρόβλημα στην άντληση δεδομένων (${res.status})`);
    }
    return data;
  } catch (err) {
    throw err;
  }
};
