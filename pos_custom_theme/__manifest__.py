# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

{
    'name': 'Point of Sale Theme',
    'version': '1.0.1',
    'category': 'Sales/Point of Sale',
    'sequence': 1,
    'summary': '',
    'description': "",
    'depends': ['point_of_sale', 'pos_coupon', 'l10n_in', 'product'],
    'data': [
        'views/pos_config.xml',
        'views/product.xml',
    ],
    'installable': True,
    'application': True,
    'assets': {
        'point_of_sale.assets': [
            '/pos_custom_theme/static/src/**/*.js'
        ],
        'web.assets_backend': [

        ],
        'point_of_sale.pos_assets_backend': [

        ],
        'point_of_sale.pos_assets_backend_style': [
            # "web/static/src/core/ui/**/*.scss",
        ],
        'point_of_sale.qunit_suite_tests': [

        ],
        'point_of_sale.assets_backend_prod_only': [

        ],
        'web.assets_qweb': [
            'pos_custom_theme/static/src/xml/**/*',
        ],
    },
    'license': 'LGPL-3',
}
