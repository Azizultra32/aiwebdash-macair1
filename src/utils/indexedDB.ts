let dbWorker: Worker | null = null;

/**
 * Ensure that the database worker has been initialized.
 *
 * @throws {Error} if the worker is not initialized
 */
const ensureWorker = (): Worker => {
  if (!dbWorker) {
    throw new Error('Database worker not initialized');
  }
  return dbWorker;
};

export const initIndexedDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      dbWorker = new Worker('/db-worker.js');
      
      dbWorker.onmessage = (e) => {
        if (e.data.type === 'init') {
          if (e.data.status === 'success') {
            resolve();
          } else {
            reject(new Error(e.data.error));
          }
        }
      };

      dbWorker.postMessage({ type: 'init' });
    } catch (error) {
      reject(error);
    }
  });
};

export const saveAudioChunk = (patientMidUUID: string, chunk: number, blob: Blob): Promise<void> => {
  return new Promise((resolve, reject) => {
    const worker = ensureWorker();

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;

      worker.onmessage = (e) => {
        if (e.data.type === 'save') {
          if (e.data.status === 'success') {
            resolve();
          } else {
            reject(new Error(e.data.error));
          }
        }
      };

      worker.postMessage({
        type: 'save',
        data: { patientMidUUID, chunk, audioData: base64data }
      });
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
};

export const getAudioChunks = (patientMidUUID: string): Promise<Blob[]> => {
  return new Promise((resolve, reject) => {
    const worker = ensureWorker();

    worker.onmessage = (e) => {
      if (e.data.type === 'get') {
        if (e.data.status === 'success') {
          const blobs = e.data.result.map((base64Data: string) => {
            const [, data] = base64Data.split(',');
            return new Blob(
              [Uint8Array.from(atob(data), c => c.charCodeAt(0))],
              { type: 'audio/mp3' }
            );
          });
          resolve(blobs);
        } else {
          reject(new Error(e.data.error));
        }
      }
    };

    worker.postMessage({
      type: 'get',
      data: { patientMidUUID }
    });
  });
};

export const getAllPatientMids = (): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const worker = ensureWorker();

    worker.onmessage = (e) => {
      if (e.data.type === 'getAllPatientMids') {
        if (e.data.status === 'success') {
          resolve(e.data.result);
        } else {
          reject(new Error(e.data.error));
        }
      }
    };

    worker.postMessage({
      type: 'getAllPatientMids'
    });
  });
};

export const clearAudioChunks = (patientMidUUID: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const worker = ensureWorker();

    worker.onmessage = (e) => {
      if (e.data.type === 'clear') {
        if (e.data.status === 'success') {
          resolve();
        } else {
          reject(new Error(e.data.error));
        }
      }
    };

    worker.postMessage({
      type: 'clear',
      data: { patientMidUUID }
    });
  });
};

export const closeIndexedDB = () => {
  if (dbWorker) {
    dbWorker.terminate();
    dbWorker = null;
  }
};
