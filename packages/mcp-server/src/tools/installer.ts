/**
 * Tool Installer
 * 
 * Handles installation of MCP tools.
 * Supports automatic installation where possible, provides guidance for manual steps.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { toolRegistry } from './registry.js';
import type { ToolDetectionResult, ToolRequirement } from './detector.js';

const execAsync = promisify(exec);

export interface InstallationResult {
  success: boolean;
  toolId: string;
  message: string;
  output?: string;
  error?: string;
  requiresManualSteps: boolean;
  manualInstructions?: string[];
}

export interface BatchInstallationResult {
  successful: InstallationResult[];
  failed: InstallationResult[];
  pending: string[]; // Tools requiring manual installation
  overallSuccess: boolean;
}

/**
 * Tool Installer class
 */
export class ToolInstaller {
  private installationInProgress: Set<string> = new Set();

  /**
   * Install a single tool
   */
  async installTool(toolId: string): Promise<InstallationResult> {
    const tool = toolRegistry.getTool(toolId);
    
    if (!tool) {
      return {
        success: false,
        toolId,
        message: `Tool ${toolId} not found in registry`,
        requiresManualSteps: false,
      };
    }

    if (tool.installed) {
      return {
        success: true,
        toolId,
        message: `Tool ${tool.name} is already installed`,
        requiresManualSteps: false,
      };
    }

    if (this.installationInProgress.has(toolId)) {
      return {
        success: false,
        toolId,
        message: `Installation already in progress for ${tool.name}`,
        requiresManualSteps: false,
      };
    }

    this.installationInProgress.add(toolId);

    try {
      console.log(`📦 Installing ${tool.name}...`);

      // Check requirements
      if (tool.requirements && tool.requirements.length > 0) {
        const missingRequirements = await this.checkRequirements(tool.requirements);
        if (missingRequirements.length > 0) {
          return {
            success: false,
            toolId,
            message: `Missing requirements: ${missingRequirements.join(', ')}`,
            requiresManualSteps: true,
            manualInstructions: missingRequirements.map(r => `Install/Configure: ${r}`),
          };
        }
      }

      // Attempt installation
      let result: InstallationResult;

      if (tool.installation.command) {
        result = await this.installViaCommand(toolId, tool.installation.command);
      } else if (tool.installation.npm) {
        result = await this.installViaNpm(toolId, tool.installation.npm);
      } else {
        result = {
          success: false,
          toolId,
          message: `No automatic installation method available for ${tool.name}`,
          requiresManualSteps: true,
          manualInstructions: this.generateManualInstructions(tool),
        };
      }

      // Mark as installed if successful
      if (result.success) {
        toolRegistry.markToolInstalled(toolId);
        console.log(`  ✅ ${tool.name} installed successfully`);
      } else {
        console.log(`  ❌ ${tool.name} installation failed: ${result.message}`);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`  ❌ ${tool.name} installation error: ${errorMessage}`);
      
      return {
        success: false,
        toolId,
        message: errorMessage,
        error: errorMessage,
        requiresManualSteps: true,
        manualInstructions: this.generateManualInstructions(tool),
      };
    } finally {
      this.installationInProgress.delete(toolId);
    }
  }

  /**
   * Install multiple tools
   */
  async installTools(toolIds: string[]): Promise<BatchInstallationResult> {
    const successful: InstallationResult[] = [];
    const failed: InstallationResult[] = [];
    const pending: string[] = [];

    console.log(`\n📦 Installing ${toolIds.length} tools...\n`);

    for (const toolId of toolIds) {
      const result = await this.installTool(toolId);
      
      if (result.success) {
        successful.push(result);
      } else if (result.requiresManualSteps) {
        pending.push(toolId);
        failed.push(result);
      } else {
        failed.push(result);
      }
    }

    const overallSuccess = failed.length === 0 || 
      (failed.every(f => f.requiresManualSteps) && successful.length > 0);

    return {
      successful,
      failed,
      pending,
      overallSuccess,
    };
  }

  /**
   * Install missing tools from detection result
   */
  async installMissingTools(detectionResult: ToolDetectionResult): Promise<BatchInstallationResult> {
    const missingToolIds = detectionResult.missingTools
      .filter(req => toolRegistry.canAutoInstall(req.tool.id))
      .map(req => req.tool.id);

    if (missingToolIds.length === 0) {
      console.log('ℹ️  No auto-installable tools found');
      return {
        successful: [],
        failed: [],
        pending: detectionResult.missingTools.map(r => r.tool.id),
        overallSuccess: true,
      };
    }

    return this.installTools(missingToolIds);
  }

  /**
   * Install tool via npm
   */
  private async installViaNpm(toolId: string, npmPackage: string): Promise<InstallationResult> {
    try {
      console.log(`  Running: npm install -g ${npmPackage}`);
      const { stdout, stderr } = await execAsync(`npm install -g ${npmPackage}`, {
        timeout: 120000, // 2 minute timeout
      });

      return {
        success: true,
        toolId,
        message: `Successfully installed ${npmPackage}`,
        output: stdout,
        requiresManualSteps: false,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        toolId,
        message: `npm install failed: ${errorMessage}`,
        error: errorMessage,
        requiresManualSteps: true,
      };
    }
  }

  /**
   * Install tool via command
   */
  private async installViaCommand(toolId: string, command: string): Promise<InstallationResult> {
    try {
      console.log(`  Running: ${command}`);
      const { stdout, stderr } = await execAsync(command, {
        timeout: 120000,
      });

      return {
        success: true,
        toolId,
        message: `Successfully executed installation command`,
        output: stdout,
        requiresManualSteps: false,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        toolId,
        message: `Command failed: ${errorMessage}`,
        error: errorMessage,
        requiresManualSteps: true,
      };
    }
  }

  /**
   * Check if requirements are met
   */
  private async checkRequirements(requirements: string[]): Promise<string[]> {
    const missing: string[] = [];

    for (const req of requirements) {
      const reqLower = req.toLowerCase();
      
      // Check for common requirements
      if (reqLower.includes('git')) {
        const hasGit = await this.checkCommandExists('git');
        if (!hasGit) missing.push('Git');
      }
      else if (reqLower.includes('node') || reqLower.includes('npm')) {
        const hasNode = await this.checkCommandExists('node');
        if (!hasNode) missing.push('Node.js');
      }
      else if (reqLower.includes('python')) {
        const hasPython = await this.checkCommandExists('python') || 
                         await this.checkCommandExists('python3');
        if (!hasPython) missing.push('Python');
      }
      else if (reqLower.includes('docker')) {
        const hasDocker = await this.checkCommandExists('docker');
        if (!hasDocker) missing.push('Docker');
      }
      else if (reqLower.includes('playwright') || reqLower.includes('chromium')) {
        // Playwright typically installed via npm, check if npx playwright works
        const hasPlaywright = await this.checkCommandExists('npx playwright');
        if (!hasPlaywright) missing.push('Playwright/Chromium');
      }
      else if (reqLower.includes('github_token')) {
        if (!process.env.GITHUB_TOKEN) {
          missing.push('GITHUB_TOKEN environment variable');
        }
      }
      else if (reqLower.includes('aws')) {
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
          missing.push('AWS credentials');
        }
      }
      // Add more checks as needed
    }

    return missing;
  }

  /**
   * Check if a command exists
   */
  private async checkCommandExists(command: string): Promise<boolean> {
    try {
      await execAsync(`${command} --version`, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate manual installation instructions
   */
  private generateManualInstructions(tool: ReturnType<typeof toolRegistry.getTool>): string[] {
    if (!tool) return [];

    const instructions: string[] = [];
    
    instructions.push(`Manual Installation for ${tool.name}:`);
    instructions.push('');
    
    if (tool.installation.npm) {
      instructions.push(`1. Install via npm:`);
      instructions.push(`   npm install -g ${tool.installation.npm}`);
    }
    
    if (tool.installation.command) {
      instructions.push(`1. Run installation command:`);
      instructions.push(`   ${tool.installation.command}`);
    }

    if (tool.requirements && tool.requirements.length > 0) {
      instructions.push('');
      instructions.push('2. Ensure requirements are met:');
      tool.requirements.forEach(req => {
        instructions.push(`   - ${req}`);
      });
    }

    instructions.push('');
    instructions.push('3. Verify installation by checking the tool is available');

    return instructions;
  }

  /**
   * Get installation status for all tools
   */
  getInstallationStatus(): {
    installed: string[];
    notInstalled: string[];
    canAutoInstall: string[];
    requiresManual: string[];
  } {
    const allTools = toolRegistry.listAllTools();
    
    return {
      installed: allTools.filter(t => t.installed).map(t => t.id),
      notInstalled: allTools.filter(t => !t.installed).map(t => t.id),
      canAutoInstall: allTools.filter(t => !t.installed && toolRegistry.canAutoInstall(t.id)).map(t => t.id),
      requiresManual: allTools.filter(t => !t.installed && !toolRegistry.canAutoInstall(t.id)).map(t => t.id),
    };
  }

  /**
   * Generate installation report
   */
  generateReport(batchResult: BatchInstallationResult): string {
    const lines: string[] = [];
    
    lines.push('\n📊 Installation Report');
    lines.push('='.repeat(50));
    
    lines.push(`\n✅ Successfully installed: ${batchResult.successful.length}`);
    for (const result of batchResult.successful) {
      const tool = toolRegistry.getTool(result.toolId);
      lines.push(`   ✓ ${tool?.name || result.toolId}`);
    }

    if (batchResult.pending.length > 0) {
      lines.push(`\n⏸️  Pending manual installation: ${batchResult.pending.length}`);
      for (const toolId of batchResult.pending) {
        const tool = toolRegistry.getTool(toolId);
        lines.push(`   ⚠ ${tool?.name || toolId}`);
        
        // Show manual instructions
        if (tool) {
          const instructions = this.generateManualInstructions(tool);
          instructions.forEach(inst => lines.push(`      ${inst}`));
        }
      }
    }

    if (batchResult.failed.length > 0) {
      const autoFailed = batchResult.failed.filter(f => !f.requiresManualSteps);
      if (autoFailed.length > 0) {
        lines.push(`\n❌ Failed: ${autoFailed.length}`);
        for (const result of autoFailed) {
          const tool = toolRegistry.getTool(result.toolId);
          lines.push(`   ✗ ${tool?.name || result.toolId}: ${result.message}`);
        }
      }
    }

    lines.push('\n' + '='.repeat(50));
    
    if (batchResult.overallSuccess) {
      lines.push('✨ Installation process completed');
    } else {
      lines.push('⚠️  Some installations require manual intervention');
    }

    return lines.join('\n');
  }

  /**
   * Simulate installation (for testing/demo)
   */
  async simulateInstall(toolId: string): Promise<InstallationResult> {
    const tool = toolRegistry.getTool(toolId);
    
    if (!tool) {
      return {
        success: false,
        toolId,
        message: `Tool ${toolId} not found`,
        requiresManualSteps: false,
      };
    }

    console.log(`[SIMULATION] Installing ${tool.name}...`);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (toolRegistry.canAutoInstall(toolId)) {
      console.log(`[SIMULATION] ✓ ${tool.name} would be installed via: ${toolRegistry.getInstallationCommand(toolId)}`);
      return {
        success: true,
        toolId,
        message: `[SIMULATION] ${tool.name} installed successfully`,
        requiresManualSteps: false,
      };
    } else {
      console.log(`[SIMULATION] ⚠ ${tool.name} requires manual installation`);
      return {
        success: false,
        toolId,
        message: `[SIMULATION] ${tool.name} requires manual installation`,
        requiresManualSteps: true,
        manualInstructions: this.generateManualInstructions(tool),
      };
    }
  }
}

// Singleton instance
export const toolInstaller = new ToolInstaller();
