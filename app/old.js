const DirectoryManager = require('./directory')
const fs = require('fs')


const runTest = async () => {
    const data = fs.readFileSync('config.json')
    const settings = JSON.parse(data.toString())
    const dirManager = new DirectoryManager()
    try {
        await dirManager.init(settings.connection)
        const files = await dirManager.listFiles(19)
        console.log(files)
    }
    catch (err) {
        console.log(err)
    }
    
}


runTest().then(() => {
    console.log('done')
})