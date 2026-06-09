/**
 * 昵称管理
 */
const Auth = {
  currentUser: null,

  init() {
    this.currentUser = Storage.getNickname();
    return !!this.currentUser;
  },

  login(nickname) {
    const trimmed = nickname.trim();
    if (!trimmed || trimmed.length > 12) return false;
    this.currentUser = trimmed;
    Storage.setNickname(trimmed);
    return true;
  },
};
