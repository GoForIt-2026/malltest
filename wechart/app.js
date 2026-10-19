// app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      wx.showToast({ title: '当前基础库不支持云开发', icon: 'none' });
      return;
    }

    // 云开发初始化：不传 env 时使用账号默认环境（cloud1-d0gms7rwe7d29a38f）
    // 如需多环境切换，由配置下发 env 后再传入 wx.cloud.init({ env })
    wx.cloud.init({
      traceUser: true
    });
  }
});
