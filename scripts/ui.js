/**
 * UI 渲染与交互
 */
const UI = {
  _deleteTargetId: null,
  _months: [],

  init() {
    this._cacheDOM();
    this._bindEvents();
  },

  _cacheDOM() {
    this.$setupPage = document.getElementById('setupPage');
    this.$mainPage = document.getElementById('mainPage');
    this.$nicknameInput = document.getElementById('nicknameInput');
    this.$startBtn = document.getElementById('startBtn');
    this.$displayNickname = document.getElementById('displayNickname');
    this.$balanceAmount = document.getElementById('balanceAmount');
    this.$monthBalanceAmount = document.getElementById('monthBalanceAmount');
    this.$monthLabel = document.getElementById('monthLabel');
    this.$monthPrevBtn = document.getElementById('monthPrevBtn');
    this.$monthNextBtn = document.getElementById('monthNextBtn');
    this.$recordsList = document.getElementById('recordsList');
    this.$addBtn = document.getElementById('addBtn');
    this.$recordModal = document.getElementById('recordModal');
    this.$recordModalTitle = document.getElementById('recordModalTitle');
    this.$editRecordId = document.getElementById('editRecordId');
    this.$typeToggle = document.getElementById('typeToggle');
    this.$amountInput = document.getElementById('amountInput');
    this.$dateInput = document.getElementById('dateInput');
    this.$cancelBtn = document.getElementById('cancelBtn');
    this.$confirmBtn = document.getElementById('confirmBtn');
    this.$deleteModal = document.getElementById('deleteModal');
    this.$deleteCancelBtn = document.getElementById('deleteCancelBtn');
    this.$deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
    this.$nicknameModal = document.getElementById('nicknameModal');
    this.$nicknameEditInput = document.getElementById('nicknameEditInput');
    this.$nicknameCancelBtn = document.getElementById('nicknameCancelBtn');
    this.$nicknameSaveBtn = document.getElementById('nicknameSaveBtn');

    this._selectedMonth = this._todayMonth();
  },

  _bindEvents() {
    this.$startBtn.addEventListener('click', () => this._handleStart());
    this.$nicknameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._handleStart();
    });

    this.$displayNickname.addEventListener('click', () => this._openNicknameModal());

    this.$monthPrevBtn.addEventListener('click', () => this._changeMonth(-1));
    this.$monthNextBtn.addEventListener('click', () => this._changeMonth(1));

    this.$addBtn.addEventListener('click', () => this._openRecordModal(null));

    this.$typeToggle.addEventListener('click', () => this._toggleType());

    this.$cancelBtn.addEventListener('click', () => this._closeRecordModal());
    this.$confirmBtn.addEventListener('click', () => this._handleSaveRecord());
    this.$recordModal.addEventListener('click', (e) => {
      if (e.target === this.$recordModal) this._closeRecordModal();
    });

    this.$deleteCancelBtn.addEventListener('click', () => this._closeDeleteModal());
    this.$deleteConfirmBtn.addEventListener('click', () => this._handleDelete());
    this.$deleteModal.addEventListener('click', (e) => {
      if (e.target === this.$deleteModal) this._closeDeleteModal();
    });

    this.$nicknameCancelBtn.addEventListener('click', () => this._closeNicknameModal());
    this.$nicknameSaveBtn.addEventListener('click', () => this._handleNicknameSave());
    this.$nicknameModal.addEventListener('click', (e) => {
      if (e.target === this.$nicknameModal) this._closeNicknameModal();
    });
    this.$nicknameEditInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._handleNicknameSave();
    });
  },

  /* ---- 页面切换 ---- */
  showSetup() {
    this.$setupPage.classList.remove('hidden');
    this.$mainPage.classList.add('hidden');
  },

  showMain(nickname) {
    this.$setupPage.classList.add('hidden');
    this.$mainPage.classList.remove('hidden');
    this.$displayNickname.textContent = nickname;
    this._selectedMonth = this._todayMonth();
    this._setMonthLabel(this._selectedMonth);
  },

  /* ---- 昵称设置 ---- */
  _handleStart() {
    const name = this.$nicknameInput.value;
    if (!Auth.login(name)) {
      this._shake(this.$nicknameInput);
      return;
    }
    this.showMain(Auth.currentUser);
    this.renderAll();
  },

  /* ---- 昵称修改 ---- */
  _openNicknameModal() {
    this.$nicknameEditInput.value = Auth.currentUser || '';
    this.$nicknameModal.classList.remove('hidden');
    this.$nicknameEditInput.focus();
  },

  _closeNicknameModal() {
    this.$nicknameModal.classList.add('hidden');
  },

  _handleNicknameSave() {
    const name = this.$nicknameEditInput.value;
    if (!Auth.login(name)) {
      this._shake(this.$nicknameEditInput);
      return;
    }
    this.$displayNickname.textContent = Auth.currentUser;
    this._closeNicknameModal();
  },

  /* ---- 月份导航 ---- */
  _todayMonth() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  },

  _setMonthLabel(monthStr) {
    const [y, m] = monthStr.split('-');
    this.$monthLabel.textContent = `${y}年${parseInt(m)}月`;
  },

  _changeMonth(delta) {
    const [y, m] = this._selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    this._selectedMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    this._setMonthLabel(this._selectedMonth);
    this._renderBalance();
  },

  /* ---- 记录弹窗 ---- */
  _openRecordModal(record) {
    this.$recordModal.classList.remove('hidden');

    if (record) {
      this.$recordModalTitle.textContent = '编辑记录';
      this.$editRecordId.value = record.id;
      const isWin = record.amount >= 0;
      this.$typeToggle.dataset.type = isWin ? 'win' : 'lose';
      this.$typeToggle.textContent = isWin ? '赢' : '输';
      this.$typeToggle.className = 'amount-type ' + (isWin ? 'win' : 'lose');
      this.$amountInput.value = Math.abs(record.amount);
      this.$dateInput.value = record.date;
    } else {
      this.$recordModalTitle.textContent = '记一笔';
      this.$editRecordId.value = '';
      this.$typeToggle.dataset.type = 'win';
      this.$typeToggle.textContent = '赢';
      this.$typeToggle.className = 'amount-type win';
      this.$amountInput.value = '';
      this.$dateInput.value = this._todayStr();
    }

    this.$amountInput.focus();
  },

  _closeRecordModal() {
    this.$recordModal.classList.add('hidden');
    this.$editRecordId.value = '';
  },

  _toggleType() {
    const isWin = this.$typeToggle.dataset.type === 'win';
    this.$typeToggle.dataset.type = isWin ? 'lose' : 'win';
    this.$typeToggle.textContent = isWin ? '输' : '赢';
    this.$typeToggle.className = 'amount-type ' + (isWin ? 'lose' : 'win');
  },

  _handleSaveRecord() {
    let amount = parseFloat(this.$amountInput.value);
    if (isNaN(amount) || amount < 0) {
      this._shake(this.$amountInput);
      return;
    }

    if (this.$typeToggle.dataset.type === 'lose') {
      amount = -amount;
    }

    const date = this.$dateInput.value || this._todayStr();
    const editId = this.$editRecordId.value;

    if (editId) {
      Records.update(editId, amount, date);
    } else {
      Records.add(amount, date);
    }

    this._closeRecordModal();
    this.renderAll();
  },

  /* ---- 删除弹窗 ---- */
  _openDeleteModal(id) {
    this._deleteTargetId = id;
    this.$deleteModal.classList.remove('hidden');
  },

  _closeDeleteModal() {
    this._deleteTargetId = null;
    this.$deleteModal.classList.add('hidden');
  },

  _handleDelete() {
    if (this._deleteTargetId) {
      Records.remove(this._deleteTargetId);
    }
    this._closeDeleteModal();
    this.renderAll();
  },

  /* ---- 渲染 ---- */
  renderAll() {
    this._setMonthLabel(this._selectedMonth);
    this._renderBalance();
    this._renderRecords();
  },

  _formatAmount(value) {
    const abs = Math.abs(value);
    const sign = value >= 0 ? '+¥' : '-¥';
    return sign + abs.toFixed(2);
  },

  _setAmountEl(el, value) {
    el.textContent = this._formatAmount(value);
    if (value > 0) {
      el.className = 'balance-amount handwriting positive';
    } else if (value < 0) {
      el.className = 'balance-amount handwriting negative';
    } else {
      el.className = 'balance-amount handwriting';
    }
  },

  _renderBalance() {
    this._setAmountEl(this.$balanceAmount, Records.getBalance());
    this._setAmountEl(this.$monthBalanceAmount, Records.getMonthBalance(this._selectedMonth));
  },

  _renderRecords() {
    const records = Records.getAll();

    if (records.length === 0) {
      this.$recordsList.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📝</span>
          <p>还没有记录，记一笔吧</p>
        </div>`;
      return;
    }

    let html = '';
    records.forEach(r => {
      const isWin = r.amount >= 0;
      const sign = isWin ? '+' : '';
      const amountStr = `${sign}${r.amount.toFixed(2)}`;
      const cssClass = isWin ? 'win' : 'lose';
      html += `
        <div class="record-item">
          <span class="record-date">${r.date}</span>
          <span class="record-amount ${cssClass}">${amountStr}</span>
          <div class="record-actions">
            <button class="record-edit" data-id="${r.id}" title="编辑">✏️</button>
            <button class="record-delete" data-id="${r.id}" title="删除">🗑</button>
          </div>
        </div>`;
    });

    this.$recordsList.innerHTML = html;

    this.$recordsList.querySelectorAll('.record-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const record = Records.getById(btn.dataset.id);
        if (record) this._openRecordModal(record);
      });
    });

    this.$recordsList.querySelectorAll('.record-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        this._openDeleteModal(btn.dataset.id);
      });
    });
  },

  /* ---- 工具 ---- */
  _todayStr() {
    const d = new Date();
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  },

  _shake(el) {
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = 'shake 0.4s ease';
    setTimeout(() => { el.style.animation = ''; }, 400);
  },
};
