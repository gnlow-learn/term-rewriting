export type Knowledge = Record<string, Clause>

export const zip =
<T extends unknown[]>
(...arrs: {[K in keyof T]: T[K][]}): T[] => {
    const result = []
    for (
        let i = 0;
        arrs.some(x => x[i]);
        i++
    ) {
        result.push(arrs.map(x => x[i]) as T)
    }
    return result
}

export interface Clause {
    data: Clause[]
    unify(target: Clause): false | Knowledge
    apply(knowledge: Knowledge): Clause
    replace(target: Clause, f: (result: Clause) => Clause): Clause
    toString(): string
}

export const Clause = {
    parse(clauseStr: string) {
        clauseStr += " "
        const tokens: Clause[] = []
        let token = ""
        const flush = () => {
            if (token) {
                tokens.push(new Terminal(token))
                token = ""
            }
        }
        for (let i=0; i<clauseStr.length; i++) {
            if (/[a-zA-Z0-9$+]/.test(clauseStr[i])) {
                token += clauseStr[i]
                continue
            } else if (clauseStr[i] == "(") {
                let inner = ""
                for (
                    i++;
                    i<clauseStr.length
                    && clauseStr[i] != ")";
                    i++
                ) {
                    inner += clauseStr[i]
                }
                tokens.push(Clause.parse(inner))
            }
            flush()
        }
        return tokens.length == 1
            ? tokens[0]
            : new NonTerminal(tokens)
    }
}

export class Terminal implements Clause {
    readonly str
    get id() {
        return this.str.startsWith("$")
            ? this.str.substring(1)
            : false
    }
    get data() {
        return [this]
    }
    constructor(str: string) {
        this.str = str
    }
    unify(target: Clause): false | Knowledge {
        //console.log("unify:", this.toString() + ",", target.toString())
        return this.id
            ? { [this.id]: target }
            : target instanceof Terminal
                ? (this.str == target.str) && {}
                    || !!target.id && target.unify(this)
                : target.unify(this)
    }
    apply(knowledge: Knowledge): Clause {
        return this.id
            && knowledge[this.id]
            || this
    }
    replace(target: Clause, f: (result: Clause) => Clause): Clause {
        return this.unify(target) ? f(this) : this
    }
    toString() {
        return this.str
    }
}

export class NonTerminal implements Clause {
    data
    constructor(data: Clause[]) {
        this.data = data
    }
    unify(target: Clause) {
        //console.log("unify:", this.toString() + ",", target.toString())
        const vars: Knowledge = {}
        return zip(this.data, target.data)
            .every(([me, you]) => {
                if (!me || !you) return false
                const u = you.unify(me)
                return u && Object.assign(vars, u)
            }) && vars
    }
    apply(knowledge: Knowledge) {
        return new NonTerminal(
            this.data.map(x => x.apply(knowledge))
        )
    }
    replace(target: Clause, f: (result: Clause) => Clause): Clause {
        return this.unify(target) ? f(this) : new NonTerminal(this.data.map(x => x.replace(target, f)))
    }
    toString(): string {
        return "(" + this.data.map(x =>  x.toString()).join(" ") + ")"
    }

}

export class Rule {
    from
    to
    constructor(from: Clause, to: Clause) {
        this.from = from
        this.to = to
    }
    apply(clause: Clause) {
        return clause.replace(this.from, result => {
            //console.log("  find:", result.toString(), "\n  apply:", this.toString())
            const v = this.to.apply(this.from.unify(result) || {})
            //console.log("  result:", v.toString())
            return v
        })
    }
    toString() {
        return `${
            this.from.toString()
        } = ${
            this.to.toString()
        }`
    }
    static parse(ruleStr: string) {
        const [from, to] = ruleStr.split("=")
        return new Rule(
            Clause.parse(from),
            Clause.parse(to),
        )
    }
}

export class Program {
    rules
    constructor(rules: Rule[]) {
        this.rules = rules
    }
    apply(query: Clause) {
        while (true) {
            const rule = this.rules.find(rule => rule.apply(query).toString() != query.toString())
            if (!rule) break
            console.log(
                "app",
                "\n    " + query.toString().substring(0, 20),
                "\n    " + rule.toString(),
                "\n    " + "-".repeat(20),
                "\n    " + rule.apply(query).toString()
            )
            query = rule.apply(query) as NonTerminal
        }
        return query
    }
    toString() {
        return this.rules.map(rule => rule.toString()).join("\n")
    }
    static parse(programStr: string) {
        return new Program(programStr.trim().split("\n").map(Rule.parse))
    }
}

export const parse =
(input: string | TemplateStringsArray) => {
    const str: string = Array.isArray(input) ? input[0] : input
    const eqs = [...str].filter(x => x == "=").length

    return (
        eqs > 1
            ? Program
        : eqs == 1
            ? Rule
            : Clause
    ).parse(str)
}
export const r = parse as (input: string | TemplateStringsArray) => Rule
export const c = parse as (input: string | TemplateStringsArray) => Clause
export const p = parse as (input: string | TemplateStringsArray) => Program
