const ICAL_URL = 'https://www.airbnb.co.in/calendar/ical/1522245296750708243.ics?t=b5332c9a477e4a388b0aa4fbd428da1d';

export default async function handler(req, res) {
  try {
    const response = await fetch(ICAL_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!response.ok) throw new Error(`Airbnb returned ${response.status}`);
    const text = await response.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(text);
  } catch (err) {
    res.status(502).json({ error: 'Could not fetch calendar', detail: err.message });
  }
}
