/**
 * Created by pans on 15/12/6.
 */
'use strict';


var fs = require('fs')
    , gm = require('gm').subClass({imageMagick: true});
var qr = require('qr-image');
var async = require("async"); 

var path = "D:\\Documents\\文件\\网站上用的照片\\1000X667凤凰岛游艇，标志海景酒店4个\\1000x667";

function explorer(path) {
    fs.readdir(path, function (err, files) {
        if (err) {
            console.log("error:\n" + err);
            return;
        }
        // 同步操作，处理大量文件，和大文件 
        async.eachSeries(files,function (file,callback) {
            fs.stat(path + "\\" + file + '',
                function (err, stat) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                     if (stat.isDirectory()) {
                         console.log(path + "\\" + file + "\\");
                     } else {
                        console.log(path + "\\" + file);
                        gm(path + "\\" + file)
                            .composite('2.png')
                            .geometry('+130+550')
                            .write(file, function (err) {
                                if (err) throw err;
                                else {console.log('done');callback();}
                            });
                     }

                }
            )
            ;
        });
    })
}
explorer(path);


