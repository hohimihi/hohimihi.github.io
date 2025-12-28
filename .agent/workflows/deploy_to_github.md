---
description: How to deploy your portfolio to GitHub Pages (Free Hosting)
---

You are ready to deploy! I have already initialized Git and committed your files.

### 1. Create a Repository
1. Go to [GitHub.com/new](https://github.com/new) and log in.
2. Repository name: `portfolio` (or `username.github.io`).
3. Make it **Public**.
4. Click **Create repository**.

### 2. Connect & Push
Run these commands in your terminal (copy code from GitHub page generally looks like this):
> Replace `YOUR_USERNAME` with your actual GitHub username.

```powershell
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages
1. Go to your new repository on GitHub.
2. Click **Settings** > **Pages** (sidebar).
3. Under **Build and deployment** > **Branch**, select `main` and save.
4. Wait 1-2 minutes. GitHub will give you a live URL!

### Alternative: Netlify / Vercel
If you prefer Vercel:
1. Go to Vercel.com and login.
2. Click "Add New Project".
3. Import your new GitHub repository.
4. Click "Deploy". It works automatically.

### Already have a portfolio? (Overwrite)
If you already have a `username.github.io` repo and want to **replace it** with this new one:

1.  **Warning**: This will overwrite your old website.
2.  Run these commands:

```powershell
# Add your EXISTING repo URL
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Force push to replace the old site with this new structure
git push -f origin main
```
The change will go live in a few minutes.
