# CODEBUDDY.md This file provides guidance to CodeBuddy when working with code in this repository.

## 常用命令

**打开小程序（开发调试唯一入口）**：项目无 npm 构建、无 lint/测试脚本。用微信开发者工具打开 `d:/mall`（根目录 `project.config.json` 已设置 `miniprogramRoot: "wechart/"`、`cloudfunctionRoot: "admin/"`）。Windows CLI：`"C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat" open --project "d:\mall"`；编译、真机预览、上传发布均在工具内完成。

**部署云函数**：用 CloudBase MCP `manageFunctions`，`action=createFunction`（首次）或 `updateFunctionCode`（迭代），`functionRootPath="d:/mall/admin"`，函数名对应 `admin/<函数名>/` 子目录；运行时 Nodejs16.13，handler `index.main`。也可在开发者工具右键云函数目录选「上传并部署」（需云调用权限时优先用此方式）。

**查询环境/云函数**：`queryEnv(action=list|info)` 查环境与后端类型（本项目 `RuntimeMode=nosql`）；`queryFunctions(action=listFunctions|listFunctionLogs)` 查函数与日志。

**读写数据（仅 NoSQL）**：`writeNoSqlDatabaseStructure(action=createCollection)` 建集合；`readNoSqlDatabaseContent` / `writeNoSqlDatabaseContent` 读写文档；权限用 `managePermissions(resourceType="noSqlDatabase")`。本环境未开通 PG/MySQL，禁止使用 `app.rdb()` 与 MySQL 工具。

## 架构总览

**仓库分层（必须严格遵守）**：`wechart/` 是小程序前端全部代码（app 配置、pages、components、utils、images），只做页面渲染、交互和 `wx.cloud.callFunction` 调用；`admin/` 是后端，每个云函数为 `admin/<函数名>/` 子目录，含 `index.js` + `package.json`，所有数据库读写、金额计算、权限校验、订单状态流转都在这里。目录名固定小写，禁止写成 Wechart/Admin 或混入其他目录。

**小程序运行时**：`app.json` 使用 skyline 渲染器 + glass-easel 组件框架、`navigationStyle: custom`（自绘导航栏）、`lazyCodeLoading: requiredComponents`。新增页面必须登记到 `wechart/app.json` 的 `pages`。现有页面：`pages/index/index`（云开发连通性自检）；现有组件：`components/navigation-bar`。样式单位统一 rpx（设计稿 375px → 1px = 2rpx），类名小写下划线。

**云开发接入**：`wechart/app.js` 的 `onLaunch` 中 `wx.cloud.init({ traceUser: true })`，不传 env 走账号默认环境（当前环境 `cloud1-d0gms7rwe7d29a38f`，个人版，ap-shanghai，已绑定 appid `wxbefe84ebacb15141`）。后端是 NoSQL 文档库（PG/MySQL 均未开通）。云函数侧统一 `cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })`。已部署 `admin/quickstart`（连通性自检，返回 openid/appid）。

**调用约定**：云函数返回统一信封 `{ code: 0, message: 'ok', data }`，异常返回 `code: -1`；前端一律 `try/catch`，失败用 `wx.showToast` 提示并 `console.error`。用户身份在云函数中通过 `cloud.getWXContext().OPENID` 获取；小程序云开发免登录，禁止生成登录页或登录流程。

**产品范围（来自 `PRD.md`）**：线下咖啡门店点单小程序，主流程为 首页选品 → 商品定制 → 购物车 → 下单支付（到店自取）→ 取餐码核销 → 订单查询。待实现的页面：`pages/index/index`（门店信息/banner/分类导航/热门列表/开屏）、`goods-detail`（杯型、温度、甜度、加料，实时改价）、`cart`、`checkout`、`take-code`（6 位取餐码 + 二维码）、`order-list`（待取餐/已完成/已取消）。

**业务规则**：金额以「分」为整数单位，避免浮点误差；商品价 = 基础价 + 加料加价，定制变更实时重算；订单 15 分钟未支付自动取消；取餐码唯一，核销后状态永久置为「已完成」且不可重复核销；MVP 不做严格库存，仅展示售罄标签。

**设计规范（PRD 第四节，实现 UI 时直接复用）**：主色 `#8B5A2B`、浅咖 `#D2B48C`、成功 `#52C41A`、警示 `#F53F3F`；文字 `#333333` / `#666666` / `#999999`；页面底色 `#F8F5F2`，分割线 `#EEEEEE`。圆角：按钮 8px、卡片 12px、输入框/标签 6px；卡片阴影 `0 2px 10px rgba(0,0,0,0.06)`。字号（375px 基准）：标题 18px/24px、商品名 16px/22px、正文 14px/20px、辅助 12px/16px、极小 11px/14px。安全边距左右 16px，顶部状态栏 44px，底部 tab 49px。主按钮 H44 圆角 8 白字 16px；次按钮同尺寸描边主色；标签选项 H28 圆角 6（默认 `#F5F0EB`/`#666`，选中主色背景白字）；商品卡片左图右文，图 80×80 圆角 8，内边距 12；点击反馈缩放 0.95；页面跳转右侧划入。

## 约定与禁止

- 只用原生小程序语法，禁止 Taro/Uniapp/Vue 等跨端框架，不使用 `window`/`document`；JS 用 ES6（`const`/`let`、`async/await`，禁用 `var`）。
- 修改优先增量编辑，不整文件覆盖；回复中标注文件完整路径。
- 新增页面提醒在 `app.json` 注册，新增云函数提醒上传部署。
- 禁止硬编码密钥、云环境 ID 等敏感信息；env 只在 `wx.cloud.init` 与 `DYNAMIC_CURRENT_ENV` 处出现。
- 引入任何第三方依赖或做目录/架构大改动前先征求用户确认；结构变化后更新本文件与 `.codebuddy/rules/mall.mdc`。
