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
  
  insertConnection( address, port,is_tor, type, description, destination, callback){
    let sql = "insert into connections (address, port,is_tor, type, description, destination) values (?, ?, ?, ?, ?, ?)"
    this.db.run(sql,[address, port, is_tor, type, description, destination],(err) => {
      if (err) {
        throw err;
      }
      callback(true)
    }); 
  }

  isConnectionPortFree(port, callback){
    let sql = "select * from connections where port = ?"
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
  /*
  db.serialize(function() {
    db.run("CREATE TABLE lorem (info TEXT)");
   
    var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    for (var i = 0; i < 10; i++) {
        stmt.run("Ipsum " + i);
    }
    stmt.finalize();
   
    db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
        console.log(row.id + ": " + row.info);
    });
  });
  
  
  // select example
  db.serialize(() => {
      db.each(`SELECT PlaylistId as id,
                      Name as name
               FROM playlists`, (err, row) => {
        if (err) {
          console.error(err.message);
        }
        console.log(row.id + "\t" + row.name);
      });
    });
  
  // other select example
  
  let sql = `SELECT DISTINCT Name name FROM playlists
             ORDER BY name`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    rows.forEach((row) => {
      console.log(row.name);
    });
  });
  */
  // close the database connection
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