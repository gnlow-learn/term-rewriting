import {
    assertEquals,

} from "https://deno.land/std@0.224.0/assert/mod.ts"
import {
    r,
    c,
} from "./mod.ts"

const test =
(rule: string | TemplateStringsArray) =>
(clause: string | TemplateStringsArray) =>
(expect: string | TemplateStringsArray) =>
    assertEquals(
        r(rule).apply(c(clause)).toString(),
        Array.isArray(expect)
            ? expect[0]
            : expect,
    )

Deno.test("basic rewriting", () => {
    test
        `double $x = $x $x`
        `double v`
        `(v v)`
})