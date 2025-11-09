### `03_AUTOMATION/verify-tech-stack.sh`


#!/bin/bash

# TECH STACK VERIFICATION LAUNCHER
# Helps launch the tech stack verification process

set -e

echo "🔍 TECH STACK VERIFICATION"
echo "=========================="
echo ""

# Check if verification directory exists
if [ ! -d "verification" ]; then
    echo "📁 Creating verification directory..."
    mkdir -p verification
fi

# Check if prompt already generated
if [ -f "verification/VERIFICATION_PROMPT_FOR_CLAUDE.md" ]; then
    echo "✅ Verification prompt already exists"
    echo ""
    echo "📄 File: verification/VERIFICATION_PROMPT_FOR_CLAUDE.md"
    echo ""
    echo "Next steps:"
    echo "1. Open the file above"
    echo "2. Copy entire contents"
    echo "3. Go to: https://claude.ai"
    echo "4. Paste and send"
    echo "5. Wait for comprehensive analysis"
    echo "6. Copy response to: verification/tech-stack-analysis.md"
    echo "7. Return to Claude Code and type: continue"
    echo ""
else
    echo "⚠️  Verification prompt not generated yet"
    echo ""
    echo "This script should be run AFTER Claude Code generates the prompt."
    echo ""
    echo "Expected flow:"
    echo "1. Run Claude Code bootstrap"
    echo "2. Claude Code generates: verification/VERIFICATION_PROMPT_FOR_CLAUDE.md"
    echo "3. Run this script for next steps"
    echo ""
fi

# Check if analysis already done
if [ -f "verification/tech-stack-analysis.md" ]; then
    echo "✅ Tech stack analysis already completed"
    echo ""
    echo "📄 File: verification/tech-stack-analysis.md"
    echo ""
    echo "You can now continue with Claude Code!"
    echo ""
else
    echo "⏳ Waiting for tech stack analysis..."
    echo ""
    echo "After completing research in Claude.ai:"
    echo "1. Copy Claude's full response"
    echo "2. Save to: verification/tech-stack-analysis.md"
    echo "3. Commit: git add verification/ && git commit -m 'Add: Tech stack verification'"
    echo "4. Continue with Claude Code"
    echo ""
fi


---

