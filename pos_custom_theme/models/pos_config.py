from odoo import fields, models


class PosConfig(models.Model):
    _inherit = 'pos.config'

    themes = fields.Selection([('default', 'Default'), ('theme_new', 'New Theme')], default='default')
    fast_payment_method_id = fields.Many2one('pos.payment.method', required=True)
    freight_charge = fields.Float()
