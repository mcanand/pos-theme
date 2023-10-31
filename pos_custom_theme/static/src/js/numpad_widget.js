odoo.define('pos_custom_theme.numpad_widget', function (require) {
    'use strict';

    const NumpadWidget = require('point_of_sale.NumpadWidget');
    const Registries = require('point_of_sale.Registries');
    const PosComponent = require('point_of_sale.PosComponent');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const { useListener } = require('web.custom_hooks');
    const { isConnectionError } = require('point_of_sale.utils');
    const useSelectEmployee = require('pos_hr.useSelectEmployee');

    const PosThemeNumpadWidget = (NumpadWidget) => class extends NumpadWidget {
        constructor() {
            super(...arguments);
            const { selectEmployee, askPin } = useSelectEmployee();
            this.selectEmployee = selectEmployee;
            this.askPin = askPin;
        }
        async ClickFastPayment(){
            var currentOrder = this.env.pos.get_order()
            var paymentMethod = false
            var payment_methods_by_id = this.env.pos.payment_methods_by_id
            var payment_id = this.env.pos.config.fast_payment_method_id[0]
            _.each(payment_methods_by_id, function(pay_method){
                if(payment_id == pay_method.id){
                    paymentMethod = pay_method

                }
            });
            let result = currentOrder.add_paymentline(paymentMethod);
            if (result){
                await this._finalizeValidation();
            }
        }
        async _finalizeValidation() {
            var currentOrder = this.env.pos.get_order()
            if ((currentOrder.is_paid_with_cash() || currentOrder.get_change()) && this.env.pos.config.iface_cashdrawer) {
                this.env.pos.proxy.printer.open_cashbox();
            }

            currentOrder.initialize_validation_date();
            currentOrder.finalized = true;

            let syncedOrderBackendIds = [];

            try {
                this.env.services.ui.block()
                if (currentOrder.is_to_invoice()) {
                    syncedOrderBackendIds = await this.env.pos.push_and_invoice_order(
                        currentOrder
                    );
                } else {
                    syncedOrderBackendIds = await this.env.pos.push_single_order(currentOrder);
                }
            } catch (error) {
                if (error.code == 700 || error.code == 701)
                    this.error = true;

                if ('code' in error) {
                    // We started putting `code` in the rejected object for invoicing error.
                    // We can continue with that convention such that when the error has `code`,
                    // then it is an error when invoicing. Besides, _handlePushOrderError was
                    // introduce to handle invoicing error logic.
                    await this._handlePushOrderError(error);
                } else {
                    // We don't block for connection error. But we rethrow for any other errors.
                    if (isConnectionError(error)) {
                        this.showPopup('OfflineErrorPopup', {
                            title: this.env._t('Connection Error'),
                            body: this.env._t('Order is not synced. Check your internet connection'),
                        });
                    } else {
                        throw error;
                    }
                }
            } finally {
                this.env.services.ui.unblock()
            }
            if (syncedOrderBackendIds.length && currentOrder.wait_for_push_order()) {
                const result = await this._postPushOrderResolve(
                    this.currentOrder,
                    syncedOrderBackendIds
                );
                if (!result) {
                    await this.showPopup('ErrorPopup', {
                        title: this.env._t('Error: no internet connection.'),
                        body: this.env._t('Some, if not all, post-processing after syncing order failed.'),
                    });
                }
            }

            this.showScreen(this.nextScreen);

            // If we succeeded in syncing the current order, and
            // there are still other orders that are left unsynced,
            // we ask the user if he is willing to wait and sync them.
            if (syncedOrderBackendIds.length && this.env.pos.db.get_orders().length) {
                const { confirmed } = await this.showPopup('ConfirmPopup', {
                    title: this.env._t('Remaining unsynced orders'),
                    body: this.env._t(
                        'There are unsynced orders. Do you want to sync these orders?'
                    ),
                });
                if (confirmed) {
                    // NOTE: Not yet sure if this should be awaited or not.
                    // If awaited, some operations like changing screen
                    // might not work.
                    this.env.pos.push_orders();
                }
            }
        }
        get nextScreen() {
            return !this.error? 'ReceiptScreen' : 'ProductScreen';
        }
        async _postPushOrderResolve(order, order_server_ids) {
            return true;
        }
        async ClickOpenDrawer(){
            if(this.env.pos.config.iface_cashdrawer){
                await this.env.pos.proxy.printer.open_cashbox();
            }
        }
        async ClickRefund(){
            const customer = this.env.pos.get_order().get_client();
            const searchDetails = customer ? { fieldName: 'CUSTOMER', searchTerm: customer.name } : {};
            this.trigger('close-popup');
            this.showScreen('TicketScreen', {
                ui: { filter: 'SYNCED', searchDetails },
                destinationOrder: this.env.pos.get_order(),
            });
        }
        async ClickBarcodePromo(){
            const { confirmed, payload: code } = await this.showPopup('TextInputPopup', {
                title: this.env._t('Enter Promotion or Coupon Code'),
                startingValue: '',
            });
            if (confirmed && code !== '') {
                const order = this.env.pos.get_order();
                order.activateCode(code);
            }
        }
        async ClickResetProgram(){
            const order = this.env.pos.get_order();
            order.resetPrograms();
            this.trigger('close-popup');
        }
        async ClickAddFreightCharge(){
            var charge = this.env.pos.config.freight_charge
            const { confirmed, payload: inputPin } = await this.showPopup('NumberPopup', {
                isPassword: false,
                title: this.env._t('Freight / Delivery Charge'),
                startingValue: charge,
                cheap: false,
            });
            var order = this.env.pos.get_order();
            order.set_freight_charge(inputPin)
        }
        async ClickToPrint(){
            if (!this.env.pos.get_order()) return;
            this.showScreen('ReprintReceiptScreen', { order: this.env.pos.get_order(), fromProductScreen: true });
        }
    };
    Registries.Component.extend(NumpadWidget, PosThemeNumpadWidget);
    return NumpadWidget;
});
