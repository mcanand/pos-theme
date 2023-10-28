odoo.define('waiter_pos.order', function(require) {
    'use strict';

     const { Gui } = require('point_of_sale.Gui');
     const models = require('point_of_sale.models');
     const ajax = require('web.ajax');
     const useSelectEmployee = require('pos_hr.useSelectEmployee');


     var rpc = require('web.rpc');
     var core = require('web.core');
     var QWeb = core.qweb;
     var _t = core._t;

     models.load_fields('product.product', 'local_name');
     models.load_fields('product.template', 'local_name');

     var _order_super = models.Order.prototype;
     models.Order = models.Order.extend({
            initialize: function(attributes, options){
                let res = _order_super.initialize.apply(this, arguments);
            },
            init_from_JSON: function (json) {
                this.freight_charge = json.freight_charge || 0
                _order_super.init_from_JSON.apply(this, arguments);
            },
            set_freight_charge: function(charge){
                this.freight_charge = charge
                this.trigger('change', this)
            },
            get_freight_charge: function(){
                return this.freight_charge || 0
            },
            get_total_with_tax: function() {
                var result = _order_super.get_total_with_tax.apply(this, arguments);
                return result - this.get_freight_charge()
            },
            export_as_JSON: function() {
                let json = _order_super.export_as_JSON.apply(this, arguments);
                json.freight_charge = this.get_freight_charge()
                return json
            },
            export_for_printing: function () {
                return _order_super.export_for_printing.apply(this, arguments);
            },
     });
     var _super_orderlines = models.Orderline.prototype;
     models.Orderline = models.Orderline.extend({
            constructor: function() {
                _super_orderlines.constructor.apply(this, arguments);
                const { selectEmployee, askPin } = useSelectEmployee();
                this.askPin = askPin;
                this.selectEmployee = selectEmployee;
            },
            set_quantity:async function(quantity, keep_price){
                if(quantity == 'remove' && this.quantity == 0 && this.pos.config.module_pos_hr && this.pos.get_cashier().pin){
                      Gui.showPopup('NumberPopupCustom', {
                            isPassword: true,
                            title: _t('Manager Password ?'),
                            startingValue: false,
                            order_remove: false,
                            cachier: this.pos.get_cashier(),
                            error: false,
                      });
                }
                else{
                    _super_orderlines.set_quantity.apply(this, arguments);
                }
            },
     });
});