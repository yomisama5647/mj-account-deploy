/**
 * 记账记录管理
 */
const Records = {
  _list: [],

  init() {
    this._list = Storage.getRecords();
  },

  getAll() {
    return [...this._list].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  },

  add(amount, date) {
    const record = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      amount: Number(amount),
      date: date,
      createdAt: new Date().toISOString(),
    };
    this._list.push(record);
    this._save();
    return record;
  },

  remove(id) {
    this._list = this._list.filter(r => r.id !== id);
    this._save();
  },

  getBalance() {
    return this._list.reduce((sum, r) => sum + r.amount, 0);
  },

  getMonthBalance(monthStr) {
    const prefix = monthStr || this._currentMonth();
    return this._list
      .filter(r => r.date.startsWith(prefix))
      .reduce((sum, r) => sum + r.amount, 0);
  },

  getById(id) {
    return this._list.find(r => r.id === id) || null;
  },

  update(id, amount, date) {
    const record = this._list.find(r => r.id === id);
    if (!record) return false;
    record.amount = Number(amount);
    record.date = date;
    this._save();
    return true;
  },

  _currentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  },

  _save() {
    Storage.setRecords(this._list);
  },
};
