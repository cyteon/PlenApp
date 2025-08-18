import { load, Store } from '@tauri-apps/plugin-store';

const storePromise: Promise<Store> = load("store.json", { autoSave: true });
export default storePromise;