#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(EspProvisioning, NSObject)


RCT_EXTERN_METHOD(getBleDevices:(NSString *)prefix
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(createDevice:(NSString *)deviceName
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(provideProofOfPoss:(NSString *)proofOfPoss
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(connectDevice:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(connectBleDevice:(NSString *)deviceAddress
                 deviceProofOfPossession:(NSString *)deviceProofOfPossession
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)


@end
