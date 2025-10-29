@echo off
cd /d "%~dp0"
echo Starting Auth Service...
npx tsx watch src/index.ts
