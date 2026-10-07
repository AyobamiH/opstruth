# Optional website measurement

The public site uses GA4 G-55ENMEPB2Y with basic consent: the Google tag is absent
before permission. Advertising consent remains denied. Do Not Track and Global
Privacy Control keep measurement disabled. Only declared public paths are measured.
Query strings, fragments, document titles, referrers, form answers and arbitrary
outbound URLs are not sent by our explicit events. A listing click is not an install.

## Deployment gate

Disable automatic Enhanced measurement in the GA4 stream **before deployment**.
This integration sends page_view, scroll and plugin_listing_click explicitly;
automatic page/history/click collection would duplicate events and weaken the
public-path boundary. Do not deploy until this setting is confirmed.

Build and run marketing-analytics regression tests; inspect mobile/keyboard consent
controls. After deployment, verify zero tag requests before consent, one public
page_view after consent, a listing-click event, and withdrawal stopping collection.
Use a clearly identified synthetic test session; do not report it as organic traffic.
Source checks or successful deployment do not prove GA4 has received events.

Plugin tool outcomes use a separate Worker dataset; website data cannot establish
ChatGPT installs, unique users or retention. Reconcile the website's skills-only
plugin description with the separate MCP product before changing public claims.
