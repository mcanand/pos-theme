/* global Sha1 */
odoo.define('point_of_sale.password_pad', function(require) {
    'use strict';

    var core = require('web.core');
    var _t = core._t;
    const { useState } = owl;
    const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');
    const NumberBuffer = require('point_of_sale.NumberBuffer');
    const { useListener } = require('web.custom_hooks');
    const Registries = require('point_of_sale.Registries');
    const { posbus } = require('point_of_sale.utils');

    class NumberPopupCustom extends AbstractAwaitablePopup {

        constructor() {
            super(...arguments);
            useListener('accept-input', this.confirm);
            useListener('close-this-popup', this.cancel);
            useListener('click-key', this.key_click);
            let startingBuffer = '';
            if (typeof this.props.startingValue === 'number' && this.props.startingValue > 0) {
                startingBuffer = this.props.startingValue.toString().replace('.', this.decimalSeparator);
            }
            this.state = useState({ buffer: startingBuffer, toStartOver: this.props.isInputSelected });
            $('popup-input').click()
            NumberBuffer.use({
                nonKeyboardInputEvent: 'numpad-click-input',
                triggerAtEnter: 'accept-input',
                triggerAtEscape: 'close-this-popup',
                triggerAtInput: 'click-key',
                state: this.state,
            });
        }
        get decimalSeparator() {
            return this.env._t.database.parameters.decimal_point;
        }
        get inputBuffer() {
            if (this.state.buffer === null) {
                return '';
            }
            if (this.props.isPassword) {
                return this.state.buffer.replace(/./g, '•');
            } else {
                return this.state.buffer;
            }
        }
        key_click(event){

        }
        confirm(event) {
            var order = this.env.pos.get_order()
            if (NumberBuffer.get() && this.props.cachier && this.props.isPassword) {
                var input = NumberBuffer.get()
                if(this.props.cachier.pin === Sha1.hash(input)){
                    if(this.props.order_remove){
                        order.destroy({ reason: 'abandon' });
                        posbus.trigger('order-deleted');
                        this.env.pos.add_new_order()
                    }
                    else{
                         order.remove_orderline(order.get_selected_orderline())
                         order.trigger('change', this)
                    }
                    super.confirm()
                } else {
                    $('.error').html("wrong Password")
                }
            }
        }
        sendInput(key) {
            this.trigger('numpad-click-input', { key });
        }
        getPayload() {
            return NumberBuffer.get();
        }
    }
    NumberPopupCustom.template = 'NumberPopupCustom';
    NumberPopupCustom.defaultProps = {
        confirmText: _t('Ok'),
        cancelText: _t('Cancel'),
        title: _t('Confirm ?'),
        body: '',
        cheap: false,
        startingValue: null,
        isPassword: false,
    };

    Registries.Component.add(NumberPopupCustom);

    return NumberPopupCustom;
});
