"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_route_1 = require("../modules/admin/admin.route");
const area_route_1 = require("../modules/area/area.route");
const assignment_route_1 = require("../modules/assignment/assignment.route");
const auth_route_1 = require("../modules/auth/auth.route");
const distributionZone_route_1 = require("../modules/distributionZone/distributionZone.route");
const feeder_route_1 = require("../modules/feeder/feeder.route");
const outage_route_1 = require("../modules/outage/outage.route");
const payment_route_1 = require("../modules/payment/payment.route");
const schedule_route_1 = require("../modules/schedule/schedule.route");
const substation_route_1 = require("../modules/substation/substation.route");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/auth",
        route: auth_route_1.AuthRoutes,
    },
    {
        path: "/admin",
        route: admin_route_1.AdminRoutes,
    },
    {
        path: "/distribution-zones",
        route: distributionZone_route_1.DistributionZoneRoutes,
    },
    {
        path: "/substations",
        route: substation_route_1.SubstationRoutes,
    },
    {
        path: "/feeders",
        route: feeder_route_1.FeederRoutes,
    },
    {
        path: "/areas",
        route: area_route_1.AreaRoutes,
    },
    {
        path: "/schedules",
        route: schedule_route_1.ScheduleRoutes,
    },
    {
        path: "/outages",
        route: outage_route_1.OutageRoutes,
    },
    {
        path: "/assignments",
        route: assignment_route_1.TechnicianAssignmentRoutes,
    },
    {
        path: "/payments",
        route: payment_route_1.PaymentRoutes,
    },
];
moduleRoutes.forEach(({ path, route }) => {
    router.use(path, route);
});
exports.default = router;
