import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { homedir } from 'os';

/**
 * Genesis Database - SQLite wrapper for workflow and execution persistence
 */
export class GenesisDatabase {
  private db: Database.Database;

  constructor() {
    const dbDir = join(homedir(), '.project-genesis');
    mkdirSync(dbDir, { recursive: true });

    const dbPath = join(dbDir, 'genesis.db');
    this.db = new Database(dbPath);
    this.initTables();
  }

  private initTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        tasks TEXT NOT NULL,
        variables TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS executions (
        id TEXT PRIMARY KEY,
        workflow_id TEXT,
        status TEXT NOT NULL,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        cost_input_tokens INTEGER DEFAULT 0,
        cost_output_tokens INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        execution_id TEXT,
        agent_type TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL,
        output TEXT,
        error TEXT,
        started_at DATETIME,
        completed_at DATETIME
      );

      CREATE INDEX IF NOT EXISTS idx_executions_workflow_id ON executions(workflow_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_execution_id ON tasks(execution_id);
    `);
  }

  // Workflow methods
  createWorkflow(workflow: {
    id: string;
    name: string;
    description: string;
    tasks: unknown[];
    variables?: unknown[];
  }): unknown {
    const stmt = this.db.prepare(
      'INSERT INTO workflows (id, name, description, tasks, variables) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(
      workflow.id,
      workflow.name,
      workflow.description,
      JSON.stringify(workflow.tasks),
      JSON.stringify(workflow.variables || [])
    );
    return this.getWorkflow(workflow.id);
  }

  getWorkflow(id: string): unknown | null {
    const stmt = this.db.prepare('SELECT * FROM workflows WHERE id = ?');
    const row = stmt.get(id) as Record<string, unknown> | undefined;
    if (row) {
      return {
        ...row,
        tasks: JSON.parse(row.tasks as string),
        variables: JSON.parse((row.variables as string) || '[]'),
      };
    }
    return null;
  }

  listWorkflows(): unknown[] {
    const stmt = this.db.prepare(
      'SELECT * FROM workflows ORDER BY created_at DESC'
    );
    return stmt.all().map((row: unknown) => {
      const r = row as Record<string, unknown>;
      return {
        ...r,
        tasks: JSON.parse(r.tasks as string),
        variables: JSON.parse((r.variables as string) || '[]'),
      };
    });
  }

  // Execution methods
  createExecution(execution: {
    id: string;
    workflowId: string;
    status: string;
  }): unknown {
    const stmt = this.db.prepare(
      'INSERT INTO executions (id, workflow_id, status) VALUES (?, ?, ?)'
    );
    stmt.run(execution.id, execution.workflowId, execution.status);
    return this.getExecution(execution.id);
  }

  getExecution(id: string): unknown | null {
    const stmt = this.db.prepare('SELECT * FROM executions WHERE id = ?');
    return stmt.get(id) || null;
  }

  getExecutions(workflowId?: string): unknown[] {
    if (workflowId) {
      const stmt = this.db.prepare(
        'SELECT * FROM executions WHERE workflow_id = ? ORDER BY started_at DESC'
      );
      return stmt.all(workflowId);
    }
    const stmt = this.db.prepare(
      'SELECT * FROM executions ORDER BY started_at DESC LIMIT 50'
    );
    return stmt.all();
  }

  updateExecutionStatus(
    id: string,
    status: string,
    costInput?: number,
    costOutput?: number
  ): void {
    if (status === 'completed' || status === 'failed') {
      const stmt = this.db.prepare(
        'UPDATE executions SET status = ?, completed_at = CURRENT_TIMESTAMP, cost_input_tokens = COALESCE(?, cost_input_tokens), cost_output_tokens = COALESCE(?, cost_output_tokens) WHERE id = ?'
      );
      stmt.run(status, costInput || 0, costOutput || 0, id);
    } else {
      const stmt = this.db.prepare(
        'UPDATE executions SET status = ? WHERE id = ?'
      );
      stmt.run(status, id);
    }
  }
}

// Singleton instance
export const db = new GenesisDatabase();
