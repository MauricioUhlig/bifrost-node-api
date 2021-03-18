const { spawn } = require('child_process');

class Process {
  constructor(id, onion, indoor, outdoor, type, is_tor) {
    if(is_tor == 1){
      this._command = `socat TCP4-LISTEN:${indoor},reuseaddr,fork SOCKS4A:localhost:${onion}:${outdoor},socksport=9050`
      this.command_parcial = `SOCKS4A:localhost:${onion}:${outdoor},socksport=9050`
    }
    else {
      this._command = `socat TCP4-LISTEN:${indoor},reuseaddr,fork TCP4:${onion}:${outdoor}`
      this.command_parcial = `TCP4:${onion}:${outdoor}`
      
    }
    this._id = id
    //console.log(this._id)
    this._subprocess = spawn('socat', [`${type}4-LISTEN:${indoor},reuseaddr,fork`,this.command_parcial], {
      detached: true,
      stdio: 'ignore'
    });
    this._pid = this._subprocess.pid;
    this._status = 'running'
    this._subprocess.unref()
    //console.log(this._subprocess)
  }

  stop(callback) {
    try {
      this._subprocess.ref()
      this._subprocess.kill('SIGKILL')
      this._status = 'stopped'
    } catch (err) {
      return callback(err)
    }
  }
  status(){
    return this._subprocess.killed ? 'stopped' : 'running';
  }

}

class Processes {
  constructor() {
    this._processes = []
  }
  newProcess(id, onion, indoor, outdoor, type, is_tor) {
    let is_running 
    let process_index = this._processes.findIndex(process => {
      if (process._id == id) {
        if(process.status() == 'stopped'){
          this.stopID(id)
        }
        else {
          is_running = true
          return process
        }
      }
    })
    if(!is_running){
      let p = new Process(id, onion, indoor, outdoor, type, is_tor)
      this._processes.push(p)
      return p
    }
    else {
      return this._processes[process_index]
    }
  }

  get allProcesses() {
    return this._processes
  }

  stopAll() {
    this._processes.forEach(process => process.stop(resp => console.log(resp)))
    this._processes = []
  }

  stopID(id) {
    this._processes.splice(
      this._processes.findIndex(process => {
        if (process._id == id) {
          process.stop(resp => resp)
        }
        return process._id == id
      }
      ), 1)
  }

  getInfo(id){
    let index = this._processes.findIndex(process => process._id == id)
    return this._processes[index];
  }
}

module.exports = Processes;
