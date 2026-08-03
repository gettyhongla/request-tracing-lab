/**
 * Creates a Google Sheets workbook for studying production operations,
 * evidence-based troubleshooting, PostgreSQL behavior, Redis boundaries,
 * and Kubernetes symptom comparison.
 *
 * How to use:
 * 1. Open https://script.google.com/
 * 2. Create a new Apps Script project.
 * 3. Paste this file into Code.gs.
 * 4. Run createTroubleshootingWorkbook().
 * 5. Open the spreadsheet URL printed in the execution log.
 */

const WORKBOOK_NAME = 'Production Operations Deep Study Workbook';

const COLORS = {
  header: '#1f2937',
  headerText: '#ffffff',
  title: '#111827',
  titleText: '#ffffff',
  section: '#e5e7eb',
  note: '#eef2ff',
  border: '#d1d5db',
  browser: '#dbeafe',
  proxy: '#dcfce7',
  app: '#fef9c3',
  redis: '#ffedd5',
  pool: '#f3f4f6',
  postgres: '#ede9fe',
  resilience: '#ccfbf1',
  kubernetes: '#fee2e2',
  evidence: '#e0f2fe',
  warning: '#fef3c7',
  red: '#fecaca',
  yellow: '#fef08a',
  green: '#bbf7d0'
};

const STATUS_VALUES = ['Not Started', 'Learning', 'Needs Review', 'Confident'];
const DIFFICULTY_VALUES = ['Beginner', 'Intermediate', 'Interview'];
const YES_NO_PARTIAL = ['Yes', 'No', 'Partial'];
const YES_NO_ALMOST = ['Yes', 'No', 'Almost'];
const PRIORITY_VALUES = ['High', 'Medium', 'Low'];
const CONFIDENCE_VALUES = ['1', '2', '3', '4', '5'];
const CORRECT_VALUES = ['Correct', 'Review', 'Incorrect'];

function createTroubleshootingWorkbook() {
  const ss = SpreadsheetApp.create(WORKBOOK_NAME);
  const defaultSheet = ss.getSheets()[0];

  const builders = [
    buildStartHere,
    buildRequestPath,
    buildLayerTroubleshooting,
    buildLatencyByLayer,
    buildSymptomMatrix,
    buildPostgresMetrics,
    buildConnectionsPooling,
    buildTransactionsLocks,
    buildSlowQueryInvestigation,
    buildIndexingExplain,
    buildMemoryIoThroughput,
    buildRedisVsPostgres,
    buildDatabaseResilience,
    buildKubernetesComparison,
    buildIncidentFramework,
    buildScenarioPractice,
    buildInterviewQuestions,
    buildQuiz,
    buildAnswerKey,
    buildStudyTracker
  ];

  builders.forEach((builder, index) => {
    const sheet = index === 0 ? defaultSheet : ss.insertSheet();
    builder(sheet);
  });

  ss.setActiveSheet(ss.getSheetByName('Start Here'));
  Logger.log('Created spreadsheet: ' + ss.getUrl());
}

function resetSheet(sheet, name) {
  sheet.setName(name);
  sheet.clear();
  sheet.clearFormats();
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).setVerticalAlignment('top');
}

function setTitle(sheet, title, subtitle) {
  sheet.getRange(1, 1).setValue(title);
  sheet.getRange(1, 1, 1, 8).merge();
  sheet.getRange(1, 1)
    .setBackground(COLORS.title)
    .setFontColor(COLORS.titleText)
    .setFontWeight('bold')
    .setFontSize(14);
  if (subtitle) {
    sheet.getRange(2, 1).setValue(subtitle);
    sheet.getRange(2, 1, 1, 8).merge();
    sheet.getRange(2, 1).setWrap(true).setBackground(COLORS.note);
  }
  try {
    sheet.getRange(1, 1, subtitle ? 2 : 1, 8).protect().setWarningOnly(true);
  } catch (error) {
    Logger.log('Could not protect title rows on ' + sheet.getName() + ': ' + error);
  }
}

function writeSection(sheet, row, title, lines) {
  sheet.getRange(row, 1).setValue(title);
  sheet.getRange(row, 1, 1, 8).merge();
  sheet.getRange(row, 1).setFontWeight('bold').setBackground(COLORS.section);
  row += 1;
  lines.forEach(line => {
    sheet.getRange(row, 1).setValue(line);
    sheet.getRange(row, 1, 1, 8).merge();
    sheet.getRange(row, 1).setWrap(true);
    row += 1;
  });
  return row + 1;
}

function writeTable(sheet, startRow, startCol, headers, rows, options) {
  options = options || {};
  const range = sheet.getRange(startRow, startCol, rows.length + 1, headers.length);
  range.setValues([headers].concat(rows));
  range.setWrap(true).setVerticalAlignment('top');

  const headerRange = sheet.getRange(startRow, startCol, 1, headers.length);
  headerRange
    .setFontWeight('bold')
    .setFontColor(COLORS.headerText)
    .setBackground(options.headerColor || COLORS.header);

  range.setBorder(true, true, true, true, true, true, COLORS.border, SpreadsheetApp.BorderStyle.SOLID);
  sheet.setFrozenRows(Math.max(sheet.getFrozenRows(), startRow));
  safeCreateFilter(sheet, range);
  range.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);

  applyDropdowns(sheet, startRow, startCol, headers, rows.length);
  applyLayerColors(sheet, startRow, startCol, headers, rows.length);
  return startRow + rows.length + 2;
}

function safeCreateFilter(sheet, range) {
  const existing = sheet.getFilter();
  if (existing) existing.remove();
  range.createFilter();
}

function applyDropdowns(sheet, startRow, startCol, headers, rowCount) {
  const validations = {
    'Study Status': STATUS_VALUES,
    'Difficulty': DIFFICULTY_VALUES,
    'Priority': PRIORITY_VALUES,
    'Confidence': CONFIDENCE_VALUES,
    'Hands-On Complete?': YES_NO_PARTIAL,
    'Can Explain Without Notes?': YES_NO_ALMOST,
    'Correct?': CORRECT_VALUES
  };

  headers.forEach((header, index) => {
    if (!validations[header]) return;
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(validations[header], true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange(startRow + 1, startCol + index, rowCount, 1).setDataValidation(rule);
  });
}

function applyLayerColors(sheet, startRow, startCol, headers, rowCount) {
  const layerColIndex = headers.indexOf('Layer');
  if (layerColIndex === -1) return;
  const values = sheet.getRange(startRow + 1, startCol + layerColIndex, rowCount, 1).getValues();
  values.forEach((row, i) => {
    const color = colorForLayer(row[0]);
    if (color) sheet.getRange(startRow + 1 + i, startCol, 1, headers.length).setBackground(color);
  });
}

function colorForLayer(value) {
  const text = String(value || '').toLowerCase();
  if (text.includes('browser') || text.includes('client')) return COLORS.browser;
  if (text.includes('dns') || text.includes('tcp') || text.includes('tls') || text.includes('nginx') || text.includes('proxy') || text.includes('ingress') || text.includes('network')) return COLORS.proxy;
  if (text.includes('flask') || text.includes('application')) return COLORS.app;
  if (text.includes('redis') || text.includes('cache') || text.includes('session')) return COLORS.redis;
  if (text.includes('pool') || text.includes('connection')) return COLORS.pool;
  if (text.includes('postgresql') || text.includes('database')) return COLORS.postgres;
  if (text.includes('replica') || text.includes('backup') || text.includes('failover') || text.includes('ha')) return COLORS.resilience;
  if (text.includes('kubernetes') || text.includes('pod') || text.includes('container') || text.includes('service') || text.includes('endpointslice') || text.includes('persistent')) return COLORS.kubernetes;
  return null;
}

function finishSheet(sheet, widths) {
  sheet.getDataRange().setWrap(true).setVerticalAlignment('top');
  widths.forEach((width, i) => sheet.setColumnWidth(i + 1, width));
}

function addStudyStatusRows(rows) {
  return rows.map(row => row.concat(['Not Started', '']));
}

function buildStartHere(sheet) {
  resetSheet(sheet, 'Start Here');
  setTitle(sheet, 'Production Operations Deep Study Workbook', 'Connect customer-visible symptoms to evidence across browser, proxy, application, cache, connection pool, database, container, and Kubernetes layers.');

  let row = 4;
  row = writeSection(sheet, row, 'Workbook Purpose', [
    'This workbook helps connect customer-visible symptoms to evidence across browser, proxy, application, cache, connection pool, database, container, and Kubernetes layers.'
  ]);
  row = writeSection(sheet, row, 'Core Investigation Framework', [
    'Scope -> Reproduce -> Trace request -> Gather logs, metrics, and events -> Form hypotheses -> Validate -> Mitigate customer impact -> Identify root cause -> Prevent recurrence'
  ]);
  row = writeSection(sheet, row, 'Layer Reminder', [
    'Browser -> Proxy -> Flask -> Redis -> Connection Pool -> PostgreSQL -> Replica / Backup -> Containers / Kubernetes'
  ]);

  const questions = [
    ['Can I identify which layer owns each responsibility?', 'Not Started', ''],
    ['Can I explain what latency means at each layer?', 'Not Started', ''],
    ['Can I distinguish query latency from total request latency?', 'Not Started', ''],
    ['Can I explain connection pooling?', 'Not Started', ''],
    ['Can I identify pool exhaustion?', 'Not Started', ''],
    ['Can I explain transactions and rollback?', 'Not Started', ''],
    ['Can I explain locks and blocking?', 'Not Started', ''],
    ['Can I investigate a slow query?', 'Not Started', ''],
    ['Can I explain EXPLAIN and sequential scans?', 'Not Started', ''],
    ['Can I explain when an index helps?', 'Not Started', ''],
    ['Can I interpret CPU, memory, I/O, throughput, and replication lag?', 'Not Started', ''],
    ['Can I distinguish PostgreSQL failures from Redis, Flask, and Kubernetes failures?', 'Not Started', '']
  ];
  writeTable(sheet, row, 1, ['Study Completion Question', 'Study Status', 'My Notes'], questions);
  finishSheet(sheet, [420, 150, 420, 160, 160, 160, 160, 160]);
}

function buildRequestPath(sheet) {
  resetSheet(sheet, 'Request Path');
  setTitle(sheet, 'Request Path', 'Follow a synchronous customer request from client to evidence.');

  const rows = [
    [1, 'Browser/client', 'Customer action', 'Starts the workflow by clicking or submitting.', 'User report, timestamp, URL, screenshot', 'Wrong URL, stale page, client-side error'],
    [2, 'Browser/client', 'Browser request', 'Sends HTTP request and receives response.', 'DevTools network timing, status code, headers', 'Slow client network, blocked request, CORS symptom'],
    [3, 'DNS', 'Resolver', 'Maps hostname to an IP address.', 'DNS lookup timing, resolved IP', 'Wrong record, slow resolution, failed lookup'],
    [4, 'TCP/network', 'Connection', 'Establishes transport path to server.', 'TCP timing, connection refused/reset', 'Port closed, firewall, network loss'],
    [5, 'TLS', 'Handshake', 'Negotiates encrypted HTTPS session.', 'TLS timing, certificate details', 'Expired cert, protocol mismatch, handshake timeout'],
    [6, 'NGINX/proxy', 'Routing', 'Accepts request and forwards upstream.', 'Access log, upstream status/time, X-Request-ID', '502, 503, 504, bad upstream'],
    [7, 'Flask application', 'Request handler', 'Runs route logic and builds response.', 'Flask log, status, request_id, elapsed_ms', 'Exception, validation error, slow code'],
    [8, 'Flask application', 'Authentication/authorization', 'Identifies user and checks access.', 'Session/cookie evidence, 401/403 logs', 'Bad session, wrong role, missing permission'],
    [9, 'Redis', 'Session/cache lookup', 'Reads temporary state or cached data.', 'Redis ping, cache hit/miss, TTL', 'Cache miss, Redis down, expired session'],
    [10, 'Connection pool', 'Connection acquisition', 'Gets a database connection before SQL.', 'Pool wait time, active/waiting connections', 'Pool exhausted, max connections reached'],
    [11, 'PostgreSQL', 'Query or transaction', 'Reads/writes durable data.', 'SQL output, query timing, EXPLAIN, rows written', 'Slow query, lock, rollback, DB unavailable'],
    [12, 'Browser/client', 'Response returned', 'Client receives status, headers, body.', 'HTTP status, response body, X-Request-ID', 'Timeout, wrong status, stale body'],
    [13, 'Evidence/observability', 'Logs/request ID', 'Links events across layers.', 'Request ID in NGINX, Flask, DB event rows', 'Missing correlation evidence']
  ];
  let row = writeTable(sheet, 4, 1, ['Step', 'Layer', 'Component', 'Responsibility', 'Evidence Produced', 'Common Failure'], rows);

  row = writeSection(sheet, row, 'Database-Backed Ticket Creation', [
    'POST /api/tickets -> NGINX forwards -> Flask authenticates -> Flask validates payload -> Flask obtains connection -> PostgreSQL begins transaction -> ticket inserted -> initial message inserted -> audit event inserted -> transaction commits -> 201 response returned'
  ]);
  finishSheet(sheet, [70, 170, 190, 300, 320, 280]);
}

function buildLayerTroubleshooting(sheet) {
  resetSheet(sheet, 'Layer Troubleshooting');
  setTitle(sheet, 'Layer Troubleshooting', 'Use layers to avoid blaming the wrong system.');
  const baseRows = [
    ['Browser/client', 'User request, local timing, displayed response', 'Page slow, request fails, stale page', 'Client network, cached page, blocked request', 'DevTools, HAR, status, headers', 'Total latency, DNS/TCP/TLS timing', 'Browser DevTools network tab', 'Does not prove Flask or PostgreSQL root cause'],
    ['DNS', 'Hostname resolution', 'Site cannot resolve or intermittently fails', 'Bad record, propagation, resolver issue', 'dig/nslookup, resolver logs', 'Lookup time, failure rate', 'DNS result and TTL', 'Does not prove app is down'],
    ['TCP/network', 'Network path and port reachability', 'Connection refused or timeout', 'Closed port, firewall, routing', 'curl timing, nc, packet/log evidence', 'Connect time, retransmits', 'Port and route checks', 'Does not prove query latency'],
    ['TLS', 'Encrypted session setup', 'Certificate warning or handshake fail', 'Expired cert, wrong hostname, protocol issue', 'curl -v, cert details, proxy logs', 'Handshake time, TLS errors', 'Certificate chain', 'Does not prove app route behavior'],
    ['NGINX/proxy', 'Public entrypoint and upstream routing', '502, 503, 504, slow upstream', 'Bad upstream, no healthy backend, timeout', 'Access/error logs, upstream_status, upstream_time', 'Request rate, upstream latency', 'NGINX access log', 'Does not prove database caused delay'],
    ['Flask application', 'Route logic, validation, auth, response', '500, slow endpoint, wrong data', 'Exception, slow code, bad config', 'Flask logs, request_id, stack trace', 'App latency, error rate', 'App log for request_id', 'Does not prove PostgreSQL is unhealthy'],
    ['Redis', 'Temporary cache/session state', 'Slower reads, session issues', 'Redis down, key expired, eviction', 'redis-cli, hit/miss, TTL, logs', 'Latency, memory, evictions, hit rate', 'Redis ping and key state', 'Does not prove durable data is gone'],
    ['Connection pool', 'Limits/reuses DB connections', 'Request waits before SQL', 'Pool full, timeout, leak', 'Pool metrics, active/waiting, acquisition time', 'Pool utilization, wait time', 'Pool dashboard/logs', 'Does not prove PostgreSQL CPU is high'],
    ['PostgreSQL', 'Durable relational data and SQL execution', 'Slow DB-backed pages, DB errors', 'Slow query, lock, storage wait, bad credentials', 'SQL timing, EXPLAIN, pg_stat_activity', 'Query latency, locks, I/O, CPU', 'DB logs and query plan', 'Does not prove browser/proxy path'],
    ['Replica/HA', 'Read capacity, standby, recovery', 'Stale data or failover errors', 'Replication lag, failover, stale read path', 'Lag metric, primary/replica compare', 'Lag, failover time, replica health', 'Replica dashboard', 'Does not replace backups'],
    ['Container', 'Process runtime and resource limits', 'Restarting service, OOMKilled', 'Memory limit, bad env, crash loop', 'Container logs, exit code, resource usage', 'CPU, memory, restarts', 'Container status/logs', 'Does not prove Service routing'],
    ['Kubernetes Deployment', 'Desired replicas and rollout strategy', 'Bad rollout, unavailable replicas', 'Bad image, config, readiness failure', 'kubectl rollout/status/events', 'Available replicas, rollout status', 'Deployment status', 'Does not prove DB query plan'],
    ['Kubernetes Pod', 'Running workload instance', 'Pod Running but traffic fails', 'Not Ready, crash, missing secret', 'Pod status, events, logs', 'Restarts, readiness, CPU/memory', 'kubectl describe pod', 'Does not prove external DNS'],
    ['Kubernetes Service', 'Stable virtual endpoint to Pods', 'Service has no endpoints', 'Selector mismatch, not ready pods', 'Service, EndpointSlice, selector', 'Endpoint count', 'kubectl get endpointslices', 'Does not prove app code works'],
    ['EndpointSlice', 'Actual backend endpoints for Service', 'No backend available', 'No ready pods, selector mismatch', 'EndpointSlice addresses/conditions', 'Ready endpoint count', 'EndpointSlice details', 'Does not prove database health'],
    ['Ingress', 'External routing into cluster', '404/502/503 at edge', 'Bad host/path, controller issue', 'Ingress rules, controller logs', 'Ingress errors, upstream health', 'Ingress describe/logs', 'Does not prove SQL issue'],
    ['Persistent storage', 'Durable disk for stateful workloads', 'DB fails to start or data missing', 'PVC/PV issue, full disk, attach fail', 'PVC status, storage events, DB logs', 'Disk capacity, I/O latency', 'PVC/PV and DB logs', 'Does not prove app auth']
  ];
  writeTable(sheet, 4, 1, ['Layer', 'What It Owns', 'Typical Customer Symptom', 'Common Causes', 'Evidence to Gather', 'Key Metrics', 'First Place to Check', 'What This Layer Does Not Prove', 'Study Status', 'My Notes'], addStudyStatusRows(baseRows));
  finishSheet(sheet, [180, 260, 260, 260, 300, 230, 240, 300, 140, 300]);
}

function buildLatencyByLayer(sheet) {
  resetSheet(sheet, 'Latency by Layer');
  setTitle(sheet, 'Latency by Layer', 'Break total latency into layer-specific timings before choosing a fix.');
  let row = writeSection(sheet, 4, 'Highlighted Reminder', [
    '"The request took eight seconds" does not prove the SQL query took eight seconds. Break total latency into layer-specific timings.'
  ]);
  const rows = [
    ['Total browser request latency', 'User initiates request', 'Browser receives response', 'End-to-end user wait', 'DevTools, curl timing', 'Any layer delay', 'PostgreSQL query latency'],
    ['DNS latency', 'Hostname lookup begins', 'IP address returned', 'Name resolution time', 'DevTools, dig', 'Resolver, DNS record, TTL', 'TCP/TLS/app latency'],
    ['TCP connection latency', 'SYN sent', 'Connection established', 'Transport setup time', 'curl timing, network telemetry', 'Packet loss, firewall, closed port', 'HTTP processing'],
    ['TLS handshake latency', 'TLS starts', 'Encrypted session ready', 'Certificate/session setup', 'curl -v, browser security timing', 'Cert issue, protocol mismatch', 'SQL latency'],
    ['Network latency', 'Packet leaves source', 'Packet arrives target', 'Path travel time', 'ping, traceroute, metrics', 'Distance, routing, congestion', 'App execution time'],
    ['Proxy upstream latency', 'NGINX forwards upstream', 'Flask responds to NGINX', 'Backend wait from proxy view', 'NGINX access log', 'Slow app, bad upstream, timeout', 'Browser rendering time'],
    ['Flask application latency', 'Route starts', 'Response built', 'Application processing time', 'Flask log/APM', 'Code, auth, Redis, DB wait', 'Raw DB query time'],
    ['Redis latency', 'Redis command starts', 'Redis returns', 'Cache/session operation time', 'Redis metrics/logs', 'Redis load, network, memory pressure', 'PostgreSQL durability'],
    ['Connection-pool acquisition time', 'App asks pool', 'Connection received', 'Waiting for a DB slot', 'Pool metrics/logs', 'Pool full, leak, max DB connections', 'Query execution time'],
    ['PostgreSQL query latency', 'SQL starts', 'Rows returned', 'Database execution time', 'DB logs, EXPLAIN ANALYZE', 'Scan, join, sort, lock, I/O', 'Total request latency'],
    ['Transaction duration', 'BEGIN', 'COMMIT/ROLLBACK', 'Full unit-of-work time', 'DB activity, app logs', 'Long transaction, lock, slow write', 'One SELECT timing'],
    ['Lock wait time', 'Query waits on lock', 'Lock released or timeout', 'Blocking duration', 'pg_stat_activity, locks', 'Long transaction, conflicting update', 'CPU saturation'],
    ['Disk I/O latency', 'Storage operation starts', 'Storage operation finishes', 'Read/write wait', 'DB/storage metrics', 'Slow disk, checkpoint, temp files', 'CPU usage'],
    ['Queue wait time', 'Job queued', 'Worker starts job', 'Async backlog delay', 'Queue depth, job timestamps', 'Worker down, backlog', 'Synchronous request latency'],
    ['Worker processing time', 'Worker starts', 'Worker finishes', 'Background job duration', 'Worker logs/metrics', 'Slow external call, CPU, retry', 'DB transaction duration'],
    ['Replication lag', 'Primary commits', 'Replica catches up', 'Replica staleness', 'Replica lag metric', 'Write load, network, replica health', 'Primary query speed']
  ];
  writeTable(sheet, row, 1, ['Latency Type', 'Start Point', 'End Point', 'What It Measures', 'Evidence Source', 'Common Causes', 'Not the Same As', 'Study Status', 'My Notes'], addStudyStatusRows(rows));
  finishSheet(sheet, [230, 180, 190, 260, 240, 260, 230, 140, 300]);
}

function buildSymptomMatrix(sheet) {
  resetSheet(sheet, 'Symptom Matrix');
  setTitle(sheet, 'Symptom Matrix', 'Map symptoms to hypotheses, not one guaranteed root cause.');
  const symptoms = [
    ['Login is slow', 'DNS/TLS/proxy delay', 'Auth lookup slow', 'Session read slow', 'Waiting for DB slot', 'User query/index/lock', 'Pod/Service slow path', 'Status + request_id + total timing', 'Auth logs, Redis, DB timing', 'Reduce impact, check dependency health'],
    ['Login fails', 'Bad route or 502', 'Bad credentials/session error', 'Session unavailable', 'No DB connection', 'users table unavailable', 'Secret/config missing', 'HTTP status and body', 'Flask auth log and DB error', 'Restore dependency or safe error'],
    ['Ticket list takes ten seconds', 'Proxy upstream slow', 'Route reached but slow', 'Cache miss', 'Pool wait', 'Slow SELECT, sort, scan', 'Pod CPU/memory pressure', 'NGINX upstream time', 'SQL timing and EXPLAIN', 'Cache, index, scale, or timeout'],
    ['Ticket creation returns 500', 'Proxy forwarded OK', 'Unhandled app exception', 'Maybe unrelated', 'Could fail acquiring connection', 'Constraint/SQL error', 'Bad env/migration missing', 'Response request_id', 'Flask stack trace and SQL error', 'Fix code/schema/config'],
    ['Ticket creation returns 503', 'Proxy/service unavailable', 'Safe dependency failure', 'Session/cache down maybe degrade', 'Pool timeout', 'DB unavailable', 'Pod not ready', 'Status category', 'Dependency logs and readiness', 'Restore critical dependency'],
    ['Saving a ticket hangs', 'Proxy timeout risk', 'Route blocked', 'Session read wait', 'Pool full', 'Lock or slow transaction', 'Pod resource wait', 'Client timeout and request_id', 'pg_stat_activity/locks', 'Release blocker or rollback'],
    ['Everyone receives timeouts', 'Edge/proxy saturation', 'App saturation', 'Redis causing fallback storm', 'Pool exhausted', 'DB overloaded/down', 'Cluster-wide issue', 'Scope and error rate', 'All layer dashboards', 'Mitigate traffic/dependency'],
    ['One customer receives timeouts', 'Client network', 'Specific route/user data path', 'User session key issue', 'User query waits', 'Specific row lock/data issue', 'Pod affinity unlikely but possible', 'Compare affected vs unaffected', 'Request IDs for that user', 'Fix data/lock/session'],
    ['One ticket update hangs', 'Proxy waits upstream', 'Route waiting', 'Unlikely cache cause', 'Connection wait possible', 'Row lock on one ticket', 'Pod not likely if isolated', 'Ticket ID and timing', 'Lock holder query', 'End blocking transaction'],
    ['Ticket appears missing', 'Stale page/cache', 'Auth filter hides it', 'Stale cache', 'Wrong DB target possible', 'Rollback/wrong DB/replica lag', 'Deployment points to wrong config', 'Read response and request_id', 'SQL on primary and config', 'Correct data path or restore'],
    ['Customer sees stale data', 'Browser cache', 'App cached response', 'Redis stale key', 'Not pool-specific', 'Replica lag/read path', 'Old pod/version', 'Headers/cache key', 'Primary vs replica compare', 'Invalidate cache or use primary'],
    ['Database CPU is high', 'Symptom likely downstream', 'Many DB-heavy requests', 'Cache failure increases reads', 'Many active conns', 'Expensive queries/scans/joins', 'Traffic surge pods', 'DB metric', 'Top SQL, EXPLAIN', 'Tune query/index/traffic'],
    ['Database CPU is low but latency is high', 'Could be before DB', 'App waiting', 'Redis wait', 'Pool wait', 'Locks/I/O/network waits', 'Pod throttling', 'Timing breakdown', 'Wait events, disk, pool', 'Remove wait source'],
    ['Connection refused', 'Proxy may report 503/502', 'Bad DB config path', 'Unrelated', 'No connection acquired', 'DB down/wrong port/firewall', 'Service/endpoints issue if in cluster', 'Exact exception', 'Direct connection test', 'Fix host/port/status/firewall'],
    ['Redis failure increases database load', 'Proxy sees slower upstream', 'App falls back to DB', 'Redis unavailable', 'More DB slots used', 'Read volume rises', 'Redis pod/service issue', 'Redis error and DB read rate', 'Cache hit rate, DB CPU', 'Restore Redis or reduce traffic'],
    ['Page loads but API request fails', 'Static served but API route bad', 'API exception', 'Session/cache issue', 'DB path failure', 'Route query fails', 'Ingress path split issue', 'Browser network tab', 'API logs/status', 'Fix failing path'],
    ['502 Bad Gateway', 'NGINX upstream invalid', 'Flask down/crashed', 'Maybe caused app crash', 'Not directly', 'Not directly unless app exits', 'No pod endpoint/upstream', 'NGINX error log', 'Flask process/pod status', 'Restore upstream'],
    ['503 Service Unavailable', 'Proxy/backend unavailable', 'App dependency safe failure', 'Redis critical only if session', 'Pool timeout', 'DB unavailable', 'Readiness fails/no endpoint', 'Status and category', 'Readiness/dependency logs', 'Restore dependency/readiness'],
    ['504 Gateway Timeout', 'Proxy waited too long', 'Flask slow/hung', 'Redis slow maybe', 'Pool wait', 'Slow/blocked DB', 'Pod overloaded', 'NGINX upstream time', 'Flask + DB timing', 'Short-term timeout/scale, root cause'],
    ['Pod is Running but traffic fails', 'Ingress/Service issue', 'App not ready or wrong port', 'Dependency issue maybe readiness', 'DB wait in readiness', 'DB readiness dependency failing', 'Readiness/selector issue', 'kubectl status', 'Service endpoints/logs', 'Fix readiness/selector/config'],
    ['Service has no endpoints', 'Ingress cannot route', 'Pods not selected/ready', 'Not direct', 'Not direct', 'Not direct', 'Selector/readiness mismatch', 'EndpointSlice empty', 'Pods labels/readiness', 'Fix selector/readiness'],
    ['Container repeatedly restarts', 'Client sees intermittent errors', 'App crash/startup fail', 'Redis env maybe bad', 'DB config maybe bad', 'Migration/config issue', 'CrashLoop/OOMKilled', 'Restart count/events', 'Container logs', 'Fix crash/env/resources']
  ];
  writeTable(sheet, 4, 1, ['Customer Symptom', 'Browser/Proxy Hypothesis', 'Flask Hypothesis', 'Redis Hypothesis', 'Pool Hypothesis', 'PostgreSQL Hypothesis', 'Kubernetes Hypothesis', 'First Evidence', 'Next Evidence', 'Possible Mitigation', 'Study Status', 'My Notes'], addStudyStatusRows(symptoms));
  finishSheet(sheet, [230, 240, 240, 220, 220, 260, 240, 240, 260, 260, 140, 300]);
}

function buildPostgresMetrics(sheet) {
  resetSheet(sheet, 'PostgreSQL Metrics');
  setTitle(sheet, 'PostgreSQL Metrics', 'Metrics narrow the investigation; they rarely prove root cause alone.');
  let row = writeSection(sheet, 4, 'Examples To Remember', [
    'High CPU + slow queries -> investigate expensive queries, concurrency, scans, joins, or sorts.',
    'Low CPU + high latency -> investigate pool waits, locks, network, disk I/O, or application delays.',
    'High memory usage alone -> not automatically a failure; PostgreSQL and the OS use memory for caching.'
  ]);
  const rows = [
    ['CPU utilization', 'Compute activity in PostgreSQL', 'Which SQL is responsible', 'Compare to baseline and query volume', 'Expensive query, concurrency, scans', 'Top queries, EXPLAIN', 'Tune query/index or reduce concurrency'],
    ['Memory utilization', 'RAM use/cache pressure', 'Failure by itself', 'High can be normal cache use', 'Large sorts, many connections, cache pressure', 'Swap, temp files', 'Tune memory/query/concurrency'],
    ['Shared buffer/cache hit ratio', 'How often reads hit cache', 'That query is efficient', 'Low ratio may mean disk-heavy reads', 'Large scans, cold cache', 'I/O latency, query plan', 'Tune query/index/cache'],
    ['Swap usage', 'Memory pressure spilling to disk', 'Root query by itself', 'Swap during load is risky', 'Too little memory, too many processes', 'OS metrics, OOM logs', 'Reduce memory use/scale'],
    ['Active connections', 'Connected DB clients doing work', 'Pool exhaustion alone', 'High near max is risky', 'Traffic spike, pool config, leaks', 'Pool wait and pg_stat_activity', 'Tune pool/max connections'],
    ['Idle connections', 'Open but unused DB sessions', 'Healthy or unhealthy alone', 'Too many idle can waste slots', 'Oversized pools, leaks', 'Pool config', 'Right-size pools'],
    ['Waiting connections', 'Requests waiting for connection or lock', 'Exact cause', 'Any unexpected wait matters', 'Pool exhaustion, locks', 'Pool metrics, wait events', 'Relieve bottleneck'],
    ['Connection acquisition time', 'Time to get DB connection', 'Query speed', 'Rising acquisition time hints pool pressure', 'Pool full, DB max reached', 'Pool utilization', 'Increase/tune pool carefully'],
    ['Query latency', 'SQL execution time', 'Why SQL is slow', 'Compare per query and baseline', 'Scan, lock, I/O, join', 'EXPLAIN, locks', 'Tune query/index/schema'],
    ['Slow-query count', 'Queries over threshold', 'Root cause by count alone', 'Rising count needs exact SQL', 'Bad plan, growth, locks', 'Slow query log', 'Investigate top offenders'],
    ['Transactions per second', 'Work completed per second', 'User impact alone', 'Compare to capacity/baseline', 'Traffic, batch jobs', 'Latency and errors', 'Scale/tune workload'],
    ['Rows read', 'Read volume', 'Efficiency alone', 'High rows read can signal broad scans', 'Missing index, bad filter', 'EXPLAIN rows', 'Tune query/index'],
    ['Rows written', 'Write volume', 'Write health alone', 'High writes affect WAL/I/O', 'Bulk insert, migration', 'WAL, disk latency', 'Schedule/tune writes'],
    ['Lock waits', 'Blocking transactions', 'Which app action caused it', 'Unexpected lock waits hurt latency', 'Long transaction, conflict', 'pg_stat_activity/locks', 'End/fix blocking transaction'],
    ['Deadlocks', 'Transactions blocking each other cyclically', 'All lock issues', 'Any deadlock should be investigated', 'Conflicting write order', 'DB logs', 'Fix transaction order'],
    ['Disk IOPS', 'Storage operation count', 'Efficiency by itself', 'High/low depends on baseline', 'Scans, writes, checkpoints', 'I/O latency', 'Tune storage/query'],
    ['Disk throughput', 'Bytes read/written per second', 'Root cause alone', 'Saturation can raise latency', 'Bulk reads/writes', 'Disk latency, queue depth', 'Tune workload/storage'],
    ['Disk latency', 'Storage response time', 'Query shape', 'High latency can slow DB with low CPU', 'Storage saturation, temp files', 'Wait events, IOPS', 'Reduce I/O or improve storage'],
    ['Storage capacity', 'Free disk', 'Performance root cause always', 'Near full threatens writes', 'Growth, logs, temp files', 'Disk alerts', 'Expand/clean/retention'],
    ['Temporary files', 'Queries spilling to disk', 'Which query without logs', 'Rising temp files can mean memory/query issue', 'Sort/hash too large', 'Query plan/logs', 'Tune query/work_mem carefully'],
    ['Replication lag', 'Replica behind primary', 'Primary health alone', 'Lag affects stale reads/failover', 'Write load, network, replica slow', 'Primary vs replica compare', 'Route reads carefully/fix replica'],
    ['Replica health', 'Read/standby availability', 'Backup safety', 'Unhealthy replica reduces HA/read scale', 'Lag, crash, storage', 'Replica dashboard/logs', 'Repair/recreate replica'],
    ['Failover time', 'Recovery duration', 'Data loss amount', 'Compare to RTO', 'Promotion, DNS, app reconnect', 'Event logs, app errors', 'Tune failover/reconnect'],
    ['Error count', 'DB errors over time', 'Root cause alone', 'Rising errors require categories', 'Auth, timeout, deadlock, unavailable', 'Error messages/logs', 'Fix specific class']
  ];
  writeTable(sheet, row, 1, ['Metric', 'What It Tells You', 'What It Does Not Prove', 'Healthy/Unhealthy Context', 'Common Causes', 'Next Evidence', 'Possible Response', 'Study Status', 'My Notes'], addStudyStatusRows(rows));
  finishSheet(sheet, [220, 250, 240, 260, 250, 240, 260, 140, 300]);
}

function buildConnectionsPooling(sheet) {
  resetSheet(sheet, 'Connections & Pooling');
  setTitle(sheet, 'Connections & Pooling', 'Separate pool exhaustion from PostgreSQL max-connection exhaustion.');
  let row = writeSection(sheet, 4, 'Definitions', [
    'Database connection: an active channel between app and PostgreSQL.',
    'Connection setup: creating the session, network path, authentication, and server-side state.',
    'Connection pool: reusable set of open database connections.',
    'Pool size: maximum number of pooled connections the app can use.',
    'Active/checked-out connection: a pooled connection currently being used.',
    'Idle connection: a pooled connection ready to use.',
    'Waiting request: request waiting because no pooled connection is available.',
    'Acquisition time: how long it takes to get a connection.',
    'Connection timeout: limit before waiting fails.',
    'Database max connections: PostgreSQL server-side client limit.'
  ]);
  row = writeSection(sheet, row, 'Flow', ['Flask request -> asks pool for connection -> pool lends connection -> Flask executes SQL -> connection returned to pool']);
  row = writeSection(sheet, row, 'Important Distinction', [
    'Pool exhaustion: application has no free pooled connection.',
    'Database connection exhaustion: PostgreSQL has reached its allowed client connection limit.'
  ]);
  const rows = [
    ['Request waits before SQL starts', 'Pool has no free connection', 'High acquisition time', 'Delay is before query execution', 'Tune pool/query duration/concurrency'],
    ['Pool utilization is 100%', 'All pooled connections checked out', 'Pool dashboard/log', 'App concurrency is at configured DB limit', 'Find long holders; right-size pool'],
    ['Database connections are at maximum', 'PostgreSQL max_connections reached', 'pg_stat_activity count/error', 'Server cannot accept more clients', 'Reduce pools, add pooling/proxy, tune max carefully'],
    ['Many idle connections', 'Oversized pools or leaks', 'Idle sessions count', 'Slots may be wasted', 'Right-size pools; close leaks'],
    ['Connection timeout', 'Wait exceeded limit', 'Timeout exception', 'Request failed before SQL result', 'Reduce wait cause; return safe error'],
    ['Connection refused', 'Wrong host/port or DB down', 'Exception/direct psql test', 'No connection established', 'Fix host/port/firewall/status'],
    ['Intermittent failures during traffic spike', 'Pool/max connection pressure', 'Errors correlate with load', 'Capacity or long queries are limiting', 'Scale app carefully; tune queries/pools'],
    ['Failover causes broken connections', 'Old primary connection dropped', 'Connection reset errors', 'App must reconnect safely', 'Reconnect handling; retry safe operations']
  ];
  writeTable(sheet, row, 1, ['Symptom', 'Possible Cause', 'Evidence', 'Meaning', 'Mitigation'], rows);
  finishSheet(sheet, [260, 280, 280, 300, 320, 160, 160, 160]);
}

function buildTransactionsLocks(sheet) {
  resetSheet(sheet, 'Transactions & Locks');
  setTitle(sheet, 'Transactions & Locks', 'Understand all-or-nothing writes and why one request can block another.');
  let row = writeSection(sheet, 4, 'Support-Ticket Transaction Example', [
    'Insert ticket -> Insert first ticket message -> Insert audit event -> Commit everything.',
    'If one required operation fails, rollback prevents a partially created support ticket.'
  ]);
  row = writeSection(sheet, row, 'Lock Scenario', [
    'Transaction A updates Ticket 1001 but does not commit.',
    'Transaction B attempts to update Ticket 1001.',
    'Transaction B waits.'
  ]);
  const rows = [
    ['Transaction', 'A unit of database work', 'Create ticket + message + event', 'Partial data if mishandled', 'COMMIT/ROLLBACK, rows present', 'Commit or roll back cleanly'],
    ['BEGIN', 'Start transaction', 'Start ticket create unit', 'Long open work can block others', 'Transaction age', 'Keep short'],
    ['COMMIT', 'Make work durable', 'Ticket becomes saved', 'Slow commit if storage issue', 'Rows visible after commit', 'Investigate write latency'],
    ['ROLLBACK', 'Undo uncommitted work', 'Failed insert leaves no partial ticket', 'User sees failure but no corrupt data', 'Rows absent after rollback', 'Fix failed operation'],
    ['Atomicity', 'All or none', 'Ticket, message, event together', 'Partial write risk', 'Related rows match', 'Use one transaction'],
    ['Row lock', 'Lock on a row being changed', 'Updating Ticket 1001', 'One update hangs', 'pg_locks/activity', 'Commit/rollback holder'],
    ['Lock holder', 'Session holding lock', 'Admin update not committed', 'Others wait', 'blocking pid', 'End/fix holder'],
    ['Lock waiter', 'Session waiting for lock', 'Customer update waits', 'Timeout/hang', 'waiting pid', 'Resolve blocker'],
    ['Blocking', 'One transaction delays another', 'Ticket status update waits', 'Slow isolated operation', 'wait_event lock', 'Shorten transactions'],
    ['Long-running transaction', 'Transaction open too long', 'Forgot to commit', 'Locks and vacuum pressure', 'xact_start age', 'Fix code/process'],
    ['Deadlock', 'Two sessions wait on each other', 'Two updates in opposite order', 'One request aborts', 'DB deadlock log', 'Consistent write order'],
    ['Transaction timeout', 'Database/app stops long transaction', 'Save fails after limit', '503/500 or rollback', 'timeout error', 'Reduce work/timeout safely'],
    ['Partial write', 'Some related data saved but not all', 'Ticket with no message', 'Confusing support history', 'Table comparison', 'Use transactions'],
    ['Isolation concept', 'Rules for what transactions can see', 'Concurrent ticket reads/writes', 'Stale or surprising reads', 'Isolation level + timing', 'Choose appropriate isolation']
  ];
  writeTable(sheet, row, 1, ['Concept', 'Plain-English Meaning', 'Support-Ticket Example', 'Customer Symptom', 'Evidence', 'Resolution', 'Study Status', 'My Notes'], addStudyStatusRows(rows));
  finishSheet(sheet, [210, 260, 280, 260, 240, 260, 140, 300]);
}

function buildSlowQueryInvestigation(sheet) {
  resetSheet(sheet, 'Slow Query Investigation');
  setTitle(sheet, 'Slow Query Investigation', 'Move from customer symptom to exact database evidence.');
  const rows = [
    [1, 'What did the customer experience?', 'Symptom, timestamp, affected user', 'Ticket/customer report', 'Ticket list took 10 seconds', 'Scopes impact'],
    [2, 'Can the issue be reproduced?', 'Same route/data/user?', 'curl/browser', 'Only customer1 affected', 'Rules in/out global issue'],
    [3, 'What is the total request latency?', 'End-to-end timing', 'Browser/curl/APM', '8 seconds total', 'Does not equal query time'],
    [4, 'Did NGINX forward the request?', 'Access log upstream info', 'NGINX logs', 'upstream_status=200 upstream_time=7.8', 'Proxy reached Flask'],
    [5, 'Did Flask wait before the DB call?', 'App timing before SQL', 'Flask logs/APM', 'Slow before DB', 'Rules in app logic'],
    [6, 'Did Flask wait for a pooled connection?', 'Connection acquisition time', 'Pool metrics', 'waited 4 seconds for connection', 'Rules in pool pressure'],
    [7, 'What exact SQL ran?', 'Query text/shape', 'Logs/APM/pg_stat_statements', 'SELECT tickets by created_by', 'Targets investigation'],
    [8, 'What was the query duration?', 'SQL timing', 'DB logs/APM', 'Query took 3.2 seconds', 'Rules in DB execution'],
    [9, 'Was the query blocked?', 'Wait event/locks', 'pg_stat_activity/pg_locks', 'waiting on transactionid', 'Rules in lock contention'],
    [10, 'What were CPU, memory, and I/O doing?', 'Resource metrics', 'DB dashboard', 'CPU low, disk latency high', 'Rules in wait vs compute'],
    [11, 'What does EXPLAIN show?', 'Plan and scan type', 'EXPLAIN', 'Seq Scan with sort', 'Rules in plan issue'],
    [12, 'What is the table size?', 'Rows and relation size', 'SQL/DB stats', '20 rows vs 20M rows', 'Explains scan severity'],
    [13, 'How often does the query run?', 'Frequency/rate', 'APM/pg_stat_statements', 'Runs thousands/minute', 'Prioritizes fix'],
    [14, 'Is an index appropriate?', 'Filter/sort/selectivity', 'Plan + workload', 'Index matches created_by + created_at', 'Rules in index candidate'],
    [15, 'Did the fix improve measured latency?', 'Before/after timing', 'APM/query timing', '3.2s -> 80ms', 'Validates mitigation']
  ];
  let row = writeTable(sheet, 4, 1, ['Step', 'Question', 'Evidence', 'Tool/Source', 'Example Finding', 'What It Rules In/Out'], rows);
  row = writeSection(sheet, row, 'Evidence Sources', [
    'Browser DevTools, NGINX access/error logs, Flask logs, request ID, APM trace, PostgreSQL logs, slow-query log, pg_stat_activity, pg_stat_statements, EXPLAIN, EXPLAIN ANALYZE, database dashboard'
  ]);
  finishSheet(sheet, [70, 270, 270, 250, 260, 280]);
}

function buildIndexingExplain(sheet) {
  resetSheet(sheet, 'Indexing & EXPLAIN');
  setTitle(sheet, 'Indexing & EXPLAIN', 'Indexes help when they match a real query pattern and measured problem.');
  let row = writeSection(sheet, 4, 'SQL Examples', [
    'SELECT * FROM tickets WHERE created_by = 27 ORDER BY created_at DESC;',
    'EXPLAIN SELECT * FROM tickets WHERE created_by = 27 ORDER BY created_at DESC;',
    'CREATE INDEX idx_tickets_created_by_created_at ON tickets (created_by, created_at DESC);'
  ]);
  row = writeSection(sheet, row, 'Plain-English Rules', [
    'EXPLAIN shows the planned execution method.',
    'EXPLAIN ANALYZE executes and measures the query.',
    'Sequential Scan does not automatically mean a problem.',
    'A small table may be faster to scan.',
    'An index is more likely to help when the table is large, the query runs frequently, and the filter is selective.',
    'Indexes speed reads but add storage and make inserts, updates, and deletes more expensive.'
  ]);
  const conceptRows = [
    ['Index', 'Database lookup structure', 'Textbook index', 'Frequent selective reads', 'Storage/write cost', 'Plan uses index or timing improves'],
    ['B-tree index', 'Default ordered index type', 'created_at order', 'Equality/range/sort patterns', 'Maintenance', 'Index Scan'],
    ['Composite index', 'Index on multiple columns', '(created_by, created_at)', 'Filter plus sort', 'Column order matters', 'Plan matches query'],
    ['Index Scan', 'Uses index to find rows', 'Find one user tickets', 'Selective query', 'May be slower if many rows match', 'EXPLAIN'],
    ['Sequential Scan', 'Reads table broadly', 'Small table scan', 'Small table or most rows match', 'Bad if huge/frequent', 'EXPLAIN rows/cost'],
    ['Bitmap Index Scan', 'Uses index to gather row locations first', 'Many matching rows', 'Medium selectivity', 'Extra step', 'EXPLAIN'],
    ['Selectivity', 'How narrow the filter is', 'one user vs all users', 'High selectivity', 'Low selectivity may not help', 'Row estimates'],
    ['Query plan', 'Chosen execution path', 'Scan + sort', 'Before changing SQL/index', 'Estimates can be wrong', 'EXPLAIN'],
    ['Estimated rows', 'Planner prediction', 'rows=10', 'Planning quality', 'Not actual unless ANALYZE', 'Compare actual rows'],
    ['Actual rows', 'Rows actually processed', 'actual rows=10', 'Runtime validation', 'Requires execution', 'EXPLAIN ANALYZE'],
    ['Estimated cost', 'Relative planner cost', 'cost=0.1..20', 'Compare plan options', 'Not milliseconds', 'EXPLAIN'],
    ['Sort operation', 'Rows ordered after scan', 'ORDER BY created_at', 'May need matching index', 'Memory/temp file cost', 'Plan sort node'],
    ['Table scan', 'Broad table read', 'Seq Scan tickets', 'Small tables or broad reads', 'Large scan latency', 'Rows examined'],
    ['Write overhead', 'Indexes updated on writes', 'INSERT updates indexes', 'Read/write tradeoff', 'Slower writes', 'Write timing'],
    ['Index storage', 'Index uses disk', 'Extra relation size', 'Read performance tradeoff', 'Storage cost', 'pg_relation_size'],
    ['Index maintenance', 'DB maintains index changes', 'UPDATE index key', 'Consistent lookups', 'Write/load cost', 'DB metrics']
  ];
  row = writeTable(sheet, row, 1, ['Concept', 'Meaning', 'Example', 'When Useful', 'Trade-Off', 'Evidence', 'Study Status', 'My Notes'], addStudyStatusRows(conceptRows));
  const decisionRows = [
    ['Table has 20 rows', 'Usually no', 'Scan is cheap'],
    ['Table has 20 million rows', 'Possibly', 'Scan can be expensive'],
    ['Query runs once per month', 'Usually low priority', 'Limited benefit'],
    ['Query runs thousands of times', 'More likely', 'Repeated cost matters'],
    ['Column is never filtered or sorted', 'Usually no', 'Index may never be used'],
    ['Most rows match the condition', 'Maybe not', 'Scan may still be cheaper'],
    ['Write-heavy table with many indexes', 'Be careful', 'Writes and maintenance become slower']
  ];
  writeTable(sheet, row, 1, ['Condition', 'Index Likely Helpful?', 'Why'], decisionRows);
  finishSheet(sheet, [230, 270, 260, 260, 250, 250, 140, 300]);
}

function buildMemoryIoThroughput(sheet) {
  resetSheet(sheet, 'Memory, I/O & Throughput');
  setTitle(sheet, 'Memory, I/O & Throughput', 'Separate compute, memory, storage, and work rate.');
  let row = writeSection(sheet, 4, 'Memory', [
    'PostgreSQL shared buffers, per-query working memory, operating-system page cache, swap, temporary files, sort/hash spill to disk, OOM risk, and Redis memory as a separate process.'
  ]);
  const memoryRows = [
    ['PostgreSQL memory', 'Query execution and database caching'],
    ['OS page cache', 'Caches frequently accessed disk blocks'],
    ['Redis memory', 'Stores temporary application data'],
    ['Container memory limit', 'Caps process memory in a container']
  ];
  row = writeTable(sheet, row, 1, ['Memory Layer', 'Purpose'], memoryRows);
  row = writeSection(sheet, row, 'I/O', ['Disk reads, disk writes, IOPS, throughput, I/O latency, queue depth, checkpoints, and temporary-file writes.']);
  row = writeSection(sheet, row, 'Throughput', [
    'Latency = time one operation takes.',
    'Throughput = amount of work completed over time.',
    'Examples: requests per second, queries per second, transactions per second, rows per second, bytes per second.'
  ]);
  const rows = [
    ['Low CPU, high I/O latency', 'Database waits on storage instead of CPU', 'Disk latency, wait events', 'Reduce I/O, tune query, improve storage'],
    ['High read IOPS after cache failure', 'Redis miss/failure increases DB reads', 'Cache hit rate, DB read metrics', 'Restore cache, protect DB'],
    ['High write throughput during bulk inserts', 'Many writes/WAL/disk pressure', 'Rows written, WAL, disk latency', 'Throttle/schedule/tune writes'],
    ['Query spilling to disk', 'Sort/hash exceeds memory', 'Temp files, EXPLAIN ANALYZE', 'Tune query/index/work_mem carefully'],
    ['Disk nearly full', 'Writes/backups/temp files at risk', 'Storage capacity alert', 'Expand storage, clean retention'],
    ['Memory pressure and swap', 'RAM insufficient or too many processes', 'Swap/OOM metrics', 'Reduce concurrency/memory usage'],
    ['Redis eviction', 'Redis deletes keys under memory pressure', 'Eviction metric, memory policy', 'Right-size Redis/change TTL/policy']
  ];
  writeTable(sheet, row, 1, ['Troubleshooting Situation', 'Meaning', 'Evidence', 'Possible Response', 'Study Status', 'My Notes'], addStudyStatusRows(rows));
  finishSheet(sheet, [280, 340, 300, 320, 140, 300]);
}

function buildRedisVsPostgres(sheet) {
  resetSheet(sheet, 'Redis vs PostgreSQL');
  setTitle(sheet, 'Redis vs PostgreSQL', 'PostgreSQL owns durable truth; Redis owns temporary speed/state.');
  const rows = [
    ['Users', 'Yes', 'No', 'User records are durable business data'],
    ['Password hashes', 'Yes', 'No', 'Credential material must survive cache loss'],
    ['Tickets', 'Yes', 'No', 'Support issues are durable records'],
    ['Ticket messages', 'Yes', 'No', 'Conversation history must persist'],
    ['Audit events', 'Yes', 'No', 'Evidence must be durable and queryable'],
    ['Sessions', 'Maybe', 'Yes', 'Redis can store temporary session state; DB can store durable sessions if designed that way'],
    ['Cache', 'No', 'Yes', 'Cache is a temporary copy of data owned elsewhere'],
    ['Rate limiting', 'No', 'Yes', 'Counters are fast temporary coordination state'],
    ['Queue jobs', 'No', 'Yes', 'Jobs can be temporary processing state; durable job history may go to DB'],
    ['Temporary tokens', 'Maybe', 'Yes', 'Short-lived tokens can expire naturally'],
    ['Durable business records', 'Yes', 'No', 'They must survive restart, expiry, and cache loss'],
    ['Search results cache', 'No', 'Yes', 'Results can be recomputed from durable data'],
    ['Unread counters', 'Maybe', 'Yes', 'Redis can make counters fast; DB may hold durable source']
  ];
  let row = writeTable(sheet, 4, 1, ['Responsibility', 'PostgreSQL', 'Redis', 'Why'], rows);
  const failureRows = [
    ['Redis cache unavailable', 'Slower requests', 'More PostgreSQL reads'],
    ['Redis session unavailable', 'Login/session failures', 'PostgreSQL may still be healthy'],
    ['Redis queue unavailable', 'Async work delayed', 'Ticket creation may still succeed'],
    ['PostgreSQL unavailable', 'Ticket operations fail', 'Durable records cannot be read/written']
  ];
  writeTable(sheet, row, 1, ['Failure', 'Customer Impact', 'Database Impact'], failureRows);
  finishSheet(sheet, [260, 140, 140, 520]);
}

function buildDatabaseResilience(sheet) {
  resetSheet(sheet, 'Database Resilience');
  setTitle(sheet, 'Database Resilience', 'Availability, recovery, and durability are related but not interchangeable.');
  let row = writeSection(sheet, 4, 'Emphasis', [
    'Replicas do not replace backups.',
    'Backups protect against corruption and deletion.',
    'Failover restores availability.',
    'Read replicas may return stale data.',
    'Managed RDS/Aurora still requires monitoring, query tuning, connection management, and restore testing.'
  ]);
  const rows = [
    ['Backup', 'Recover data later', 'Deletion, corruption, bad release', 'Live availability', 'Backup success, age, restore point'],
    ['Restore test', 'Prove backup works', 'False confidence in backups', 'Backup schedule', 'Restore duration and data validation'],
    ['WAL', 'Record changes for recovery', 'Crash/replay/PITR support', 'Query tuning', 'WAL generation, archive status'],
    ['Point-in-time recovery', 'Restore near a chosen time', 'Accidental bad write', 'Zero data loss without RPO', 'Recovery target, restore proof'],
    ['Retention', 'How long backups kept', 'Late-discovered data loss', 'Restore testing', 'Retention policy'],
    ['Primary database', 'Handles writes', 'Normal write path', 'All failures', 'Primary health, write latency'],
    ['Standby', 'Ready replacement copy', 'Primary instance failure', 'Backups', 'Standby sync/health'],
    ['Read replica', 'Read capacity or stale-tolerant reads', 'Read load, some availability scenarios', 'Write scaling or backup', 'Replica lag/health'],
    ['Synchronous replication', 'Stronger durability before commit returns', 'Some primary failures', 'Low latency', 'Commit latency, sync state'],
    ['Asynchronous replication', 'Lower write latency standby/copy', 'Read scale, standby availability', 'Zero lag', 'Replication lag'],
    ['Replication lag', 'Delay between primary and replica', 'Stale reads/failover risk visibility', 'Root cause by itself', 'Lag seconds/bytes'],
    ['Multi-AZ', 'Survive zone/instance failure', 'AZ or instance failure', 'Every outage', 'Failover event, instance health'],
    ['Automatic failover', 'Promote/repoint to healthy DB', 'Primary failure', 'No user impact', 'Failover time, app errors'],
    ['Application retry', 'Recover transient DB errors', 'Short connection interruption', 'Safe design by itself', 'Retry count/error category'],
    ['Connection recovery', 'Reconnect after dropped DB sessions', 'Failover/network reset', 'Data correctness', 'Connection errors followed by recovery'],
    ['RPO', 'Acceptable data-loss window', 'Recovery planning', 'Recovery time', 'Documented target vs backup/replication'],
    ['RTO', 'Acceptable recovery time', 'Outage planning', 'Data loss amount', 'Measured restore/failover duration'],
    ['Sharding concept', 'Split data across databases', 'Extreme scale bottlenecks', 'Simple HA/backups', 'Shard key/design review'],
    ['Partitioning concept', 'Split large table inside DB', 'Large-table management/query patterns', 'Bad query design', 'Partition pruning/query plan']
  ];
  writeTable(sheet, row, 1, ['Concept', 'Purpose', 'Failure It Protects Against', 'What It Does Not Replace', 'Metric/Evidence', 'Study Status', 'My Notes'], addStudyStatusRows(rows));
  finishSheet(sheet, [220, 260, 300, 280, 280, 140, 300]);
}

function buildKubernetesComparison(sheet) {
  resetSheet(sheet, 'Kubernetes Comparison');
  setTitle(sheet, 'Kubernetes Comparison', 'The same symptom can mean different things in app, database, or Kubernetes layers.');
  const rows = [
    ['Application unavailable', 'Flask down, dependency unavailable, bad config', 'Pods not ready, Service no endpoints, bad Ingress', 'App logs vs kubectl status/events', 'HTTP status + Pod readiness'],
    ['Request timeout', 'Slow code, DB wait, Redis wait', 'Pod overloaded, network policy, readiness routing issue', 'Flask/DB timing vs pod/resource metrics', 'Request ID timing'],
    ['503', 'Dependency unavailable or app safe failure', 'Readiness failed or no backend endpoints', 'App error category vs Service endpoints', 'Response body and EndpointSlice'],
    ['High latency', 'Slow query, pool wait, Redis miss', 'CPU throttling, node pressure, HPA lag', 'DB/APM timing vs pod/node metrics', 'Latency breakdown'],
    ['High CPU', 'Expensive app or DB queries', 'Pod CPU limit/throttling or node pressure', 'DB CPU metric vs container CPU', 'Which process is hot'],
    ['High memory', 'DB cache/query memory, app leak, Redis memory', 'Container limit/OOM risk', 'DB memory vs container working set', 'OOM/events and DB metrics'],
    ['Restarting service', 'App crash or bad startup config', 'CrashLoopBackOff/OOMKilled', 'Stack trace vs Kubernetes events', 'Container logs and describe pod'],
    ['No backend available', 'App not listening or unhealthy', 'Service selector mismatch/no ready pods', 'NGINX upstream vs EndpointSlice', 'Service endpoints'],
    ['Configuration missing', 'Bad env variable or connection string', 'ConfigMap/Secret missing or wrong mount', 'App startup error vs K8s event', 'Deployment env and logs'],
    ['Secret missing', 'DB credentials unavailable', 'Secret not mounted/referenced', 'Auth error vs Kubernetes secret event', 'Pod events and app logs'],
    ['Storage unavailable', 'PostgreSQL disk/PVC unavailable', 'PVC unbound, volume attach failed', 'DB startup logs vs PVC/PV status', 'PVC/PV and events'],
    ['Dependency unreachable', 'Wrong DB/Redis host, firewall', 'NetworkPolicy/DNS/Service issue', 'Direct connection error vs cluster service discovery', 'Host/port and Service DNS']
  ];
  let row = writeTable(sheet, 4, 1, ['Similar Customer Symptom', 'Application/Database Interpretation', 'Kubernetes Interpretation', 'Evidence Difference', 'First Check'], rows);
  row = writeSection(sheet, row, 'Examples', [
    'Database connection refused: check hostname, port, credentials, firewall, and DB status.',
    'Kubernetes Service unavailable: check Service selector, EndpointSlice, readiness, and Pod status.',
    'PostgreSQL memory pressure: check cache, query work memory, swap, and temp files.',
    'Container memory pressure: check memory limit, OOMKilled, working set, and application behavior.'
  ]);
  finishSheet(sheet, [260, 340, 340, 320, 260]);
}

function buildIncidentFramework(sheet) {
  resetSheet(sheet, 'Incident Framework');
  setTitle(sheet, 'Incident Framework', 'Reusable structure for troubleshooting and communication.');
  let row = writeSection(sheet, 4, 'Framework', ['Scope -> Evidence -> Hypothesis -> Validation -> Mitigation -> Root cause -> Prevention']);
  const rows = [
    ['Detect', 'What signal or report started this?', 'Alert/customer report/ticket', 'Acknowledge and start timeline'],
    ['Scope', 'Who is affected and how badly?', 'Users, routes, regions, error rate', 'State known impact and uncertainty'],
    ['Reproduce', 'Can we trigger or observe it?', 'curl/browser/test account', 'Share reproduction status'],
    ['Identify affected layer', 'Where does evidence point first?', 'Status, logs, metrics, traces', 'Name current suspected layer'],
    ['Gather evidence', 'What logs/metrics/events prove this?', 'Request IDs, logs, dashboards', 'Avoid speculation'],
    ['Form hypotheses', 'What explanations fit evidence?', 'Hypothesis list', 'Rank likely causes'],
    ['Validate', 'What test confirms/refutes each hypothesis?', 'Queries, config checks, comparisons', 'Report what was ruled out'],
    ['Mitigate', 'How do we reduce customer impact now?', 'Rollback, scale, disable feature, restore dependency', 'Communicate mitigation and risk'],
    ['Restore service', 'Is customer impact resolved?', 'Error rate/latency back to baseline', 'Confirm recovery'],
    ['Root cause', 'What actually caused it?', 'Evidence-backed timeline', 'State cause plainly'],
    ['Prevention', 'What stops recurrence?', 'Tests, alerts, limits, runbook, design change', 'Own follow-up actions'],
    ['Customer communication', 'What should customers know?', 'Impact, resolution, next steps', 'Clear non-blaming update'],
    ['Engineering follow-up', 'What needs engineering work?', 'Bug/ticket, code/config ownership', 'Route to owner with evidence'],
    ['RCA', 'What happened and what changes?', 'Timeline, impact, root cause, actions', 'Publish concise post-incident record']
  ];
  writeTable(sheet, row, 1, ['Stage', 'Questions', 'Evidence', 'Communication'], rows);
  finishSheet(sheet, [220, 360, 360, 360]);
}

function buildScenarioPractice(sheet) {
  resetSheet(sheet, 'Scenario Practice');
  setTitle(sheet, 'Scenario Practice', 'Practice evidence-driven answers instead of one-cause guesses.');
  const scenarios = [
    ['Ticket list is slow', 'My tickets page takes forever.', 'Who is affected? Which route? Since when?', 'Browser, NGINX, Flask, Redis, pool, PostgreSQL', 'Request ID, upstream time, Flask timing, cache hit/miss, SQL timing, EXPLAIN', 'Cache miss, slow query, pool wait, lock, I/O', 'I would break the 10 seconds into proxy, app, pool, and SQL timing before deciding whether it is a query/index issue.'],
    ['Ticket save hangs', 'Submit spins and never finishes.', 'Did it create a ticket? Any request ID?', 'Flask, pool, PostgreSQL, locks', 'Flask log, pg_stat_activity, locks, transaction status', 'Pool wait, row lock, slow commit', 'I would verify whether Flask reached the DB, then inspect connection wait, active transaction, and lock evidence.'],
    ['Customer receives 503', 'The app says service unavailable.', 'What endpoint? Everyone or one user?', 'NGINX, Flask, Redis, PostgreSQL, Kubernetes', 'Response body/category, logs, readiness, dependency status', 'DB unavailable, readiness fail, dependency outage', 'I would use the request ID and response category to identify whether this was safe dependency failure or routing/readiness.'],
    ['Customer receives 502', 'Bad gateway.', 'Is Flask listening? Did NGINX reach upstream?', 'NGINX, Flask, Kubernetes', 'NGINX error log, upstream status, process/pod status', 'Bad upstream port, app down, no endpoint', 'A 502 usually means proxy could not get a valid upstream response, so I check upstream config and Flask/pod health.'],
    ['Everyone times out', 'All users are timing out.', 'Did traffic spike? Which layers saturated?', 'Proxy, Flask, Redis, pool, PostgreSQL, Kubernetes', 'Error rate, latency, saturation, pool wait, DB metrics', 'Pool exhaustion, DB down, cluster issue', 'I would scope broadly, then look for the earliest shared bottleneck across request IDs and metrics.'],
    ['One user cannot log in', 'Only this user cannot log in.', 'Credential issue or user row/session?', 'Browser, Flask, Redis, PostgreSQL', 'Auth logs, user row, session/cookie, status', 'Bad password, disabled user, stale session', 'I would compare affected/unaffected users and verify auth path evidence rather than assuming global outage.'],
    ['Redis goes down', 'Requests became slower after cache errors.', 'What Redis responsibility failed?', 'Redis, Flask, PostgreSQL', 'Redis ping/logs, cache hit rate, DB read rate', 'Cache fallback increased DB reads', 'I would confirm Redis failure and whether PostgreSQL absorbed extra load or sessions failed closed.'],
    ['DB CPU spikes', 'Database CPU is high.', 'Which queries changed? Traffic spike?', 'PostgreSQL, Flask, Redis', 'CPU metric, top queries, query frequency, cache hit rate', 'Expensive scans, joins, cache failure', 'I would identify exact queries and compare plans/frequency before adding indexes.'],
    ['DB CPU low but requests slow', 'Latency high but DB CPU is low.', 'Are we waiting on something?', 'Pool, PostgreSQL, network, disk, locks', 'Wait events, pool wait, disk latency, locks', 'Pool wait, lock, I/O, network', 'Low CPU suggests waiting may dominate, so I would inspect waits and disk before CPU scaling.'],
    ['Pool exhausted', 'DB-backed endpoints timeout under load.', 'How many active/waiting connections?', 'Connection pool, PostgreSQL', 'Pool utilization, acquisition time, DB connection count', 'Long queries holding connections', 'I would distinguish app pool exhaustion from DB max_connections and find what holds connections too long.'],
    ['Lock blocking update', 'Only one ticket update hangs.', 'Same ticket? Any long transaction?', 'PostgreSQL', 'pg_stat_activity, pg_locks, transaction age', 'Row lock held by another transaction', 'I would identify waiting and blocking sessions and resolve the long transaction safely.'],
    ['Failed transaction', 'Ticket create failed halfway.', 'Are partial rows present?', 'Flask, PostgreSQL', 'Transaction log, table rows, error', 'Constraint error caused rollback', 'I would verify all related rows committed together or none remained.'],
    ['Ticket missing', 'My ticket disappeared.', 'Was it committed? Which DB/read path?', 'Flask, PostgreSQL, replica, Redis/browser cache', 'Primary SQL query, request_id, replica lag, cache state', 'Rollback, stale replica/cache, wrong DB', 'I would query primary source of truth and compare request event evidence.'],
    ['Replica shows stale data', 'Admin sees old ticket state.', 'Is the read from replica?', 'Replica/HA, PostgreSQL', 'Replica lag, primary vs replica query', 'Replication lag', 'I would compare primary and replica and decide whether this read path tolerates lag.'],
    ['Failover causes connection errors', 'App errors during DB failover.', 'Did connections drop? Did app reconnect?', 'PostgreSQL HA, app DB connection handling', 'DB failover event, connection errors, recovery time', 'Dropped old primary connections', 'I would expect temporary connection failures and verify reconnect behavior against RTO.'],
    ['Disk I/O latency increases', 'Queries slow but CPU is normal.', 'Are waits storage-related?', 'PostgreSQL storage', 'Disk latency, wait events, temp files', 'Storage saturation, spill to disk', 'I would inspect I/O metrics and query plans for large reads/sorts.'],
    ['Container OOMKilled', 'Service keeps restarting.', 'Was memory limit exceeded?', 'Container, Flask, Redis/PostgreSQL if containerized', 'Pod events, exit code, memory working set', 'Memory leak or limit too low', 'I would confirm OOMKilled and separate container memory from PostgreSQL memory behavior.'],
    ['Pod Running but not Ready', 'Deployment looks running but no traffic.', 'What does readiness say?', 'Kubernetes Pod/Service', 'Readiness probe, pod events, endpoints', 'Readiness failure/dependency check', 'Running only means process exists; Ready determines traffic eligibility.'],
    ['Service has no endpoints', 'Ingress returns no backend.', 'Do selectors match ready pods?', 'Kubernetes Service, EndpointSlice', 'Service selector, pod labels, EndpointSlice', 'Selector mismatch or not-ready pods', 'I would inspect EndpointSlice and labels before blaming the app.'],
    ['Bad deployment needs rollback', 'Errors started after release.', 'What changed? Is rollback safe?', 'Deployment, app, database', 'Deployment history, error start time, migrations', 'Bad image/config/migration', 'I would mitigate customer impact with rollback only after checking migration/data safety.']
  ];
  writeTable(sheet, 4, 1, ['Scenario', 'What the Customer Says', 'First Questions', 'Layers to Consider', 'Evidence to Gather', 'Likely Hypotheses', 'Strong Interview Answer', 'My Answer', 'Study Status'], scenarios.map(r => r.concat(['', 'Not Started'])));
  finishSheet(sheet, [220, 250, 280, 260, 340, 300, 430, 350, 140]);
}

function buildInterviewQuestions(sheet) {
  resetSheet(sheet, 'Interview Questions');
  setTitle(sheet, 'Interview Questions', 'Practice concise answers with evidence and operational judgment.');
  const rows = [
    ['What is PostgreSQL?', 'Relational, durable, SQL, transactions', 'PostgreSQL is a relational database used for durable structured data. It enforces schema, relationships, constraints, and transactions so business records survive restarts and failures.', 'What does it own in this app?'],
    ['Why PostgreSQL for support tickets?', 'Durable records, relationships, queries', 'Tickets need reliable storage, relationships to users/messages/events, and transactional writes. PostgreSQL fits that better than a temporary cache.', 'What would Redis own instead?'],
    ['Why RDS or Aurora?', 'Managed ops, backups, HA, monitoring', 'Managed services reduce operational burden for provisioning, patching, backups, storage, replicas, and failover, but teams still own schema, query tuning, monitoring, and restore tests.', 'What does managed not solve?'],
    ['What is durable data?', 'Survives restart/cache loss', 'Durable data remains available after process restarts and cache expiry. Support tickets and audit events are durable business records.', 'How do you prove durability?'],
    ['What is normalization?', 'Reduce duplication, relationships', 'Normalization organizes related data into separate tables linked by keys so updates stay consistent.', 'When might denormalization help?'],
    ['What are primary and foreign keys?', 'Unique row ID and relationship', 'A primary key uniquely identifies a row; a foreign key points to another table primary key to represent relationships.', 'Example from tickets?'],
    ['What is a constraint?', 'Database-enforced rule', 'A constraint prevents invalid data, like null titles or duplicate emails, even if application code has a bug.', 'Why DB-level?'],
    ['What is an index?', 'Lookup structure', 'An index helps PostgreSQL find rows without scanning everything, like a textbook index pointing to where data lives.', 'Why not index everything?'],
    ['Why not index every column?', 'Write/storage cost', 'Indexes speed some reads but consume storage and slow writes because PostgreSQL must maintain each index.', 'How decide?'],
    ['What does EXPLAIN show?', 'Execution plan', 'EXPLAIN shows the planned path, such as scan type, estimated rows, and cost. EXPLAIN ANALYZE runs and measures it.', 'When use ANALYZE?'],
    ['What is a Sequential Scan?', 'Reads table broadly', 'A Seq Scan reads through table rows. It can be fine for small tables or broad filters, but risky for large frequent selective queries.', 'Is Seq Scan always bad?'],
    ['What is a connection?', 'App-DB channel', 'A database connection is an active session between the app and PostgreSQL used to authenticate and execute SQL.', 'What costs does it have?'],
    ['What is a connection pool?', 'Reusable connections', 'A pool keeps reusable DB connections so the app can borrow one, run SQL, and return it while limiting concurrency.', 'What metrics matter?'],
    ['What happens when the pool is exhausted?', 'Requests wait/timeout', 'Requests wait for a free connection. If the wait exceeds the timeout, users may see timeouts or safe 5xx errors even if PostgreSQL is up.', 'How prove it?'],
    ['What causes locks?', 'Concurrent transactions', 'Locks protect data during reads/writes. Long transactions or conflicting updates can make other queries wait.', 'How inspect?'],
    ['What is a transaction?', 'All-or-nothing work', 'A transaction groups related changes so they commit together or roll back together, preventing partial writes.', 'Ticket example?'],
    ['How do you investigate a slow query?', 'Trace, measure, plan, validate', 'Start with request ID and total latency, confirm DB timing, inspect locks/connections, run EXPLAIN, check table size/frequency, then choose evidence-based fix.', 'What first evidence?'],
    ['Why can CPU be low while latency is high?', 'Waiting', 'The system may be waiting on locks, pool slots, disk I/O, network, or long transactions rather than actively using CPU.', 'Which metrics show waits?'],
    ['What metrics prove database pressure?', 'Latency, locks, connections, I/O, CPU, errors', 'No single metric proves it. Combine query timing, connection wait, lock waits, CPU, memory, disk latency, errors, and request impact.', 'What rules out app?'],
    ['What is replication lag?', 'Replica delay', 'Replication lag is the delay between primary commits and replica visibility. It can cause stale reads.', 'How prove stale?'],
    ['Backup vs replica vs failover?', 'Recovery vs read/standby vs availability', 'Backups restore data after loss. Replicas help reads or standby availability. Failover moves service to a healthy instance.', 'Do replicas replace backups?'],
    ['What are RPO and RTO?', 'Data loss and recovery time', 'RPO is acceptable data loss window; RTO is acceptable recovery time window.', 'How test them?'],
    ['How prove PostgreSQL caused customer impact?', 'Trace + DB evidence + rule-outs', 'Show the request reached Flask, Flask waited on DB path, DB evidence shows query/lock/connection/storage issue, and other layers were ruled out.', 'What evidence from NGINX?'],
    ['How do Redis failures affect PostgreSQL?', 'Fallback and load', 'If Redis cache fails, app may fall back to PostgreSQL, increasing reads. If Redis sessions fail, login/session behavior may fail while PostgreSQL remains healthy.', 'What does Redis not own?'],
    ['How do database symptoms differ from Kubernetes symptoms?', 'DB evidence vs orchestration evidence', 'DB symptoms show in SQL timing, connections, locks, I/O, or replica lag. Kubernetes symptoms show in readiness, endpoints, pod events, restarts, and resource limits.', 'Same symptom example?']
  ];
  writeTable(sheet, 4, 1, ['Question', 'Key Points', 'Strong Answer', 'Follow-Up Questions', 'My Answer', 'Study Status'], rows.map(r => r.concat(['', 'Not Started'])));
  finishSheet(sheet, [280, 260, 520, 280, 420, 140]);
}

function buildQuiz(sheet) {
  resetSheet(sheet, 'Quiz');
  setTitle(sheet, 'Quiz', 'Answer here first; use the Answer Key only after trying.');
  const questions = quizQuestions();
  writeTable(sheet, 4, 1, ['Question ID', 'Category', 'Difficulty', 'Question', 'My Answer', 'Correct?', 'Review Notes'], questions.map(q => [q[0], q[1], q[2], q[3], '', '', '']));
  finishSheet(sheet, [110, 170, 150, 520, 380, 130, 320]);
}

function buildAnswerKey(sheet) {
  resetSheet(sheet, 'Answer Key');
  setTitle(sheet, 'Answer Key', 'Plain-English answers focused on evidence.');
  const rows = quizQuestions().map(q => [q[0], q[4], q[5], q[6]]);
  writeTable(sheet, 4, 1, ['Question ID', 'Correct Answer', 'Why', 'Common Mistake'], rows);
  finishSheet(sheet, [110, 440, 440, 360]);
}

function quizQuestions() {
  return [
    ['Q01', 'Layers', 'Beginner', 'Which layer owns durable support-ticket records?', 'PostgreSQL.', 'Tickets must survive app restarts, Redis expiry, and cache loss.', 'Saying Redis because it is fast.'],
    ['Q02', 'Layers', 'Beginner', 'What does NGINX prove when it logs upstream_status=502?', 'NGINX could not get a valid response from the upstream.', 'It points to proxy/upstream boundary, not automatically PostgreSQL.', 'Blaming the database first.'],
    ['Q03', 'Latency', 'Beginner', 'Does an eight-second request prove an eight-second SQL query?', 'No.', 'Total latency includes browser, proxy, app, pool, Redis, DB, and network time.', 'Equating request latency with query latency.'],
    ['Q04', 'PostgreSQL', 'Beginner', 'What is a transaction?', 'An all-or-nothing unit of database work.', 'It prevents partial writes when related operations must succeed together.', 'Thinking each INSERT is unrelated.'],
    ['Q05', 'Redis', 'Beginner', 'What should Redis own in this project?', 'Temporary cache/session-style state, not durable tickets.', 'Redis can speed or support requests, while PostgreSQL owns durable truth.', 'Storing business records only in Redis.'],
    ['Q06', 'Connections', 'Beginner', 'What is a database connection?', 'An active session/channel between app and PostgreSQL.', 'The app uses it to authenticate and execute SQL.', 'Calling it the same as a query.'],
    ['Q07', 'Pooling', 'Beginner', 'What is a connection pool?', 'A reusable set of DB connections.', 'It reduces setup cost and limits concurrent DB access.', 'Thinking a pool makes the database infinitely scalable.'],
    ['Q08', 'Pooling', 'Interview', 'What symptom suggests pool exhaustion?', 'Requests wait before SQL starts and may timeout.', 'The bottleneck is acquiring a connection, not necessarily executing SQL.', 'Only checking DB CPU.'],
    ['Q09', 'Transactions', 'Beginner', 'What does rollback do?', 'Undoes uncommitted work.', 'It prevents failed multi-step writes from leaving partial data.', 'Thinking rollback deletes committed data automatically.'],
    ['Q10', 'Locks', 'Intermediate', 'Why can one ticket update hang while others work?', 'A row lock may be held on that ticket.', 'Lock contention can be specific to one row.', 'Assuming full database outage.'],
    ['Q11', 'Locks', 'Interview', 'What evidence shows blocking?', 'pg_stat_activity and lock views showing waiting and blocking sessions.', 'This identifies who waits and who holds the lock.', 'Looking only at HTTP status.'],
    ['Q12', 'Indexing', 'Beginner', 'What is an index?', 'A database lookup structure.', 'It helps PostgreSQL find rows faster for matching query patterns.', 'Calling it a cache.'],
    ['Q13', 'Indexing', 'Intermediate', 'Why not index every column?', 'Indexes cost storage and slow writes/maintenance.', 'Every insert/update/delete may need index updates.', 'Assuming indexes are free.'],
    ['Q14', 'EXPLAIN', 'Beginner', 'What does EXPLAIN show?', 'The planned execution path.', 'It shows scans, joins, estimates, and cost before deciding a fix.', 'Treating cost as dollars or milliseconds.'],
    ['Q15', 'EXPLAIN', 'Intermediate', 'Is Sequential Scan always bad?', 'No.', 'Small tables or broad filters may be cheaper to scan.', 'Adding indexes reflexively.'],
    ['Q16', 'Metrics', 'Interview', 'What should you check when CPU is low but DB latency is high?', 'Locks, pool waits, disk I/O, network, and long transactions.', 'Low CPU often means waiting rather than compute saturation.', 'Scaling CPU first.'],
    ['Q17', 'Memory', 'Beginner', 'Is high PostgreSQL memory usage automatically bad?', 'No.', 'PostgreSQL and the OS use memory for caching.', 'Treating cache usage as failure.'],
    ['Q18', 'I/O', 'Intermediate', 'What does high disk latency suggest?', 'Database may be waiting on storage.', 'Queries can be slow even with low CPU.', 'Only checking query syntax.'],
    ['Q19', 'Throughput', 'Beginner', 'Latency vs throughput?', 'Latency is time for one operation; throughput is work completed over time.', 'They answer different performance questions.', 'Using them interchangeably.'],
    ['Q20', 'HA', 'Beginner', 'Do replicas replace backups?', 'No.', 'Replicas can copy corruption/deletion; backups restore earlier states.', 'Relying on replica only.'],
    ['Q21', 'HA', 'Intermediate', 'What is replication lag?', 'Delay before replica reflects primary changes.', 'It explains stale reads from replicas.', 'Assuming replicas are always current.'],
    ['Q22', 'HA', 'Beginner', 'What is RPO?', 'Acceptable data-loss window.', 'It defines how much data loss the business can tolerate.', 'Confusing it with recovery time.'],
    ['Q23', 'HA', 'Beginner', 'What is RTO?', 'Acceptable recovery-time window.', 'It defines how long service can be down/degraded.', 'Confusing it with data loss.'],
    ['Q24', 'Incident response', 'Interview', 'How do you prove PostgreSQL caused customer impact?', 'Connect request evidence to DB timing/locks/connections/I/O and rule out earlier layers.', 'Proof needs correlation, not one metric.', 'Saying “DB was slow” without evidence.'],
    ['Q25', 'Kubernetes comparison', 'Intermediate', 'What does Service has no endpoints usually point to?', 'Selector mismatch or no ready pods.', 'Kubernetes routing cannot find eligible backends.', 'Debugging SQL first.'],
    ['Q26', 'Kubernetes comparison', 'Intermediate', 'Pod Running but not Ready means what?', 'The process may exist but should not receive traffic.', 'Readiness gates traffic.', 'Equating Running with healthy.'],
    ['Q27', 'Layers', 'Interview', 'Where do you start with a customer symptom?', 'Scope, reproduce, and trace the request by evidence.', 'It prevents premature root-cause guessing.', 'Jumping to the favorite layer.'],
    ['Q28', 'PostgreSQL', 'Intermediate', 'Why use constraints?', 'Database-enforced validity rules.', 'They protect data even if app code has a bug.', 'Only validating in the UI.'],
    ['Q29', 'PostgreSQL', 'Beginner', 'What is a foreign key?', 'A reference to another table primary key.', 'It models relationships like ticket.created_by -> users.id.', 'Copying user details everywhere.'],
    ['Q30', 'Redis', 'Interview', 'How can Redis failure increase DB load?', 'Cache misses/fallback cause more PostgreSQL reads.', 'Redis removed a protective temporary layer.', 'Assuming Redis and DB fail together.'],
    ['Q31', 'Connections', 'Intermediate', 'Connection refused means what?', 'The app could not establish a DB connection.', 'Host, port, firewall, or DB process may be wrong/down.', 'Calling it slow query.'],
    ['Q32', 'Pooling', 'Intermediate', 'What is acquisition time?', 'Time waiting to get a DB connection.', 'It separates pool wait from query execution.', 'Ignoring time before SQL starts.'],
    ['Q33', 'Locks', 'Beginner', 'Why do locks exist?', 'To protect consistency during concurrent changes.', 'They prevent conflicting writes from corrupting data.', 'Treating locks as always bad.'],
    ['Q34', 'Indexing', 'Interview', 'When is an index likely helpful?', 'Large/frequent/selective query with plan evidence.', 'Benefit depends on query shape and workload.', 'Indexing columns without measuring.'],
    ['Q35', 'EXPLAIN', 'Interview', 'Why use EXPLAIN ANALYZE carefully?', 'It executes the query.', 'On unsafe or heavy queries, it can affect real systems.', 'Running it blindly in production.'],
    ['Q36', 'Metrics', 'Beginner', 'Does high CPU identify the slow query?', 'No.', 'CPU shows pressure, not the exact query.', 'Stopping at CPU graph.'],
    ['Q37', 'Memory', 'Intermediate', 'What are temp files evidence of?', 'Queries spilling work to disk.', 'Sort/hash operations may exceed memory.', 'Assuming only storage capacity issue.'],
    ['Q38', 'I/O', 'Interview', 'Why can I/O pressure cause app timeouts?', 'DB waits on storage, increasing query/transaction time.', 'The app waits for DB response.', 'Only checking app logs.'],
    ['Q39', 'HA', 'Interview', 'What happens to active connections during failover?', 'They may drop and need reconnect handling.', 'Failover moves service but existing sessions can break.', 'Assuming failover is invisible.'],
    ['Q40', 'Incident response', 'Interview', 'What makes a strong mitigation?', 'It reduces customer impact while preserving evidence and data safety.', 'Mitigation is not the same as root cause fix.', 'Making risky changes without evidence.']
  ];
}

function buildStudyTracker(sheet) {
  resetSheet(sheet, 'Study Tracker');
  setTitle(sheet, 'Study Tracker', 'Track weak areas and next review actions.');
  const rows = [
    ['Layered troubleshooting', 'High', '2', '', '', 'Partial', 'Almost', 'Need faster layer ownership recall', 'Review Request Path and Symptom Matrix'],
    ['Latency', 'High', '2', '', '', 'Partial', 'Almost', 'Separate total vs component latency', 'Practice Latency by Layer'],
    ['PostgreSQL ownership', 'High', '3', '', '', 'Partial', 'Almost', 'Durable vs temporary ownership', 'Review Redis vs PostgreSQL'],
    ['Redis ownership', 'Medium', '3', '', '', 'Partial', 'Almost', 'Cache/session vs DB truth', 'Explain failure comparison'],
    ['Connections', 'High', '2', '', '', 'Partial', 'No', 'Connection refused vs slow query', 'Review Connections & Pooling'],
    ['Pooling', 'High', '2', '', '', 'Partial', 'No', 'Pool exhaustion evidence', 'Practice acquisition-time answer'],
    ['Transactions', 'High', '3', '', '', 'Partial', 'Almost', 'Commit vs rollback evidence', 'Review transaction examples'],
    ['Locks', 'High', '2', '', '', 'Partial', 'No', 'Blocking vs slow query', 'Practice lock scenario'],
    ['Query plans', 'High', '2', '', '', 'Partial', 'No', 'EXPLAIN interpretation', 'Review plan terms'],
    ['Indexes', 'High', '3', '', '', 'Partial', 'Almost', 'When index helps', 'Practice decision table'],
    ['CPU', 'Medium', '3', '', '', 'Partial', 'Almost', 'Metric does not identify query alone', 'Review PostgreSQL Metrics'],
    ['Memory', 'Medium', '2', '', '', 'Partial', 'No', 'Cache vs pressure', 'Review Memory section'],
    ['I/O', 'High', '2', '', '', 'Partial', 'No', 'Low CPU high latency', 'Review I/O scenarios'],
    ['Throughput', 'Medium', '3', '', '', 'Partial', 'Almost', 'Throughput vs latency', 'Practice definitions'],
    ['Backups', 'High', '2', '', '', 'Partial', 'No', 'Restore testing and retention', 'Review Database Resilience'],
    ['Replicas', 'High', '2', '', '', 'Partial', 'No', 'Lag and stale reads', 'Practice replica scenario'],
    ['Failover', 'High', '2', '', '', 'Partial', 'No', 'Active connection impact', 'Review failover questions'],
    ['RPO/RTO', 'High', '2', '', '', 'Partial', 'No', 'Data loss vs recovery time', 'Practice examples'],
    ['Kubernetes comparison', 'Medium', '2', '', '', 'Partial', 'No', 'Service endpoints vs app errors', 'Review comparison tab'],
    ['RCA communication', 'Medium', '3', '', '', 'Partial', 'Almost', 'Evidence-first language', 'Use Incident Framework']
  ];
  writeTable(sheet, 4, 1, ['Topic', 'Priority', 'Confidence', 'Last Reviewed', 'Next Review', 'Hands-On Complete?', 'Can Explain Without Notes?', 'Weak Area', 'Next Action'], rows);
  applyTrackerConditionalFormatting(sheet);
  finishSheet(sheet, [240, 120, 120, 150, 150, 170, 210, 320, 320]);
}

function applyTrackerConditionalFormatting(sheet) {
  const range = sheet.getRange(5, 3, Math.max(1, sheet.getLastRow() - 4), 1);
  const rules = [
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('1').setBackground(COLORS.red).setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('2').setBackground(COLORS.red).setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('3').setBackground(COLORS.yellow).setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('4').setBackground(COLORS.green).setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('5').setBackground(COLORS.green).setRanges([range]).build()
  ];

  const highLowRange = sheet.getRange(5, 1, Math.max(1, sheet.getLastRow() - 4), 9);
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($B5="High",OR($C5="1",$C5="2"))')
      .setBackground('#fca5a5')
      .setRanges([highLowRange])
      .build()
  );

  sheet.setConditionalFormatRules(rules);
}
