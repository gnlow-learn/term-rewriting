import {
    assertEquals,

} from "https://deno.land/std@0.224.0/assert/mod.ts"
import {
    p,
    r,
    c,
} from "./mod.ts"

type Str = string | TemplateStringsArray

const deTemplate =
(str: Str): string =>
    Array.isArray(str)
        ? str[0]
        : str

const apply =
(rule: Str) =>
(clause: Str) =>
(expect: Str) =>
    assertEquals(
        r(rule).apply(c(clause)).toString(),
        deTemplate(expect),
    )

const toString =
(strable: Str) =>
(expect: Str) =>
    assertEquals(
        p(strable).toString(),
        deTemplate(expect),
    )

Deno.test("basic rewriting", () => {
    apply
        `double $x = $x $x`
        `double v`
        `(v v)`
})
Deno.test("toString", () => {
    toString
        `a (b)`
        `(a b)`
})