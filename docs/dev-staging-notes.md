# Staging site for dev branches (not set up)

GitHub Pages publishes one branch per repo. Production comes from `main` at
https://aoroot.parameterz.com, so a dev branch has no live URL to test on
phones and other devices. These notes describe a fix: deploy dev branches to a
second repo that has its own Pages site.

Status: **not set up, and not planned** (decided 2026-11-16). The site is close
to a full release and changes are now small fixes, so a second repo and a
deploy key aren't worth it. To check a change on a phone first, run
`python3 -m http.server` in the repo folder and open the computer's local IP
address from the phone on the same Wi-Fi.

The workflow was never added to the repo. The proposed
`.github/workflows/staging.yml` is at the end of these notes; to revive the
idea, save it at that path and do the setup below. Without the setup, every
push to a non-main branch would fail at the deploy step because the secret is
missing.

## How it works

- Every push to a branch other than `main` (or a manual run from the Actions
  tab) copies the site into `parameterz/aoroot-staging`.
- GitHub Pages serves that repo at https://parameterz.github.io/aoroot-staging/.
- The last branch pushed wins: staging shows whatever was pushed most recently.
  The staging repo's commit message records which branch and commit it shows.
- The workflow:
  - leaves out `CNAME`, so staging never tries to claim `aoroot.parameterz.com`.
  - adds a `robots.txt` that tells search engines to stay away. The pages'
    canonical tags already point to production as well.
  - builds with Jekyll, the same way production does.

## One-time setup

1. **Create the repo** `parameterz/aoroot-staging` on GitHub. Make it
   public, because free accounts get Pages only on public repos. Leave it empty.
2. **Make a deploy key** (an SSH key that works only for that one repo):
   ```
   ssh-keygen -t ed25519 -C "aoroot-staging deploy" -f staging_key -N ""
   ```
   This creates `staging_key` (private) and `staging_key.pub` (public).
3. **In aoroot-staging:** Settings → Deploy keys → Add deploy key. Paste the
   contents of `staging_key.pub` and tick **Allow write access**.
4. **In aoroot:** Settings → Secrets and variables → Actions → New repository
   secret. Name it `STAGING_DEPLOY_KEY` and paste the contents of `staging_key`.
   Then delete both key files from your machine.
5. **Push a dev branch.** The first run creates the `main` branch in
   aoroot-staging.
6. **In aoroot-staging:** Settings → Pages → Deploy from a branch, and choose
   `main` / `(root)`.

## Known gap: 404 page

`404.html` uses root-absolute paths (`/css/site.css` and so on). At the
`/aoroot-staging/` subpath, the staging 404 page loads without styles. All
other pages use relative paths and work fine.

If you want staging to match production exactly, give the staging repo a
custom domain, such as `staging.parameterz.com`:
- Add a DNS CNAME record: `staging` → `parameterz.github.io`.
- Set that domain in aoroot-staging → Settings → Pages → Custom domain.
- Have the workflow write `staging.parameterz.com` into `_site/CNAME`. For
  example, add `cname: staging.parameterz.com` to the `peaceiris/actions-gh-pages`
  step. Otherwise each deploy can wipe out the custom domain setting.

## Other options considered

- **Local server** (`python -m http.server`): fine on one machine, awkward for
  testing on several devices.
- **Netlify or Cloudflare Pages branch previews**: each branch gets its own
  preview URL. This is easier if several branches need previews at the same
  time, but it means using a second service.
- **Pointing Pages at the dev branch for a while**: avoid it, because the live
  site would show unfinished work.

## Proposed staging.yml

```yaml
# Deploy any non-main branch to the staging site (parameterz/aoroot-staging).
# The last branch pushed wins: staging always shows the most recent push.
name: Deploy to staging

on:
  push:
    branches-ignore: [main]
  workflow_dispatch:

concurrency:
  group: staging
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build staging copy
        run: |
          mkdir _site
          # Leave out the production CNAME so staging never claims aoroot.parameterz.com.
          rsync -a --exclude .git --exclude .github --exclude _site --exclude CNAME ./ _site/
          # Keep search engines off the staging copy.
          printf 'User-agent: *\nDisallow: /\n' > _site/robots.txt

      - uses: peaceiris/actions-gh-pages@v4
        with:
          deploy_key: ${{ secrets.STAGING_DEPLOY_KEY }}
          external_repository: parameterz/aoroot-staging
          publish_branch: main
          publish_dir: ./_site
          force_orphan: true
          enable_jekyll: true   # match production, which GitHub Pages builds with Jekyll
          full_commit_message: "Staging: ${{ github.ref_name }} @ ${{ github.sha }}"
```
