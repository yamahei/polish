(function(global){
	const functions = {
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
	 const tree = {};
	/*var tree = {
		name: "add", icon:"+", child: 2,
		children: [
			{ name:"sub", icon:"-", child: 2, children: [ 6, 2 ], },
			{ name:"mul", icon:"*", child: 2, children: [ 6, 2 ], },
		],
	};*/
	const calc = function(tree){
		if(typeof(tree) === "number") { return tree.toString(); }
		if(typeof(tree) === "undefined")
		{ throw new Error("undefined node."); }
		if(tree.child !== tree.children.length)
		{ throw new Error("defective expression."); }
		let expression = functions[tree.name].eval;
		for(let i=0; i<tree.children.length; i++){
			const name = "{" + (i+1) + "}";
			const value = '(' + calc(tree.children[i]).toString() + ')';
			expression = expression.replace(name, value);
		}
		return expression;
	};
	const to_polish = function(tree){
		if(typeof(tree) === "number") { return [tree.toString()]; }
		if(typeof(tree) === "undefined")
		{ throw new Error("undefined node."); }
		if(tree.child !== tree.children.length)
		{ throw new Error("defective expression."); }
		const func = functions[tree.name].icon;
		return [func].concat(to_polish(tree.children[0])).concat(to_polish(tree.children[1])).join(" ");
	};

	if(!global.tree_calc) { global.tree_calc = {}; }
	global.tree_calc = {
		'calc': calc,
		'functions': functions,
		'to_polish': to_polish,
	};

	//console.log("answer="+calc(tree));
})(window);

