//se importa mongoose
const mongoose = require('mongoose')
//Configuracion de mongodb atlas
mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI
console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log(result)
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })
const giftSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  password: {
    type: String,
    minLength: 8,
    require: true
  },
  concursado: {
    type: Boolean,
    default: false
  },
  asignado: {
    type: Boolean,
    default: false
  },
  idAsignado: {
    type: String,
  },
  date: { type: Date, default: Date.now },
})

giftSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
module.exports = mongoose.model('Gift', giftSchema)