kolos.Class = function(cls){
    var fn = function(){
        //var Self = this;
    };
    cls.call( fn );
    return fn;
};