#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(EspProvisioning, NSObject)


RCT_EXTERN_METHOD(getBleDevices:(NSString *)prefix
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(scanWifi:(NSDictionary *)rawEspDevice
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(provision:(NSDictionary *)rawEspDevice
                  ssid: NSString
                  passPhrase: NSString
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

@end
