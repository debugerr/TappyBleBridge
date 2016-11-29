declare var BasicNfc: any;
module com.kraftbyte.tappy
{
    export interface IBleDevice
    {
        name: string;
        id: string;
        rssi: number;
        advertising: any;
    }
    
    export interface IBleDeviceConnected extends IBleDevice
    {
        services: string[];
        characteristics: IBleCharacteristics[],
    }

    export interface IBleDescriptor {
        uuid: string;
    }

    export interface IBleCharacteristics {
        service: string;
        characteristic: string;
        properties: string[];
        descriptors: IBleDescriptor[];
    }

    interface IBle
    {
        scan(services: string[], seconds: number, success: (device: IBleDevice) => void, failure: (e: any) => void);
        connect(device_id: string, connectSuccess: (connectedDevice: IBleDeviceConnected) => void, connectFailure: (e: any) => void);
        startNotification(device_id: string, service_uuid: string, characteristic_uuid, success: (data: any) => any, failure: (e: any) => void);
        stopNotification(device_id: string, service_uuid: string, characteristic_uuid, success: (data: any) => any, failure: (e: any) => void);
        write(device_id: string, service_uuid: string, characteristic_uuid: string, data: any, success: (data: any) => any, failure: (e: any) => void);
        isConnected(device_id: string, connected: () => void, notConnected: () => void);
        disconnect(device_id: string, success: () => void, failure: () => void);
    }
    
    interface ITappyCommunicator
    {
        connect(cb: (boolean) => void): void;
        disconnect(cb: (boolean) => void): void;
        isConnected(): boolean;
        flush(cb: (boolean) => void): void;
        setDataCallback(cb: (data: Uint8Array) => void);
        setErrorCallback(cb: (error: any) => void);
        send(data: Uint8Array): void;
    }

    export class TappyBleCommunicator implements ITappyCommunicator
    {
        private MainTappyServiceUUID = "175F8F23-A570-49BD-9627-815A6A27DE2A";
        private TappyReadCx = "CACC07FF-FFFF-4C48-8FAE-A9EF71B75E26";
        private TappyWriteCx = "1CCE1EA8-BD34-4813-A00A-C76E028FADCB";

        private _ble: IBle;
        private _connectedDevice: IBleDeviceConnected;
        private _dataCallback: (data: Uint8Array) => void;
        private _errorCallback: (error: any) => void;
        private _isConnecting = false;
        private MaxSendSize = 20;

        private static _current: TappyBleCommunicator;

        public static getCurrent(): TappyBleCommunicator
        {
            return this._current || (this._current = new TappyBleCommunicator());
        }
        
        constructor()
        {
            this._ble = <IBle>window["ble"];
        }

        connectedDevice(): IBleDeviceConnected
        {
            return this._connectedDevice;
        }
        
        connect(cb: (boolean) => void): void
        {
            if (this.isConnected()) throw "already connected";
            if (this._isConnecting) return;
            this._isConnecting = true;

            this._ble.scan([this.MainTappyServiceUUID], 60, (dev: IBleDevice) => {
                this._ble.connect(dev.id, (connectedDevice) => {
                    this._connectedDevice = connectedDevice;
                    this._isConnecting = false;
                    cb(true);
                }, (e) => {
                    this._isConnecting = false;
                    cb(false);
                });
            }, (e) => {
                this._isConnecting = false;
                cb(false);                
            }); 
        }

        disconnect(cb: (disconnected: boolean) => void): void
        {
            if (!this.isConnected()) {
                if(cb) cb(true);
                return;
            }

            this._ble.disconnect(this._connectedDevice.id, () => {
                if (cb) cb(true);
                this._connectedDevice = null;
            }, () => {
                if (cb) cb(false);
                this._connectedDevice = null;
            });
            
        }
        
        isConnected(): boolean
        {
            return !!this._connectedDevice;
        }

        flush(cb: (boolean) => void): void
        {
            cb(true);
        }

        setDataCallback(cb: (data: Uint8Array) => void)
        {
            this._dataCallback = cb;
        }

        setErrorCallback(cb: (error: any) => void)
        {
            this._errorCallback = cb;
        }
        
        send(data: Uint8Array): void
        {
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
        }

        private sendCore(data: Uint8Array): void
        {
            if (data.byteLength > this.MaxSendSize) throw "data too long";
            this._ble.write(this._connectedDevice.id, this.MainTappyServiceUUID, this.TappyWriteCx, data, (rawData) => {
            }, (e) => {
                if (this._errorCallback) {
                    this._errorCallback(e);
                }
            });
        }

        public setupNotifications(): void {
            this.ensureConnected();
            this._ble.startNotification(this._connectedDevice.id, this.MainTappyServiceUUID, this.TappyReadCx, (data) => {
                if (this._dataCallback) {
                    this._dataCallback(data);
                }
            }, (e) => {
                if (this._errorCallback) {
                    this._errorCallback(e);
                }
            });
        }

        public removeNotifications(): void {
            this.ensureConnected();
            this._ble.stopNotification(this._connectedDevice.id, this.MainTappyServiceUUID, this.TappyReadCx, (data) => { }, (e) => { });
        }
        
        private ensureConnected(): void
        {
            if (!this.isConnected()) throw "Device is not connected";
        }
    }
}
 
