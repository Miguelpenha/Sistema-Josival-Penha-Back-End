const express = require('express')
const notifications = express.Router()
const notificationsModels = require('../../models/notification')
const mongoose = require('mongoose')

notifications.get('/', async (req, res) => {
    if (req.query.quant) {
        const notifications = await notificationsModels.find({}).select('id')
        
        res.json({quant: notifications.length})
    } else {
        const notifications = await notificationsModels.find({})
        
        res.json(notifications)
    }
})

notifications.post('/', async (req, res) => {
    const { title, message, admin, icon, created } = req.body
    
    notificationsModels.create({
        title,
        message,
        admin,
        icon,
        created: {
            data: new Date(created).toLocaleDateString(),
            hora: new Date(created).toLocaleTimeString().split(':')[0]+':'+new Date(created).toLocaleTimeString().split(':')[1],
            sistema: new Date(created).toISOString()
        }
    })
    .then(() => res.json({created: true}))
    .catch(() => res.status(400).json({error: 'Houve um erro ao criar a notificação'}))
})

notifications.delete('/:id', async (req, res) => {
    const { id } = req.params

    if (mongoose.isValidObjectId(id)) {
        const notification = await notificationsModels.findById(id)
        
        if (notification) {
            notification.deleteOne()

            res.json({deleted: true})
        } else {
            res.json({exists: false})
        }
    } else {
        res.json({exists: false})
    }
})

module.exports = notifications