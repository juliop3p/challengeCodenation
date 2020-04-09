const express = require('express')
const fs = require('fs') // SALVAR OS DADOS EM UM ARQUIVO JSON
const crypto = require('crypto') // CRIPTOGRAFAR PARA SHA1
const axios = require('axios') // FAZER OS REQUESTS (GET/POST)
const FormData = require('form-data') // PARA ENVIAR O ARQUIVO JSON
const path = require('path') // PARA PEGAR O CAMINHO ABSOLUTE DO ARQUIVO JSON

const app = express()

const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

// Funcão que faz a descriptografia e retorna a frase descriptografada
const decrypt = (string, skip) => {
  const stringInArray = string.toLowerCase().split('')
  let decryptedPhrase = ''

  stringInArray.forEach(letter => {

    let index = alphabet.indexOf(letter)

    if(index < 0) {
      decryptedPhrase += letter
    } else {
      decryptedPhrase += index < 5 ? alphabet[alphabet.length + index - 5] : alphabet[index - 5]
    }

  })

  return decryptedPhrase 
}

// Envia o POST request do arquivo JSON
const sendAnswer = async () => {
  const json = path.resolve(__dirname, 'answer.json')

  const formData = new FormData()

  formData.append('answer', fs.createReadStream(json))

  const url = 'https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=SEU_TOKEN'

  const headers = formData.getHeaders() 

  try {
    const { data } = await axios.post(url, formData, { headers })
    console.log(data)
  } catch(err) {
    console.log(err)
  }

}

// Faz A Requisição GET e todo o processo pode chamar de função main()
axios.get('https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=SEU_TOKEN')
  .then(async response => {
    await fs.writeFileSync('answer.json', JSON.stringify(response.data))

    const data = require('./answer.json')

    const decrypted = decrypt(data.cifrado, data.numero_casas)
    
    const sha1 = await crypto.createHash('sha1').update(decrypted).digest('hex')

    data.decifrado = decrypted
    data.resumo_criptografico = sha1

    fs.writeFileSync('answer.json', JSON.stringify(data))

    await sendAnswer()
  })

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}!`))