odoo.define('pos_custom_theme.OrderlineTable', function(require) {
    'use strict';

    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');

    class OrderlineTable extends PosComponent {
        selectLine() {
            console.log(this.props.line)
//            this.thisrigger('select-line', { OrderlineTable: this.props.line });
            this.env.pos.get_order().select_orderline(this.props.line)
        }
        lotIconClicked() {
            this.trigger('edit-pack-lot-lines', { Orderline: this.props.line });
        }
        get addedClasses() {
            return {
                selected: this.props.line.selected,
            };
        }
        get customerNote() {
            return this.props.line.get_customer_note();
        }
    }
    OrderlineTable.template = 'OrderlineTable';

    Registries.Component.add(OrderlineTable);

    return OrderlineTable;
});
