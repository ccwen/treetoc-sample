(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"C:\\ksana2015\\node_modules\\ksana2015-treetoc\\index.js":[function(require,module,exports){
/*
   toc data format
   array of { d:depth, o:opened, t:text, n:next_same_level ]

   only first level can be 0
*/
var React=require("react");
var E=React.createElement;
var TreeToc=React.createClass({
	propTypes:{
		data:React.PropTypes.array.isRequired
		,opts:React.PropTypes.object
		,cur:React.PropTypes.number.isRequired
	}
	,getDefaultProps:function() {
		return {cur:0,opts:{}};
	}
	,renderItem:function(e,idx){
		var t=this.props.data[e];
		return E(TreeToc,{key:"k"+idx,cur:e,data:this.props.data,opts:this.props.opts});
	}
	,click:function(e) {
		var n=parseInt(e.target.parentElement.attributes['data-n'].value);
		this.props.data[n].o=!this.props.data[n].o;
		this.forceUpdate();
		e.preventDefault();
        e.stopPropagation();
	}
	,clearSelected:function() {
		for (var i=0;i<this.props.data.length;i++) {
			if (this.props.data[i].s) (this.props.data[i].s)=false;
		}
	}
	,findRoot:function() { //this is not good
		var root=this;
		while (root._owner && typeof root.props.cur!="undefined") {
			if (root.props.cur!==0) root=root._owner;
			else break;
		}
		return root;
	}
	,select:function(e){
		var datan=e.target.parentElement.attributes['data-n'];
		if (!datan) return;
		var n=parseInt(datan.value);
		var s=!this.props.data[n].s;
		if (!e.ctrlKey) this.clearSelected();
		this.props.data[n].s=s;
		var root=this.findRoot();
		root.forceUpdate();
		e.preventDefault();
        e.stopPropagation();
	}
	,render:function() {
		var cur=this.props.data[this.props.cur];
		var selected="",extra="",children=[];
		var folderbutton=null;
		var depthdeco=renderDepth(cur.d,this.props.opts)
		if (cur.d==0) extra=" treetoc";
		if (cur.s) selected=" selected";
		if (cur.c) { 
			if (cur.o) {
				children=enumChildren(this.props.data,this.props.cur);
				folderbutton=E("a",{className:"folderbutton opened",onClick:this.click},"－");
			}
			else {
				folderbutton=E("a",{className:"folderbutton closed",onClick:this.click},"＋");
			}
		} else {
			folderbutton=E("a",{ className:"leaf", "style":{"visibility":"hidden"} },"　");
		}

		var extracomponent=this.props.opts.onNode&& this.props.opts.onNode(cur);

		return E("div",{onClick:this.select,"data-n":this.props.cur,className:"childnode"+extra},
			   folderbutton,depthdeco,
			   E("span",{className:selected+" caption"},cur.t),
			   extracomponent,
			   	children.map(this.renderItem));
	}
});
var ganzhi="　甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥";

var renderDepth=function(depth,opts) {
  var out=[];
  if (opts&&opts.tocstyle=="ganzhi") {
    return E("span", null, ganzhi[depth].trim()+" ");
  } else {
    if (depth) return E("span", null, depth, ".")
    else return null;
  }
  return null;
};
var buildToc = function(toc) {
	if (!toc || !toc.length) return;  
	var depths=[];
 	var prev=0;
 	if (toc.length>1) {
 		toc[0].c=true;
 		toc[0].o=true;//opened
 	}
	for (var i=0;i<toc.length;i++) {
	    var depth=toc[i].d||toc[i].depth;
	    if (prev>depth) { //link to prev sibling
	      if (depths[depth]) toc[depths[depth]].n = i;
	      for (var j=depth;j<prev;j++) depths[j]=0;
	    }
	    if (i<toc.length-1 && (toc[i+1].d||toc[i+1].depth)>depth) {
	      toc[i].c=true;
	    }
    	depths[depth]=i;
    	prev=depth;
	}
}
var enumAncestors=function(toc,cur) {
    if (!toc || !toc.length) return;
    if (cur==0) return [];
    var n=cur-1;
    var depth=toc[cur].d||toc[cur].depth - 1;
    var parents=[];
    while (n>=0 && depth>0) {
      if (toc[n].d||toc[n].depth==depth) {
        parents.unshift(n);
        depth--;
      }
      n--;
    }
    parents.unshift(0); //first ancestor is root node
    return parents;
}

var enumChildren=function(toc,cur) {
    var children=[];
    if (!toc || !toc.length || toc.length==1) return children;
    thisdepth=toc[cur].d||toc[cur].depth;
    if (cur==0) thisdepth=0;
    if (cur+1>=toc.length) return children;
    if ((toc[cur+1].d||toc[cur+1].depth)!= 1+thisdepth) {
    	return children;  // no children node
    }
    var n=cur+1;
    var child=toc[n];
    
    while (child) {
      children.push(n);
      var next=toc[n+1];
      if (!next) break;
      if ((next.d||next.depth)==(child.d||child.depth)) {
        n++;
      } else if ((next.d||next.depth)>(child.d||child.depth)) {
        n=child.n||child.next;
      } else break;
      if (n) child=toc[n];else break;
    }
    return children;
}
var genToc=function(toc,title) {
    var out=[{depth:0,text:title||ksana.js.title}];
    if (toc.texts) for (var i=0;i<toc.texts.length;i++) {
      out.push({t:toc.texts[i],d:toc.depths[i], voff:toc.vpos[i]});
    }
    return out; 
}
module.exports={component:TreeToc,genToc:genToc,enumChildren:enumChildren,enumAncestors:enumAncestors,buildToc:buildToc};
},{"react":"react"}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\checkbrowser.js":[function(require,module,exports){
/*
convert to pure js
save -g reactify
*/
var React=(window&&window.React)||require("react");
var E=React.createElement;

var hasksanagap=(typeof ksanagap!="undefined");
if (hasksanagap && (typeof console=="undefined" || typeof console.log=="undefined")) {
		window.console={log:ksanagap.log,error:ksanagap.error,debug:ksanagap.debug,warn:ksanagap.warn};
		console.log("install console output funciton");
}

var checkfs=function() {
	return (navigator && navigator.webkitPersistentStorage) || hasksanagap;
}
var featurechecks={
	"fs":checkfs
}
var checkbrowser = React.createClass({
	getInitialState:function() {

		var missingFeatures=this.getMissingFeatures();
		return {ready:false, missing:missingFeatures};
	},
	getMissingFeatures:function() {
		var feature=this.props.feature.split(",");
		var status=[];
		feature.map(function(f){
			var checker=featurechecks[f];
			if (checker) checker=checker();
			status.push([f,checker]);
		});
		return status.filter(function(f){return !f[1]});
	},
	downloadbrowser:function() {
		window.location="https://www.google.com/chrome/"
	},
	renderMissing:function() {
		var showMissing=function(m) {
			return E("div", null, m);
		}
		return (
		 E("div", {ref: "dialog1", className: "modal fade", "data-backdrop": "static"}, 
		    E("div", {className: "modal-dialog"}, 
		      E("div", {className: "modal-content"}, 
		        E("div", {className: "modal-header"}, 
		          E("button", {type: "button", className: "close", "data-dismiss": "modal", "aria-hidden": "true"}, "×"), 
		          E("h4", {className: "modal-title"}, "Browser Check")
		        ), 
		        E("div", {className: "modal-body"}, 
		          E("p", null, "Sorry but the following feature is missing"), 
		          this.state.missing.map(showMissing)
		        ), 
		        E("div", {className: "modal-footer"}, 
		          E("button", {onClick: this.downloadbrowser, type: "button", className: "btn btn-primary"}, "Download Google Chrome")
		        )
		      )
		    )
		  )
		 );
	},
	renderReady:function() {
		return E("span", null, "browser ok")
	},
	render:function(){
		return  (this.state.missing.length)?this.renderMissing():this.renderReady();
	},
	componentDidMount:function() {
		if (!this.state.missing.length) {
			this.props.onReady();
		} else {
			$(this.refs.dialog1.getDOMNode()).modal('show');
		}
	}
});

module.exports=checkbrowser;
},{"react":"react"}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\downloader.js":[function(require,module,exports){

var userCancel=false;
var files=[];
var totalDownloadByte=0;
var targetPath="";
var tempPath="";
var nfile=0;
var baseurl="";
var result="";
var downloading=false;
var startDownload=function(dbid,_baseurl,_files) { //return download id
	var fs     = require("fs");
	var path   = require("path");

	
	files=_files.split("\uffff");
	if (downloading) return false; //only one session
	userCancel=false;
	totalDownloadByte=0;
	nextFile();
	downloading=true;
	baseurl=_baseurl;
	if (baseurl[baseurl.length-1]!='/')baseurl+='/';
	targetPath=ksanagap.rootPath+dbid+'/';
	tempPath=ksanagap.rootPath+".tmp/";
	result="";
	return true;
}

var nextFile=function() {
	setTimeout(function(){
		if (nfile==files.length) {
			nfile++;
			endDownload();
		} else {
			downloadFile(nfile++);	
		}
	},100);
}

var downloadFile=function(nfile) {
	var url=baseurl+files[nfile];
	var tmpfilename=tempPath+files[nfile];
	var mkdirp = require("./mkdirp");
	var fs     = require("fs");
	var http   = require("http");

	mkdirp.sync(path.dirname(tmpfilename));
	var writeStream = fs.createWriteStream(tmpfilename);
	var datalength=0;
	var request = http.get(url, function(response) {
		response.on('data',function(chunk){
			writeStream.write(chunk);
			totalDownloadByte+=chunk.length;
			if (userCancel) {
				writeStream.end();
				setTimeout(function(){nextFile();},100);
			}
		});
		response.on("end",function() {
			writeStream.end();
			setTimeout(function(){nextFile();},100);
		});
	});
}

var cancelDownload=function() {
	userCancel=true;
	endDownload();
}
var verify=function() {
	return true;
}
var endDownload=function() {
	nfile=files.length+1;//stop
	result="cancelled";
	downloading=false;
	if (userCancel) return;
	var fs     = require("fs");
	var mkdirp = require("./mkdirp");

	for (var i=0;i<files.length;i++) {
		var targetfilename=targetPath+files[i];
		var tmpfilename   =tempPath+files[i];
		mkdirp.sync(path.dirname(targetfilename));
		fs.renameSync(tmpfilename,targetfilename);
	}
	if (verify()) {
		result="success";
	} else {
		result="error";
	}
}

var downloadedByte=function() {
	return totalDownloadByte;
}
var doneDownload=function() {
	if (nfile>files.length) return result;
	else return "";
}
var downloadingFile=function() {
	return nfile-1;
}

var downloader={startDownload:startDownload, downloadedByte:downloadedByte,
	downloadingFile:downloadingFile, cancelDownload:cancelDownload,doneDownload:doneDownload};
module.exports=downloader;
},{"./mkdirp":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\mkdirp.js","fs":false,"http":false,"path":false}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\fileinstaller.js":[function(require,module,exports){
/* todo , optional kdb */
var React=(window&&window.React)||require("react");
var HtmlFS=require("./htmlfs");
var html5fs=require("./html5fs");
var CheckBrowser=require("./checkbrowser");
var E=React.createElement;
  

var FileList = React.createClass({
	getInitialState:function() {
		return {downloading:false,progress:0};
	},
	updatable:function(f) {
        var classes="btn btn-warning";
        if (this.state.downloading) classes+=" disabled";
		if (f.hasUpdate) return   E("button", {className: classes, 
			"data-filename": f.filename, "data-url": f.url, 
	            onClick: this.download
	       }, "Update")
		else return null;
	},
	showLocal:function(f) {
        var classes="btn btn-danger";
        if (this.state.downloading) classes+=" disabled";
	  return E("tr", null, E("td", null, f.filename), 
	      E("td", null), 
	      E("td", {className: "pull-right"}, 
	      this.updatable(f), E("button", {className: classes, 
	               onClick: this.deleteFile, "data-filename": f.filename}, "Delete")
	        
	      )
	  )
	},  
	showRemote:function(f) { 
	  var classes="btn btn-warning";
	  if (this.state.downloading) classes+=" disabled";
	  return (E("tr", {"data-id": f.filename}, E("td", null, 
	      f.filename), 
	      E("td", null, f.desc), 
	      E("td", null, 
	      E("span", {"data-filename": f.filename, "data-url": f.url, 
	            className: classes, 
	            onClick: this.download}, "Download")
	      )
	  ));
	},
	showFile:function(f) {
	//	return <span data-id={f.filename}>{f.url}</span>
		return (f.ready)?this.showLocal(f):this.showRemote(f);
	},
	reloadDir:function() {
		this.props.action("reload");
	},
	download:function(e) {
		var url=e.target.dataset["url"];
		var filename=e.target.dataset["filename"];
		this.setState({downloading:true,progress:0,url:url});
		this.userbreak=false;
		html5fs.download(url,filename,function(){
			this.reloadDir();
			this.setState({downloading:false,progress:1});
			},function(progress,total){
				if (progress==0) {
					this.setState({message:"total "+total})
			 	}
			 	this.setState({progress:progress});
			 	//if user press abort return true
			 	return this.userbreak;
			}
		,this);
	},
	deleteFile:function( e) {
		var filename=e.target.attributes["data-filename"].value;
		this.props.action("delete",filename);
	},
	allFilesReady:function(e) {
		return this.props.files.every(function(f){ return f.ready});
	},
	dismiss:function() {
		$(this.refs.dialog1.getDOMNode()).modal('hide');
		this.props.action("dismiss");
	},
	abortdownload:function() {
		this.userbreak=true;
	},
	showProgress:function() {
	     if (this.state.downloading) {
	      var progress=Math.round(this.state.progress*100);
	      return (
	      	E("div", null, 
	      	"Downloading from ", this.state.url, 
	      E("div", {key: "progress", className: "progress col-md-8"}, 
	          E("div", {className: "progress-bar", role: "progressbar", 
	              "aria-valuenow": progress, "aria-valuemin": "0", 
	              "aria-valuemax": "100", style: {width: progress+"%"}}, 
	            progress, "%"
	          )
	        ), 
	        E("button", {onClick: this.abortdownload, 
	        	className: "btn btn-danger col-md-4"}, "Abort")
	        )
	        );
	      } else {
	      		if ( this.allFilesReady() ) {
	      			return E("button", {onClick: this.dismiss, className: "btn btn-success"}, "Ok")
	      		} else return null;
	      		
	      }
	},
	showUsage:function() {
		var percent=this.props.remainPercent;
           return (E("div", null, E("span", {className: "pull-left"}, "Usage:"), E("div", {className: "progress"}, 
		  E("div", {className: "progress-bar progress-bar-success progress-bar-striped", role: "progressbar", style: {width: percent+"%"}}, 
		    	percent+"%"
		  )
		)));
	},
	render:function() {
	  	return (
		E("div", {ref: "dialog1", className: "modal fade", "data-backdrop": "static"}, 
		    E("div", {className: "modal-dialog"}, 
		      E("div", {className: "modal-content"}, 
		        E("div", {className: "modal-header"}, 
		          E("h4", {className: "modal-title"}, "File Installer")
		        ), 
		        E("div", {className: "modal-body"}, 
		        	E("table", {className: "table"}, 
		        	E("tbody", null, 
		          	this.props.files.map(this.showFile)
		          	)
		          )
		        ), 
		        E("div", {className: "modal-footer"}, 
		        	this.showUsage(), 
		           this.showProgress()
		        )
		      )
		    )
		  )
		);
	},	
	componentDidMount:function() {
		$(this.refs.dialog1.getDOMNode()).modal('show');
	}
});
/*TODO kdb check version*/
var Filemanager = React.createClass({
	getInitialState:function() {
		var quota=this.getQuota();
		return {browserReady:false,noupdate:true,	requestQuota:quota,remain:0};
	},
	getQuota:function() {
		var q=this.props.quota||"128M";
		var unit=q[q.length-1];
		var times=1;
		if (unit=="M") times=1024*1024;
		else if (unit="K") times=1024;
		return parseInt(q) * times;
	},
	missingKdb:function() {
		if (ksanagap.platform!="chrome") return [];
		var missing=this.props.needed.filter(function(kdb){
			for (var i in html5fs.files) {
				if (html5fs.files[i][0]==kdb.filename) return false;
			}
			return true;
		},this);
		return missing;
	},
	getRemoteUrl:function(fn) {
		var f=this.props.needed.filter(function(f){return f.filename==fn});
		if (f.length ) return f[0].url;
	},
	genFileList:function(existing,missing){
		var out=[];
		for (var i in existing) {
			var url=this.getRemoteUrl(existing[i][0]);
			out.push({filename:existing[i][0], url :url, ready:true });
		}
		for (var i in missing) {
			out.push(missing[i]);
		}
		return out;
	},
	reload:function() {
		html5fs.readdir(function(files){
  			this.setState({files:this.genFileList(files,this.missingKdb())});
  		},this);
	 },
	deleteFile:function(fn) {
	  html5fs.rm(fn,function(){
	  	this.reload();
	  },this);
	},
	onQuoteOk:function(quota,usage) {
		if (ksanagap.platform!="chrome") {
			//console.log("onquoteok");
			this.setState({noupdate:true,missing:[],files:[],autoclose:true
				,quota:quota,remain:quota-usage,usage:usage});
			return;
		}
		//console.log("quote ok");
		var files=this.genFileList(html5fs.files,this.missingKdb());
		var that=this;
		that.checkIfUpdate(files,function(hasupdate) {
			var missing=this.missingKdb();
			var autoclose=this.props.autoclose;
			if (missing.length) autoclose=false;
			that.setState({autoclose:autoclose,
				quota:quota,usage:usage,files:files,
				missing:missing,
				noupdate:!hasupdate,
				remain:quota-usage});
		});
	},  
	onBrowserOk:function() {
	  this.totalDownloadSize();
	}, 
	dismiss:function() {
		this.props.onReady(this.state.usage,this.state.quota);
		setTimeout(function(){
			var modalin=$(".modal.in");
			if (modalin.modal) modalin.modal('hide');
		},500);
	}, 
	totalDownloadSize:function() {
		var files=this.missingKdb();
		var taskqueue=[],totalsize=0;
		for (var i=0;i<files.length;i++) {
			taskqueue.push(
				(function(idx){
					return (function(data){
						if (!(typeof data=='object' && data.__empty)) totalsize+=data;
						html5fs.getDownloadSize(files[idx].url,taskqueue.shift());
					});
				})(i)
			);
		}
		var that=this;
		taskqueue.push(function(data){	
			totalsize+=data;
			setTimeout(function(){that.setState({requireSpace:totalsize,browserReady:true})},0);
		});
		taskqueue.shift()({__empty:true});
	},
	checkIfUpdate:function(files,cb) {
		var taskqueue=[];
		for (var i=0;i<files.length;i++) {
			taskqueue.push(
				(function(idx){
					return (function(data){
						if (!(typeof data=='object' && data.__empty)) files[idx-1].hasUpdate=data;
						html5fs.checkUpdate(files[idx].url,files[idx].filename,taskqueue.shift());
					});
				})(i)
			);
		}
		var that=this;
		taskqueue.push(function(data){	
			if (files.length) files[files.length-1].hasUpdate=data;
			var hasupdate=files.some(function(f){return f.hasUpdate});
			if (cb) cb.apply(that,[hasupdate]);
		});
		taskqueue.shift()({__empty:true});
	},
	render:function(){
    		if (!this.state.browserReady) {   
      			return E(CheckBrowser, {feature: "fs", onReady: this.onBrowserOk})
    		} if (!this.state.quota || this.state.remain<this.state.requireSpace) {  
    			var quota=this.state.requestQuota;
    			if (this.state.usage+this.state.requireSpace>quota) {
    				quota=(this.state.usage+this.state.requireSpace)*1.5;
    			}
      			return E(HtmlFS, {quota: quota, autoclose: "true", onReady: this.onQuoteOk})
      		} else {
			if (!this.state.noupdate || this.missingKdb().length || !this.state.autoclose) {
				var remain=Math.round((this.state.usage/this.state.quota)*100);				
				return E(FileList, {action: this.action, files: this.state.files, remainPercent: remain})
			} else {
				setTimeout( this.dismiss ,0);
				return E("span", null, "Success");
			}
      		}
	},
	action:function() {
	  var args = Array.prototype.slice.call(arguments);
	  var type=args.shift();
	  var res=null, that=this;
	  if (type=="delete") {
	    this.deleteFile(args[0]);
	  }  else if (type=="reload") {
	  	this.reload();
	  } else if (type=="dismiss") {
	  	this.dismiss();
	  }
	}
});

module.exports=Filemanager;
},{"./checkbrowser":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\checkbrowser.js","./html5fs":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\html5fs.js","./htmlfs":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\htmlfs.js","react":"react"}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\html5fs.js":[function(require,module,exports){
/* emulate filesystem on html5 browser */
var get_head=function(url,field,cb){
	var xhr = new XMLHttpRequest();
	xhr.open("HEAD", url, true);
	xhr.onreadystatechange = function() {
			if (this.readyState == this.DONE) {
				cb(xhr.getResponseHeader(field));
			} else {
				if (this.status!==200&&this.status!==206) {
					cb("");
				}
			} 
	};
	xhr.send();	
}
var get_date=function(url,cb) {
	get_head(url,"Last-Modified",function(value){
		cb(value);
	});
}
var get_size=function(url, cb) {
	get_head(url,"Content-Length",function(value){
		cb(parseInt(value));
	});
};
var checkUpdate=function(url,fn,cb) {
	if (!url) {
		cb(false);
		return;
	}
	get_date(url,function(d){
		API.fs.root.getFile(fn, {create: false, exclusive: false}, function(fileEntry) {
			fileEntry.getMetadata(function(metadata){
				var localDate=Date.parse(metadata.modificationTime);
				var urlDate=Date.parse(d);
				cb(urlDate>localDate);
			});
		},function(){
			cb(false);
		});
	});
}
var download=function(url,fn,cb,statuscb,context) {
	 var totalsize=0,batches=null,written=0;
	 var fileEntry=0, fileWriter=0;
	 var createBatches=function(size) {
		var bytes=1024*1024, out=[];
		var b=Math.floor(size / bytes);
		var last=size %bytes;
		for (var i=0;i<=b;i++) {
			out.push(i*bytes);
		}
		out.push(b*bytes+last);
		return out;
	 }
	 var finish=function() {
		 rm(fn,function(){
				fileEntry.moveTo(fileEntry.filesystem.root, fn,function(){
					setTimeout( cb.bind(context,false) , 0) ; 
				},function(e){
					console.log("failed",e)
				});
		 },this); 
	 };
		var tempfn="temp.kdb";
		var batch=function(b) {
		var abort=false;
		var xhr = new XMLHttpRequest();
		var requesturl=url+"?"+Math.random();
		xhr.open('get', requesturl, true);
		xhr.setRequestHeader('Range', 'bytes='+batches[b]+'-'+(batches[b+1]-1));
		xhr.responseType = 'blob';    
		xhr.addEventListener('load', function() {
			var blob=this.response;
			fileEntry.createWriter(function(fileWriter) {
				fileWriter.seek(fileWriter.length);
				fileWriter.write(blob);
				written+=blob.size;
				fileWriter.onwriteend = function(e) {
					if (statuscb) {
						abort=statuscb.apply(context,[ fileWriter.length / totalsize,totalsize ]);
						if (abort) setTimeout( cb.bind(context,false) , 0) ;
				 	}
					b++;
					if (!abort) {
						if (b<batches.length-1) setTimeout(batch.bind(context,b),0);
						else                    finish();
				 	}
			 	};
			}, console.error);
		},false);
		xhr.send();
	}

	get_size(url,function(size){
		totalsize=size;
		if (!size) {
			if (cb) cb.apply(context,[false]);
		} else {//ready to download
			rm(tempfn,function(){
				 batches=createBatches(size);
				 if (statuscb) statuscb.apply(context,[ 0, totalsize ]);
				 API.fs.root.getFile(tempfn, {create: 1, exclusive: false}, function(_fileEntry) {
							fileEntry=_fileEntry;
						batch(0);
				 });
			},this);
		}
	});
}

var readFile=function(filename,cb,context) {
	API.fs.root.getFile(filename, function(fileEntry) {
			var reader = new FileReader();
			reader.onloadend = function(e) {
					if (cb) cb.apply(cb,[this.result]);
				};            
	}, console.error);
}
var writeFile=function(filename,buf,cb,context){
	API.fs.root.getFile(filename, {create: true, exclusive: true}, function(fileEntry) {
			fileEntry.createWriter(function(fileWriter) {
				fileWriter.write(buf);
				fileWriter.onwriteend = function(e) {
					if (cb) cb.apply(cb,[buf.byteLength]);
				};            
			}, console.error);
	}, console.error);
}

var readdir=function(cb,context) {
	var dirReader = API.fs.root.createReader();
	var out=[],that=this;
	dirReader.readEntries(function(entries) {
		if (entries.length) {
			for (var i = 0, entry; entry = entries[i]; ++i) {
				if (entry.isFile) {
					out.push([entry.name,entry.toURL ? entry.toURL() : entry.toURI()]);
				}
			}
		}
		API.files=out;
		if (cb) cb.apply(context,[out]);
	}, function(){
		if (cb) cb.apply(context,[null]);
	});
}
var getFileURL=function(filename) {
	if (!API.files ) return null;
	var file= API.files.filter(function(f){return f[0]==filename});
	if (file.length) return file[0][1];
}
var rm=function(filename,cb,context) {
	var url=getFileURL(filename);
	if (url) rmURL(url,cb,context);
	else if (cb) cb.apply(context,[false]);
}

var rmURL=function(filename,cb,context) {
	webkitResolveLocalFileSystemURL(filename, function(fileEntry) {
		fileEntry.remove(function() {
			if (cb) cb.apply(context,[true]);
		}, console.error);
	},  function(e){
		if (cb) cb.apply(context,[false]);//no such file
	});
}
function errorHandler(e) {
	console.error('Error: ' +e.name+ " "+e.message);
}
var initfs=function(grantedBytes,cb,context) {
	webkitRequestFileSystem(PERSISTENT, grantedBytes,  function(fs) {
		API.fs=fs;
		API.quota=grantedBytes;
		readdir(function(){
			API.initialized=true;
			cb.apply(context,[grantedBytes,fs]);
		},context);
	}, errorHandler);
}
var init=function(quota,cb,context) {
	navigator.webkitPersistentStorage.requestQuota(quota, 
			function(grantedBytes) {
				initfs(grantedBytes,cb,context);
		}, errorHandler
	);
}
var queryQuota=function(cb,context) {
	var that=this;
	navigator.webkitPersistentStorage.queryUsageAndQuota( 
	 function(usage,quota){
			initfs(quota,function(){
				cb.apply(context,[usage,quota]);
			},context);
	});
}
var API={
	init:init
	,readdir:readdir
	,checkUpdate:checkUpdate
	,rm:rm
	,rmURL:rmURL
	,getFileURL:getFileURL
	,writeFile:writeFile
	,readFile:readFile
	,download:download
	,get_head:get_head
	,get_date:get_date
	,get_size:get_size
	,getDownloadSize:get_size
	,queryQuota:queryQuota
}
module.exports=API;
},{}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\htmlfs.js":[function(require,module,exports){
var html5fs=require("./html5fs");
var React=(window&&window.React)||require("react");
var E=React.createElement;

var htmlfs = React.createClass({
	getInitialState:function() { 
		return {ready:false, quota:0,usage:0,Initialized:false,autoclose:this.props.autoclose};
	},
	initFilesystem:function() {
		var quota=this.props.quota||1024*1024*128; // default 128MB
		quota=parseInt(quota);
		html5fs.init(quota,function(q){
			this.dialog=false;
			$(this.refs.dialog1.getDOMNode()).modal('hide');
			this.setState({quota:q,autoclose:true});
		},this);
	},
	welcome:function() {
		return (
		E("div", {ref: "dialog1", className: "modal fade", id: "myModal", "data-backdrop": "static"}, 
		    E("div", {className: "modal-dialog"}, 
		      E("div", {className: "modal-content"}, 
		        E("div", {className: "modal-header"}, 
		          E("h4", {className: "modal-title"}, "Welcome")
		        ), 
		        E("div", {className: "modal-body"}, 
		          "Browser will ask for your confirmation."
		        ), 
		        E("div", {className: "modal-footer"}, 
		          E("button", {onClick: this.initFilesystem, type: "button", 
		            className: "btn btn-primary"}, "Initialize File System")
		        )
		      )
		    )
		  )
		 );
	},
	renderDefault:function(){
		var used=Math.floor(this.state.usage/this.state.quota *100);
		var more=function() {
			if (used>50) return E("button", {type: "button", className: "btn btn-primary"}, "Allocate More");
			else null;
		}
		return (
		E("div", {ref: "dialog1", className: "modal fade", id: "myModal", "data-backdrop": "static"}, 
		    E("div", {className: "modal-dialog"}, 
		      E("div", {className: "modal-content"}, 
		        E("div", {className: "modal-header"}, 
		          E("h4", {className: "modal-title"}, "Sandbox File System")
		        ), 
		        E("div", {className: "modal-body"}, 
		          E("div", {className: "progress"}, 
		            E("div", {className: "progress-bar", role: "progressbar", style: {width: used+"%"}}, 
		               used, "%"
		            )
		          ), 
		          E("span", null, this.state.quota, " total , ", this.state.usage, " in used")
		        ), 
		        E("div", {className: "modal-footer"}, 
		          E("button", {onClick: this.dismiss, type: "button", className: "btn btn-default", "data-dismiss": "modal"}, "Close"), 
		          more()
		        )
		      )
		    )
		  )
		  );
	},
	dismiss:function() {
		var that=this;
		setTimeout(function(){
			that.props.onReady(that.state.quota,that.state.usage);	
		},0);
	},
	queryQuota:function() {
		if (ksanagap.platform=="chrome") {
			html5fs.queryQuota(function(usage,quota){
				this.setState({usage:usage,quota:quota,initialized:true});
			},this);			
		} else {
			this.setState({usage:333,quota:1000*1000*1024,initialized:true,autoclose:true});
		}
	},
	render:function() {
		var that=this;
		if (!this.state.quota || this.state.quota<this.props.quota) {
			if (this.state.initialized) {
				this.dialog=true;
				return this.welcome();	
			} else {
				return E("span", null, "checking quota");
			}			
		} else {
			if (!this.state.autoclose) {
				this.dialog=true;
				return this.renderDefault(); 
			}
			this.dismiss();
			this.dialog=false;
			return null;
		}
	},
	componentDidMount:function() {
		if (!this.state.quota) {
			this.queryQuota();

		};
	},
	componentDidUpdate:function() {
		if (this.dialog) $(this.refs.dialog1.getDOMNode()).modal('show');
	}
});

module.exports=htmlfs;
},{"./html5fs":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\html5fs.js","react":"react"}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\index.js":[function(require,module,exports){
var ksana={"platform":"remote"};
if (typeof window!="undefined") {
	window.ksana=ksana;
	if (typeof ksanagap=="undefined") {
		window.ksanagap=require("./ksanagap"); //compatible layer with mobile
	}
}
if (typeof process !="undefined") {
	if (process.versions && process.versions["node-webkit"]) {
  		if (typeof nodeRequire!="undefined") ksana.require=nodeRequire;
  		ksana.platform="node-webkit";
  		window.ksanagap.platform="node-webkit";
		var ksanajs=require("fs").readFileSync("ksana.js","utf8").trim();
		ksana.js=JSON.parse(ksanajs.substring(14,ksanajs.length-1));
		window.kfs=require("./kfs");
  	}
} else if (typeof chrome!="undefined"){//} && chrome.fileSystem){
//	window.ksanagap=require("./ksanagap"); //compatible layer with mobile
	window.ksanagap.platform="chrome";
	window.kfs=require("./kfs_html5");
	if(window.location.origin.indexOf("//127.0.0.1")>-1) {
		require("./livereload")();
	}
	ksana.platform="chrome";
} else {
	if (typeof ksanagap!="undefined" && typeof fs!="undefined") {//mobile
		var ksanajs=fs.readFileSync("ksana.js","utf8").trim(); //android extra \n at the end
		ksana.js=JSON.parse(ksanajs.substring(14,ksanajs.length-1));
		ksana.platform=ksanagap.platform;
		if (typeof ksanagap.android !="undefined") {
			ksana.platform="android";
		}
	}
}
var timer=null;
var React=window.React||require("react");
var boot=function(appId,cb) {
	if (typeof React!="undefined") {
		React.initializeTouchEvents(true);
	}
	ksana.appId=appId;
	if (ksanagap.platform=="chrome") { //need to wait for jsonp ksana.js
		timer=setInterval(function(){
			if (ksana.ready){
				clearInterval(timer);
				if (ksana.js && ksana.js.files && ksana.js.files.length) {
					require("./installkdb")(ksana.js,cb);
				} else {
					cb();		
				}
			}
		},300);
	} else {
		cb();
	}
}

module.exports={boot:boot
	,htmlfs:require("./htmlfs")
	,html5fs:require("./html5fs")
	,liveupdate:require("./liveupdate")
	,fileinstaller:require("./fileinstaller")
	,downloader:require("./downloader")
	,installkdb:require("./installkdb")
};
},{"./downloader":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\downloader.js","./fileinstaller":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\fileinstaller.js","./html5fs":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\html5fs.js","./htmlfs":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\htmlfs.js","./installkdb":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\installkdb.js","./kfs":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\kfs.js","./kfs_html5":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\kfs_html5.js","./ksanagap":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\ksanagap.js","./livereload":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\livereload.js","./liveupdate":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\liveupdate.js","fs":false,"react":"react"}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\installkdb.js":[function(require,module,exports){
var React=(window&&window.React)||require("react");
var Fileinstaller=require("./fileinstaller");

var getRequire_kdb=function() {
    var required=[];
    ksana.js.files.map(function(f){
      if (f.indexOf(".kdb")==f.length-4) {
        var slash=f.lastIndexOf("/");
        if (slash>-1) {
          var dbid=f.substring(slash+1,f.length-4);
          required.push({url:f,dbid:dbid,filename:dbid+".kdb"});
        } else {
          var dbid=f.substring(0,f.length-4);
          required.push({url:ksana.js.baseurl+f,dbid:dbid,filename:f});
        }        
      }
    });
    return required;
}
var callback=null;
var onReady=function() {
	callback();
}
var openFileinstaller=function(keep) {
	var require_kdb=getRequire_kdb().map(function(db){
	  return {
	    url:window.location.origin+window.location.pathname+db.dbid+".kdb",
	    dbdb:db.dbid,
	    filename:db.filename
	  }
	})
	return React.createElement(Fileinstaller, {quota: "512M", autoclose: !keep, needed: require_kdb, 
	                 onReady: onReady});
}
var installkdb=function(ksanajs,cb,context) {
	React.render(openFileinstaller(),document.getElementById("main"));
	callback=cb;
}
module.exports=installkdb;
},{"./fileinstaller":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\fileinstaller.js","react":"react"}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\kfs.js":[function(require,module,exports){
//Simulate feature in ksanagap
/* 
  runs on node-webkit only
*/

var readDir=function(path) { //simulate Ksanagap function
	var fs=nodeRequire("fs");
	path=path||"..";
	var dirs=[];
	if (path[0]==".") {
		if (path==".") dirs=fs.readdirSync(".");
		else {
			dirs=fs.readdirSync("..");
		}
	} else {
		dirs=fs.readdirSync(path);
	}

	return dirs.join("\uffff");
}
var listApps=function() {

	var fs=nodeRequire("fs");
	var ksanajsfile=function(d) {return "../"+d+"/ksana.js"};
	var dirs=fs.readdirSync("..").filter(function(d){
				return fs.statSync("../"+d).isDirectory() && d[0]!="."
				   && fs.existsSync(ksanajsfile(d));
	});
	
	var out=dirs.map(function(d){

		var fn=ksanajsfile(d);
		if (!fs.existsSync(fn)) return;
		var content=fs.readFileSync(fn,"utf8");
  		content=content.replace("})","}");
  		content=content.replace("jsonp_handler(","");
  		try{
  			var obj= JSON.parse(content);
			obj.dbid=d;
			obj.path=d;
			return obj;
  		} catch(e) {
  			console.log(e);
  			return null;
  		}
	});

	out=out.filter(function(o){return !!o});
	return JSON.stringify(out);
}



var kfs={readDir:readDir,listApps:listApps};

module.exports=kfs;
},{}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\kfs_html5.js":[function(require,module,exports){
var readDir=function(){
	return "[]";
}
var listApps=function(){
	return "[]";
}
module.exports={readDir:readDir,listApps:listApps};
},{}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\ksanagap.js":[function(require,module,exports){
var appname="installer";
var switchApp=function(path) {
	var fs=require("fs");
	path="../"+path;
	appname=path;
	document.location.href= path+"/index.html"; 
	process.chdir(path);
}
var downloader={};
var rootPath="";

var deleteApp=function(app) {
	console.error("not allow on PC, do it in File Explorer/ Finder");
}
var username=function() {
	return "";
}
var useremail=function() {
	return ""
}
var runtime_version=function() {
	return "1.4";
}

//copy from liveupdate
var jsonp=function(url,dbid,callback,context) {
  var script=document.getElementById("jsonp2");
  if (script) {
    script.parentNode.removeChild(script);
  }
  window.jsonp_handler=function(data) {
    if (typeof data=="object") {
      data.dbid=dbid;
      callback.apply(context,[data]);    
    }  
  }
  window.jsonp_error_handler=function() {
    console.error("url unreachable",url);
    callback.apply(context,[null]);
  }
  script=document.createElement('script');
  script.setAttribute('id', "jsonp2");
  script.setAttribute('onerror', "jsonp_error_handler()");
  url=url+'?'+(new Date().getTime());
  script.setAttribute('src', url);
  document.getElementsByTagName('head')[0].appendChild(script); 
}

var ksanagap={
	platform:"node-webkit",
	startDownload:downloader.startDownload,
	downloadedByte:downloader.downloadedByte,
	downloadingFile:downloader.downloadingFile,
	cancelDownload:downloader.cancelDownload,
	doneDownload:downloader.doneDownload,
	switchApp:switchApp,
	rootPath:rootPath,
	deleteApp: deleteApp,
	username:username, //not support on PC
	useremail:username,
	runtime_version:runtime_version,
	
}

if (typeof process!="undefined" && !process.browser) {
	var ksanajs=require("fs").readFileSync("./ksana.js","utf8").trim();
	downloader=require("./downloader");
	//ksana.js=JSON.parse(ksanajs.substring(14,ksanajs.length-1));
	rootPath=process.cwd();
	rootPath=require("path").resolve(rootPath,"..").replace(/\\/g,"/")+'/';
	ksana.ready=true;
} else{
	var url=window.location.origin+window.location.pathname.replace("index.html","")+"ksana.js";
	jsonp(url,appname,function(data){
		ksana.js=data;
		ksana.ready=true;
	});
}
module.exports=ksanagap;
},{"./downloader":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\downloader.js","fs":false,"path":false}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\livereload.js":[function(require,module,exports){
var started=false;
var timer=null;
var bundledate=null;
var get_date=require("./html5fs").get_date;
var checkIfBundleUpdated=function() {
	get_date("bundle.js",function(date){
		if (bundledate &&bundledate!=date){
			location.reload();
		}
		bundledate=date;
	});
}
var livereload=function() {
	if (started) return;

	timer1=setInterval(function(){
		checkIfBundleUpdated();
	},2000);
	started=true;
}

module.exports=livereload;
},{"./html5fs":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\html5fs.js"}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\liveupdate.js":[function(require,module,exports){

var jsonp=function(url,dbid,callback,context) {
  var script=document.getElementById("jsonp");
  if (script) {
    script.parentNode.removeChild(script);
  }
  if (typeof dbid=="function") {
    context=callback;
    callback=dbid;
    dbid="";
  }
  window.jsonp_handler=function(data) {
    //console.log("receive from ksana.js",data);
    if (typeof data=="object" && dbid) {
      if (typeof data.dbid=="undefined") {
        data.dbid=dbid;
      }
    }
    callback.apply(context,[data]);
  }

  window.jsonp_error_handler=function() {
    console.error("url unreachable",url);
    callback.apply(context,[null]);
  }

  script=document.createElement('script');
  script.setAttribute('id', "jsonp");
  script.setAttribute('onerror', "jsonp_error_handler()");
  url=url+'?'+(new Date().getTime());
  script.setAttribute('src', url);
  document.getElementsByTagName('head')[0].appendChild(script); 
}
var runtime_version_ok=function(minruntime) {
  if (!minruntime) return true;//not mentioned.
  var min=parseFloat(minruntime);
  var runtime=parseFloat( ksanagap.runtime_version()||"1.0");
  if (min>runtime) return false;
  return true;
}

var needToUpdate=function(fromjson,tojson) {
  var needUpdates=[];
  for (var i=0;i<fromjson.length;i++) { 
    var to=tojson[i];
    var from=fromjson[i];
    var newfiles=[],newfilesizes=[],removed=[];
    
    if (!to || !to.files) continue; //cannot reach host
    if (!runtime_version_ok(to.minruntime)) {
      console.warn("runtime too old, need "+to.minruntime);
      continue; 
    }
    if (!from.filedates) {
      console.warn("missing filedates in ksana.js of "+from.dbid);
      continue;
    }
    from.filedates.map(function(f,idx){
      var newidx=to.files.indexOf( from.files[idx]);
      if (newidx==-1) {
        //file removed in new version
        removed.push(from.files[idx]);
      } else {
        var fromdate=Date.parse(f);
        var todate=Date.parse(to.filedates[newidx]);
        if (fromdate<todate) {
          newfiles.push( to.files[newidx] );
          newfilesizes.push(to.filesizes[newidx]);
        }        
      }
    });
    if (newfiles.length) {
      from.newfiles=newfiles;
      from.newfilesizes=newfilesizes;
      from.removed=removed;
      needUpdates.push(from);
    }
  }
  return needUpdates;
}
var getUpdatables=function(apps,cb,context) {
  getRemoteJson(apps,function(jsons){
    var hasUpdates=needToUpdate(apps,jsons);
    cb.apply(context,[hasUpdates]);
  },context);
}
var getRemoteJson=function(apps,cb,context) {
  var taskqueue=[],output=[];
  var makecb=function(app){
    return function(data){
        if (!(data && typeof data =='object' && data.__empty)) output.push(data);
        if (!app.baseurl) {
          taskqueue.shift({__empty:true});
        } else {
          var url=app.baseurl+"/ksana.js";
          try {
            jsonp( url ,app.dbid,taskqueue.shift(), context);             
          } catch(e) {
            console.log(e);
            taskqueue.shift({__empty:true});
          }
        }
    };
  };
  apps.forEach(function(app){taskqueue.push(makecb(app))});

  taskqueue.push(function(data){
    output.push(data);
    cb.apply(context,[output]);
  });

  taskqueue.shift()({__empty:true}); //run the task
}
var humanFileSize=function(bytes, si) {
    var thresh = si ? 1000 : 1024;
    if(bytes < thresh) return bytes + ' B';
    var units = si ? ['kB','MB','GB','TB','PB','EB','ZB','YB'] : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(bytes >= thresh);
    return bytes.toFixed(1)+' '+units[u];
};
var humanDate=function(datestring) {
    var d=Date.parse(datestring);
    if (isNaN(d)) {
      return "invalid date";
    } else {
      return new Date(d).toLocaleString();
    }
}
var start=function(ksanajs,cb,context){
  var files=ksanajs.newfiles||ksanajs.files;
  var baseurl=ksanajs.baseurl|| "http://127.0.0.1:8080/"+ksanajs.dbid+"/";
  var started=ksanagap.startDownload(ksanajs.dbid,baseurl,files.join("\uffff"));
  cb.apply(context,[started]);
}
var status=function(){
  var nfile=ksanagap.downloadingFile();
  var downloadedByte=ksanagap.downloadedByte();
  var done=ksanagap.doneDownload();
  return {nfile:nfile,downloadedByte:downloadedByte, done:done};
}

var cancel=function(){
  return ksanagap.cancelDownload();
}

var liveupdate={ humanFileSize: humanFileSize, humanDate:humanDate,
  needToUpdate: needToUpdate , jsonp:jsonp, 
  getUpdatables:getUpdatables,
  start:start,
  cancel:cancel,
  status:status
  };
module.exports=liveupdate;
},{}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\mkdirp.js":[function(require,module,exports){
function mkdirP (p, mode, f, made) {
     var path = nodeRequire('path');
     var fs = nodeRequire('fs');
	
    if (typeof mode === 'function' || mode === undefined) {
        f = mode;
        mode = 0x1FF & (~process.umask());
    }
    if (!made) made = null;

    var cb = f || function () {};
    if (typeof mode === 'string') mode = parseInt(mode, 8);
    p = path.resolve(p);

    fs.mkdir(p, mode, function (er) {
        if (!er) {
            made = made || p;
            return cb(null, made);
        }
        switch (er.code) {
            case 'ENOENT':
                mkdirP(path.dirname(p), mode, function (er, made) {
                    if (er) cb(er, made);
                    else mkdirP(p, mode, cb, made);
                });
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                fs.stat(p, function (er2, stat) {
                    // if the stat fails, then that's super weird.
                    // let the original error be the failure reason.
                    if (er2 || !stat.isDirectory()) cb(er, made)
                    else cb(null, made);
                });
                break;
        }
    });
}

mkdirP.sync = function sync (p, mode, made) {
    var path = nodeRequire('path');
    var fs = nodeRequire('fs');
    if (mode === undefined) {
        mode = 0x1FF & (~process.umask());
    }
    if (!made) made = null;

    if (typeof mode === 'string') mode = parseInt(mode, 8);
    p = path.resolve(p);

    try {
        fs.mkdirSync(p, mode);
        made = made || p;
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                made = sync(path.dirname(p), mode, made);
                sync(p, mode, made);
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                var stat;
                try {
                    stat = fs.statSync(p);
                }
                catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
                break;
        }
    }

    return made;
};

module.exports = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;

},{}],"C:\\ksana2015\\treetoc-sample\\index.js":[function(require,module,exports){
var React=require("react");
var runtime=require("ksana2015-webruntime");
runtime.boot("treetoc-sample",function(){
	var Main=React.createElement(require("./src/main.jsx"));
	ksana.mainComponent=React.render(Main,document.getElementById("main"));
});
},{"./src/main.jsx":"C:\\ksana2015\\treetoc-sample\\src\\main.jsx","ksana2015-webruntime":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\index.js","react":"react"}],"C:\\ksana2015\\treetoc-sample\\src\\jwl-toc.js":[function(require,module,exports){
module.exports=[{"d":0,"t":"江味農金剛經講義"},{"d":1,"t":"總釋名題"},{"d":2,"t":"釋經題"},{"d":3,"t":"說般若網要"},{"d":3,"t":"明融會各家"},{"d":3,"t":"依五重譯題"},{"d":4,"t":"總解科意"},{"d":4,"t":"依次開釋"},{"d":5,"t":"釋名"},{"d":6,"t":"通名"},{"d":6,"t":"別名"},{"d":5,"t":"顯體"},{"d":6,"t":"明體義"},{"d":6,"t":"辨異同"},{"d":6,"t":"正顯體"},{"d":5,"t":"明宗"},{"d":6,"t":"明宗義"},{"d":6,"t":"辨異同"},{"d":6,"t":"正明宗"},{"d":5,"t":"辨用"},{"d":5,"t":"判教相"},{"d":6,"t":"總論"},{"d":7,"t":"解釋名義"},{"d":7,"t":"泛論教相"},{"d":6,"t":"正判"},{"d":2,"t":"釋人題"},{"d":1,"t":"別解文義"},{"d":2,"t":"序分"},{"d":3,"t":"證信序"},{"d":3,"t":"發起序"},{"d":2,"t":"正宗分"},{"d":3,"t":"當機讚請"},{"d":4,"t":"禮讚"},{"d":5,"t":"具儀"},{"d":5,"t":"稱讚"},{"d":4,"t":"請法"},{"d":3,"t":"如來讚許"},{"d":4,"t":"讚印"},{"d":4,"t":"許說"},{"d":5,"t":"總示"},{"d":6,"t":"誡聽標宗"},{"d":6,"t":"契旨請詳"},{"d":5,"t":"詳談"},{"d":6,"t":"約境明無住以彰般若正智"},{"d":7,"t":"的示無住以生信"},{"d":8,"t":"明示"},{"d":9,"t":"明發離相心即是降伏"},{"d":10,"t":"標示"},{"d":10,"t":"正明"},{"d":10,"t":"徵釋"},{"d":9,"t":"不住於相即是正住"},{"d":10,"t":"正明無住"},{"d":11,"t":"標示"},{"d":11,"t":"指釋"},{"d":11,"t":"結成"},{"d":10,"t":"釋顯其故"},{"d":11,"t":"徵釋"},{"d":11,"t":"喻明"},{"d":11,"t":"法合"},{"d":10,"t":"結示正住"},{"d":10,"t":"更明所以"},{"d":11,"t":"問答釋明"},{"d":12,"t":"問"},{"d":12,"t":"答"},{"d":13,"t":"雙明"},{"d":13,"t":"釋成"},{"d":11,"t":"闡義印許"},{"d":12,"t":"明性本非相"},{"d":12,"t":"明即相見性"},{"d":8,"t":"生信"},{"d":9,"t":"揀示根機"},{"d":10,"t":"問"},{"d":10,"t":"答"},{"d":11,"t":"揀能信之機"},{"d":11,"t":"示夙根之厚"},{"d":9,"t":"明其福德"},{"d":10,"t":"正明其福"},{"d":10,"t":"釋顯其故"},{"d":11,"t":"正釋"},{"d":11,"t":"反顯"},{"d":9,"t":"結顯中道"},{"d":10,"t":"以雙離結成"},{"d":10,"t":"引筏喻顯義"},{"d":9,"t":"問釋證成"},{"d":10,"t":"舉如來果德問"},{"d":10,"t":"以法不可執釋"},{"d":11,"t":"明無定法"},{"d":11,"t":"釋應雙非"},{"d":10,"t":"引一切無為證"},{"d":8,"t":"校勝"},{"d":9,"t":"布施福多"},{"d":10,"t":"舉事設問"},{"d":10,"t":"答釋所以"},{"d":9,"t":"信經殊勝"},{"d":9,"t":"釋成經功"},{"d":9,"t":"結歸離相"},{"d":7,"t":"推闡無住以開解"},{"d":8,"t":"約果廣明"},{"d":9,"t":"泛論四果"},{"d":10,"t":"明初果離相"},{"d":10,"t":"明二果離相"},{"d":10,"t":"明三果離相"},{"d":10,"t":"明四果離相"},{"d":9,"t":"師資證成"},{"d":10,"t":"約當機無得證"},{"d":11,"t":"引佛說"},{"d":11,"t":"陳離相"},{"d":11,"t":"釋所以"},{"d":12,"t":"反顯"},{"d":12,"t":"正明"},{"d":10,"t":"約往因無得證"},{"d":8,"t":"約因詳顯"},{"d":9,"t":"約因心正顯"},{"d":10,"t":"先明嚴土不住"},{"d":10,"t":"顯成發無住心"},{"d":10,"t":"證以報身不住"},{"d":9,"t":"約經功校顯"},{"d":10,"t":"顯福德勝"},{"d":11,"t":"引河沙喻"},{"d":11,"t":"明寶施福"},{"d":11,"t":"顯持經勝"},{"d":10,"t":"顯勝所以"},{"d":11,"t":"明隨說福"},{"d":11,"t":"明盡持福"},{"d":12,"t":"正明盡持"},{"d":12,"t":"正明所以"},{"d":13,"t":"約成就正顯"},{"d":13,"t":"約熏習結成"},{"d":8,"t":"請示名持"},{"d":9,"t":"請"},{"d":9,"t":"示"},{"d":10,"t":"總示名持"},{"d":11,"t":"示能斷之名"},{"d":11,"t":"示持經之法"},{"d":10,"t":"詳明所以"},{"d":11,"t":"總標"},{"d":11,"t":"別詳"},{"d":12,"t":"示會歸性體"},{"d":13,"t":"示應離名字相持"},{"d":13,"t":"示應離言說相持"},{"d":12,"t":"示不壞假名"},{"d":13,"t":"示不著境相持"},{"d":14,"t":"問答"},{"d":14,"t":"正示"},{"d":15,"t":"不著微細相"},{"d":15,"t":"不著廣大相"},{"d":13,"t":"示不著身相持"},{"d":10,"t":"結顯持福"},{"d":11,"t":"約命施校"},{"d":11,"t":"明持福多"},{"d":8,"t":"成就解慧"},{"d":9,"t":"初當機讚勸"},{"d":10,"t":"標領解"},{"d":10,"t":"陳讚慶"},{"d":10,"t":"勸信解"},{"d":11,"t":"約現前勸"},{"d":12,"t":"明成就"},{"d":12,"t":"明實相"},{"d":11,"t":"約當來勸"},{"d":12,"t":"慶今勸後"},{"d":13,"t":"自慶"},{"d":13,"t":"廣勸"},{"d":12,"t":"釋顯其故"},{"d":13,"t":"正顯不著有"},{"d":13,"t":"轉顯不著空"},{"d":13,"t":"結顯名諸佛"},{"d":9,"t":"如來印闡"},{"d":10,"t":"印可"},{"d":10,"t":"闡義"},{"d":11,"t":"闡明觀行離相義務"},{"d":12,"t":"約般若明"},{"d":12,"t":"約餘度明"},{"d":13,"t":"正明"},{"d":13,"t":"引證"},{"d":14,"t":"引本劫事"},{"d":14,"t":"引多生事"},{"d":11,"t":"闡明說法真實義"},{"d":12,"t":"總結前文"},{"d":13,"t":"結成無住發心"},{"d":14,"t":"標結"},{"d":14,"t":"釋成"},{"d":14,"t":"反顯"},{"d":13,"t":"結成無住布施"},{"d":14,"t":"結不應"},{"d":14,"t":"結成應"},{"d":15,"t":"總標"},{"d":15,"t":"別明"},{"d":12,"t":"正明真實"},{"d":13,"t":"明說真實"},{"d":13,"t":"明法真實"},{"d":12,"t":"重以喻明"},{"d":13,"t":"喻住法之過"},{"d":13,"t":"喻不住之功"},{"d":10,"t":"結成"},{"d":8,"t":"極顯經功"},{"d":9,"t":"約生福顯"},{"d":10,"t":"立喻"},{"d":10,"t":"顯勝"},{"d":11,"t":"約福總示"},{"d":12,"t":"聞信即勝"},{"d":12,"t":"持說更勝"},{"d":11,"t":"舉要別明"},{"d":12,"t":"約教義明"},{"d":12,"t":"約緣起明"},{"d":12,"t":"約荷擔明"},{"d":13,"t":"正顯"},{"d":13,"t":"反顯"},{"d":11,"t":"結顯經勝"},{"d":9,"t":"約滅罪顯"},{"d":10,"t":"標輕賤之因"},{"d":10,"t":"明滅罪得福"},{"d":9,"t":"約供佛顯"},{"d":10,"t":"明供佛"},{"d":10,"t":"顯持經"},{"d":9,"t":"結成經功"},{"d":10,"t":"明難具說"},{"d":10,"t":"明不思議"},{"d":6,"t":"約心明無住以顯般若理體"},{"d":7,"t":"深觀無住以進修"},{"d":8,"t":"發心無法"},{"d":9,"t":"重請"},{"d":9,"t":"示教"},{"d":9,"t":"徵釋"},{"d":9,"t":"結成"},{"d":8,"t":"舉果明因"},{"d":9,"t":"詳明"},{"d":10,"t":"明果"},{"d":11,"t":"明無得而得"},{"d":12,"t":"舉問"},{"d":12,"t":"答釋"},{"d":12,"t":"印成"},{"d":13,"t":"如來印許"},{"d":13,"t":"反正釋成"},{"d":14,"t":"反釋"},{"d":14,"t":"正釋"},{"d":11,"t":"明法法皆如"},{"d":12,"t":"約名號明如"},{"d":12,"t":"約果德明如"},{"d":13,"t":"明無法"},{"d":13,"t":"明一如"},{"d":12,"t":"約諸法明如"},{"d":13,"t":"明即一切法"},{"d":13,"t":"明離一切相"},{"d":12,"t":"約報身明如"},{"d":10,"t":"明因"},{"d":11,"t":"正遣法執"},{"d":12,"t":"約度生遣"},{"d":13,"t":"標遣"},{"d":13,"t":"徵釋"},{"d":14,"t":"釋無法"},{"d":14,"t":"釋無我"},{"d":12,"t":"約嚴土遣"},{"d":13,"t":"標遣"},{"d":13,"t":"徵釋"},{"d":11,"t":"令達無我"},{"d":12,"t":"標示通達"},{"d":12,"t":"開佛知見"},{"d":13,"t":"明圓見"},{"d":14,"t":"明不執一"},{"d":14,"t":"明不執異"},{"d":13,"t":"明正知"},{"d":14,"t":"明心行叵得"},{"d":15,"t":"喻眾明知"},{"d":16,"t":"引喻"},{"d":16,"t":"悉知"},{"d":15,"t":"釋明非心"},{"d":15,"t":"結成叵得"},{"d":14,"t":"明諸法緣生"},{"d":15,"t":"約福報明無性"},{"d":16,"t":"明福德"},{"d":17,"t":"明福德因緣"},{"d":17,"t":"明緣會則生"},{"d":16,"t":"明報身"},{"d":17,"t":"明色身非性"},{"d":17,"t":"明相好非性"},{"d":15,"t":"約法施明體空"},{"d":16,"t":"明無法可說"},{"d":17,"t":"對機則說"},{"d":18,"t":"示說法無念"},{"d":18,"t":"釋有念即執"},{"d":17,"t":"本無可說"},{"d":16,"t":"明聞者性空"},{"d":17,"t":"請問"},{"d":17,"t":"遣執"},{"d":17,"t":"釋成"},{"d":16,"t":"明無法可得"},{"d":17,"t":"陳悟"},{"d":17,"t":"印釋"},{"d":9,"t":"結示"},{"d":10,"t":"直顯性體"},{"d":10,"t":"的示修功"},{"d":10,"t":"結無能所"},{"d":8,"t":"顯勝結勸"},{"d":9,"t":"引喻顯"},{"d":9,"t":"正結勸"},{"d":7,"t":"究極無住以成證"},{"d":8,"t":"明平等法界顯成法無我"},{"d":9,"t":"約度生明無聖凡"},{"d":10,"t":"明度無度念"},{"d":11,"t":"標示"},{"d":11,"t":"釋成"},{"d":10,"t":"明本無聖凡"},{"d":9,"t":"約性相明非一異"},{"d":10,"t":"總顯如義"},{"d":10,"t":"別遣情執"},{"d":11,"t":"遣取相明非一"},{"d":12,"t":"破解示遣"},{"d":12,"t":"說偈結成"},{"d":11,"t":"遣滅相明非異"},{"d":12,"t":"標示切誡"},{"d":12,"t":"結顯正義"},{"d":9,"t":"約不受福德結無我"},{"d":10,"t":"結無我"},{"d":11,"t":"明無我功勝"},{"d":12,"t":"引事"},{"d":12,"t":"較勝"},{"d":11,"t":"明由其不受"},{"d":10,"t":"明不著"},{"d":11,"t":"請明其義"},{"d":11,"t":"釋明不著"},{"d":8,"t":"明諸法空相結成法不生"},{"d":9,"t":"泯相入體"},{"d":10,"t":"約聖號明離去來"},{"d":11,"t":"斥凡情"},{"d":11,"t":"釋正義"},{"d":10,"t":"約塵界明離一多"},{"d":11,"t":"明微塵非多"},{"d":12,"t":"問微塵多否"},{"d":12,"t":"明多即非多"},{"d":12,"t":"釋其所以"},{"d":11,"t":"明世界非一"},{"d":12,"t":"明非界名界"},{"d":12,"t":"釋一即非一"},{"d":12,"t":"示本離言說"},{"d":10,"t":"約我見明離亦離"},{"d":11,"t":"問答明義"},{"d":11,"t":"釋成其故"},{"d":9,"t":"結成不生"},{"d":10,"t":"正明不生"},{"d":10,"t":"不生亦無"},{"d":2,"t":"流通分"},{"d":3,"t":"示勸流通"},{"d":4,"t":"示流通益"},{"d":5,"t":"引財施"},{"d":5,"t":"明法施"},{"d":4,"t":"示流通法"},{"d":5,"t":"直指本性"},{"d":5,"t":"觀法緣生"},{"d":3,"t":"正結流通"}]
},{}],"C:\\ksana2015\\treetoc-sample\\src\\main.jsx":[function(require,module,exports){
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
var LinkCompononent = React.createClass({displayName: "LinkCompononent",
	click:function(e) {
		e.stopPropagation();
	}
	,render :function() {
		return React.createElement("a", {onClick: this.click, key: "k"+this.props.key, className: "nodelink"}, this.props.caption, " ")
	}
});

var onNode=function(cur) {
	if (cur.links) { 
		return cur.links.map(function(link,idx){return React.createElement(LinkCompononent, {caption: link, key: idx})});
	}
	else return null;
}
var maincomponent = React.createClass({displayName: "maincomponent",
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
    return React.createElement("div", null, 
    React.createElement("button", {onClick: this.expandAll}, "打開全部"), React.createElement("button", {onClick: this.closeAll}, "關閉全部"), 
      React.createElement(TreeToc, {data: toc, opts: {tocstyle:"ganzhi", onNode:onNode}})
    );
  }
});
module.exports=maincomponent;
},{"./jwl-toc":"C:\\ksana2015\\treetoc-sample\\src\\jwl-toc.js","ksana2015-treetoc":"C:\\ksana2015\\node_modules\\ksana2015-treetoc\\index.js","react":"react"}]},{},["C:\\ksana2015\\treetoc-sample\\index.js"])


//# sourceMappingURL=bundle.js.map