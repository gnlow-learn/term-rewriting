import { apply, toString } from "./util.ts"

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
Deno.test("partial rewrite", () => {
    apply
        `1 = p 0`
        `p 1`
        `(p (p 0))`
})
Deno.test("peano", () => {
    apply
        `
            1 = p 0
            2 = p 1
        `
        `2`
        `(p (p 0))`
    apply
        `
            1 = p 0
            2 = p 1
        `
        `2 + 1`
        `((p (p 0)) + (p 0))`
    apply
        `
            $a + (p $b) = p ($a + $b)
            $a + 0 = $a
        `
        `((p (p 0)) + (p 0))`
        `(p (p (p 0)))`
})
