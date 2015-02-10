var React=require("react");
var treetoc=require("ksana2015-treetoc");
var TreeToc=treetoc.component;
var toc=require("./jwl-toc");
treetoc.buildToc(toc);
var maincomponent = React.createClass({
  getInitialState:function() {
    return {result:[],tofind:"君子"};
  },
  render: function() {
    return <div>
      <TreeToc data={toc} opts={{tocstyle:"ganzhi"}}/>
    </div>;
  }
});
module.exports=maincomponent;