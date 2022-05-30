const fs = require('fs')
const { execFile } = require('node:child_process')
const path = require('path')

class EngineHandler {
    constructor(proc, loadHandler) {
        this.buffer = ''
        this.onLoad = loadHandler
        this.options = []
        this.proc = proc
        this.status = 'loading'

        proc.stdout.on('data', (data) => {
            this.buffer += data
            this.parse()
        })
        proc.stdin.write('uci\n')
        this.timer = setInterval(() => {            
            if (this.onUpdate) this.onUpdate(this.state)
        }, 200)
        
    }    
    

    setUpdateHandler(handler) {
        this.onUpdate = handler
    }

    hasNext() {
        return this.buffer.indexOf('\n') !== -1
    }

    nextCommand() {
        let command = ''
        let ptr = 0
        while (!command.endsWith('\n')) command += this.buffer.charAt(ptr++)
        this.buffer = this.buffer.substring(ptr) 
            
        return command
    }

    isChessMove(token) {
        if (token.length < 4 || token.length > 5) return false
        for (let i = 0; i < 4; i++) {
            const c = token.charCodeAt(i);
            if (i % 2 == 0 && (c < 'a'.charCodeAt(0) || c > 'h'.charCodeAt(0))) return false;
            if (i % 2 != 0 && (c < '0'.charCodeAt(0) || c > '9'.charCodeAt(0))) return false;
        }
        if (token.length > 4) {
            const p = token.charAt(4);
            return p == 'r' || p == 'n' || p == 'b' || p == 'q';
        }
        return true;
    }

    parse() {
        while (this.hasNext()) {
            const cmd = this.nextCommand().trim()            
            const words = cmd.split(' ')
            
            if (words.length < 1) return
            if (words[0] === 'uciok') {                
                this.status = 'loaded'
                this.onLoad()
            }
            else if (words[0].toLowerCase() === 'option') {
                let name = null
                let val = null
                let option = {}

                for (let i = 1; i < words.length; i++) {
                    if (['name', 'type', 'default', 'min', 'max', 'var'].includes(words[i].toLowerCase())) {
                        if (val) {
                            option.vars.push(val)
                            val = null
                        }
                    }

                    if (name === null && words[i] === 'name') {
                        name = ''
                    }
                    else if (words[i].toLowerCase() === 'type') {
                        option.type = words[++i].toLowerCase()
                    }
                    else if (words[i].toLowerCase() === 'default') {
                        option.defaultValue = words[++i]
                    }
                    else if (words[i].toLowerCase() === 'min') {
                        option.min = parseInt(words[++i])
                    }
                    else if (words[i].toLowerCase() === 'max') {
                        option.max = parseInt(words[++i])
                    }
                    else if (words[i].toLowerCase() === 'var') {
                        val = ''
                    }
                    else if (name !== null) {
                        if (name.length > 0) name += ' '
                        name += words[i]
                    }
                    else if (val !== null) {
                        if (val.length > 0) val += ' '
                        val += words[i]
                    }
                }
                option.name = name
                if (option.defaultValue && option.type === 'check') {
                    option.defaultValue = option.defaultValue.toLowerCase() === 'true' ? true : false
                }
                else if (option.defaultValue && option.type === 'spin') {
                    option.defaultValue = parseInt(option.defaultValue)
                }
                else if (!option.defaultValue) {
                    option.defaultValue = ''
                }
                this.options.push(option)
            }
            else if (words[0] === 'info') {    

                let es = this.state[0]
                let pv = null
                let update = false
                for (let i = 1; i < words.length; i++) {
                    const tok = words[i].toLowerCase()
                    if (tok === 'depth') {
                        es.depth = parseInt(words[++i])
                    }
                    else if (tok === 'time') {
                        es.time = parseInt(words[++i])
                    }
                    else if (tok === 'nodes') { 
                        es.nodes = parseInt(words[++i])
                    }
                    else if (tok === 'multipv') {
                        let pvi = parseInt(words[++i]) - 1
                        es = this.state[pvi]
                    }
                    else if (tok === 'score') {
                        update = true
                        es.scoreType = words[++i].toLowerCase()
                        es.score = parseInt(words[++i])
                    }
                    else if (tok === 'pv') {
                        update = true
                        pv = []
                    }
                    else if (tok === 'tbhits') {
                        es.tbhits = parseInt(words[++i])
                    }
                    else if (tok === 'nps') {
                        es.nps = parseInt(words[++i])
                    }
                    else if (pv && this.isChessMove(tok)) {
                        pv.push(tok)
                    }
                }
                if (pv) {
                    es.principleVariation = pv
                }                    
            }
        }        
    }

    start(position, options) {
        let multipv = 1
        for (const opt of options) {
            const option  = this.options.find(o => o.name === opt.name)
            if (option) {
                this.proc.stdin.write(`setoption name ${opt.name}`)
                if (option.type !== 'button') {
                    this.proc.stdin.write(` value ${opt.value}}`)
                }
                this.proc.stdin.write('\n')
                if (opt.name.toLowerCase() === 'multipv') {
                    multipv = opt.value
                }
            }
        }
        this.state = []
        for (let i = 0; i < multipv; i++) {            
            this.state.push({ running: true })
        }
                
        this.proc.stdin.write(`position fen ${position}\n`)
        this.proc.stdin.write(`go infinite\n`)
        this.status = 'running'
    }

    stop() {
        for (let i = 0; i < this.state.length; i++) {
            this.state[i].running = false
        }
        this.proc.stdin.write('stop\n')
        this.status = 'stopped'
    }

    restart(position, options) {
        this.stop()
        this.start(position, options)
    }

    close() {
        this.proc.kill()
        clearInterval(this.timer)
        this.status = 'closed'        
    }
}

class EngineManager {    
        
    constructor(path) {
        this.path = path        
    }

    setPath(path) {
        this.path = path
    }

    setUpdateHandler(handler) {
        this.updateHandler = handler
    }

    async getList() {
        const promise = new Promise((resolve, reject) => {
            fs.readdir(this.path, (err, files) => {
                if (err) {
                    reject(err)
                }
                else {                    
                    resolve(files)
                }
            })
        })
        try {
            return await promise
        }
        catch (err) {
            console.log(err)
        }
    }

    async loadEngine(name) {

        if (this.engine) {
            this.engine.stop()
            this.engine.close()
        }

        const file = path.join(this.path, name)
        const proc = execFile(file)        
        const promise = new Promise((resolve, reject) => {
            this.engine = new EngineHandler(proc, () => resolve())           
        })
        await promise
        this.engine.setUpdateHandler(newState => this.updateHandler(newState)) 
        
        return this.engine.options        
    }

    async startEngine(position, options) {        
        this.engine?.start(position, options)
        return this.engine?.state
    }

    async stopEngine() {
        this.engine?.stop()
    }

    async restartEngine(position, options) {        
        this.engine?.restart(position, options)
    }

    async closeEngine() {
        if (this.engine) {
            this.engine.close()
            this.engine = null
        }        
    }

    
}

module.exports = EngineManager