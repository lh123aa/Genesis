# Project Genesis - UI 重设计方案

## 📋 现状分析

### 当前功能
1. **Agent 管理** (6个代理)
   - Minion (主控)
   - Scout (数据收集)
   - Quill (文档生成)
   - Observer (监控)
   - Academy (知识库/SOP)
   - Crystallizer (优化)

2. **Panopticon 监控系统**
   - 全链路追踪 (Trace Logs)
   - 成本控制 (Cost Control)
   - SOP 健康监控
   - 循环检测
   - 熔断器状态

3. **API 端点**
   - `/api/status` - 系统状态
   - `/api/panopticon/logs` - 日志
   - `/api/panopticon/sop-health` - SOP 健康
   - `/api/panopticon/costs` - 成本

### 当前问题
1. **功能分散** - Panopticon 页面独立，主仪表盘没有集成监控数据
2. **信息密度低** - Agent 卡片过于简单，缺少关键指标
3. **缺少可视化** - 没有图表展示趋势和关系
4. **导航不清晰** - 用户不知道有哪些功能可用

---

## 🎨 新设计方案

### 设计理念: "Command Center" (指挥中心)
将界面设计为类似 NASA 任务控制中心的仪表盘风格：
- **深色主题** - 适合长时间监控，减少眼疲劳
- **高信息密度** - 一屏展示更多关键指标
- **实时数据流** - 动态更新的日志和指标
- **视觉层级** - 重要信息突出显示

### 色彩系统

```css
/* 主色调 - 深色科技风 */
--bg-primary: #0a0a0f;        /* 深黑背景 */
--bg-secondary: #12121a;      /* 次级背景 */
--bg-tertiary: #1a1a25;       /* 卡片背景 */
--bg-hover: #252535;          /* 悬停背景 */

/* 文字颜色 */
--text-primary: #e4e4e7;      /* 主要文字 */
--text-secondary: #a1a1aa;    /* 次要文字 */
--text-muted: #71717a;        /* 辅助文字 */
--text-accent: #22d3ee;       /* 强调色 - 青色 */

/* 状态色 */
--status-running: #22c55e;    /* 运行中 - 绿 */
--status-idle: #eab308;       /* 空闲 - 黄 */
--status-error: #ef4444;      /* 错误 - 红 */
--status-circuit-open: #f97316; /* 熔断 - 橙 */

/* 边框 */
--border-subtle: #27272a;
--border-prominent: #3f3f46;
--border-accent: #22d3ee;
```

### 字体系统
- **主字体**: Inter (正文)
- **等宽字体**: JetBrains Mono (日志、数据)
- **装饰字体**: Space Grotesk (标题)

### 布局结构

#### 1. 全局导航栏 (固定顶部)
```
┌─────────────────────────────────────────────────────────┐
│ [Logo]  Project Genesis    [Dashboard] [Agents] [Panopticon] [Settings]  [User] │
└─────────────────────────────────────────────────────────┘
```

#### 2. 主仪表盘布局
```
┌──────────────────────────────────────────────────────────────┐
│  系统概览栏 (System Status Bar)                                │
│  [🟢 Healthy] [Uptime: 2d 4h] [Active Agents: 4/6] [Alerts: 2] │
├──────────────────┬──────────────────┬────────────────────────┤
│                  │                  │                        │
│  Agent 网格       │   实时监控区      │     活动日志流          │
│  (6个卡片)        │   (指标图表)      │     (实时滚动)          │
│                  │                  │                        │
│  ┌────────────┐  │  ┌────────────┐  │  [10:23:45] Agent...   │
│  │ Minion     │  │  │ Cost Chart │  │  [10:23:44] SOP...     │
│  │ [running]  │  │  │ [sparkline]│  │  [10:23:43] Trace...   │
│  │ 45% ▓▓▓▓░  │  │  └────────────┘  │                        │
│  │ Task: ...  │  │                  │                        │
│  └────────────┘  │  ┌────────────┐  │                        │
│  ┌────────────┐  │  │ SOP Health │  │                        │
│  │ Scout      │  │  │ [gauge]    │  │                        │
│  │ [idle]     │  │  └────────────┘  │                        │
│  └────────────┘  │                  │                        │
│                  │                  │                        │
├──────────────────┴──────────────────┴────────────────────────┤
│  Panopticon 快速预览                                          │
│  [Trace ID] [Loop Status] [Circuit Status] [Cost Alert]        │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 具体改进方案

### 1. 重新设计 Agent 卡片

**当前问题**: 卡片太大，信息少，进度条占空间

**新设计** (紧凑信息密度):
```tsx
┌─────────────────────────────────────┐
│ ● Minion      [running]    02:34:12 │  ← 头部: 状态点 + 名称 + 运行时间
│ ▓▓▓▓▓▓▓░░░ 45%                      │  ← 迷你进度条
│ > Analyzing repository structure    │  ← 当前任务 (截断)
│ [Trace: a1b2c3d4] [Cost: 450/1000]  │  ← 新增: Trace ID + 成本
└─────────────────────────────────────┘
```

**交互改进**:
- 悬停显示详细信息浮层
- 点击展开完整日志流
- 错误状态闪烁边框

### 2. 新增 "实时监控区"

**成本趋势图** (Sparkline):
- 展示最近 20 个任务的 Token 消耗
- 超过阈值时变红

**SOP 健康仪表盘**:
- 圆形进度条显示健康 SOP 比例
- 陈旧 SOP 列表快捷入口

**Agent 活动热力图**:
- 类似 GitHub contributions 的网格
- 显示各 Agent 的活动频率

### 3. 实时日志流

**当前问题**: Panopticon 页面才有日志

**改进**: 主仪表盘右侧增加可滚动的日志流
- 固定高度，自动滚动
- 支持过滤 (ERROR/WARN/INFO)
- 点击 Trace ID 高亮相关日志

### 4. 系统概览栏

新增顶部状态栏，显示：
- 系统整体健康度 (绿/黄/红)
- 运行时间
- 活跃 Agent 数量
- 未读告警数量
- 总 Token 消耗 (今日)

### 5. Panopticon 快捷预览

在主仪表盘底部增加快捷区域：
- **Trace Explorer**: 输入 Trace ID 快速搜索
- **Circuit Breaker Status**: 各熔断器状态灯
- **Loop Detection Alert**: 循环检测告警
- **Cost Budget**: 预算使用进度条

### 6. 导航改进

**新增侧边栏导航** (可折叠):
```
📊 Dashboard          ← 主仪表盘 (当前)
🤖 Agents             ← Agent 详情页
📡 Panopticon         ← 深度监控页
   ├── Trace Logs
   ├── Cost Analysis
   ├── SOP Registry
   └── Circuit Breakers
⚙️  Settings
```

---

## 📱 响应式策略

### 桌面端 (≥1280px)
- 三栏布局: Agents (左) | 监控 (中) | 日志 (右)
- 固定侧边栏

### 平板端 (768px - 1279px)
- 两栏布局: Agents (左) | 监控+日志 (右)
- 可折叠侧边栏

### 移动端 (<768px)
- 单栏堆叠
- 底部 Tab 导航
- Agent 卡片水平滑动

---

## 🎯 实施优先级

### Phase 1: 核心改进 (立即)
1. [ ] 重写 AgentCard 组件 (紧凑设计)
2. [ ] 新增系统概览栏
3. [ ] 主仪表盘集成日志流
4. [ ] 添加深色主题

### Phase 2: 功能增强 (本周)
1. [ ] 添加侧边栏导航
2. [ ] 成本趋势 Sparkline 图表
3. [ ] SOP 健康仪表盘
4. [ ] Agent 活动热力图

### Phase 3: 高级功能 (下周)
1. [ ] Trace ID 搜索功能
2. [ ] 实时通知系统
3. [ ] 性能优化 (虚拟滚动日志)
4. [ ] 键盘快捷键

---

## 🛠️ 技术实现

### 新增依赖
```bash
npm install recharts lucide-react @radix-ui/react-tooltip
```

### 组件清单
1. `CompactAgentCard` - 紧凑 Agent 卡片
2. `SystemStatusBar` - 系统概览栏
3. `LogStream` - 实时日志流
4. `SparklineChart` - 迷你趋势图
5. `CircularGauge` - 圆形仪表盘
6. `SidebarNav` - 侧边栏导航
7. `TraceExplorer` - Trace ID 搜索
8. `CircuitStatus` - 熔断器状态

### 状态管理
```typescript
// 新增全局状态
interface DashboardState {
  selectedAgentId: string | null;
  logFilter: 'all' | 'error' | 'warn' | 'info';
  highlightedTraceId: string | null;
  sidebarCollapsed: boolean;
  realtimeUpdates: boolean;
}
```

---

## ✨ 预期效果

### 信息密度提升
- 当前: 一屏展示 1-2 个 Agent 详情
- 新设计: 一屏展示 6 个 Agent + 监控图表 + 日志流

### 功能可见性
- 当前: Panopticon 功能隐藏
- 新设计: 所有核心功能在主仪表盘可见或可一键访问

### 视觉专业度
- 当前: 简洁但略显单调
- 新设计: 科技感仪表盘，类似 Datadog/Grafana

---

## 📊 参考产品

- **Datadog** - 监控仪表盘布局
- **Grafana** - 图表和可视化
- **Vercel Dashboard** - 简洁现代的数据展示
- **GitHub Actions** - 实时日志流设计
- **Linear** - 深色主题和交互细节
