import _ from "lodash";

export class FlespiDevicesDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv) {
    this.type = instanceSettings.type;
    if (instanceSettings.jsonData != undefined) {
      this.url = instanceSettings.jsonData.uri;
      this.headers = {'Authorization': 'FlespiToken ' + instanceSettings.jsonData.token, 'Content-Type': 'application/json'};
    } else {
      this.url = "";
      this.headers = {};
    }
    this.name = instanceSettings.name;
    this.q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
  }

  is_skip_param(param) {
    switch(param) {
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

  prepareDeviceIds(target) {
    if (target == "$device" || target == "all") {
      this.device_ids = "all";
      this.multiple_devices = true;
    } else if (target.indexOf(',') !== -1) {
      // multiple devices
      var devices = target.split(',');
      var device_ids = [];
      for (var i = 0; i < devices.length; i++) {
        var device = devices[i];
        device_ids.push(device.substring(device.lastIndexOf('#') + 1));
      }
      this.device_ids = device_ids.join(',');
      this.multiple_devices = true;
    } else {
      // single device
      this.device_ids = target.substring(target.lastIndexOf('#') + 1);
      this.multiple_devices = false;
    }
    if (this.devices_reg == undefined) {
      this.metricFindQuery("devices");
    }
    return this.device_ids;
  }

  prepareParameters(parameter) {
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
    return parameter + ",timestamp,device_id";
  }

  query(options) {
    var query = this.buildQueryParameters(options);
    query.targets = query.targets.filter(t => !t.hide);

    if (query.targets == null || query.targets.length <= 0 || !query.targets[0].target) {
      return this.q.when({data: []});
    }

    // prepare params of request
    var from = parseInt(Date.parse(query.range.from) / 1000);
    var to = parseInt(Date.parse(query.range.to) / 1000);
    var interval_sec = query.scopedVars.__interval_ms.value / 1000
    var device_ids = this.prepareDeviceIds(query.targets[0].target);
    var parameters = this.prepareParameters(query.targets[0].parameter);
    if (this.multiple_devices === true && this.multiple_params === true) {
      // attempt to show multiple parameters for multiple devices on one plot, don't process it
      return this.q.when({data: []});
    }
    var request_params = {from: from, to : to}
    if (parameters !== null) {
      request_params.fields = parameters;
    }

  if (query.targets[0].func != undefined && query.targets[0].func != '') {
    if (interval_sec >= 60 || (interval_sec !== 0 && query.maxDataPoints > 0 && ((to - from)/interval_sec > query.maxDataPoints))) {
        // apply generalization function
        var gen_interval = (to - from)/query.maxDataPoints;
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
    }).then(response => {
      // parse response: convert device messages to timeseries
      var messages = response.data.result;
      if (!messages || messages.length == 0) {
        // empty response - no data points
        return {data: []};
      }
      if (this.multiple_devices === true) {
        return this.createMultipleDevicesTimeseries(messages);
      } else {
        return this.createSingleDeviceTimeseries(messages);
      }
    });
  }

  createMultipleDevicesTimeseries(messages) {
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
        if (typeof value != "number") {
          continue;
        }
        var device_id = message.device_id;
        if (device_id == undefined || device_id == null || this.devices_reg == undefined || this.devices_reg[device_id] == undefined) {
          return {data: []};    // unknown device - return empty datapoints
        }
        var device_label = this.devices_reg[device_id];
        if (!dict[device_label]) {
          // create separate datapoints array for each device
          dict[device_label] = {
              datapoints: []
          }
        }
        dict[device_label].datapoints.push([value, timestamp * 1000]);
      }
    }
    // format parameters dictionary to timeseries
    for (var device_label in dict) {
      data.push({
          target: device_label,
          datapoints: dict[device_label].datapoints
      });
    }
    return {data: data};
  }

  createSingleDeviceTimeseries(messages) {
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
        if (typeof value != "number") {
          continue;
        }
        if (!dict[param]) {
          // create separate dataapoints array for each parameter
          dict[param] = {
              datapoints: []
          }
        }
        dict[param].datapoints.push([value, timestamp * 1000]);
      }
    }
    // format parameters dictionary to timeseries
    for (var param in dict) {
      data.push({
          target: param,                      // target: parameter.name
          datapoints: dict[param].datapoints  // datapoints: array of [value, timestamp]
      });
    }
    return {data: data};
  }

  testDatasource() {
    return this.doRequest({
      url: this.url + '/gw/devices/all',
      method: 'GET',
    }).then(response => {
      if (response.status === 200) {
        return { status: "success", message: "Data source is working", title: "Success" };
      }
    });
  }

  annotationQuery(options) {
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
    }).then(result => {
      return result.data;
    });
  }

  metricFindQuery(query) {
    query = this.templateSrv.replace(query, null, 'glob');
    if (query == "devices") {
      return this.doRequest({
        url: this.url + '/gw/devices/all',
        method: 'GET',
      }).then(response => {
        const devices_reg = {};     // devices registry, contains device_id: label fields
        const res = [];
        const data = response.data.result;
        for (var i = 0; i < data.length; i++) {
            var device_name = data[i].name;
            if (device_name.indexOf(',') !== -1) {
              device_name = device_name.replace(/,/g, '');
            }
            var label = device_name + ' #' + data[i].id;
            devices_reg[data[i].id] = label;
            res.push({value: label, text: label});
        }
        this.devices_reg = devices_reg;
        return res;
      });
    } else if (query == "parameters") {
      var device_ids = "all";
      if (this.device_ids !== undefined) {
        device_ids = this.device_ids;
      }
      return this.doRequest({
        url: this.url + '/gw/devices/' + device_ids + '?fields=telemetry',
        methos: 'GET',
      }).then(response => {
        const params_set = [];
        const data = response.data.result;
        for (var i = 0; i < data.length; i++) {
          const telemetry = data[i].telemetry;
          for (var param in telemetry) {
            if (this.is_skip_param(param) === true) {
              continue;
            }
            if (typeof telemetry[param].value != "number") {
              continue;
            }
            if (params_set.indexOf(param) == -1) {
              // store new param
              params_set.push(param);
            }
          }
        }
        const res = [];
        for (var i = 0; i < params_set.length; i++) {
          var param = params_set[i];
          res.push({value: param, text: param});
        }
        return res;
      })
    }
  }

  mapToTextValue(result) {
    return _.map(result.data, (d, i) => {
      if (d && d.text && d.value) {
        return { text: d.text, value: d.value };
      } else if (_.isObject(d)) {
        return { text: d, value: i};
      }
      return { text: d, value: d };
    });
  }

  doRequest(options) {
    options.headers = this.headers;
    return this.backendSrv.datasourceRequest(options);
  }

  buildQueryParameters(options) {
    //remove placeholder targets
    options.targets = _.filter(options.targets, target => {
      return target.target !== 'select device';
    });

    var targets = _.map(options.targets, target => {
      return {
        target: this.templateSrv.replace(target.target, options.scopedVars, 'csv'),
        parameter: this.templateSrv.replace(target.parameter, options.scopedVars, 'csv'),
        refId: target.refId,
        hide: target.hide,
        type: target.type || 'timeserie',
        func: this.templateSrv.replace(target.func)
      };
    });

    options.targets = targets;

    return options;
  }

}
