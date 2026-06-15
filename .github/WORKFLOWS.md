# GitHub Actions Workflows

This document explains the CI/CD workflows configured for this project.

## 📋 Workflow Overview

### 1. CI - Build and Test (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**What it does:**
- ✅ Tests build on multiple Node.js versions (18.x, 20.x)
- ✅ Runs TypeScript type checking
- ✅ Uploads build artifacts (from Node 20.x)
- ✅ Provides build status check for PRs

**Matrix Testing:**
- Ensures compatibility across Node.js 18 and 20
- Parallel execution for faster feedback

**Artifacts:**
- Build output stored for 7 days
- Available for download from workflow runs

---

### 2. Deploy to GitHub Pages (`deploy.yml`)

**Triggers:**
- Automatic: Push to `main` branch
- Manual: Workflow dispatch button

**What it does:**
- 🚀 Builds production-optimized bundle
- 🌐 Deploys to GitHub Pages
- 🔒 Uses proper permissions for Pages deployment
- 🔄 Prevents concurrent deployments

**Setup Required:**
1. Go to **Settings** → **Pages**
2. Set source to **GitHub Actions**
3. Push to `main` to deploy

**Output:**
- Live site at: `https://<username>.github.io/<repo-name>/`
- Deployment URL provided in workflow output

---

### 3. Preview Deployment (`preview.yml`)

**Triggers:**
- Pull request opened
- Pull request synchronized (new commits)
- Pull request reopened

**What it does:**
- 📦 Builds preview version
- 💬 Comments on PR with build status
- 📥 Uploads preview artifacts for testing

**Benefits:**
- Test changes before merging
- Download build artifacts for manual testing
- Automated feedback on build success

---

## 🔧 Configuration

### Environment Variables

**Production Build:**
- `NODE_ENV=production` - Set automatically in deploy workflow
- Base path configured in `vite.config.ts`

### Permissions

**GitHub Pages Deployment:**
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### Concurrency

- Only one deployment runs at a time
- New deployments cancel in-progress ones

---

## 🛡️ Status Checks

### Required Checks (Recommended)

Configure these as required status checks in **Settings** → **Branches**:

- ✅ `Build and Test / build (18.x)`
- ✅ `Build and Test / build (20.x)`
- ✅ `Lint Check`
- ✅ `Build Status Check`

This ensures all tests pass before merging PRs.

---

## 📊 Monitoring

### Workflow Status Badges

Add to your README:

```markdown
![CI](https://github.com/<username>/<repo>/actions/workflows/ci.yml/badge.svg)
![Deploy](https://github.com/<username>/<repo>/actions/workflows/deploy.yml/badge.svg)
```

### Viewing Results

1. Go to **Actions** tab in repository
2. Click on workflow run to see details
3. Download artifacts if needed
4. Check deployment URLs in deploy workflow

---

## 🐛 Troubleshooting

### Build Fails

**Check:**
- All dependencies are in `package.json`
- No missing environment variables
- TypeScript has no type errors: `npx tsc --noEmit`

### Deployment Fails

**Check:**
- GitHub Pages is enabled in settings
- Workflow has proper permissions
- Base path in `vite.config.ts` matches repository name

### Preview Not Working

**Check:**
- PR is from the same repository (not a fork)
- Workflow has read/write permissions for issues (to comment)
- Build completes successfully

---

## 🚀 Best Practices

1. **Always create PRs** - Let CI validate changes before merging
2. **Review workflow logs** - Catch issues early
3. **Use branch protection** - Require passing checks
4. **Test locally first** - Run `npm run build` before pushing
5. **Monitor deployments** - Check GitHub Pages after merge

---

## 📝 Updating Workflows

To modify workflows:

1. Edit files in `.github/workflows/`
2. Test changes in a separate branch
3. Create PR to review workflow changes
4. Merge after validation

**Important:** Workflow changes take effect immediately on merge to default branch.
