import { Router, Response, Request } from "express";
import { MetricsService } from "../services/observability/monitoring/monitoring.service";

const router = Router();

router.get("/metrics", async (req: Request, res: Response) => {
  const monitoringService = MetricsService.getInstance();

  try {
    const metrics = await monitoringService.getMetrics();
    res.setHeader("Content-Type", "text/plain");
    res.send(metrics);
  } catch (error) {
    console.error("Error retrieving metrics", error);
    res.status(500).send("Error retrieving metrics");
  }
});

export { router as metricsRouter };
