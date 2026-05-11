# Admin Panel 设计文档

**日期：** 2026-05-11
**状态：** 已确认，待实现

---

## 概述

为 Astro-Cloud 博客添加一个 `/admin` 设置页面，允许博主通过 Web UI 管理 `config.yaml` 中的部分配置项，修改后通过 GitHub API 一次性提交到仓库，触发 GitHub Actions 自动重新构建并部署到 GitHub Pages。

---

## 架构

### 技术选型

- **页面类型：** Astro 静态页面（`src/pages/admin.astro`）
- **前端框架：** Vue 3（项目已有依赖）
- **YAML 处理：** js-yaml（项目已有依赖）
- **数据存储：** localStorage（存储 GitHub Token）
- **后端依赖：** 无，全部通过 GitHub REST API 实现

### 数据流

```
页面加载
  → 检查 localStorage 中的 Token
  → 有 Token：调用 GitHub API 读取 config.yaml（base64 解码 + YAML 解析）→ 填入表单
  → 无 Token：显示引导提示

用户编辑表单
  → 任意字段变更 → "保存并提交"按钮高亮可用

点击"保存并提交"
  → 表单数据序列化为 YAML 字符串
  → base64 编码
  → 调用 GitHub API PUT /contents/config.yaml（带 sha）
  → 成功：按钮恢复置灰，显示成功提示
  → 失败：显示错误信息
```

### 仓库信息注入

`owner` 和 `repo` 通过 Astro 环境变量在构建时注入：

- `PUBLIC_GITHUB_OWNER`
- `PUBLIC_GITHUB_REPO`

在 `.env` 文件中配置，不提交到仓库（加入 `.gitignore`）。

---

## 页面结构

### 顶部栏

- 左：页面标题"博客设置"
- 右：齿轮图标（点击弹出 Token 设置 Modal）+ "保存并提交"按钮

按钮状态：
- 无改动 / 未加载完成：置灰禁用
- 有改动：蓝色高亮可用
- 提交中：loading 状态
- 提交成功：短暂显示"已提交"后恢复置灰

### 左侧导航

三个 Tab，垂直排列：
1. 基础设置
2. 关于页面
3. 收藏管理

### 右侧表单

根据当前 Tab 显示对应内容。

---

## 表单字段

### 基础设置

| 字段 | 类型 | 对应 config.yaml |
|------|------|-----------------|
| 封面图 URL | 文本输入 | `cover` |
| Logo URL | 文本输入 | `logo` |
| 引言内容 | 文本输入 | `quote_card_content` |
| 引言来源 | 文本输入 | `quote_card_source` |
| 每页文章数 | 数字输入 | `page_size` |

### 关于页面

| 字段 | 类型 | 对应 config.yaml |
|------|------|-----------------|
| 头像 URL | 文本输入 | `avatar` |
| 博客简介 | 文本域（多行） | `description` |
| 社交链接 | 动态列表（name + url） | `social` |

### 收藏管理

| 字段 | 类型 | 对应 config.yaml |
|------|------|-----------------|
| 收藏列表 | 动态列表（name + url + favicon + desc） | `collections` |

### 动态列表交互

- "+ 添加"按钮新增一行
- 每行右侧有删除按钮
- 行与行之间支持拖拽排序（使用 `sortablejs` 实现，按需引入）

---

## GitHub API 交互

### Token 管理

- 存储键：`localStorage['admin_github_token']`
- 权限要求：`repo`（读写仓库内容）
- 无 Token 时：右侧区域显示引导提示，指引用户点击齿轮图标输入

### 读取配置

```
GET https://api.github.com/repos/{owner}/{repo}/contents/config.yaml
Authorization: Bearer {token}
```

- 返回内容为 base64 编码，解码后用 js-yaml 解析
- 保存返回的 `sha` 值，提交时必须携带

### 提交配置

```
PUT https://api.github.com/repos/{owner}/{repo}/contents/config.yaml
Authorization: Bearer {token}
Body: {
  message: "chore: update config via admin panel",
  content: base64(yamlString),
  sha: {上次读取的 sha}
}
```

---

## 文件变更清单

- 新增：`src/pages/admin.astro`
- 新增：`src/components/admin/AdminPanel.vue`（主面板 Vue 组件）
- 新增：`.env.example`（示例环境变量文件）
- 修改：`.gitignore`（添加 `.env`）
- 新增依赖：`sortablejs`（动态列表拖拽排序）

---

## 不在范围内

- 文章内容的增删改
- `sitename`、`author`、`primary_color`、`iconfont_url`、`menu` 等其他配置项
- 用户认证系统（依赖 GitHub Token 的隐蔽性）
- 提交历史查看
