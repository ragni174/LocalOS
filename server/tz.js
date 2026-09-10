import { parse } from 'date-fns';
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';

const d = fromZonedTime(parse('2026-09-11 11:00 AM', 'yyyy-MM-dd hh:mm a', new Date()), 'Asia/Kolkata');
console.log(d.toISOString());
console.log(formatInTimeZone(d, 'Asia/Kolkata', 'hh:mm a'));
