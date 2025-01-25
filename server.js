var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
const {file} = require('./file.js');
var system = require("child_process");
const bodyParser = require("body-parser");
const { generateHTML } = require("./template.js");

class client {
  static all = [];
  constructor(socket) {
    this.socket = socket;
    this.name = null;
    this.tiles = [];
    client.all.push(this);
    socket.on("disconnect", (e) => {
      let index = client.all.indexOf(this);
      if (index != -1) {
        client.all.splice(index, 1);
      }
    });
  }
  emit(name, dat) {
    this.socket.emit(name, dat);
  }
}

let last_cli_arg = Number(process.argv.at(-1));
const port = isNaN(last_cli_arg) ? 80 : last_cli_arg;
const path = __dirname + "/";

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path + "site/"));

let password;
file.read('password.txt',data=>{password=data});
app.post('/api/publish',async (req,res)=>{
  console.log('Recieved Publish',password,req.headers.authorization);
  if(password != req.headers.authorization){
    res.json({message:'Inavlid Password'});
    return;
  }
  let page = req.body;
  file.save('page.json',JSON.stringify(page))
  await syncAssetFolder(page.folderId);
  res.json({message:'Success'});
})

async function syncAssetFolder(folderId){
  let cp = system.exec(`sh getAssets.sh ${folderId}`);
  let prom = new Promise((res,rej)=>{
    cp.on('exit',function(){
      res();
    })
  })
  await prom;
}

app.get(/.*/, function (request, response) {
  // response.sendFile(path+'site/');
  generateHTML(request,response);
});

http.listen(port, () => {
  console.log("Serving Port: " + port);
});

io.on("connection", (socket) => {
  var c = new client(socket);
});
