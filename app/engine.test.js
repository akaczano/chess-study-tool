const EngineManager = require('./engine')
const manager = new EngineManager('./backend/engines')

test('test list engines', async () => {
    const list = await manager.getList()
    expect(list.length).toBe(2)
    expect(list.filter(i => i === 'stockfish').length).toBe(1)
    expect(list.filter(i => i.includes('komodo')).length).toBe(1)
})


test('test load engine', async () => {
    const engine = await manager.loadEngine('stockfish')
    expect(engine.options.length).toBe(21)
    //manager.closeEngine(engine.pid)
    manager.startEngine(engine.pid, 'r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', [])
    const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, 10000)
    })
    await promise
})