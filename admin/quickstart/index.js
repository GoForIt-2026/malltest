const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event = {}) => {
  try {
    const wxContext = cloud.getWXContext();

    return {
      code: 0,
      message: 'ok',
      data: {
        openid: wxContext.OPENID || '',
        appid: wxContext.APPID || '',
        unionid: wxContext.UNIONID || '',
        from: event.from || '',
        serverTime: Date.now()
      }
    };
  } catch (err) {
    return {
      code: -1,
      message: err && err.message ? err.message : '云函数执行失败',
      data: null
    };
  }
};
