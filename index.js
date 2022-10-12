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



app.get('/api/persons', (req, res) => {
  Person.find({}).then(notes => {
    res.json(notes)
  })
})

app.get('/info', (req, res) => {
    let date= new Date()
    let count=Person.find({}).then (persons =>
      {let count=persons.map(n => n.id).length
        res.send('<p>Phonebook has info for '+count+' people</p><p>'+date+'</p>')
      })
})
    

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
  .then(person => {
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()
    }
  })
  .catch(error => {
    console.log(error)
    res.status(400).send({ error: 'malformatted id' })
  })
})

app.delete('/api/persons/:id', (req, response, next) => {
  Person.findByIdAndRemove(req.params.id)
  .then(res => {
    response.status(204).end()
  })
  .catch(error => next(error))
})


app.post('/api/persons', (req, res, next) => {
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
   let name=body.name
   let number=body.number
   if(body.id)
    Person.findByIdAndUpdate(
      req.params.id, 
      { name, number },
      { new: true, runValidators: true, context: 'query' }
    )
    .then(updatedName => {
    console.log(res.json(updatedName))
    res.json(updatedName)
  })
  .catch( function (error) {
    console.log(error)
    next(error)
    })
else{
 let  person = new Person({
  name: body.name,
  number: body.number
  })
  person.save().
    then(result => {
    console.log('added',body.name,'number',body.number,'to phonebook')
    res.json(result)
  })      
  .catch( function (error) {
    console.log(error)
    next(error)})
  }
}
)


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// tämä tulee kaikkien muiden middlewarejen rekisteröinnin jälkeen!
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})