var json=require("./jwl-toc.json");
var out=json.map(function(toc){
	var i=toc.indexOf(".");
	d=parseInt(toc.substr(0,i));
	t=toc.substr(i+1);
	return {d:d,t:t};
});
out.unshift({"d":0,"t":"江味農金剛經講義"});
require("fs").writeFileSync("jwl-toc.js","module.exports="+JSON.stringify(out),"utf8");