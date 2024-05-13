type Knowledge = Record<string, Clause>

const zip =
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

interface Clause {
    data: Clause[]
    unify(target: Clause): false | Knowledge
    apply(knowledge: Knowledge): Clause
    toString(): string
}

const Clause = {
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
            if (/[a-zA-Z$]/.test(clauseStr[i])) {
                token += clauseStr[i]
                continue
            } else if (clauseStr[i] == "(") {
                let inner = ""
                for (i++; clauseStr[i] != ")"; i++) {
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

class Terminal implements Clause {
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
        return this.id
            ? { [this.id]: target }
            : target instanceof Terminal
                ? (this.str == target.str) && {}
                    || target.unify(this)
                : false
    }
    apply(knowledge: Knowledge): Clause {
        return this.id
            && knowledge[this.id]
            || this
    }
    toString() {
        return this.str
    }
}

class NonTerminal implements Clause {
    data
    constructor(data: Clause[]) {
        this.data = data
    }
    unify(target: Clause) {
        const vars: Knowledge = {}
        return zip(this.data, target.data)
            .every(([me, you]) => {
                const u = you.unify(me)
                return u && Object.assign(vars, u)
            }) && vars
    }
    apply(knowledge: Knowledge) {
        return new NonTerminal(
            this.data.map(x => x.apply(knowledge))
        )
    }
    toString(): string {
        return this.data.map(x => {
            if (x instanceof NonTerminal) {
                return x.toString()
            } else {
                return `(${x.toString()})`
            }
        }).join(" ")
    }

}

class Rule {
    from
    to
    constructor(from: NonTerminal, to: NonTerminal) {
        this.from = from
        this.to = to
    }
    apply(clause: NonTerminal) {
        const u = this.from.unify(clause)
        if (!u) return u

        return this.to.apply(u)
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

console.log(Rule.parse("a (b c) d = p").toString())
console.log(Clause.parse("a").unify(Clause.parse("$e")))
console.log(Rule.parse("a = b").apply(Clause.parse("a")))