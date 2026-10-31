# 超级小兔 2.2 PWA 维护说明

## 当前结构

- 入口页面：`index.html`
- PWA 清单：`manifest.webmanifest`（不是 `manifest.json`，不要再新建一份，避免双清单冲突）
- Service Worker：`sw.js`
- 图标：`icons/icon.svg`（源文件，来自原 favicon）、`icons/icon-180.png`、`icons/icon-192.png`、`icons/icon-512.png`、`icons/icon-maskable-512.png`、`icons/apple-touch-icon.png`
- 页面已通过 `./manifest.webmanifest` 关联清单，并注册 `./sw.js`

## 每次改版必须做

1. **先提升缓存版本。** 修改 `index.html` 后，把 `sw.js` 里的
   `const VERSION = 'sr-v20261101.0147';`
   改成新的版本号，例如 `sr-v20261115.1830`。保持 `sr-` 前缀不变，`ASSETS` 里的路径也不要删。
   现有实现用 `VERSION` 作为缓存名，不叫 `CACHE='rabbit-v1'`；作用相同，改这里即可。
2. **改图标也要提升版本。** 新增或替换 `icons/` 下的图标后，同样把 `sw.js` 的 `VERSION` 改成新值，否则手机可能继续显示旧图标。
3. **推送并等构建。** 推送到 `main` 后，等 GitHub Pages 构建完成再通知用户。用户手机上如果还是旧页面，下拉刷新两次，或关掉页面重新打开。

## 数据说明

应用数据全部保存在浏览器 `localStorage`，各设备独立，PWA 只保证页面离线可打开，不负责数据同步。

换手机、清缓存或卸载重装前，先用「我的 → 导出 JSON」备份。当前使用的键：

- 业务数据：`store_expiry_manager_v3`
- 快照：`super_rabbit_snapshots_v1`
- 主题：`super_rabbit_theme_v1`

## 图标说明

`icons/icon.svg` 是从 `index.html` 原 favicon 的 SVG data URI 原样解码得到的，没有改配色、线条或 `viewBox`。`icons/icon-180.png` 由现有 180×180 的 `apple-touch-icon.png` 复制而来，保持原有蓝底兔子图标。192/512/maskable 三个 PNG 保持原样。

旧入口文件不存在；为了兼容可能残留的旧地址，额外放了 `超级小兔2.1.html` 跳转页，访问它会自动回到 `./`。不要再覆盖 `index.html`。
