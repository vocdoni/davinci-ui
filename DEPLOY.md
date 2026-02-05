# Deployment guide

## Digital Ocean

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
4. Set the component `Custom Page` in `Settings` tab to `Catchall` option, and set the `Page Name` to `index.html`.