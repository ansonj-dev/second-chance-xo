import { initializeWallet } from './wallet.js';
try { await initializeWallet(); } catch (error) {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
  console.error(code === 'EEXIST' ? 'A local Chipnet wallet already exists. It was preserved. Use a separate project copy for a fresh wallet.' : error instanceof Error && !code ? error.message : 'Wallet creation failed. Check private-folder permissions.');
  process.exitCode = 1;
}
