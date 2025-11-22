# GitHub Setup Instructions

Your repository is ready to push to GitHub! Here's how to set it up:

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `mathspedia`
3. Description: "A Wikipedia clone for mathematics with authority-based editing and A/B testing"
4. Choose Public or Private
5. **Do NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 2: Add Remote and Push

```bash
cd /Users/airone/code/mathspedia

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/mathspedia.git

# Or if using SSH:
# git remote add origin git@github.com:YOUR_USERNAME/mathspedia.git

# Push to GitHub
git push -u origin main
```

## Step 3: Setup GitHub Actions Secrets (for deployment)

1. Go to your repository on GitHub
2. Settings → Secrets and variables → Actions
3. Add the following secrets:
   - `SSH_PRIVATE_KEY`: Your server's SSH private key
   - `SSH_USER`: SSH username (e.g., `deploy`)
   - `SSH_HOST`: Your server's hostname or IP

## Step 4: Verify

- Check that all files are on GitHub
- Verify `.github/workflows/deploy.yml` is present
- Test that the repository structure looks correct

## Current Status

✅ Git repository initialized
✅ All files committed
✅ Extensions setup complete
✅ Database tables created
✅ Ready for GitHub push

## Next Steps After GitHub Setup

1. **Test Extensions Locally**:
   ```bash
   ./start-mediawiki.sh
   # Visit http://localhost:8080
   ```

2. **Setup Production Server**:
   - Copy `nginx.conf.example` to your server
   - Configure SSL certificates
   - Set up the deployment workflow

3. **First Deployment**:
   - Push to `main` branch will trigger automatic deployment
   - Or manually trigger via GitHub Actions UI

## Repository Structure

```
mathspedia/
├── .github/workflows/deploy.yml    # CI/CD
├── mediawiki/extensions/            # Custom extensions
├── migrate-to-mediawiki.php        # Migration tool
├── setup-*.sh                      # Setup scripts
├── CHANGELOG.md                     # Version history
├── README.md                        # Main docs
└── ...                              # Other files
```

Your repository is ready! Just add the remote and push.

