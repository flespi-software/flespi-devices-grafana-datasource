'use strict';

System.register(['./datasource', './query_ctrl'], function (_export, _context) {
  "use strict";

  var FlespiDevicesDatasource, FlespiDevicesDatasourceQueryCtrl, FlespiDevicesConfigCtrl, FlespiDevicesQueryOptionsCtrl, FlespiDevicesAnnotationsQueryCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_datasource) {
      FlespiDevicesDatasource = _datasource.FlespiDevicesDatasource;
    }, function (_query_ctrl) {
      FlespiDevicesDatasourceQueryCtrl = _query_ctrl.FlespiDevicesDatasourceQueryCtrl;
    }],
    execute: function () {
      _export('ConfigCtrl', FlespiDevicesConfigCtrl =
      /** @ngInject */
      function FlespiDevicesConfigCtrl($scope) {
        _classCallCheck(this, FlespiDevicesConfigCtrl);

        this.current.jsonData.uri = this.current.jsonData.uri || 'https://flespi.io';
      });

      FlespiDevicesConfigCtrl.templateUrl = 'partials/config.html';

      _export('QueryOptionsCtrl', FlespiDevicesQueryOptionsCtrl = function FlespiDevicesQueryOptionsCtrl() {
        _classCallCheck(this, FlespiDevicesQueryOptionsCtrl);
      });

      FlespiDevicesQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

      _export('AnnotationsQueryCtrl', FlespiDevicesAnnotationsQueryCtrl = function FlespiDevicesAnnotationsQueryCtrl() {
        _classCallCheck(this, FlespiDevicesAnnotationsQueryCtrl);
      });

      FlespiDevicesAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html';

      _export('Datasource', FlespiDevicesDatasource);

      _export('QueryCtrl', FlespiDevicesDatasourceQueryCtrl);

      _export('ConfigCtrl', FlespiDevicesConfigCtrl);

      _export('QueryOptionsCtrl', FlespiDevicesQueryOptionsCtrl);

      _export('AnnotationsQueryCtrl', FlespiDevicesAnnotationsQueryCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map
