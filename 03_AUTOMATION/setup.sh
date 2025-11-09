

#!/bin/bash

# PROJECT SETUP SCRIPT
# Copies template structure to new project

set -e  # Exit on error

echo "🚀 PROJECT SETUP FROM TEMPLATE"
echo "================================"
echo ""

# Check if project name provided
if [ -z "$1" ]; then
    echo "❌ Error: Project name required"
    echo ""
    echo "Usage: ./setup.sh <project-name>"
    echo "Example: ./setup.sh my-awesome-project"
    exit 1
fi

PROJECT_NAME=$1
TARGET_DIR="../$PROJECT_NAME"

# Check if directory already exists
if [ -d "$TARGET_DIR" ]; then
    echo "❌ Error: Directory '$TARGET_DIR' already exists"
    echo "Choose a different name or remove existing directory"
    exit 1
fi

echo "📦 Creating project: $PROJECT_NAME"
echo "📂 Location: $TARGET_DIR"
echo ""

# Create project directory
mkdir -p "$TARGET_DIR"

# Copy structure
echo "📋 Copying project structure..."

# Copy main folders
cp -r "02_PROJECT_STRUCTURE" "$TARGET_DIR/"
cp -r "01_BOOTSTRAP_CONFIG" "$TARGET_DIR/"
cp -r "00_RAW_DATA_TEMPLATE" "$TARGET_DIR/"

# Copy root files
cp "README.md" "$TARGET_DIR/"
cp "SETUP_GUIDE.md" "$TARGET_DIR/"
cp ".gitignore" "$TARGET_DIR/"

echo "✅ Structure copied"
echo ""

# Initialize git
echo "🔧 Initializing git repository..."
cd "$TARGET_DIR"
git init
git add .
git commit -m "Initial commit: Project structure from template"
echo "✅ Git initialized"
echo ""

# Update project name in files
echo "✏️  Updating project name..."

# Update in metadata.yaml
sed -i.bak "s/Your Project Name Here/$PROJECT_NAME/g" "00_RAW_DATA_TEMPLATE/metadata.yaml"
rm "00_RAW_DATA_TEMPLATE/metadata.yaml.bak" 2>/dev/null || true

# Update in README
sed -i.bak "s/Your Project Name/$PROJECT_NAME/g" "README.md"
rm "README.md.bak" 2>/dev/null || true

echo "✅ Project name updated"
echo ""

# Success message
echo "🎉 PROJECT SETUP COMPLETE!"
echo ""
echo "📁 Project created at: $TARGET_DIR"
echo ""
echo "🚀 NEXT STEPS:"
echo ""
echo "1. Navigate to project:"
echo "   cd $TARGET_DIR"
echo ""
echo "2. Collect raw data:"
echo "   - Read: 00_RAW_DATA_TEMPLATE/COLLECTION_CHECKLIST.md"
echo "   - Fill: 00_RAW_DATA_TEMPLATE/ with your materials"
echo "   - Edit: 00_RAW_DATA_TEMPLATE/metadata.yaml"
echo ""
echo "3. Launch bootstrap:"
echo "   - Read: SETUP_GUIDE.md"
echo "   - Run: claude (Claude Code)"
echo ""
echo "4. Follow bootstrap instructions"
echo ""
echo "📚 Documentation:"
echo "   - Setup Guide: SETUP_GUIDE.md"
echo "   - System Guide: 02_PROJECT_STRUCTURE/PROJECT_CORE/99_SYSTEM_GUIDE.md"
echo ""
echo "Happy building! 🚀"


---

### `03_AUTOMATION/verify-tech-stack.sh`
