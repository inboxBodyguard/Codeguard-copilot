# 🚀 Complete Setup Guide - AI Security Co-pilot

## 📋 Prerequisites

Before you start, make sure you have:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **VS Code** v1.80 or higher ([Download](https://code.visualstudio.com/))
- **Git** ([Download](https://git-scm.com/))
- **AI API Key** (Anthropic Claude, OpenAI, or Groq)

Check your versions:

```bash
node --version   # Should be v18.0.0 or higher
npm --version    # Should be 9.0.0 or higher
code --version   # Should be 1.80.0 or higher
```

-----

## 📁 Step 1: Project Structure

Create your project with this exact structure:

```
security-copilot/
├── src/
│   ├── extension.ts
│   ├── patterns/
│   │   ├── securityScanner.ts
│   │   └── vulnerabilityPatterns.ts
│   ├── ai/
│   │   └── aiEngine.ts
│   └── ui/
│       ├── diagnostics.ts
│       └── quickFix.ts
├── package.json
├── tsconfig.json
├── README.md
├── .gitignore
└── .vscodeignore
```

### Create the directories:

```bash
mkdir security-copilot
cd security-copilot
mkdir -p src/patterns src/ai src/ui
```

-----

## 📝 Step 2: Create All Files

### 1. Copy each artifact I sent you into these files:

|Artifact Name                             |Save As                                |
|------------------------------------------|---------------------------------------|
|“src/extension.ts - Main Entry Point”     |`src/extension.ts`                     |
|“src/patterns/securityScanner.ts”         |`src/patterns/securityScanner.ts`      |
|“src/patterns/vulnerabilityPatterns.ts”   |`src/patterns/vulnerabilityPatterns.ts`|
|“src/ai/aiEngine.ts”                      |`src/ai/aiEngine.ts`                   |
|“src/ui/diagnostics.ts”                   |`src/ui/diagnostics.ts`                |
|“src/ui/quickFix.ts”                      |`src/ui/quickFix.ts`                   |
|“package.json - Complete Configuration”   |`package.json`                         |
|“tsconfig.json - TypeScript Configuration”|`tsconfig.json`                        |
|“README.md - Documentation”               |`README.md`                            |

### 2. Create `.gitignore`:

```bash
cat > .gitignore << 'EOF'
node_modules/
out/
.vscode-test/
*.vsix
.env
*.log
.DS_Store
EOF
```

### 3. Create `.vscodeignore`:

```bash
cat > .vscodeignore << 'EOF'
.vscode/**
.vscode-test/**
src/**
.gitignore
.yarnrc
vsc-extension-quickstart.md
**/tsconfig.json
**/.eslintrc.json
**/*.map
**/*.ts
EOF
```

-----

## 📦 Step 3: Install Dependencies

```bash
npm install
```

This installs:

- TypeScript compiler
- VS Code type definitions
- Extension packaging tool (vsce)

-----

## 🔑 Step 4: Configure API Key

You have **3 options** for storing your API key:

### Option A: VS Code Workspace Settings (Recommended)

1. Open VS Code in your project
1. Press `Ctrl+,` (or `Cmd+,` on Mac)
1. Click the “Workspace” tab
1. Search for “Security Co-pilot”
1. Set your API key there

### Option B: Environment Variable

```bash
# Linux/Mac - add to ~/.bashrc or ~/.zshrc
export ANTHROPIC_API_KEY="your-key-here"

# Windows - add to System Environment Variables
setx ANTHROPIC_API_KEY "your-key-here"
```

### Option C: User Settings (Global)

1. Open VS Code Settings (User)
1. Search for “Security Co-pilot”
1. Set API key (will apply to all projects)

**⚠️ NEVER commit API keys to Git!**

-----

## 🔨 Step 5: Build the Extension

```bash
# Compile TypeScript to JavaScript
npm run compile

# Or watch mode (auto-recompile on save)
npm run watch
```

This creates the `out/` directory with compiled JavaScript.

-----

## 🧪 Step 6: Test the Extension

### Method 1: Debug Mode (Recommended for Development)

1. Open VS Code in the `security-copilot` folder
1. Press `F5` (or Run → Start Debugging)
1. A new **Extension Development Host** window opens
1. Create a test file to scan:

```javascript
// test.js - Create this in the Extension Development Host
const userInput = req.query.search;
const query = "SELECT * FROM users WHERE name = '" + userInput + "'";
db.execute(query);
```

1. You should see red squiggles and warnings!

### Method 2: Install Locally

```bash
# Package the extension
npm run package

# This creates security-copilot-0.1.0.vsix
# Install it in VS Code:
code --install-extension security-copilot-0.1.0.vsix
```

-----

## ✅ Step 7: Verify It’s Working

Create a test file with known vulnerabilities:

### test-vulnerabilities.py

```python
import os

# Should trigger: Hardcoded Secret
API_KEY = "sk-1234567890abcdefghijklmnop"

# Should trigger: SQL Injection
user_id = request.GET['id']
query = f"SELECT * FROM users WHERE id = '{user_id}'"

# Should trigger: Command Injection
filename = request.GET['file']
os.system("cat " + filename)

# Should trigger: Weak Cryptography
import hashlib
password_hash = hashlib.md5(password.encode()).hexdigest()
```

### Expected Results:

You should see:

1. **Problems Panel** (`Ctrl+Shift+M`) shows 4 vulnerabilities
1. **Red squiggles** under vulnerable code
1. **Hover tooltips** with explanations
1. **💡 Lightbulb** for quick fixes

-----

## 🎯 Step 8: Demo Preparation

### Create Demo Files

1. **demo-sql-injection.js**

```javascript
// Vulnerable code
app.get('/search', (req, res) => {
  const search = req.query.q;
  const query = `SELECT * FROM products WHERE name = '${search}'`;
  db.execute(query);
});
```

1. **demo-xss.js**

```javascript
// Vulnerable code
function displayUserComment(comment) {
  document.getElementById('comments').innerHTML = comment;
}
```

1. **demo-secrets.py**

```python
# Vulnerable code
PASSWORD = "super_secret_password_123"
API_KEY = "sk-1234567890abcdef"
```

### Demo Script

1. **Show real-time detection**: Type vulnerable code and watch warnings appear
1. **Explain a vulnerability**: Hover over warning, click “Explain”
1. **Apply a fix**: Click lightbulb → “Apply secure fix”
1. **Scan workspace**: Command Palette → “Security Co-pilot: Scan Entire Workspace”

-----

## 🐛 Troubleshooting

### Issue: “Cannot find module ‘vscode’”

**Solution**: Make sure you ran `npm install` and you’re running the extension in Debug mode (F5), not trying to run `extension.ts` directly.

### Issue: AI analysis not working

**Solution**:

1. Check your API key is set correctly
1. Check your internet connection
1. Verify API key permissions on provider dashboard
1. Check Console output for error messages

### Issue: No vulnerabilities detected

**Solution**:

1. Make sure you’re editing a supported file type (.js, .ts, .py, .java, .php)
1. Check if real-time scanning is enabled in settings
1. Try manually scanning: `Ctrl+Shift+S`

### Issue: Extension won’t compile

**Solution**:

```bash
# Clean and rebuild
rm -rf out node_modules
npm install
npm run compile
```

-----

## 📊 Performance Tips

1. **Disable AI for large files**: AI analysis skips files >1000 lines automatically
1. **Adjust scan delay**: Increase `scanDelay` setting if typing feels laggy
1. **Disable real-time scanning**: Set `enableRealtime: false` and scan manually

-----

## 🚀 Publishing (Optional)

To publish to VS Code Marketplace:

```bash
# 1. Create publisher account at https://marketplace.visualstudio.com/

# 2. Get Personal Access Token from Azure DevOps

# 3. Login
vsce login your-publisher-name

# 4. Publish
vsce publish
```

-----

## 📚 Next Steps

1. ✅ **Test with your own code** - try different languages
1. ✅ **Customize patterns** - add your own vulnerability patterns
1. ✅ **Configure for your team** - share workspace settings
1. ✅ **Integrate with CI/CD** - automate security scanning
1. ✅ **Contribute** - add more patterns, improve AI prompts

-----

## 🆘 Getting Help

- **GitHub Issues**: https://github.com/yourusername/security-copilot/issues
- **Documentation**: See README.md
- **VS Code Extension Docs**: https://code.visualstudio.com/api

-----

## ✨ You’re Ready!

Your AI Security Co-pilot is now set up and ready to catch vulnerabilities as you code!

**Happy Secure Coding! 🛡️**