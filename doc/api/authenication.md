In order to enable face authentication on iOS an instructive message has to be added to the _Info.plist_ file via the _config.xml_ file.

```xml
<edit-config file="*-Info.plist" target="NSFaceIDUsageDescription" mode="overwrite">
  <string>Use FaceID to login to your account.</string>
</edit-config>
```
