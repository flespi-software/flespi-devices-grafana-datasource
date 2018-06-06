'use strict';

System.register(['app/plugins/sdk', './css/query-editor.css!'], function (_export, _context) {
  "use strict";

  var QueryCtrl, _createClass, FlespiDevicesDatasourceQueryCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      QueryCtrl = _appPluginsSdk.QueryCtrl;
    }, function (_cssQueryEditorCss) {}],
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

      _export('FlespiDevicesDatasourceQueryCtrl', FlespiDevicesDatasourceQueryCtrl = function (_QueryCtrl) {
        _inherits(FlespiDevicesDatasourceQueryCtrl, _QueryCtrl);

        function FlespiDevicesDatasourceQueryCtrl($scope, $injector) {
          _classCallCheck(this, FlespiDevicesDatasourceQueryCtrl);

          var _this = _possibleConstructorReturn(this, (FlespiDevicesDatasourceQueryCtrl.__proto__ || Object.getPrototypeOf(FlespiDevicesDatasourceQueryCtrl)).call(this, $scope, $injector));

          _this.scope = $scope;
          _this.target.target = _this.target.target || 'select device';
          _this.target.parameter = _this.target.parameter || 'select parameter';
          _this.target.func = _this.target.func || '';
          _this.target.type = _this.target.type || 'timeserie';
          return _this;
        }

        _createClass(FlespiDevicesDatasourceQueryCtrl, [{
          key: 'getDevices',
          value: function getDevices(query) {
            return this.datasource.metricFindQuery(query || 'devices');
          }
        }, {
          key: 'getParameters',
          value: function getParameters(query) {
            return this.datasource.metricFindQuery(query || 'parameters');
          }
        }, {
          key: 'toggleEditorMode',
          value: function toggleEditorMode() {
            this.target.rawQuery = !this.target.rawQuery;
          }
        }, {
          key: 'onChangeInternal',
          value: function onChangeInternal() {
            this.panelCtrl.refresh(); // Asks the panel to refresh data.
          }
        }]);

        return FlespiDevicesDatasourceQueryCtrl;
      }(QueryCtrl));

      _export('FlespiDevicesDatasourceQueryCtrl', FlespiDevicesDatasourceQueryCtrl);

      FlespiDevicesDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
    }
  };
});
//# sourceMappingURL=query_ctrl.js.map
