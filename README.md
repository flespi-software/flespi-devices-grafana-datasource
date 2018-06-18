## flespi device datasource

![Logo](https://github.com/flespi-software/flespi-devices-grafana-datasource/blob/master/src/img/logo-flespi-devices-plugin-small.png?raw=true "flespi devices grafana plugin")

Plugin allows to visualize parameters of [flespi devices](https://flespi.io/docs/#/gw/!/devices).

## Installation

To install this plugin using the `grafana-cli` tool:
```
sudo grafana-cli --pluginUrl https://github.com/flespi-software/flespi-devices-grafana-datasource/archive/master.zip plugins install flespi-devices-datasource
sudo service grafana-server restart
```

If this command doesn't work you can manually copy `flespi-devices-datasource` directory into grafana plugins directory and restart grafana-server.
By default plugins directory is: `/var/lib/grafana/plugins`
To check plugins directory in Grafana interface open: Left-upper corner menubar toggle > Configuration > Server Admin > Settings > paths/plugins

To remove plugin run:
```
sudo grafana-cli plugins remove flespi-devices-datasource
sudo service grafana-server restart
```

When (If) the plugin will be published on Grafana.net, installation will be done by the command:

```
sudo grafana-cli plugins install flespi-devices-datasource
sudo service grafana-server restart
```

### Datasource requires the following parameters:

| Param             | Example Value             |
| ----------------- |:-------------------------:|
| flespi uri        | https://flespi.io         |
| flespi token      | XXXX                      |

Plugin supports template variables. The following queries can be used to create variable:

| Query          | Description                                             |
| -------------- |:-------------------------------------------------------:|
| devices        | fetch all devices available for given account (token)   |
| parameters     | fetch numeric parameters of devices                     |


### Dev setup

This plugin requires node 6.10.0

`sudo npm install -g yarn`

`yarn install`

`npm run build`

To update dist automatically during development run:

`grunt watch`

### Changelog

1.0.0
  Initial implementation