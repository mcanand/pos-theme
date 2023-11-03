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

     models.load_fields('product.product', ['local_name','qty_available']);
     models.load_fields('product.template', ['local_name','qty_available']);

     var _order_super = models.Order.prototype;
     models.Order = models.Order.extend({
            initialize: function(attributes, options){
                this.set_invoice_number();
                let res = _order_super.initialize.apply(this, arguments);
            },
            init_from_JSON: function (json) {
                this.freight_charge = json.freight_charge || 0
                this.total_discount_amt = json.total_discount_amt || 0
                this.invoice_number = json.invoice_number || this.invoice_number || 0
                return _order_super.init_from_JSON.apply(this, arguments);
            },
            set_freight_charge: function(charge){
                this.freight_charge = charge
                this.trigger('change', this)
            },
            get_freight_charge: function(){
                return this.freight_charge || 0
            },
            set_total_discount_amt:function(){
                 this.total_discount_amt = this.get_lines_discount_amt() + this.get_total_discount()
                 this.trigger('change', this)
                 return this.total_discount_amt
            },
            get_lines_discount_amt:function(){
                var orderlines = this.get_orderlines()
                var discounts = []
                if(orderlines){
                    _.each(orderlines, function(line){
                        if(line.is_program_reward){
                            discounts.push(-(line.price))
                        }
                    });
                }
                var sum = 0
                for(var i=0;i<discounts.length;i++){
                    sum += discounts[i]
                }
                return sum || 0
            },
            get_total_discount_amount:function(){
                return this.total_discount_amt || 0
            },
            get_total_with_tax: function() {
                var result = _order_super.get_total_with_tax.apply(this, arguments);
                return result + parseFloat(this.get_freight_charge());
            },
            set_invoice_number:function(){
                var self = this
                rpc.query({
                    model: 'pos.order',
                    method: 'get_last_invoice',
                }).then(function(result){
                    self.invoice_number = result
                    self.trigger('change', self)
                });
                this.trigger('change', this)
            },
            get invoice(){
                return this.invoice_number
            },
            export_as_JSON: function() {
                let json = _order_super.export_as_JSON.apply(this, arguments);
                json.freight_charge = this.get_freight_charge()
                json.total_discount_amt = this.total_discount_amt
                json.invoice_number = this.invoice_number
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
     var posmodel_super = models.PosModel.prototype;
     models.PosModel = models.PosModel.extend({
            initialize: function(attributes, options){
                let res = posmodel_super.initialize.apply(this, arguments);
            },
            init_from_JSON: function (json) {
                let res = posmodel_super.init_from_JSON.apply(this, arguments);
            },
            export_as_JSON: function() {
                let json = posmodel_super.export_as_JSON.apply(this, arguments);
                return json
            }
     });
});