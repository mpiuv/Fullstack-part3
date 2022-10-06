require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
app.use(express.static('build'))
app.use(cors())
app.use(express.json())
//app.use(requestLogger)
var morgan = require('morgan')
morgan.token('post',(req,res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post'))
const Person = require('./models/person')


let persons = [
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
      },
      {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
      },
      {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
      },
      {
        "name": "Arto Hellas",
        "number": "040-12123",
        "id": 5
      }
]

app.get('/api/persons', (req, res) => {
  Person.find({}).then(notes => {
    res.json(notes)
  })
})

app.get('/info', (req, res) => {
    let date= new Date()
    let count=persons.map(n => n.id).length
    res.send('<p>Phonebook has info for '+count+' people</p><p>'+date+'</p>')
})

app.get('/api/persons/:id', (req, res, next) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
      res.json(person)
    } else {
        res.status(404).end()
    }
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
  .then(result => {
    res.status(204).end()
  })
  .catch(error => next(error))
})


app.post('/api/persons', (req, res) => {
  const body = req.body
  if (!body.name) {
    return res.status(400).json({ 
      error: 'name missing' 
    })
  }

  if (!body.number) {
    return res.status(400).json({ 
      error: 'number missing' 
    })
  }

 // if (Person.find(element => element.name.toLowerCase()===body.name.toLowerCase())){
 //   return res.status(400).json({ 
 //      error: 'name must be unique' 
 //   })
 // }

  const generateId = () => {
    return Math.ceil(1000000*Math.random())
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(result => {
    console.log('person saved!')
  })

  res.json(person)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

// tämä tulee kaikkien muiden middlewarejen rekisteröinnin jälkeen!
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})