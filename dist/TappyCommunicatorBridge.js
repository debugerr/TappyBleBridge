var com;
(function (com) {
    var kraftbyte;
    (function (kraftbyte) {
        var tappy;
        (function (tappy) {
            var TappyBleCommunicator = (function () {
                function TappyBleCommunicator() {
                    this.MainTappyServiceUUID = "175F8F23-A570-49BD-9627-815A6A27DE2A";
                    this.TappyReadCx = "CACC07FF-FFFF-4C48-8FAE-A9EF71B75E26";
                    this.TappyWriteCx = "1CCE1EA8-BD34-4813-A00A-C76E028FADCB";
                    this._isConnecting = false;
                    this.MaxSendSize = 20;
                    this._ble = window["ble"];
                }
                TappyBleCommunicator.getCurrent = function () {
                    return this._current || (this._current = new TappyBleCommunicator());
                };
                TappyBleCommunicator.prototype.connectedDevice = function () {
                    return this._connectedDevice;
                };
                TappyBleCommunicator.prototype.connect = function (cb) {
                    var _this = this;
                    if (this.isConnected())
                        throw "already connected";
                    if (this._isConnecting)
                        return;
                    this._isConnecting = true;
                    this._ble.scan([this.MainTappyServiceUUID], 60, function (dev) {
                        _this._ble.connect(dev.id, function (connectedDevice) {
                            _this._connectedDevice = connectedDevice;
                            _this._isConnecting = false;
                            cb(true);
                        }, function (e) {
                            _this._isConnecting = false;
                            cb(false);
                        });
                    }, function (e) {
                        _this._isConnecting = false;
                        cb(false);
                    });
                };
                TappyBleCommunicator.prototype.disconnect = function (cb) {
                    var _this = this;
                    if (!this.isConnected()) {
                        if (cb)
                            cb(true);
                        return;
                    }
                    this._ble.disconnect(this._connectedDevice.id, function () {
                        if (cb)
                            cb(true);
                        _this._connectedDevice = null;
                    }, function () {
                        if (cb)
                            cb(false);
                        _this._connectedDevice = null;
                    });
                };
                TappyBleCommunicator.prototype.isConnected = function () {
                    return !!this._connectedDevice;
                };
                TappyBleCommunicator.prototype.flush = function (cb) {
                    cb(true);
                };
                TappyBleCommunicator.prototype.setDataCallback = function (cb) {
                    this._dataCallback = cb;
                };
                TappyBleCommunicator.prototype.setErrorCallback = function (cb) {
                    this._errorCallback = cb;
                };
                TappyBleCommunicator.prototype.send = function (data) {
                    this.ensureConnected();
                    if (data.byteLength <= this.MaxSendSize) {
                        this.sendCore(data);
                    }
                    else {
                        var j = data.byteLength;
                        for (var i = 0; i < j; i += this.MaxSendSize) {
                            this.sendCore(data.slice(i, i + this.MaxSendSize));
                        }
                    }
                };
                TappyBleCommunicator.prototype.sendCore = function (data) {
                    var _this = this;
                    if (data.byteLength > this.MaxSendSize)
                        throw "data too long";
                    this._ble.write(this._connectedDevice.id, this.MainTappyServiceUUID, this.TappyWriteCx, data, function (rawData) {
                    }, function (e) {
                        if (_this._errorCallback) {
                            _this._errorCallback(e);
                        }
                    });
                };
                TappyBleCommunicator.prototype.setupNotifications = function () {
                    var _this = this;
                    this.ensureConnected();
                    this._ble.startNotification(this._connectedDevice.id, this.MainTappyServiceUUID, this.TappyReadCx, function (data) {
                        if (_this._dataCallback) {
                            _this._dataCallback(data);
                        }
                    }, function (e) {
                        if (_this._errorCallback) {
                            _this._errorCallback(e);
                        }
                    });
                };
                TappyBleCommunicator.prototype.removeNotifications = function () {
                    this.ensureConnected();
                    this._ble.stopNotification(this._connectedDevice.id, this.MainTappyServiceUUID, this.TappyReadCx, function (data) { }, function (e) { });
                };
                TappyBleCommunicator.prototype.ensureConnected = function () {
                    if (!this.isConnected())
                        throw "Device is not connected";
                };
                return TappyBleCommunicator;
            }());
            tappy.TappyBleCommunicator = TappyBleCommunicator;
        })(tappy = kraftbyte.tappy || (kraftbyte.tappy = {}));
    })(kraftbyte = com.kraftbyte || (com.kraftbyte = {}));
})(com || (com = {}));
//# sourceMappingURL=ble.js.map
