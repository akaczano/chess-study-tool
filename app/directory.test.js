
const DirectoryManager = require('./directory')

const dirManager = new DirectoryManager()
const config = {
    database: "postgres",
    username: "postgres",
    password: "password",
    options: {
        dialect: "postgres",
        host: "localhost",
        port: "5433",
        quoteIdentifiers: false           
    }
}

beforeEach(async () => {    
    await dirManager.init(config)
}) 


test('test list files', async () => {
    const { list } = await dirManager.listFiles(2)
    
    expect(list.filter(f => f.type === 0).length).toBe(1)
    expect(list.filter(f => f.type === 1).length).toBe(1)
    list.map(f => {        
        expect(f.type).toBeDefined()
        expect(f.type).toBeGreaterThanOrEqual(0)
        expect(f.type).toBeLessThanOrEqual(1)        
        expect(f.key).toBeDefined()
        if (f.type === 0) {
            expect(f.description).toBeDefined()
            expect(f.key).toBeDefined()            
        }
        else {
            expect(f.white_name).toBeDefined()
            expect(f.black_name).toBeDefined()
            expect(f.white_rating).toBeDefined()
            expect(f.black_rating).toBeDefined()
            expect(f.movetext).toBeDefined()
            expect(f.start_position).toBeDefined()
        }
    })

    const list2 = await dirManager.listFiles(19)
    expect(list2.list.filter(f => f.type === 1).length).toBe(17)
})

test('test list files path', async () => {
    const files = await dirManager.listFiles(19)
    expect(files.path.length).toBe(2)
    expect(files.path[0].id).toBe(1)
    expect(files.path[1].id).toBe(19)
})
    
test('test post new directory', async () => {        
    const name = 'Test Directory;'
    const id = await dirManager.postDirectory({
        parent_id: 1,
        description: name
    })
    expect(id).toBeGreaterThan(0)
    const { list } = await dirManager.listFiles(1)
    expect(list.filter(d => (d.type === 0 && d.description === name)).length).toBe(1)
})

test('test post existing directory', async () => {
    const name = 'Renamed 2022'
    const id = await dirManager.postDirectory({
        parent_id: 1,
        description: name,
        id: 19
    })
    expect(id).toBe(19)
    const { list } = await dirManager.listFiles(1)
    expect(list.filter(d => (d.type === 0 && d.description === name)).length).toBe(1)
    expect(list.filter(d => (d.type === 0 && d.description === '2022')).length).toBe(0)
})

test('test delete directory', async () => {
    const id = 19
    const count = await dirManager.deleteDirectory(id)    
    expect(count).toBe(1)
    const { list } = await dirManager.listFiles(1)    
    expect(list.filter(f => (f.type === 0 && f.id === id)).length).toBe(0)    
})

test('test move directory', async () => {
    const oldParentI = (await dirManager.listFiles(1)).list
    const newParentI = (await dirManager.listFiles(2)).list    
    const count = await dirManager.moveDirectory(18, 2)
    expect(count).toBe(1)     
    const oldParentF = (await dirManager.listFiles(1)).list
    const newParentF = (await dirManager.listFiles(2)).list
    expect(oldParentF.length - oldParentI.length).toBe(-1)
    expect(newParentF.length - newParentI.length).toBe(1)
})

test('test move game', async () => {
    const oldParentI = (await dirManager.listFiles(18)).list
    const newParentI = (await dirManager.listFiles()).list
    const count = await dirManager.moveGame(292, null)
    expect(count).toBe(1)
    const oldParentF = (await dirManager.listFiles(18)).list
    const newParentF = (await dirManager.listFiles()).list
    expect(oldParentF.length - oldParentI.length).toBe(-1)
    expect(newParentF.length - newParentI.length).toBe(1)    
})

test('test load game', async () => {
    const game = await dirManager.getGame(296)    
    expect(game.white_name).toBe('Gratz, Glen')
    expect(game.black_name).toBe('Kaczanowski, Aidan')
    expect(game.white_rating).toBe(2072)
    expect(game.black_rating).toBe(2010)
    expect(game.result).toBe('0-1')
    expect(game.date).toBe('2020-02-23')
    expect(game.event).toBe('USAT North')
    expect(game.round).toBe('5')
    expect(game.start_position).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    expect(game.movetext.includes('Qd7')).toBeTruthy()
    expect(game.movetext.length).toBeGreaterThan(200)
})

test('test post game', async () => {
    const id = await dirManager.postGame({
        white_name: 'Aronian, Levon',
        black_name: 'Caruana, Fabiano',
        white_rating: 2775,
        black_rating: 2801,
        result: '1/2-1/2',
        date: '2022-05-15',
        site: 'Stavanger, Norway',
        event: 'Norway Chess',
        round: '1',
        start_position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        movetext: '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6',
        parent_id: 18
    })
    expect(id).toBeGreaterThan(0)
    const game = await dirManager.getGame(id)
    expect(game.white_name).toBe('Aronian, Levon')
    const { list } = await dirManager.listFiles(18)    
    expect(list.filter(f => (f.type === 1 && f.id === id)).length).toBe(1)    

    const idAgain = await dirManager.postGame({
        id,
        white_name: 'Anand, Viswanathan',
        white_rating: 2756
    })
    expect(idAgain).toBe(id)
    const gameAgain = await dirManager.getGame(id)
    expect(gameAgain.white_name).toBe('Anand, Viswanathan')
    expect(gameAgain.white_rating).toBe(2756)
})

test('test delete game', async () => {
    const before = (await dirManager.listFiles(14)).list
    const id = 661
    const count = await dirManager.deleteGame(661)
    expect(count).toBe(1)
    const after = (await dirManager.listFiles(14)).list
    expect(after.length - before.length).toBe(-1)
    expect(after.filter(f => (f.type === 1 && f.id === id)).length).toBe(0)
})

test('test download games', async () => {
    const games = [292, 294, 293, 295, 299]
    const list = await dirManager.downloadGames(games)
    expect(list.length).toBe(games.length)
    console.log(list)
    for (const g of games) {
        expect(list.filter(f => f.id === g).length).toBe(1)
    }    
})

test('test list sessions', async () => {
    const list = await dirManager.listSessions()
    console.log(list)
    expect(list.length).toBe(1)    
})