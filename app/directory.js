const { Sequelize, DataTypes } = require('sequelize');

class DirectoryManager {
    

    async listFiles(parent) {
        const where = { parent_id: parent || null }

        const dirs = await this.directory.findAll({ where })
        const games = await this.game.findAll({ where })
        let path = []
        while (parent) {
            const dir = await this.directory.findOne({ where: { id: parent } })
            path = [{ ...dir.dataValues, type: 0, key: `directory_${parent}` }, ...path]
            parent = dir.parent_id
        }

        return {
            list: [
                ...dirs.map(d => { return { ...d.dataValues, type: 0, key: `directory_${d.id}` } }),
                ...games.map(g => { return { ...g.dataValues, type: 1, key: `game_${g.id}` } })
            ],
            path
        }
    }

    async postDirectory(dir) {
        try {
            if (dir.id) {
                // Update
                await this.directory.update(dir, { where: { id: dir.id } })
                return dir.id
            }
            else {
                // Insert
                const newDir = await this.directory.create(dir)
                return newDir.id
            }
        }
        catch(err) {
            console.log(err)
        }
                
    }

    async deleteDirectory(id) {
        try {
            return await this.directory.destroy({ where: { id }})
        }
        catch (err) {
            console.log(err)
        }
    } 

    async moveDirectory(id, parent_id) {
        return (await this.directory.update({parent_id}, { where: { id }}))[0]
    }

    async moveGame(id, parent_id) {        
        return (await this.game.update({parent_id}, { where: { id }}))[0]
    }

    async getGame(id) {
        try {
            const g = await this.game.findOne({ where: { id }})
            return g.dataValues
        }
        catch(err) {
            console.log(err)
        }
    }

    async postGame(game) {
        try {
            if (game.id) {
                const [count, records] = await this.game.update(game, { where: { id: game.id }})
                if (count < 1) {
                    throw `Game with id ${game.id} not found.`
                }
                return game.id
            }
            else {
                const newGame = await this.game.create(game)
                return newGame.id
            }
        }
        catch(err) {
            console.log(err)
        }
    }

    async deleteGame(id) {
        try {
            return await this.game.destroy({ where: { id }})
        }
        catch (err) {
            console.log(err)
        } 
    }

    async downloadGames(ids) {
        return await Promise.all(ids.map(i => this.getGame(i)))
    }    

    async init(config) {
        const { database, username, password, options } = config;
        try {
            const sequelize = new Sequelize(database, username, password, options)
            await sequelize.authenticate()

            this.directory = sequelize.define('Directory', {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                description: { type: DataTypes.STRING },
                parent_id: { type: DataTypes.INTEGER }
            }, { tableName: 'game_directory', timestamps: false })

            this.game = sequelize.define('Game', {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                parent_id: { type: DataTypes.INTEGER },
                white_name: { type: DataTypes.STRING },
                black_name: { type: DataTypes.STRING },
                white_rating: { type: DataTypes.INTEGER },
                black_rating: { type: DataTypes.INTEGER },
                event: { type: DataTypes.STRING },
                site: { type: DataTypes.STRING },
                date: { type: DataTypes.DATEONLY },
                result: { type: DataTypes.STRING },
                round: { type: DataTypes.STRING },
                start_position: { type: DataTypes.STRING },
                movetext: { type: DataTypes.STRING }
            }, { tableName: 'game', timestamps: false })
            return 0   
        }
        catch (err) {
            return 1
        }
    }
    
}

module.exports = DirectoryManager