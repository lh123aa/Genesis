# Project Genesis MCP Server 启动脚本
# PowerShell 版本

# 设置编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Project Genesis MCP Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 获取脚本所在目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PackageDir = Join-Path $ScriptDir "packages\mcp-server"

# 检查并构建
$DistPath = Join-Path $PackageDir "dist\index.js"
if (-not (Test-Path $DistPath)) {
    Write-Host "[INFO] 首次运行，正在构建..." -ForegroundColor Yellow
    Set-Location $PackageDir
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] 构建失败！" -ForegroundColor Red
        Read-Host "按 Enter 键退出"
        exit 1
    }
    Write-Host "[OK] 构建完成！" -ForegroundColor Green
    Write-Host ""
}

# 启动服务
Write-Host "[INFO] 启动 Genesis MCP Server..." -ForegroundColor Cyan
Write-Host "[INFO] 按 Ctrl+C 停止服务" -ForegroundColor Gray
Write-Host ""

Set-Location $PackageDir
try {
    node dist\index.js
} catch {
    Write-Host ""
    Write-Host "[WARNING] 服务已停止" -ForegroundColor Yellow
    Read-Host "按 Enter 键退出"
}
