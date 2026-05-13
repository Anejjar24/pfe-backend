"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertTriggerHandler = void 0;
const Alert_entity_1 = require("../../database/entities/Alert.entity");
class AlertTriggerHandler {
    constructor(alertsService) {
        this.alertsService = alertsService;
    }
    async execute(node, input) {
        const rawType = String(node.data?.type || 'system_error');
        const rawSeverity = String(node.data?.severity || 'warning');
        const message = String(node.data?.message || 'Workflow-triggered alert');
        const stationId = node.data?.stationId ? String(node.data.stationId) : undefined;
        const type = Object.values(Alert_entity_1.AlertType).includes(rawType)
            ? rawType
            : Alert_entity_1.AlertType.SYSTEM_ERROR;
        const severity = Object.values(Alert_entity_1.AlertSeverity).includes(rawSeverity)
            ? rawSeverity
            : Alert_entity_1.AlertSeverity.WARNING;
        const alert = await this.alertsService.create({
            type,
            severity,
            message,
            stationId,
            sourceSystem: 'workflow',
            data: { workflowInput: input },
        });
        return {
            alertId: alert.id,
            severity: alert.severity,
            message: alert.message,
            status: alert.status,
        };
    }
}
exports.AlertTriggerHandler = AlertTriggerHandler;
//# sourceMappingURL=alert-trigger.handler.js.map