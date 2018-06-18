'use strict';

System.register(['lodash'], function (_export, _context) {
  "use strict";

  var _, _createClass, FlespiDevicesDatasource;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('FlespiDevicesDatasource', FlespiDevicesDatasource = function () {
        function FlespiDevicesDatasource(instanceSettings, $q, backendSrv, templateSrv) {
          _classCallCheck(this, FlespiDevicesDatasource);

          this.type = instanceSettings.type;
          if (instanceSettings.jsonData != undefined) {
            this.url = instanceSettings.jsonData.uri;
            this.headers = { 'Authorization': 'FlespiToken ' + instanceSettings.jsonData.token, 'Content-Type': 'application/json' };
          } else {
            this.url = "";
            this.headers = {};
          }
          this.name = instanceSettings.name;
          this.q = $q;
          this.backendSrv = backendSrv;
          this.templateSrv = templateSrv;
        }

        _createClass(FlespiDevicesDatasource, [{
          key: 'is_skip_param',
          value: function is_skip_param(param) {
            switch (param) {
              case "channel_id":
              case "device_id":
              case "ident":
              case "device_name":
              case "timestamp":
                return true;
              default:
                return false;
            }
          }
        }, {
          key: 'prepareDeviceIds',
          value: function prepareDeviceIds(target) {
            var device_ids = "all";
            if (target == "$device" || target == "all") {
              device_ids = "all";
              this.multiple_devices = true;
            } else if (target.indexOf(',') !== -1) {
              // multiple devices
              var devices = target.split(',');
              device_ids = [];
              for (var i = 0; i < devices.length; i++) {
                var device = devices[i];
                device_ids.push(device.substring(device.lastIndexOf('#') + 1));
              }
              device_ids = device_ids.join(',');
              this.multiple_devices = true;
            } else {
              // single device
              device_ids = target.substring(target.lastIndexOf('#') + 1);
              this.multiple_devices = false;
            }
            if (this.devices_reg == undefined) {
              this.metricFindQuery("devices");
            }
            return device_ids;
          }
        }, {
          key: 'prepareParameters',
          value: function prepareParameters(parameter) {
            if (parameter === "select parameter" || parameter === "all") {
              // will return all messages by default
              this.multiple_params = true;
              return null;
            }
            if (parameter.indexOf(',') !== -1 || parameter.indexOf('*') !== -1) {
              // comma-separated list or wildcard parameters
              this.multiple_params = true;
            } else {
              // single parameter
              this.multiple_params = false;
            }
            if (parameter.indexOf('#') !== -1) {
              // urlescape # in parameter name
              parameter = parameter.replace(/#/g, '%23');
            }
            return parameter;
          }
        }, {
          key: 'query',
          value: function query(options) {
            var _this = this;

            var query = this.buildQueryParameters(options);
            query.targets = query.targets.filter(function (t) {
              return !t.hide;
            });

            if (query.targets == null || query.targets.length <= 0 || !query.targets[0].target) {
              return Promise.resolve({ data: [] });
            }

            // prepare params of request
            var from = parseInt(Date.parse(query.range.from) / 1000);
            var to = parseInt(Date.parse(query.range.to) / 1000);
            var interval_sec = query.scopedVars.__interval_ms.value / 1000;
            var device_ids = this.prepareDeviceIds(query.targets[0].target);
            var parameters = this.prepareParameters(query.targets[0].parameter);
            if (this.multiple_devices === true && this.multiple_params === true) {
              // attempt to show multiple parameters for multiple devices on one plot, don't process it
              return Promise.resolve({ data: [] });
            }
            var request_params = { from: from, to: to };
            if (parameters !== null) {
              request_params.fields = parameters + ",timestamp,device_id";
              if (parameters.indexOf('*') === -1) {
                request_params.filter = parameters;
              }
            }

            if (query.targets[0].func != undefined && query.targets[0].func != '') {
              if (interval_sec >= 60 || interval_sec !== 0 && query.maxDataPoints > 0 && (to - from) / interval_sec > query.maxDataPoints) {
                // apply generalization function
                var gen_interval = (to - from) / query.maxDataPoints;
                request_params.generalize = gen_interval >= 60 ? parseInt(gen_interval) : 60;
                if (query.targets[0].func == "avg") {
                  request_params.method = "average";
                } else if (query.targets[0].func == "max") {
                  request_params.method = "maximum";
                } else {
                  request_params.method = "minimum";
                }
              }
            }
            return this.doRequest({
              url: this.url + '/gw/devices/' + device_ids + '/messages?data=' + JSON.stringify(request_params),
              method: 'GET'
            }).then(function (response) {
              // parse response: convert device messages to timeseries
              var messages = response.data.result;
              if (!messages || messages.length == 0) {
                // empty response - no data points
                return { data: [] };
              }
              if (_this.multiple_devices === true) {
                return _this.createMultipleDevicesTimeseries(messages);
              } else {
                return _this.createSingleDeviceTimeseries(messages);
              }
            });
          }
        }, {
          key: 'createMultipleDevicesTimeseries',
          value: function createMultipleDevicesTimeseries(messages) {
            // mutiple devices, but only one parameter
            var data = [];
            var dict = {};
            for (var i = 0; i < messages.length; i++) {
              var message = messages[i];
              var timestamp = message.timestamp;
              for (var param in message) {
                if (this.is_skip_param(param) === true) {
                  continue;
                }
                var value = message[param];
                if (typeof value == "boolean") {
                  value = value == true ? 1 : 0;
                }
                if (typeof value != "number") {
                  continue;
                }
                var device_id = message.device_id;
                if (device_id == undefined || device_id == null || this.devices_reg == undefined || this.devices_reg[device_id] == undefined) {
                  return { data: [] }; // unknown device - return empty datapoints
                }
                var device_label = this.devices_reg[device_id];
                if (!dict[device_label]) {
                  // create separate datapoints array for each device
                  dict[device_label] = {
                    datapoints: []
                  };
                }
                dict[device_label].datapoints.push([value, timestamp * 1000]);
              }
            }
            // format parameters dictionary to timeseries
            for (var _device_label in dict) {
              data.push({
                target: _device_label,
                datapoints: dict[_device_label].datapoints
              });
            }
            return { data: data };
          }
        }, {
          key: 'createSingleDeviceTimeseries',
          value: function createSingleDeviceTimeseries(messages) {
            // only one device, but can contain multiple parameters
            var data = [];
            var dict = {};
            for (var i = 0; i < messages.length; i++) {
              var message = messages[i];
              var timestamp = message.timestamp;
              for (var param in message) {
                if (this.is_skip_param(param) === true) {
                  continue;
                }
                var value = message[param];
                if (typeof value == "boolean") {
                  value = value == true ? 1 : 0;
                }
                if (typeof value != "number") {
                  continue;
                }
                if (!dict[param]) {
                  // create separate dataapoints array for each parameter
                  dict[param] = {
                    datapoints: []
                  };
                }
                dict[param].datapoints.push([value, timestamp * 1000]);
              }
            }
            // format parameters dictionary to timeseries
            for (var _param in dict) {
              data.push({
                target: _param, // target: parameter.name
                datapoints: dict[_param].datapoints // datapoints: array of [value, timestamp]
              });
            }
            return { data: data };
          }
        }, {
          key: 'testDatasource',
          value: function testDatasource() {
            return this.doRequest({
              url: this.url + '/gw/devices/all',
              method: 'GET'
            }).then(function (response) {
              if (response.status === 200) {
                return { status: "success", message: "Data source is working", title: "Success" };
              }
            }).catch(function (error) {
              if (error.status === 401) {
                return { status: "error", message: "Invalid or expired access token" };
              } else {
                return { status: "error", message: "Request error, code:" + error.status };
              }
            });
          }
        }, {
          key: 'annotationQuery',
          value: function annotationQuery(options) {
            var query = this.templateSrv.replace(options.annotation.query, {}, 'glob');
            var annotationQuery = {
              range: options.range,
              annotation: {
                name: options.annotation.name,
                datasource: options.annotation.datasource,
                enable: options.annotation.enable,
                iconColor: options.annotation.iconColor,
                query: query
              },
              rangeRaw: options.rangeRaw
            };

            return this.doRequest({
              url: this.url + '/annotations',
              method: 'POST',
              data: annotationQuery
            }).then(function (result) {
              return result.data;
            });
          }
        }, {
          key: 'metricFindQuery',
          value: function metricFindQuery(query) {
            var _this2 = this;

            query = this.templateSrv.replace(query, null, 'csv');
            if (query === "devices") {
              return this.doRequest({
                url: this.url + '/gw/devices/all',
                method: 'GET'
              }).then(function (response) {
                var devices_reg = {}; // devices registry, contains device_id: label fields
                var res = [];
                var data = response.data.result;
                for (var i = 0; i < data.length; i++) {
                  var device_name = data[i].name;
                  if (device_name.indexOf(',') !== -1) {
                    device_name = device_name.replace(/,/g, '');
                  }
                  var label = device_name + ' #' + data[i].id;
                  devices_reg[data[i].id] = label;
                  res.push({ value: label, text: label });
                }
                _this2.devices_reg = devices_reg;
                return res;
              }).catch(function (error) {
                if (error.status === 401) {
                  throw {
                    message: "Invalid or expired access token",
                    error: error.data.errors[0]
                  };
                }
                throw error;
              });
            } else if (query === "parameters") {
              // get all parameters of all devices
              return this.doRequest({
                url: this.url + '/gw/devices/all?fields=telemetry',
                methos: 'GET'
              }).then(function (response) {
                var params_set = [];
                var data = response.data.result;
                for (var i = 0; i < data.length; i++) {
                  var telemetry = data[i].telemetry;
                  for (var param in telemetry) {
                    if (_this2.is_skip_param(param) === true) {
                      continue;
                    }
                    if (typeof telemetry[param].value != "number" && typeof telemetry[param].value != "boolean") {
                      // only numeric and boolean parameters are allowed for visualization
                      continue;
                    }
                    if (params_set.indexOf(param) == -1) {
                      // store new param
                      params_set.push(param);
                    }
                  }
                }
                var res = [];
                for (var _i = 0; _i < params_set.length; _i++) {
                  var _param2 = params_set[_i];
                  res.push({ value: _param2, text: _param2 });
                }
                return res;
              }).catch(function (error) {
                if (error.status === 401) {
                  throw {
                    message: "Invalid or expired access token",
                    error: error.data.errors[0]
                  };
                }
                throw error;
              });
            } else if (query.endsWith(".parameters")) {
              // get parameters of the selected devices
              var devices = query.replace('.parameters', '');
              var device_ids = this.prepareDeviceIds(devices);

              return this.doRequest({
                url: this.url + '/gw/devices/' + device_ids + '?fields=telemetry',
                methos: 'GET'
              }).then(function (response) {
                var params_set = [];
                var data = response.data.result;
                for (var i = 0; i < data.length; i++) {
                  var telemetry = data[i].telemetry;
                  for (var param in telemetry) {
                    if (_this2.is_skip_param(param) === true) {
                      continue;
                    }
                    if (typeof telemetry[param].value != "number" && typeof telemetry[param].value != "boolean") {
                      // only numeric and boolean parameters are allowed for visualization
                      continue;
                    }
                    if (params_set.indexOf(param) == -1) {
                      // store new param
                      params_set.push(param);
                    }
                  }
                }
                var res = [];
                for (var _i2 = 0; _i2 < params_set.length; _i2++) {
                  var _param3 = params_set[_i2];
                  res.push({ value: _param3, text: _param3 });
                }
                return res;
              }).catch(function (error) {
                if (error.status === 401) {
                  throw {
                    message: "Invalid or expired access token",
                    error: error.data.errors[0]
                  };
                }
                throw error;
              });
            }
            // empty result for incorrect query
            return Promise.resolve([]);
          }
        }, {
          key: 'mapToTextValue',
          value: function mapToTextValue(result) {
            return _.map(result.data, function (d, i) {
              if (d && d.text && d.value) {
                return { text: d.text, value: d.value };
              } else if (_.isObject(d)) {
                return { text: d, value: i };
              }
              return { text: d, value: d };
            });
          }
        }, {
          key: 'doRequest',
          value: function doRequest(options) {
            options.headers = this.headers;
            return this.backendSrv.datasourceRequest(options);
          }
        }, {
          key: 'buildQueryParameters',
          value: function buildQueryParameters(options) {
            var _this3 = this;

            // remove placeholder targets
            options.targets = _.filter(options.targets, function (target) {
              return target.target !== 'select device';
            });

            var targets = _.map(options.targets, function (target) {
              return {
                target: _this3.templateSrv.replace(target.target, options.scopedVars, 'csv'),
                parameter: _this3.templateSrv.replace(target.parameter, options.scopedVars, 'csv'),
                refId: target.refId,
                hide: target.hide,
                type: target.type || 'timeserie',
                func: _this3.templateSrv.replace(target.func)
              };
            });

            options.targets = targets;

            return options;
          }
        }]);

        return FlespiDevicesDatasource;
      }());

      _export('FlespiDevicesDatasource', FlespiDevicesDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
