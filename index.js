module.exports = function commentServer(sails) {
    return {
        initialize: function(cb){
            var fs = require('fs');
        },
        routes: {
            before: {
                'POST /updateThread': function (req, res, next) {
                    /**
                     * Parse body data properly and assign to a new variable
                     */
                    var body = JSON.parse(JSON.stringify(req.body), function(k, v) {
                        if (typeof(v)!="object" && !isNaN(parseInt(v))) {
                            v = parseInt(v);
                        }
                        return v;
                    });

                    var action = body.action;
                    var newThread = body.new;
                    var oldThread = body.old;

                    if(!newThread){
                        return res.status(400).json("Unable to parse thread data from request");
                    }

                    /**
                     * Load and parse comment data nclist file content
                     */
                    var file = 'public/sample_data/json/volvox/tracks/Comments/ctgA/trackData.json';
                    var data = fs.readFileSync(file,{encoding:'utf-8'});
                    var dataObj = JSON.parse(data);

                    /**
                     * Iterate and generate json formatted data object using the read data
                     * output is an array of objects
                     * key of array elements is the thread_id of each object
                     */
                    var list = dataObj.intervals.nclist;
                    var listLength = list.length;
                    var defaultClass = dataObj.intervals.classes[0].attributes;
                    var host = dataObj.host;

                    var newId = newThread[defaultClass.indexOf('thread_id')+1];
                    var newStart = newThread[defaultClass.indexOf('Start')+1];
                    var index = -1;

                    var obj = {};
                    var ids = [];
                    for (var i = 0; i < listLength; i++) {

                        var attrs = dataObj.intervals.classes[list[i][0]].attributes;
                        var thread = {};
                        var thread_id = list[i][attrs.indexOf('thread_id')+1];

                        ids[i] = thread_id;

                        var thisStart = list[i][attrs.indexOf('Start')+1];
                        if(thisStart < newStart){
                            index = i + 1;
                        }

                        for (var j = 0; j < attrs.length; j++) {
                            thread[attrs[j]] = list[i][j+1];
                        }
                        obj[thread_id] = thread;
                    }

                    index = ids.indexOf(newId);
                    /**
                     * Process start new thread action
                     */
                    if(action === 'insert'){
                        newId = host+dataObj.absCount;
                        newThread[defaultClass.indexOf('thread_id')+1] = newId;
                        list.splice(index,0,newThread);
                        dataObj.featureCount++;
                        dataObj.absCount++;
                    }

                    else if(action === "remove"){
                        list.splice(index,1);
                        dataObj.featureCount--;
                    }

                    else if(action === "update"){
                        list[index] = newThread;
                    }

                    list = list.sort(Comparator);

                    /**
                     * write list data back to trackData.json file
                     */
                    dataObj.intervals.nclist = list;
                    fs.writeFileSync(file, JSON.stringify(dataObj));
                    return res.json({
                        id: newId,
                        index:index
                    });
                }
            }
        }
    };
}