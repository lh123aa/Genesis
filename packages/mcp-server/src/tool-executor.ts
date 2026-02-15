/**
 * Tool Executor - Research task planning for Agent tasks
 * 
 * Detects research needs and prepares queries for execution.
 * Actual web search is performed by the main AI context.
 */

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
}

export interface ResearchQuery {
  id: string;
  query: string;
  numResults?: number;
  type?: 'market' | 'technology' | 'general';
}

// Predefined research queries for Qatar market research
export const qatarResearchQueries: Record<string, ResearchQuery[]> = {
  'qatar-market-trends-2026': [
    { id: 'q1', query: 'Qatar 2026 economic growth forecast market trends', numResults: 8, type: 'market' },
    { id: 'q2', query: 'Qatar foreign trade investment opportunities 2026', numResults: 8, type: 'market' },
    { id: 'q3', query: 'Qatar Vision 2030 projects infrastructure development', numResults: 6, type: 'market' },
  ],
  'qatar-ecommerce': [
    { id: 'e1', query: 'Qatar e-commerce market size growth 2025 2026', numResults: 8, type: 'market' },
    { id: 'e2', query: 'Doha retail digital transformation online shopping', numResults: 6, type: 'market' },
    { id: 'e3', query: 'Qatar payment gateway fintech online transactions', numResults: 6, type: 'market' },
  ],
  'qatar-energy-renewables': [
    { id: 'r1', query: 'Qatar solar energy renewable projects 2025 2026', numResults: 8, type: 'market' },
    { id: 'r2', query: 'Qatar green hydrogen clean energy investment opportunities', numResults: 6, type: 'market' },
  ],
  'qatar-healthcare': [
    { id: 'h1', query: 'Qatar healthcare market medical tourism 2025', numResults: 8, type: 'market' },
    { id: 'h2', query: 'Qatar pharmaceutical healthcare infrastructure development', numResults: 6, type: 'market' },
  ],
  'qatar-logistics': [
    { id: 'l1', query: 'Qatar logistics hub Hamad Port trade 2025 2026', numResults: 8, type: 'market' },
    { id: 'l2', query: 'Qatar air freight cargo airport expansion projects', numResults: 6, type: 'market' },
  ],
  'qatar-tech-digital': [
    { id: 't1', query: 'Qatar digital government smart city technology 2025', numResults: 8, type: 'market' },
    { id: 't2', query: 'Qatar AI artificial intelligence innovation hub', numResults: 6, type: 'technology' },
  ],
};

/**
 * Determine which research topic matches the goal
 */
export function detectResearchTopic(goal: string): string | null {
  const goalLower = goal.toLowerCase();
  
  const topicMap: Record<string, string[]> = {
    'qatar-market-trends-2026': ['qatar market', 'qatar economy', 'qatar 2026', 'qatar economic', '卡塔尔市场', '卡塔尔经济'],
    'qatar-ecommerce': ['ecommerce', 'e-commerce', 'online shopping', 'retail', '电商', '零售', '网购'],
    'qatar-energy-renewables': ['energy', 'renewable', 'solar', 'hydrogen', '绿色能源', '太阳能', '清洁能源'],
    'qatar-healthcare': ['healthcare', 'health', 'medical', 'pharmaceutical', '医疗', '健康', '医药'],
    'qatar-logistics': ['logistics', 'port', 'shipping', 'cargo', '物流', '港口', '货运'],
    'qatar-tech-digital': ['digital', 'technology', 'ai', 'smart city', '数字化', '科技', '人工智能', '智慧城市'],
  };
  
  for (const [topic, keywords] of Object.entries(topicMap)) {
    if (keywords.some(k => goalLower.includes(k))) {
      return topic;
    }
  }
  
  // Default to market trends if Qatar is mentioned
  if (goalLower.includes('qatar') || goalLower.includes('卡塔尔')) {
    return 'qatar-market-trends-2026';
  }
  
  return null;
}

/**
 * Get research queries for a topic
 */
export function getResearchQueries(topic: string): ResearchQuery[] {
  return qatarResearchQueries[topic] || [];
}

/**
 * Plan research task with queries
 */
export function planResearch(goal: string): {
  needsResearch: boolean;
  topic: string | null;
  queries: ResearchQuery[];
  description: string;
} {
  const topic = detectResearchTopic(goal);
  
  if (!topic) {
    return {
      needsResearch: false,
      topic: null,
      queries: [],
      description: 'No specific research topic detected',
    };
  }
  
  const queries = getResearchQueries(topic);
  
  const topicNames: Record<string, string> = {
    'qatar-market-trends-2026': '卡塔尔2026年市场经济趋势',
    'qatar-ecommerce': '卡塔尔电商市场',
    'qatar-energy-renewables': '卡塔尔清洁能源',
    'qatar-healthcare': '卡塔尔医疗健康',
    'qatar-logistics': '卡塔尔物流运输',
    'qatar-tech-digital': '卡塔尔数字化科技',
  };
  
  return {
    needsResearch: true,
    topic,
    queries,
    description: `需要研究: ${topicNames[topic] || topic}`,
  };
}

/**
 * Execute task with real tools based on agent type and task
 * Returns research plan that should be executed by main AI
 */
export function planTaskWithTools(
  agentType: string,
  taskName: string,
  taskDescription: string,
  goal: string
): { 
  result: string; 
  needsExecution: boolean;
  researchPlan?: {
    topic: string;
    queries: ResearchQuery[];
  };
} {
  // For Scout agents doing research, plan real web search
  if (agentType === 'scout') {
    const research = planResearch(goal);
    
    if (research.needsResearch) {
      return {
        result: `[SCOUT] 需要执行网络搜索研究: ${research.description}`,
        needsExecution: true,
        researchPlan: {
          topic: research.topic!,
          queries: research.queries,
        },
      };
    }
  }
  
  return {
    result: `[${agentType.toUpperCase()}] Task "${taskName}" - ${taskDescription}`,
    needsExecution: false,
  };
}

/**
 * Aggregate research results into a final report
 */
export function aggregateResearchResults(allResults: Map<string, any>): string {
  const researchData: any[] = [];
  
  allResults.forEach((value: any) => {
    if (value?.keyFindings) {
      researchData.push(...value.keyFindings);
    }
  });
  
  if (researchData.length === 0) {
    return 'No research data collected.';
  }
  
  // Format as a readable report
  let report = '\n## 📊 Research Findings Summary\n\n';
  
  researchData.forEach((finding: any, idx: number) => {
    report += `${idx + 1}. **${finding.title}**\n`;
    report += `   ${finding.snippet}...\n\n`;
  });
  
  return report;
}
