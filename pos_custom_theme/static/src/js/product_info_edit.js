odoo.define('pos_custom_theme.ProductInfoEditPopup', function (require) {
    'use strict';

    const Registries = require('point_of_sale.Registries');
    const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');
    var core = require('web.core');
    var _t = core._t;

    class ProductInfoEditPopup extends AbstractAwaitablePopup {
        constructor() {
            super(...arguments);
            this.props.line = this.env.pos.get_order().get_selected_orderline() || false;
        }
        async onKeyUpDiscountAmt(event){
            var input = parseFloat(event.target.value)
//            if(event.key == 'Enter'){
                if(!input){
                    input = 0
                }
                if(event.target.name=='discount_amt'){
                    var discount_perc = (input / 100) * this.props.line.price
                    this.props.line.set_discount(discount_perc)
                }
                else if(event.target.name=='discount_perc'){
                    this.props.line.set_discount(input)
                }
                else if(event.target.name == 'rate'){
                      this.props.line.price = input
                      this.props.line.trigger('change')
                }
                else if(event.target.name == 'qty'){
                      this.props.line.set_quantity(input)
                      this.props.line.trigger('change')
                }
//            }
            else if(event.key == 'ArrowUp'){
                var input_list = $('.ProductInfoEditPopup input')
                var indexes = []
                _.each(input_list, function(tag, index){
                    if(event.target.name == tag.name){
                        indexes.push(index)
                    }
                });
                var new_index = indexes[0] - 1
                if(new_index < 0){
                    new_index = input_list.length - 1
                }
                if(new_index >= 0){
                    input_list[new_index].focus();
                }
            }
            else if(event.key == 'ArrowDown'){
                var input_list = $('.ProductInfoEditPopup input')
                var indexes = []
                _.each(input_list, function(tag, index){
                    if(event.target.name == tag.name){
                        indexes.push(index)
                    }
                });
                var new_index = indexes[0] + 1
                if(new_index > input_list.length - 1){
                    new_index = 0
                }
                if(new_index >= 0){
                    input_list[new_index].focus();
                }
            }
            this.env.pos.get_order().set_total_discount_amt()
            this.props.line.trigger('change')
        }
        async confirm(){
            super.confirm();
        }

    };
    ProductInfoEditPopup.template = 'ProductInfoEditPopup';
    ProductInfoEditPopup.defaultProps = {
        confirmText: _t('Ok'),
        cancelText: _t('Close'),
        title: _t('Product Info'),
        body: '',
        list: [],
    };
    Registries.Component.add(ProductInfoEditPopup);
});