var React=require("react");
var treetoc=require("ksana2015-treetoc");
var TreeToc=treetoc.component;
var toc=require("./jwl-toc");
var createRandomLink=function() {
	for (var i=0;i<toc.length;i++) {
		var r=Math.random();
		if (r>0.5) {
			toc[i].links=[r.toString().substr(2,5)];
		}
		if (r>0.75) {
			toc[i].links.push((1-r).toString().substr(2,5));
		}
	}
}
treetoc.buildToc(toc);
createRandomLink();

var LinkCompononent = React.createClass({
	click:function(e) {
		e.stopPropagation();
	}
	,render :function() {
		return <a onClick={this.click} className="nodelink">{this.props.caption} </a>
	}
});

var onNode=function(cur) {
	if (cur.links) { 
		return cur.links.map(function(link){return <LinkCompononent caption={link}/>});
	}
	else return null;
}
var maincomponent = React.createClass({
  getInitialState:function() {
    return {result:[],tofind:"君子"};
  },
  render: function() {
    return <div>
      <TreeToc data={toc} opts={{tocstyle:"ganzhi", onNode:onNode}}/>
    </div>;
  }
});
module.exports=maincomponent;