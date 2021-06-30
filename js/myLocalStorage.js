(function(global){

	var StorageIO = function(key, initialize){
		this._key = key;
		this._default = initialize;
	};
	StorageIO.prototype.setData = function setData(data){
		localStorage.setItem(this._key, JSON.stringify(data));
	};
	StorageIO.prototype.getData = function getData(){
		var _data = localStorage.getItem(this._key);
		var data = (_data === null) ? this._default : JSON.parse(_data);
		return data;
	};

	var myLocalStorage = function myLocalStorage(global){
		if(!global.localStorage){
			throw new Error('localStorage is not supported.');
		}
	};
	myLocalStorage.prototype.getAccessor = function getAccessor(key, initialize){
		return new StorageIO(key, initialize);
	};

	global.myLocalStorage = new myLocalStorage(global);

})(window);