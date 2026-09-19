# Takedown switch

Serves a genuine HTTP 404 on every path of the production domain, so the site
reads as shut down, while nothing is deleted.

This directory is **inert**. Merging it changes nothing: the live build still
uses `netlify.toml`. The switch only fires when someone deliberately swaps the
config.

## Take the site down

    cp netlify.takedown.toml netlify.toml
    git commit -am "ops: take site offline"
    git push origin main

Netlify rebuilds and publishes a site whose publish directory holds only
`404.html`, so every path returns 404. `Cache-Control: no-store` is set on
everything, so no browser or CDN edge holds the 404 once the site is restored.

Functions are not part of this config, so `/studio`, `/admin` and the
`/.netlify/functions/*` endpoints are unreachable while the site is down.

## Bring the site back

Either republish the last good deploy in the Netlify UI
(Deploys -> select the deploy -> "Publish deploy"), which is instant and needs
no build, or revert the commit:

    git revert <takedown commit>
    git push origin main

## What is never touched

Content edited in Studio lives in a site-wide Netlify Blobs store
(`netlify/functions/lib/store.mjs` calls `getStore(STORE_NAME)`, not
`getDeployStore`). Deploys do not scope or clear it, so coaches, pricing and
news survive a takedown and come back with the site.
