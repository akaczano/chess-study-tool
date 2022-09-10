const { Sequelize, DataTypes } = require('sequelize');

const sessionQuery = `
    select
        session.id,
        description,
        start_date,
        total_variations,
        coalesce(min(sequence_number), -1) as position
    from session 
        left join session_detail 
            on session.id = session_detail.session_id
            and session_detail.completed_date is null 
    group by session.id, description, total_variations, start_date;
`

const variationQuery = `
    select
        detail.*,
        game.description as game_description,
        game.side,
        session.description as session_description
    from session_detail detail
    left join session
        on detail.session_id = session.id
    left join game
        on detail.game_id = game.id
    where detail.id = $V1
`

const nextVariationQuery = `
    select
        id
    from session_detail    
    where completed_date is null and session_id = $V1
    order by sequence_number asc
    limit 1;
`

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
                ...games.map(g => { return { ...g.dataValues, key: `game_${g.id}` } })
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
        catch (err) {
            console.log(err)
        }

    }

    async deleteDirectory(id) {
        try {
            return await this.directory.destroy({ where: { id } })
        }
        catch (err) {
            console.log(err)
        }
    }

    async moveDirectory(id, parent_id) {
        return (await this.directory.update({ parent_id }, { where: { id } }))[0]
    }

    async moveGame(id, parent_id) {
        return (await this.game.update({ parent_id }, { where: { id } }))[0]
    }

    async getGame(id) {
        try {
            const g = await this.game.findOne({ where: { id } })
            return g.dataValues
        }
        catch (err) {
            console.log(err)
        }
    }

    async postGame(game) {
        try {
            if (game.id) {
                const [count, records] = await this.game.update(game, { where: { id: game.id } })
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
        catch (err) {
            console.log(err)
        }
    }

    async deleteGame(id) {
        try {
            return await this.game.destroy({ where: { id } })
        }
        catch (err) {
            console.log(err)
        }
    }

    async downloadGames(ids) {
        return await Promise.all(ids.map(i => this.getGame(i)))
    }

    async createTemplate(description, files) {
        try {
            const template = await this.template.create({ description, create_date: new Date(), update_date: new Date() })

            for (const file of files) {
                const { id, depth, stopOnEval } = file;
                console.log(file, template.id)
                await this.template_detail.create({ template_id: template.id, game_id: id, depth, stop_on_eval: stopOnEval })
            }
        }
        catch (err) {
            console.log(err)
        }             
    }

    async listTemplates() {
        try {
            const templates = await this.template.findAll()
            return templates.map(t => t.dataValues)
        }
        catch(err) {
            console.log(err)
        }
    }

    async deleteTemplate(id) {
        try {
            await this.template.destroy({where: {id}})
            return true
        }
        catch (err) {
            return false
        }
    }

    async getTemplate(id) {        
        try {
            const template = await this.template.findByPk(id)
            const lines = await this.template_detail.findAll({where: {template_id: id}})
            const files = []
            for (const line of lines) {
                const game = await this.game.findByPk(line.game_id)
                files.push({
                    ...line.dataValues,
                    movetext: game.movetext,
                    start_position: game.start_position
                })
            }

            return {
                ...template.dataValues,
                files
            }
        }
        catch(err) {
            console.log(err)
        }
    }

    async createSession(description, template_id, vars) {        
        try {
            const session = await this.session.create({
                description, 
                start_date: new Date(),
                total_variations: vars.length,
                template_id              
            })
            await this.template.update({ session_count: Sequelize.literal('session_count + 1') }, {where: {id: template_id}})
            let sn = 1
            for (const line of vars) {
                const { templateLine, movetext, start_position, game } = line;
                await this.session_detail.create({
                    session_id: session.id,
                    sequence_number: sn++,
                    movetext,
                    start_position,
                    attempts: 0,
                    total_time: 0,
                    completed_date: null,
                    game_id: game,
                    template_line: templateLine
                }) 
            }
            return session.dataValues;
        }
        catch (err) {
            console.log(err)
        }
    }

    async listSessions() {
        try {            
            const [list] = await this.sequelize.query(sessionQuery);
            return list
        }
        catch (err) {
            console.log(err)
        }
    }

    async deleteSession(id) {        
        try {
            const session = await this.session.findOne({ where: {id}})            
            await this.session.destroy({ where: {id}})            
            await this.template.update({session_count: Sequelize.literal('session_count - 1') }, {where: {id: session.template_id}})
        } catch (err) {
            console.log(err)
        }
    }

    async nextVariation(session_id) {        
        try {
            const [list] = await this.sequelize.query(nextVariationQuery.replace('$V1', session_id))     
            console.log(list)       
            if (list.length > 0) {
                return list[0].id
            }
            else {
                return -1
            }
        }
        catch (err) {
            console.log(err)
        }
    }

    async loadVariation(id) {
        console.log(`Load variation with id: ${id}`)
        try {
            const [variations] = await this.sequelize.query(variationQuery.replace('$V1', id))            
            return variations[0]
        }
        catch (err) {
            console.log(err)
        }
    }

    async updateVariation(variation) {
        try {
            await this.session_detail.update(variation, { where: {id: variation.id}})
        }
        catch(err) {
            console.log(err)
        }
    }


    async init(config) {
        const { database, username, password, options } = config;
        try {
            this.sequelize = new Sequelize(database, username, password, options)
            await this.sequelize.authenticate()

            this.directory = this.sequelize.define('Directory', {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                description: { type: DataTypes.STRING },
                parent_id: { type: DataTypes.INTEGER }
            }, { tableName: 'game_directory', timestamps: false })

            this.game = this.sequelize.define('Game', {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                parent_id: { type: DataTypes.INTEGER },
                type: { type: DataTypes.INTEGER },
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
                movetext: { type: DataTypes.STRING },
                description: { type: DataTypes.STRING },
                side: { type: DataTypes.BOOLEAN }
            }, { tableName: 'game', timestamps: false })

            this.template = this.sequelize.define('Template', {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                description: { type: DataTypes.STRING },
                create_date: { type: DataTypes.DATE },
                update_date: { type: DataTypes.DATE },
                session_count: { type: DataTypes.INTEGER },
                accuracy: { type: DataTypes.DECIMAL }
            }, { tableName: 'template', timestamps: false })

            this.template_detail = this.sequelize.define('TemplateDetail', {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                template_id: { type: DataTypes.INTEGER },
                game_id: { type: DataTypes.INTEGER },
                depth: { type: DataTypes.INTEGER },
                stop_on_eval: { type: DataTypes.BOOLEAN }
            }, { tableName: 'template_detail', timestamps: false })

            this.session = this.sequelize.define('Session', {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                description: { type: DataTypes.STRING },
                start_date: { type: DataTypes.DATE },
                total_variations: { type: DataTypes.INTEGER },
                template_id: { type: DataTypes.INTEGER }                
            }, { tableName: 'session', timestamps: false })

            this.session_detail = this.sequelize.define('SessionDetail', {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
                session_id: { type: DataTypes.INTEGER },
                sequence_number: { type: DataTypes.INTEGER },
                movetext: { type: DataTypes.STRING },
                start_position: { type: DataTypes.STRING },
                attempts: { type: DataTypes.INTEGER },
                total_time: { type: DataTypes.INTEGER },
                completed_date: { type: DataTypes.DATE },
                game_id: { type: DataTypes.INTEGER },
                template_line: { type: DataTypes.INTEGER }
            }, { tableName: 'session_detail', timestamps: false }) 

            return 0
        }
        catch (err) {
            console.log(err)
            return 1
        }
    }

}

module.exports = DirectoryManager