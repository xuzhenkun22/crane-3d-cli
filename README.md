# 起重机 3D 选型工作台

基于 Vue 3、Vite 和 Three.js 的浏览器端选型原型。界面参考 `img/参考界面.jpg`。模型由参数化几何体构建，不需要外部 3D 资源或后端服务。

## 运行

需要 Node.js 20.19+（20.x）或 22.12+，以及支持 WebGL 2 的现代浏览器。

```bash
npm ci
npm run dev
npm test        # 目录、配置与三维机构测试
npm run build   # 构建到 dist/
npm run preview # 预览构建产物
```

开发地址默认是 `http://localhost:5173`。

## 使用

- 在「产品系列」依次选择 **产品类别 → 结构系列 → 具体型号**，或直接按型号、名称、别名搜索。例如「桥式起重机 → 单梁桥式起重机 → LD / HD / LX」，也可用 `RMG` 找到 `GJM`。
- 额定起重量以 **t** 输入，跨度类参数与起升高度以 **m** 输入。三个核心参数均可选常用值或手输，最多保留 1 位小数。「跨度」提供 7.5、10.5、13.5、16.5、19.5、22.5、25.5 m 七档；手输仍支持预览范围内的其他数值。固定式葫芦不显示轨道长度；岸桥显示外伸距、门座机显示最大工作幅度。
- 部分型号支持固定式／运行式、箱梁／桁架、悬臂配置和吊具选配。更改选配会更新三维构型及可演示的动作。
- 使用预设色（包括工业红 `#D55143`）、取色器或 `#RRGGBB` 色码修改涂装。品牌默认文字为「中国制造 Made In China」，可修改（最多 24 个字符），也可上传不超过 4 MB 的 PNG、JPG、WebP Logo。图片只在本地处理。
- 在「演示机构」选择整机循环或单个动作。桥式大车沿固定高架轨道运行，轨道门机沿固定地面轨道运行；小车和吊具随其上级结构运动。门座机可回转、变幅，岸桥的臂架俯仰单独演示，造船门机可分别演示上下小车与吊钩。支持拖动、缩放、平移、四个标准视角、全屏和结构标注。
- 「导出配置」保存当前型号的参数、构型、涂装和品牌为 JSON；「导出选型图片」将当前模型角度、动作姿态和配置排版为一张 PNG 图片。图片导出需要 WebGL 2，导出的图片不是工程图纸。不同型号的配置在当前页面会话内分别保留，刷新不会永久保存；暂不支持导入。

## 型号来源与范围

`img/型号表.xlsx` 为主要来源，原表未修改。保留原表 88 条（含替换的两条），并补充 KBK 单轨／单梁／双梁、MQ 单臂架／四连杆、STS 单小车／双小车、造船上下小车共 8 条，合计 96 项。原表的 WHL、WH164 在目录中以公开的 [STAHL SH](https://www.stahlcranes.com/fileadmin/user_upload/Dokumente/Drucke/Broschueren/br_sz_sh_en_2107_web.pdf) 和 [Demag DVR](https://www.demagcranes.com/en-us/products/hoist-units/dvr-rope-hoist) 替换。桥式和葫芦的 `YH` 分属不同类别，均保留。

**参数范围、尺寸、轨迹和模型均为选型示意，并非厂商规格、生产图纸或承载能力校核。** 型号资料有限的条目在界面标有「参考构型」。正式选型需接入厂商数据，校验参数组合及工况，并审核模型。

## 项目结构

| 路径 | 职责 |
| --- | --- |
| `src/App.vue` | 工作台、三级目录、配置与导出 |
| `src/components/CraneViewer.vue` | Three.js 场景、相机与结构标注 |
| `src/components/ProductGlyph.vue` | 卡片 SVG 示意图 |
| `src/domain/products.js` | 目录、选配、参数规则与动作列表 |
| `src/domain/catalogAliases.json` | Excel 整理后的型号别名 |
| `src/domain/logo.js` | Logo 校验、解码与缩放 |
| `src/domain/selectionImage.js` | 模型快照与配置的 PNG 排版 |
| `src/three/crane.js` | 模型装配、镜头取景范围、贴图与动画进度 |
| `src/three/mechanisms.js`、`src/three/lifting.js` | 结构、机构、小车、绳索和吊具 |
| `src/style.css` | 工业深色主题与响应式布局 |
| `test/products.test.js`、`test/mechanisms.test.js` | 目录、参数和机构测试 |
