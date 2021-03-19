const { createServer } = require("http");
const express = require("express");
const app = express();

const cors = require('cors')
const Middleware = require("./services/middleware");
const mw = new Middleware()
const { json, urlencoded } = require('body-parser');
app.use(json()); // support json encoded bodies
app.use(urlencoded({ extended: true })); // support encoded bodies
app.use((req, res, next) => {
	//Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
    res.header("Access-Control-Allow-Origin", "*");
	//Quais são os métodos que a conexão pode realizar na API
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    app.use(cors());

    let token = req.headers.token;

    if(req.url != '/login'){
        mw.validateSession(token, (err,succsess) => {
            if(err){
                res.status(500).json({error: err})
                return
            }
            if(succsess){
                res.setHeader('toke',token)
                next();
            }
            else 
                res.status(500).json({error: 'Please Login'})
            
        })
    }
    else 
        next();
});

app.post("/login", (req, res) => {
    let params = {
        login: req.body.login, 
        password: req.body.password
    }
    if( !params.login || !params.password){
        res.status(400).json({error: "Username or password null"})
        return
    }
    mw.login(params,(err,user_id, token) => {
        if(err){
            res.status(400).json({error: err})
        }
        else if(token){
            res.setHeader('token',token)
            res.status(200).json({user_id,token}) 
        }
        else res.status(500).json({error:"Error"})
    })
    
});

app.post("/connection/new", (req, res) => {
    let params = {
        address: req.body.address, 
        port: req.body.port, 
        is_tor: req.body.is_tor,
        description: req.body.description,
        type: req.body.type,
        destination: req.body.destination
    }
    mw.newProcess(params, (err, proc) => {
        if(err){
            res.status(400).json({ error: err})
        }
        else if(proc){
            res.status(200).json({ process: proc}) 
        }
        else res.status(500).json({ error: "Error"})
    }) 
});
app.put("/connection/:id", (req, res) => {
    let params = {
        address: req.body.address, 
        port: req.body.port, 
        is_tor: req.body.is_tor,
        description: req.body.description,
        type: req.body.type,
        destination: req.body.destination,
        connection_id: (req.params.id || req.body.connection_id)
    }
    mw.updateProcess(params, (err, proc) => {
        
        if(err){
            res.status(400).json({ error: err})
        }
        else if(proc){
            res.status(200).json({ process: proc}) 
        }
        else res.status(500).json({ error: "Error"})
    }) 
});

app.delete("/connection/:id", (req, res) => {
    let params = {
        connection_id: req.params.id
    }
    mw.deleteConnection(params, (err, proc) => {
        
        if(err){
            res.status(400).json({ error: err})
        }
        else if(proc){
            res.status(200).json({ process: proc}) 
        }
        else res.status(500).json({ error: "Error"})
    }) 
});

app.get("/connection/:connection_id/start", (req, res) => {
    let params = {
        connection_id: req.params.connection_id,
    }
    mw.startProcess(params,(err, proc) => {
        if(err){
            res.status(400).json({ error: err})
        }
        else if(proc){
            res.status(200).json({process: proc}) 
        }
        else res.status(500).json({ error: "Error"})
    })
})

app.get("/connection/:connection_id/stop", (req, res) => {
    let params = {
        connection_id: req.params.connection_id,
    }
    mw.stopProcess(params,(err, proc) => {
        if(err){
            res.status(400).json({ error: err })
        }
        else if(proc){
            res.status(200).json({ process: proc }) 
        }
        else res.status(500).json({error:"Error"})
    })
})

app.get("/port", (req, res) => {
    let params = {
        port: req.query.port,
        is_active: req.query.is_active, 
        top: req.query.top
    }
    mw.getPorts(params, (rows) => {
        if(rows){
      //      res.setHeader('token',params.token)
            res.status(200).json({ rows: rows }) 
        }
        else res.status(500).json({error:"Error"})
    })
})


app.get("/connection", (req, res) => {
    let params = {
        user_id: req.params.user_id
    }
    mw.getUserConnections(params, (err,rows) => {
        if(err){
            res.status(400).json({ error: err })
        }
        else if(rows){
      //      res.setHeader('token',params.token)
            res.status(200).json({ rows: rows }) 
        }
        else res.status(500).json({error:"Error"})
    })
})

app.get("/connection/:connection_id", (req, res) => {
    let params = {
        connection_id: req.params.connection_id,
        top: req.query.top,
    }
    mw.getConnectionLog(params, (err,rows) => {
        if(err){
            res.status(400).json({ error: err })
        }
        else if(rows){
      //      res.setHeader('token',params.token)
            res.status(200).json({ rows: rows }) 
        }
        else res.status(500).json({error:"Error"})
    })
})

createServer(app).listen(82, () => console.log("Servidor rodando local na porta 82"));
