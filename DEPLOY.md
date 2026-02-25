# Deployment guide

## Digital Ocean

### App spec

Use the following template to define the deploy service and components:
```yaml
- buildpack-stack=ubuntu-22
ingress:
  rules:
  - component:
      name: react-ui
    match:
      authority:
        exact: ""
      path:
        prefix: /
name: YOUR_APP_NAME_HERE
region: fra
static_sites:
- catchall_document: index.html
  environment_slug: node-js
  github:
    branch: main
    deploy_on_push: true
    repo: vocdoni/davinci-ui
  name: davinci-ui
  source_dir: /
```

Just change `YOUR_APP_NAME_HERE` with your app name.

### Manual configuration
1. Create a new `App Platform` service using this repository as source code: 
    ```
    https://github.com/vocdoni/davinci-ui.git
    ```
2. Create a new `Static Site` component inside the service.
3. Define the following env vars for the app (or only for the component):
    ```sh
    WALLETCONNECT_PROJECT_ID=<wallet-connect-project-id>
    SEQUENCER_URL=<davinci-sequencer-url>
    CENSUS3_URL=<census3-service-url>
    ```
    > These variables **must** be defined in build time.
4. Set the component `Custom Page` in the `Settings` tab to the `Catchall` option, and set the `Page Name` to `index.html`. This is required for client-side routing in this Single Page Application: all paths (for example `/vote/123`) must serve `index.html` so that React Router's `BrowserRouter` can handle navigation in the browser.