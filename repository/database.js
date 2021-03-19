const sqlite3 = require('sqlite3');
const { resolve } = require('path');
const dbPath = resolve(__dirname, '../data/storage.db')

class DB {
  constructor(){
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log('Connected to the storage database.');
    });
  } 
  
  getLogin(login, password, callback){
    let sql = "select * from users where login = ? and password = ?"
    this.db.get(sql,[login, password], (err,row) => callback(row) ); 
  }

  createSession(user_id, token, callback){
    let sql = "insert into session (user_id, token) values (?, ?)"
    this.db.run(sql,[user_id, token],(err) => {
      if (err) {
        throw err;
      }
      callback(err,user_id,token)
    });
  }
  getSession(token, callback){
    let sql = "select * from session where token = ? order by login_date desc limit 1"
    this.db.get(sql,[token],(err,row) => {
      if (err) {
        throw err;
      }
      callback(err,row)
    });
  }

  insertConnection( address, port,is_tor, type, description, destination, callback){
    let sql = "insert into connections (address, port,is_tor, type, description, destination) values (?, ?, ?, ?, ?, ?)"
    this.db.run(sql,[address, port, is_tor, type, description, destination],(err) => {
      if (err) {
        throw err;
      }
      callback(true)
    }); 
  }
  
  updateConnection( connection_id, address, port,is_tor, type, description, destination, callback){
    let sql = "update connections set address = ?, port = ?, is_tor = ?, type = ?, description = ?, destination = ? where connection_id = ?"
    this.db.all(sql,[address, port, is_tor, type, description, destination, connection_id],(err) => {
      if (err) {
        throw err;
      }
      callback(true)
    }); 

  }
  deleteConnection( connection_id, callback){
    let sql = "delete from connections where connection_id = ?"
    this.db.all(sql,[connection_id],(err) => {
      if (err) {
        throw err;
      }
      callback(true)
    }); 

  }

  isConnectionPortFree(port, callback){
    let sql = "select * from connections where destination = ?"
    this.db.all(sql, port, (err, rows) => {
      if(err){
        throw err;
      }
      callback(rows.length == 0)
    } );
  }

  getConnection(connection_id, callback){
    let sql = "select * from connections where connection_id = ?"
    this.db.get(sql,[connection_id], callback); 
  }
  
  getUserConnections(callback){
    let sql = "select * from connections"
    this.db.all(sql,callback); 
  }
  
  getPort(port, is_active, top, callback){
    let sql = "select * from server_ports where 1=1"
    let params = []
    if(port){
      sql += " and port = ?"
      params.push(port)
    }
    if(is_active){
      sql += " and is_active = ?"
      params.push(is_active) 
    }
    if(top){
      sql += " limit ?"
      params.push(top) 
    }
    this.db.all(sql, params, (err, rows) => {
      if(err){
        throw err;
      }
      callback(rows)
    } )
  }
  setPort(port, is_active){
    let sql = "update server_ports set is_active = ? where port = ?"
    
    this.db.all(sql, [is_active, port], (err) => {
      if(err){
        throw err;
      }})
  }
  insertConnectionLog(connection_id, port, pid, command, status_id, callback){
    let sql = "insert into connections_log (connection_id, port, pid, command, status_id) values (?, ?, ?, ?, ?)"
    this.db.run(sql,[connection_id, port, pid, command, status_id],(err) => {
      if (err) {
        throw err;
      }}); 
  }
  getConnectionLog(connection_id, top, callback){
    let params = [ connection_id ]
    let sql = "select * from connections_log where connection_id = ? order by date_log desc"
    if(top){
      sql += " limit ?"
      params.push(top)
    }
    this.db.all(sql,params,(err,rows) => {
      if (err) {
        throw err;
      }
      callback(rows)
    }); 
  }

  close(callback){
    this.db.close((err) => {
      if (err) {
        callback(err,false)
      }
      else callback(null,true);
    });
  }
  
  //export default teste;
}

module.exports = DB;
/*
let db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the storage database.');
});
const carregaPortas = ()=>{
  db.serialize(function() {
   
    var stmt = db.prepare("INSERT INTO server_ports VALUES ( ?, 0)");
    for (var i = 1024; i <= 65535; i++) {
        stmt.run(i);
        console.log(i)
    }
    stmt.finalize();
  });
  
}

carregaPortas()
*/