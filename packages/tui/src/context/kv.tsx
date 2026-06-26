import { createSignal, type Setter } from "solid-js"
import { createStore, unwrap } from "solid-js/store"
import { createSimpleContext } from "./helper"
import { Flock } from "@opencode-ai/core/util/flock"
import { Global } from "@opencode-ai/core/global"
import { readJson, writeJsonAtomic } from "../util/persistence"
import { useTuiPaths } from "./runtime"
import path from "path"

export const { use: useKV, provider: KVProvider } = createSimpleContext({
  name: "KV",
  init: () => {
    const paths = useTuiPaths()
    void Global.Path.state
    const file = path.join(paths.state, "kv.json")
    const lock = `tui-kv:${file}`
    const [ready, setReady] = createSignal(false)
    const [store, setStore] = createStore<Record<string, any>>()
    // Queue same-process writes so rapid updates persist in order.
    let write = Promise.resolve()

    Flock.withLock(lock, () => readJson<Record<string, unknown>>(file))
      .then((x) => {
        setStore(x ?? {})
      })
      .catch((error) => {
        console.error("Failed to read KV state", { error })
      })
      .finally(() => {
        setReady(true)
      })

    const result = {
      get ready() {
        return ready()
      },
      get store() {
        return store
      },
      signal<T>(name: string, defaultValue: T) {
        if (store[name] === undefined) setStore(name, defaultValue)
        return [
          function () {
            return result.get(name)
          },
          function setter(next: Setter<T>) {
            result.set(name, next)
          },
        ] as const
      },
      get(key: string, defaultValue?: any) {
        return store[key] ?? defaultValue
      },
      set(key: string, value: any) {
        setStore(key, value)
        // Get resolved value from store (setStore resolves function updaters)
        const resolved = store[key]
        write = write
          .then(() => Flock.withLock(lock, async () => {
            // Read current file state to avoid overwriting external edits
            let data: Record<string, unknown>
            try {
              data = await readJson<Record<string, unknown>>(file)
            } catch {
              data = {}
            }
            // Only update the changed key with the resolved value
            data[key] = resolved
            return writeJsonAtomic(file, data)
          }))
          .catch((error) => {
            console.error("Failed to write KV state", { error })
          })
      },
    }
    return result
  },
})
