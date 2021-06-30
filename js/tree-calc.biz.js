(function(global){
	var functions = {
		"add": { name:"add", icon:"+", child: 2, eval: "{1} + {2}"},
		"sub": { name:"sub", icon:"-", child: 2, eval: "{1} - {2}"},
		"mul": { name:"mul", icon:"*", child: 2, eval: "{1} * {2}"},
		"div": { name:"div", icon:"/", child: 2, eval: "{1} / {2}"},
	};
	/**
	 * tree {
	 * 	name: string, icon: string, child: 0|1|2, children: array
	 * }
	 */
	var tree = {};
	/*var tree = {
		name: "add", icon:"+", child: 2,
		children: [
			{ name:"sub", icon:"-", child: 2, children: [ 6, 2 ], },
			{ name:"mul", icon:"*", child: 2, children: [ 6, 2 ], },
		],
	};*/
	var calc = function(tree){
		if(typeof(tree) === "number") { return tree.toString(); }
		if(typeof(tree) === "undefined")
		{ throw new Error("undefined node."); }
		if(tree.child !== tree.children.length)
		{ throw new Error("defective expression."); }
		var expression = functions[tree.name].eval;
		for(var i=0; i<tree.children.length; i++){
			var name = "{" + (i+1) + "}";
			var value = '(' + calc(tree.children[i]).toString() + ')';
			expression = expression.replace(name, value);
		}
		return expression;
	};
	
	if(!global.tree_calc) { global.tree_calc = {}; }
	global.tree_calc = {
		'calc': calc,
		'functions': functions,
	};		
	
	//console.log("answer="+calc(tree));
})(window);

