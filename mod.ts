const rules = [
    `eq $a $b = eq $b $a`,
]

type ClauseData = (Clause | string)[]

class Clause {
    data
    constructor(data: ClauseData) {
        this.data = data
    }
    toString(): string {
        return this.data.map(x => {
            if (typeof x == "string") {
                return x
            } else {
                return `(${x.toString()})`
            }
        }).join(" ")
    }

    static parse(clauseStr: string) {
        clauseStr += " "
        const tokens: ClauseData = []
        let token = ""
        const flush = () => {
            if (token) {
                tokens.push(token)
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
        return new Clause(tokens)
    }
}

class Rule {
    from
    to
    constructor(from: Clause, to: Clause) {
        this.from = from
        this.to = to
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