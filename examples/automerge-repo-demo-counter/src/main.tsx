import React from "react"
import ReactDOM from "react-dom/client"
import { App } from "./App.js"
import { Repo } from "@automerge/automerge-repo"
import { MessageChannelNetworkAdapter } from "@automerge/automerge-repo-network-messagechannel"
import { RepoContext } from "@automerge/automerge-repo-react-hooks"

// We run the network & storage in a separate file and the tabs themselves are stateless and lightweight.
// This means we only ever create one websocket connection to the sync server, we only do our writes in one place
// (no race conditions) and we get local real-time sync without the overhead of broadcast channel.
// The downside is that to debug any problems with the sync server you'll need to find the shared-worker and inspect it.
// In Chrome-derived browsers the URL is chrome://inspect/#workers. In Firefox it's about:debugging#workers.
// In Safari it's Develop > Show Web Inspector > Storage > IndexedDB > automerge-repo-demo-counter.

const sharedWorker = new SharedWorker(
  new URL("./shared-worker.ts", import.meta.url),
  {
    type: "module",
    name: "automerge-repo-shared-worker",
  }
)

/* Create a repo and share any documents we create with our local in-browser storage worker. */
const repo = new Repo({
  network: [new MessageChannelNetworkAdapter(sharedWorker.port)],
  sharePolicy: async peerId => peerId.includes("shared-worker"),
})

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <RepoContext.Provider value={repo}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </RepoContext.Provider>
)
