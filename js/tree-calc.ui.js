$(function(){
	var delay = 250;
	var global = window;
	var biz = global.tree_calc;
	var node_template = $('#node-template').text();
	var cmd_template = $('#commandbutton-template').text();
	var file_template = $('#filelist-template').text();
	var container_path = 'div.nodecontainer';
	var node_path = 'div.node';
	var element_path = 'span.element';//ATTENION: child of node
	var relations_path = 'div.relations';
	var children_path = 'div.children';
	var top = $('#top-level-container');
	var storage = global.myLocalStorage.getAccessor('polish', []);
	var current = '';

	
	var node_status = function(targetnodecontainer){
		var contaner = targetnodecontainer;
		var node = $(contaner).children(node_path);
		var element = $(node).children(element_path);
		var children = $(contaner).children(children_path);
		var type = $(node).attr('type');
		var childs = $(node).attr('childs') * 1;
		return {
			'node': node,
			'element': element,
			'children': children,
			'type': type,
			'childs': childs,
		};
	}
		
	// init modal
	var dentak = $('#dentak');
	var panel = $('#panel');
	$(dentak).on('click', '.btn', function(){
		var value = $(panel).val();
		if(value === '0'){ value = ''; }
		if($(this).hasClass('btn-num')){
			value += '' + $(this).text();
		}else if($(this).hasClass('btn-bks')){
			value = value.slice(0, -1);
		}else if($(this).hasClass('btn-clr')){
			value = '0';
		}else if($(this).hasClass('btn-zer')){
			if(value !== '0'){ value += '' + $(this).text(); }
		}else if($(this).hasClass('btn-dot')){
			if(value.indexOf('.') < 0){ value += '' + $(this).text(); }				
		}
		if(value === '' || value === '00'){ value = '0'; }
		if(value === '.'){ value = '0.'; }
		$(panel).val(value);
	});
	//init command
	var command = $('#command');
	var keys = Object.keys(biz.functions);
	for(var i=0; i<keys.length; i++){
		var key = keys[i];
		var button = $(cmd_template);
		var classname = 'btn-' + key;
		var label, exclass;
		if(!biz.functions[key]){
			label = key;
			exclass = 'btn-danger';
		}else{ 
			label = biz.functions[key].icon + ' [' + key + ']'; 
			exclass = 'btn-default';
		}
		$(button).addClass(classname).addClass(exclass).text(label).attr('cmdtype', key);
		$(command).append(button);
	}
	//canvas
	var handler = undefined;
	var line_func = function(node, shape, ox, oy, points){
		var status = node_status(node);
		var offset = $(status.element).offset();
		var point = {
			x: offset.left + ($(status.element).outerWidth() / 2),
			y: offset.top + ($(status.element).outerHeight() / 2),
		};
		var children = $(status.children).children(container_path);
		points.push(point);
		if(children.length > 0){
			node = children[0];
			line_func(node, shape, ox, oy, points);
			for(var i=1; i<children.length; i++){
				line_func(children[i], shape, ox, oy, [point]);
			}
		}else{
			if(points.length >= 2){
				var anchor = points.shift();
				shape.graphics.moveTo(anchor.x - ox, anchor.y - oy);
				for(var i=0; i<points.length; i++){
					shape.graphics.lineTo(points[i].x - ox, points[i].y - oy);
				}
			}
		}
	};
	var canvas = $('#line');
	var container = $('#top-level-container');
	var draw_func = function(node){
		var offset = $(container).offset();
		var ox = offset.left, oy = offset.top;
		var width = $(container).outerWidth();
		var height = $(container).outerHeight();
		$(canvas).attr({width: width, height: height}).css({left: ox, top: oy});
		var stage = new createjs.Stage('line');
		var shape = new createjs.Shape();
		stage.clear();
		shape.graphics.beginStroke("#000");
		line_func(node, shape, ox, oy, []);
		shape.graphics.endStroke();
		stage.addChild(shape);
		stage.update();
	};
	var canvas = $('#line');
	$(window).on('resize orientationchange', function(){
		$(canvas).hide();
		if(handler !== undefined){ clearTimeout(handler); }
		handler = setTimeout(function(){
			draw_func($(top).children(container_path));
			handler = undefined;
			$(canvas).show();
		}, delay);
	});
	
	var calc_root_class = 'calcing';
	var calc_func = function(node){
		$(node).addClass(calc_root_class);
		var callback = function(){
			var tree = getnode_func(node);
			try{
				var formula = biz.calc(tree);
				var answer = eval(formula);
				alert(answer + ' = ' + formula);
			}catch(e){
				alert(e);
			}
			$(node).removeClass(calc_root_class);
		};
		drill_func(node, callback, false);
	};
	
	var panel = $('#panel');
	var entry_func = function(targetnodecontainer, callback){
		var status = node_status(targetnodecontainer);
		var type = status.type;
		
		//init dialog
		var dialog = $('#modal-example');
		var tabs = $('ul.nav-tabs', $(dialog));
		if(biz.functions[type]){
			$('li.command a', $(tabs)).tab('show');
		}else{
			$('li.number a', $(tabs)).tab('show');
		}

		//init number
		if(isNaN(parseFloat(type))){ $(panel).val('0'); }
		else{ $(panel).val(type); }
		$('.btn-ok', $(dentak)).unbind().on('click', function(){
			callback($(panel).val());
			$(dialog).modal('hide');			
		});
		//init command
		var classname = 'button.btn-' + type;
		$(command).find('button.btn-primary').removeClass('btn-primary').addClass('btn-default');
		$(command).find(classname).removeClass('btn-default').addClass('btn-primary');
		$('button.btn', $(command)).unbind().on('click', function(){
			callback($(this).attr('cmdtype'));
			$(dialog).modal('hide');
		});
		//init action
		$('#action-calc').unbind().on('click', function(){
			$(dialog).modal('hide');
			calc_func(targetnodecontainer);
		});
		$('#action-undefined').unbind().on('click', function(){
			$(dialog).modal('hide');
			callback('undefined');
		});
		

		$(dialog).modal('show');
	};

	var setnode_func = function(targetnodecontainer, type){
		var status = node_status(targetnodecontainer);
		var childs = 0;
		var icon = 'undefined';
		if(biz.functions[type]){
			var func = biz.functions[type];
			childs = func.child;
			icon = func.icon;
		}else{
			if(isNaN(parseFloat(type))){
				type = 'undefined';
				icon = 'undefined';
			}else{
				icon = type;
			}
		}
		$(status.node).attr({
			'type': type,
			'childs': childs,
		});
		$(status.element).text(icon).css({backgroundColor: 'white'});

		while(true){
			var children = $(status.children).children(container_path);
			if(children.length > childs){
				$(children[children.length - 1]).remove();
			}else if(children.length < childs){
				$(status.children).append($(node_template));
			}else{
				break;
			}
		}
		draw_func($(top).children(container_path));
	};


	var drill_func = function(node, callback, back){
		var status = node_status(node);
		var from, to;
		if(!back){
			$(status.element).css({'background-color': 'yellow'});
		}
		var offset = $(status.element).offset();
		$(document).scrollTop(offset.top).scrollLeft(offset.left);

		if(!back && status.childs > 0){
			var children = $(status.children).children(container_path);
			setTimeout(function(){
				drill_func(children[0], callback, false);
			}, delay);
		}else{
			var next = $(node).next();
			var parent = $(node).parent().parent();
			var end = $(node).is('.' + calc_root_class);
			if($(next).is(container_path) && !end){
				setTimeout(function(){
					drill_func(next, callback, false);
				}, delay);
			}else if($(parent).is(container_path) && !end){
				setTimeout(function(){
					drill_func(parent, callback, true);
				}, delay);
			}else{
				setTimeout(function(){ callback(); }, delay * 2);				
			}
			if(status.type=='undefined'){
				$(status.element).css({'background-color': 'red'});
			}else{
				setTimeout(function(){
					$(status.element).css({'background-color': 'white'});
				}, delay);
			}
		}
		
	};

	var getnode_func = function(node){
		var status = node_status(node);
		var type = status.type;

		if(!isNaN(parseFloat(type))){
			return type * 1;
		}else{
			var children = $(status.children).children(container_path);
			var node = {
				'name': status.type,
				//'icon':,
				'child': status.childs * 1,
				'children': [],
			};
			for(var i=0; i<children.length; i++){
				node.children.push(getnode_func(children[i]));
			}
			return node;
		}
	};

	var files = $('#files');
	var fileIO = $('#modal-storage');
	var listitem_func = function(){
		var listitem = $(file_template);
		return {
			element: listitem,
			btn_delete: $('div.file-delete button', $(listitem)),
			btn_edit: $('div.file-edit button', $(listitem)),
			span_name: $('div.file-name', $(listitem)),
		};
		
	};
	var open_func = function(filename){
		var list = storage.getData();
		var _item = list.filter(function(e){
			return e.name == filename;
		});
		if(_item.length != 1){
			alert('file not found.');
		}else{
			var item = _item.shift();
			current = item.name;
			$(top).children().remove();
			$(top).append($(item.tree));
			draw_func($(top).children(container_path));
		}
	};
	var delete_func = function(filename){
		if(confirm('delete ' + filename + '?')){
			var list = storage.getData();
			list = list.filter(function(e){
				return e.name != filename;
			});
			storage.setData(list);
		}
	};
	var saveas_func = function(){
		var filename = prompt('input filename.', current);
		if(filename !== '' && filename != null){
			var list = storage.getData();
			list = list.filter(function(e){
				return e.name != filename;
			});
			list.unshift({
				name: filename,
				tree: $(top).html(),
			});
			storage.setData(list);
		}
	};
	var list_func = function(){
		$(files).children().remove();
		var items = storage.getData();
		for(var i=0; i<items.length; i++){
			var item = items[i];
			var listitem = listitem_func();
			$(listitem.element).attr({filename: item.name});
			$(listitem.span_name).text(item.name);
			$(listitem.btn_delete).click(function(){
				var filename = $(this).parents('li.file-item').attr('filename');
				delete_func(filename);
				$(fileIO).modal('hide');
			});
			$(listitem.btn_edit).click(function(){
				var filename = $(this).parents('li.file-item').attr('filename');
				open_func(filename);
				$(fileIO).modal('hide');
			});
			
			$(files).append($(listitem.element));
		}
		$(fileIO).modal('show');
	};
	$(fileIO).on('click', '.file-item', function(){
		$(fileIO).find('.file-item').removeClass('active');
		$(this).toggleClass('active');
	});
	$('#storage-saveas').on('click', function(){
		$(fileIO).modal('hide');
		saveas_func();
	});

	
	$(top).on('click', element_path, function(){
		var container = $(this).parent().parent();
		entry_func(container, function(entry){
			setnode_func(container, entry);
		});
	});

	$('#header-io').click(function(){
		list_func();
	});
	$('#header-calc').click(function(){
		var root = $(top).children(container_path);
		calc_func(root);
	});

	var root = $(node_template);
	$(top).append($(root));
	
});
