# node-find-synology

Use <find.synology.com>'s APIs for finding your local Synology NASs.

## Testing

Try out `npm t` on your local network to see if it works. Example output:

```text
Devices: [
  {
    configured: '1',
    dns: '1.1.1.1',
    disk_model: '',
    build: '24922',
    unique: 'synology_apollolake_718+',
    method: 'dhcp',
    mask: '255.255.255.0',
    model: 'DS718+',
    smallfixnumber: '4',
    host: 'Magneton',
    ip: '192.168.0.103',
    pingok: 'false',
    sn: 'XXXXXXXXXX',
    admin_http: '5000',
    disk_version: '',
    supportwebinst: 'true',
    gateway: '192.168.0.1',
    version: '6.2',
    admin_https: '5001',
    junior: 'false',
    mac: 'XX:XX:XX:XX:XX:XX'
  },
  {
    configured: '1',
    dns: '1.1.1.1',
    disk_model: '',
    build: '24922',
    unique: 'synology_apollolake_718+',
    method: 'dhcp',
    mask: '255.255.255.0',
    model: 'DS718+',
    smallfixnumber: '4',
    host: 'Magneton',
    ip: '192.168.0.105',
    pingok: 'false',
    sn: 'XXXXXXXXXX',
    admin_http: '5000',
    disk_version: '',
    supportwebinst: 'true',
    gateway: '192.168.0.1',
    version: '6.2',
    admin_https: '5001',
    junior: 'false',
    mac: 'XX:XX:XX:XX:XX:XX'
  }
]
```
