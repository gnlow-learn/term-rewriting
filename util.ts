import {
    assertEquals,

} from "https://deno.land/std@0.224.0/assert/mod.ts"
import {
    parse,
    r,
    c,
} from "./mod.ts"

type Str = string | TemplateStringsArray

export const deTemplate =
(str: Str): string =>
    Array.isArray(str)
        ? str[0]
        : str

export const apply =
(rule: Str) =>
(clause: Str) =>
(expect: Str) =>
    assertEquals(
        r(rule).apply(c(clause)).toString(),
        deTemplate(expect),
    )

export const toString =
(strable: Str) =>
(expect: Str) =>
    assertEquals(
        parse(strable).toString(),
        deTemplate(expect),
    )