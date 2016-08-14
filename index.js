module.exports = function commentServer(sails) {
    return {
        initialize: function(cb){
            var fs = require('fs');
        },
        routes: {
            before: {
                'POST /updateThread': function (req, res, next) {
                    
                }
            }
        }
    };
}