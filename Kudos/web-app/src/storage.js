/**
 * Prefixes localstorage data to maintain multiple stores
 */
export class LocalKVStore {
    constructor(_prefix) {
      this._prefix = _prefix;
    }
  
    /**
     * @async
     * @param key - string of key to return value for
     * @returns Promise
     */
    get(key) {
      const k = this.prefix() + "/" + key;
  
      const data = localStorage.getItem(k);
      if (data === null) {
        return Promise.resolve(undefined);
      }
      return Promise.resolve(JSON.parse(data));
    }
  
    /**
     * @async
     * @param key - key
     * @param data - value
     * @returns Promise
     */
    set(key, data) {
      const k = this.prefix() + "/" + key;
  
      if (data === null) {
        return Promise.resolve(localStorage.removeItem(k));
      }
  
      return Promise.resolve(localStorage.setItem(k, JSON.stringify(data)));
    }
  
    prefix() {
      return this._prefix;
    }
  }
  
  /**
   * Simple implementation of store methods using LocalKVStore.
   * Could be implemented for other browser storage options as well.
   */
  export class Store {
    constructor(storeKey, prefix) {
      this.storeKey = storeKey;
      this.kvStore = new LocalKVStore(prefix);
    }
  
    async add(key, data) {
      const store = (await this.kvStore.get(this.storeKey)) || {};
      store[key] = data;
      await this.kvStore.set(this.storeKey, store);
    }
  
    async remove(key) {
      const store = await this.kvStore.get(this.storeKey);
      if (store && store[key]) {
        delete store[key];
        await this.kvStore.set(this.storeKey, store);
      }
    }
  
    async get(key) {
      const store = await this.kvStore.get(this.storeKey);
      if (store) {
        return store[key];
      }
    }
  
    async getAll() {
      const store = await this.kvStore.get(this.storeKey);
      const records = [];
      for (const key in store) {
        records.push(store[key]);
      }
      return records;
    }
  
    async reset() {
      await this.kvStore.set(this.storeKey, {});
    }
  
    async clear() {
      await this.kvStore.set(this.storeKey, null);
    }
  }