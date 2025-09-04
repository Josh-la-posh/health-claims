type EventPayload = Record<string, unknown>;
type AnalyticsDriver = {
  identify: (id: string, props?: EventPayload) => void;
  track: (event: string, props?: EventPayload) => void;
  page: (name?: string, props?: EventPayload) => void;
};

class NoOp implements AnalyticsDriver {
  identify() {}
  track() {}
  page() {}
}

let driver: AnalyticsDriver = new NoOp();

export function setAnalytics(d: AnalyticsDriver) { driver = d; }
export const analytics = {
  identify: driver.identify.bind(driver),
  track: driver.track.bind(driver),
  page: driver.page.bind(driver),
};
