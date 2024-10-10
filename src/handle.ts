import { HttpServerRequest } from "@effect/platform"
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder"
import * as DateTime from "effect/DateTime"
import * as Effect from "effect/Effect"
import { MyHttpApi } from "./api"

export const HttpAppLive = HttpApiBuilder.group(MyHttpApi, "app", (handles) =>
  Effect.gen(function*() {
    yield* Effect.log("Hello")

    return handles.pipe(
      HttpApiBuilder.handle("index", () =>
        Effect.gen(function*() {
          const now = yield* DateTime.now
          const serverRequest = yield* HttpServerRequest.HttpServerRequest
          const headers = serverRequest.headers
          const ip = headers["cf-connecting-ip"] || headers["x-forwarded-for"] || headers["x-real-ip"] || "unknown"

          const ratelimitKey = ip

          const { success } = yield* Effect.promise(() => globalThis.env.RATE_LIMITER.limit({ key: ratelimitKey }))

          const message = success ? `IP: ${ip} - Hello - ${now}` : `IP: ${ip} - Too many requests`

          return message
        })),
      HttpApiBuilder.handle("health", () => Effect.succeed("ok"))
    )
  }))
