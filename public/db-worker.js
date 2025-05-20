let db = null;
const DB_NAME = 'AudioDB';
const STORE_NAME = 'audioChunks';

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => {
      console.error("Error opening IndexedDB in worker");
      reject(request.error);
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

function saveAudioChunk(patientMidUUID, chunk, audioData) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const key = `${patientMidUUID}-${chunk}`;
    const request = store.put(audioData, key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function getAudioChunks(patientMidUUID) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const chunks = [];

    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const key = cursor.key;
        if (key.startsWith(`${patientMidUUID}-`)) {
          chunks.push(cursor.value);
        }
        cursor.continue();
      } else {
        resolve(chunks);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

function getAllPatientMids() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAllKeys();

    request.onsuccess = () => {
      const keys = request.result;
      // Extract unique patient MIDs from keys (format: "patientMid-chunkNumber")
      const patientMids = [...new Set(keys.map(key => {
        const patientMidParts = key.split('-');
        return `${patientMidParts[0]}-${patientMidParts[1]}-${patientMidParts[2]}-${patientMidParts[3]}-${patientMidParts[4]}`;
      }))];
      resolve(patientMids);
    };

    request.onerror = () => reject(request.error);
  });
}

function clearAudioChunks(patientMidUUID) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const key = cursor.key;
        if (key.startsWith(`${patientMidUUID}-`)) {
          cursor.delete();
        }
        cursor.continue();
      } else {
        resolve();
      }
    };

    request.onerror = () => reject(request.error);
  });
}

self.onmessage = async (e) => {
  try {
    switch (e.data.type) {
      case 'init':
        await initDB();
        self.postMessage({ type: 'init', status: 'success' });
        break;

      case 'save':
        const { patientMidUUID, chunk, audioData } = e.data.data;
        await saveAudioChunk(patientMidUUID, chunk, audioData);
        self.postMessage({ type: 'save', status: 'success' });
        break;

      case 'get':
        const chunks = await getAudioChunks(e.data.data.patientMidUUID);
        self.postMessage({ type: 'get', status: 'success', result: chunks });
        break;

      case 'getAllPatientMids':
        const patientMids = await getAllPatientMids();
        self.postMessage({ type: 'getAllPatientMids', status: 'success', result: patientMids });
        break;

      case 'clear':
        await clearAudioChunks(e.data.data.patientMidUUID);
        self.postMessage({ type: 'clear', status: 'success' });
        break;

      default:
        throw new Error('Unknown message type');
    }
  } catch (error) {
    self.postMessage({
      type: e.data.type,
      status: 'error',
      error: error.message
    });
  }
};
