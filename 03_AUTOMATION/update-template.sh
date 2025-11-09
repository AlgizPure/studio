### `03_AUTOMATION/update-template.sh`


#!/bin/bash

# TEMPLATE UPDATE SCRIPT
# Updates template with improvements from completed projects

set -e

echo "🔄 TEMPLATE UPDATE"
echo "=================="
echo ""

# Check if source project provided
if [ -z "$1" ]; then
    echo "❌ Error: Source project path required"
    echo ""
    echo "Usage: ./update-template.sh <source-project-path>"
    echo "Example: ./update-template.sh ../my-completed-project"
    exit 1
fi

SOURCE_PROJECT=$1

# Check if source exists
if [ ! -d "$SOURCE_PROJECT" ]; then
    echo "❌ Error: Source project not found: $SOURCE_PROJECT"
    exit 1
fi

echo "📂 Source: $SOURCE_PROJECT"
echo ""

# Check what to update
echo "What would you like to update?"
echo ""
echo "1. AI Instructions (improved .cursorrules, etc.)"
echo "2. System Guide (updated based on learnings)"
echo "3. Examples (add as example project)"
echo "4. All of the above"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "📋 Updating AI Instructions..."
        
        # Backup current
        cp -r "02_PROJECT_STRUCTURE/AI_INSTRUCTIONS" "02_PROJECT_STRUCTURE/AI_INSTRUCTIONS.backup"
        
        # Copy improved files
        cp "$SOURCE_PROJECT/02_PROJECT_STRUCTURE/AI_INSTRUCTIONS/.cursorrules" \
           "02_PROJECT_STRUCTURE/AI_INSTRUCTIONS/"
        cp "$SOURCE_PROJECT/02_PROJECT_STRUCTURE/AI_INSTRUCTIONS/.clauderules" \
           "02_PROJECT_STRUCTURE/AI_INSTRUCTIONS/"
        
        echo "✅ AI Instructions updated"
        echo "⚠️  Backup saved to: 02_PROJECT_STRUCTURE/AI_INSTRUCTIONS.backup"
        ;;
        
    2)
        echo ""
        echo "📖 Updating System Guide..."
        
        cp -r "02_PROJECT_STRUCTURE/PROJECT_CORE/99_SYSTEM_GUIDE.md" \
              "02_PROJECT_STRUCTURE/PROJECT_CORE/99_SYSTEM_GUIDE.md.backup"
        
        cp "$SOURCE_PROJECT/02_PROJECT_STRUCTURE/PROJECT_CORE/99_SYSTEM_GUIDE.md" \
           "02_PROJECT_STRUCTURE/PROJECT_CORE/"
        
        echo "✅ System Guide updated"
        echo "⚠️  Backup saved"
        ;;
        
    3)
        echo ""
        echo "📚 Adding example project..."
        
        # Get project name
        PROJECT_NAME=$(basename "$SOURCE_PROJECT")
        EXAMPLE_DIR="04_EXAMPLES/$PROJECT_NAME"
        
        mkdir -p "$EXAMPLE_DIR"
        
        # Copy structure (without node_modules, etc.)
        rsync -av --exclude='node_modules' \
                  --exclude='.git' \
                  --exclude='dist' \
                  --exclude='build' \
                  "$SOURCE_PROJECT/02_PROJECT_STRUCTURE/" \
                  "$EXAMPLE_DIR/"
        
        # Create README for example
        cat > "$EXAMPLE_DIR/README.md" << EOF
# Example Project: $PROJECT_NAME

**Type:** [Project Type]
**Completed:** $(date +%Y-%m-%d)
**Team Size:** [X] developers

## Overview

[Brief description of what this project was]

## Key Features

- Feature 1
- Feature 2
- Feature 3

## Tech Stack

- Frontend: [Stack]
- Backend: [Stack]
- Database: [DB]

## Lessons Learned

- Lesson 1
- Lesson 2
- Lesson 3

## Useful Patterns

[Any patterns from this project worth highlighting]
EOF
        
        echo "✅ Example added: $EXAMPLE_DIR"
        echo "⚠️  Don't forget to edit: $EXAMPLE_DIR/README.md"
        ;;
        
    4)
        echo ""
        echo "🔄 Updating everything..."
        
        # Run all updates
        bash $0 "$SOURCE_PROJECT" 1
        bash $0 "$SOURCE_PROJECT" 2
        bash $0 "$SOURCE_PROJECT" 3
        
        echo "✅ All updates complete"
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 UPDATE COMPLETE!"
echo ""
echo "📋 Next steps:"
echo "1. Review changes"
echo "2. Test with a new project"
echo "3. Commit updates:"
echo "   git add ."
echo "   git commit -m 'Update: Template improvements from $PROJECT_NAME'"
echo "   git push"
echo ""


