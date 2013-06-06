console.time('loaded');
require('/app/sugar','/app/backbone','/app/test');

function main(){
	console.timeEnd('loaded');
	console.log("Backbone loaded:",!!Backbone);
}