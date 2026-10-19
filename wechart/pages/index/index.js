// index.js
Page({
  data: {
    cloudStatusText: '正在检测云开发连接...'
  },

  async onLoad() {
    await this.checkCloud();
  },

  async checkCloud() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'quickstart',
        data: { from: 'index' }
      });

      const result = res && res.result ? res.result : {};
      if (result.code === 0) {
        this.setData({
          cloudStatusText: `云开发已连接 openid: ${result.data.openid || '未知'}`
        });
        return;
      }

      this.setData({ cloudStatusText: `云开发返回异常: ${result.message || '未知错误'}` });
    } catch (err) {
      console.error('[index] 云函数调用失败', err);
      this.setData({ cloudStatusText: '云开发未连接，请先部署 quickstart 云函数' });
      wx.showToast({ title: '云开发调用失败', icon: 'none' });
    }
  }
});
