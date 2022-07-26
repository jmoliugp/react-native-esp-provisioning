#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(EspProvisioning, NSObject)


RCT_EXTERN_METHOD(getBleDevices:(NSString *)prefix
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

// Change signature, rawEspDevice: [String: Any] param is missing.
RCT_EXTERN_METHOD(scanWifi:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

@end
