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
		return <a onClick={this.click} key={"k"+this.props.key} className="nodelink">{this.props.caption} </a>
	}
});

var onNode=function(cur) {
	if (cur.links) { 
		return cur.links.map(function(link,idx){return <LinkCompononent caption={link} key={idx}/>});
	}
	else return null;
}
var maincomponent = React.createClass({
  getInitialState:function() {
    return {result:[],tofind:"君子"};
  },
  expandAll:function(){
	for (var i=0;i<toc.length;i++) toc[i].o=true;
	this.forceUpdate();
  }
  ,closeAll:function(){
	for (var i=0;i<toc.length;i++) toc[i].o=false;
	this.forceUpdate();
  }
  ,render: function() {
    return <div>
    <button onClick={this.expandAll}>打開全部</button><button onClick={this.closeAll}>關閉全部</button>
      <TreeToc data={toc} opts={{multiselect:true,editable:true,tocstyle:"ganzhi", 
      							onNode:onNode}}/>
    </div>;
    //, velocityEffect:"transition.slideLeftIn"
  }
});
module.exports=maincomponent;