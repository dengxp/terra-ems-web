# Terra EMS 能源管理系统 - 项目知识沉淀与架构设计文档

## 一、项目概述

本项目（Terra EMS 能源管理系统）经历数月的迭代与优化，前端基于 `terra-ems-react`，后端基于 `terra-ems-v3` 构建。在长期的沟通与开发中，沉淀了大量关于前后端架构、开发规范、API协议以及 UI/UX 设计的宝贵经验。
本文档旨在梳理总结项目从零到一过程中的架构设计与核心规范，作为后续新项目开发的“详细设计参考手册”与基石。未来的新项目，仅需提供需求说明书并遵循本文档指导，即可快速进行详细设计与功能开发。

---

## 二、通用工程规则

* **语言与沟通**：所有回复、代码说明、注释、文档**必须使用简体中文**。代码中的变量与标识符保持英文，严禁使用拼音拼写。错误信息与日志内容允许保留英文。
* **默认技术选型**：
  * **前端**：React 18 + TypeScript 5 + Umijs (@umijs/max)
  * **后端**：Java (优先采用 SpringBoot 生态)

---

## 三、后端架构与设计规范

### 1. 项目分层与模块结构

后端项目 (`terra-ems-v3`) 遵循清晰的模块化多模块 (Multi-Module) 结构：
```text
terra-ems-v3/
├── terra-ems-admin      # 启动模块及 Controller 层（应用主入口）
├── terra-ems-system     # 系统基础模块（包含系统基础权限、用户、部门等 Entity、Repository、Service）
├── terra-ems-ems        # EMS 核心业务模块（能源管理相关核心逻辑）
├── terra-ems-framework  # 框架层（存放基类、系统核心配置、JPA扩展、通用工具类）
└── terra-ems-common     # 公共模块（通用 DTO、常量、枚举定义）
```

### 2. Controller 层开发规范

* **继承体系**：
  * `Controller` -> 基础定义，提供统装响应结果等方法。
  * `ReadableController` -> 提供基础查询与分页。
  * `WritableController` -> 继承后扩展读写（增删改查）。
  * `BaseController` -> 完整的 CRUD 骨架封装。
* **命名规范**：
  * **单条/列表检索**: `find` 开头 (如 `findById`, `findByStatus`)，禁止使用 `get` (仅作属性访问器)。
  * **分页查询**: `findByPage`，通常映射到 `GET /`，必须配合 `Pager` 或统包查询的 `QueryParam`。
  * **不分页列表**: `findList`，通常映射到 `GET /list`。
  * **创建与更新**: 分别使用 `create` 和 `update`，避免使用 `add`/`insert`。对于简单的增改，可用通用的 `saveOrUpdate`。
  * **删除操作**: 单条使用 `delete` (`DELETE /{id}`)，批量删除使用 `deleteBatch` (`DELETE /` 带 RequestBody 列表)。

* **API 设计与 RESTful 风格**：
   采用标准的 HTTP 动词 (`GET` 查询, `POST/PUT` 写入, `DELETE` 移除, `PATCH` 局部变更)。例如资源状态变更可用 `PATCH /ems/resource/{id}/status`。

### 3. Service 与 Repository 层规范

* **Service** 业务层命名与实现须保持高度一致（如 `findById`, `findByPage`, `saveOrUpdate` 等），避免通用命名含混。
* **Repository 约束**：
  * 必须继承 `com.terra.ems.framework.jpa.repository.BaseRepository<E, ID>`。
  * 拒绝在 Repository 堆砌复杂的 Native SQL 或冗长 `@Query` 注解进行多条件查询。
* **通用动态查询**：复杂过滤必须使用 JPA `Specification` 并前推至 Controller 或 Service 中使用对象封装构建，避免字符串拼接。

### 4. 实体 (Entity) 与数据库表设计规范

* **命名语义**：表名及 Entity 类名强制采用**单数 (Singular)** 形式（如 `ems_product`, `sys_user`），只有在表示集合时才能使用复数变量。
* **数据映射模式**：所有实体均需继承 `Entity` 基类。
* **外键桥接处理**（特别是父子树型结构）：采用 `@JsonProperty("parentId")` 形式对 `@ManyToOne` 的 parent 进行桥接解析。
  * *目的*：这允许前端直接回传平级的 `{ parentId: 1 }`，而在序列化时不会产生循环引用，简化了 DTO 的交互复杂度。

### 5. 枚举与安全约定

* JPA 枚举使用 `@Convert` 保证存入数据库的是字典对应实际原始值（不暴露后端枚举结构名称）。枚举参数的 API 入参需有显式的解析与防御性检查。
* 严防批量赋值：实体类作为 `RequestBody` 更新时，禁止把请求直接存储为最终结果，通过手动赋予或 DTO 匹配实现安全控制。密码等机密字段须标注 `@JsonIgnore` 等进行反序列化屏蔽。

---

## 四、前端架构与设计规范

### 1. 核心技术栈与目录架构

* **UI 框架**：Ant Design 5.x + 核心库 Pro-Components
* **关键底层**：所有跨页面的公共 UI 组件必须包裹 `React.forwardRef`，从而满足高层 ProTable / 弹窗层对其进行无感知渲染及测量的要求。

**核心分层**：
* `src/apis/`：网络请求模块，严禁在组件内拼写 url 和硬编码。
* `src/pages/`：按业务模块解耦。
* `src/hooks/common/`：抽象化的 Hooks（尤其是 `useCrud.ts` 非常核心）。

### 2. CRUD 抽象设计：useCrud.ts
前端废弃了早期手动声明局部弹窗 useState 各种操作变量的方式，统一通过泛化的业务模型去掌控交互，所有标准增删改页面强制使用：

```tsx
const {
    getState, actionRef, fetchPage, search,
    toCreate, toEdit, handleSaveOrUpdate, toBatchDelete, setDialogVisible
} = useCrud<EntityType>({ pathname: '/module/page', entityName: '模型名称', baseUrl: '/api/xxx' });
```
此模式整合了后端差异（0 vs 1 based 请求页码）、弹窗切换、批量请求的二段确认（Popconfirm内置），极大幅度收敛了面条代码。

### 3. 表单布局与展示标准

* 列表默认遵循“名称在前，技术主键在后”的规则，保证友好的视觉第一落点。
* 主键列一般设置隐藏（`hideInTable`, `hideInSearch`）。
* **表单栅格体系**：为了良好的交互体验，较长表单强制开启 `Grid` 布局（`grid={true}`，半宽用 `span=12, labelCol: 6`）。技术主键须设置为 `hidden` 表单项承载数据。

### 4. 特殊组件最佳实践（Tree树形菜单）

* **右键菜单防错**：禁止在 TreeNode 的标题属性直接封装 Dropdown，容易破坏 Flex 布局并产生折行 bug。
* **推荐**：使用独立的绝对定位锚点捕获 `onRightClick` 的坐标展示统一菜单。对于数据载入应在解析时就挂载完整的 `rawData` 属性。

---

## 五、前后端交互协议沉淀

1. **响应包装模型**：API 的返回值一律包裹在全局统用的 `API.Result<T>` 中。
2. **列表查询适配**：
   * 前端遵循起始页面为 1 的规则，后端分页索引通常从 0 计算（SpringData JPA），因此 API 层做了智能转化和健壮保护。
3. **选项及关联选择**：
   * 下拉框或 Cascader 组件请求参数绝不直接抛出完整的 Entity 列表体。必须使用专门的 `/options` 接口抛出 `Option<T>`(仅含 Label, Value)。
4. **认证异常响应**：
   * `401 Unauthorized`：客户端拦截后清空状态回调并踢至登录页面。
   * `403 Forbidden`：只提示权限拒绝消息拦截跳跃行为（防止进入循环跳转死点）。

---

## 六、UI/UX 技能与交互细节总结

在与用户关于界面、主题、按钮等细节打磨中沉淀了统一的定制观：
1. **风格与基调**：针对能源管理项目的诉求，确定使用 **"Modern Industrial"** 或 **"Dark Data Visualization"** 等高级别配色面板配置，展现富有极客科技风格的高级大盘。
2. **动作组件封装**：
   * 业务操作禁用裸 `<Button>`，取而代之的是 `AddButton`, `EditButton`, `DeleteButton`（必定封装二次确收防误删防脱库），以及列表操作辅助按钮 `IconButton`。
   * 操作图标统一用 `Filled` 系列突出强调，且样式统于 `variant="outlined/text"`。

---

## 七、总结与后续推进规划

经过本项目全生命周期的打磨，Terra EMS 项目构建起了一套从代码规范（License、缩进、命名），到分层解构，再到业务模式抽象（JPA动态拼装 + useCrud 泛型封装的整合）的强大生产线。

**新项目开发指南（使用当前知识库）：**
1. **输入阶段**：未来如果有新项目，提供《详细需求说明书》与数据库模型初始需求。
2. **生成架构与详细设计**：AI 根据本书梳理的能力自动拆分并生成详尽接口文档、前后端领域类映射。
3. **闭环组装**：直接调用本系统中抽象出来的基类 `BaseController`/`BaseRepository`/`useCrud` 进行工厂化规模产出。

本沉淀不仅是现有工程重构与调优的汇总，更是后续基于该堆栈高速复制同类 B 端项目的**核心规范辞典**。
