/**
 * 数据存储层
 * 当前版本使用浏览器 localStorage，本地保存每个设备上的账本数据。
 */
const Storage = {
  _prefix: 'mj_',

  _key(name) {
    return this._prefix + name;
  },

  getNickname() {
    return localStorage.getItem(this._key('nickname'));
  },

  setNickname(name) {
    localStorage.setItem(this._key('nickname'), name);
  },

  getRecords() {
    const raw = localStorage.getItem(this._key('records'));
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  setRecords(records) {
    localStorage.setItem(this._key('records'), JSON.stringify(records));
  },
};
