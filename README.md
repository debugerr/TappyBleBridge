# TappyBleBridge
TappyBle to PhoneGap communicator bridge

This communicator implementation is creating a bridge between the [TappyBLE wrapper](https://github.com/TapTrack/TcmpTappyWrapperJs) and the [BLE central plugin](https://github.com/don/cordova-plugin-ble-central).

To get things working in your phonegap / cordova project, you have to follow 4 simple steps:

1. Include the [BLE central plugin](https://github.com/don/cordova-plugin-ble-central) in your project
2. Include the following javascript files in your project from the TappyBLE SDK: [TappyWrapper](https://github.com/TapTrack/TcmpTappyWrapperJs/blob/master/dist/wrapper.min.js), [Basic NFC](https://github.com/TapTrack/TcmpBasicNfcFamilyJs/blob/master/dist/basicnfc.min.js), [NDEFJs](https://github.com/TapTrack/NdefJS/blob/master/dist/ndef.min.js), [TCPM System Family JS](https://github.com/TapTrack/TcmpSystemFamilyJs/blob/master/dist/system.min.js) and [TCPM Tappy](https://github.com/TapTrack/TappyTcmpJs/blob/master/dist/tcmptappy.min.js)
3. Include the communicator bridge in your project [TappyCommunicator](https://github.com/debugerr/TappyBleBridge/blob/master/dist/TappyCommunicatorBridge.js)
4. Hook up the communicator with the TappyWrapper:
```
this.communicator = com.kraftbyte.tappy.TappyBleCommunicator.getCurrent();
this.wrapper = new TappyWrapper({ communicator: this.communicator });
```

Now you can use the standard interface of the wrapper described [here](https://github.com/TapTrack/TcmpTappyWrapperJs)


