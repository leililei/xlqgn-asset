var crypto = require('crypto');
var fs = require('fs');
let path = require("path");
let oldFileName = 'oldManifestDy.json';
let isExit = false;
let manifestData = {};
let oldManifestData = {};
let diffData = [];

let curDir = "./";
let filePath = path.resolve(`${curDir}`);
let upDir = __dirname.split('\\dynamic')[0]

function getAllFile(filePath) {
    fs.readdir(filePath, function (err, files) {
        if (err) {
            // console.warn(err)
        } else {
            files.forEach(function (filename) {
                var filedir = path.join(filePath, filename);
                fs.stat(filedir, function (error, stats) {
                    if (error) {

                    } else {
                        var isFile = stats.isFile();
                        var isDir = stats.isDirectory();
                        if (isFile) {
                            var rs = fs.createReadStream(filedir);

                            var hash = crypto.createHash('md5');
                            rs.on('data', hash.update.bind(hash));

                            rs.on('end', function () {
                                //因不同人仓库地址不同故做此修改
                                let key = filedir.split(__dirname)[1];
                                if(isExit){
                                    //新增资源
                                    if(!oldManifestData[key]&& filedir.indexOf('.js') <= -1){
                                        dealCopy(filedir)
                                    }else{
                                        for(let i in oldManifestData){
                                            if(i == key && oldManifestData[i] != hash.digest('hex')&& i.indexOf('.js') <= -1){
                                                // diffData.push(i);
                                                dealCopy(filedir)
                                            }

                                        }
                                    }

                                }else{
                                    manifestData[key] = hash.digest('hex')
                                    // fs.appendFileSync(oldFileName,JSON.stringify(manifestData),(err)=>{
                                    //     // console.log(txt,'err',err)
                                    // });
                                    fs.writeFileSync(oldFileName,JSON.stringify(manifestData))
                                }

                            });
                        }
                        if (isDir && filedir.indexOf('(zh)')>-1) {
                            getAllFile(filedir);
                        }
                    }
                });
            });
        }
    });
}
function dealCopy(dir) {
    let readStream = fs.createReadStream(dir);
    let aDir = path.join(upDir, "/diffDY", dir.replace(__dirname,''))
    let lsIdx = dir.lastIndexOf('\\');

    let dst = path.join(upDir,'/diffDY',dir.slice(0,lsIdx).replace(__dirname,''))
    if(!fs.existsSync(dst)){
        fs.mkdirSync(dst);
    }

    let writeStream = fs.createWriteStream(aDir);
    readStream.pipe(writeStream);
}
let curFile = path.join(filePath, oldFileName);
let diffDir = path.join(upDir, "/diffDY")
fs.exists(curFile, (exists) => {
    if (exists) {
        if(!fs.existsSync(diffDir)){
            fs.mkdirSync(diffDir);
        }
        isExit = true;
        let fileStr = fs.readFileSync(curFile, 'utf-8')
        oldManifestData = JSON.parse(fileStr);
    }
    getAllFile(filePath);
});
