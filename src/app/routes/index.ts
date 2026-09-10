import { Router } from "express";
import { AreaRoutes } from "../modules/area/area.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { DistributionZoneRoutes } from "../modules/distributionZone/distributionZone.route";
import { FeederRoutes } from "../modules/feeder/feeder.route";
import { OutageRoutes } from "../modules/outage/outage.route";
import { ScheduleRoutes } from "../modules/schedule/schedule.route";
import { SubstationRoutes } from "../modules/substation/substation.route";

const router = Router();

const moduleRoutes = [
	{
		path: "/auth",
		route: AuthRoutes,
	},
	{
		path: "/distribution-zones",
		route: DistributionZoneRoutes,
	},
	{
		path: "/substations",
		route: SubstationRoutes,
	},
	{
		path: "/feeders",
		route: FeederRoutes,
	},
	{
		path: "/areas",
		route: AreaRoutes,
	},
	{
		path: "/schedules",
		route: ScheduleRoutes,
	},
	{
		path: "/outages",
		route: OutageRoutes,
	},
];

moduleRoutes.forEach(({ path, route }) => {
	router.use(path, route);
});

export default router;
