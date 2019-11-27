const express = require('express')
const app = express()
const axios = require('axios')
const d3 = require('d3')

const id = "d75456e5099e1a296f5d"
const secret = "009d78ce03d34d40a189850b9eb197bb12f2c9d8"

app.use(express.static(__dirname + '/public'))

app.get('/callback', (req, res) => {
    const token = req.query.code;
    axios({
        method: 'post',
        url: `https://github.com/login/oauth/access_token?client_id=${id}&client_secret=${secret}&code=${token}`,
        headers: {
             accept: 'application/json'
        }

    }).then((response) => {
    
        const accessToken = response.data.access_token
        console.log(response.data)
        
        // redirect the user to the home page, along with the access token
        res.redirect(`/home.html?access_token=${accessToken}`)
    })
})

app.listen(8000)
