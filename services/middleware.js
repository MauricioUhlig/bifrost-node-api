const Processes = require("../infra/process"); 
const DB = require('../repository/database');
const utils = require('../utils/utils')


class Middleware {
    constructor(){
        this.processes = new Processes()
        this.database = new DB()
    }

    login(params, callback){
        let {login, password} = params
        if (!login || !password){
            callback('Invalid parameters',null)
            return
        }
        this.database.getLogin(login,password,row => {
            if(!row){
                callback('User or Password wrong',null)
                return
            }
            let token = utils.randKey(20)
            this.database.createSession(row.user_id, token, callback)

        })
    }
    
    validateSession(token, callback){
        if(!token){
            callback('Invalid token',null)
            return
        }
        this.database.getSession(token, (err,row) => {
            if(!row){
                callback('Invalid token',null)
                return
            }
            let dt = Date.parse(row.login_date)
            var hours = Math.abs(Date.now() - dt) / 36e5;
            callback(null,hours < 5  && row.logout == 0 ? true : false)
        })
    }

    newProcess(params,callback){

        let {address, port, description, is_tor, type, destination } = params
        if(!address || !port || !type || !(["TCP","UDP"].includes(type)) ){
            callback('invalid parameters',null)
            return
        }
        this.database.isConnectionPortFree(destination, res => {
            if(res)
                this.database.insertConnection(address, port, is_tor, type, description, destination, connection_id => callback(null, connection_id))
            else 
                callback('Port aready in use by other connection',null)
        })
    };
    
    updateProcess(params, callback){
        let {address, port, description, is_tor, type, destination, connection_id } = params
        if(!address || !port || !type || !(["TCP","UDP"].includes(type)) ||!connection_id){
            callback('invalid parameters',null)
            return
        }
        this.database.isConnectionPortFree(destination, res => {
            if(res)
                this.database.updateConnection(connection_id, address, port, is_tor, type, description, destination, connection => callback(null, connection))
            else 
                callback('Port aready in use by other connection',null)
        })
    }
    deleteConnection(params, callback){
        let {connection_id } = params
        if(!connection_id){
            callback('invalid parameters',null)
            return
        }
        this.database.deleteConnection(connection_id, resp => callback(null, resp))
        
    }

    startProcess(params, callback){
        
        this.database.getConnection(params.connection_id, (err, row) => {
            if( err || !row ){
                callback('Error at getConnetion! Connection not found',null)
                return
            }
            else if(row.user_id == params.user_id){
                let {address, port, type, destination, is_tor} = row
                this.getPorts({port: destination, is_active: null,top: 1}, (rows) => {
                    if(rows[0].is_active == '1'){
                        callback(`The port ${destination} is aready in use`,false)
                    }
                    else{
                        this.database.setPort(port, 1) // set port as active
                        let p = this.processes.newProcess(params.connection_id, address,destination,port, type, is_tor);  
                        this.database.insertConnectionLog(params.connection_id, port, p._pid, p._command, 2) // insert in connection_log table as running process
                        let process_json = {
                            process_id: p._id,
                            status: p._status
                        }
                        callback(null,process_json)  
                    } 
                })
            }
            else {
                callback("The user doesn't own the connection", false)
            }
        })
            
    }
    
    stopProcess(params, callback){
 
        this.database.getConnection(params.connection_id, (err, row) => {
            if( err || !row ){
                callback('Error at getConnetion! Connection not found',null)
                return
            }
            else {
                this.processes.stopID(params.connection_id);  
                this.database.getConnectionLog(params.connection_id,1, (rows) => { // get last log inserted to the connection_id
                    if(rows){
                        this.database.setPort(rows[0].port, 0) // set port as idle
                        if(rows[0].status_id != 1)
                        this.database.insertConnectionLog(params.connection_id, rows[0].port, null,null, 1) // insert in connection_log table as stopped
                    }
                }) 
                callback(null,'succsess')  
            }
            
        })
    }
    
    getPorts(params, callback){
        let {port, is_active, top} = params
        this.database.getPort(port, is_active, top, rows => callback(rows))
    }

    getConnectionLog(params, callback){
        
        let {connection_id, top} = params
        this.database.getConnectionLog(connection_id,top, rows => callback(null,rows)) 
    
    }

    getUserConnections(params, callback){
        this.database.getUserConnections(callback) 
    }
}

module.exports = Middleware;
