/**
 * Genesis 国际化系统
 * 支持中英文切换
 */

export type Locale = 'zh' | 'en';
export type LocaleKey = keyof typeof zh_CN;

/**
 * 中文翻译
 */
const zh_CN = {
  // 系统
  system: {
    name: 'Genesis',
    version: 'AI Agent 编排系统',
    loading: '加载中...',
    ready: '系统就绪',
    error: '错误',
    success: '成功',
    warning: '警告',
  },
  
  // Agent 相关
  agent: {
    scout: '🔍 侦察员',
    coder: '💻 程序员',
    tester: '🧪 测试员',
    reviewer: '👀 评审员',
    docs: '📝 文档员',
    librarian: '📚 图书管理员',
    oracle: '🔮 预言家',
    builder: '🏗️ 建筑师',
    optimizer: '⚡ 优化师',
    integrator: '🔗 集成员',
    // 角色
    role: '角色',
    status: '状态',
    tasks: '任务',
    thinking: '思考中',
    working: '工作中',
    completed: '已完成',
    failed: '失败',
    waiting: '等待中',
  },
  
  // 状态
  status: {
    pending: '等待中',
    thinking: '思考中',
    working: '工作中',
    completed: '已完成',
    failed: '失败',
    waiting: '等待中',
    idle: '空闲',
  },
  
  // 思维模式
  thinking: {
    mode: '思维模式',
    direct: '⚡ 直接执行',
    cot: '🔗 思维链',
    react: '🔄 推理-行动',
    reflexion: '🪞 自我反思',
    plan_execute: '📋 计划-执行',
    mirror: '🔮 MIRROR双反思',
    reasoning: '💭 推理',
    action: '🎬 行动',
    observation: '👁️ 观察',
    reflection: '🪞 反思',
    correction: '🔧 纠错',
    planning: '📝 计划',
    process: '思维过程',
    summary: '反思总结',
  },
  
  // 任务相关
  task: {
    goal: '目标',
    analysis: '分析',
    decomposition: '任务分解',
    planning: '计划',
    execution: '执行',
    completed: '已完成',
    failed: '失败',
    total: '总计',
    remaining: '剩余',
    progress: '进度',
    estimated: '预计',
    steps: '步骤',
    subtasks: '子任务',
  },
  
  // 操作
  action: {
    start: '开始',
    stop: '停止',
    pause: '暂停',
    resume: '继续',
    retry: '重试',
    cancel: '取消',
    save: '保存',
    load: '加载',
    reset: '重置',
    switch: '切换',
    toggle: '切换',
    set: '设置',
    get: '获取',
  },
  
  // 领域
  domain: {
    web_development: '🌐 Web开发',
    api: '🔌 API开发',
    research: '🔬 研究',
    debugging: '🐛 调试',
    documentation: '📚 文档',
    market_research: '📊 市场研究',
    development: '💻 开发',
    general: '📦 通用',
  },
  
  // 复杂度
  complexity: {
    simple: '简单',
    moderate: '中等',
    complex: '复杂',
    very_complex: '非常复杂',
  },
  
  // 消息
  message: {
    goalReceived: '🎯 收到目标',
    analyzing: '🧠 分析中',
    planning: '📋 计划中',
    executing: '⚡ 执行中',
    completed: '✅ 任务完成',
    failed: '❌ 任务失败',
    noTasks: '📭 无任务',
    allCompleted: '✨ 全部完成',
    analyzingGoal: '🎯 目标分析',
    domainDetected: '📍 领域检测',
    complexityDetected: '📊 复杂度检测',
    approachSuggested: '💡 方法建议',
    taskDecomposition: '📦 任务分解',
    agentAssignment: '🎬 Agent分配',
    executionStarted: '🚀 开始执行',
    executionProgress: '📈 执行进度',
    executionCompleted: '🎉 执行完成',
    selfReflection: '🔍 自我反思',
    languageSwitched: '🌍 语言已切换',
    currentLanguage: '🌍 当前语言',
  },
  
  // 时间线
  timeline: {
    title: '📜 Agent 活动时间线',
    performance: '各 Agent 表现',
    totalTime: '总耗时',
    avgTime: '平均耗时',
  },
  
  // 提示
  hint: {
    useZh: '输入 "zh" 切换到中文',
    useEn: '输入 "en" 切换到英文',
    switchLanguage: '输入语言代码切换: zh / en',
  },
  
  // Hooks
  hooks: {
    initialization: '初始化',
    analysis: '分析',
    planning: '规划',
    execution: '执行',
    completion: '完成',
    before: '前',
    after: '后',
    onError: '错误时',
  },
  
  // Session
  session: {
    created: '会话创建',
    recovered: '会话恢复',
    interrupted: '会话中断',
    completed: '会话完成',
    failed: '会话失败',
    progress: '进度',
    checkpoints: '检查点',
  },
  
  // Common
  common: {
    analyzing: '正在分析',
    planning: '正在计划',
    executing: '正在执行',
    completed: '已完成',
    failed: '失败',
    pending: '等待中',
    waiting: '等待',
    success: '成功',
    error: '错误',
    warning: '警告',
    total: '总计',
    remaining: '剩余',
    duration: '耗时',
    tasks: '任务',
    tools: '工具',
    missing: '缺失',
    installed: '已安装',
  },
  
  // Summary
  summary: {
    title: '执行总结',
    statistics: '统计',
    totalTasks: '总任务数',
    completed: '已完成',
    failed: '失败',
    duration: '执行时间',
    agentsUsed: '使用的Agent',
    allCompleted: '所有任务已完成!',
    partialFailed: '部分任务失败，请查看日志了解详情。',
  },
  
  // Progress
  progress: {
    title: '执行进度',
    completed: '已完成',
  },
};

/**
 * 英文翻译
 */
const en_US = {
  // System
  system: {
    name: 'Genesis',
    version: 'AI Agent Orchestration System',
    loading: 'Loading...',
    ready: 'System Ready',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
  },
  
  // Agent
  agent: {
    scout: '🔍 Scout',
    coder: '💻 Coder',
    tester: '🧪 Tester',
    reviewer: '👀 Reviewer',
    docs: '📝 Docs',
    librarian: '📚 Librarian',
    oracle: '🔮 Oracle',
    builder: '🏗️ Builder',
    optimizer: '⚡ Optimizer',
    integrator: '🔗 Integrator',
    role: 'Role',
    status: 'Status',
    tasks: 'Tasks',
    thinking: 'Thinking',
    working: 'Working',
    completed: 'Completed',
    failed: 'Failed',
    waiting: 'Waiting',
  },
  
  // Status
  status: {
    pending: 'Pending',
    thinking: 'Thinking',
    working: 'Working',
    completed: 'Completed',
    failed: 'Failed',
    waiting: 'Waiting',
    idle: 'Idle',
  },
  
  // Thinking modes
  thinking: {
    mode: 'Thinking Mode',
    direct: '⚡ Direct',
    cot: '🔗 Chain of Thought',
    react: '🔄 ReAct',
    reflexion: '🪞 Reflexion',
    plan_execute: '📋 Plan-and-Execute',
    mirror: '🔮 MIRROR',
    reasoning: '💭 Reasoning',
    action: '🎬 Action',
    observation: '👁️ Observation',
    reflection: '🪞 Reflection',
    correction: '🔧 Correction',
    planning: '📝 Planning',
    process: 'Thinking Process',
    summary: 'Reflection Summary',
  },
  
  // Task
  task: {
    goal: 'Goal',
    analysis: 'Analysis',
    decomposition: 'Task Decomposition',
    planning: 'Planning',
    execution: 'Execution',
    completed: 'Completed',
    failed: 'Failed',
    total: 'Total',
    remaining: 'Remaining',
    progress: 'Progress',
    estimated: 'Estimated',
    steps: 'Steps',
    subtasks: 'Subtasks',
  },
  
  // Actions
  action: {
    start: 'Start',
    stop: 'Stop',
    pause: 'Pause',
    resume: 'Resume',
    retry: 'Retry',
    cancel: 'Cancel',
    save: 'Save',
    load: 'Load',
    reset: 'Reset',
    switch: 'Switch',
    toggle: 'Toggle',
    set: 'Set',
    get: 'Get',
  },
  
  // Domain
  domain: {
    web_development: '🌐 Web Development',
    api: '🔌 API Development',
    research: '🔬 Research',
    debugging: '🐛 Debugging',
    documentation: '📚 Documentation',
    market_research: '📊 Market Research',
    development: '💻 Development',
    general: '📦 General',
  },
  
  // Complexity
  complexity: {
    simple: 'Simple',
    moderate: 'Moderate',
    complex: 'Complex',
    very_complex: 'Very Complex',
  },
  
  // Messages
  message: {
    goalReceived: '🎯 Goal Received',
    analyzing: '🧠 Analyzing',
    planning: '📋 Planning',
    executing: '⚡ Executing',
    completed: '✅ Task Completed',
    failed: '❌ Task Failed',
    noTasks: '📭 No Tasks',
    allCompleted: '✨ All Completed',
    analyzingGoal: '🎯 Goal Analysis',
    domainDetected: '📍 Domain Detected',
    complexityDetected: '📊 Complexity Detected',
    approachSuggested: '💡 Approach Suggested',
    taskDecomposition: '📦 Task Decomposition',
    agentAssignment: '🎬 Agent Assignment',
    executionStarted: '🚀 Execution Started',
    executionProgress: '📈 Execution Progress',
    executionCompleted: '🎉 Execution Completed',
    selfReflection: '🔍 Self Reflection',
    languageSwitched: '🌍 Language Switched',
    currentLanguage: '🌍 Current Language',
  },
  
  // Timeline
  timeline: {
    title: '📜 Agent Activity Timeline',
    performance: 'Agent Performance',
    totalTime: 'Total Time',
    avgTime: 'Avg Time',
  },
  
  // Hints
  hint: {
    useZh: 'Type "zh" to switch to Chinese',
    useEn: 'Type "en" to switch to English',
    switchLanguage: 'Type language code to switch: zh / en',
  },
  
  // Hooks
  hooks: {
    initialization: 'Initialization',
    analysis: 'Analysis',
    planning: 'Planning',
    execution: 'Execution',
    completion: 'Completion',
    before: 'Before',
    after: 'After',
    onError: 'On Error',
  },
  
  // Session
  session: {
    created: 'Session Created',
    recovered: 'Session Recovered',
    interrupted: 'Session Interrupted',
    completed: 'Session Completed',
    failed: 'Session Failed',
    progress: 'Progress',
    checkpoints: 'Checkpoints',
  },
  
  // Common
  common: {
    analyzing: 'Analyzing',
    planning: 'Planning',
    executing: 'Executing',
    completed: 'Completed',
    failed: 'Failed',
    pending: 'Pending',
    waiting: 'Waiting',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    total: 'Total',
    remaining: 'Remaining',
    duration: 'Duration',
    tasks: 'Tasks',
    tools: 'Tools',
    missing: 'Missing',
    installed: 'Installed',
  },
  
  // Summary
  summary: {
    title: 'Execution Summary',
    statistics: 'Statistics',
    totalTasks: 'Total Tasks',
    completed: 'Completed',
    failed: 'Failed',
    duration: 'Duration',
    agentsUsed: 'Agents Used',
    allCompleted: 'All tasks completed!',
    partialFailed: 'Some tasks failed, check logs for details.',
  },
  
  // Progress
  progress: {
    title: 'Execution Progress',
    completed: 'Completed',
  },
};

/**
 * 翻译字典
 */
const translations = {
  zh: zh_CN,
  en: en_US,
};

/**
 * 当前语言
 */
let currentLocale: Locale = 'zh';

/**
 * 获取当前语言
 */
export function getLocale(): Locale {
  return currentLocale;
}

/**
 * 设置语言
 */
export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

/**
 * 翻译函数
 */
export function t(key: string): string {
  const keys = key.split('.');
  let value: any = translations[currentLocale];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // 如果找不到，回退到英文
      value = translations['en'];
      for (const k2 of keys) {
        if (value && typeof value === 'object' && k2 in value) {
          value = value[k2];
        } else {
          return key; // 返回原始key
        }
      }
      break;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

/**
 * 获取翻译对象 (用于复杂结构)
 */
export function getTranslations(): typeof zh_CN {
  return translations[currentLocale];
}

/**
 * 切换语言
 */
export function toggleLocale(): Locale {
  currentLocale = currentLocale === 'zh' ? 'en' : 'zh';
  return currentLocale;
}

/**
 * 获取 Agent 名称 (带颜色)
 */
export function getAgentName(agentType: string): string {
  const agentKey = agentType.toLowerCase() as keyof typeof zh_CN.agent;
  const agentNames = currentLocale === 'zh' ? zh_CN.agent : en_US.agent;
  return (agentNames as any)[agentKey] || agentType;
}

/**
 * 获取领域名称
 */
export function getDomainName(domain: string): string {
  const domainKey = domain as keyof typeof zh_CN.domain;
  const domains = currentLocale === 'zh' ? zh_CN.domain : en_US.domain;
  return (domains as any)[domainKey] || domain;
}

/**
 * 获取复杂度名称
 */
export function getComplexityName(complexity: string): string {
  const complexityKey = complexity as keyof typeof zh_CN.complexity;
  const complexities = currentLocale === 'zh' ? zh_CN.complexity : en_US.complexity;
  return (complexities as any)[complexityKey] || complexity;
}

/**
 * 获取思维模式名称
 */
export function getThinkingModeName(mode: string): string {
  const modeKey = mode as keyof typeof zh_CN.thinking;
  const modes = currentLocale === 'zh' ? zh_CN.thinking : en_US.thinking;
  return (modes as any)[modeKey] || mode;
}

/**
 * 获取状态名称
 */
export function getStatusName(status: string): string {
  const statusKey = status as keyof typeof zh_CN.status;
  const statuses = currentLocale === 'zh' ? zh_CN.status : en_US.status;
  return (statuses as any)[statusKey] || status;
}

export default {
  t,
  getLocale,
  setLocale,
  toggleLocale,
  getTranslations,
  getAgentName,
  getDomainName,
  getComplexityName,
  getThinkingModeName,
  getStatusName,
};
