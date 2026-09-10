import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { DistributionZoneRoutes } from "../modules/distributionZone/distributionZone.route";
import { SubstationRoutes } from "../modules/substation/substation.route";
import { FeederRoutes } from "../modules/feeder/feeder.route";
import { AreaRoutes } from "../modules/area/area.route";

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
];

moduleRoutes.forEach(({ path, route }) => {
  router.use(path, route);
});

export default router;