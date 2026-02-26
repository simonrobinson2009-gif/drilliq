# DrillIQ

Football drill animations for Instagram Reels and YouTube Shorts.

---

## Folder structure

```
drilliq/
├── index.html          ← drill library home page
├── assets/
│   ├── engine.js       ← shared animation engine (edit once, applies to all drills)
│   └── style.css       ← shared styles
└── drills/
    ├── drill-01.html   ← The Basic Wall Pass
    ├── drill-02.html   ← Wall Pass & Third Man Run
    └── drill-03.html   ← Overlap & Cutback
```

To add a new drill: copy any drill HTML file, rename it `drill-04.html`,
and change the config block inside the `<script>` tag. Nothing else needs touching.

---

## How to put this online (GitHub Pages) — step by step

You only need to do the setup once. After that, adding a new drill is just
dragging a file into a folder on the GitHub website.

---

### Step 1 — Create a free GitHub account

1. Go to **https://github.com**
2. Click **Sign up** and follow the steps
3. Choose the free plan

---

### Step 2 — Create a new repository

A repository (repo) is just a folder on GitHub that stores your files.

1. Once logged in, click the **+** button (top right) → **New repository**
2. Name it exactly: `drilliq`
3. Make sure it is set to **Public** (required for free GitHub Pages)
4. Tick **Add a README file**
5. Click **Create repository**

---

### Step 3 — Upload the files

1. On your new repo page, click **Add file** → **Upload files**
2. Upload everything — keep the folder structure exactly as it is:
   - `index.html` goes in the root
   - `assets/engine.js` and `assets/style.css` go inside an `assets` folder
   - `drills/drill-01.html` etc. go inside a `drills` folder

   **Tip:** You can drag the entire `drilliq` folder from your computer straight
   into the upload area and GitHub will preserve the folder structure automatically.

3. Scroll down, leave the commit message as-is, click **Commit changes**

---

### Step 4 — Turn on GitHub Pages

1. In your repo, click **Settings** (top menu)
2. In the left sidebar click **Pages**
3. Under **Branch**, select `main` from the dropdown, leave the folder as `/ (root)`
4. Click **Save**

GitHub will show a message: *"Your site is being published"*

Wait about 60 seconds, then refresh the page.
You will see a green box with your live URL — it will look like:

```
https://YOUR-USERNAME.github.io/drilliq/
```

That is your drill library homepage. Each drill has its own URL:

```
https://YOUR-USERNAME.github.io/drilliq/drills/drill-01.html
https://YOUR-USERNAME.github.io/drilliq/drills/drill-02.html
https://YOUR-USERNAME.github.io/drilliq/drills/drill-03.html
```

---

### Step 5 — Share the links

Put the library URL in your Instagram bio.
Link to individual drills in your post captions.

---

## Adding a new drill later

1. Go to your repo on GitHub
2. Click into the `drills/` folder
3. Click **Add file** → **Upload files**
4. Upload your new `drill-04.html` file
5. Click **Commit changes**

The new drill is live within seconds. No technical knowledge needed.

---

## Making changes to an existing drill

1. Go to your repo → `drills/` folder → click the file you want to edit
2. Click the **pencil icon** (Edit this file)
3. Make your changes in the editor
4. Click **Commit changes**

Changes go live within seconds.

---

## Updating the engine (branding, bug fixes)

Edit `assets/engine.js` on GitHub the same way as above.
Because all drill pages link to this one file, your change applies to every
drill instantly — no need to update each file individually.
