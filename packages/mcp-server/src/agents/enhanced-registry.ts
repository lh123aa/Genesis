/**
 * Enhanced Agent Registry - 扩展版 Agent 注册表
 * 
 * 借鉴 Oh My OpenCode 的专业化 Agent 设计
 * 从 5 个基础 Agent 扩展为 10 个专业化 Agent
 */

export interface AgentCapability {
  name: string;
  description: string;
  keywords: string[];
  score: number; // 0-100, higher = more specialized
}

export interface AgentDefinition {
  id: string;
  name: string;
  type: string;
  emoji: string;
  color: string;
  description: string;
  capabilities: AgentCapability[];
  maxConcurrentTasks: number;
  preferredTaskTypes: string[];
  specialties: string[];  // 专业领域
  strength: number;       // 1-10, 能力强度
}

/**
 * 扩展后的 Agent 定义 - 10 个专业化 Agent
 */
const AGENT_DEFINITIONS: AgentDefinition[] = [
  // =========================================================================
  // 1. Scout Agent - 探索发现 Agent (保留并增强)
  // =========================================================================
  {
    id: 'scout',
    name: 'Scout Agent',
    type: 'scout',
    emoji: '🔍',
    color: 'cyan',
    description: '探索发现专家 - 负责信息收集、需求调研和初步分析',
    capabilities: [
      {
        name: 'web_research',
        description: '从网络资源研究信息',
        keywords: ['research', 'find', 'discover', 'explore', 'search', 'gather', 'investigate', '调研', '研究', '探索', '搜索'],
        score: 95,
      },
      {
        name: 'requirement_gathering',
        description: '收集和澄清需求',
        keywords: ['requirement', 'spec', 'specification', 'clarify', 'gather', '需求', '规格', '收集'],
        score: 90,
      },
      {
        name: 'competitive_analysis',
        description: '竞争分析和市场调研',
        keywords: ['competitive', 'market', 'analysis', 'compare', 'benchmark', '竞争', '市场', '分析'],
        score: 85,
      },
    ],
    maxConcurrentTasks: 3,
    preferredTaskTypes: ['research', 'discovery', 'analysis', 'exploration', 'requirement'],
    specialties: ['信息收集', '需求调研', '初步分析'],
    strength: 8,
  },

  // =========================================================================
  // 2. Coder Agent - 编码实现 Agent (保留)
  // =========================================================================
  {
    id: 'coder',
    name: 'Coder Agent',
    type: 'coder',
    emoji: '💻',
    color: 'green',
    description: '编码实现专家 - 负责代码编写、功能实现和技术攻关',
    capabilities: [
      {
        name: 'code_implementation',
        description: '编写生产代码',
        keywords: ['implement', 'code', 'write', 'develop', 'build', 'create', 'program', '实现', '编写', '开发', '创建'],
        score: 95,
      },
      {
        name: 'refactoring',
        description: '重构和改进现有代码',
        keywords: ['refactor', 'improve', 'optimize', 'clean', 'restructure', '重构', '优化', '改进'],
        score: 90,
      },
      {
        name: 'automation',
        description: '创建自动化脚本和工具',
        keywords: ['automate', 'script', 'tool', 'cli', 'pipeline', 'workflow', '自动化', '脚本', '工具'],
        score: 88,
      },
    ],
    maxConcurrentTasks: 2,
    preferredTaskTypes: ['implementation', 'coding', 'automation', 'integration'],
    specialties: ['代码实现', '功能开发', '技术攻关'],
    strength: 10,
  },

  // =========================================================================
  // 3. Tester Agent - 测试验证 Agent (保留)
  // =========================================================================
  {
    id: 'tester',
    name: 'Tester Agent',
    type: 'tester',
    emoji: '🧪',
    color: 'blue',
    description: '测试验证专家 - 负责测试编写、质量验证和缺陷排查',
    capabilities: [
      {
        name: 'unit_testing',
        description: '编写和执行单元测试',
        keywords: ['test', 'unit', 'jest', 'mocha', 'vitest', 'unittest', 'spec', '测试', '单元测试'],
        score: 95,
      },
      {
        name: 'integration_testing',
        description: '组件和系统集成测试',
        keywords: ['integration', 'e2e', 'end-to-end', 'system', 'functional', '集成测试', '端到端'],
        score: 90,
      },
      {
        name: 'bug_reproduction',
        description: '复现和验证缺陷',
        keywords: ['bug', 'reproduce', 'verify', 'issue', 'defect', 'report', 'bug', '缺陷', '复现'],
        score: 88,
      },
    ],
    maxConcurrentTasks: 2,
    preferredTaskTypes: ['testing', 'validation', 'quality', 'verification'],
    specialties: ['测试编写', '质量验证', '缺陷排查'],
    strength: 9,
  },

  // =========================================================================
  // 4. Reviewer Agent - 代码审查 Agent (保留)
  // =========================================================================
  {
    id: 'reviewer',
    name: 'Reviewer Agent',
    type: 'reviewer',
    emoji: '👀',
    color: 'yellow',
    description: '代码审查专家 - 负责代码质量审查、最佳实践检查和安全审计',
    capabilities: [
      {
        name: 'code_review',
        description: '代码质量和最佳实践审查',
        keywords: ['review', 'audit', 'quality', 'best-practice', 'standard', 'compliance', '审查', '审计', '质量'],
        score: 95,
      },
      {
        name: 'security_audit',
        description: '安全审查和漏洞评估',
        keywords: ['security', 'vulnerability', 'audit', 'penetration', 'secure', '安全', '漏洞', '审计'],
        score: 92,
      },
      {
        name: 'performance_review',
        description: '性能审查和优化建议',
        keywords: ['performance', 'optimize', 'speed', 'memory', 'cpu', 'efficiency', '性能', '优化'],
        score: 88,
      },
    ],
    maxConcurrentTasks: 3,
    preferredTaskTypes: ['review', 'audit', 'quality-check', 'assessment'],
    specialties: ['代码审查', '安全审计', '质量检查'],
    strength: 9,
  },

  // =========================================================================
  // 5. Docs Agent - 文档编写 Agent (保留)
  // =========================================================================
  {
    id: 'docs',
    name: 'Docs Agent',
    type: 'docs',
    emoji: '📝',
    color: 'magenta',
    description: '文档编写专家 - 负责技术文档、API 文档和使用指南编写',
    capabilities: [
      {
        name: 'documentation',
        description: '编写技术文档',
        keywords: ['document', 'doc', 'readme', 'guide', 'manual', 'reference', '文档', '说明', '指南'],
        score: 95,
      },
      {
        name: 'api_documentation',
        description: '编写 API 和接口文档',
        keywords: ['api-doc', 'swagger', 'openapi', 'endpoint', 'interface', 'API文档', '接口文档'],
        score: 92,
      },
      {
        name: 'tutorials',
        description: '创建教程和操作指南',
        keywords: ['tutorial', 'how-to', 'guide', 'walkthrough', 'example', '教程', '入门', '示例'],
        score: 88,
      },
    ],
    maxConcurrentTasks: 3,
    preferredTaskTypes: ['documentation', 'writing', 'explaining', 'tutorial'],
    specialties: ['技术文档', 'API文档', '教程编写'],
    strength: 8,
  },

  // =========================================================================
  // 6. Librarian Agent - 知识管理 Agent (新增)
  // =========================================================================
  {
    id: 'librarian',
    name: 'Librarian Agent',
    type: 'librarian',
    emoji: '📚',
    color: 'purple',
    description: '知识管理专家 - 负责代码库探索、文档检索和知识管理',
    capabilities: [
      {
        name: 'codebase_exploration',
        description: '探索和理解代码库结构',
        keywords: ['explore', 'navigate', 'structure', 'organization', 'understand', '探索', '导航', '结构'],
        score: 95,
      },
      {
        name: 'documentation_search',
        description: '搜索和检索文档',
        keywords: ['search', 'find', 'lookup', 'retrieve', 'document', '搜索', '查找', '文档'],
        score: 92,
      },
      {
        name: 'knowledge_management',
        description: '管理和组织知识资产',
        keywords: ['knowledge', 'organize', 'catalog', 'index', 'manage', '知识', '组织', '索引'],
        score: 88,
      },
      {
        name: 'pattern_discovery',
        description: '发现代码模式和约定',
        keywords: ['pattern', 'convention', 'style', 'standard', 'discover', '模式', '约定', '风格'],
        score: 85,
      },
    ],
    maxConcurrentTasks: 2,
    preferredTaskTypes: ['exploration', 'search', 'knowledge', 'discovery'],
    specialties: ['代码库探索', '文档检索', '模式发现', '知识管理'],
    strength: 8,
  },

  // =========================================================================
  // 7. Oracle Agent - 架构顾问 Agent (新增)
  // =========================================================================
  {
    id: 'oracle',
    name: 'Oracle Agent',
    type: 'oracle',
    emoji: '🔮',
    color: 'gold',
    description: '架构顾问专家 - 负责架构决策、技术咨询和疑难解答',
    capabilities: [
      {
        name: 'architecture_advice',
        description: '提供架构设计建议',
        keywords: ['architecture', 'design', 'structure', 'pattern', 'system', '架构', '设计', '系统'],
        score: 95,
      },
      {
        name: 'troubleshooting',
        description: '故障诊断和问题解决',
        keywords: ['troubleshoot', 'debug', 'issue', 'problem', 'solve', '诊断', '调试', '问题'],
        score: 92,
      },
      {
        name: 'best_practices',
        description: '提供最佳实践建议',
        keywords: ['best-practice', 'recommend', 'suggest', 'approach', 'method', '最佳实践', '建议', '方法'],
        score: 90,
      },
      {
        name: 'technical_explanation',
        description: '技术概念解释和答疑',
        keywords: ['explain', 'understand', 'concept', 'learn', 'what-is', '解释', '概念', '理解'],
        score: 88,
      },
    ],
    maxConcurrentTasks: 2,
    preferredTaskTypes: ['advice', 'troubleshooting', 'architecture', 'explanation'],
    specialties: ['架构设计', '技术咨询', '问题诊断', '最佳实践'],
    strength: 9,
  },

  // =========================================================================
  // 8. Builder Agent - 构建部署 Agent (新增)
  // =========================================================================
  {
    id: 'builder',
    name: 'Builder Agent',
    type: 'builder',
    emoji: '🏗️',
    color: 'orange',
    description: '构建部署专家 - 负责项目构建、CI/CD 和部署流程',
    capabilities: [
      {
        name: 'build_process',
        description: '管理项目构建流程',
        keywords: ['build', 'compile', 'package', 'bundle', '构建', '编译', '打包'],
        score: 95,
      },
      {
        name: 'cicd_pipeline',
        description: '配置 CI/CD 流水线',
        keywords: ['ci', 'cd', 'pipeline', 'deploy', 'github-actions', 'gitlab-ci', '部署', '流水线'],
        score: 92,
      },
      {
        name: 'infrastructure',
        description: '基础设施即代码',
        keywords: ['docker', 'kubernetes', 'terraform', 'infrastructure', 'iac', '容器', '编排', '基础设施'],
        score: 88,
      },
      {
        name: 'release_management',
        description: '发布管理和版本控制',
        keywords: ['release', 'version', 'tag', 'publish', 'deploy', '发布', '版本', '标签'],
        score: 85,
      },
    ],
    maxConcurrentTasks: 2,
    preferredTaskTypes: ['build', 'deploy', 'infrastructure', 'release'],
    specialties: ['项目构建', 'CI/CD', '容器部署', '发布管理'],
    strength: 8,
  },

  // =========================================================================
  // 9. Optimizer Agent - 性能优化 Agent (新增)
  // =========================================================================
  {
    id: 'optimizer',
    name: 'Optimizer Agent',
    type: 'optimizer',
    emoji: '⚡',
    color: 'red',
    description: '性能优化专家 - 负责性能分析、代码优化和效率提升',
    capabilities: [
      {
        name: 'performance_analysis',
        description: '性能分析和瓶颈定位',
        keywords: ['performance', 'analyze', 'profile', 'bottleneck', 'optimize', '性能', '分析', '瓶颈'],
        score: 95,
      },
      {
        name: 'code_optimization',
        description: '代码级性能优化',
        keywords: ['optimize', 'improve', 'refactor', 'efficiency', 'speed', '优化', '改进', '效率'],
        score: 92,
      },
      {
        name: 'database_optimization',
        description: '数据库查询优化',
        keywords: ['database', 'query', 'sql', 'index', 'optimize', '数据库', '查询', '索引'],
        score: 88,
      },
      {
        name: 'caching_strategy',
        description: '缓存策略设计和实现',
        keywords: ['cache', 'redis', 'memory', 'strategy', '缓存', '策略'],
        score: 85,
      },
    ],
    maxConcurrentTasks: 2,
    preferredTaskTypes: ['optimization', 'performance', 'efficiency', 'improvement'],
    specialties: ['性能分析', '代码优化', '数据库优化', '缓存策略'],
    strength: 9,
  },

  // =========================================================================
  // 10. Integrator Agent - 集成协调 Agent (新增)
  // =========================================================================
  {
    id: 'integrator',
    name: 'Integrator Agent',
    type: 'integrator',
    emoji: '🔗',
    color: 'teal',
    description: '集成协调专家 - 负责多模块集成、API 对接和系统协调',
    capabilities: [
      {
        name: 'api_integration',
        description: 'API 集成和对接',
        keywords: ['api', 'integrate', 'connect', 'endpoint', 'rest', 'graphql', '集成', '对接', '连接'],
        score: 95,
      },
      {
        name: 'service_coordination',
        description: '微服务协调和通信',
        keywords: ['microservice', 'coordinate', 'communicate', 'message', 'queue', '微服务', '协调', '消息'],
        score: 90,
      },
      {
        name: 'data_pipeline',
        description: '数据管道构建',
        keywords: ['pipeline', 'etl', 'data', 'flow', 'transform', '数据', '管道', 'ETL'],
        score: 85,
      },
      {
        name: 'webhook_handler',
        description: 'Webhook 配置和处理',
        keywords: ['webhook', 'callback', 'event', 'handler', 'webhook', '回调', '事件'],
        score: 82,
      },
    ],
    maxConcurrentTasks: 2,
    preferredTaskTypes: ['integration', 'connection', 'coordination', 'pipeline'],
    specialties: ['API集成', '服务协调', '数据管道', '事件处理'],
    strength: 8,
  },
];

/**
 * Agent Registry class - 扩展版
 */
export class EnhancedAgentRegistry {
  private agents: Map<string, AgentDefinition>;

  constructor() {
    this.agents = new Map();
    // Register all agents
    AGENT_DEFINITIONS.forEach(agent => {
      this.agents.set(agent.id, agent);
    });
  }

  /**
   * 获取所有可用 Agent
   */
  listAvailableAgents(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  /**
   * 根据 ID 获取 Agent
   */
  getAgent(id: string): AgentDefinition | undefined {
    return this.agents.get(id);
  }

  /**
   * 根据类型获取 Agent
   */
  getAgentByType(type: string): AgentDefinition | undefined {
    return Array.from(this.agents.values()).find(agent => agent.type === type);
  }

  /**
   * 根据关键词找到最佳 Agent
   */
  getAgentsForTask(taskDescription: string, taskType?: string): AgentDefinition[] {
    const normalizedDescription = taskDescription.toLowerCase();
    const scoredAgents: { agent: AgentDefinition; score: number }[] = [];

    for (const agent of this.agents.values()) {
      let score = 0;

      // Check capability keywords
      for (const capability of agent.capabilities) {
        for (const keyword of capability.keywords) {
          if (normalizedDescription.includes(keyword.toLowerCase())) {
            score += capability.score;
          }
        }
      }

      // Check preferred task types
      if (taskType) {
        for (const preferred of agent.preferredTaskTypes) {
          if (taskType.toLowerCase().includes(preferred.toLowerCase())) {
            score += 50;
          }
        }
      }

      // Boost score based on type hints in description
      if (normalizedDescription.includes(agent.type.toLowerCase())) {
        score += 30;
      }

      // Boost based on strength
      score += agent.strength * 2;

      if (score > 0) {
        scoredAgents.push({ agent, score });
      }
    }

    // Sort by score descending
    scoredAgents.sort((a, b) => b.score - a.score);

    // Return top 3 agents
    return scoredAgents.slice(0, 3).map(sa => sa.agent);
  }

  /**
   * 获取任务最佳 Agent
   */
  getBestAgentForTask(taskDescription: string, taskType?: string): AgentDefinition | undefined {
    const agents = this.getAgentsForTask(taskDescription, taskType);
    return agents[0];
  }

  /**
   * 检查 Agent 是否能处理特定任务
   */
  canAgentHandleTask(agentId: string, taskDescription: string): boolean {
    const agent = this.getAgent(agentId);
    if (!agent) return false;

    const normalizedDescription = taskDescription.toLowerCase();
    
    for (const capability of agent.capabilities) {
      for (const keyword of capability.keywords) {
        if (normalizedDescription.includes(keyword.toLowerCase())) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 注册自定义 Agent
   */
  registerAgent(agent: AgentDefinition): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * 获取 Agent 统计信息
   */
  getRegistryStats(): {
    totalAgents: number;
    agentTypes: string[];
    totalCapabilities: number;
    averageStrength: number;
  } {
    const agents = this.listAvailableAgents();
    const capabilities = agents.flatMap(a => a.capabilities);
    const totalStrength = agents.reduce((sum, a) => sum + a.strength, 0);
    
    return {
      totalAgents: agents.length,
      agentTypes: agents.map(a => a.type),
      totalCapabilities: capabilities.length,
      averageStrength: Math.round(totalStrength / agents.length * 10) / 10,
    };
  }

  /**
   * 按专业领域搜索 Agent
   */
  getAgentsBySpecialty(specialty: string): AgentDefinition[] {
    const normalized = specialty.toLowerCase();
    return this.listAvailableAgents().filter(agent =>
      agent.specialties.some(s => s.toLowerCase().includes(normalized))
    );
  }

  /**
   * 按强度获取 Agent (用于负载均衡)
   */
  getAvailableAgent(currentLoad: Map<string, number>): AgentDefinition | undefined {
    const agents = this.listAvailableAgents()
      .filter(agent => {
        const load = currentLoad.get(agent.id) || 0;
        return load < agent.maxConcurrentTasks;
      })
      .sort((a, b) => b.strength - a.strength);
    
    return agents[0];
  }
}

// Singleton instance
export const enhancedAgentRegistry = new EnhancedAgentRegistry();

// 兼容旧版导出
export const agentRegistry = enhancedAgentRegistry;
