odoo.define('pos_custom_theme.ActionPadNew', function(require) {
    'use strict';

    const { useState } = owl.hooks;
    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');
    const ProductsWidget = require('point_of_sale.ProductsWidget');
    const { posbus } = require('point_of_sale.utils');
    const { useRef } = owl.hooks;
    const { debounce } = owl.utils;
    const { Gui } = require('point_of_sale.Gui');


    class ActionPadNew extends ProductsWidget{
          constructor() {
                super(...arguments);
          }
          async ClickAddLineDescription(){
                const selectedOrderline = this.env.pos.get_order().get_selected_orderline();
                if (!selectedOrderline) return;
                if(!selectedOrderline.is_program_reward){
                    Gui.showPopup('ProductInfoEditPopup')
                }
          }
          async ClickShowProductInfo(){
                const orderline = this.env.pos.get_order().get_selected_orderline();
                if (orderline) {
                    const product = orderline.get_product();
                    const quantity = orderline.get_quantity();
                    const info = await this.env.pos.getProductInfo(product, quantity);
                    this.showPopup('ProductInfoPopup', { info: info , product: product });
                }
          }
          async ClickShowOrders(){
               this.showScreen('TicketScreen',{
                ui: { filter: 'SYNCED' },
               });
          }
          async ClickQtyUpdatePlus(){
                var order_line = this.env.pos.get_order().get_selected_orderline()
                if(order_line){
                    var quantity = order_line.quantity + 1
                    order_line.set_quantity(quantity)
                }
                this.env.pos.get_order().trigger('change');
          }
          async ClickQtyUpdateMinus(){
                var order_line = this.env.pos.get_order().get_selected_orderline()
                if(order_line){
                    var quantity = order_line.quantity - 1
                    if (quantity >= 0){
                        order_line.set_quantity(quantity)
                    }
                }
                this.env.pos.get_order().trigger('change');
          }
          async ClickDeleteLine(){
               var order = this.env.pos.get_order()
               var order_line = order.get_selected_orderline()
               if(order && order_line){
                    order.remove_orderline(order_line)
                    order.trigger('change');
               }

          }
          async UpdateQtyBarcodeInput(){
                var qty = $('#InputBarcodeUpdateQty').val()
                if (parseInt(qty)){
                    $('#InputBarcodeUpdateQty').val(parseInt(qty) + 1)
                }else{
                    $('#InputBarcodeUpdateQty').val(1)
                }
          }
          async ClickClearAllLines(){
            var order = this.env.pos.get_order()
            var order_lines = order.get_orderlines()
            if(order && order_lines.length >= 1 && this.env.pos.config.module_pos_hr && this.env.pos.get_cashier().pin){
                this.showPopup('NumberPopupCustom', {
                    isPassword: true,
                    title: this.env._t('Manager Password ?'),
                    startingValue: false,
                    cachier: this.env.pos.get_cashier(),
                    order_remove: true,
                    error: false,
                });
            }
            else{
                order.destroy({ reason: 'abandon' });
                posbus.trigger('order-deleted');
                this.env.pos.add_new_order()
            }
        }
        async ClickPrevOrders(){
            var order = this.env.pos.get_prev_unpaid_order();
            var options = {}
            if(order[0]){
                this.env.pos.set_order(order[0], options)
            }
        }
        async ClickNextOrders(){
            var order = this.env.pos.get_next_unpaid_order();
            var options = {}
            if(order[0]){
                this.env.pos.set_order(order[0], options)
            }
        }
    }
    ActionPadNew.template = 'ActionPadNew';
    ActionPadNew.defaultProps = {
        isActionButtonHighlighted: false,
    }

    Registries.Component.add(ActionPadNew);

    return ActionPadNew;
});
