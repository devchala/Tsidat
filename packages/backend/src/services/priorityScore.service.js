const { PRIORITY_LEVEL } = require('@tsidat/shared');

/**
 * Turns raw signals into a 0-100 priority score and a bucket (LOW..CRITICAL).
 * This is a starting heuristic for the team to tune - see spec section 7.1
 * (severity, health/safety risk, wait time, nearby-report count, location
 * importance, worker proximity/availability). It assists admins; it must
 * never fully replace human review for CRITICAL classification.
 */
function computePriorityScore({
  severityWeight = 0, // 0-30, set by category (e.g. hazardous waste scores higher)
  hoursWaiting = 0, // time since submission
  nearbyReportCount = 0, // reports clustered into the same incident
  locationImportanceWeight = 0, // 0-20, e.g. near schools/hospitals
} = {}) {
  const waitScore = Math.min(hoursWaiting * 1.5, 25);
  const clusterScore = Math.min(nearbyReportCount * 5, 20);

  const score = Math.min(
    100,
    Math.round(severityWeight + waitScore + clusterScore + locationImportanceWeight)
  );

  let level = PRIORITY_LEVEL.LOW;
  if (score >= 80) level = PRIORITY_LEVEL.CRITICAL;
  else if (score >= 55) level = PRIORITY_LEVEL.HIGH;
  else if (score >= 30) level = PRIORITY_LEVEL.MEDIUM;

  return { score, level };
}

module.exports = { computePriorityScore };
