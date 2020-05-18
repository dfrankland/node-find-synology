import findSynology from './index.mjs';

(async () => {
  try {
    const devices = await findSynology();
    console.log('Devices:', devices);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
