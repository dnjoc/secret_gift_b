const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
//const mongoose = require('mongoose')
require('dotenv').config()

const Gift = require('./models/person')

const errorHandler = (error, request, response, next) => {
  console.error('mensaje error', error.message)
  console.log('error. errors', error.errors)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    if (error.errors.name && error.errors.name.kind === 'minlength') {
      return response.status(400).json({ error: 'Name must be at least 3 characters long' })
    } return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(cors())
//agregamos el middleware integrado de Express llamado static
app.use(express.static('dist'))
// Middleware
app.use(express.json())
app.use(morgan('tiny'))
// API endpoints
app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'),
    '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
  ].join(' ')
}))

morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.get('/', (request, response) => {
  response.send('<h1>Backend Amigo Secreto</h1>')
})

//configuracion get para consulta en mongodb
app.get('/api/persons', (request, response) => {
  Gift.find({}).then(persons => {
    response.json(persons)
  })
})
app.get('/info', (request, response) => {
  response.send(`<p>Amigo Secreto Diciembre 2024</p><p>${new Date()}</p>`)
})

//buscar persona por ID con mongoose
app.get('/api/persons/:id', (request, response, next) => {
  //console.log(request.params.id)
  const id = request.params.id

  Gift.findById(id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

//convierte la primera letra de cada palabra en Mayuscula
const capitalizeName = (name) => {
  return name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
app.post('/api/persons', (request, response, next) => {
  //app.post('/api/persons', (request, response) => {
  const body = request.body
  if (!body.name || !body.password) {
    let msg
    //mensaje especifico al dato faltante
    if (!body.name) {
      msg = 'name missing'
    } else {
      msg = 'password missing'
    }
    return response.status(400).json({
      error: msg
    })
  }
  //Se busca si existe el nombre para indicar que no puede ser agregado
  const person = new Gift({
    name: capitalizeName(body.name),
  })
  // persons = persons.concat(person)
  person.save().then(savePerson => {
    response.json(savePerson)
  })
    .catch(error => next(error))
  //response.json(person)
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.password) {
    let msg
    //mensaje especifico al dato faltante
    if (!body.name) {
      msg = 'name missing'
    } else {
      msg = 'number missing'
    }
    return response.status(400).json({
      error: msg
    })
  }
  const gift = {
    name: body.name,
    password: body.password,
    concursado: body.concursado,
    asignado: body.asignado,
    idAsignado: body.idAsignado,
  }
  Gift.findByIdAndUpdate(request.params.id, gift, { new: true })
    .then(updatedGift => {
      response.json(updatedGift)
    })
    .catch(error => next(error))
})
//eliminar registro por id en mongoose
// app.delete('/api/persons/:id', (request, response) => {
//   const id = request.params.id
//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return response.status(400).json({ error: 'Invalid ID format' })
//   }
//   Gift.findByIdAndDelete(id)
//     .then(result => {
//       if (result) {
//         response.status(204).end()
//       } else {
//         response.status(404).json({ error: 'Person not found' })
//       }
//     })
//     .catch(error => {
//       console.error('Error during deletion:', error.message)
//       response.status(500).json({ error: 'An error occurred while deleting the person' })
//     })
// })

app.use(unknownEndpoint)
app.use(errorHandler)
//const PORT = process.env.PORT || 3001
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})