# Bluetooth Low Energy Based Digital Contact Tracing

## Development

### Expo Go Preview
```bash
expo start
```
Note: native modules will not be loaded. Bluetooth cannot work.

### Android
```bash
expo run:android
```

### iOS
Install pods first:
```bash
cd ios
pod install
```

Then run the project in simulator:
```bash
expo run:ios
```

Real device debugging:
1. Open the project under `ios` with XCode.
2. Search the Internet for how to debug with real device.

## Build & Deploy

Packaging with Expo cloud service is recommended.