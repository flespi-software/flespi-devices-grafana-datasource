import {QueryCtrl} from 'app/plugins/sdk';
import './css/query-editor.css!'

export class FlespiDevicesDatasourceQueryCtrl extends QueryCtrl {

  constructor($scope, $injector)  {
    super($scope, $injector);

    this.scope = $scope;
    this.target.target = this.target.target || 'select device';
    this.target.parameter = this.target.parameter || 'select parameter';
    this.target.func = this.target.func || '';
    this.target.type = this.target.type || 'timeserie';
  }

  getDevices(query) {
    return this.datasource.metricFindQuery(query || 'devices')
  }

  getParameters(query) {
    return this.datasource.metricFindQuery(query || 'parameters')
  }

  toggleEditorMode() {
    this.target.rawQuery = !this.target.rawQuery;
  }

  onChangeInternal() {
    this.panelCtrl.refresh();
  }
}

FlespiDevicesDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
