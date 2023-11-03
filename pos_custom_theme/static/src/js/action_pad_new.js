odoo.define('pos_custom_theme.ActionPadNew', function(require) {
    'use strict';

    const { useState } = owl.hooks;
    const models = require('point_of_sale.models');
    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');
    const ProductsWidget = require('point_of_sale.ProductsWidget');
    const { posbus } = require('point_of_sale.utils');
    const { useRef } = owl.hooks;
    const { debounce } = owl.utils;
    const { Gui } = require('point_of_sale.Gui');
    var rpc = require('web.rpc');
     var core = require('web.core');
    var _t = core._t;


    class ActionPadNew extends PosComponent{
          constructor() {
                super(...arguments);
                this._state = this.env.pos.TICKET_SCREEN_STATE;
                this._fetchSyncedOrders();
                this.invoice_number = this.env.pos.get_order().invoice_number
                this.products = []
                this.selected_product = false
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
                _.each(order_lines, function(line){
                    order.remove_orderline(line)
                });
                order.trigger('change')
            }
        }
          get invoice(){
                var res = this.env.pos.get_order();
                return res.invoice_number
          }
          async _fetchSyncedOrders() {
                this._state.syncedOrders.toShow = []
                this._state.syncedOrders.cache = {}
                var self = this;
                const domain = [];
                const limit = 5;
                const offset = 0;
                const { ids, totalCount } = await this.rpc({
                    model: 'pos.order',
                    method: 'search_paid_order_ids',
                    kwargs: { config_id: this.env.pos.config.id, domain, limit, offset },
                    context: this.env.session.user_context,
                });
                const idsNotInCache = ids.filter((id) => !(id in this._state.syncedOrders.cache));
                if ( totalCount > 0) {
                    const fetchedOrders = await this.rpc({
                        model: 'pos.order',
                        method: 'export_for_ui',
                        args: [ids],
                        context: this.env.session.user_context,
                    });
                    // Check for missing products and partners and load them in the PoS
                    await this.env.pos._loadMissingProducts(fetchedOrders);
                    await this.env.pos._loadMissingPartners(fetchedOrders);

                    // Cache these fetched orders so that next time, no need to fetch
                    // them again, unless invalidated. See `_onInvoiceOrder`.
                    fetchedOrders.forEach((order) => {
                        this._state.syncedOrders.cache[order.id] = new models.Order({}, { pos: this.env.pos, json: order });
                    });
                }
                this._state.syncedOrders.totalCount = totalCount;
                this._state.syncedOrders.toShow = ids.map((id) => this._state.syncedOrders.cache[id]);
                var all_orders = this.env.pos.get_order_list();
                _.each(this._state.syncedOrders.toShow, function(order){
                     order.finalized = true
                     all_orders.push(order)
                });
                this._state.syncedOrders.toShow = all_orders
                this._state.syncedOrders.toShow.sort(function(a, b) {
                   if (a.backendId !== b.backendId) {
                     return a.id - b.backendId;
                   }
                   return b.validation_date.localeCompare(a.validation_date);
                });
          }
          getCustomer(order) {
              return order.get_client_name();
          }
          get_all_orders(){
              return this._state.syncedOrders.toShow
          }
          async ClickPrevOrders(){
                var orders = this.get_all_orders();
                var current_order = this.env.pos.get_order();
                for(var i=0; i< orders.length; i++){
                    if(orders[i].cid == current_order.cid){
                        if(orders[i + 1]){
                            this.env.pos.set_order(orders[i + 1], {});
                            this.showScreen('ProductScreen',{});
                            break;
                        }
                    }
                }
          }
          async ClickNextOrders(){
                var orders = this.get_all_orders();
                var current_order = this.env.pos.get_order();
                for(var i=0; i< orders.length; i++){
                    if(orders[i].cid == current_order.cid){
                        if(orders[i - 1]){
                            this.env.pos.set_order(orders[i - 1], {});
                            this.showScreen('ProductScreen',{});
                            break;
                        }
                    }
                }
          }
          async onKeySelectProduct(event){
                var self = this
                var key = event.target.value
                $('.product_custom_popup_new').show(400)
                const search_products = await this.rpc({
                        model: 'product.product',
                        method: 'search_custom_product',
                        args: [[],{'key':key}],
                        context: this.env.session.user_context,
                });
                var products = []
                var product_by_id = this.env.pos.db.product_by_id
                for(var i=0;i<search_products.length;i++){
                    var product = product_by_id[search_products[i]]
                    products.push(product)
                }
                this.products = products
                this.render();
          }
          async SelectProduct(product){
                this.selected_product = product
                $('.product_custom_popup_new').hide(400)
                $('#InputProductUpdateQty').focus()
                this.render()
          }
          async AddOrderLineWithQty(){
                if(event.key=='Enter' && this.selected_product){
                    var options = {'quantity':event.target.value}
                    var order = this.env.pos.get_order()
                     if (!order) {
                        this.env.pos.add_new_order();
                    }
                    const product = this.selected_product;
                    if (!options) return;
                    await order.add_product(product, options);
                }
          }
          async AddOrderLineWithQtyButton(){
               if( $('#InputProductUpdateQty').val()>0){
                    var options = {'quantity': $('#InputProductUpdateQty').val()}
                    var order = this.env.pos.get_order()
                     if (!order) {
                        this.env.pos.add_new_order();
                    }
                    const product = this.selected_product;
                    if (!options) return;
                    await order.add_product(product, options);
                }
          }
          async PopupClose(){
            $('.product_custom_popup_new').hide(400)
          }
    }
    ActionPadNew.template = 'ActionPadNew';
    ActionPadNew.defaultProps = {
        isActionButtonHighlighted: false,
    }

    Registries.Component.add(ActionPadNew);

    return ActionPadNew;
});
